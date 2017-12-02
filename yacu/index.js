// Setup basic express server
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
//var io = require('../..')(server);
////////////////////INICIO////////////////////
var io = require('socket.io')(server);
///////////////////  FIN  ///////////////////
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
////////////////////INICIO////////////////////
var usernames = {};
///////////////////  FIN  ///////////////////
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


app  .post('/loginValidar',function(req,res){
    if(req.body.use=="admin"&&req.body.pass=="admin"){
      console.log("logeado")
      res.sendFile(__dirname+'/public/yacuAdmin.html');
    }else{
      res.redirect("/error");
      res.sendFile(__dirname+'/public/index.html');
    }
  })

  ////////////////////INICIO////////////////////
  socket.on('exists user', function (username, cb){
    if( usernames.hasOwnProperty(username) )
    {
      console.log('User already exists!');
      cb(false);
    }
    else
    {
      console.log('User don\'t exist!');
      cb(true);
    }
  });
  ///////////////////  FIN  ///////////////////

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
app //para que vean los clientes o espectadores
  .get('/',(req,res)=>{
    res.sendFile(`${publicDir}/videoC.html`)
  })
  //lo que hace el servidor para enviar a los clientes
  .get('/streaming',(req,res)=>{
    res.sendFile(`${publicDir}/videoS.html`)
  })
//crear imagenes para hacer video
io.on('connection',(socket)=>{
  socket.on('streaming',(image)=>{
    io.emit('play stream',image)
    //console.log(image)
  })
})
//crear imagenes para hacer video
io.on('connection',(socket)=>{
  socket.on('streaming',(image)=>{
    io.emit('play stream',image)
    //console.log(image)
  })
})
