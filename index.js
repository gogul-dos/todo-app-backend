const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./auth");
const todoRoutes = require("./todos");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api", todoRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
