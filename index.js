const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
let port = 8080;
const path = require("path");
const { read } = require('fs');
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Database connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'tomarbal@1'
});

// Define a function to generate random user data
let getrandomUser = () => {
    return [
        faker.datatype.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

app.get("/", (req, res) => {
    let q = `SELECT COUNT(*) FROM user`;
    connection.query(q, (err, result) => {
        if (err) {
            console.log("error happen in db");
            res.send(result)
        } let count = result[0]["COUNT(*)"];
        res.render("home.ejs", { count });

    })
});
//show route....................................................
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;
    connection.query(q, (err, result) => {
        if (err) {
            console.log("error happen in db");
        }
        res.render("show.ejs", { result });

    })

})


app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM USER WHERE ID ='${id}'`;
    connection.query(q, (err, result) => {
        if (err) {
            console.log("err in db");
            res.send("error in db");
        } let user = result[0];
        res.render("edit.ejs", { user });
    });
});
//UPDATA IN DATABASE IN REAL
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formpassword, username } = req.body; // come from --- <form> information
    let q = `SELECT * FROM USER WHERE id="${id}"`;

    connection.query(q, (err, result) => {

        let user = result[0];
        if (formpassword != user.password) {
            res.send("wrong password");
        } else {
            let q2 = `UPDATE user SET username='${username}' WHERE id="${id}"`;
            connection.query(q2, (err, result) => {
                res.redirect("/user");
            })
        }
    });
});

app.get("/user/form" , (req , res) => {
    res.render("entry.ejs");
})



//post route
app.post("/user", (req, res) => {
    let q = `INSERT INTO user (id , username , email , password) VALUES ?`;
    let { id, username, email, password } = req.body;
    let data = [[id, username, email, password]];
    connection.query(q, [data], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error in adding user");
        } else {
            console.log("User added successfully");
            res.redirect("/");
        }
    });
});

//delete form
app.get("/user/:id/delete" , (req , res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id="${id}"`;
    connection.query(q, (err , result) => {
        let user = result[0];
        res.render("delete.ejs" , {user});
    })
})



 //delete route
 app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formpass, email } = req.body;

    // Check if password and email are provided
    if (!formpass || !email) {
        return res.status(400).send("Please provide password and email");
    }

    // Check if user exists and credentials are valid
    let checkQuery = `SELECT * FROM user WHERE id="${id}" AND password="${formpass}" AND email="${email}"`;
    connection.query(checkQuery, (err, result) => {
        if (err) {
            console.error("Error checking user:", err);
            return res.status(500).send("Internal Server Error");
        }

        // If no user found with provided credentials
        if (result.length === 0) {
            return res.status(404).send("User not found or invalid credentials");
        }

        // Delete the user from the database
        let deleteQuery = `DELETE FROM user WHERE id="${id}"`;
        connection.query(deleteQuery, (err, result) => {
            if (err) {
                console.error("Error deleting user:", err);
                return res.status(500).send("Internal Server Error");
            }
            res.status(200).send("User deleted successfully");
            res.redirect("/")
        });
    
    });
});




app.listen(port, () => {
    console.log("Server listening on port", port);
});
