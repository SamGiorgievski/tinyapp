# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Login page"](https://github.com/SamGiorgievski/tinyapp/blob/main/docs/Login.png?raw=true)
!["Create URL"](https://github.com/SamGiorgievski/tinyapp/blob/main/docs/Create%20url.png?raw=true)
!["New URL page"](https://github.com/SamGiorgievski/tinyapp/blob/main/docs/url%20page.png?raw=true)
!["My URLs"](https://github.com/SamGiorgievski/tinyapp/blob/main/docs/My%20urls.png?raw=true)
!["Cookies"](https://github.com/SamGiorgievski/tinyapp/blob/main/docs/Cookies.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Features
- Account registration
- Login/logout
- Create/edit/delete URLs

## Security Features
- Permissions: can only view/edit/delete your own URLs
- Password encryption
- Hashed cookies
