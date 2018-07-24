require('dotenv').config();

const mongoose = require("mongoose");
const User = require("../models/user-model.js");
const Mailbox = require("../models/mailbox-model.js");

mongoose.Promise = Promise;

mongoose
    .connect(process.env.MONGODB_URI, {useMongoClient: true})
    .then(() => {
        console.log('Connected to MongoDB!')
    }).catch(err => {
        console.log('Error connecting to mongoDB', err)
    });

// input data mails
const inputMails = [ {
    sender: "anne@haliz.fr",
    receiver: "sandra@nicouette.com",
    content: "Un jour, au doux rêveur qui l'aime, \n En train de montrer ses trésors, \n Elle voulut lire un poème, \n Le poème de son beau corps. \n D'abord, superbe et triomphante \n Elle vint en grand apparat, \n Traînant avec des airs d'infante \n un flot de velours nacarat: \n Telle qu'au rebord de sa loge \n Elle brille aux Italiens, \n Ecoutant passer son éloge \n Dans les chants des musiciens."
}, {
    sender: "sandra@nicouette.com",
    receiver: "anne@haliz.fr",
    content: "Hâtez-vous lentement, et sans perdre courage, \n Vingt fois sur le métier remettez votre ouvrage, \n Polissez-le sans cesse, et le repolissez, \n Ajoutez quelquefois, et souvent effacez."
},]

inputMails.forEach((oneMail) => {
    User.findOne({ email: oneMail.sender })
    .then(userDoc => {
        oneMail.sender = userDoc._id;

        User.findOne({ email: oneMail.receiver })
        .then(userDoc => {
            oneMail.receiver = userDoc._id;
            Mailbox.create(oneMail)
            .then((mailboxResults) => {
                console.log(`Created ${mailboxResults.length} mailbox in the DB`)
            })
            .catch((err) => {
                console.log(`Create mailbox FAIL`, err)
            });
        })
    })
    .catch(err => { throw err });
});