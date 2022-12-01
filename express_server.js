const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const { restart } = require("nodemon");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id', 'key2']
}))

// Functions
function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function lookUpUser(userEmail) {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return user;
    }

  }

  return false
}

function urlsForUser(userId) {
  let obj = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === userId) {
      obj[url] = urlDatabase[url];
    }

  }

  return obj;
}

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

const users = {
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const templateVars =  { user_id: req.session.user_id, users}

  if (req.session.user_id) {
    return res.redirect(`/urls`);
  } else {
    return res.render("urls_login", templateVars);
  }
  
});

app.get("/register", (req, res) => {
  const templateVars =  { user_id: req.session.user_id, users}

  if (req.session.user_id) {
    res.redirect(`/urls`);
  } 
  res.render("urls_register", templateVars);
});

app.get("/urls.json", (req, res) => { //refactored url
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId);
  res.json(userUrls);
});

app.get("/urls", (req, res) => { //refactored url
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId);

  if (req.session.user_id) { 
    const templateVars = { urls: userUrls, user_id: req.session.user_id, users};
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("Please login to view your URLs")
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.session.user_id, users};

  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect(`/login`)
  }

});

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user_id: req.session.user_id, users};

  res.render("urls_show", templateVars);
});

// Register
app.post("/register", (req, res) => { 
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

if (email === "" || password === "") {
  res.status(400).send("Error: Must enter email and password"); 
}

  if (lookUpUser(email)) {
    res.status(400).send("Error: Email already in use");
  } else {
  users[userId] = {"id": userId, "email": email, "password": hashedPassword};
  
  req.session.user_id = userId;
  res.redirect(`/urls/`);
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

    res.redirect(`/urls/${shortURL}`);

  } else {
    res.status(401).send("You must be logged in to add URLs.")
  }

});

// Login/out
app.post("/login", (req, res) => {

  const enteredEmail = req.body.email
 
  if (!lookUpUser(enteredEmail)) {
    res.status(403).send("Invalid Email")
  }

  const enteredPassword = req.body.password
  const userId = lookUpUser(enteredEmail);

  if (!bcrypt.compareSync(enteredPassword, users[userId].password)) {
    res.status(403).send("Invalid Password")
  }

  req.session.user_id = userId;
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// Edit/Delete
app.post("/urls/:id/delete", (req, res) => {
  
  if (!req.session.user_id) { 
    return res.status(403).send("Please login to view URLs");
  } 

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Short ID does not exist");
  } 

  const userUrls = urlsForUser(req.session.user_id);

  if (!userUrls[req.params.id]) {
    return res.status(403).send("You do not own the URL");
  } 
  
  shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  
  if (!req.session.user_id) { 
    return res.status(403).send("Please login to view URLs");
  } 

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Short ID does not exist");
  } 

  const userUrls = urlsForUser(req.session.user_id);

  if (!userUrls[req.params.id]) {
    return res.status(403).send("You do not own the URL");
  } 

  shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  console.log("print database from edit:", urlDatabase[shortURL]);
  res.redirect(`/urls`);
});

// Route to longURL
app.get("/u/:id", (req, res) => {
  
  // if (!req.session.user_id) { 
  //   return res.status(403).send("Please login to view URLs");
  // } 

  // console.log("print database:" + urlDatabase);
  // console.log("print req params:" + req.params.id);

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Short ID does not exist");
  } 
  
    // const userId = req.session.user_id;
    // const userUrls = urlsForUser(userId);
    const urlId = req.params.id;
  
    // if (!userUrls[urlId]) {
    //   return res.status(403).send("You do not own the URL");
    // } else {
      const longURL = urlDatabase[urlId].longURL;
      return res.redirect(longURL);
    // }

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});