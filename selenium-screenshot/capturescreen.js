//var webdriver = require('selenium-webdriver');
//var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;


//    var webdriverio = require('webdriverio');

var webdriver = require('webdriverio');
var fs = require('fs');
var gm = require('gm');

var urltoget = process.argv[2];
var filetosave = process.argv[3];
var resolutionN = parseInt(process.argv[4], 10);
var WaitN = parseInt(process.argv[5], 10);

var browsername = process.argv[6];

var HubIP = '192.168.1.201';

var Resolutions = [{
		width: 1920,
		height: 1080
	}, //0
	{
		width: 1680,
		height: 1050
	}, //1
	{
		width: 1600,
		height: 900
	}, //2
	{
		width: 1440,
		height: 900
	}, //3
	{
		width: 1366,
		height: 768
	}, //4
	{
		width: 1280,
		height: 1024
	}, //5
	{
		width: 1280,
		height: 800
	}, //6
	{
		width: 1024,
		height: 768
	}, //7
	{
		width: 800,
		height: 600
	} //8
];



if (browsername == "chrome") {
	var ClientChrome = webdriver.remote({
		desiredCapabilities: {
			browserName: 'chrome',
			platform: 'WINDOWS'
		},
		host: HubIP,
		port: 4444
	}).init();

	ClientChrome.setViewportSize(Resolutions[resolutionN])
	ClientChrome.url(urltoget).then(function() {
		ClientChrome.pause(WaitN).then(function() {
			ClientChrome.getTitle(function(err, title) {
				console.log("CHROME: " + title);
			});
			ClientChrome.pause(WaitN).then(function() {
				/*
				ClientChrome.execute('return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);').then(function(return_value) {
					newheight = return_value.value;
					console.log("height:"+newheight);
				})
				*/
				ClientChrome.saveScreenshot('./screens/' + filetosave + '-chrome.png');
				ClientChrome.pause(WaitN).then(function() {
					ClientChrome.end();
				});
			});
		});
	});
}


if (browsername == "ie8") {
	var ClientIE8 = webdriver.remote({
		desiredCapabilities: {
			browserName: 'internet explorer',
			version: '8',
			platform: 'WINDOWS'
		},
		host: HubIP,
		port: 4444
	}).init();

	ClientIE8.windowHandleSize(Resolutions[resolutionN]);
	ClientIE8.url(urltoget).then(function() {
		ClientIE8.getTitle(function(err, title) {
			console.log("IE8: " + title);
		});
		ClientIE8.pause(WaitN).then(function() {
			ClientIE8.saveScreenshot('./screens/' + filetosave + '-ie8.png');
			ClientIE8.pause(WaitN).then(function() {
				ClientIE8.end();
			});
		});
	});
}


if (browsername == "ie9") {
	var ClientIE9 = webdriver.remote({
		desiredCapabilities: {
			browserName: 'internet explorer',
			version: '9',
			platform: 'WINDOWS'
		},
		host: HubIP,
		port: 4444
	}).init();
	ClientIE9.windowHandleSize(Resolutions[resolutionN]);
	ClientIE9.url(urltoget).then(function() {
		ClientIE9.pause(WaitN).then(function() {
			ClientIE9.getTitle(function(err, title) {
				console.log("IE9: " + title);
			});
			ClientIE9.pause(WaitN).then(function() {
				ClientIE9.saveScreenshot('./screens/' + filetosave + '-ie9.png');
				ClientIE9.pause(WaitN).then(function() {
					ClientIE9.end();
				});
			});
		});
	});
}

if (browsername == "ie10") {
	var ClientIE10 = webdriver.remote({
		desiredCapabilities: {
			browserName: 'internet explorer',
			version: '10',
			platform: 'WINDOWS'
		},
		host: HubIP,
		port: 4444
	}).init();
	ClientIE10.windowHandleSize(Resolutions[resolutionN]);
	ClientIE10.url(urltoget).then(function() {
		ClientIE10.pause(WaitN).then(function() {
			ClientIE10.getTitle(function(err, title) {
				console.log("IE10: " + title);
			});
			ClientIE10.pause(WaitN).then(function() {
				ClientIE10.saveScreenshot('./screens/' + filetosave + '-ie10.png');
				ClientIE10.pause(WaitN).then(function() {
					ClientIE10.end();
				});
			});
		});
	});
}

if (browsername == "ie11") {
	var ClientIE11 = webdriver.remote({
		desiredCapabilities: {
			browserName: 'internet explorer',
			version: '11',
			platform: 'WINDOWS'
		},
		host: HubIP,
		port: 4444
	}).init();
	ClientIE11.windowHandleSize(Resolutions[resolutionN]);
	ClientIE11.url(urltoget).then(function() {
		ClientIE11.pause(WaitN).then(function() {
			ClientIE11.getTitle(function(err, title) {
				console.log("IE11: " + title);
			});
			ClientIE11.pause(WaitN).then(function() {
				ClientIE11.saveScreenshot('./screens/' + filetosave + '-ie11.png');
				ClientIE11.pause(WaitN).then(function() {
					ClientIE11.end();
				});
			});
		});
	});
}


if (browsername == "firefox") {
	var ClientFF = webdriver.remote({
		desiredCapabilities: {
			browserName: 'firefox',
			platform: 'WINDOWS'
		},
		host: HubIP,
		port: 4444
	}).init();
	ClientFF.windowHandleSize(Resolutions[resolutionN]);
	ClientFF.url(urltoget).then(function() {
		ClientFF.pause(WaitN).then(function() {
			ClientFF.getTitle(function(err, title) {
				console.log("FF: " + title);
			});
			ClientFF.pause(WaitN).then(function() {
				ClientFF.saveScreenshot('./screens/' + filetosave + '-ff.png');
				ClientFF.pause(WaitN).then(function() {
					ClientFF.end();
				});
			});
		});
	});
}




//console.log("DONE");