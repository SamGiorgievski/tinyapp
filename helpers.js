const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }

  }

  return undefined;
}

function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;

  for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function urlsForUser(userId, database) {
  let userUrls = {};

  for (let url in database) {
    if (database[url].userId === userId) {
      userUrls[url] = database[url];
    }

  }

  return userUrls;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser };