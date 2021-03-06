require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

mongoose
  .connect("mongodb://localhost/idkwhatev", { useNewUrlParser: true })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup
app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

// connect views & partials
hbs.registerPartials(path.join(__dirname, "views", "partials"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// make our Express app create SESSIONS (more on this tomorrow)
app.use(
  session({
    // these two settings do things. which things? we don't know! but we do know. that if those things aren't done. nothing works.
    saveUninitialized: true,
    resave: true,
    // secret should be a string that's different for every app
    secret: "ca^khT8KYd,G73C7R9(;^atb?h>FTWdbn4pqEFUKs3"
  })
);

// allow our routes to use FLASH MESSAGES (feedback messages before redirects)
// (flash messages need sessions to work)
app.use(flash());
// app.use() defines our own MIDDLEWARE function
app.use((req, res, next) => {
  // send flash messages to the hbs file
  // (req.flash() comes from the "connect-flash" npm package)
  res.locals.messages = req.flash();

  // tell Express we are ready to move to the routes now
  // (you need this or your pages will stay loading forever)
  next();
});

// default value for title local
app.locals.title = "best site ever, amirite?!";

// tell app where to find relevant routing info
const index = require("./routes/index");
app.use("/", index);

const auth = require("./routes/auth-routes.js");
app.use("/", auth);

module.exports = app;
