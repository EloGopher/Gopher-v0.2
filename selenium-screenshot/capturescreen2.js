var webdriver = require('selenium-webdriver');

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

function writeScreenshot(data, name) {
  name = name || 'ss.png';
  var screenshotPath = 'C:\\wamp\\www\\screens\\';
  fs.writeFileSync(screenshotPath + name, data, 'base64');
};


if (browsername == "firefox") {
	var Client = new webdriver.Builder().usingServer('http://'+HubIP+':4444/wd/hub').
		withCapabilities({
			browserName: 'firefox',
			platform: 'WINDOWS'
		}).build();

	Client.controlFlow().on('uncaughtException', function(e) {
		console.error('**** ERROR ***** \n ' + e);
		fs.writeFile('C:\\wamp\\www\\screens\\'+filetosave + '-' + browsername + '-error.txt', e, function(err) {  if(err) { return console.log(err); } });
	});

	Client.manage().timeouts().pageLoadTimeout(WaitN);
	Client.manage().timeouts().setScriptTimeout(10000);
	Client.manage().window().setSize(Resolutions[resolutionN].width,Resolutions[resolutionN].height);

	Client.get(urltoget).then(function() {
		Client.getTitle().then(function(title) { console.log(browsername+": " + title); });
		Client.takeScreenshot().then(function(data) {
			writeScreenshot(data, filetosave + '-'+browsername+'.png');
			Client.quit();
		});
	});
}

if (browsername == "chrome") {
	var Client = new webdriver.Builder().usingServer('http://'+HubIP+':4444/wd/hub').
		withCapabilities({
			browserName: 'chrome',
			platform: 'WINDOWS'
		}).build();

	Client.controlFlow().on('uncaughtException', function(e) {
		console.error('**** ERROR ***** \n ' + e);
		fs.writeFile('C:\\wamp\\www\\screens\\'+filetosave + '-' + browsername + '-error.txt', e, function(err) {  if(err) { return console.log(err); } });
	});

	Client.manage().timeouts().pageLoadTimeout(WaitN);
	Client.manage().timeouts().setScriptTimeout(10000);
	Client.manage().window().setSize(Resolutions[resolutionN].width,Resolutions[resolutionN].height);

	Client.get(urltoget).then(function() {
		Client.getTitle().then(function(title) { console.log(browsername+": " + title); });
		Client.takeScreenshot().then(function(data) {
			writeScreenshot(data, filetosave + '-'+browsername+'.png');
			Client.quit();
		});
	});
}

if (browsername == "ie11") {
	var Client = new webdriver.Builder().usingServer('http://'+HubIP+':4444/wd/hub').
		withCapabilities({
			browserName: 'internet explorer',
			version: '11',
			platform: 'WINDOWS'
		}).build();

	Client.controlFlow().on('uncaughtException', function(e) {
		console.error('**** ERROR ***** \n ' + e);
		fs.writeFile('C:\\wamp\\www\\screens\\'+filetosave + '-' + browsername + '-error.txt', e, function(err) {  if(err) { return console.log(err); } });
	});

	Client.manage().timeouts().pageLoadTimeout(WaitN);
	Client.manage().timeouts().setScriptTimeout(10000);
	Client.manage().window().setSize(Resolutions[resolutionN].width,Resolutions[resolutionN].height);

	Client.get(urltoget).then(function() {
		Client.getTitle().then(function(title) { console.log(browsername+": " + title); });
		Client.takeScreenshot().then(function(data) {
			writeScreenshot(data, filetosave + '-'+browsername+'.png');
			Client.quit();
		});
	});
}

if (browsername == "ie10") {
	var Client = new webdriver.Builder().usingServer('http://'+HubIP+':4444/wd/hub').
		withCapabilities({
			browserName: 'internet explorer',
			version: '10',
			platform: 'WINDOWS'
		}).build();

	Client.controlFlow().on('uncaughtException', function(e) {
		console.error('**** ERROR ***** \n ' + e);
		fs.writeFile('C:\\wamp\\www\\screens\\'+filetosave + '-' + browsername + '-error.txt', e, function(err) {  if(err) { return console.log(err); } });
	});

	Client.manage().timeouts().pageLoadTimeout(WaitN);
	Client.manage().timeouts().setScriptTimeout(10000);
	Client.manage().window().setSize(Resolutions[resolutionN].width,Resolutions[resolutionN].height);

	Client.get(urltoget).then(function() {
		Client.getTitle().then(function(title) { console.log(browsername+": " + title); });
		Client.takeScreenshot().then(function(data) {
			writeScreenshot(data, filetosave + '-'+browsername+'.png');
			Client.quit();
		});
	});
}

if (browsername == "ie9") {
	var Client = new webdriver.Builder().usingServer('http://'+HubIP+':4444/wd/hub').
		withCapabilities({
			browserName: 'internet explorer',
			version: '9',
			platform: 'WINDOWS'
		}).build();

	Client.controlFlow().on('uncaughtException', function(e) {
		console.error('**** ERROR ***** \n ' + e);
		fs.writeFile('C:\\wamp\\www\\screens\\'+filetosave + '-' + browsername + '-error.txt', e, function(err) {  if(err) { return console.log(err); } });
	});

	Client.manage().timeouts().pageLoadTimeout(WaitN);
	Client.manage().timeouts().setScriptTimeout(10000);
	Client.manage().window().setSize(Resolutions[resolutionN].width,Resolutions[resolutionN].height);

	try {
		Client.get(urltoget).then(function() {
			Client.getTitle().then(function(title) { console.log(browsername+": " + title); });
			Client.takeScreenshot().then(function(data) {
				writeScreenshot(data, filetosave + '-'+browsername+'.png');
				Client.quit();
			});
		});
	} catch(err) {
		console.error("An error was thrown! " + err);
	}
}

if (browsername == "ie8") {
	var Client = new webdriver.Builder().usingServer('http://'+HubIP+':4444/wd/hub').
		withCapabilities({
			browserName: 'internet explorer',
			version: '8',
			platform: 'WINDOWS'
		}).build();

	Client.controlFlow().on('uncaughtException', function(e) {
		console.error('**** ERROR ***** \n ' + e);
		fs.writeFile('C:\\wamp\\www\\screens\\'+filetosave + '-' + browsername + '-error.txt', e, function(err) {  if(err) { return console.log(err); } });
	});

	Client.manage().timeouts().pageLoadTimeout(WaitN);
	Client.manage().timeouts().setScriptTimeout(10000);
	Client.manage().window().setSize(Resolutions[resolutionN].width,Resolutions[resolutionN].height);

	Client.get(urltoget).then(function() {
		Client.getTitle().then(function(title) { console.log(browsername+": " + title); });
		Client.takeScreenshot().then(function(data) {
			writeScreenshot(data, filetosave + '-'+browsername+'.png');
			Client.quit();
		});
	});
}
