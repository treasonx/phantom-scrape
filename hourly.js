var page = require('webpage').create(),
    url,
    hour = 0,
    scrapeResult = {errors:[], results:[]},
    clientFn = function () {
      return (function($) {
  
        var ampmPtrn = /\d+am|\d+pm/,
            $container = $('#detail-hourly'),
            $table = $('table thead th', $container),
            $forecast = $('table tr.forecast td.icon div', $container),
            $temp = $('table tr.temp td', $container),
            $feel = $('table tr.realfeel td', $container),
            infos = {
              errors: [],
              results: []
            };
          
        //Error Checking DOM could change in the future 
        if($container.length < 1) {
          infos.errors.push('Could not locate #detail-hourly container.');
        }

        if($table.length < 1) {
          infos.errors.push('Could not located table within #detail-hourly container.');  
        }

        if($forecast.length < 1) {
          infos.errors.push('Could not locate forcast element within #detail-hourly container');
        }

        if($temp.length < 1) {
          infos.errors.push('Could not lcoate temp element within #detail-hourly container');  
        }

        if($feel.length < 1) {
          infos.errors.push('Could not locate realfeel element within #details-hourly container');  
        }

        //Structure has changed give up!
        if(infos.errors.length > 0) {
          return infos;  
        }
        

        //get the data
        $table.each(function(idx, ele) { 
          var eleText = $(ele).text(),
              match = ampmPtrn.exec(eleText),
              forecast = {}; 
          
          if(match) {
            forecast.time = match;
            forecast.conditions = $forecast.eq(idx-1).text();
            forecast.temp = $temp.eq(idx-1).text();
            forecast.realfeel = $feel.eq(idx-1).text();
            infos.results.push(forecast);
          }
          
        });

        return infos;
        
      }($ || jQuery));      
    };

function finished(results) {
  var data;
  results.day = new Date();
  results.day.setDate(results.day.getDate()+1);
  data = JSON.stringify(results);
  console.log(data);
  phantom.exit(); 
}

function getPage(hourIdx) {
  if(hourIdx >= 24) {
    finished(scrapeResult);
  } else {
    
    page.open(url+hourIdx, function(status) {
      var results, idx, length;
      
      if(status !== 'success') {
        scrapeResult.errors.push('Cannot Open Page '+status+' '+url+hourIdx); 
      } else {
        results = page.evaluate(clientFn);
        scrapeResult.results = scrapeResult.results.concat(results.results);
      }
      hourIdx += 8;
      getPage(hourIdx);

    });
  }
}

(function() {
  
  if(phantom.args.length < 1) { 
    console.log('missing url argument!');
    phantom.exit(1);
  } else { 
    url = phantom.args[0];
    getPage(hour);
  }

}());
