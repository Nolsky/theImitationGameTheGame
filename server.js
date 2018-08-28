var net = require('net');
var PORT = 8124;
var IP = 'localhost';
var sockets = [];
var botNames = ['Adam', 'Alec', 'Allan', 'Aman', 'Anson', 'Benny', 'Burke', 'Chloe', 'Christian', 'David', 'Diego', 'Dilsher', 'Enji', 'Gaurav', 'Greg', 'Jae', 'John', 'Jordan', 'Joyce', 'JP', 'Justin', 'Ken', 'Kony', 'Kristie-Desiree', 'Michael', 'Nils', 'Nolan', 'Nolsky', 'Ricardo', 'Richelle', 'Ringo', 'Servio', 'Shane', 'Shayan', 'Steven', 'Thu', 'Xizhou', 'Zach', 'Abel', 'Alan', 'Vincent', 'Andrew', 'Arjun', 'Brandon', 'Celeste', 'Charles', 'Charlie', 'Chris', 'Eddie', 'James', 'Jenn', 'Jessie', 'Jun', 'Lisette', 'Matt', 'Michelle', 'Nicholas', 'Nick', 'Rebecca', 'Richard', 'Roy', 'Ruby', 'Sonia', 'Spencer', 'Tinh', 'Trey', 'Gwynn', 'Liz', 'Fred', 'Sophie', 'Beth', 'Joel', 'Mylani', 'Jonathan', 'Alex', 'Anoop', 'Jane', 'Julia', 'Luke', 'Zachary', 'Meesh', 'Ash', 'Blake', 'Mary', 'Taylor', 'Tony', 'Mia', 'Marcus', 'Spectator'];
var users = {};
var roundPlaying = false;
var unusedNames = [];
var botsRemaining = 0;
var bots = {};
var botArr = [];
var gamesDuration = 0;

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

  if (!!roundPlaying) {
    socket.botId = unusedNames.splice(Math.floor(Math.random() * unusedNames.length), 1);
    bots[socket.botId] = socket;
    socket.write('SYSTEM: You\'ve joined mid round, your bot name is: ' + socket.botId);
  }

  socket.on('data', function(data) {
    data = data.toString();
    if (data.substring(0, 13) == 'said: RENAME ') {
      var newname = data.slice( 13 ).replace('\n', '').replace(' ');
      if (newname.toLowerCase().indexOf('admin') !== -1) {
        sockets[sockets.indexOf(socket)].userID = 'N00B';
        socket.write('SYSTEM: Names containing \'admin\' are not allowed. ');
      } else if(users[newname.toLowerCase()] !== void(0)) {
        socket.write('SYSTEM: Sorry that name is taken. Please try again');
      } else {
        sockets[sockets.indexOf(socket)].userID = newname;
        users[newname.toLowerCase()] = socket;
        userID = newname;
        socket.write('Rename successfully set. Your new name is ' + userID + ' BOT \n');
      }
    } else if (data.substring(0, 13) == 'said: NEWGAME') {
      if (!roundPlaying) {
        bots = {};
        unusedNames = [...botNames];
        for (key in users) {
          unusedNames.push(key);
        }
        sockets.map(function(c,i,a) {
          c.botId = unusedNames.splice(Math.floor(Math.random() * unusedNames.length), 1);
          bots[c.botId] = c;
        });
        gamesDuration = 0;
        roundPlaying = setInterval(gameLogic, 1000);
      } else {
        socket.write('SYSTEM: A game is already going!');
      }
    } else if (data.substring(0, 7) == 'said: ~' || data.substring(0, 13)  == 'said: ACCUSE:' || data.substring(0, 10) == 'said: ACC!') {
      if (!roundPlaying) {
        socket.write('SYSTEM: A game is not currently running, to begin a new game type NEWGAME');
      } else {
        data = data.replace('said: ', '');
        var accusedUser = '';
        if (data.substring(0, 1) == '~') {
          accusedUser = data.slice(1).substring(0, data.length - 2);
        } else if (data.substring(0, 4) == 'ACC!') {
          accusedUser = data.slice(4).substring(0, data.length - 5);
        } else if (data.substring(0, 7) == 'ACCUSE:') {
          accusedUser = data.slice(7).substring(0, data.length - 8);
        } else {
          console.log('SOMETHING WENT WRONG WITH ACCUSATION SYSTEM');
        }
        console.log('User:', userID, 'accused', accusedUser);

        let foundBotIndex = false;
        for (var i = 0; i < botArr.length; i++) {
          if (botArr[i] == accusedUser) {
            foundBotIndex = i;
          } else {
            if (i === botArr.length - 1 && foundBotIndex) {
              socket.write('NO BOT FOUND BY ACCUSED NAME: ' + accusedUser + '... :( try again?');
            }
          }
        }

        if(bots[accusedUser] !== void(0)) {
          socket.write('SYSTEM: WRONG: You just accused:' + bots[accusedUser].userID);
        } else if (foundBotIndex !== false) {
          botArr.splice(foundBotIndex, 1);
          botsRemaining--;
          sockets.map((c,i,a) => {
            c.write(userID + ' JUST FOUND ' + accusedUser + ' BOT');
          });
        } else {
          console.log('ERR: ', botArr, accusedUser, ' Unknown issue');
        }
      }

    } else if (!!roundPlaying) {
      for (var i = 0; i < sockets.length; i++ ) {
        if ( sockets[i] !== socket ) {
          sockets[i].write('USER: ' + socket.botId + ' BOT ' + data.toString());
        }
      }
    } else {
      for (var i = 0; i < sockets.length; i++ ) {
        if ( sockets[i] !== socket ) {
          sockets[i].write('USER: ' + userID + ' ' + data.toString());
        }
      }
    }

  });

  var gameLogic = function() {
    if (gamesDuration === 0 ) {
      let botCount = Math.ceil(Math.random() * 5 + sockets.length);
      for (var i = 0; i < botCount; i++) {
        botArr.push(unusedNames.splice(Math.floor(Math.random() * unusedNames.length), 1));
      }
      botsRemaining = botCount;
    }
    if (gamesDuration === 1) {
      console.log('Running game logic');
      sockets.map(function(c,i,a){
        c.write('SYSTEM: STARTING NEW GAME');
        c.write('To accuse a player use the (Tilde) ~<name>, ACCUSE:<name>, or ACC!<name> \n '+
          'Do not add BOT at the end \n '+
          'YOUR BOT NAME IS: ' + c.botId);
      });
    }
    gamesDuration++;
    if (Math.floor(Math.random() * 3) === 1) {
      var chosenBot = botArr[Math.floor(Math.random() * botArr.length)];

      sockets.map((c,i,a)=>{
        c.write('USER: ' + chosenBot + ' BOT said: IAMABOTYO');
      });
    }
    if (botsRemaining === 0 && botArr.length === 0) {
      sockets.map(function(c, i, a) {
        c.write('SYSTEM: GAME OVER');
      });
      clearInterval(roundPlaying);
      roundPlaying = false;
    }
  };

  process.stdin.on('data', function(data) {
    var adminWords = data.toString();
    if(adminWords.substring(0, 3).toLowerCase() === 'cmd') {
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
    delete users[userID.toString().toLowerCase()];

  });

});

server.listen(PORT, function() {
  console.log('server bound to port:', PORT);
});

