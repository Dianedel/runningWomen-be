const express = require('express');
const bcrypt  = require("bcrypt");
const User    = require("../models/user-model.js");
const Mailbox = require("../models/mailbox-model.js");
const nodemailer = require ("nodemailer");
const upload  = require('../configs/multer');

const router  = express.Router();

const transport =
  nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
      user: process.env.hotmail_email,
      pass: process.env.hotmail_password
    }
  });

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

// profil user
router.get("/profil/:id", (req, res, next) => {
  const { id } = req.params;

  User.findById(id)
  .then((userDoc) => {
    if (!userDoc) {
      next();
      return;
    }
    res.json(userDoc);
  })
  .catch((err) => {
    next(err);
  });
});

//POST files upload Photo
router.post('/', upload.single('file'), function(req, res) {
  const photo = new photo({
    name: req.body.name,
    // brand: req.body.brand,
    image: `/uploads/${req.file.filename}`,
    specs: JSON.parse(req.body.specs) || []
  });

  photo.save((err) => {
    if (err) {
      return res.send(err);
    }

    return res.json({
      message: 'Photo téléchargé',
      photo: photo
    });
  });
});

// { $or: [ {sender:ObjectId('5b55934a018c6d0164107088')}, {receiver:ObjectId('5b55934a018c6d0164107088')} ] }
router.get("/mailbox", (req, res, next) => {
  Mailbox
  .find({ $or: [ {sender: req.user._id}, {receiver: req.user._id} ] })
  .populate("sender", { encryptedPassword: 0 })
  .populate("receiver", { encryptedPassword: 0 })
  .sort({ createAt: -1 }) // le plus récent en premier
  .then((mailboxResults) => {
    res.json(mailboxResults);
  })
  .catch((err) => {
    next(err);
  });
});

router.get("/markers", (req, res, next) => {
  User
  .find({}, { firstName: 1, lastName: 1, location: 1, coordinates: 1 })
  .then((users) => {
    res.json(users);
  })
  .catch((err) => {
    next(err);
  });
});

// router.post("/mailbox", (req, res, next) => {
//   const { sender, receiver, content } = req.body;

//   Mailbox.create({ sender, receiver, content })
//   .then((mailboxDoc) => {
//     res.json(mailboxDoc);
//   })
//   .catch((err) => {
//     next(err);
//   })
// })

router.get("/mailbox/:id", (req, res, next) => {
  const { sender, receiver, content } = req.params;

  Mailbox.findById(id)
  .then((mailboxDoc) => {
    if(!mailboxDoc) {
      // show 404 no mail found
      next();
      return;
    }
    res.json(mailboxDoc);
  })
  .catch((err) => {
    next(err);
  });
});

router.post("/mailbox", (req, res, next) => {
  console.log(req.body)
 // const sender = req.user._id
  const {receiver, content } = req.body;
  Mailbox.create({sender:req.user._id, receiver, content })
.then((mailboxDoc) => {
  res.json(mailboxDoc);
})
.catch((err) => {
  next(err);
  });
});

router.delete("/mailbox/:id", (req, res, next) => {
  const { id } = req.params;

  Mailbox.findByIdAndRemove(id)
  .then((mailboxDoc) => {
    res.json(mailboxDoc);
  })
  .catch((err) => {
    next(err);
  });
});


// AUTH ROUTER
//POST /signup
router.post("/signup", (req, res, next) => {
  const { firstName, lastName, email, location, birthday, coordinates, originalPassword } = req.body;

  if (!originalPassword || originalPassword.match(/[0-9]/) === null) {
    const err = new Error("Le mot de passe doit contenir au moins un caractère et un chiffre");
    next(err);
    return;
  }

  const encryptedPassword = bcrypt.hashSync(originalPassword, 10);

  User.create({ firstName, lastName, email, location, birthday, coordinates, encryptedPassword})
  .then((userDoc) => {
    transport.sendMail({
      from: "Wonder Who Run <wonderwhorun@hotmail.com>",  // Gmail ignores this
      to: `${firstName} ${lastName} <${email}>`,
      subject: "🤩 Inscription Wonder Who Run!",
      text: `Bienvenue, ${firstName} ${lastName}! Merci pour votre inscription sur Wonder Who Run.`,
      html: `
        <h1 style="color: orange;">Bienvenue, ${firstName} ${lastName}!</h1>
        <p>Merci pour votre inscription sur Wonder Who Run.</p>
      `
    })
    // log the user immediately after signing up
    req.login(userDoc, () => {
      userDoc.encryptedPassword = undefined;
      res.json({ userDoc });
    });
  })
  .catch((err) => {
    next(err);
    })
});

// POST /login
router.post("/login", (req, res, next) => {
  const { email, loginPassword } = req.body;

  // check the email by searching in the database
  User.findOne({ email })
  .then((userDoc) => {
    if(!userDoc) {
      const err = new Error("Email not found");
      next(err);
      return;
    }

    // we are ready to check the password if we get this far
    const { encryptedPassword } = userDoc;
    if(!bcrypt.compareSync(loginPassword, encryptedPassword)) {
      const err = new Error("Erreur de mot de passe");
      next(err);
      return;
    }

    // we are ready to LOG THEM IN if we get this far
    req.logIn(userDoc, () => {
      // hide encryptedPassword before sending the JSON (security risk)
      userDoc.encryptedPassword = undefined;
      res.json({ userDoc });
    });
  })
  .catch((err) => {
    next(err);
  });
});

// DELETE /LOGOUT
router.delete("/logout", (req, res, next) => {
  req.logout();
  res.json({ userDoc: null });
});

// GET : checkLogin
router.get("/checklogin", (req, res, next) => {
  if (req.user){
   // hide encryptedPassword before sending the JSON (security risk)
   req.user.encryptedPassword = undefined;
  }
  res.json({ userDoc: req.user });
});

// add photo and update personal information
router.post("/photos", (req, res, next) => {
  const { id } = req.user._id;
  const { imageUrl } = req.body;
console.log(req.user._id)
  User.findByIdAndUpdate(
    id,
    { $set: { imageUrl } },
    { runValidators: true, new: true}
  )
  .then((userDoc) => {
    console.log(userDoc)
    res.json(userDoc);
  })
  .catch((err) => {
    next(err);
  });
});

router.post("/info", (req, res, next) => {
  console.log("je suis la")
  const id = req.user._id;
  // const {_id} = req.user;
  const { location, speed, availability, description } =req.body;
  User.findByIdAndUpdate(
    id,
    { $set: { location, speed, availability, description } },
    { runValidators: true, new: true }
  )
  .then((photoDoc) => {
    photoDoc.encryptedPassword = undefined;
    res.json(photoDoc);
  })
  .catch((err) => {
    next(err);
  });
});


module.exports = router;
