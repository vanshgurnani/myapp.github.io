// Server library
const express = require('express');
// Database Libary
const mysql = require('mysql');
const bodyParser = require('body-parser');
const prompt = require('prompt-sync')();
const session = require('express-session');


const app = express();

app.set('view engine', 'ejs');

app.use(session({
  secret: 'user123',
  resave: false,
  saveUninitialized: true
}));


// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mysql123',
  database: 'lms'
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/sign.html');
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

//<<---ISSUES--->  

app.get('/issue', (req, res) => {
  res.sendFile(__dirname + '/public/issue.html');
});


app.get('/itable', (req, res) => {
  pool.query('SELECT * FROM issues', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving data from database');
    } else {
      res.render('itable', { issues: results,modifiedOption: 'modifiedOption' });
    }
  });
});


app.post('/idelete/:id', (req, res) => {
  const id = req.params.id;

  pool.query('DELETE FROM issues WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error deleting data from database');
    } else {
      // console.log(`Deleted issue with ID ${id}`);
      res.redirect('/itable'); // redirect to the issues table page
    }
  });
});

app.post('/imodify/:id', (req, res) => {
  const id = req.params.id;
  const modifiedData = req.body.modifiedData;
  const modifiedOption = req.body.modifiedOption;

  // Validation
  if ((modifiedOption === 'sno' && isNaN(modifiedData)) ||
      (modifiedOption === 'bname' && !isNaN(modifiedData))) {
    res.status(400).send('Invalid input data');
    return;
  }

  let query = '';
  if (modifiedOption === 'bname') {
    query = 'UPDATE issues SET bname = ? WHERE id = ?';
  } else if (modifiedOption === 'idate') {
    query = 'UPDATE issues SET idate = ? WHERE id = ?';
  } else if (modifiedOption === 'sno') {
    query = 'UPDATE issues SET sno = ? WHERE id = ?';
  }

  pool.query(
    query,
    [modifiedData, id],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error updating data in database');
      } else {
        console.log('Data updated successfully');
        res.redirect('/itable');
      }
    }
  );
});



//<---RETURN---> 

app.get('/return', (req, res) => {
  res.sendFile(__dirname + '/public/return.html');
  
});

app.get('/rtable', (req, res) => {
  pool.query('SELECT * FROM returns', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving data from database');
    } else {
      res.render('rtable', { returns: results,modifiedOption: 'modifiedOption' });
    }
  });
});

app.post('/rdelete/:id', (req, res) => {
  const id = req.params.id;

  pool.query('DELETE FROM returns WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error deleting data from database');
    } else {
      // console.log(`Deleted issue with ID ${id}`);
      res.redirect('/rtable'); // redirect to the issues table page
    }
  });
});


app.post('/rmodify/:id', (req, res) => {
  const id = req.params.id;
  const modifiedData = req.body.modifiedData;
  const modifiedOption = req.body.modifiedOption;

  // Validation
  if ((modifiedOption === 'sno' && isNaN(modifiedData)) ||
      (modifiedOption === 'bname' && !isNaN(modifiedData))) {
    res.status(400).send('Invalid input data');
    return;
  }

  let query = '';
  if (modifiedOption === 'bname') {
    query = 'UPDATE returns SET bname = ? WHERE id = ?';
  } else if (modifiedOption === 'idate') {
    query = 'UPDATE returns SET idate = ? WHERE id = ?';
  } else if (modifiedOption === 'sno') {
    query = 'UPDATE returns SET sno = ? WHERE id = ?';
  }

  pool.query(
    query,
    [modifiedData, id],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error updating data in database');
      } else {
        console.log('Data updated successfully');
        res.redirect('/rtable');
      }
    }
  );
});

//<<---Contact--->

app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/public/contact.html');
  
});

app.get('/ctable', (req, res) => {
  pool.query('SELECT * FROM contacts', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving data from database');
    } else {
      res.render('ctable', { contacts: results,modifiedOption: 'modifiedOption' });
    }
  });
});

app.post('/cmodify/:id', (req, res) => {
  const id = req.params.id;
  const modifiedData = req.body.modifiedData;
  const modifiedOption = req.body.modifiedOption;

  // Validation
  if ((modifiedOption === 'name' && typeof modifiedData !== 'string') ||
    (modifiedOption === 'email' && !isValidEmail(modifiedData)) ||
    (modifiedOption === 'pno' && (!modifiedData || !isValidPhoneNumber(modifiedData)))) {
    res.status(400).send('Invalid input data');
    return;
  }

  let query = '';
  if (modifiedOption === 'name') {
    query = 'UPDATE contacts SET name = ? WHERE id = ?';
  } else if (modifiedOption === 'email') {
    query = 'UPDATE contacts SET email = ? WHERE id = ?';
  } else if (modifiedOption === 'pno') {
    query = 'UPDATE contacts SET pno = ? WHERE id = ?';
  }

  pool.query(
    query,
    [modifiedData, id],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error updating data in database');
      } else {
        console.log('Data updated successfully');
        res.redirect('/ctable');
      }
    }
  );
});

function isValidEmail(email) {
  // Regex pattern to match email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phoneNumber) {
  // Regex pattern to match phone number format
  const phoneRegex = /^(\+?\d{1,3})?[ -]?\d{10}$/;
  return phoneRegex.test(phoneNumber);
}



app.post('/cdelete/:id', (req, res) => {
  const id = req.params.id;

  pool.query('DELETE FROM contacts WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error deleting data from database');
    } else {
      // console.log(`Deleted issue with ID ${id}`);
      res.redirect('/ctable'); // redirect to the issues table page
    }
  });
});

// <---Member--->


app.get('/member', (req, res) => {
  res.sendFile(__dirname + '/public/Member.html');
  
});


app.get('/mtable', (req, res) => {
  pool.query('SELECT * FROM members', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving data from database');
    } else {
      res.render('mtable', { members: results,modifiedOption: 'modifiedOption' });
    }
  });
});

app.post('/mdelete/:id', (req, res) => {
  const id = req.params.id;

  pool.query('DELETE FROM members WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error deleting data from database');
    } else {
      // console.log(`Deleted issue with ID ${id}`);
      res.redirect('/mtable'); // redirect to the issues table page
    }
  });
});

app.post('/mmodify/:id', (req, res) => {
  const id = req.params.id;
  const modifiedData = req.body.modifiedData;
  const modifiedOption = req.body.modifiedOption;

  // Validation
  if ((modifiedOption === 'name' && typeof modifiedData !== 'string') ||
    (modifiedOption === 'type' && typeof modifiedData !== 'string')) {
    res.status(400).send('Invalid input data');
    return;
  }

  let query = '';
  if (modifiedOption === 'name') {
    query = 'UPDATE members SET name = ? WHERE id = ?';
  } else if (modifiedOption === 'start_date') {
    query = 'UPDATE members SET start_date = ? WHERE id = ?';
  } else if (modifiedOption === 'end_date') {
    query = 'UPDATE members SET end_date = ? WHERE id = ?';
  }else if (modifiedOption === 'type') {
    query = 'UPDATE members SET type = ? WHERE id = ?';
  }

  pool.query(
    query,
    [modifiedData, id],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error updating data in database');
      } else {
        console.log('Data updated successfully');
        res.redirect('/mtable');
      }
    }
  );
});

//<---FeedBack--->


app.get('/feedback', (req, res) => {
  res.sendFile(__dirname + '/public/feedback.html');
  
});

app.get('/ftable', (req, res) => {
  pool.query('SELECT * FROM feedback', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving data from database');
    } else {
      res.render('ftable', { feeds: results,modifiedOption: 'modifiedOption' });
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});











// Handle form submissions
app.post('/', (req, res) => {
  // Extract the form data from the request body
  const { fName, lName, email, password } = req.body;

  // Validate input fields
  if (!fName || !lName || !email || !password) {
    return res.status(400).send("<script>alert('Please fill in all fields in Sign Up');window.location.href='/'</script>");
  }

  if (password.length < 6) {
    return res.status(400).send("<script>alert('Password must be at least 6 characters long');window.location.href='/'</script>");
  }



  pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fName VARCHAR(255) NOT NULL,
    lName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )`, (error, results, fields) => {
    if (error) {
      console.error('Error creating table: ' + error.stack);
    } else {
      console.log('Table created successfully');
    }
  });

  // Insert the form data into the MySQL database
  pool.query(
    'INSERT INTO users (fName, lName, email, password) VALUES (?, ?, ?, ?)',
    [fName, lName, email, password],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error saving data to database');
      } else {
        console.log('Data saved successfully');
        // res.send('Data saved successfully');
        return res.status(400).send("<script>alert('Signup successfully');</script>");
      }
    }
  );




});

app.post('/login',(req,res)=>{
  // Extract the form data from the request body
  const {email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).send("<script>alert('Please fill in all fields in Login Form');window.location.href='/login'</script>");
  }

  pool.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send("<script>alert('Error checking login credentials');window.location.href='/login'</script>");
      } else if (results.length === 0) {
        // No user found with these credentials
        res.status(401).send("<script>alert('Invalid email or password');window.location.href='/login'</script>");
      } else {
        // User is authenticated, redirect to home page
        res.redirect('/home');
      }
    }
  );


});


app.post('/contact', (req, res) => {
  // Extract the form data from the request body
  const {name, pno,email } = req.body;

  // Validate input fields
  if (!name || !email || !pno) {
    return res.status(400).send("<script>alert('Please fill in all fields in Contact Form');</script>");
  }



  pool.query(`CREATE TABLE IF NOT EXISTS contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    pno VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
  )`, (error, results, fields) => {
    if (error) {
      console.error('Error creating table: ' + error.stack);
    } else {
      console.log('Table created successfully');
    }
  });

  // Insert the form data into the MySQL database
  pool.query(
    'INSERT INTO contacts (name, pno,email) VALUES (?, ?, ?)',
    [name, pno,email],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error saving data to database');
      } else {
        console.log('Data saved successfully');
        // res.send('Data saved successfully');
        // return res.status(400).send("<script>alert('Contact saved successfully in Database');</script>");
        res.sendFile(__dirname + '/public/contact.html');
      }
    }
  );


  // return res.send("<script>alert('Contact saved successfully in Database');/script>");

});



app.post('/issue', (req, res) => {
  // Extract the form data from the request body
  const {idate, bname,sno } = req.body;

  // Validate input fields
  if (!idate||!bname||!sno) {
    return res.status(400).send("<script>alert('Please fill in all fields in Issue Form');</script>");
  }



  pool.query(`CREATE TABLE IF NOT EXISTS issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idate DATE NOT NULL,
    bname VARCHAR(255) NOT NULL,
    sno INTEGER NOT NULL
  )`, (error, results, fields) => {
    if (error) {
      console.error('Error creating table: ' + error.stack);
    } else {
      console.log('Table created successfully');
    }
  });

  // Insert the form data into the MySQL database
  pool.query(
    'INSERT INTO issues (idate, bname,sno) VALUES (?, ?, ?)',
    [idate, bname,sno],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error saving data to database');
      } else {
        console.log('Data saved successfully');
        // res.send('Data saved successfully');
        // return res.status(400).send("<script>alert('Contact saved successfully in Database');</script>");
        res.sendFile(__dirname + '/public/issue.html');
      }
    }
  );


  // return res.send("<script>alert('Contact saved successfully in Database');/script>");

});


app.post('/return', (req, res) => {
  // Extract the form data from the request body
  const {rdate, bname,sno } = req.body;

  // Validate input fields
  if (!rdate||!bname||!sno) {
    return res.status(400).send("<script>alert('Please fill in all fields in Return Form');</script>");
  }



  pool.query(`CREATE TABLE IF NOT EXISTS returns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rdate DATE NOT NULL,
    bname VARCHAR(255) NOT NULL,
    sno INTEGER NOT NULL
  )`, (error, results, fields) => {
    if (error) {
      console.error('Error creating table: ' + error.stack);
    } else {
      console.log('Table created successfully');
    }
  });

  // Insert the form data into the MySQL database
  pool.query(
    'INSERT INTO returns (rdate, bname,sno) VALUES (?, ?, ?)',
    [rdate, bname,sno],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error saving data to database');
      } else {
        console.log('Data saved successfully');
        // res.send('Data saved successfully');
        // return res.status(400).send("<script>alert('Contact saved successfully in Database');</script>");
        res.sendFile(__dirname + '/public/return.html');
      }
    }
  );


  // return res.send("<script>alert('Contact saved successfully in Database');/script>");

});





app.post('/member', (req, res) => {
  // Extract the form data from the request body
  const {name,start_date,end_date,type} = req.body;

  // Validate input fields
  if (!name||!start_date||!end_date||!type) {
    return res.status(400).send("<script>alert('Please fill in all fields in Return Form');</script>");
  }



  pool.query(`CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type VARCHAR(255) NOT NULL
  )`, (error, results, fields) => {
    if (error) {
      console.error('Error creating table: ' + error.stack);
    } else {
      console.log('Table created successfully');
    }
  });

  // Insert the form data into the MySQL database
  pool.query(
    'INSERT INTO members (name,start_date,end_date,type) VALUES (?, ?, ?,?)',
    [name,start_date,end_date,type],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error saving data to database');
      } else {
        console.log('Data saved successfully');
        // res.send('Data saved successfully');
        // return res.status(400).send("<script>alert('Contact saved successfully in Database');</script>");
        res.sendFile(__dirname + '/public/Member.html');
      }
    }
  );


  // return res.send("<script>alert('Contact saved successfully in Database');/script>");

});

app.post('/feedback', (req, res) => {
  // Extract the form data from the request body
  const {name,email,feedback} = req.body;

  // Validate input fields
  if (!name||!email||!feedback) {
    return res.status(400).send("<script>alert('Please fill in all fields in Feedback Form');</script>");
  }



  pool.query(`CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    feedback VARCHAR(255) NOT NULL
  )`, (error, results, fields) => {
    if (error) {
      console.error('Error creating table: ' + error.stack);
    } else {
      console.log('Table created successfully');
    }
  });

  // Insert the form data into the MySQL database
  pool.query(
    'INSERT INTO feedback (name,email,feedback) VALUES (?, ?, ?)',
    [name,email,feedback],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error saving data to database');
      } else {
        console.log('Data saved successfully');
        // res.send('Data saved successfully');
        // return res.status(400).send("<script>alert('Contact saved successfully in Database');</script>");
        res.sendFile(__dirname + '/public/feedback.html');
      }
    }
  );


  // return res.send("<script>alert('Contact saved successfully in Database');/script>");

});

// Start the server
app.listen(2003, () => {
  console.log('Server started on port 2003');
});
