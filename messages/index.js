"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var azure = require('azure-storage');

var local = true;
var useEmulator = (process.env.NODE_ENV == 'development');

var tableService = azure.createTableService();
tableService.createTableIfNotExists('chattable', function(error, result, response) {
  if (!error) {
    // result contains true if created; false if already exists
  }
});
var entGen = azure.TableUtilities.entityGenerator;


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
    var entity = {
      ChatId: entGen.String(session.message.address.id),
      Message: entGen.String(session.message.text),
      LocalTime: entGen.String(session.message.localTimestamp)
    };
    tableService.insertEntity('chattable', entity, function(error, result, response) {
      if (!error) {
        // result contains the ETag for the new entity
      }
    });
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
