/*
TO DO:
-----
READ ALL COMMENTS AND REPLACE VALUES ACCORDINGLY
*/

var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",               // replace with the database user provided to you
    password: "nguy4068",           // replace with the database password provided to you
    database: "PROJECTDB",           // replace with the database user provided to you
    port: 3306
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
  console.log("Connected!");
    var sql = `CREATE TABLE contact_table(contact_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                         contact_category VARCHAR(32),
                                         contact_name VARCHAR(256),
                                         contact_location VARCHAR(256),
                                         contact_info VARCHAR(256),
                                         contact_email VARCHAR(256),
                                         website_title VARCHAR(256),
                                         website_url VARCHAR(256))`;
  con.query(sql, function(err, result) {
    if(err) {
      throw err;
    }
    console.log("Table created");
        con.end();

  });
  con.query('SELECT * FROM contact_table', function(error, rows, fields){
    if (error) throw error;
    if (rows.length == 0){
        console.log("No contacts found in the table");
    }else{
        for (var i = 0; i < rows.length; i++){
            console.log(rows[i].contact_id + " " + rows[i].contact_category + " " + rows[i].contact_name + " " + rows[i].contact_info + " " + rows[i].contact_email + " " + rows[i].website_title + " " + rows[i].website_url);
        }
    }
})
});
