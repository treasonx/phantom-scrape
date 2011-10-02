#Example using PhantomJS to scrape a website for content.

To get started you need to have PhantomJS on your system. You can download the latest version here http://code.google.com/p/phantomjs/downloads/list

#Config File Setup

The config file makes it easy to configure the script for your needs. Here is an explaination of the fields in the config file. The config script must be passed as an argument to the email.js script. For example email.js sampleconfig.json 

    {
      //Location of the phantomjs executable on your system
      "phantomjs": "path/to/phantomjs", 
      //Which email addresses should get the results of the scrape of accuweather
      "to": [
        "me@example.com"
      ],
      //Which address the email should come from
      "from": "you@example.com",
      //Your smtp username
      "username": "smtp@example.com",
      //Your smtp password
      "password": "smtppassword",
      //Your smtp host
      "host": "smtp.example.com",
      //this is the url for accuweather. See notes below
      "accuweatherUrl": "http://www.accuweather.com/us/ma/cambridge/02138/forecast-hourly.asp?fday=2&hbhhour="
    }

## Accuweather URL setting
If you look at the accuweather url above you will notice the query args of the url. fday seems to be which day you should be querying for. fday of 1 is today, fday of 2 is tomorrow ect. hbhhour is the paging of the hour by hour table. The table pages in 8 hour increments. hbhhour will be incremented by the hourly.js script until it reaches 24 hours. At this time you cannot specify the hbhhour value in the config file.  

#Email.js Script

This script is the driver script for the parser (hourly.js). Since within a phantomjs script we cannot require other NodeJS modules we need to have a driver script which will spawn hourly.js as a child process and capture the output of the script. 

Email.js will capture the results of the hourly.js file and format the output properly for email. Then using https://github.com/weaver/node-mail we send them email using our SMTP server of choice. 


