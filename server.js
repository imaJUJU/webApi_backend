// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
// Create an instance of the Express application
const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mang#301',
    database: 'weather_api'
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
        console.log(results);
    });

    res.send('Success');
    
});


const port = process.env.PORT || 3030;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
