# Book Cataloging System

A full-stack web application where users can search books, save them to their list, write reviews (ratings + comments), and filter by rating.

## Features

- Search books using Google Books API
- Save and remove books from personal list
- Create, update, delete reviews
- Filter saved books by rating
- JWT-based authentication

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT

## Project Structure
book-cataloging-system/
├── backend/ # Node.js backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── app.js
│ ├── .env
│ └── package.json
├── pages/ # HTML UI pages
| ├── styles/ # CSS styles
├── scripts/ # Frontend JS
└── README.md
