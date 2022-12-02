

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }

  }

  return undefined;
}

function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function urlsForUser(userId, database) {
  let obj = {};

  for (let url in database) {
    if (database[url].userId === userId) {
      obj[url] = database[url];
    }

  }

  return obj;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser };