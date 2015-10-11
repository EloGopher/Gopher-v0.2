var http = require('http');
var fs = require('fs');
var qs = require('querystring');

var sqlite3 = require('sqlite3').verbose();

var CSVToArray = require("./CSVToArray.js")

var dbPath = 'gopherlog.db';
var dbConn;

 fs.exists(dbPath, function (exists) {
     if (exists) {
         dbConn = new sqlite3.Database(dbPath);
     } else {
         console.log('Database does not exist.');
     }
 });





var ProjectID = 101;
var projectOnPort = 80;
var projectHost = 'testv2.phishproof.com'; // 'testv2.phishproof.com';
var gopherHost = 'localhost';
var gopherPort = 8080;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var HelperString = "";


function regexIndexOf (xstr, regex, startpos) {
   var indexOf = xstr.substring(startpos || 0).search(regex);
   return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

function lineNumberByIndex(index,string){
    var line = 0;
    var  match;
    var re = /(^)[\S\s]/gm;
    while (match = re.exec(string)) {
       if(match.index > index) break;
       line++;
    }
    return line;
}

function lineNumber(needle,haystack){
    return lineNumberByIndex(haystack.indexOf(needle),haystack);
}





fs.readFile('new-gopher-insert.js', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  HelperString = "var gopherTimeStamp = Math.floor(Date.now() / 1000);\n"+data;
});

http.createServer(onRequest).listen(gopherPort);


function onRequest(BrowserRequest, BrowserResponse) {

	if (BrowserRequest.url=="/gopherSave.js") {
      var body = "";
      BrowserRequest.on('data', function (data) {
         body += data;

         // Too much POST data, kill the connection!
         if (body.length > 1e6) {

            var ResponesBody = 'All Bad';
      		BrowserResponse.writeHead(200, { 'Content-Length': ResponesBody.length, 'Content-Type': 'text/plain' });
      		BrowserResponse.end(ResponesBody);

            BrowserRequest.connection.destroy();
         }
      });

      BrowserRequest.on('end', function () {
         //console.log( decodeURIComponent(body) );
         var dataobj = JSON.parse( body );


         for (var i=0; i<dataobj.length; i++)
         {
            //console.log(i);
            //console.log(dataobj[i]);

            if (dataobj[i]["TY"]=="js_gt") {
               var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, FileName, ParentFileName, LogType, CodeLine, LogMessage, Tags  ) VALUES(?,strftime(\"%s\", CURRENT_TIME),?,?,?,?,?,?)");
               stmt.run(dataobj[i]["TS"] , decodeURIComponent(dataobj[i]["FN"]), '', dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["LG"]), decodeURIComponent(dataobj[i]["TG"]) );
               stmt.finalize();
            } else
            if (dataobj[i]["TY"]=="js_vt") {
               var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, FileName, ParentFileName, LogType, CodeLine, VarName, VarType, VarValue, Tags  ) VALUES(?,strftime(\"%s\", CURRENT_TIME),?,?,?,?,?,?,?,?)");
               stmt.run(dataobj[i]["TS"] ,  decodeURIComponent(dataobj[i]["FN"]), '', dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["VN"]), dataobj[i]["VT"], decodeURIComponent(dataobj[i]["VV"]), decodeURIComponent(dataobj[i]["TG"]) );
               stmt.finalize();
            } else
            if (dataobj[i]["TY"]=="js_er") {
               var stmt = dbConn.prepare("INSERT INTO logs (LogTimeStamp, LogTime, FileName, ParentFileName, LogType, CodeLine, LogMessage, Tags  ) VALUES(?,strftime(\"%s\", CURRENT_TIME),?,?,?,?,?,?)");
               stmt.run(dataobj[i]["TS"] , decodeURIComponent(dataobj[i]["FN"]), '', dataobj[i]["TY"], dataobj[i]["LN"], decodeURIComponent(dataobj[i]["LG"]), decodeURIComponent(dataobj[i]["TG"]) );
               stmt.finalize();
            }

         }

         var ResponesBody = 'All Good';
   		BrowserResponse.writeHead(200, { 'Content-Length': ResponesBody.length, 'Content-Type': 'text/plain' });
   		BrowserResponse.end(ResponesBody);
      });
	} else
	{
		var options = {
			host: projectHost,
			port: projectOnPort,
			path: BrowserRequest.url,
			method: BrowserRequest.method,
			headers: BrowserRequest.headers
		};
		//console.log("---------------------------------------------------\n");
		console.log(BrowserRequest.url);

		//--- force proxy to reload everything and ignore browsers cache stuff
		delete BrowserRequest.headers['cache-control'];
		delete BrowserRequest.headers['if-none-match'];
		delete BrowserRequest.headers['if-modified-since'];

		BrowserRequest.headers['pragma'] = 'no-cache';
		BrowserRequest.headers['cache-control'] = 'no-cache';
	/*
		convert:
	'cache-control': 'max-age=0',
	'if-none-match': '"b5f8a8-5b18-51e0759a2d040"',
	'if-modified-since': 'Mon, 24 Aug 2015 04:50:01 GMT',
		to:
	'pragma': 'no-cache',
	'cache-control': 'no-cache',
	*/

		var BufferData = false;

		if ((BrowserRequest.url.indexOf('.htm')  != -1) ||
			 (BrowserRequest.url.indexOf('.html') != -1) ||
			 (BrowserRequest.url.indexOf('.js') != -1) ||
			 (BrowserRequest.url.indexOf('.php')  != -1) ||
		    (BrowserRequest.url.substr(BrowserRequest.url.length - 1) == "/") )
		{
			BufferData = true;
		}

		var BrowserData = [];
		var ApacheChunk = [];

		BrowserRequest.on('data', function(chunk) {
			BrowserData.push(chunk);
		});

		BrowserRequest.on('end', function() {
			var NodeProxyRequest = http.request(options, function(ApacheResponse) {
				//console.log("APACHE HEADER: %j", ApacheResponse.headers);

				ApacheResponse.on('data', function(chunk) {
					//console.log("on data... url:" + BrowserRequest.url + '\n');
					ApacheChunk.push(chunk);
				});

				ApacheResponse.on('end', function() {

					var ApacheBytes = Buffer.concat(ApacheChunk);

					if (BufferData)
					{
						console.log("star change content for: "+BrowserRequest.url);
						//modify the urls in the page
						var chunkStr = decoder.write(ApacheBytes);
						var regx1 = new RegExp('http://' + projectHost, 'g');
						chunkStr = chunkStr.replace(regx1, 'http://' + gopherHost);
						var regx2 = new RegExp('http://' + projectHost + ':' + projectOnPort, 'g');
						chunkStr = chunkStr.replace(regx2, 'http://' + gopherHost + ':' + gopherPort);


						//if url is a real page add gopher helper to the end
						if ((BrowserRequest.url.indexOf('.htm')  != -1) ||
							 (BrowserRequest.url.indexOf('.html') != -1) ||
							 (BrowserRequest.url.indexOf('.php')  != -1) ||
						    (BrowserRequest.url.substr(BrowserRequest.url.length - 1) == "/")  )
						{
							if (chunkStr.search(new RegExp("\<body.{0,255}\>", "i")) !== -1)
							{
								chunkStr += "<script>"+ HelperString +"</script>";
							}
						}

						if (BrowserRequest.url.indexOf('.js')  != -1) {
                     var i = 0;
                     var index=-1;

                     while((index= regexIndexOf(chunkStr,RegExp('console\\.log\\(','i'), index+1)) != -1) {

                        //console.log("! "+index);

                        var RegEx5 = RegExp('console\.log\\((.*)\\)','i');

                        var consolbody = RegEx5.exec(chunkStr)[1];
                        consolbody = consolbody.trim();

                        //console.log( consolbody );

                        var PartsOfConsol = CSVToArray.CSVToArray(consolbody,',');

                        //console.log(PartsOfConsol);
                        //console.log("parts:"+PartsOfConsol[0].length);

                        //we'll for now only parse console.log's with 1 value and 1 tag
                        if (PartsOfConsol[0].length<=2) {
                           if ( (consolbody.charAt(0) == "\"") || (consolbody.charAt(0) == "'") ) {
                              chunkStr = chunkStr.replace(RegExp('console\\.log\\(','i'), 'gopher.tell(' + lineNumberByIndex(index,chunkStr) + ',"' + BrowserRequest.url.replace(/"/g, '\\\\\"') + '",' );
                           } else
                           {
                              chunkStr = chunkStr.replace(RegExp('console\\.log\\(','i'), 'gopher.track(' + lineNumberByIndex(index,chunkStr) + ',"' + BrowserRequest.url.replace(/"/g, '\\\\\"') + '","'+ PartsOfConsol[0][0] +'",' );
                           }
                        }
                     }
						}

						//console.log("Chunk:"+chunkStr);

						ApacheBytes = new Buffer(chunkStr, 'utf8');
					}

					//console.log(decoder.write(ApacheChunk));

					console.log('On End ' + BrowserRequest.url+ ' --  ApacheBytes.length ' + ApacheBytes.length + '  -- ApacheResponse.headers content-length ' + ApacheResponse.headers['content-length']);

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
			NodeProxyRequest.write(BrowserBytes, 'binary');
			NodeProxyRequest.end();

		});


		BrowserRequest.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
	}
}
