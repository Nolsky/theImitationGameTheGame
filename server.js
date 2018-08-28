var net = require('net');
var PORT = 8124;
var IP = 'localhost';
var sockets = [];
var botNames = ['Adam', 'Alec', 'Allan', 'Aman', 'Anson', 'Benny', 'Burke', 'Chloe', 'Christian', 'David', 'Diego', 'Dilsher', 'Enji', 'Gaurav', 'Greg', 'Jae', 'John', 'Jordan', 'Joyce', 'JP', 'Justin', 'Ken', 'Kony', 'Kristie-Desiree', 'Michael', 'Nils', 'Nolan', 'Nolsky', 'Ricardo', 'Richelle', 'Ringo', 'Servio', 'Shane', 'Shayan', 'Steven', 'Thu', 'Xizhou', 'Zach', 'Abel', 'Alan', 'Vincent', 'Andrew', 'Arjun', 'Brandon', 'Celeste', 'Charles', 'Charlie', 'Chris', 'Eddie', 'James', 'Jenn', 'Jessie', 'Jun', 'Lisette', 'Matt', 'Michelle', 'Nicholas', 'Nick', 'Rebecca', 'Richard', 'Roy', 'Ruby', 'Sonia', 'Spencer', 'Tinh', 'Trey', 'Gwynn', 'Liz', 'Fred', 'Sophie', 'Beth', 'Joel', 'Mylani', 'Jonathan', 'Alex', 'Anoop', 'Jane', 'Julia', 'Luke', 'Zachary', 'Meesh', 'Ash', 'Blake', 'Mary', 'Taylor', 'Tony', 'Mia', 'Marcus', 'Spectator'];
var botLines = ['hello', 'hi', 'whats up', 'wat', 'how do you play this', 'I think mine is buggd', 'dude, this is sick', 'amazing', 'woah', 'whhhhhaaaaaatttt', 'I swear guys I am not the bot', 'The screen just takes some getting used to, you just need to get used to not seeing what you are typing', 'Nolsky is so job ready', 'this game is awesome', 'guys how many bots have we found?', 'so many messagesssssss', 'IF WE ALL TALK IN CAPS THE BOTS WONT CATCH ON', 'I wish my mvp was this good', 'this mvp is siccccckkkkk', 'Im totally going to beat all you guys', 'dont crash the server', 'dude wtf is going on', 'best stress test 2018', 'GUYS I THINK '+ botNames[Math.floor(Math.random() * botNames.length)] + 'is a bot', 'how long did this whole thing take?', 'LOL', 'WTF', 'OMG', 'Beep boop I am a bot', 'guy below me is a bot', 'Anything you can bot I can bot better', 'awdfasdgahwbyw22b5', 'qwfhq0mp  q 34 ojgrwe0 q24 2j9329', ' fqe r12  55q qef ef rjyt t rdy', '?', 'you guys are gonna crash it', 'man I hope this project works', 'insert b0t proof phrase here', 'LAUNCH THE SKYNET!', 'WhEn_In_DaNGeR_FeaR_Or_DOuBt__RUn_iN_CIRclEs_scReAM_&_ShoUt', 'did we get all the bots yet?', 'You could tell he was running out of ideas for lines to have the bots say', 'man this was fun', 'GGs', 'BOTS WIN', 'BOTS ALWAYS WIN', 'Man what a tough game', 'ARRGGG', 'LOlz', 'I hope everyone had a great time at Hack Reactor, its been a pleasure working alongside you all', 'peace out'];
var users = {};
var roundPlaying = false;
var unusedNames = [];
var botsRemaining = 0;
var bots = {};
var botArr = [];
var gamesDuration = 0;
var lastBotMessage = Date.parse(new Date());

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
    'Begin a new game by saying \'NEWGAME\' \n');

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
      lastBotMessage = Date.parse(new Date());
      let botCount = Math.ceil(Math.random() * 5 + sockets.length);
      for (var i = 0; i < botCount; i++) {
        botArr.push(unusedNames.splice(Math.floor(Math.random() * unusedNames.length), 1));
      }
      botsRemaining = botCount;
      gamesDuration++;
    }
    if (gamesDuration === 1) {
      console.log('Running game logic');
      sockets.map(function(c,i,a) {
        c.write('SYSTEM: STARTING NEW GAME');
        c.write('To accuse a player use the (Tilde) ~<name>, ACCUSE:<name>, or ACC!<name> \n '+
          'Do not add BOT at the end \n '+
          'YOUR BOT NAME IS: ' + c.botId);
      });
      gamesDuration++;
    }
    if (gamesDuration < botLines.length) {
      if (Math.floor(Math.random() * 3) === 1) {
        gamesDuration++;
      }
    }
    if (Math.floor(Math.random() * 15) === 1) {
      if((Date.parse(new Date()) - lastBotMessage) >= 2000) {
        var chosenBot = botArr[Math.floor(Math.random() * botArr.length)];
        var chosenLine = botLines[Math.floor(Math.random() * gamesDuration)]
        var botSays = 'USER: ' + chosenBot + ' BOT said:' + chosenLine;
        sockets.map((c,i,a)=>{
          c.write(botSays);
        });
        lastBotMessage = Date.parse(new Date());
      }
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

