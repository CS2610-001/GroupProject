var express = require('express')
var exphbs = require('express-handlebars')
var request = require('request')
var querystring = require('querystring')
var session = require('express-session')
var cfg = require('./config')

var app = express()

app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlebars');

app.use(session({
  cookieName: 'session',
  secret: 'sdfaetsdgahytre67890fsdfsfsafasfa',
  resave: false,
  saveUninitialized: true
}))

// app.use()

app.use(express.static('public/css'));

app.get('/authorize', function(req, res){
  var qs = {
    client_id: cfg.client_id,
    redirect_uri: cfg.redirect_uri,
    response_type: 'code'
  }

  var query = querystring.stringify(qs)

  var url = 'https://api.instagram.com/oauth/authorize/?' + query

  res.redirect(url)
})



app.get('/dashboard', function(req, res){
  var options = {
    url: 'https://api.instagram.com/v1/users/self/feed?access_token=' + req.session.access_token,
  }
  request.get(options, function(error, response, body){
    var feed = JSON.parse(body)

    res.render('dashboard', {
      feed:feed.data
    })
  })
})

app.get('/', function(req, res){
  res.redirect('/login')
})

app.get('/login', function(req, res){
  res.render('index')
})

app.get('/index', function(req, res){
  res.render('index')
})
app.get('/profile', function(req, res){
  res.render('profile')
})

app.get('/auth/finalize', function(req, res){
  var post_data = {
    client_id: cfg.client_id,
    client_secret: cfg.client_secret,
    redirect_uri: cfg.redirect_uri,
    grant_type: 'authorization_code',
    code: req.query.code
  }

  var options = {
    url: 'https://api.instagram.com/oauth/access_token',
    form: post_data
  }

  request.post(options, function(error, response, body){
    var data = JSON.parse(body)
    req.session.access_token = data.access_token
    res.redirect('/dashboard')
  })
})

app.use(function(req, res){
    res.send(404);
  });
app.listen(3000);
