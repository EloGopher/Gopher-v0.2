var webdriver = require('selenium-webdriver');

var fs = require('fs');
var gm = require('gm');
var mysql      = require('mysql');

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

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'A123456b',
  database : 'selenium'
});
connection.connect();



function writeScreenshot(data, name) {
  name = name || 'ss.png';
  var screenshotPath = 'C:\\wamp\\www\\screens\\';
  fs.writeFileSync(screenshotPath + name, data, 'base64');
};


function GetScreen(urltoget,resolutionN,WaitN,browsernameN,osnameN,TableRowID)
{
	console.log('SET '+TableRowID+' to in progress..');

	connection.query('UPDATE selenium_jobs SET inprogress=1 WHERE ID='+TableRowID, function(err2, rows, fields) {
	  if (err2) console.log(err2);
	});

	var xCapabilities = {};

	if (browsernameN=="ie8") { xCapabilities = { browserName: 'internet explorer', version: '8', platform: 'WINDOWS' }; }
	if (browsernameN=="ie9") { xCapabilities = { browserName: 'internet explorer', version: '9', platform: 'WINDOWS' }; }
	if (browsernameN=="ie10") { xCapabilities = { browserName: 'internet explorer', version: '10', platform: 'WINDOWS' }; }
	if (browsernameN=="ie11") { xCapabilities = { browserName: 'internet explorer', version: '11', platform: 'WINDOWS' }; }
	if (browsernameN=="chrome") { xCapabilities = { browserName: 'chrome',  platform: 'WINDOWS' }; }
	if (browsernameN=="firefox") { xCapabilities = { browserName: 'firefox', platform: 'WINDOWS' }; }

	var Client = new webdriver.Builder().usingServer('http://'+HubIP+':4444/wd/hub').withCapabilities(xCapabilities).build();
	console.log('SET '+TableRowID+' new webdriver builder built..');

	/*
	Client.controlFlow().on('uncaughtException', function(e) {
		//console.log('UPDATE selenium_jobs SET inprogress=0, haserror=1, isdone=1, errortxt = \''+ connection.escape(e) +'\' WHERE ID='+TableRowID);
	//	console.error('**** ERROR ***** \n ' + e);

		console.log("error on test with ID: "+TableRowID);

		connection.query('UPDATE selenium_jobs SET inprogress=0, haserror=1, isdone=1, errortxt = \''+ connection.escape(e) +'\' WHERE ID='+TableRowID, function(err2, rows, fields) {
		  if (err2) console.log(err2);
		});

		fs.writeFile('C:\\wamp\\www\\screens\\'+TableRowID + '-' + browsernameN + '-error.txt', 'UPDATE selenium_jobs SET inprogress=0, haserror=1, isdone=1, errortxt = \''+ connection.escape(e) +'\' WHERE ID='+TableRowID+'\n\n\n'+e, function(err) {  if(err) { return console.log(err); } });
	});
	*/

	Client.manage().timeouts().implicitlyWait(parseInt(WaitN,10)); 
//	Client.manage().timeouts().pageLoadTimeout(parseInt(WaitN,10));
//	Client.manage().timeouts().setScriptTimeout(parseInt(WaitN,10));
	Client.manage().window().setSize(Resolutions[parseInt(resolutionN,10)].width,Resolutions[parseInt(resolutionN,10)].height);


	Client.get(urltoget).then(function() {
		Client.getTitle().then(function(title) { console.log(browsernameN+": " + title); });
		Client.takeScreenshot().then(function(data) {
			writeScreenshot(data, TableRowID + '-'+browsernameN+'.png');

			connection.query('UPDATE selenium_jobs SET inprogress=0, haserror=0, isdone=1, imagefile = \''+ TableRowID + '-'+browsernameN+'.png' +'\' WHERE ID='+TableRowID, function(err2, rows, fields) {
			  if (err2) console.log(err2);
			});
			
			console.log("done with ID: "+TableRowID );
			Client.quit();
			setTimeout(function() { process.exit(); } , 5000 );
			
		});


	}, function (e) {
		console.log("error on test with ID: "+TableRowID);

		fs.writeFile('C:\\wamp\\www\\screens\\'+TableRowID + '-' + browsernameN + '-error.txt', e, function(err) {  if(err) { return console.log(err); } });

		connection.query('UPDATE selenium_jobs SET inprogress=0, haserror=1, isdone=1, errortxt = \''+ TableRowID + '-' + browsernameN + '-error.txt\' WHERE ID='+TableRowID, function(err2, rows, fields) {
		  if (err2) console.log(err2);
		});

		console.log("failed with ID: "+TableRowID );
		Client.quit();
		setTimeout(function() { process.exit(); } , 5000 );
	});
}


	var queryString = 'SELECT * FROM selenium_jobs WHERE ID = '+process.argv[2];

	connection.query(queryString, function(err, rows, fields) {
	    if (err) throw err;

	    for (var i in rows) {
			 console.log('GRAB URL: '+rows[i].urltoget+' on '+rows[i].browser+' with row id: '+rows[i].ID);
			 GetScreen(rows[i].urltoget,rows[i].resolution,rows[i].timeoutmsec,rows[i].browser,'WINDOWS',rows[i].ID);
	    }
	});

//connection.end();
