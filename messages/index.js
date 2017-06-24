"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var sql = require('mssql');
var util = require('util');

var useEmulator = (process.env.NODE_ENV == 'development');

var connection = {
    server: 'chattable.database.windows.net',
    user: 'dijotcr222',
    password: 'D1j0=0kRia123',
    database: 'ChatTest',
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

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/api/message', function (session) {
    var conn = new sql.Connection(connection);
    var reqs = new sql.Request(conn);
    conn.connect(function(err){
      if(err){
        console.log(err)
      }else{
        var SqlSt = "INSERT into ChatTable (ChatID, ChatMessage, localTime) VALUES";
        SqlSt += util.format("(%d,%s,%s)", session.message.address.id,"'"+session.message.text+"'","'"+session.message.localTimestamp+"'" );
        reqs.query(SqlSt, function(err, data){
            if(err){
              console.log(err);
            }else{
              console.log("Saved")
            }
        });
      }
    });
    if (!session.userData.greeting) {

        session.send("Hi DIJO.  We think that you’d best suit a KiwiSaver Balanced fund but it’s possible you’d prefer an alternative fund.  What would you like to do?");
        session.userData.greeting = true;

    } else if (!session.userData.name) {

        console.log("Begin");
        getName(session);

    } else if (!session.userData.email) {

        console.log("Name is: " + session.userData.name);
        getEmail(session);

    } else if (!session.userData.password) {

        console.log("Name is: " + session.userData.name);
        getPassword(session);

    }else if (!session.userData.five) {

        console.log("five: " + session.userData.five);

        getFive(session);

    }
    else if (!session.userData.six) {

        console.log("six: " + session.userData.six);

        getSix(session);

    }
     else if (!session.userData.seven) {

        console.log("seven: " + session.userData.seven);

        getSeven(session);

    }
    else if (!session.userData.eight) {

        console.log("eight: " + session.userData.eight);

        getEight(session);

    }
     else {

        session.userData = null;
    }

    session.endDialog();
});

function getName(session) {

    name = session.message.text;
    session.userData.name = name;
    session.send("lowering your risk profile and preparing for retirement.");

}

function getEmail(session) {
      var re = "";
         email = session.message.text;
         session.userData.email = email;
         session.send("DISPLAY GRAPH. Let's say 7%.");
}

function getPassword(session) {
           password = session.message.text;
           session.userData.password = password;
           session.send("In terms of Kiwisaver funds, the conservative funds offer a slightly lower risk with slightly lower reward.");

}

function getFive(session) {
        five = session.message.text;
        session.userData.five = five;
        session.send("No, there isn't.");

}

function getSix(session) {
        six = session.message.text;
        session.userData.six = six;
        session.send("account unless you've met certain criteria (retirement age 65, purchasing a first home or financial hardship).");

}

function getSeven(session) {
        seven = session.message.text;
        session.userData.seven = seven;
        session.send("There is no minimum floor for investment. You can allocate a tiny portion of your balance to a fund or you can allocate the entire balance to a fund.");

}

function getEight(session) {
        eight = session.message.text;
        session.userData.eight = eight;
        session.send("yourself up. Or 3) You can just keep your account in NZ.");

}

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
