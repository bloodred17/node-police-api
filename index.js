const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// const port = 3000;
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
        db.collection('Thieves').find().toArray().then((docs) => {
            console.log(`Thieves:`);
            res.send(docs);
            console.log(JSON.stringify(docs, undefined, 2));
        }, (err) => {
            console.log("Unable to fetch ", err);
        });
    });

    app.get('/api/thieves/:id', (req, res) => {
        const _id = req.params.id;
        db.collection('Thieves').find({_id: new ObjectID(_id)}).toArray().then((docs) => {
            console.log(`Thieves:`);
            res.send(docs);
            console.log(JSON.stringify(docs, undefined, 2));
        }, (err) => {
            console.log("Unable to fetch ", err);
        });
    });

    //Delete request
    app.delete('/api/thieves/:id', (req, res) => {
        const _id = req.params.id;
        db.collection('Thieves').findOneAndDelete({_id: new ObjectID(_id)}).then((doc) => {
            console.log(doc);
            res.send(doc);
        }, (err) => {
            console.log('Unable to fetch ', err);
        });
        // db.collection('Thieves').deleteOne({_id: new ObjectID(_id)}).then((result) => {
        //     console.log(`Specific user deleted: ${(result.result.n)?true:false}`);
        //     res.send(result);
        // }, (err) => {
        //     console.log('Unable to fetch ', err);
        // });
    });

    //Update request
    app.put('/api/thieves/:id/', (req, res) => {
        const id = req.params.id;
        const update = {};
        for(let key in req.body){
            update[key] = req.body[key];
        }
        db.collection('Thieves').findOneAndUpdate({_id: new ObjectID(id)}, {$set: update}, {
            returnOriginal: false
        }).then((result) => {
            console.log(result);
            res.send(result);
        }, (err) => {
            console.log("Unable to fetch ", err);
        });
    });
    

    //Close the database
    client.close();
});


app.listen(port, () => {
    console.log(`Listening on ${port}`);
});