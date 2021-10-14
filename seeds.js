const mongoose = require('mongoose');

const Profile =  require('./models/profiles');
const orgProfile = require('./models/orgprofiles.js')

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


const orgprofiles = [
    {
        name: "Jordan Quinn",
        townLocation: "Montville",
        zipCode: 07045,
        virtual: false,
        inPerson: true,
        interestTag1: 'Music',
        interestTag2: 'Culinary',
        interestTag3: 'Journalism'
    },

    {
        name: "Khush Parikh",
        townLocation: "Montville",
        zipCode: 07045,
        virtual: true,
        inPerson: false,
        interestTag1: 'Culinary',
        interestTag2: 'Computer Science',
        interestTag3: 'Medicine'
    },

    {
        name: "Neil Agrawal",
        townLocation: "Pine Brook",
        zipCode: 07044,
        virtual: true,
        inPerson: false,
        interestTag1: 'Medicine',
        interestTag2: 'Engineering',
        interestTag3: 'Chess'
    },

    {
        name: "Muhammad Ibrahim",
        townLocation: "Towacco",
        zipCode: 07046,
        virtual: false,
        inPerson: true,
        interestTag1: 'Computer Science',
        interestTag2: 'History',
        interestTag3: 'Calculus'
    },
]

Profile.insertMany(profiles)
    .then(profiles => {
        console.log(profiles)
    })
    .catch(e => {
        console.log(e)
    })