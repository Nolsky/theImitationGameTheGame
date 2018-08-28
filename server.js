var net = require('net');
var PORT = 8124;
var IP = 'localhost';
var sockets = [];
var botNames = [];
var users = {};
var roundPlaying = false;
var botsRemaining = 0;
var gamesDuration = 0;
// var connectedUsers = {};

//RED WORDS console.log('\x1b[31m%s\x1b[0m: ', 'words');

var server = net.createServer(function(socket) {
  console.log('client connected USER ID:' + socket._handle.fd);
  sockets.push(socket);
  var userID = socket._handle.fd;
  sockets[sockets.length - 1].userID = userID;
  sockets[sockets.length - 1].write(
    'WELCOME TO THE IMITATION GAME (the game)! \n ' +
    'Connected as User: ' + userID + ' \n ' +
    'To change your User ID Type \'RENAME <new name here>\' \n ' +
    'Names are shuffled when games are in progress \n ' +
    'Begin a new game by saying \'NEWGAME\'');

  socket.on('data', function(data) {
    data = data.toString();
    if (data.substring(0, 13) == 'said: RENAME ') {
      var newname = data.slice( 13 ).replace('\n', '');
      let nameTaken = false;
      sockets.map(function(c,i,a) {
        if (c.userID !== void(0)) {
          if (c.userID.toString().toLowerCase() === newname.toLowerCase()){
            nameTaken = true;
          }
        }
      });
      if (newname.toLowerCase().indexOf('admin') !== -1) {
        sockets[sockets.indexOf(socket)].userID = 'N00B';
        socket.write('SYSTEM: Names containing \'admin\' are not allowed. ');
      } else if(nameTaken) {
        socket.write('SYSTEM: Sorry that name is taken. Please try again');
      } else {
        sockets[sockets.indexOf(socket)].userID = newname;
        userID = newname;
      }
      socket.write('SYSTEM: Rename successfully set. Your new name is ' + userID);
    } else if (data.substring(0, 13) == 'said: NEWGAME') {
      botsRemaining = 5;
      gamesDuration = 0;
      roundPlaying = setInterval(gameLogic, 1000);
    } else {
      for (var i = 0; i < sockets.length; i++ ) {
        if ( sockets[i] !== socket ) {
          sockets[i].write('USER: ' + userID + ' ' + data.toString());
        }
      }
    }

  });

  var gameLogic = function() {
    if (gamesDuration === 1) {
      console.log('Running game logic')
    }
    gamesDuration++;
    if (Math.floor(Math.random() * 2) === 1) {
      botsRemaining--;
    }
    if (botsRemaining === 0) {
      sockets.map(function(c, i, a) {
        c.write('SYSTEM: GAME OVER');
      });
      clearInterval(roundPlaying);
      roundPlaying = false;
    }
  };

  process.stdin.on('data', function(data) {
    var adminWords = data.toString();
    if(adminWords.substring(0, 3).toLowerCase() === 'cmd'){
      console.log(adminWords);
      console.log(socket);
    } else {
      socket.write('[ADMIN]: ' + adminWords);
    }
  });

  socket.on('end', function() {
    console.log('client disconnected USER: ' + userID);
    var i = sockets.indexOf(socket);
    sockets.splice(i, 1);
    for ( i = 0; i < sockets.length; i++ ) {
      if ( sockets[i] === socket ) {
        sockets[i].write('USER: ' + userID + ' has left the channel');
      }
    }

  });

});

server.listen(PORT, function() {
  console.log('server bound to port:', PORT);
});

