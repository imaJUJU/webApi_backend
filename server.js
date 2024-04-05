// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http')
const socketio = require('socket.io');

// Create an instance of the Express application
const app = express();

const connection = mysql.createConnection({
    port: 17430,
    host: 'mysql-28840110-imanthioshadhi55-aace.a.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_mtSsqSnaQ0BiEQuIoDw',
    database: 'defaultdb'
  });
  
  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database: ', err);
      return;
    }
    console.log('Connected to MySQL database');
  });
  


// app.use(bodyParser)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

const httpServer = http.createServer(app);
const io = socketio(httpServer,{
  cors: {
    origin: ["http://127.0.0.1:3000","http://127.0.0.1:4000"],
    methods: ["GET", "POST"]
  }
});

app.get('/loadData', (req, res) => {
    const selectQuery = 'SELECT * FROM readings order by dateTime DESC limit 25';

    
    connection.query(selectQuery, (error, results, fields) => {
        if (error) {
            console.error('Error retrieving data from MySQL database: ', error);
            res.status(500).send('Error retrieving data from the database');
            return;
        }

        results.sort((a, b) => a.WS_id - b.WS_id);
        res.json(results);
    });
});


// Define a route to handle POST requests to '/api/data'
app.post('/saveData', async(req, res) => {
    console.log(req.body);
    let weatherDataArray = req.body ? req.body : []

    for (const district of weatherDataArray) {
        const insertQuery = 'INSERT INTO readings (dateTime, temperature,humidity, airPressure, WS_id ) VALUES (?, ?, ?, ?, ?)';
        const values = [new Date(district.dateTime), district.temperature, district.humidity, district.airPressure, district.districtId ];

        
       connection.query(insertQuery, values, (error, results, fields) => {
            if (error) {
              console.error('Error saving data to MySQL database: ', error);
              return;
            }
            console.log('Data saved successfully');
          });

    }

    const selectQuery = 'SELECT * FROM readings order by dateTime DESC limit 25';

     connection.query(selectQuery, (error, results, fields) => {
        if (error) {
            console.error('Error retrieving data from MySQL database: ', error);
            res.status(500).send('Error retrieving data from the database');
            return;
        }

        results.sort((a, b) => a.WS_id - b.WS_id);
        io.emit("wD", results);
        console.log("data emitted");
        

    });

    res.send('Success');
    
});

const port = 3030;
httpServer.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});
