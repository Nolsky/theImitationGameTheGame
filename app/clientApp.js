var net = require('net');
var PORT = 8124;
var HOST = 'ec2-54-215-189-97.us-west-1.compute.amazonaws.com';
var user = ''; //SET TO USE A 'DEFAULT' NAME (as long as nobody else takes it)
var client = new net.Socket();
client.connect(PORT, HOST,
  function() {
    console.log('connected to ' + HOST + ':' + PORT);
    if(user !== ''){
      client.write('said: RENAME ' + user);
    }
    process.stdin.on('data', function(data) {
      console.log('\x1b[33m%s\x1b[0m', 'You said: ' + data);
      client.write('said: ' + data);
    });
  });

client.on('data', function(data) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  data = data.toString();
  if (data.substring(0, 8) == '[ADMIN]:') {
    console.log('\x1b[31m%s\x1b[0m', data);
  } else if (data.substring(0, 6) == 'USER: ') {
    console.log(data);
  } else if (data.substring(0, 8) == 'SYSTEM: ') {
    console.log('\x1b[31m%s\x1b[0m', data);
  } else {
    console.log('\x1b[36m%s\x1b[0m', data);
  }
});

