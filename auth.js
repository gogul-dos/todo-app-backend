const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const secret = process.env.JWT_SECRET || "your_jwt_secret";

router.post("/register", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) {
        return res.status(500).send({ message: "Error registering user" });
      }
      res.status(201).send({ message: "User registered successfully" });
    }
  );
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).send({ message: "Error on the server." });
    if (!user) return res.status(404).send({ message: "No user found." });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid)
      return res.status(401).send({ auth: false, token: null });

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token: token });
  });
});

module.exports = router;
