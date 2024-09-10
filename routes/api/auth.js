const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/userSchema");
const Joi = require("joi");
require("dotenv").config();
const authMiddleware = require("../../middlewares/authMiddleware");

const upload = require("../../config/multer");
const path = require("path");
const fs = require("fs");
const jimp = require("jimp");

const avatarsDir = path.join(__dirname, "../../public/avatar");

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir);
}


const joiSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid('starter', 'pro', 'business').required(),
});

router.post("/users/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email in use",
        data: "Conflict",
      });
    }

    const newUser = new User({
      email,
      password,
      subscription: "starter",
    });

    await newUser.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,

        avatarURL: newUser.avatarURL,


      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || password !== user.password) {
      return res.status(401).json({
        message: "Email or password is wrong",
      });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,

        avatarURL: user.avatarURL,


      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/users/logout", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    
    user.token = null;
    await user.save();


    user.token = null;
    await user.save();


    res.status(204).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



router.get("/users/current", authMiddleware, async (req, res) => {
  try{
    const user = req.user;
    console.log(user)
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    });

  } catch (e) {
    console.log(e);

router.get("/users/current", authMiddleware, async (req, res) => {
  try{
    const user = req.user;
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (e) {
    consolelog(e);

    res.status(500).json({message: "Internal Server Error"})
  }
});

router.patch("/", authMiddleware, async (req, res, next) => {
  const { error, value } = joiSubscriptionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { subscription } = value;

  try {
    const user = await User.findById(req.user._id); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.subscription = subscription;
    await user.save();

    res.status(200).json({
      user: {
        email: user.email,
        subscription: user.subscription,

        avatarURL: user.avatarURL,

      },
    });
  } catch (err) {
    next(err);
  }
});


router.patch( "/avatars",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { path: tempPath, originalname } = req.file;
    const userId = req.user._id;

    try {
      const image = await jimp.read(tempPath);
      await image.resize(250, 250).writeAsync(tempPath);

      const fileName = `${userId}_${Date.now()}_${originalname}`;
      const targetPath = path.join(__dirname, "../../public/avatars", fileName);

      fs.rename(tempPath, targetPath, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Failed to save image" });
        }

        const avatarURL = `/avatars/${fileName}`;
        const user = await User.findByIdAndUpdate(
          userId,
          { avatarURL },
          { new: true }
        );

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ avatarURL });
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Internal Server Error" });
    }

});

module.exports = router;