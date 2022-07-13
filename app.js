const express = require("express");
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const User = require("./models/user");
dotenv.config()
mongoose.connect(process.env.DB)
    .then(() => console.log("DB Connected"))
    .catch(() => console.log("Error Connecting to DB"))

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "friday hai",
    cookie: { maxAge: 24 * 60 * 60 * 1000 * 365 },
    saveUninitialized: true,
    resave: true
}));
app.use((req, res, next) => {
    res.locals.currentUser = req.session.username;
    next();
});
const requireLogin = (req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/login');
    }
    next();
}
const isAdmin = (req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/login');
    } else {
        const adminCheck = req.session.username;
        User.findOne({ username: adminCheck }, (err, docs) => {
            if (!err && docs) {
                if (!docs.isOwner) {
                    return res.render("message", { message: "You Need to Be Mess Owner to Access this Page" });
                } else {
                    next();
                }
            } else {
                return res.render("message", { message: "Something Went Wrong!!" });
            }
        })
    }
}

app.get("/", (req, res) => res.render("home"));
app.get("/pricing", (req, res) => res.render("pricing"));
app.get("/menu", (req, res) => res.render("menu"));
app.get("/register-for-food", requireLogin, (req, res) => res.render("register-for-food"));
app.get("/register", (req, res) => res.render("register"));

app.get("/admin", isAdmin, (req, res) => {
    User.find({}, (err, docs) => {
        if (docs.length <= 1) {
            res.render("message", { message: "No one is Registered!!" });
        } else {
            res.render("admin", { docs: docs });
        }
    })
});

app.get("/login", (req, res) => res.render("login"))
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})


app.post("/register", (req, res) => {
    const { username, password, email, phno, fullname } = req.body;
    let isOwner = false;
    if (username === 'admin' || username === 'rajeev') {
        isOwner = true;
    }
    User.find({ username }, (err, docs) => {
        if (docs.length) {
            res.render("message", { message: "User Already Registered" });
        } else {
            User.create({ username: username, password: password, fullname: fullname, email: email, phoneNum: phno, foodType: -1, isOwner: isOwner, paidForThisMonth: false, paymentMethod: -1 }, (err, docs) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("message", { message: "User Registered" });
                }
            })
        }
    })
})


app.post("/login", (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, (err, docs) => {
        if (docs) {
            if (password === docs.password) {
                req.session.username = username;
                res.redirect("/");
            } else {
                res.render("message", { message: "Wrong Username or Password" });
            }
        } else {
            res.render("message", { message: "User Not Registered" });
        }
    })
})

app.post("/register-for-food", requireLogin, (req, res) => {
    const { username, foodType, paymentMethod } = req.body;
    let paidForThisMonth = false;
    if (paymentMethod !== 3) {
        paidForThisMonth = true;
    }
    User.findOne({ username }, (err, docs) => {
        if (docs) {
            if (docs.foodType === -1) {
                User.findOneAndUpdate({ username }, {
                    foodType: foodType, paymentMethod: paymentMethod, paidForThisMonth: paidForThisMonth
                }, (err, docs) => {
                    if (!err && docs) {
                        res.render("message", { message: "Regsitered in Mess, You can make payment at the Reception" })
                    } else {
                        res.render("message", { message: "Something went Wrong!!" })
                    }
                })
            } else {
                res.render("message", { message: "You are already registered" })
            }
        } else {
            res.render("message", { message: "You are not    registered" })
        }
    })
})

app.listen(process.env.PORT, () => {
    console.log("On " + process.env.PORT);
})
