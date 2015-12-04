//intereting concept getdefinedvar()
//http://stackoverflow.com/questions/24448998/is-it-possible-to-get-variables-with-get-defined-vars-but-for-the-actual-runni

var http = require('http');
var http_php_requests = require('http');
var fs = require('fs');
var path = require("path");
var qs = require('querystring');
var url = require("url");

var dBInsertID = 0;
var gopherMemorydB = [];

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
	console.log("-pid <integer> : Default is 101, this is the project ID that will be logged with every event.");
	console.log("-host <localhost> : No defaut, this has to be specified. This is the server gopher will be pulling through it's proxy. ");
	console.log("-port <integer> : Default is 80. Port of server which gopher will be pulling.");
   console.log("-path <string> : Default blank. If Gopher.php is located in some subfolder of host please enter the path here. ");
	console.log("-gopherhost <http://localhost> : Default localhost. This parameter will be used by the Browser extension. Also all log messages will be sent to the gopher host and port. ");
	console.log("-gopherport <integer> : Defalth 1337. Port of above parameter.");
	console.log("-flushdb : Delete all data stored in SQLLite database.");
   console.log("-stopclearcache : If this is not specified all network activity saved to the temp folder will be deleted.");
	console.log("-redirectphp <yes/no> : Defalut yes. To trap and log all php runtime errors, all php files requested has to go through Gopher.php on the server. If you don't want the Gopher proxy to request php files through Gopher.php then you should set this to \"no\".");
   console.log("-log <integer>: gopher log to console level ");
console.log("-help : This page.");
	console.log("");
	console.log("Example run:");
	console.log("node gopher -pid 1 -host localhost -path phishproof/");
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

var gopherHost = 'localhost';
if(process.argv.indexOf("-gopherhost") != -1){ gopherHost = process.argv[process.argv.indexOf("-gopherhost") + 1]; }

var gopherPort = 1337;
if(process.argv.indexOf("-gopherport") != -1){ gopherPort = process.argv[process.argv.indexOf("-gopherport") + 1]; }

var showhelp = "";
if(process.argv.indexOf("-help") != -1){ showhelp="yes"; }

var flushdb = "";
if(process.argv.indexOf("-flushdb") != -1){ flushdb="yes"; }

var stopclearcache = "";
if(process.argv.indexOf("-stopclearcache") != -1){ stopclearcache="yes"; }

var redirectphp = "yes";
if(process.argv.indexOf("-redirectphp") != -1){ redirectphp = process.argv[process.argv.indexOf("-redirectphp") + 1]; }

var gpath = "";
if(process.argv.indexOf("-path") != -1){ gpath = process.argv[process.argv.indexOf("-path") + 1]; }

if (projectOnPort!="80") {
   var gopherurl = "http://"+projectHost+":"+projectOnPort+"/"+gpath;
} else
{
   var gopherurl = "http://"+projectHost+"/"+gpath;
}


if (gopherurl!=="") {
	var post_data = 'op=copyself';
	var options = {
			method: 'POST',
			host: url.parse(gopherurl+'Gopher.php').host,
			port: 80,
			path: url.parse(gopherurl+'Gopher.php').pathname,
			headers: {
	         'Content-Type': 'application/x-www-form-urlencoded',
	         'Content-Length': Buffer.byteLength(post_data)
	      }
		};

	var post_req = http_php_requests.request(options, function(r) {
		r.on('data', function (chunk) {
          console.log('GOPHER: PHP Response = ' + chunk);
      });

		if (r.statusCode != 200) {
			console.log("GOPHER: can't locate Gopher.php at "+gopherurl);
         console.log('');
         console.log('please check gopher help by running "node gopher -help"');
      	process.exit(1);
		} else {
			console.log("GOPHER: Gopher.php located at "+gopherurl);
		}
	});

	post_req.write(post_data);
	post_req.end();
}

if ( (projectHost=="") || (showhelp!="") || (gopherurl=="")) {ShowHelpScreen();}

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

//------request data from php evey second
var php_requestLoop = setInterval(function(){
   var php_post_data = 'op=getlogs';
	var php_options = {
			method: 'POST',
			host: url.parse(gopherurl+'Gopher.php').host,
			port: 80,
			path: url.parse(gopherurl+'Gopher.php').pathname,
			headers: {
	         'Content-Type': 'application/x-www-form-urlencoded',
	         'Content-Length': Buffer.byteLength(php_post_data)
	      }
		};

	var php_post_req = http_php_requests.request(php_options, function(r) {
		r.on('data', function (chunk) {
          //console.log('GOPHER PHP REQUEST:' + chunk);
          if (chunk=="nothing new") {

          } else {
             var strLines = chunk.toString().split("\n");

             for (var i in strLines) {
                console.log(strLines[i]);
               var dataobj = JSON.parse(strLines[i]);
/*
               if (dataobj["TY"] == "phpvar") {
                  dBInsertID++;
                  var NewLog = {
                     'ID' : dBInsertID,
                     'LogTimeStamp' : UniversalScriptTimeStamp,
                     'LogTime' : dataobj["PHPTS"],
                     'ProjectID' : ProjectID,
                     'LogCount' : dataobj["RE"],
                     'FileName' : dataobj["FN"],
                     'ParentFileName' : dataobj["PFN"],
                     'LogType' : dataobj["TY"],
                     'CodeLine' : dataobj["LN"],
                     'VarName' : dataobj["VN"],
                     'VarType' : '',
                     'VarValue' : dataobj["VV"]
                  }
                  gopherMemorydB.push( NewLog );
					} else

					if ((dataobj[i]["TY"] == "phperror1") || (dataobj[i]["TY"] == "phperror2")) {
                  dBInsertID++;
                  var NewLog = {
                     'ID' : dBInsertID,
                     'LogTimeStamp' : UniversalScriptTimeStamp,
                     'LogTime' : dataobj["PHPTS"],
                     'ProjectID' : ProjectID,
                     'LogCount' : dataobj["RE"],
                     'FileName' : dataobj["FN"],
                     'ParentFileName' : dataobj["PFN"],
                     'LogType' : dataobj["TY"],
                     'CodeLine' : dataobj["LN"],
                     'LogMessage' : dataobj["LG"]
                  }
                  gopherMemorydB.push( NewLog );
					}*/

             }
          }
      });

		if (r.statusCode != 200) {
			console.log("GOPHER: can't locate Gopher.php at "+gopherurl);
         console.log('');
         console.log('please check gopher help by running "node gopher -help"');
      	process.exit(1);
		} else {
			//console.log("GOPHER PHP REQUEST DONE");
		}
	});

	php_post_req.write(php_post_data);
	php_post_req.end();
}, 1000);


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

         if ((typeof post['DataFile'] !== 'undefined') && (post['DataFile'] !== 'undefined') && (post['DataFile'] !== null)){
            var DataFile = post['DataFile'];
            //console.log('reading datafile...'+DataFile);
            try {
               var header = fs.readFileSync(__dirname + '/temp/'+ DataFile + "-header.txt" ).toString();
            } catch (e) {
               var header = "not found.";
            }

            try {
               var post = fs.readFileSync(__dirname + '/temp/'+ DataFile + "-post.txt" ).toString();
            } catch (e) {
               var post = "not found.";
            }

            try {
               var responseheaders = fs.readFileSync(__dirname + '/temp/'+ DataFile + "-response-headers.txt" ).toString();
            } catch (e) {
               var responseheaders = __dirname + '/temp/'+ DataFile + "-response-headers.txt" + "... not found.";
            }

            try {
               var response = fs.readFileSync(__dirname + '/temp/'+ DataFile + "-response.txt" ).toString();
            } catch (e) {
               var response = __dirname + '/temp/'+ DataFile + "-response.txt"+"... not found.";
            }


            var DataArray = [];
            DataArray.push( {
               'header' : encodeURIComponent(header),
               'post' : encodeURIComponent(post),
               'responseheaders' : encodeURIComponent(responseheaders),
               'response' : encodeURIComponent(response)
            });
            var ResponesBody= JSON.stringify(DataArray);

            BrowserResponse.writeHead(200, {
               'Content-Length': ResponesBody.length,
               'Content-Type': 'application/json',
               'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Headers': 'X-Requested-With'
            });
            BrowserResponse.end(ResponesBody);
         } else

         if ( (typeof post['LastID'] !== 'undefined') && (post['LastID'] !== 'undefined') && (post['LastID'] !== null)){
            //console.log('get last id:   '+post['LastID']);
            var DataArray = [];

            if (post['LastID']=="0") {

               var DataLen = gopherMemorydB.length;
               DataStart =DataLen-150;
               if (DataStart<0) { DataStart = 0;}
            } else {
               DataStart = parseInt(post['LastID'],10);
            }

            var DataLen = gopherMemorydB.length;

            if (DataStart<DataLen) {
               for (index = DataStart; index < DataLen; index++) {
                  DataArray.push( {
                     'ID' : (gopherMemorydB[index].ID),

                     'LogTimeStamp' : (gopherMemorydB[index].LogTimeStamp),
                     'LogTime' : gopherMemorydB[index].LogTime,
                     'ProjectID' : (gopherMemorydB[index].ProjectID),
                     'LogCount' : (gopherMemorydB[index].LogCount),
                     'FileName' : (gopherMemorydB[index].FileName),
                     'ParentFileName' : (gopherMemorydB[index].ParentFileName),
                     'LogType' : (gopherMemorydB[index].LogType),
                     'CodeLine' : (gopherMemorydB[index].CodeLine),
                     'VarName' : (gopherMemorydB[index].VarName),
                     'VarType' : (gopherMemorydB[index].VarType),
                     'VarValue' : (gopherMemorydB[index].VarValue),
                     'LogMessage' : (gopherMemorydB[index].LogMessage),
                     'DataFileName' : (gopherMemorydB[index].DataFileName)
                  });

                  //console.log(gopherMemorydB[index].ID+" "+gopherMemorydB[index].LogType+" "+gopherMemorydB[index].LogTime);
               }
            }


            var ResponesBody= JSON.stringify(DataArray);

            BrowserResponse.writeHead(200, {
               'Content-Length': ResponesBody.length,
               'Content-Type': 'application/json',
               'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Headers': 'X-Requested-With'
            });
            BrowserResponse.end(ResponesBody);
         } else {
            console.log('unknown Gopher data request.');
         }
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

				var dataobj = JSON.parse(body);
				for (var i = 0; i < dataobj.length; i++) {
					//console.log(dataobj[i]);

					if (dataobj[i]["TY"] == "phpvar") {
                  dBInsertID++;
                  var NewLog = {
                     'ID' : dBInsertID,
                     'LogTimeStamp' : UniversalScriptTimeStamp,
                     'LogTime' : dataobj[i]["PHPTS"],
                     'ProjectID' : ProjectID,
                     'LogCount' : dataobj[i]["RE"],
                     'FileName' : dataobj[i]["FN"],
                     'ParentFileName' : dataobj[i]["PFN"],
                     'LogType' : dataobj[i]["TY"],
                     'CodeLine' : dataobj[i]["LN"],
                     'VarName' : dataobj[i]["VN"],
                     'VarType' : '',
                     'VarValue' : dataobj[i]["VV"]
                  }
                  gopherMemorydB.push( NewLog );
					} else

					if ((dataobj[i]["TY"] == "phperror1") || (dataobj[i]["TY"] == "phperror2")) {
                  dBInsertID++;
                  var NewLog = {
                     'ID' : dBInsertID,
                     'LogTimeStamp' : UniversalScriptTimeStamp,
                     'LogTime' : dataobj[i]["PHPTS"],
                     'ProjectID' : ProjectID,
                     'LogCount' : dataobj[i]["RE"],
                     'FileName' : dataobj[i]["FN"],
                     'ParentFileName' : dataobj[i]["PFN"],
                     'LogType' : dataobj[i]["TY"],
                     'CodeLine' : dataobj[i]["LN"],
                     'LogMessage' : dataobj[i]["LG"]
                  }
                  gopherMemorydB.push( NewLog );
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
					if (dataobj[i]["TY"] == "js_vt") {

                  dBInsertID++;
                  var NewLog = {
                     'ID' : dBInsertID,
                     'LogTimeStamp' : UniversalScriptTimeStamp,
                     'LogTime' : UniversalScriptTimeStampTemp,
                     'ProjectID' : ProjectID,
                     'LogCount' : dataobj[i]["RE"],
                     'FileName' : dataobj[i]["FN"],
                     'ParentFileName' : ParentFileName,
                     'LogType' : dataobj[i]["TY"],
                     'CodeLine' : dataobj[i]["LN"],
                     'VarName' : dataobj[i]["VN"],
                     'VarType' : dataobj[i]["VT"],
                     'VarValue' : dataobj[i]["VV"]
                  }
                  gopherMemorydB.push( NewLog );
					} else
					if (dataobj[i]["TY"] == "js_er") {

                  dBInsertID++;
                  var NewLog = {
                     'ID' : dBInsertID,
                     'LogTimeStamp' : UniversalScriptTimeStamp,
                     'LogTime' : UniversalScriptTimeStampTemp,
                     'ProjectID' : ProjectID,
                     'LogCount' : dataobj[i]["RE"],
                     'FileName' : dataobj[i]["FN"],
                     'ParentFileName' : ParentFileName,
                     'LogType' : dataobj[i]["TY"],
                     'CodeLine' : dataobj[i]["LN"],
                     'LogMessage' : dataobj[i]["LG"]
                  }
                  gopherMemorydB.push( NewLog );
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
      var IsAjax = false;

      if (BrowserRequest.headers["x-requested-with"] == 'XMLHttpRequest') {
          DataFileName = "AJAX-"+DataFileName;
          IsAjax = true;
      }


      if ((BrowserRequest.url.indexOf('.htm') != -1) || (BrowserRequest.url.indexOf('.html') != -1) || (BrowserRequest.url.indexOf('.php') != -1)) {
         dBInsertID++;
         var NewLog = {
            'ID' : dBInsertID,
            'LogTimeStamp' : UniversalScriptTimeStamp,
            'LogTime' : UniversalScriptTimeStampTemp,
            'ProjectID' : ProjectID,
            'FileName' : BrowserRequest.url,
            'LogType' : 'NETWORK',
            'DataFileName' : DataFileName
         }
         gopherMemorydB.push( NewLog );
         /*

         var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, ProjectID, FileName, ParentFileName, LogType, CodeLine, LogMessage, Tags, DataFileName  ) VALUES(?,?,?,?,?,?,?,?,?,?)");
   		stmt.run(UniversalScriptTimeStamp, UniversalScriptTimeStampTemp, ProjectID, decodeURIComponent(BrowserRequest.url), '', 'NETWORK', '0', '', '', DataFileName );
   		stmt.finalize();
         */
		   fs.writeFile(__dirname + '/temp/'+DataFileName+'-header.txt', stringifyObject(BrowserRequest.headers));
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

            withoutQueryURL = OriginalURL.substring(0,OriginalURL.indexOf('?')-1);
            var WithoutFilename = withoutQueryURL.substring(0, withoutQueryURL.lastIndexOf("/") + 1);

			} else {
            var WithoutFilename = OriginalURL.substring(0, OriginalURL.lastIndexOf("/") + 1);
			}


//			var GopherPHPurl = gopherurl + url.parse(OriginalURL).query;
			var GopherPHPurl = WithoutFilename + 'Gopher.php' + querystring;


			if (ConsoleLogLvl>0) { console.log("redirecing php to Gopher.php ........" + BrowserRequest.url + " to " + GopherPHPurl); }

			BrowserRequest.headers["GopherPHPFile"] = BrowserRequest.url;
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
			path: BrowserRequest.url,
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

            //-------- IF Content-Type is not text/html or text/plain then dont try to convert it text with the BufferData boolean flag
            //console.log(ApacheResponse.headers["content-type"]);
            var FileContentType = ApacheResponse.headers["content-type"];

            if ( (FileContentType.indexOf("text/")>=0) || (FileContentType.indexOf("application/")>=0)  ) {
               //---
            } else {
               console.log("setting buffer data to false because of content-type: "+ApacheResponse.headers["content-type"]);
               BufferData= false;
            }

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

                  if ((BrowserRequest.url.indexOf('.htm') != -1) || (BrowserRequest.url.indexOf('.html') != -1) || (BrowserRequest.url.indexOf('.php') != -1)) {
      					fs.writeFile(__dirname + '/temp/'+DataFileName+'-response-headers.txt', ApacheResponse.statusCode+"\n"+stringifyObject(ApacheResponse.headers));
      					fs.writeFile(__dirname + '/temp/'+DataFileName+'-response.txt', chunkStr);
                  }

                  //update absoulte url paths to the gopher proxy url and port
                  /*

                  -- this block is buggy as it will replace any variable or string that contains the url as well
                  -- should be fixed in v1.2


                  var regx1 = new RegExp(projectHost, 'g');
						chunkStr = chunkStr.replace(regx1, gopherHost + ':' + gopherPort);

						var regx2 = new RegExp(projectHost + ':' + projectOnPort, 'g');
						chunkStr = chunkStr.replace(regx2, gopherHost + ':' + gopherPort);
                  */

						//if url is a real page add gopher helper to the end
						if ((BrowserRequest.url.indexOf('.htm') != -1) ||
							(BrowserRequest.url.indexOf('.html') != -1) ||
							(BrowserRequest.url.indexOf('.php') != -1) ||
							(BrowserRequest.url.substr(BrowserRequest.url.length - 1) == "/")) {
							if ((chunkStr.search(new RegExp("\<body.{0,255}\>", "i")) !== -1) && (!IsAjax)) {

								var tempStr = BrowserRequest.url;
								var tempStr = tempStr.replace(/'/g, "\'");

								//console.log(BrowserRequest.headers);

								if (BrowserRequest.headers["GopherPHPFile"] != undefined) {
									tempStr = BrowserRequest.headers["GopherPHPFile"];
								}

                        //dont insert if content has body but no head
                        var postoinsert = chunkStr.search(new RegExp("\<head.{0,255}\>", "i"));
                        if (postoinsert !== -1) {
                           chunkStr = chunkStr.substr(0, postoinsert) + "<script>" + "var ParentFileName='" + tempStr + "';\n" + HelperString + "</script>" + chunkStr.substr(postoinsert);
                        }

								//chunkStr = "<script>" + "var ParentFileName='" + tempStr + "';\n" + HelperString + "</script>"+chunkStr;
							}
						}

						if (BrowserRequest.url.indexOf('.js') != -1) {
							var i = 0;

							var index = -1;

							var RegEx5 = RegExp('[\\n\\r\\s]console\\.log', 'igm');
							var searchRes;

							while ((searchRes = RegEx5.exec(chunkStr)) !== null) {


                        //------- parse begin and end paranthesis and extract the parameters within and not get fooled and tricked by nested quotes and paranthesises that ApacheResponse
                        //------- not part of the parameter or the console.log( ) start and end paranthesis
                        //console.log(searchRes.index+" "+RegEx5.lastIndex);
                        var stillSearching=true;
                        var LogStart = -1;
                        var LogEnd = -1;

                        currPos = searchRes.index;
                        while (stillSearching && currPos <= chunkStr.length) {
                          var currChar = chunkStr.charAt(currPos);
                          if (currChar=="(") { stillSearching=false; LogStart=currPos; }
                          currPos++;
                        }

                        var stillSearching=true;
                        var ParanthesisCount = 1;
                        var QuoteCount = 0;
                        var DoubleQuoteCount = 0;
                        var StartString = false;
                        var StartQuote = "";
                        var PrevChar = "";
                        var BracketCount = 0;
                        var CurlyBracketCount = 0;

                        var LastParametePos = currPos;
                        var HasMoreThanOneParameter = false;

                        var LogParams = [];

                        while (stillSearching && currPos <= chunkStr.length) {
                           var currChar = chunkStr.charAt(currPos);

                           if ( ((currChar=="\"") ||  (currChar=="'")) && (!StartString) ) {
                              StartQuote = currChar;
                              StartString = true;
                           } else

                           if ( ((currChar=="\"") || (currChar=="'")) && (StartString) && (PrevChar!="\\") && (currChar==StartQuote) ) {
                              StartString = false;
                           }

                           if ( (!StartString) && (ParanthesisCount==1) && (CurlyBracketCount==0) && (BracketCount==0) && (currChar==",") )
                           {
                              //console.log("PARAM:"+ chunkStr.substring(LastParametePos , currPos) );
                              LogParams.push( chunkStr.substring(LastParametePos , currPos) );
                              LastParametePos = currPos+1;
                              HasMoreThanOneParameter=true;
                           }


                           if (!StartString) {
                              if (currChar=="(") {  ParanthesisCount++; }
                              if (currChar==")") {  ParanthesisCount--; }

                              if (currChar=="[") {  BracketCount++; }
                              if (currChar=="]") {  BracketCount--; }

                              if (currChar=="{") {  CurlyBracketCount++; }
                              if (currChar=="}") {  CurlyBracketCount--; }
                           }

                          if (ParanthesisCount==0) { stillSearching=false; LogEnd = currPos; }

                          currPos++;
                          PrevChar = currChar;
                        }
                        if (HasMoreThanOneParameter) {
//                           console.log( "PARAM:"+chunkStr.substring(LastParametePos , currPos-1) );
                           LogParams.push( chunkStr.substring(LastParametePos , currPos-1) );
                        } else {
//                           console.log("single parameter");
//                           console.log( "PARAM:"+chunkStr.substring(LogStart+1 , LogEnd) );
                           LogParams.push( chunkStr.substring(LogStart+1 , LogEnd) );
                        }
                        if ((LogStart>=0) && (LogEnd>LogStart)) {
//                           console.log("Start End: "+LogStart+" "+LogEnd);
//                           console.log( lineNumberByIndex(RegEx5.lastIndex, chunkStr) + " " + chunkStr.substring(LogStart , LogEnd+1) );
//                           console.log( "params:" + LogParams.length );

                           if (LogParams.length==1)
                           {
                              var GopherInsertString = 'gopher.log('+ lineNumberByIndex(RegEx5.lastIndex, chunkStr) +', "' + BrowserRequest.url.replace(/"/g, '\\\"') + '","' + LogParams[0].replace(/"/g, '\\\"') + '",'+ LogParams[0] + '); ';

                              chunkStr = chunkStr.substring(0, searchRes.index) +GopherInsertString+chunkStr.substring(searchRes.index, chunkStr.length);

                              RegEx5.lastIndex += GopherInsertString.length;
                           }
                        }
							}
						}


						ApacheBytes = new Buffer(chunkStr, 'utf8');
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
