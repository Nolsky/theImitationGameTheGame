var net = require('net');
var PORT = 8124;
var HOST = 'ec2-54-215-189-97.us-west-1.compute.amazonaws.com';
var user = '';
var client = new net.Socket();
client.connect(PORT, HOST,
  function() {
    console.log('connected to ' + HOST + ':' + PORT);

    process.stdin.on('data', function(data) {
      console.log('sent: ' + data);
      client.write('said: ' + data);
    });
  });

client.on('data', function(data) {
  if (data.toString().substring(0, 8) == '[ADMIN]:') {
    console.log('\x1b[31m%s\x1b[0m ', data );
  } else {
    console.log(data.toString());
  }
});