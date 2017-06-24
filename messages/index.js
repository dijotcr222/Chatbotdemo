"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var local = true;
var sql = require('mssql');
var util = require('util');

var useEmulator = (process.env.NODE_ENV == 'development');

var connection = {
    server: 'chattable.database.windows.net',
    user: 'demo123',
    password: 'D1j0=0kRia123',
    database: 'ChatTable',
    options: {
	       encrypt: true
	  }
};

sql.connect(connection, function (err) {
  if(err){
    console.log(err);
    console.log("Error in connection");
  }else{
    console.log("DB Connected");
  }
})

function savedata(session){
  var conn = new sql.Connection(connection);
  var reqs = new sql.Request(conn);

  conn.connect(function(err){
    if(err){
      console.log(err)
    }else{
      var SqlSt = "INSERT into ChatTable (ChatID, ChatMessage, localTime) VALUES";
      SqlSt += util.format("(%d,%s,%s)", 454,"'"+session.message.text+"'","'"+session.message.localTimestamp+"'" );
      reqs.query(SqlSt, function(err, data){
          if(err){
            console.log(err);
          }else{
            console.log("Saved")
          }
      });
    }
  });
}

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', function (session) {
    session.send('You said ' + session.message.text);
    savedata(session)
});




if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
