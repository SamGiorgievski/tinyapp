const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

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

function doesUserExist(userEmail) {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return false
    }
    return true
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars =  { user_id: req.cookies["user_id"], users}
  res.render("urls_register", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], users};
  console.log(users);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"], users};
  res.render("urls_new", templateVars);
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

  if (!doesUserExist(email)) {
    res.status(400).send("Error: Email already in use");
  } else {
  users[userId] = {"id": userId, "email": email, "password": pw};
  res.cookie("user_id", userId);
  res.redirect(`/urls/`);
}

});

app.post("/urls", (req, res) => {
  shortId = generateRandomString();
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`/urls/:${shortId}`);
});

// Login/out
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);
  res.redirect(`/urls/`);
});

// Edit/Delete
app.post("/urls/:id/delete", (req, res) => {
  shortId = req.params.id;
  delete urlDatabase[shortId];
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  shortId = req.params.id;
  console.log(req.params)
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`/urls`);
});

// Route to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!urlDatabase[req.params.id]) {
    res.send("Short ID does not exist");
  }
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});