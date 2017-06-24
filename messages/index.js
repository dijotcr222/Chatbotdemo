var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

var local = true;
var sql = require('mssql');
var util = require('util');

var useEmulator = (process.env.NODE_ENV == 'development');

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

//For HTTPS
var https_options = {};
if (!local) {
    var fs = require('fs');
    https_options = {
        key: fs.readFileSync('/etc/letsencrypt/live/your.domain/privkey.pem'),
        certificate: fs.readFileSync('/etc/letsencrypt/live/your.domain/fullchain.pem'),
    };
}

// Setup Restify Server
var server = restify.createServer(https_options);
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', '138.197.0.221', server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'b7d4b9a2-a9fc-4c9c-a017-3bf24fa60a4a',
    appPassword: 'YAFAHQ8AzGAaRyk2JLKHp1t'
});
var bot = new builder.UniversalBot(connector, {persistConversationData: true});

server.post('/api/messages', connector.listen());

bot.dialog('/', function (session, args) {
  console.log(session);
  var conn = new sql.Connection(connection);
  var reqs = new sql.Request(conn);

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
    if (!session.userData.greeting) {
        session.send("Hello. What is your name?");
        session.userData.greeting = true;
    } else if (!session.userData.name) {
        console.log("Begin");
        getName(session);
    } else if (!session.userData.email) {
        console.log("Name is: " + session.userData.name);
        getEmail(session);
    } else if (!session.userData.password) {
        console.log("Name is: " + session.userData.name);
        console.log("Email is: " + session.userData.email);
        getPassword(session);
    } else {
        session.userData = null;
    }
    session.endDialog();
});


function getName(session) {
    name = session.message.text;
    session.userData.name = name;
    session.send("Hello, " + name + ". What is your Email ID?");
}

function getEmail(session) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    email = session.message.text;
    if (re.test(email)) {
        session.userData.email = email;
        session.send("Thank you, " + session.userData.name + ". Please set a new password.");
    } else {
        session.send("Please type a valid email address. For example: test@hotmail.com");
    }
}

function getPassword(session) {
    var re = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    password = session.message.text;
    if (re.test(password)) {
        session.userData.password = password;
        var data = session.userData;
        sendData(data, function (msg) {
            session.send(msg);
            session.userData = null;
        });
    } else {
        session.send("Password must contain at least 8 characters, including at least 1 number, 1 uppercase letter, 1 lower case letter and 1 special character. For example: Mybot@123");
    }
}
