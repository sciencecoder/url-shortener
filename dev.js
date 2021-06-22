require('dotenv').config();
var express = require('express');
var { MongoClient, ObjectID } = require('mongodb');
var server = express();

var dbUri =
  process.env.DATABASE_URL;

var reg1 = /\w{4,5}:\/\/\w+.\w+/;

server.use(express.static('view'));

function generateShortUrl() {
  return Math.floor(Math.random() * 5000 + 1);
}

async function addDocument(baseURL, url, client) {
  try {
    const docRes = await client
      .db()
      .collection('urldb')
      .insert({
        original_url: url,
        short_url: baseURL + generateShortUrl(),
      });
    return docRes;
  } catch (e) {
    console.error(e);
  }
}
async function findDocument(query, client) {
  //refactor: instead of passing url, pass full query object

  const options = { original_url: 1, short_url: 1, _id: 0 };
  var doc;
  try {
    doc = await client.db().collection('urldb').findOne(query, options);
  } catch (e) {
    console.error(e);
  } finally {
    console.log('line 45 at findDocument finally', doc);
    return doc;
  }
}

server.get('/new/*', function (req, res) {
  const originalUrl = req.params[0];
  //refactor note: add baseurl to req.params at base request for resuability
  const baseURL = 'http://' + req.headers.host + '/';

  if (reg1.test(originalUrl)) {
    MongoClient.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        findDocument({ original_url: originalUrl }, client).then((doc) => {
          if (doc) {
            res.send(doc);
          } else {
            //maybe refactor to pass  monogdb formatted document rather than just values
            addDocument(baseURL, originalUrl, client).then((docRes) => {
              res.send(docRes.ops[0]);
            });
          }
        });
      })
      .catch((err) => console.error(err));
  } else {
    res.send('{"error": "Invalid url"}');
  }
});

server.get('/:shortUrl', function (req, res) {
  const shortUrl = req.params.shortUrl;
  const baseUrl = 'http://' + req.headers.host + '/';
  const fullShortUrl = baseUrl + shortUrl;

  //Longest unslove bug: 4 hours. I didn't know dbUri was pointing to wrong database /short_urls rather than the correct /urldb that's why All my find queries returned null
  //Oh what time I have wasted for lack of care. looking at each and every variable led me the hard and long way.

  MongoClient.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((client) => {
    findDocument({ short_url: fullShortUrl }, client).then((doc) => {
      if (doc) {
        res.redirect(doc.original_url);
      } else {
        res.status(404);
        res.end('resource not found');
      }
    });
  });
});
server.listen(process.env.PORT || 3000, process.env.IP, function (err, res) {
  if (err) console.log('Error in server setup');
  console.log('Server listening on Port', process.env.PORT);
});
console.log('dev.js file ran successfully');
