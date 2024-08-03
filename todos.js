const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./database");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const secret = process.env.JWT_SECRET || "your_jwt_secret";

function verifyToken(req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  jwt.verify(token, secret, (err, decoded) => {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    req.userId = decoded.id;
    next();
  });
}

router.post("/todos", verifyToken, (req, res) => {
  const { description, status } = req.body;
  db.run(
    "INSERT INTO todos (user_id, description, status) VALUES (?, ?, ?)",
    [req.userId, description, status],
    function (err) {
      if (err) {
        return res.status(500).send({ message: "Error creating to-do item" });
      }
      res
        .status(201)
        .send({ message: "To-do item created successfully", id: this.lastID });
    }
  );
});

router.get("/todos", verifyToken, (req, res) => {
  db.all("SELECT * FROM todos WHERE user_id = ?", [req.userId], (err, rows) => {
    if (err) {
      return res.status(500).send({ message: "Error fetching to-do items" });
    }
    res.status(200).send(rows);
  });
});

router.put("/todos/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { description, status } = req.body;

  db.run(
    "UPDATE todos SET description = ?, status = ? WHERE id = ? AND user_id = ?",
    [description, status, id, req.userId],
    function (err) {
      if (err) {
        return res.status(500).send({ message: "Error updating to-do item" });
      }
      res.status(200).send({ message: "To-do item updated successfully" });
    }
  );
});

router.delete("/todos/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM todos WHERE id = ? AND user_id = ?",
    [id, req.userId],
    function (err) {
      if (err) {
        return res.status(500).send({ message: "Error deleting to-do item" });
      }
      res.status(200).send({ message: "To-do item deleted successfully" });
    }
  );
});

module.exports = router;
