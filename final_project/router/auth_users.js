const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// --- Middleware & Auth Logic ---

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "access");
    req.user = decoded.data;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// 🔐 Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: username }, "access", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token: accessToken });
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

// ✍️ Add / Modify Review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const reviewContent = req.body.review;
  const username = req.user;

  if (books[isbn]) {
    books[isbn].reviews[username] = reviewContent;
    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
  }
  return res.status(404).json({ message: "Book not found" });
});

// --- Tasks 10-13 using Axios ---
const API_URL = "http://localhost:5000";

// Task 10: Get all books – Using async callback function
const getAllBooks = async () => {
    try {
        const response = await axios.get(`${API_URL}/`);
        console.log("Task 10 (Async/Await):", response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

// Task 11: Search by ISBN – Using Promises
const getBookByISBN = (isbn) => {
    axios.get(`${API_URL}/isbn/${isbn}`)
        .then(response => {
            console.log("Task 11 (Promises):", response.data);
        })
        .catch(err => console.log(err));
};

// Task 12: Search by Author - Using Async/Await
const getBookByAuthor = async (author) => {
    try {
        const response = await axios.get(`${API_URL}/author/${author}`);
        console.log("Task 12 (Async/Await):", response.data);
    } catch (error) {
        console.error(error);
    }
};

// Task 13: Search by Title - Using Async/Await
const getBookByTitle = async (title) => {
    try {
        const response = await axios.get(`${API_URL}/title/${title}`);
        console.log("Task 13 (Async/Await):", response.data);
    } catch (error) {
        console.error(error);
    }
};

// --- Combined Exports ---
module.exports = {
    authenticated: regd_users,
    users: users,
    getAllBooks,
    getBookByISBN,
    getBookByAuthor,
    getBookByTitle
};