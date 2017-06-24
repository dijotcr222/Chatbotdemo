var builder = require('botbuilder');
var azure = require("documentdb").DocumentClient;
var restify = require('restify');

var documentDbOptions = {
    host: 'https://chatdemo.documents.azure.com:443/', // Host for local DocDb emulator
    masterKey: 'gUUklsT8oJaE6rUAsNRc1eB3QxBDmWH2Hpvy4jhBXtRleq4sWxeIvlArxoUxSYhbBmil8p9KFjECsVWeKO76tw==', // Fixed key for local DocDb emulator
    database: 'chatdb',
    collection: 'chatinfo'
};

var docDbClient = new azure.DocumentClient(documentDbOptions);

var tableStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, function (session) {
    session.send("You said: %s", session.message.text);
}).set('storage', tableStorage);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

server.post('/api/messages', connector.listen());
