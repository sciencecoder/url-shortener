require('dotenv').config();
const express = require('express');
const {MongoClient} = require('mongodb');
const server = express();

var dbUrl = 'mongodb+srv://adam:admin@cluster0.vvlhg.mongodb.net/urldb?retryWrites=true&w=majority';
var reg1 = /\w{4,5}:\/\/\w+.\w+/;

server.use(express.static('view'));

function generateShortUrl() {
  return Math.floor((Math.random() * 5000) + 1);
}

server.get('/:shortUrl', function(req, res) {
  var url = req.params.shortUrl;
  var fullShortUrl = 'https://miniurl.herokuapp.com/' + url;
  mongoClient.connect(dbUrl, function(err, db) {
    if(err) throw err;
    
    db.collection('urldb').find({"short_url": fullShortUrl}).toArray(function(error, docs) {
      if(error) throw error;
      if(docs[0]) {
        res.redirect(docs[0].original_url);
      } else {
        res.end();
      }
    });
    db.close();
  });
});

server.get('/new/*', function(req, res) {
  var originalUrl = req.params[0];
  
  function add_document(url) {
    mongoClient.connect(dbUrl, function(err, db) {
    if(err) throw err;
  
    db.collection('urldb').insertOne({
      original_url: url, 
      short_url: 'https://miniurl.herokuapp.com/' + generateShortUrl()
    }, function(err, response) {
      if(err) throw err;
      res.send(response.ops[0]);
    });
    db.close();
  });
  }

  if(reg1.test(originalUrl)) {
    mongoClient.connect(dbUrl, function(err, db) {
      if(err) throw err;
      db.collection('urldb').find({"original_url": originalUrl}, {"original_url": 1, "short_url": 1, "_id": 0}).toArray(function(err, docs) {
        if(err) throw err;
        if(docs.length === 0) {
          add_document(originalUrl); 
        } else {
          res.send(JSON.stringify(docs[0]));
        }
      });
      
      db.close();
    });
 } else {
   res.send('{"error": "Invalid url"}');
 }
  
});

server.listen((process.env.PORT || 3000), process.env.IP, function(err, res){
  if (err) console.log("Error in server setup")
  console.log("Server listening on Port", process.env.PORT);
});
console.log('programm.js file ran successfully')