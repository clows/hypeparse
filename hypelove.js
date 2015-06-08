var casper = require('casper').create({
    verbose: false, // false -> weniger output
    logLevel: "debug", // error
    page: {
        viewportSize: {
            width: 1280,
            height: 800
        }
    }
});

var hypeUrl = 'http://hypem.com/track/';
var trackId = '2ammd'; // '2bqk2'; // '2bp7c'

if (casper.cli.args.length == 1) {
	trackId = casper.cli.args[0];
}
var loves = []


// get information
function getLoves() {
    console.log('getLoves');
    var imgElements = casper.getElementsInfo('div.favcountlist ul li a img');
    var imgs = Array.prototype.map.call(imgElements, function(e) {
        return e.attributes.title.replace(' loved this ', ',');
    });

    return imgs;
}


// loading start page and open 'loves'
casper.start(hypeUrl + trackId, function(selector) {
    console.log('start');
    this.click('#favcount_' + trackId);
});


// adding the first <= 20 entries
casper.waitForSelector('div.favcountlist > ul > li > a', function() {
    console.log('concat');
    loves = loves.concat(getLoves());
});


var terminate = function() {
    this.echo('found: ' + loves.length + '\n' + loves.join('\n')).exit();
};


// click and extract (recursive) and terminate
var processPage = function() {

    casper.then(function() {
        if (this.exists('div.act_info > div > a:nth-child(5)')) { // Show more
            this.click('div.act_info > div > a:nth-child(5)');
        } else {
            this.click('div.act_info > div > a'); // Next 20
        }

        // wait for loading and exit if done
        this.waitFor(function check() {
            var plLoading = this.evaluate(function() {
                return $('#player-loading').css('display');
            });
            return plLoading === 'none';
        }, function then() {
            if (!this.exists('div.favcountlist')) { // div.favcountlist does not exit then exit
                terminate.call(casper);
            }

        });

    });


// add new entries to list of all entries
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
});