const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const { API_VERSION } = require('./config');

// Load routings
const authRoutes = require('./routers/auth');
const userRoutes = require("./routers/user");
const menuRoutes = require("./routers/menu");

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

// Config header HTTP
// ...

//Router basic
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, menuRoutes);


module.exports = app;