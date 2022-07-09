const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');

require('./utils/db');

const {loadData, detailContact, addContact, cekDuplikat, deleteContact, updateContact} = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const contact = require('./model/contact');
const { findOne } = require('./model/contact');

const app = express();
const port = 3000;

//setting method override
app.use(methodOverride('_method'));

//gunakan view engine
app.set('view engine', 'ejs');

//third-party middleware
app.use(expressLayout);

//built-in middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'ade maulana',
            email: 'lubis@gmail.com'
        },
        {
            nama: 'galih prasetyo',
            email: 'galih@gmail.com'
        },
        {
            nama: 'ega pratama',
            email: 'ega@gmail.com'
        }
    ]
    res.render('index', {
        title: 'Halaman Utama', 
        mahasiswa,
        layout: 'layouts/main'
    });
})

app.get('/contact', async (req, res) => {
    // const contacts = loadData();

    const contacts = await contact.find();

    res.render('contact', {
        title: 'Halaman kontak',
        layout: 'layouts/main',
        contacts,
        msg: req.flash('msg'),
    });
})

app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Halaman Tambah Kontak',
        layout: 'layouts/main',
    });
})

// tambah kontak baru
app.post('/contact'
    , body('nama').custom(async (value) => {
        const duplikat = await contact.findOne({nama: value});
        if(duplikat){
            throw new Error('Nama telah digunakan!');
        }
        return true;
        })
    , check('email', 'Email tidak valid').isEmail()
    , check('nohp', 'Nomor Hp tidak valid').isMobilePhone('id-ID')
    , (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('add-contact', {
            title: 'Halaman Tambah Kontak',
            layout: 'layouts/main',
            errors: errors.array(),
        });
    } else {
        contact.insertMany(req.body).then((result)=> {
            //kirim flash message
        req.flash('msg', 'Kontak berhasil ditambahkan!');
        res.redirect('/contact');
        });
    }
})

//form ubah kontak
app.get('/contact/edit/:nama', async (req, res) => {
    const data = await contact.findOne({nama: req.params.nama});

    res.render('edit-contact', {
        title: 'Halaman Edit Kontak',
        layout: 'layouts/main',
        data,
    });
})

//proses ubah kontak 
app.put('/contact'
    , body('nama').custom(async (value, {req}) => {
        const duplikat = await contact.findOne({nama: req.body.nama});
        if(duplikat && value != req.body.oldName){
            throw new Error('Nama telah digunakan!');
        }
        return true;
        })
    , check('email', 'Email tidak valid').isEmail()
    , check('nohp', 'Nomor Hp tidak valid').isMobilePhone('id-ID')
    , (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('edit-contact', {
            title: 'Halaman Edit Kontak',
            layout: 'layouts/main',
            errors: errors.array(),
            data: req.body,
        });
    } else {
        contact.updateOne(
            {
                _id: req.body._id
            }, 
            {
                $set:{
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp
                }
            }).then(result => {
                //kirim flash message
        req.flash('msg', 'Kontak berhasil diedit!');
        res.redirect('/contact');
            });
    }
})

//hapus kontak
app.delete('/contact',async (req, res) => {
    const data = await contact.findOne({_id: req.body._id});
    if(!data){
        res.status(404);
        res.send('<h1>404 NOT FOUND</h1>');
    } else {
        contact.deleteOne({_id: data._id}).then(result => {
            //kirim flash message
        req.flash('msg', 'Kontak berhasil dihapus!');
        res.redirect('/contact');
        })  
    }
})

//detail kontak
app.get('/contact/:nama', async (req, res) => {
    const data = await contact.findOne({nama: req.params.nama})
    res.render('detail-contact', {
        title: 'Halaman Detail Kontak',
        layout: 'layouts/main',
        data,
    });
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'Halaman about',
        layout: 'layouts/main'
    });
})


app.use((req, res) => {
    res.status(404);
    res.send('404 Not Found');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})