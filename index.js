// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// Include the express module
const express = require('express');

// Helps in managing user sessions
const session = require('express-session');

// include the mysql module
var mysql = require('mysql');
// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');
//formidable library
const formidable = require('formidable');
// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');
const xml2js = require('xml2js');
const url = require('url');
const fs = require('fs');

// create an express application
const app = express();

// apply the body-parser middleware to all incoming requests
//app.use(bodyparser());

// Use express-session
// In-memory session is sufficient for this assignment
app.use(session({
        secret: "csci4131secretkey",
        saveUninitialized: true,
        resave: false
    }
));
const port = 8001;
var hostname = "";
var sqlusername = "";
var sqlpassword = "";
var sqldbname = "";
var portnum = 0;
var parser = new xml2js.Parser();
//set up data base config
fs.readFile(__dirname + '/dbconfig.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        hostname = result.dbconfig.host[0];
        sqlusername = result.dbconfig.user[0];
        sqlpassword = result.dbconfig.password[0];
        sqldbname = result.dbconfig.database[0];
        portnum = parseInt(result.dbconfig.port[0]);
    });
});

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));

// server listens on port set to value above for incoming connections
app.listen(port, () => console.log('Listening on port', port));

app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/welcome.html');
});
app.get('/userLogin', function(req,res){
  if (req.session.loggedIn){
    res.send({login:req.session.acc_login});
  }else{
    res.redirect(302,"/login");
  }
})
app.get('/login', function(req, res){
  res.sendFile(__dirname + '/client/Login.html')
})
app.get('/client/login.js', function(req, res){
  res.sendFile(__dirname + '/client/login.js')
})
app.get('/index', function(req, res){
  res.sendFile(__dirname + '/client/index.js')
})
app.post('/checkCredential', bodyparser.urlencoded(),function(req, res,next){
  console.log(req.body);
  const dbCon = mysql.createPool({
      host: hostname,
      user: sqlusername,               // replace with the database user provided to you
      password: sqlpassword,           // replace with the database password provided to you
      database: sqldbname,           // replace with the database user provided to you
      port: portnum
  });
  var rows = [];
  console.log("Attempting database connection");
  var found = false;

  console.log("Connected to database!");
  const sql = `SELECT * FROM tbl_accounts`;
      
  dbCon.query(sql, function (err, result, fields) {
          if (err) {
              throw err;
          }
          rows = result;
          for (var i = 0; i < rows.length && !found; i++){
            console.log(rows[i].acc_login);
            var hashpw = rows[i].acc_password;
            console.log(hashpw);
            
            if (req.body.username===rows[i].acc_login){
              //valid login
              console.log(req.body);
              var row = rows[i];
              found = true;	
              bcrypt.compare(req.body.password, hashpw).then(function(result){
                if(result){
                    console.log("valid");
                    console.log(row);
                    req.session.loggedIn = true;
                    req.session.userId = row.acc_id;
                    req.session.acc_login = row.acc_login;
                    req.session.acc_name = row.acc_name;
                    var response = {
                      result: "valid",
                      name: row.acc_name,
                    }
                    
                    res.send(response);
              	}else{
                    console.log("invalid");
                    var response = {
                      result: "invalid",
                    }
                    res.send(response);
  			        }
              });
            }
          }    
  });
  //res.send("I got the credentials " + req.body.username + " " + req.body.password);
})
app.get('/logout', function(req, res){
  if (!req.session.loggedIn){
    console.log("Not log in, you can not log out");
    res.redirect(302, "/login");
  }else{
    req.session.destroy();
    res.redirect(302,"/login");
  }
})


// GET method route for the contacts page.
// It serves MyContacts.html present in client folder
app.get('/MyContacts', function(req, res) {
    // TODO: Add Implementation
    if (!req.session.loggedIn){
      res.redirect(302,"/login");
    }else{
      console.log("valid");
      res.sendFile(__dirname + "/client/MyContacts.html");
    }
});
app.get('/AllContacts', function(req, res) {
    // TODO: Add Implementation
    if (!req.session.loggedIn){
      res.redirect(302,"/login");
    }else{
      console.log("valid");
      res.sendFile(__dirname + "/client/AllContacts.html");
    }
});
app.get('/AddContact', function(req,res){
	if (!req.session.loggedIn){
		res.redirect(302,"/login");
	}else{
		res.sendFile(__dirname + "/client/AddContact.html");
	}
})
app.get('/Stock', function(req,res){
	if (!req.session.loggedIn){
		res.redirect(302,"/login");
	}else{
		res.sendFile(__dirname + "/client/Stocks.html");
	}
})
app.get("/Admin", function(req,res){
  if (!req.session.loggedIn){
    res.redirect(302, "/login");
  }else{
    res.sendFile(__dirname + "/client/AdminPage.html");
  }
})
app.post('/postContactEntry', bodyparser.urlencoded(),function(req,res){
  console.log(req.body);
  const dbConn = mysql.createPool({
    connectionLimit: 10,
    host: hostname,
    user: sqlusername,               // replace with the database user provided to you
    password: sqlpassword,           // replace with the database password provided to you
    database: sqldbname,           // replace with the database user provided to you
    port: portnum
});
  var contact = {
    contact_category: req.body.category,
    contact_name: req.body.name,
    contact_location: req.body.location,
    contact_info: req.body.info,
    contact_email: req.body.email,
    website_title: req.body.website_title,
    website_url: req.body.url
  };
  var sql = `INSERT contact_table SET ?`;

    dbConn.query(sql, contact, function(err, result){
      if (err){
        console.log("fail to add contact");
        console.log(err);
      }else{
        console.log("finished adding contact");
        res.redirect(302,"/AllContacts");
      }
    })
})
app.get('/getListOfUsers', function(req,res){
 var query = "SELECT * FROM tbl_accounts";
 console.log("Get user list");
  const dbConn = mysql.createPool({
    connectionLimit: 10,
    host: hostname,
    user: sqlusername,               // replace with the database user provided to you
    password: sqlpassword,           // replace with the database password provided to you
    database: sqldbname,           // replace with the database user provided to you
    port: portnum
  });
  var objArray = []; 
    dbConn.query(query, function(err, result){
      if (err){
        console.log("Fail to get list of users");
        res.json(objArray);
      }else{
        console.log("Obtain user list successfully");
	console.log(result);
        for (var i = 0; i < result.length; i++){  
          var obj = {  
                    id: result[i].acc_id, 
                    name: result[i].acc_name, 
                    login: result[i].acc_login, 
                      password: result[i].acc_password 
          }; 
          objArray.push(obj); 
         } 
         res.json(objArray);
      }
    })
  
})

app.post('/addUser', bodyparser.urlencoded(), function(req,res){
  if (req.session.loggedIn){
    var name = req.body.name;
    var login = req.body.login;
    var password = req.body.password;
    const dbConn = mysql.createPool({
      connectionLimit: 10,
      host: hostname,
      user: sqlusername,               // replace with the database user provided to you
      password: sqlpassword,           // replace with the database password provided to you
      database: sqldbname,           // replace with the database user provided to you
      port: portnum
    });
    var query = " SELECT * FROM tbl_accounts where acc_login = ?";
      dbConn.query(query,login, function(err, result){
        if (result.length > 0){
          console.log("Account existed before");
          res.send({flag: false});
        }else{
          console.log("Valid new account");
          const saltRounds = 10;
          const passwordHash = bcrypt.hashSync(password, saltRounds);
          const rowToBeInserted = {
            acc_name: name,            // replace with acc_name chosen by you OR retain the same value
            acc_login: login,           // replace with acc_login chosen by you OR retain the same value
            acc_password: passwordHash      
          };
          var insertQuery = "INSERT tbl_accounts SET ?";
          dbConn.query(insertQuery,rowToBeInserted,function(err, result){
            if (err){
              console.log("Fail to add new account");
              res.send({flag:false});
            }else{
              console.log("Add new user successfully");
              res.send({flag:true, id:result.insertId});

            }
          } )
        }
      })
  }else{
    res.redirect(302,"/login");
  }
  

})
app.post('/deleteUser', bodyparser.urlencoded(), function(req,res){
  if (req.session.loggedIn){
    var login = req.body.login;
    if (login === req.session.acc_login){
      res.send({flag:false});
    }else{
      const dbConn = mysql.createPool({
        connectionLimit: 10,
        host: hostname,
        user: sqlusername,               // replace with the database user provided to you
        password: sqlpassword,           // replace with the database password provided to you
        database: sqldbname,           // replace with the database user provided to you
        port: portnum
      });
      var query = " DELETE FROM tbl_accounts where acc_login = ?";
        dbConn.query(query,login, function(err,result){
          if (err){
            console.log("Fail to delete user");
            res.send({flag:false});
          }else{
            console.log("Delete user successfully");
            res.send({flag:true});
          }
        })

    }
  }else{
    res.redirect(302,"/login");
  }
})
app.post('/updateUser', bodyparser.urlencoded(), function(req,res){
  console.log("Update user");
  if (req.session.loggedIn){
    var id = req.body.id;
    var name = req.body.name;
    var login = req.body.login;
    var password = req.body.password;
    var query = " SELECT * FROM tbl_accounts where acc_login = ? and acc_id != ? ";
    const dbConn = mysql.createPool({
      connectionLimit: 10,
      host: hostname,
      user: sqlusername,               // replace with the database user provided to you
      password: sqlpassword,           // replace with the database password provided to you
      database: sqldbname,           // replace with the database user provided to you
      port: portnum
    });
      dbConn.query(query, [login,id], function(err, results){
        if (err){
          console.log("fail to check users");
          console.log(err);
        }else{
          if (results.length == 0){
            console.log("Valid new login name");
            if (password){
              const saltRounds = 10;
              const myPlaintextPassword = password;// replace with acc_password chosen by you OR retain the same value
              const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
              var updateQuery = "UPDATE tbl_accounts SET acc_login = ? , acc_name = ? , acc_password = ? WHERE acc_id = ?";
              dbConn.query(updateQuery, [login,name,passwordHash, id], function (err, result){
                if (err){
                  console.log(err);
                  console.log("Failed to update");
                  res.send({flag:false});
                }else{
                  console.log("Update successfully");
                  res.send({flag: true});
                }
              })
            }else{
              var updateQuery = "UPDATE tbl_accounts SET acc_login = ? , acc_name = ?  WHERE acc_id = ?";
              dbConn.query(updateQuery, [login,name,id], function (err, result){
                if (err){
                  console.log("Failed to update");
                  res.send({flag:false});
                }else{
                  console.log("Update successfully");
                  res.send({flag: true});
                }

              })
    
            }
    
          }else{
            console.log("Name appears before");
            res.send({flag:false});
          }
        }
      });


  }else{
    res.redirect(302,"/login");
  }
  

})
app.post('/addthroughfile',function(req,res){
	const form = formidable({ multiples: true });
    	form.parse(req, (err, fields, files) => {
      		if (err) {
        		console.log(err);
      		}else{
		        var file = files.filename;
		        var filepath = file.filepath;
			fs.readFile(filepath, 'utf8' , (err, data) => {
  				if (err) {
    					console.error(err)
    					return;
  				}
  				  const dbConn = mysql.createPool({
              connectionLimit: 10,
    					host: hostname,
    					user: sqlusername,               // replace with the database user provided to you
    					password: sqlpassword,           // replace with the database password provided to you
    					database: sqldbname,           // replace with the database user provided to you
    					port: portnum
				});
  				var JSONdata = JSON.parse(data);
  				var categories = ["academic", "personal", "industry"];
  				var sql = `INSERT contact_table SET ?`;
    			for (var i = 0; i < categories.length; i++){
  					var category = categories[i];
  					var contacts = JSONdata[category];
  					for (var j = 0; j < contacts.length; j++){
  						var contact = contacts[j];
  						var object = {
  							contact_category: contact.category,
    							contact_name: contact.name,
    							contact_location: contact.location,
    							contact_info: contact.info,
    							contact_email: contact.email,
    							website_title: contact.website_title,
    							website_url: contact.url
  							
  						};
  						var sql = `INSERT contact_table SET ?`;
  						dbConn.query(sql, object, function(err, result){
      							if (err){
        							console.log("fail to add contact");
        							console.log(err);
      							}else{
        							console.log("finished adding contact");
					      }
					  })
  					}
  				}
					res.redirect(302,"/AllContacts");
			})
      		}
   	 });
});
app.get('/contactTable', function(req, res){
  var category = req.query.category;
  console.log(category);
  const dbConn = mysql.createPool({
    connectionLimit: 10,
    host: hostname,
    user: sqlusername,               // replace with the database user provided to you
    password: sqlpassword,           // replace with the database password provided to you
    database: sqldbname,           // replace with the database user provided to you
    port: portnum
  });
  var sql;
  if (category){
  	sql = `SELECT * FROM contact_table WHERE contact_category="${category}"`;
  }else{
  	console.log("Get all contacts");
  	sql = `SELECT * FROM contact_table`;
  	category = "contacts";
  }
  var jsonObject = {};
  dbConn.query(sql, function(err, result){
    if(err){
      console.log(err);
    }else{
      result.sort((contact1, contact2) => {  
      	let name1 = contact1.contact_name.toUpperCase();
      	let name2 = contact2.contact_name.toUpperCase();
      	if (name1 > name2){
        	return 1;
      	}else if (name1 < name2){
        	return -1;
      	}
      	return 0;
      })
      jsonObject[category] = result;
      var stringjson = JSON.stringify(jsonObject);
      res.send(stringjson);
    }
  }) 
  
})
// TODO: Add implementation for other necessary end-points

// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});

