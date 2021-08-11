const express = require('express');
const app = express('');
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');

const mongoose = require('mongoose');

const orgProfile = require('./models/orgprofiles');
const Profile = require('./models/profiles')
const Position = require('./models/positions')


const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        res.redirect('/home')
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
const categories2 = ['Culinary', 'Engineering', 'Computers', 'Law', 'Business', 'Literature', 'Music', 'Finance', 'Cosmetics'];

app.get('/home', async(req, res) => {
    if(!req.session.user_id){
        res.render('home.ejs')
    }
    else{
        const user = await orgProfile.findById(req.session.user_id);
        if(user){
            res.render('orgHome.ejs', {user})
        }
        else{
            const user = await Profile.findById(req.session.user_id);
            if(user){
                res.render('loggedInHome.ejs', {user})
            }
            else{
                res.redirect('/login')
            }
        }
    }
})

app.get('/match', requireLogin, async(req, res) => {
    matches_interest = [];
    const id = req.session.user_id;
    const foundUser = await Profile.findById(req.session.user_id);
    if(!foundUser){
        res.redirect("/home")
    }
    else{
        const positions = await Position.find({})
        for(let position of positions) { 
            for(let position_interest of position.interests) { 
                for(let interest of foundUser.interests) { 
                    if(position_interest == interest){
                        matches_interest.push(position);
                    }
                }
            }
        }
        count = 0;
        arr = [];
        var dict = {}
        loop1:
        for(let position of matches_interest) { 
            loop2:
            for(let dict of arr) { 
                if(dict.positionID == position.id){
                    continue loop1;
                }
            }
            var dict = {
                positionName: "",
                positionID: "",
                matching_interests: [],
                index: 0,
            };
            for(let interest of foundUser.interests) { 
                for(let hobby of position.interests) { 
                    if(hobby == interest){
                        dict.matching_interests.push(interest);
                        count ++;
                    }
                }
            }
            dict.position = position;
            dict.positionID = position.id;
            dict.index = count;
            arr.push(dict);
            count = 0;
        }
        arr.sort(function(a, b) {
            return b.index - a.index;
        }); 
        foundUser.matches = arr;
        await foundUser.save();
        res.render('match.ejs', {foundUser, arr})
    }
}) 

app.get('/yourPositions', requireLogin, async(req, res) => {
    const yourPositions = [];
    const id = req.session.user_id;
    const positions = await Position.find({})
    for(let position of positions) { 
        if(position.user_id == req.session.user_id){
            yourPositions.push(position);
        }
    }
    res.render('yourPositions.ejs', {yourPositions, id})
}) 

app.get('/yourPosition/:id', requireLogin, async(req, res) => {
    const {id} = req.params;
    const foundPosition = await Position.findById(id);
    const foundUser = await orgProfile.findById(req.session.user_id);
    if(foundPosition.user_id == req.session.user_id){
        res.render('showYourPosition.ejs', {foundPosition, foundUser})
    }
    else{
        res.redirect('/home');
    }
})  

app.get('/orgRegister', async(req, res) => {
    if(!req.session.user_id){
        res.render('orgRegister', {categories2})
    }
    else{
        res.redirect('/home')
    }
})

app.get('/register', async(req, res) => {
    if(!req.session.user_id){
        res.render('register', {categories2})
    }
    else{
        res.redirect('/home')
    }
})

app.post('/orgRegister', async (req, res) => {
    const {password, username, orgName, townLocation, zipCode, taxID, interestTag1, phoneNum} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const notValidUser = await orgProfile.findOne({username});
    console.log(username);
    if(notValidUser){
        res.send('Username is already taken')
    }
    else{
        const {Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics} = req.body;
        const myInterests = [];
        const interests = [Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics];
        for(let interest of interests) { 
            if(interest){
                myInterests.push(interest);
            }
        }
        console.log(myInterests);
        const organization = new orgProfile({
            username, 
            password: hash,
            orgName,
            townLocation,
            zipCode,
            taxID,
            interests: myInterests,
            phoneNum
        })
        await organization.save();
        console.log(organization);
        req.session.user_id = organization._id;
        res.redirect('/orgProfilePage')
    }
})

// app.get('/secret', requireLogin, (req, res) => {
//     res.render('secret.ejs')
// })

app.get('/orgProfilePage', requireLogin, async(req, res) => {
    const foundUser = await orgProfile.findById(req.session.user_id);
    if(!foundUser){
        res.redirect('/home')
    }
    else{
        res.render('orgProfilePage.ejs', {foundUser, categories1, categories2})
    }
})  

app.get('/profilePage', requireLogin, async(req, res) => {
    const foundUser = await Profile.findById(req.session.user_id);
    if(!foundUser){
        res.redirect('/home')
    }
    else{
        res.render('profilePage.ejs', {foundUser, categories1, categories2})
    }
})  

app.get('/login', (req, res) => {
    if(!req.session.user_id){
        res.render('login')
    }
    else{
        res.redirect('/home')
    }
})

app.get('/orgLogin', (req, res) => {
    if(!req.session.user_id){
        res.render('orgLogin')
    }
    else{
        res.redirect('/home')
    }
})

app.post('/login', async (req, res) => {
    const {username, password, id} = req.body;
    const user = await Profile.findOne({username});
    if(!user){
        res.redirect('/login')
    }
    else{
        console.log(user.password);
        const validPassword = await bcrypt.compare(password, user.password);
        if(validPassword){
            req.session.user_id = user._id;
            res.redirect('/profilePage');
        }
        else{
            res.redirect('/login');
        }
    }
})

app.post('/orgLogin', async (req, res) => {
    const {username, password, id} = req.body;
    const user = await orgProfile.findOne({username});
    console.log(user);
    if(!user){
        res.send('wrong username')
    }
    else{
        console.log(user.password);
        const validPassword = await bcrypt.compare(password, user.password);
        if(validPassword){
            req.session.user_id = user._id;
            res.redirect('/orgProfilePage');
        }
        else{
            res.send('wrong password');
        }
    }
})


app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/home');
})

app.get('/profiles', async (req, res) => { 
    const users = await orgProfile.find({})
    res.render('index.ejs', {users})
})


app.post('/register', async (req, res) => {
    const {password, username, name, location, zipCode} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const notValidUser = await Profile.findOne({username});
    console.log(username);
    if(notValidUser){
        res.send('Username is already taken')
    }
    else{
        const {Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics} = req.body;
        const myInterests = [];
        const interests = [Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics];
        for(let interest of interests) { 
            if(interest){
                myInterests.push(interest);
            }
        }
        console.log(myInterests);
        const Student = new Profile({
            username, 
            password: hash,
            name,
            location,
            zipCode,
            interests: myInterests
        })
        await Student.save();
        console.log(Student);
        req.session.user_id = Student._id;
        res.redirect('/profilePage')
    }
})

// app.post('/profiles', async (req, res) => {
//     const newProfile = new Profile(req.body);
//     await newProfile.save();
//     console.log(newProfile);
//     res.redirect(`/profiles/${newProfile.id}`)
// })

app.get('/profiles/:id', async(req, res) => {
    const {id} = req.params;
    const foundUser = await orgProfile.findById(id);
    console.log(foundUser);
    res.render('show.ejs', {foundUser});
})  

app.get('/edit', requireLogin, async(req, res) => {
    const foundUser = await Profile.findById(req.session.user_id);
    res.render('edit.ejs', {foundUser, categories1, categories2});
})  

app.get('/orgEdit', requireLogin, async(req, res) => {
    const foundUser = await orgProfile.findById(req.session.user_id);
    res.render('orgEdit.ejs', {foundUser, categories1, categories2});
})  

app.put('/profiles', async(req, res) => {
    const editProfile = await Profile.findByIdAndUpdate(req.session.user_id, req.body, {runValidators: true, new: true});
    console.log(req.body);
    res.redirect('/profilePage');
})

app.put('/orgProfiles', async(req, res) => {
    const {Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics} = req.body;
    const myInterests = [];
    const hobbies = [Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics];
    for(let hobby of hobbies) { 
        if(hobby){
            myInterests.push(hobby);
        }
    }
    const editProfile = await orgProfile.findByIdAndUpdate(req.session.user_id, req.body, {runValidators: true, new: true});
    editProfile.interests = myInterests;
    await editProfile.save();
    res.redirect('/orgProfilePage');
})


app.delete('/profilePage/:id', async(req, res) => {
    const {id} = req.params;
    const deletedProfile = await Profile.findByIdAndDelete(id);
    req.session.destroy();
    res.redirect('/home')
})

app.delete('/orgProfilePage/:id', async(req, res) => {
    const {id} = req.params;
    console.log(id);
    const deletedProfile = await orgProfile.findByIdAndDelete(id);
    req.session.destroy();
    res.redirect('/home')
})

app.get('/orgProfiles', async (req, res) => { 
    const profiles = await orgProfile.find({})
    res.render('index.ejs', {profiles})
})

app.get('/positions', async (req, res) => {
    const positions = await Position.find({})
    console.log(positions);
    res.render('listPositions.ejs', {positions})
})

app.get('/addPosition', requireLogin, async(req, res) => {
    const foundUser = await orgProfile.findById(req.session.user_id);
    res.render('addPosition.ejs', {foundUser, categories1, categories2});
})  
// app.post('/orgProfiles', async (req, res) => {
//     const newProfile = new orgProfile(req.body);
//     await newProfile.save();
//     console.log(newProfile);
//     res.redirect(`/orgprofiles/${newProfile.id}`)
// })

app.post('/positions', async (req, res) => {
    const {positionName, username, positionLocation, positionZipCode, location, interestTag2, user_id} = req.body;
    const user = await orgProfile.findOne({username});
    if(!user){
        res.redirect('/addPosition')
    }
    else{
        if(user.id != req.session.user_id){
            res.redirect('/addPosition')
        }
        else{
            const {Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics} = req.body;
            const myInterests = [];
            const interests = [Culinary, Engineering, Computers, Law, Business, Literature, Music, Finance, Cosmetics];
            for(let interest of interests) { 
                if(interest){
                    myInterests.push(interest);
                } 
            }
            const newPosition = new Position({
                positionName,
                orgName: user.orgName, 
                positionLocation,
                positionZipCode,
                location,
                interests: myInterests,
                user_id: req.session.user_id,
            })
            await newPosition.save();
            console.log(newPosition);
            res.redirect(`/position/${user.id}/${newPosition.id}`)
        }
    }
})

app.get('/orgProfiles/:id', async(req, res) => {
    const {id} = req.params;
    const foundProfile = await orgProfile.findById(id);
    console.log(foundProfile);
    res.render('orgShow.ejs', {foundProfile})
})  

app.get('/position/:user_id/:id', async(req, res) => {
    const {user_id, id} = req.params;
    const foundPosition = await Position.findById(id);
    const foundUser = await orgProfile.findById(user_id);
    console.log(foundPosition);
    console.log(foundUser);
    if(!req.session.user_id){
        res.render('showPosition.ejs', {foundPosition, foundUser})
    } 
    else{
        const foundStudent = await Profile.findById(req.session.user_id);
        if(!foundStudent){
            res.render('showPosition.ejs', {foundPosition, foundUser})
        }
        else{
            var percent = 0;
            for(let job of foundStudent.matches) { 
                matching_interests = [];
                if(job.positionID == foundPosition.id){
                    for(let position_interest of foundPosition.interests){
                        for(let interest of foundStudent.interests){
                            if(position_interest == interest){
                                matching_interests.push(interest);
                                percent = Math.round(matching_interests.length/foundStudent.interests.length*100.0);
                            }
                        }
                    }
                }
            }  
            res.render('showMatchPosition.ejs', {foundPosition, foundUser, foundStudent, percent}) 
        }
    }
})    

app.delete('/positions/:id', async(req, res) => {
    const {id} = req.params;
    const position = await Position.findById(id);
    console.log(position.user_id);
    console.log(req.session.user_id);
    if(position.user_id == req.session.user_id){
        await Position.findById(id);
        const deletedProfile = await Position.findByIdAndDelete(id);
        res.redirect('/yourPositions')
    }
    else{
        res.redirect('/home')
    }
})

app.listen(3000, () =>{
    console.log("LISTENING ON PORT 3000")
})