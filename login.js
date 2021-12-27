const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const path = require("path");

var cors = require("cors");
const session = require("express-session");
let ejs = require("ejs");
const router = express.Router();
app.set("view engine", "ejs");
const url = "mongodb://localhost:27017";
mongoose.connect(
  "mongodb+srv://usermange:user123@cluster0.hksqi.mongodb.net/database1?retryWrites=true&w=majority"
);
app.use(
  session({
    secret: "sceretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5000000 },
  })
);
app.use(cors());
const insertdata = require("./usermodules");
const db = require("./mongomodules");
let adminemail = "admin@gmail.com";
let adminpassword = "password";

db.connect((err) => {
  if (err) console.log(err);
});
function redirect(req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    next();
  }
}

function redirectreg(req, res, next) {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    next();
  }
}
function admin(req, res, next) {
  if (!req.session.admin) {
    res.redirect("/admin");
  } else {
    next();
  }
}
function admindash(req, res, next) {
  if (req.session.admin) {
  res.redirect("/admin/userslist");
  } else {
    next()
  }
}

//user login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/Login/login.html"));
});

app.post("/login", (req, res) => {
  insertdata.login(req.body).then((response) => {
    if (response.status) {
      req.session.loggedin = true;
      req.session.user = response.user;
      console.log(response);
      res.render("home", {
        results: {
          name: response.user.name,
          email: response.user.email,
          id: response.user._id,
        },
      });
    } else {
      res.redirect("/");
    }
  });
});
// users home  page
app.get("/home",redirect,(req, res) => {
   
});
app.get("/logout", redirect, (req, res) => {
  req.session.destroy();
  console.log(req.session);
  res.redirect("/");
});

// resgister page
app.get("/register", redirectreg, (req, res) => {
  res.sendFile(path.join(__dirname + "/Register/register.html"));
});

app.post("/register", (req, res) => {
  insertdata.insertdata(req.body);
  res.redirect("/");
  res.end();
});
//Admin Login
app.get("/admin",admindash, (req, res) => {
  res.sendFile(path.join(__dirname + "/Admin/admin-login.html"));
});
//admin dashboard
app.post("/admin", (req, res) => {
  if (req.body.email == adminemail && req.body.password == adminpassword) {
    req.session.admin = adminemail;
res.redirect("/admin/userslist")
    // res.sendFile(path.join(__dirname + "/Admin/admin.html"));
  } else {
    res.redirect("/admin");
  }
});

//admin add user
app.get("/admin/addusers", admin, (req, res) => {
  res.sendFile(path.join(__dirname + "/Admin/useradd.html"));
});
app.post("/admin/addusers", (req, res) => {
  insertdata.addUser(req.body);
  res.redirect("/admin/userslist");
  res.end();
});
//admin show users
app.get("/admin/userslist",admin, (req, res) => {
  insertdata.showUser(res);
});
//admin edit users
app.get("/admin/editusers/:id", admin, (req, res) => {
  let id = req.params.id;
  console.log(req.body);
 
  MongoClient.connect(url, (err, client) => {
    client
      .db("database1")
      .collection("users")
      .findOne({ _id: ObjectId(id) })
      .then((response) => {
        res.render("edit", {
          results: {
            name: response.name,
            email: response.email,
            id: response._id,
          },
        });
      });
  });
});

app.post("/admin/editusers/:id", admin, (req, res) => {
  let id = req.params.id;
  insertdata.editUsers({ _id: ObjectId(id) }, req.body);
  res.redirect("/admin/userslist");
});

//delete users

app.get("/admin/userslist/:id", admin, (req, res) => {
  let id = req.params.id;
  insertdata.deleteUsers({ _id: ObjectId(id) });
  res.redirect("/admin/userslist");
});

//admin logout

app.get("/admin/logout", admin, (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

app.listen(process.env.PORT || 4000);
