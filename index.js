const express = require('express');
const app = express('');
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');

const mongoose = require('mongoose');

const Profile = require('./models/profiles');
const Position = require('./models/positions')
const User = require('./models/user')

const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        res.redirect('/login')
    }
    else{
        next();
    }
}

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
app.use(session({secret: 'notagoodsecret'}));

const categories1 = ['In-Person', 'Virtual'];
const categories2 = ['Culinary', 'Engineering', 'Computer Science', 'Law', 'Business', 'Literature', 'Music', 'Finance', 'Cosmetics'];

app.get('/', (req, res) => {
    res.send('THIS IS THE HOMEPAGE!')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const {password, username} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const notValidUser = await User.findOne({username});
    if(notValidUser){
        res.send('Username is already taken')
    }
    else{
        const user = new User({
            username, 
            password: hash
        })
        await user.save();
        console.log(user);
        req.session.user_id = user._id;
        res.redirect('/')
    }
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret.ejs')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username});
    if(!user){
        res.redirect('/login')
    }
    else{
        console.log(user.password);
        const validPassword = await bcrypt.compare(password, user.password);
        if(validPassword){
            req.session.user_id = user._id;
            res.redirect('/secret');
        }
        else{
            res.redirect('/login');
        }
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.get('/profiles', async (req, res) => { 
    const profiles = await Profile.find({})
    res.render('index.ejs', {profiles})
})

app.get('/positions', async (req, res) => {
    const positions = await Position.find({})
    res.render('listPositions.ejs', {positions})
})


app.get('/profiles/:id/addPosition', async(req, res) => {
    const {id} = req.params;
    const foundProfile = await Profile.findById(id);
    res.render('addPosition.ejs', {foundProfile, categories1, categories2});
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

app.post('/positions', async (req, res) => {
    const newPosition = new Position(req.body);
    await newPosition.save();
    console.log(newPosition);
    res.redirect(`position/${newPosition.id}`)
})

app.get('/profiles/:id', async(req, res) => {
    const {id} = req.params;
    const foundProfile = await Profile.findById(id);
    console.log(foundProfile);
    res.render('show.ejs', {foundProfile})
})  

app.get('/position/:id', async(req, res) => {
    const {id} = req.params;
    const foundPosition = await Position.findById(id);
    console.log(foundPosition);
    res.render('showPosition.ejs', {foundPosition})
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

app.delete('/positions/:id', async(req, res) => {
    const {id} = req.params;
    const deletedPosition = await Position.findByIdAndDelete(id);
    res.redirect('/positions')
})

app.listen(3000, () =>{
    console.log("LISTENING ON PORT 3000")
})