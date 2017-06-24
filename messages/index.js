"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var local = true;
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config = {
  userName: 'demo123', // update me
  password: 'D1j0=0kRia123', // update me
  server: 'chattable.database.windows.net', // update me
  options: {
      database: 'ChatTable', //update me
      encrypt : true
  }
}

var connection = new Connection(config);

var useEmulator = (process.env.NODE_ENV == 'development');

function savedata(session){
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
        }
        else{
          console.log("Inserting a brand new chat into database...");
          request = new Request(
              "INSERT INTO ChatTable (ChatID,ChatMessage, localTime) VALUES (23,'BrandNewProduct', '200989')",
              function(err, rowCount, rows) {
                  console.log(rowCount + ' row(s) inserted');
              }
          );
          connection.execSql(request);
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
