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

var TempFilesArray = [];

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
	console.log("-pid <int> : Default is 101, this is the project ID that will be logged with every event.");
	console.log("-host : This is the server gopher will be pulling. ");
	console.log("-gopher <http://localhost> : This parameter will be used by the Browser extension.");
   console.log("-project <physical path> : Location of source on drive.");
   console.log("-stopclearcache : If this is not specified all network activity saved to the temp folder will be deleted.");
   console.log("-log <integer>: gopher log to console level ");
console.log("-help : This page.");
	console.log("");
	console.log("Example run:");
	console.log("node gopher -pid 1 -host localhost -project c:/www/myproject");
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

var projectOnPort = 80; //check if projectHost has :80 etc. then remove it from projectHost and update this var with it

var gopherHost = 'localhost';
if(process.argv.indexOf("-gopher") != -1){ gopherHost = process.argv[process.argv.indexOf("-gopher") + 1]; }

var gopherPort = 1337;  //check if gopherHost has :80 etc. then remove it from gopherHost and update this var with it

var showhelp = "";
if(process.argv.indexOf("-help") != -1){ showhelp="yes"; }

var stopclearcache = "";
if(process.argv.indexOf("-stopclearcache") != -1){ stopclearcache="yes"; }

if (projectOnPort!="80") {
   var gopherurl = "http://"+projectHost+":"+projectOnPort+"/";
} else
{
   var gopherurl = "http://"+projectHost+"/";
}

var projectfoler = "";
if(process.argv.indexOf("-project") != -1){ projectfoler = process.argv[process.argv.indexOf("-project") + 1]; }

var PathsArray = [];

function fromDir(startPath,filter){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter); //recurse
        }
        else if (path.extname(filename)==filter) {
         if (PathsArray.indexOf(startPath)==-1) {
            PathsArray.push(startPath);
            fs.writeFileSync(startPath+'/Gopher.php', fs.readFileSync(__dirname+'/Gopher.php'));
         }

//         console.log('-- found: ',filename);
        };
    };
};


if (projectfoler!="") {
   console.log("GOPHER: Copying gopher.php to project folder.")
   fs.writeFileSync(projectfoler+'/Gopher.php', fs.readFileSync(__dirname+'/Gopher.php'));
   //fromDir(projectfoler,'.php');
}


if (!fs.existsSync(projectfoler+'/Gopher.php')) {
   console.log("GOPHER: can't locate Gopher.php at "+projectfoler+"/Gopher.php");
   console.log('');
   console.log('please check gopher help by running "node gopher -help"');
   process.exit(1);
}

if (gopherurl!=="") {
	var post_data = 'op=hello';
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
			console.log("GOPHER: can't locate Gopher.php at "+gopherurl+"Gopher.php");
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



function fileExists(filePath)
{
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
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
   var currenttimestamp = new Date().getTime();

   if (TempFilesArray.length>0) {
      var ArrayLength=TempFilesArray.length-1;

      for (var i=ArrayLength; i>=0; i--) {
         if ( (currenttimestamp-TempFilesArray[i].createtime) > 5000) {
            if (fileExists(TempFilesArray[i].filename)) { fs.unlinkSync(TempFilesArray[i].filename); }
            TempFilesArray.splice(i, 1);
         }
      }
   }

   if (fileExists(projectfoler+"/gopher.log"))
   {
      var PHPLogs = fs.readFileSync(projectfoler+"/gopher.log");
      fs.unlinkSync(projectfoler+"/gopher.log");
      var strLines = PHPLogs.toString().split("\n");

       for (var i in strLines) {
         // console.log(i+" "+strLines[i]);
         try {
            var dataobj = JSON.parse(strLines[i]);

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

   			if ((dataobj["TY"] == "phperror1") || (dataobj["TY"] == "phperror2")) {
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
   			}
         } catch (e) {
            //
         }
      }
   }
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

	if (BrowserRequest.url == "/gopherSave.js")  { //respond to request made by gopher javascript helper inserted into HTML files
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
		   fs.writeFile(__dirname + '/temp/'+DataFileName+'-header.txt', stringifyObject(BrowserRequest.headers));
      }

		//--- force apache server to ignore browsers cache headers
		delete BrowserRequest.headers['cache-control'];
		delete BrowserRequest.headers['if-none-match'];
		delete BrowserRequest.headers['if-modified-since'];
		BrowserRequest.headers['pragma'] = 'no-cache';
		BrowserRequest.headers['cache-control'] = 'no-cache';

		//--- redirect php requests to go through Gopher.php as icludes so script errors can be tracked
		if (BrowserRequest.url.indexOf('.php') != -1)  {
			var querystring = '';
			var OriginalURL = BrowserRequest.url;
         var WithoutFilename = '';
         var withoutQueryURL = '';

			if (OriginalURL.indexOf('?') > 0) {
				querystring = OriginalURL.substring(OriginalURL.indexOf('?'));

            withoutQueryURL = OriginalURL.substring(0,OriginalURL.indexOf('?')-1);
            var WithoutFilename = withoutQueryURL.substring(0, withoutQueryURL.lastIndexOf("/") + 1);

			} else {
            withoutQueryURL = OriginalURL;
            var WithoutFilename = OriginalURL.substring(0, OriginalURL.lastIndexOf("/") + 1);
			}


//			var GopherPHPurl = WithoutFilename + 'Gopher.php' + querystring;

         if (fs.existsSync(projectfoler+withoutQueryURL)) {
            console.log('found file at '+projectfoler+withoutQueryURL+' ('+WithoutFilename+')');

            var TempNewFileName = withoutQueryURL;
            TempNewFileName = TempNewFileName.split('/');
            TempNewFileName = TempNewFileName[TempNewFileName.length-1];


            console.log('cloning and updating file to... '+projectfoler+WithoutFilename+'gopher-'+TempNewFileName);
            var temppaths=WithoutFilename.split("/");
            var upfolder = "";
            if (temppaths.length>2) {
               for (var i=0; i<temppaths.length-2; i++) { upfolder += "../"; }
            }
            var PhpSource = fs.readFileSync(projectfoler+withoutQueryURL,"utf-8");

            var index = -1;
            var RegEx5 = RegExp('\\/\\*gopher(.*):(.*)\\*\\/', 'igm');
            var searchRes;

            while ((searchRes = RegEx5.exec(PhpSource)) !== null) {
//             console.log(searchRes.index); console.log(searchRes[1]);

               var GopherInsertString = 'gopher('+ lineNumberByIndex(RegEx5.lastIndex, PhpSource) +', \'' + BrowserRequest.url.replace(/'"/g, '\\\'') + '\',\'' + searchRes[2].replace(/'/g, '\\\'') + '\','+ searchRes[2] + '); ';

               PhpSource = PhpSource.substring(0, searchRes.index) +GopherInsertString+PhpSource.substring(searchRes.index, PhpSource.length);

               RegEx5.lastIndex += GopherInsertString.length;
            }

            //add temp file to array so it can be deleted later
            TempFilesArray.push({filename:projectfoler+WithoutFilename+'gopher-'+TempNewFileName,createtime:new Date().getTime()});

            fs.writeFileSync(projectfoler+WithoutFilename+'gopher-'+TempNewFileName,'<?php include_once "'+upfolder+'Gopher.php"; ?>'+ PhpSource);
            var GopherPHPurl = WithoutFilename+'gopher-'+TempNewFileName + querystring;
            console.log(GopherPHPurl);

            BrowserRequest.headers["GopherPHPFile"] = BrowserRequest.url;
   			BrowserRequest.url = GopherPHPurl;
         } else {
            console.log('can\'t find file at '+projectfoler+withoutQueryURL+'. will not try to parse gopher tags (if any).');
         }
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
							}
						} else

						if (BrowserRequest.url.indexOf('.js') != -1) {
							var i = 0;

							var index = -1;

							var RegEx5 = RegExp('\\/\\*gopher(.*):(.*)\\*\\/', 'igm');
							var searchRes;

							while ((searchRes = RegEx5.exec(chunkStr)) !== null) {
//                        console.log(searchRes.index);
//                        console.log(searchRes[1]);

                        var GopherInsertString = 'console.log('+searchRes[2]+'); gopher.log('+ lineNumberByIndex(RegEx5.lastIndex, chunkStr) +', "' + BrowserRequest.url.replace(/"/g, '\\\"') + '","' + searchRes[2].replace(/"/g, '\\\"') + '",'+ searchRes[2] + '); ';

                        chunkStr = chunkStr.substring(0, searchRes.index) +GopherInsertString+chunkStr.substring(searchRes.index, chunkStr.length);

                        RegEx5.lastIndex += GopherInsertString.length;
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
