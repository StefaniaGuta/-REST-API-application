const fs = require('fs/promises')
const path = require("path");
const dataFile = path.join(__dirname, "contacts.json");


const listContacts = async () => {
  const data = await fs.readFile(dataFile, "utf-8");
  const dataParse = JSON.parse(data);
  return dataParse;
}

const getContactById = async (contactId) => {
  return listContacts()
.then(contacts => {
  const contact = contacts.find((contact) => contact.id === contactId);
  return contact;
})
.catch(error => {
  console.error('Error getting contact by ID:', error);
  throw error;
});}

const removeContact = async (contactId) => {
  return listContacts()
  .then(contacts => {
    const index = contacts.findIndex(contact => contact.id === contactId);
    if (index === -1) {
      return null;
    }
    const removedContact = contacts.splice(index, 1)[0];
    return fs.writeFile(dataFile, JSON.stringify(contacts, null, 2))
      .then(() => removedContact)
      .catch(error => {
        console.error('Error writing contacts:', error);
        throw error;
      });
  })
  .catch(error => {
    console.error('Error removing contact:', error);
    throw error;
  });
}

const addContact = async (newId) => {
  const data = await listContacts();
  data.push(newId);
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
  return newId;
};

const updateContact = async (contactId, body) => {
  const data = await listContacts();
  const selectedData = data.findIndex((el) => el.id === contactId);
  if (selectedData === -1) {
    throw new Error("Contact not found");
  } else {
    data[selectedData] = { id: contactId, ...body };
  }
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
  return data[selectedData];
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
