const express = require('express');
const app = express('');
const path = require('path');
const methodOverride = require('method-override');

const mongoose = require('mongoose');

const Profile = require('./models/profiles');

mongoose.connect('mongodb://localhost:27017/voluntier', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Mongo Database Connected");
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const categories1 = ['In-Person', 'Virtual'];
const categories2 = ['Culinary', 'Engineering', 'Computer Science', 'Law', 'Business', 'Literature', 'Music', 'Finance', 'Cosmetics'];


app.get('/profiles', async (req, res) => {
    const profiles = await Profile.find({})
    res.render('index.ejs', {profiles})
})


app.get('/profiles/new', (req, res) => {
    res.render('new.ejs', {categories1, categories2})
}) 

app.post('/profiles', async (req, res) => {
    const newProfile = new Profile(req.body);
    await newProfile.save();
    console.log(newProfile);
    res.redirect(`/profiles/${newProfile.id}`)
})

app.get('/profiles/:id', async(req, res) => {
    const {id} = req.params;
    const foundProfile = await Profile.findById(id);
    console.log(foundProfile);
    res.render('show.ejs', {foundProfile});

})  

app.get('/profiles/:id/edit', async(req, res) => {
    const {id} = req.params;
    const foundProfile = await Profile.findById(id);
    res.render('edit.ejs', {foundProfile, categories1, categories2});
})  

app.put('/profiles/:id', async(req, res) => {
    const {id} = req.params;
    const editProfile = await Profile.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
    console.log(req.body);
    res.redirect(`/profiles/${editProfile._id}`);
})

app.delete('/profiles/:id', async(req, res) => {
    const {id} = req.params;
    const deletedProfile = await Profile.findByIdAndDelete(id);
    res.redirect('/profiles')
})

app.listen(3000, () =>{
    console.log("LISTENING ON PORT 3000")
})
