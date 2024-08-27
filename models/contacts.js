const Contact = require('./mongoData')
const mongoose = require('mongoose')

const listContacts = async  () => {
  try {
    const contacts = await Contact.find();
    console.log(contacts);
    return contacts
  } catch (error) {
    console.error('Error fetching contacts:', error);
  }
}

const getContactById = async (contactId) => {
  try{
    const findContact = await Contact.findById(contactId);
    return findContact;
  } catch (err){
    console.log(err)
  }
}

const removeContact = async (contactId) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(contactId);
    if (!deletedContact) {
      console.log('Contact not found' );
    }
    return deletedContact;
  } catch (error) {
    console.log(error);
  }
}

const addContact = async (newId) => {
  try {
    const newItem = new Contact(newId)
    return await newItem.save()
  } catch (error){
    console.log(error)
  }
};

const updateContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, { new: true });
 
    if (!updatedContact) {
      console.log('Contact not found' );
    }
    return updatedContact;
  } catch (error) {
    console.log(error);
  }
}

const updateStatusContact = async (contactId, body) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return null;
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId, 
      { favorite: body.favorite }, 
      { new: true } 
    );

    return updatedContact;
  } catch (err) {
    console.error('Error updating contact status:', err);
    return null;
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
}
