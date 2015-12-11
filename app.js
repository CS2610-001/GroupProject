var express = require('express')
var exphbs = require('express-handlebars')
var request = require('request')
var querystring = require('querystring')
var bodyParser = require('body-parser')
var session = require('express-session')
var assert = require('assert')
var cfg = require('./config')

var db = require('./db')
var Users = require('./models/users')

var app = express()

app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlebars');

app.use(session({
  cookieName: 'session',
  secret: 'sdfaetsdgahytre67890fsdfsfsafasfa',
  resave: false,
  saveUninitialized: true
}))

app.use(bodyParser.urlencoded({ extended: false }))

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


app.get('/dashboard', function(req, res, next){
  var options = {
    url: 'https://api.instagram.com/v1/users/self/feed?access_token=' + req.session.access_token,
  }
  request.get(options, function(error, response, body){
    try {
    var feed = JSON.parse(body)
    if(feed.meta.code > 200){
      return next(feed.meta.error_message);
    }
  }
  catch(err){
    return next(err)
  }

    res.render('dashboard', {
      feed:feed.data,
      userName: req.session.userName
    })
  })
})

app.get('/saved-searches', function(req, res){
  res.render('saved-searches',{
    userName: req.session.userName
  })
})

app.get('/', function(req, res){
  res.redirect('/login')
})

app.post('/search', function(req, res, next){
  var query = req.body.query
  var options = {
    url: 'https://api.instagram.com/v1/tags/'+ query + '/media/recent?access_token=' + req.session.access_token,
  }

  request.get(options, function(error, response, body){
    try {
      var feed = JSON.parse(body)
      if(feed.meta.code > 200){
        return next(feed.meta.error_message);
      }
    }
    catch(err) {
      return next(err)
    }

    res.render('search-results', {
      feed:feed.data,
      userName: req.session.userName,
      search_tag: query
    })
  })
})

app.get('/login', function(req, res){
  res.render('index')
})

app.post('/')

app.get('/index', function(req, res){
  res.render('index')
})

app.get('/profile', function(req, res){
  var options = {
    url: 'https://api.instagram.com/v1/users/self/feed?access_token=' + req.session.access_token,
  }

  if (req.session.userID) {
    //Find user
    Users.find(req.session.userID, function(document) {
      if (!document) return res.redirect('/')
      //Render the update view
      res.render('profile', {
        user: document

      })
    })
  } else {
    res.redirect('/')
  }
})

app.post('/profile', function(req, res){
  var query = req.body
  Users.update(query, function(){
    res.redirect('/profile')
  })

})
app.get('/auth/finalize', function(req, res, next){
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
    console.log(data);
    var user = data.user;
    user._id = user.id;
    delete user.id;

      req.session.access_token = data.access_token
      req.session.userName = data.user.full_name
      Users.find(user._id, function(document){
        // req.session.message = "It Worked!"
        // res.redirect('/profile');
        if(!document){
          Users.insert(data.user, function(result) {
            console.log(result);
            req.session.userID = result.ops[0].id
            res.redirect('/dashboard');
          })
        } else {
          req.session.userID = user._id;
          res.redirect('/dashboard');
        }
      })

  })
})


app.use(function(req, res){
    res.send(404);
  })

app.use(function(err, req, res, next) {

    res.status(err.status || 500);
    res.render('error', {
        message: err,
        error: {}
    });
})

db.connect('mongodb://cs2610:testing@ds045704.mongolab.com:45704/instagram-app', function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
    app.listen(3000, function() {
      console.log('Listening on port 3000...')
    })
  }
})
