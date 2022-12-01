const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { restart } = require("nodemon");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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
  for (let data in urlDatabase) { // data = b2xVn2, 9sm5xK 
    if (urlDatabase[data].userId === userId) {
      obj[data] = urlDatabase[data];
    }
  }
  return obj;
}

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

// user database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const templateVars =  { user_id: req.cookies["user_id"], users}

  if (req.cookies["user_id"]) {
    res.redirect(`/urls`);
  } 
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars =  { user_id: req.cookies["user_id"], users}

  if (req.cookies["user_id"]) {
    res.redirect(`/urls`);
  } 
  res.render("urls_register", templateVars);
});

app.get("/urls.json", (req, res) => { //refactored url
  const userId = req.cookies["user_id"];
  const urlData = urlsForUser(userId);
  res.json(urlData);
});

app.get("/urls", (req, res) => { //refactored url
  const userId = req.cookies["user_id"];
  const urlData = urlsForUser(userId);
  console.log(urlData);

  if (req.cookies["user_id"]) { 
    const templateVars = { urls: urlData, user_id: req.cookies["user_id"], users};
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("Please login to view your URLs")
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"], users};

if (req.cookies["user_id"]) {
  res.render("urls_new", templateVars);
} 
res.redirect(`/login`)
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user_id: req.cookies["user_id"], users};
  res.render("urls_show", templateVars);
});

// Register
app.post("/register", (req, res) => { 
  const userId = generateRandomString();
  let email = req.body.email;
  let pw = req.body.password;

if (email === "" || pw === "") {
  res.status(400).send("Error: Must enter email and password"); 
}

  if (lookUpUser(email)) {
    res.status(400).send("Error: Email already in use");
  } else {
  users[userId] = {"id": userId, "email": email, "password": pw};
  res.cookie("user_id", userId);
  res.redirect(`/urls/`);
}

});

app.post("/urls", (req, res) => { //refactored URL
  
  if (req.cookies["user_id"]) {
    shortId = generateRandomString();
    urlDatabase[shortId] = {
      "longURL": req.body.longURL,
      "userId": req.cookies["user_id"]
  };
    res.redirect(`/urls/:${shortId}`);
  }

  res.status(401).send("You must be logged in to add URLs.")
});

// Login/out
app.post("/login", (req, res) => {

  const email = req.body.email
  const password = req.body.password

  if (!lookUpUser(email)) {
    res.status(403).send("Invalid Email")
  }

  const userId = lookUpUser(email);

  if (password !== users[userId].password) {
    res.status(403).send("Invalid Password")
  }

  res.cookie("user_id", userId);
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);
  res.redirect(`/login`);
});

// Edit/Delete
app.post("/urls/:id/delete", (req, res) => {
  
  if (!req.cookies["user_id"]) { 
    return res.status(403).send("Please login to view URLs");
  } 

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Short ID does not exist");
  } 

  if (!urls[req.params.id]) {
    return res.status(403).send("You do not own the URL");
  } 
  
  shortId = req.params.id;
  delete urlDatabase[shortId];
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  
  if (!req.cookies["user_id"]) { 
    return res.status(403).send("Please login to view URLs");
  } 

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Short ID does not exist");
  } 

  if (!urls[req.params.id]) {
    return res.status(403).send("You do not own the URL");
  } 

  shortId = req.params.id;
  console.log(req.params)
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`/urls`);
});

// Route to longURL
app.get("/u/:id", (req, res) => {
  
console.log(req.params.id);

  if (!req.cookies["user_id"]) { 
    return res.status(403).send("Please login to view URLs");
  } 

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Short ID does not exist");
  } 
  
    const userId = req.cookies["user_id"];
    const urls = urlsForUser(userId);

    if (!urls[req.params.id]) {
      return res.status(403).send("You do not own the URL");
    } 
  
    res.redirect(urls[req.params.id].longURL);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});