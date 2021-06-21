require('dotenv').config();
var express = require('express');
const {MongoClient} = require('mongodb');
const mongoDB = require('mongodb')
var server = express();


MongoClient.connect('mongodb+srv://adam:admin@cluster0.vvlhg.mongodb.net/urldb?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
  .then(client => {
    //Returns pending promise
    // console.log("Databases:", client.db().admin().listDatabases());
   const query = {short_url: 'http://localhost:3000/373'}
    return client
    .db()
    .collection('urldb')
    .findOne(query, {});
  }).then(doc => {
    console.log(doc);
  })
 
  .catch(err => console.error(err));


