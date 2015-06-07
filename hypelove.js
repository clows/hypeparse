var casper = require('casper').create({
    verbose: false,
    logLevel: "error",
    page: {
    	viewportSize: { width: 1280, height: 800 }
    }
});

var hypeUrl = 'http://hypem.com/track/';
var trackId = '2bqqq'; // '2bqk2'; // '2bp7c'

var loves = []

function getLoves() {
		console.log('getLoves');

var l = casper.getElementsInfo('div.favcountlist ul li a span');
    return Array.prototype.map.call(l, function(e) {
       return e.text;
    });
}



casper.start(hypeUrl + trackId, function(selector) {
	console.log('start');
	this.click('#favcount_' + trackId);
  this.wait(2000, function() {
        this.echo("I've waited for a second.");
    });
});


casper.waitForSelector('div.favcountlist > ul > li > a', function() {
	console.log('concat');

	//this.capture('scrn.png',undefined);

  loves = loves.concat(getLoves());
});

var terminate = function() {
    this.echo('found: ' + loves.length + '\n - ' + loves.join('\n - ')).exit();
};

var processPage = function() {

casper.then(function() {
//	this.click('#section-track-2bp7c > div.section-player > div.act_info > div > a:nth-child(5)');
	if (this.exists('div.act_info > div > a:nth-child(5)')) {
		this.click('div.act_info > div > a:nth-child(5)');
	} else {
		this.click('div.act_info > div > a');
	}
	this.wait(2000, function() {
    		if (!this.exists('div.favcountlist')) {
    			terminate.call(casper);
    		}
    });
});

casper.waitForSelector('div.favcountlist > ul > li > a', function() {
	console.log('concat2');

	var currentLoves = getLoves();
	  console.log('concat2 ' + currentLoves + '     ' + currentLoves.count);
	if (currentLoves.length > 0) {
	  loves = loves.concat(currentLoves);
	  console.log('concat2 done');
	  return processPage.call(casper);
	} else {
	  console.log('concat2 exit');
		return terminate.call(casper);
	}

});

};

casper.then(processPage);


casper.run(function() {
	this.echo('love = ' + loves.join('\n - ')).exit();
});