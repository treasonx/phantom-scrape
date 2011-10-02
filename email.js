#!/usr/local/bin/node

var mail = require('mail'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    config,
    message,
    weather = '',
    now = new Date();


function loadConfig(cb) {

  if(process.argv.length < 3) {
    console.log('Must specify config.json file');
    process.exit(1);
  }

  fs.readFile(process.argv[2], 'utf8', function(err, data) {
    if(err) {
      console.log('error reading config file '+ err);
      process.exit(1);
    }
    config = JSON.parse(data);
    cb();
  });

}

function loadWeatherFile(cb) {
  var hourly,
      params = [
        '--disk-cache=yes',
        '--load-images=no', 
        '--load-plugins=no',
        'hourly.js'
      ], 
      onExit = function(code) {
        if(code === 0) {
          cb();
        } else {
          console.log('child process did not exit normally '+code);
          process.exit(1);
        }
      },
      onStdout = function(data) {
        var json = data.toString('utf8');
        weather = JSON.parse(json);
        weather.day = new Date(weather.day);
      };
  
  hourly = spawn(config.phantomjs, params, {});
  hourly.stdout.on('data', onStdout);
  hourly.on('exit', onExit);
}

function generateSubject() {
  return 'Hourly forecast for ' + weather.day.toDateString();
}

function generateBody() {
  var out = [],
      idx,
      results = weather.results,
      length = results.length,
      errors = weather.errors;

  for(idx = 0; idx < length; idx++) {
    out.push(results[idx].time);
    out.push(' ');
    out.push(results[idx].conditions);
    out.push(' temp ');
    out.push(results[idx].temp);
    out.push(' realfeel ');
    out.push(results[idx].realfeel);
    out.push('\n');
  }

  //Check for parsing errors
  length = errors.length;

  if(length > 0) {
    out.push('\n\nErrors: \n');
    for(idx = 0; idx < length; idx++) {
      out.push(errors[idx]);
      out.push('\n');
    }
  }

  return out.join('');
}

function sendEmail() {
  var body, subject;

  loadWeatherFile(function() {
    subject = generateSubject();
    body = generateBody();
    mail.message({
      from:config.from,
      to: config.to.join(','),
      subject: subject 
    }).body(body).send(function(err) { 
      if(err) {
        console.log('error sending');
        console.log(err);  
        process.exit(1);
      }  else { 
        process.exit(0);
      }
    });
  });
}

(function() {
  var body, subject;

  loadConfig(function() {
    mail = mail.Mail({
      host: config.host,
      username: config.username,
      password: config.password
    });          

    sendEmail();
  });
   
}());
