var fs = require('fs');
var gm = require('gm');
var mysql      = require('mysql');

 var childProcess = require('child_process');
 var ls;

	 
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'A123456b',
  database : 'selenium'
});
connection.connect();

var waitingjobs = 0;

setInterval(function() {
	console.log('5 sec delay check db table');
	
	var queryString = 'SELECT count(*) as currentjobs FROM selenium_jobs WHERE inprogress=1';

	connection.query(queryString, function(err, rows, fields) {
		waitingjobs = parseInt(rows[0].currentjobs,10);
		console.log("waiting jobs: "+waitingjobs);
		if (waitingjobs < 10) {
			var queryString = 'SELECT * FROM selenium_jobs WHERE isdone=0 and inprogress=0 LIMIT 10';
		} else
		{
			var queryString = 'SELECT * FROM selenium_jobs WHERE isdone=0 and inprogress=0 LIMIT 1';
		}
		connection.query(queryString, function(err, rows, fields) {
			if (err) throw err;

			for (var i in rows) {
				 console.log('GRAB URL: '+rows[i].urltoget+' on '+rows[i].browser+' with row id: '+rows[i].ID);
				 
				 childProcess.exec('capturescreen-auto-worker.bat '+rows[i].ID , function( error, stdout, stderr) 
   {
       if ( error != null ) {
            console.log(stderr);
            // error handling & exit
       }

       // normal 

   });
				 
				 /*
				var selenium_worker = childProcess.spawn('node',['capturescreen-auto-worker.js', rows[i].ID]); // {stdio: 'inherit'}
				

				setTimeout(function () {
					selenium_worker.kill();
				}, 60000);
				
				selenium_worker.stdout.on('data', 
					function (data) {
						console.log('Child process  output: ' + data);
					}
				);
				
				selenium_worker.stderr.on('data',
					function (data) {
						console.log('Child process err data: ' + data);
					}
				);

				selenium_worker.on('exit', function (code) {
					console.log('Child process exited with exit code '+code);
				});
				*/
				
				/*
				ls = childProcess.exec('node capturescreen-auto-worker.js '+rows[i].ID, function (error, stdout, stderr) {
					if (error) {
						console.log(error.stack);
						console.log('Error code: '+error.code);
						console.log('Signal received: '+error.signal);
					}
						console.log('Child Process STDOUT: '+stdout);
						console.log('Child Process STDERR: '+stderr);
				});

				ls.on('exit', function (code) {
					console.log('Child process exited with exit code '+code);
				});
				*/
			}
		});
	});

}, 5000);

//connection.end();
