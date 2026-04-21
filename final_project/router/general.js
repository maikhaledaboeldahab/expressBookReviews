const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// 📝 Register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  // check if user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered. Now you can login"
  });
});


// 📚 Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});


// 🔎 Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
});


// 👨‍🏫 Get books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  const filteredBooks = Object.values(books).filter(
    book => book.author.toLowerCase() === author.toLowerCase()
  );

  return res.status(200).json(filteredBooks);
});


// 📖 Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  const filteredBooks = Object.values(books).filter(
    book => book.title.toLowerCase() === title.toLowerCase()
  );

  return res.status(200).json(filteredBooks);
});


// ⭐ Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;