const cors = require('cors');
const express = require('express');
const app = express();
// const port = process.env.PORT || 3000;
const port = 3000;
const { Gender } = require('./interfaces/gender');
const { MongoClient, ObjectID } = require('mongodb');
const dbUrl = 'mongodb://localhost:27017/PoliceDoc';

// var corsOptions = {
//     origin: true,
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
//     };

app.use(cors());

// app.use(function( req, res, next ) {
//     res.header("Access-Control-Allow-Origin", req.headers.origin);
//     res.header("Access-Control-Allow-Headers", "x-requested-with, content-type");
//     res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.header("Access-Control-Max-Age", "1000000000");
//     // intercept OPTIONS method if ('OPTIONS' == req.method) { res.send(200); } else { next(); } 
// });

app.use(express.json());

MongoClient.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
    if(err){
        return console.log('Unable to connect to MongoDB');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('PoliceDoc');

    app.post('/api/thieves', (req, res) => { 
    
        if(!req.body.name || req.body.name.length < 3) {
            // 400 Bad request
            res.status(400).send('Name is required and should be minimum 3 characters');
            return;
        }

        const thief = {
            id: req.body.id,
            name: req.body.name,
            gender: req.body.gender,
            dob: req.body.date,
            addresses: req.body.addresses,
            stateOfConviction: req.body.stateOfConviction
        };

        //Add data
        db.collection('Thieves').insertOne(thief,(err, result) => {
            if(err){
                return console.log("Unable to insert todo", err);
            }
            console.log(JSON.stringify(result.ops, undefined, 2));
        });

        res.send(thief);  
    });

    //Send data on request by fetching from database
    app.get('/api/thieves', (req, res) => {
        // let thieves = [];
        db.collection('Thieves').find().toArray().then((docs) => {
            console.log(`Thieves:`);
            res.send(docs);
            console.log(JSON.stringify(docs, undefined, 2));
        }, (err) => {
            console.log("Unable to fetch todos", err);
        });
        // res.send(thieves);
    });

    // //Add data
    // db.collection('Thieves').insertOne({
    //     name: 'Cold Stone',
    //     id: '246',
    //     gender: Gender.female, 
    //     dob: new Date(123456789),
    //     addresses:[ 
    //         {
    //             house: 'Balaji Elegance',
    //             street: 'Ring road',
    //             landmark: 'Lake View',
    //             city: 'Bhubaneshwar',
    //             pocode: 395001,
    //             state: 'Odisha',
    //             country: 'India'
    //         },
    //         {   
    //             house: 'Pragati Nagar',
    //             street: 'Jakatnaka',
    //             landmark: 'Lake View',
    //             city: 'Bangalore',
    //             pocode: 395007,
    //             state: 'Karnataka',
    //             country: 'India'
    //         },
    //         {
    //             house: 'Kings Palace',
    //             street: 'KIIT Road',
    //             landmark: 'Campus 6, KIIT',
    //             city: 'Guwahati',
    //             pocode: 751024,
    //             state: 'Assam',
    //             country: 'India'
    //         }
    //     ],
    //     stateOfConviction: false
    // },(err, result) => {
    //     if(err){
    //         return console.log("Unable to insert todo", err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    //Close the database
    client.close();
});



app.listen(port, () => {
    console.log(`Listening on ${port}`);
});