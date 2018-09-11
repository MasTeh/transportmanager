var API = require('./api');
var WebSocketServer = new require('ws');
var http = require('http');

// подключенные клиенты
var clients = {};
var timers = {};
var session = {};

global.clients = clients;
global.session = session;
global.timers = timers;

var webSocketServer = new WebSocketServer.Server({
  port: process.env.APP_PORT
});

webSocketServer.on('connection', function(ws) {

  var session_id = Math.ceil(Math.random()*10000);

  clients[session_id] = ws;

  global.session_id = session_id;
  global.ws = ws;

  console.log("новое соединение " + session_id);

  msg1 = {'type':'console', 'message':"новое соединение " + session_id};
  clients[session_id].send(JSON.stringify(msg1));

  console.log("новое соединение " + session_id);

  count = 0;
  for (var key in clients) { count++; }

  msg2 = {'type':'console', 'message':"Всего соединений: "+count};
  clients[session_id].send(JSON.stringify(msg2));   

  timers[session_id] = setInterval(function() {
    clients[session_id].send(JSON.stringify({'type':'ping'}));
  }, 100);


  ws.on('message', function(message) {
    
        //clients[session_id].send(JSON.stringify({'type':'console', 'message':message}));

        var msg = JSON.parse(message);

        if (msg.type == 'query_send') {
    
          API.action(msg, function(result) {

            //console.log(result);
    
            result.direction = 'back';

            if (!result.onesided)
              clients[session_id].send(JSON.stringify(result));
    
          });      
    
        }

    
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + session_id);
    delete clients[session_id];
    clearInterval(timers[session_id]);
  });

});