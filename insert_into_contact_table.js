/*
TO DO:
-----
READ ALL COMMENTS AND REPLACE VALUES ACCORDINGLY
*/

const mysql = require("mysql");
const bcrypt = require('bcrypt');

const dbCon = mysql.createConnection({
    host: "localhost",
    user: "root",               // replace with the database user provided to you
    password: "nguy4068",           // replace with the database password provided to you
    database: "PROJECTDB",           // replace with the database user provided to you
    port: 3306
});

console.log("Attempting database connection");
dbCon.connect(function (err) {
    if (err) {
        throw err;
    }

    console.log("Connected to database!");

    const saltRounds = 10;
    const myPlaintextPassword = 'password';// replace with acc_password chosen by you OR retain the same value
    const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

    const rowToBeInserted = {
        contact_category: 'academic',            // replace with acc_name chosen by you OR retain the same value
        contact_name: 'ngan',           // replace with acc_login chosen by you OR retain the same value
        contact_location: '805 E River Pkwy',
        contact_info: 'student',
        contact_email: 'nguy4068@umn.edu',
        website_title: 'profile page',
        website_url: "http://localhost:9001/"      
    };

    console.log("Attempting to insert record into contact_table");
    dbCon.query('INSERT contact_table SET ?', rowToBeInserted, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Table record inserted!");
    });
 

    dbCon.end();
});
