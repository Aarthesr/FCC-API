require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
let inputurl;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
let mongoose = require('mongoose');
let uri = "mongodb+srv://aarthe_s_r:"+process.env.MONGO_DB+"@cluster0.2kltb.mongodb.net/url_shortner?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/* create url schema */

let urlschema = new mongoose.Schema({
  original : {type: String, required : true},
  short : {type : Number}
})

let urlmodel = mongoose.model('URL',urlschema);

/* getting URL input parameter */

let bodyparser = require('body-parser')
let responseObj = {}

app.post('/api/shorturl', bodyparser.urlencoded({extended : false}), (request,response) => {
  inputurl = request.body.url
  let urlexp = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
  if(!inputurl.match(urlexp)){
    response.json({error : 'Invalid URl'})
    return
  }
  responseObj['original-url'] = inputurl
  
  // response.json(responseObj)


let ipshort = 1;
urlmodel
  .findOne({})
  .sort({short: "desc"})
  .exec((error,result) =>{
  if(!error && result != undefined){
    ipshort = result.short + 1;
  }
  if(!error){
    urlmodel.findOneAndUpdate(
    {original : inputurl},
    {original : inputurl, short: ipshort},
      {new : true, upsert : true},
      (error,savedurl) =>{
        if(!error){
          responseObj["short_url"] = savedurl.short;
          response.json(responseObj);
        }
      }
    );
  }
});
})


app.get('/api/shorturl/:input',(request,response) =>{
  let input = request.params.input
  urlmodel.findOne({short:input}, (error,result) => {
    if(!error && result != undefined){
      response.redirect(result.original)
    }
    else{
      response.json({error: 'URL does not exist.'})
    }
  })
})