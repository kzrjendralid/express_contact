const { json } = require('express');
const fs = require('fs');

//membuat folder jka belum ada
const dirPath = './data';
if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath);
}

//membuat file jika belum ada
const filePath = './data/contacts.json';
if(!fs.existsSync(filePath)){
    fs.writeFileSync(filePath, '[]', 'utf-8');
}

//fungsi load data
const loadData = () => {
    const allContact = fs.readFileSync('./data/contacts.json');
    let json = JSON.parse(allContact);
    return json;
}

//fungsi cari kontak
const detailContact = nama => {
    const contacts = loadData();
    const contact = contacts.find(x => x.nama.toLowerCase() === nama.toLowerCase());
    return contact;
} 

// fungsi menimpa file contact.json
const saveContact = (contact) => {
  fs.writeFileSync('./data/contacts.json' , JSON.stringify(contact));
}

//fungsi menambah kontak baru
const addContact = contact => {
    const contacts = loadData();
    contacts.push(contact);
    saveContact(contacts);
}

//cek duplikat kontak
const cekDuplikat = nama => {
    const contacts = loadData();
    return contacts.find(contact => contact.nama.toLowerCase() === nama.toLowerCase());
}

//hapus kontak berdasarkan nama
const deleteContact = nama => {
    const contacts = loadData();
    const filter = contacts.filter(contact => contact.nama.toLowerCase() !== nama.toLowerCase());
    saveContact(filter); 
}

const updateContact = req => {
    const contacts = loadData();
    const filter = contacts.filter(contact => contact.nama.toLowerCase() !== req.oldName.toLowerCase());
    delete req.oldName;
    filter.push(req);
    saveContact(filter);
}


module.exports = {loadData, detailContact, addContact, cekDuplikat, deleteContact, updateContact};