const express = require("express");
const app = express();
const PORT = 8080; 
const cookieSession = require('cookie-session');
const { restart } = require("nodemon");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id', 'key2']
}))


// Databases
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"
  }
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$tQZ88YkIjxnplobvic8Bpes5h.3ThuWt3U/lz8P7jehF74oBbyZAq",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$tQZ88YkIjxnplobvic8Bpes5h.3ThuWt3U/lz8P7jehF74oBbyZAq",
  },
};

// GET routes
app.get("/", (req, res) => {

  if (req.session.user_id) {
    return res.redirect(`/urls`);
  } else {
    return res.redirect(`/login`);
  }

});

app.get("/login", (req, res) => {
  const templateVars =  { "user_id": req.session.user_id, userDatabase}

  if (req.session.user_id) {
    return res.redirect(`/urls`);
  } else {
    return res.render("urls_login", templateVars);
  }

});

app.get("/register", (req, res) => {
  const templateVars =  { "user_id": req.session.user_id, userDatabase}

  if (req.session.user_id) {
    return res.redirect(`/urls`);
  } 
  return res.render("urls_register", templateVars);
});

app.get("/urls.json", (req, res) => { 
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId, urlDatabase);
  return res.json(userUrls);
});

app.get("/urls", (req, res) => { 
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId, urlDatabase);

  if (req.session.user_id) { 
    const templateVars = { "urls": userUrls, "user_id": req.session.user_id, userDatabase};
    return res.render("urls_index", templateVars);
  } else {
    return res.status(403).send("Please login to view your URLs");
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { "user_id": req.session.user_id, userDatabase};

  if (req.session.user_id) {
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect(`/login`);
  }

});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Error, URL does not exist.");
 }

  if (!req.session.user_id) { 
    return res.status(401).send("Error, please login to view URL.");
 }

  const userUrls = urlsForUser(req.session.user_id, urlDatabase);

  if (!userUrls[shortURL]) {
    return res.status(403).send("Error, you may only view your own URLs.");
  }

  const templateVars = { "shortURL": shortURL, "longURL": urlDatabase[shortURL].longURL, "user_id": req.session.user_id, userDatabase};

  return res.render("urls_show", templateVars);
});

// POST routes
// Register
app.post("/register", (req, res) => { 
  const email = req.body.email;
  const password = req.body.password;

if (email === "" || password === "") {
  return res.status(400).send("Error, must enter email and password"); 
}

  if (getUserByEmail(email, userDatabase)) {
    return res.status(400).send("Error, email already in use");
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = generateRandomString();

    userDatabase[userId] = {"id": userId, "email": email, "password": hashedPassword};
    
    req.session.user_id = userId;
    return res.redirect(`/urls/`);
}

});

// Add urls
app.post("/urls", (req, res) => {
  
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      "longURL": req.body.longURL,
      "userId": req.session.user_id
    };

    return res.redirect(`/urls/${shortURL}`);

  } else {
    return res.status(401).send("Error, you must be logged in to add URLs.")
  }

});

// Login/out
app.post("/login", (req, res) => {

  const enteredEmail = req.body.email

  if (!getUserByEmail(enteredEmail, userDatabase)) {
    return res.status(400).send("Error, invalid Email")
  }

  const enteredPassword = req.body.password
  const userId = getUserByEmail(enteredEmail, userDatabase);

  if (!bcrypt.compareSync(enteredPassword, userDatabase[userId].password)) {
    return res.status(400).send("Error, invalid Password")
  }

  req.session.user_id = userId;
  return res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// Edit/Delete
app.post("/urls/:id/delete", (req, res) => {
  
  if (!req.session.user_id) { 
    return res.status(401).send("Error, please login to view URLs");
  } 

  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Error, short ID does not exist");
  } 

  const userUrls = urlsForUser(req.session.user_id, urlDatabase);

  if (!userUrls[shortURL]) {
    return res.status(403).send("Error, you may only edit your own URLs");
  } 
  
  delete urlDatabase[shortURL];
  return res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  
  if (!req.session.user_id) { 
    return res.status(401).send("Error, please login to view URLs");
  } 

  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Error, short ID does not exist");
  } 

  const userUrls = urlsForUser(req.session.user_id, urlDatabase);

  if (!userUrls[shortURL]) {
    return res.status(403).send("Error, you may only edit your own URLs");
  } 

  urlDatabase[shortURL].longURL = req.body.longURL;
  return res.redirect(`/urls`);
});

// Route to longURL
app.get("/u/:id", (req, res) => {
  
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Error, short URL does not exist");
  } else {
    const urlId = req.params.id;
    const longURL = urlDatabase[urlId].longURL;
    return res.redirect(longURL);
  }

});

// Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
