require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
const dns = require('dns');
//const URL = require('url');

  
// Calling dns.lookup() for hostname geeksforgeeks.org
// and displaying them in console as a callback
/*const SQL = require('sql.js');
const db = new SQL.Database();*/
const initSqlJs = require('sql.js');
initSqlJs().then(function(SQL){
  const db = new SQL.Database();
  //...


db.run("CREATE TABLE IF NOT EXISTS urltab (id INTEGER PRIMARY KEY AUTOINCREMENT, original_url STRING);")
const getByURL = db.prepare("SELECT * FROM urltab WHERE original_url=:o_url");
const getById = db.prepare("SELECT * FROM urltab WHERE id=:o_id");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/api/shorturl',bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', function(req,res){
  console.log(`post url: ${req.body.url}`);

  const url = new URL(req.body.url.toString());
  const hostname = url.hostname;
  
  dns.lookup(hostname, {family:4}, (err, address, family) =>{
    if(err){
      res.json({error: 'invalid url'});
    }
    else{
      var res_id = getByURL.getAsObject({':o_url' : req.body.url});
      if(res_id.id == null){
        db.run(`INSERT INTO urltab VALUES (null, '${req.body.url}');`);
        res_id = getByURL.getAsObject({':o_url' : req.body.url});
      }
      console.log(`address:${address}`);
      console.log(`shorturl: ${res_id.id}`);

      res.json({original_url:req.body.url, short_url:res_id.id});
    }
  });  
});



app.get('/api/shorturl/:id', (req, res)=>{
  const res_url = getById.getAsObject({':o_id' : req.params.id});
  console.log(`req id : ${req.params.id} req url:  ${res_url.original_url}`);
  if(res_url.original_url == null){
    res.json({error:'invalid url'});
  }
  else{
    res.redirect(res_url.original_url);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
});