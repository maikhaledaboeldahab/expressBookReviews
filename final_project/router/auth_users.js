const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "access");
    req.user = decoded.data; // This is the username
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// 🔐 Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { data: username },
      "access",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token: accessToken
    });
  } else {
    return res.status(401).json({ message: "Invalid login credentials" });
  }
});

// ✍️ Add / Modify Review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const reviewContent = req.body.review;
  const username = req.user;

  if (!reviewContent) {
    return res.status(400).json({ message: "Review content is missing" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure the reviews object exists for this book
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update review indexed by username
  books[isbn].reviews[username] = reviewContent;

  return res.status(200).json({
    message: `Review for ISBN ${isbn} updated by ${username}`,
    reviews: books[isbn].reviews
  });
});



const axios = require('axios');

// Task 10
async function getAllBooks() {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
}

// Task 11
function getBookByISBN(isbn) {
    return axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(res => res.data);
}

// Task 12
async function getBookByAuthor(author) {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return response.data;
}

// Task 13
async function getBookByTitle(title) {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return response.data;
}

module.exports = {
    getAllBooks,
    getBookByISBN,
    getBookByAuthor,
    getBookByTitle
};

module.exports.authenticated = regd_users;
module.exports.users = users;