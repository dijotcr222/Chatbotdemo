"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var local = true;
var sql = require('mssql');
var util = require('util');

var useEmulator = (process.env.NODE_ENV == 'development');




var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
var connection = {
    server: 'chatdbdemo.database.windows.net',
    user: 'rootchat',
    password: 'chat@123',
    database: 'ChatDBDemo',
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

var conn = new sql.Connection(connection);
var reqs = new sql.Request(conn);

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', function (session) {
    session.send('You said ' + session.message.text);


    setTimeout(function () {
      conn.connect(function(err){
        if(err){
          console.log(err)
        }else{
          var SqlSt = "INSERT into chat_info (chat_id,message, time_stamp) VALUES";
          SqlSt += util.format("(%s,%s,%s)", "'"+session.message.address.id+"'","'"+session.message.text+"'","'"+session.message.localTimestamp+"'" );
          reqs.query(SqlSt, function(err, data){
              if(err){
                console.log(err);
              }else{
                console.log("Saved")
              }
          });
        }
      });
}, 1000)

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
