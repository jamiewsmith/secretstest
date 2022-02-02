//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require ("ejs");
const mongoose = require ("mongoose");
const bcrypt = require ("bcrypt");
const saltRounds = 10;

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

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

//need to use a mongoose schema for the encryption
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});



// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


const User = new mongoose.model("User", userSchema);

//This is where we are capturing the username from the register page
app.post("/register", function (req, res){

bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

  const newUser = new User({
    email: req.body.username,
    password: hash
  });
    newUser.save(function(err){
  if(err) {
    console.log(err);
  } else {
    res.render("secrets");
  }
  });

});

});

app.post("/login", function (req, res){
const username = req.body.username;
const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
    if (result === true) {
          res.render("secrets");
        }
          }); 
      }
    }
  });
});


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
