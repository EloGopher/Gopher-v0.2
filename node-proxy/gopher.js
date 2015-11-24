//intereting concept getdefinedvar()
//http://stackoverflow.com/questions/24448998/is-it-possible-to-get-variables-with-get-defined-vars-but-for-the-actual-runni

var http = require('http');
var fs = require('fs');
var path = require("path");
var qs = require('querystring');
var url = require("url");

var sqlite3 = require('sqlite3').verbose();

var CSVToArray = require("./CSVToArray.js")

var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var stringifyObject = require('stringify-object');

var now2 = new Date();
var offset = now2.getTimezoneOffset() * 60 * 1000;
var UniversalScriptTimeStamp = +now2;// - offset;

UniversalScriptTimeStamp = 0; //set time to 0, the first html,php will update it

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function ShowHelpScreen()
{
	console.log("");
	console.log("");
	console.log("Gopher Help");
	console.log("-----------------------");
	console.log("-gopherurl <http://> : No default, this is the location of Gopher.php in the project folder. Should be a full url.");
	console.log("-pid <integer> : Default is 101, this is the project ID that will be logged with every event.");
	console.log("-host <localhost> : No defaut, this has to be specified. This is the server gopher will be pulling through it's proxy. ");
	console.log("-port <integer> : Default is 80. Port of server which gopher will be pulling.");
	console.log("-path <string> : Default blank. If the project is in a subfolder this can be added in which case you would be able to run your code without writing the folder in the url.");
	console.log("-gopherhost <http://localhost> : Default localhost. This parameter will be used by the Browser extension. Also all log messages will be sent to the gopher host and port. ");
	console.log("-gopherport <integer> : Defalth 1337. Port of above parameter.");
	console.log("-flushdb : Delete all data stored in SQLLite database.");
   console.log("-stopclearcache : If this is not specified all network activity saved to the temp folder will be deleted.");
	console.log("-redirectphp <yes/no> : Defalut yes. To trap and log all php runtime errors, all php files requested has to go through Gopher.php on the server. If you don't want the Gopher proxy to request php files through Gopher.php then you should set this to \"no\".");
   console.log("-log <integer>: gopher log to console level ");
console.log("-help : This page.");
	console.log("");
	console.log("Example run:");
	console.log("node gopher -flushdb -pid 2000 -host localhost -gopherurl http://localhost/Gopher.php");
	console.log("");
	console.log("");
	process.exit(1);

}

var ConsoleLogLvl = 1;
if(process.argv.indexOf("-log") != -1){ /*does our flag exist? grab the next item*/ ConsoleLogLvl = process.argv[process.argv.indexOf("-log") + 1]; }


var ProjectID = 101;
if(process.argv.indexOf("-pid") != -1){ ProjectID = process.argv[process.argv.indexOf("-pid") + 1]; }

var projectHost = ''; // 'localhost' 'testv2.phishproof.com';
if(process.argv.indexOf("-host") != -1){ projectHost = process.argv[process.argv.indexOf("-host") + 1]; }

var projectOnPort = 80;
if(process.argv.indexOf("-port") != -1){ projectOnPort = process.argv[process.argv.indexOf("-port") + 1]; }

var projectPath = ''; //'/phishproof'
if(process.argv.indexOf("-path") != -1){ projectPath = process.argv[process.argv.indexOf("-path") + 1]; }

var gopherHost = 'localhost';
if(process.argv.indexOf("-gopherhost") != -1){ projectPath = process.argv[process.argv.indexOf("-gopherhost") + 1]; }

var gopherPort = 1337;
if(process.argv.indexOf("-gopherport") != -1){ projectPath = process.argv[process.argv.indexOf("-gopherport") + 1]; }

var showhelp = "";
if(process.argv.indexOf("-help") != -1){ showhelp="yes"; }

var flushdb = "";
if(process.argv.indexOf("-flushdb") != -1){ flushdb="yes"; }

var stopclearcache = "";
if(process.argv.indexOf("-stopclearcache") != -1){ stopclearcache="yes"; }

var redirectphp = "yes";
if(process.argv.indexOf("-redirectphp") != -1){ redirectphp = process.argv[process.argv.indexOf("-redirectphp") + 1]; }

var gopherurl = "";
if(process.argv.indexOf("-gopherurl") != -1){ gopherurl = process.argv[process.argv.indexOf("-gopherurl") + 1]; }


if (gopherurl!=="") {
	var post_data = 'op=copyself';
	var options = {
			method: 'POST',
			host: url.parse(gopherurl).host,
			port: 80,
			path: url.parse(gopherurl).pathname,
			headers: {
	         'Content-Type': 'application/x-www-form-urlencoded',
	         'Content-Length': Buffer.byteLength(post_data)
	      }
		};

	var post_req = http.request(options, function(r) {
		r.on('data', function (chunk) {
          console.log('GOPHER: PHP Response = ' + chunk);
      });

		if (r.statusCode != 200) {
			console.log("GOPHER: can't locate Gopher.php");
			ShowHelpScreen();
		} else {
			console.log("GOPHER: Gopher.php located.");
		}
	});

	post_req.write(post_data);
	post_req.end();
}

if ( (projectHost=="") || (showhelp!="") || (gopherurl=="")) {ShowHelpScreen();}



var dbPath = 'gopherlog.db';
var dbConn;

function sqlerror(tag,error)
{
	if (error!=null) {
		console.log("error tag: "+tag);
		console.log(error);
	} else
	if ((tag!=null) && (error!=null)) {
		console.log("error tag: N/A");
		console.log(tag);
	}
}

dbConn = new sqlite3.Database(dbPath);

dbConn.serialize(function() {

	if (flushdb!="") {
		dbConn.run("DROP TABLE Logs;", sqlerror.bind(this,"Drop Table") );
	}

	dbConn.run("CREATE TABLE Logs (ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, LogTimeStamp BIGINT, LogTime INTEGER DEFAULT (CURRENT_TIMESTAMP), ProjectID INTEGER DEFAULT (0)                          NOT NULL, LogCount INTEGER DEFAULT (1) NOT NULL, FileName STRING (255), ParentFileName STRING (255), LogType STRING (10), CodeLine INTEGER, VarName STRING (255), VarType STRING (20), VarValue BLOB, LogMessage BLOB, Tags STRING (255), DataFileName STRING (255) );", sqlerror.bind(this,"Create Table") );

	dbConn.run("CREATE INDEX LogTimeStamp ON Logs (LogTimeStamp);", sqlerror.bind(this,"Index 1") );
	dbConn.run("CREATE INDEX LogTime ON Logs (LogTime);", sqlerror.bind(this,"Index 2") );
	dbConn.run("CREATE INDEX FileName ON Logs (FileName);", sqlerror.bind(this,"Index 3") );
	dbConn.run("CREATE INDEX CodeLine ON Logs (CodeLine);", sqlerror.bind(this,"Index 4") );
	dbConn.run("CREATE INDEX Tags ON Logs (Tags);", sqlerror.bind(this,"Index 5") );
	dbConn.run("CREATE INDEX ProjectID ON Logs (ProjectID);", sqlerror.bind(this,"Index 6") );
	dbConn.run("CREATE INDEX DataFileName ON Logs (DataFileName);", sqlerror.bind(this,"Index 7") );
   dbConn.run("CREATE INDEX LogCount ON Logs (LogCount);", sqlerror.bind(this,"Index 8") );

	console.log("GOPHER: DB Loaded.");
});


if (stopclearcache=="") {
   console.log("GOPHER: Deleting Network Cache Files.");
   fs.readdirSync(__dirname + '/temp/').forEach(function(fileName) {
           if (path.extname(fileName) === ".txt") {
               fs.unlinkSync(__dirname + '/temp/'+fileName);
           }
       });
}



var HelperString = "";

function regexIndexOf(xstr, regex, startpos) {
	var indexOf = xstr.substring(startpos || 0).search(regex);
	return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

function lineNumberByIndex(index, string) {
	var line = 0;
	var match;
	var re = /(^)[\S\s]/gm;
	while (match = re.exec(string)) {
		if (match.index > index) break;
		line++;
	}
	return line;
}

function lineNumber(needle, haystack) {
	return lineNumberByIndex(haystack.indexOf(needle), haystack);
}





fs.readFile('new-gopher-insert.js', 'utf8', function(err, data) {
	if (err) {
		return console.log(err);
	}
	HelperString = data;
});

http.createServer(onRequest).listen(gopherPort);
console.log("GOPHER: Server started on port: "+gopherPort+".");


function onRequest(BrowserRequest, BrowserResponse) {

   if (BrowserRequest.url == "/gopherdata.js") {

      var body = "";
		BrowserRequest.on('data', function(data) {
			body += data;

			// Too much POST data, kill the connection!
			if (body.length > 1e6) {

				var ResponesBody = 'All Bad';
				BrowserResponse.writeHead(200, {
					'Content-Length': ResponesBody.length,
					'Content-Type': 'text/plain'
				});
				BrowserResponse.end(ResponesBody);

				BrowserRequest.connection.destroy();
			}
		});

		BrowserRequest.on('end', function() {
         var post = qs.parse(body);
//       console.log(post['LastID']);
         //var stmt = "SELECT * FROM logs ORDER BY ID DESC LIMIT 50";

         if (post['LastID']=="0") {
            var stmt = "SELECT * FROM (SELECT * FROM logs ORDER BY ID DESC limit 150) ORDER BY ID ASC"
         } else {
            var stmt = "SELECT * FROM (SELECT * FROM logs WHERE ID>"+ post['LastID'] +" ORDER BY ID DESC limit 150) ORDER BY ID ASC"
         }

         var DataArray = [];
         dbConn.each(stmt, function(err, row) {
            DataArray.push( {
               'ID' : (row.ID),
               'LogTimeStamp' : (row.LogTimeStamp),
               'LogTime' : row.LogTime,
               'ProjectID' : (row.ProjectID),
               'LogCount' : (row.LogCount),
               'FileName' : encodeURIComponent(row.FileName),
               'ParentFileName' : encodeURIComponent(row.ParentFileName),
               'LogType' : (row.LogType),
               'CodeLine' : (row.CodeLine),
               'VarName' : encodeURIComponent(row.VarName),
               'VarType' : (row.VarType),
               'VarValue' : encodeURIComponent(row.VarValue),
               'LogMessage' : encodeURIComponent(row.LogMessage),
               'Tags' : encodeURIComponent(row.Tags),
               'DataFileName' : (row.DataFileName) });

            //console.log(row.FileName);
         }, function() {
            var ResponesBody= JSON.stringify(DataArray);

            BrowserResponse.writeHead(200, {
               'Content-Length': ResponesBody.length,
               'Content-Type': 'application/json',
               'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Headers': 'X-Requested-With'
            });
            BrowserResponse.end(ResponesBody);
         });
      });

   } else

	if ((BrowserRequest.url == "/gopherSave.js") || (BrowserRequest.url == "/gopherPHPsave.js")) {
		var body = "";
		BrowserRequest.on('data', function(data) {
			body += data;

			// Too much POST data, kill the connection!
			if (body.length > 1e6) {

				var ResponesBody = 'All Bad';
				BrowserResponse.writeHead(200, {
					'Content-Length': ResponesBody.length,
					'Content-Type': 'text/plain'
				});
				BrowserResponse.end(ResponesBody);

				BrowserRequest.connection.destroy();
			}
		});

		BrowserRequest.on('end', function() {
			//console.log( decodeURIComponent(body) );
			if (BrowserRequest.url == "/gopherPHPsave.js") {
				//console.log("PHP Post");
				//            console.log(body);
				//            console.log("----------");

				var dataobj = JSON.parse(body);
				for (var i = 0; i < dataobj.length; i++) {
					//console.log(dataobj[i]);

					if (dataobj[i]["TY"] == "phpvar") {
						var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, ProjectID, LogCount, FileName, ParentFileName, LogType, CodeLine, VarName, VarType, VarValue, Tags  ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
						stmt.run(UniversalScriptTimeStamp, decodeURIComponent(dataobj[i]["PHPTS"]), ProjectID, decodeURIComponent(dataobj[i]["RE"]), decodeURIComponent(dataobj[i]["FN"]), decodeURIComponent(dataobj[i]["PFN"]), dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["VN"]), '', decodeURIComponent(dataobj[i]["VV"]), decodeURIComponent(dataobj[i]["TG"]));
						stmt.finalize();
					} else

					if ((dataobj[i]["TY"] == "phperror1") || (dataobj[i]["TY"] == "phperror2")) {

						var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, ProjectID, LogCount, FileName, ParentFileName, LogType, CodeLine, LogMessage, Tags  ) VALUES(?,?,?,?,?,?,?,?,?,?)");
						stmt.run(UniversalScriptTimeStamp, decodeURIComponent(dataobj[i]["PHPTS"]) , ProjectID, decodeURIComponent(dataobj[i]["RE"]), decodeURIComponent(dataobj[i]["FN"]), decodeURIComponent(dataobj[i]["PFN"]), dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["LG"]), decodeURIComponent(dataobj[i]["TG"]));
						stmt.finalize();
					}
				}

			} else

			if (BrowserRequest.url == "/gopherSave.js") {
				var post = qs.parse(body);
				var ParentFileName = post["ParentFileName"];
				var dataobj = JSON.parse(post["Data"]);

				var now2 = new Date();
				var offset = now2.getTimezoneOffset() * 60 * 1000;
				var UniversalScriptTimeStampTemp = +now2; // - offset; //save as utc


				for (var i = 0; i < dataobj.length; i++) {
					//console.log(i);
					//console.log(dataobj[i]);

					if (dataobj[i]["TY"] == "js_gt") {

						var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, ProjectID, LogCount, FileName, ParentFileName, LogType, CodeLine, LogMessage, Tags  ) VALUES(?,?,?,?,?,?,?,?,?,?)");
						stmt.run(UniversalScriptTimeStamp, UniversalScriptTimeStampTemp, ProjectID, dataobj[i]["RE"], decodeURIComponent(dataobj[i]["FN"]), decodeURIComponent(ParentFileName), dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["LG"]), decodeURIComponent(dataobj[i]["TG"]),
                     function(err, rows){
                        if (err==null) {
                           LastInsertJSLogID = this.lastID;
                        }
                  });
						stmt.finalize();
					} else

					if (dataobj[i]["TY"] == "js_vt") {

						var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, ProjectID, LogCount, FileName, ParentFileName, LogType, CodeLine, VarName, VarType, VarValue, Tags  ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
						stmt.run(UniversalScriptTimeStamp, UniversalScriptTimeStampTemp, ProjectID, dataobj[i]["RE"], decodeURIComponent(dataobj[i]["FN"]), decodeURIComponent(ParentFileName), dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["VN"]), dataobj[i]["VT"], decodeURIComponent(dataobj[i]["VV"]), decodeURIComponent(dataobj[i]["TG"]),
                     function(err, rows){
                        if (err==null) {
                           LastInsertJSVarID = this.lastID;
                        }
                  });
   					stmt.finalize();
					} else
					if (dataobj[i]["TY"] == "js_er") {
						var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, ProjectID, LogCount, FileName, ParentFileName, LogType, CodeLine, LogMessage, Tags  ) VALUES(?,?,?,?,?,?,?,?,?,?)");
						stmt.run(UniversalScriptTimeStamp, UniversalScriptTimeStampTemp, ProjectID, dataobj[i]["RE"], decodeURIComponent(dataobj[i]["FN"]), decodeURIComponent(ParentFileName), dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["LG"]), decodeURIComponent(dataobj[i]["TG"]));
						stmt.finalize();
					}
				}
			}

			var ResponesBody = 'All Good';
			BrowserResponse.writeHead(200, {
				'Content-Length': ResponesBody.length,
				'Content-Type': 'text/plain'
			});
			BrowserResponse.end(ResponesBody);
		});
	} else {
      if (ConsoleLogLvl>3) { console.log("LOAD: " + BrowserRequest.url); }

		var now2 = new Date();
		var offset = now2.getTimezoneOffset() * 60 * 1000;
		var UniversalScriptTimeStampTemp = +now2; // - offset; //save as utc

		var DataFileName = UniversalScriptTimeStampTemp+'R'+randomInt(1,1000);

      if ((BrowserRequest.url.indexOf('.htm') != -1) || (BrowserRequest.url.indexOf('.html') != -1) || (BrowserRequest.url.indexOf('.php') != -1)) {

         var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, ProjectID, FileName, ParentFileName, LogType, CodeLine, LogMessage, Tags, DataFileName  ) VALUES(?,?,?,?,?,?,?,?,?,?)");
   		stmt.run(UniversalScriptTimeStamp, UniversalScriptTimeStampTemp, ProjectID, decodeURIComponent(BrowserRequest.url), '', 'NETWORK', '0', '', '', DataFileName );
   		stmt.finalize();

		   fs.writeFile(__dirname + '/temp/'+DataFileName+'-header.txt', BrowserRequest.url+"\n\n"+stringifyObject(BrowserRequest.headers));
      }

		//--- force apache server to ignore browsers cache headers
		delete BrowserRequest.headers['cache-control'];
		delete BrowserRequest.headers['if-none-match'];
		delete BrowserRequest.headers['if-modified-since'];
		BrowserRequest.headers['pragma'] = 'no-cache';
		BrowserRequest.headers['cache-control'] = 'no-cache';

		//--- redirect php requests to go through Gopher.php as icludes so script errors can be tracked
		if ( (BrowserRequest.url.indexOf('.php') != -1) && (redirectphp=="yes") ) {
			var querystring = '';
			var OriginalURL = BrowserRequest.url;

			if (OriginalURL.indexOf('?') > 0) {
				querystring = OriginalURL.substring(OriginalURL.indexOf('?'));
			}

			var WithoutFilename = OriginalURL.substring(0, OriginalURL.lastIndexOf("/") + 1);

//			var GopherPHPurl = gopherurl + url.parse(OriginalURL).query;
			var GopherPHPurl = WithoutFilename + 'Gopher.php' + querystring;


			if (ConsoleLogLvl>0) { console.log("redirecing php to Gopher.php ........" + BrowserRequest.url + " to " + GopherPHPurl); }

			BrowserRequest.headers["GopherPHPFile"] = projectPath + BrowserRequest.url;
			BrowserRequest.url = GopherPHPurl;
		}

		var BufferData = false;

		if ((BrowserRequest.url.indexOf('.htm') != -1) ||
			(BrowserRequest.url.indexOf('.html') != -1) ||
			(BrowserRequest.url.indexOf('.css') != -1) ||
			(BrowserRequest.url.indexOf('.js') != -1) ||
			(BrowserRequest.url.indexOf('.php') != -1) ||
			(BrowserRequest.url.substr(BrowserRequest.url.length - 1) == "/")) {
			BufferData = true;
		}

		if ((BrowserRequest.url.indexOf('.htm') != -1) ||
			(BrowserRequest.url.indexOf('.html') != -1) ||
			(BrowserRequest.url.indexOf('.php') != -1)) {

				if (BrowserRequest.headers["x-requested-with"] == 'XMLHttpRequest') {
				    //is ajax request so don't update UniversalScriptTimeStamp
				} else {
					var now2 = new Date();
					var offset = now2.getTimezoneOffset() * 60 * 1000;
					UniversalScriptTimeStamp = +now2; // - offset; //save as utc

				}
		}


		var BrowserData = [];
		var ApacheChunk = [];

		var options = {
			host: projectHost,
			port: projectOnPort,
			path: projectPath + BrowserRequest.url,
			method: BrowserRequest.method,
			headers: BrowserRequest.headers
		};


		BrowserRequest.on('data', function(chunk) {
			BrowserData.push(chunk);
		});

		BrowserRequest.on('end', function() {

			//--------- START ASKING THE FILE FROM APACHE
         //console.log("Request page from server");
			var NodeProxyRequest = http.request(options, function(ApacheResponse) {
				//console.log("APACHE HEADER: %j", ApacheResponse.headers);

				ApacheResponse.on('data', function(chunk) {
					//console.log("on data... url:" + BrowserRequest.url + '\n');
					ApacheChunk.push(chunk);
				});

				ApacheResponse.on('end', function() {

					var ApacheBytes = Buffer.concat(ApacheChunk);

					if (BufferData) {
						//console.log("start change content for: "+BrowserRequest.url);
						//modify the urls in the page
						var chunkStr = decoder.write(ApacheBytes);
						var regx1 = new RegExp(projectHost, 'g');
						chunkStr = chunkStr.replace(regx1, gopherHost);
						var regx2 = new RegExp(projectHost + ':' + projectOnPort, 'g');
						chunkStr = chunkStr.replace(regx2, gopherHost + ':' + gopherPort);


						//if url is a real page add gopher helper to the end
						if ((BrowserRequest.url.indexOf('.htm') != -1) ||
							(BrowserRequest.url.indexOf('.html') != -1) ||
							(BrowserRequest.url.indexOf('.php') != -1) ||
							(BrowserRequest.url.substr(BrowserRequest.url.length - 1) == "/")) {
							if (chunkStr.search(new RegExp("\<body.{0,255}\>", "i")) !== -1) {

								var tempStr = BrowserRequest.url;
								var tempStr = tempStr.replace(/'/g, "\'");

								//console.log(BrowserRequest.headers);

								if (BrowserRequest.headers["GopherPHPFile"] != undefined) {
									tempStr = BrowserRequest.headers["GopherPHPFile"];
								}

								chunkStr += "<script>" + "var ParentFileName='" + tempStr + "';\n" + HelperString + "</script>";
							}
						}

						if (BrowserRequest.url.indexOf('.js') != -1) {
							var i = 0;

							var index = -1;

							var RegEx5 = RegExp('console\\.log\\((.*)\\)', 'igm');
							var searchRes;


							while ((searchRes = RegEx5.exec(chunkStr)) !== null) {

								consolbody = searchRes[1];
								consolbody = consolbody.trim();

								//console.log("BODY: " + consolbody + " " + RegEx5.lastIndex);

								var PartsOfConsol = CSVToArray.CSVToArray(consolbody, ',');

								//console.log(PartsOfConsol);
								//console.log("parts:"+PartsOfConsol[0].length);

								//we'll for now only parse console.log's with 1 value and 1 tag
								if (PartsOfConsol[0].length <= 2) {
									if ((consolbody.charAt(0) == "\"") || (consolbody.charAt(0) == "'")) {
										chunkStr = chunkStr.replace(RegExp('console\\.log\\(', 'i'), 'gopher.tell(' + lineNumberByIndex(RegEx5.index, chunkStr) + ',"' + BrowserRequest.url.replace(/"/g, '\\\\\"') + '",');
									} else {
										chunkStr = chunkStr.replace(RegExp('console\\.log\\(', 'i'), 'gopher.track(' + lineNumberByIndex(RegEx5.index, chunkStr) + ',"' + BrowserRequest.url.replace(/"/g, '\\\\\"') + '","' + PartsOfConsol[0][0] + '",');
									}
								}
							}
						}
						ApacheBytes = new Buffer(chunkStr, 'utf8');
					}

               if ((BrowserRequest.url.indexOf('.htm') != -1) || (BrowserRequest.url.indexOf('.html') != -1) || (BrowserRequest.url.indexOf('.php') != -1)) {
   					fs.writeFile(__dirname + '/temp/'+DataFileName+'-response-headers.txt', ApacheResponse.statusCode+"\n"+stringifyObject(ApacheResponse.headers));
   					fs.writeFile(__dirname + '/temp/'+DataFileName+'-response.txt', chunkStr);
               }

					ApacheResponse.headers['content-length'] = ApacheBytes.length;
					BrowserResponse.writeHead(ApacheResponse.statusCode, ApacheResponse.headers);
					BrowserResponse.write(ApacheBytes, 'binary');
					BrowserResponse.end();
				});

				ApacheResponse.on('error', function(e) {
					console.log('problem with proxy response: ' + e.message);
				});
			});

			//console.log("WRITE APACHE:"+decoder.write(BrowserData));
			var BrowserBytes = Buffer.concat(BrowserData);

         if ((BrowserRequest.url.indexOf('.htm') != -1) || (BrowserRequest.url.indexOf('.html') != -1) || (BrowserRequest.url.indexOf('.php') != -1)) {
			   fs.writeFile(__dirname + '/temp/'+DataFileName+'-post.txt', BrowserBytes);
         }

			NodeProxyRequest.write(BrowserBytes, 'binary');
			NodeProxyRequest.end();

		});


		BrowserRequest.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
	}
}
