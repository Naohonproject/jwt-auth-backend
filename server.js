const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const authRouters = require("./routes/auth");
const server = express();
const PORT = process.env.PORT || 8000;

server.use(cors());
server.use(cookieParser());
server.use(express.json());

server.use("/api/auth", authRouters);

mongoose.connect(process.env.URI).then(() => {
  server.listen(PORT, () => {
    console.log(`server is running in port ${PORT}`);
  });
});
