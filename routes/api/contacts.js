const express = require('express')
const Joi = require('joi');
const router = express.Router()

const contactsSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required()
})

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require('../../models/contacts')

router.get('/', async (req, res, next) => {
  try {
    const data = await listContacts();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.get('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const data = await getContactById(contactId);
    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ error: "Not Found" });
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = contactsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newId = {
      id: `${new Date().getTime()}`,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };
    const data = await addContact(newId);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: "Bad Request" });
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const data = await removeContact(contactId);
    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ error: "Not Found" });
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = contactsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const contactId = req.params.contactId;
    const update = await updateContact(contactId, req.body);
    res.status(200).json(update);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
})

module.exports = router
