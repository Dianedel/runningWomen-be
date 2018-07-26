require('dotenv').config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user-model.js");

mongoose.Promise = Promise;

mongoose
    .connect(process.env.MONGODB_URI, {useMongoClient: true})
    .then(() => {
        console.log('Connected to MongoDB for users!')
    }).catch(err => {
        console.log('Error connecting to mongoDB for users', err)
    });

// input users data
const inputUsers = [ {
    firstName: "Anne",
    lastName: "Haliz",
    email: "anne@haliz.fr",
    birthday: "1987-04-15",
    location: "Paris",
    speed: 4.30,
    availability: "Week-end",
    description: "Coureuse régulière",
    imageUrl: "",
    role: "user",
    encryptedPassword: bcrypt.hashSync("1234", 10)
}, {
    firstName: "Sandra",
    lastName: "Nicouette",
    email: "sandra@nicouette.com",
    birthday: "1985-08-22",
    location: "Paris",
    speed: 3.80,
    availability: "Week-end",
    description: "Coureuse expérimentée, marathons",
    imageUrl: "",
    role: "user",
    encryptedPassword: bcrypt.hashSync("1234", 10)
},]

User.create(inputUsers)
.then((userResults) => {
    console.log(`Created ${userResults.length} users in the DB`)
})
.catch((err) => {
    console.log(`Create users FAIL`, err)
});