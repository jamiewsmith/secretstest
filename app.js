//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// const bcrypt = require ("bcrypt");
// const saltRounds = 10;

// const md5 = require ("md5");
// const encrypt = require ("mongoose-encryption");

const app = express();

// console.log(md5("123456"));

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//telling app to use the session with some initial configurations
app.use(session({
secret: "Our little secret.",
resave: false,
saveUninitialized: false
}));

//tell app to use passport and initialise
app.use(passport.initialize());
//tell app to use passport for dealing with the sessions
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

//need to use a mongoose schema for the encryption
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//setting up passport local mongoose to hash and salt users
userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

//this is simplified code to start up passport local mongoose from npmjs passport-local-mongoose
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//with passport we now need to have a secrets route so that people can go there directly if they are in an authenticated session
app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

//this is setting up logout route
app.get("/logout", function (req,res){
  req.logout();
  res.redirect("/");
});

//This is where we are capturing the username from the register page
app.post("/register", function (req, res){

User.register({username: req.body.username}, req.body.password, function(err, user) {
if (err) {
  console.log(err);
  res.redirect("/register");
} else {
  passport.authenticate("local")(req, res, function(){
    res.redirect("/secrets");
  })
}

})

});

app.post("/login", function (req, res){

//create a new user
const user = new User({
username: req.body.username,
password: req.body.password
  });
//then use passport to login this user

req.login(user, function(err){
if (err) {
  console.log(err);
} else {
  passport.authenticate("local")(req, res, function(){
    res.redirect("/secrets");
});
}
});

});

//This is the old bcyrpt register under app.post register
// bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//
//   const newUser = new User({
//     email: req.body.username,
//     password: hash
//   });
//     newUser.save(function(err){
//   if(err) {
//     console.log(err);
//   } else {
//     res.render("secrets");
//   }
//   });
//
// });

//This is the old bcrypt login under app.post login
// const username = req.body.username;
// const password = req.body.password;
//
//   User.findOne({email: username}, function(err, foundUser){
//     if(err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//         bcrypt.compare(password, foundUser.password, function(err, result) {
//     if (result === true) {
//           res.render("secrets");
//         }
//           });
//       }
//     }
//   });

app.get("/", function(req, res){
res.render("home");
});

app.get("/login", function(req, res){
res.render("login");
});

app.get("/register", function(req, res){
res.render("register");
});

//Note there is no app.get for the secrets page as we only want people to be able to see that via registering
app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
