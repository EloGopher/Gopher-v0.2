//intereting concept getdefinedvar()
//http://stackoverflow.com/questions/24448998/is-it-possible-to-get-variables-with-get-defined-vars-but-for-the-actual-runni

/*

APACHE MAC MAMP create VirtualHost for gopher

listen 8081

<VirtualHost *:8081>
ServerName localhost:8081
DocumentRoot "/Users/ekim/gopherspace"

<Directory "/Users/ekim/gopherspace">

    Options All
    Options Indexes FollowSymLinks MultiViews


    #
    # AllowOverride controls what directives may be placed in .htaccess files.
    # It can be "All", "None", or any combination of the keywords:
    #   Options FileInfo AuthConfig Limit
    #
    AllowOverride All

    #
    # Controls who can get stuff from this server.
    #
    Order allow,deny
    Allow from all
	Header set Access-Control-Allow-Origin "*"
	Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"

</Directory>

# Other directives here
</VirtualHost>
*/

var http = require('http');
var http_php_requests = require('http');
var fs = require('fs');
var path = require("path");
var qs = require('querystring');
var url = require("url");
var chokidar = require('chokidar');

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


//------------------------------------------------------------------------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------------------------------------------------------------------------
function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

//------------------------------------------------------------------------------------------------------------------------------------------------
function getPort(url) {
    url = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+).*$/)[1] || url;
    var parts = url.split(':'),
        port = parseInt(parts[parts.length - 1], 10);
    if(parts[0] === 'http' && (isNaN(port) || parts.length < 3)) {
        return 80;
    }
    if(parts[0] === 'https' && (isNaN(port) || parts.length < 3)) {
        return 443;
    }
    if(parts.length === 1 || isNaN(port)) return 80;
    return port;
}

//------------------------------------------------------------------------------------------------------------------------------------------------
function regexIndexOf(xstr, regex, startpos) {
	var indexOf = xstr.substring(startpos || 0).search(regex);
	return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

//------------------------------------------------------------------------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------------------------------------------------------------------------
function lineNumber(needle, haystack) {
	return lineNumberByIndex(haystack.indexOf(needle), haystack);
}


//------------------------------------------------------------------------------------------------------------------------------------------------
function ShowHelpScreen()
{
	console.log("");
	console.log("");
	console.log("Gopher Help");
	console.log("-----------------------");
	console.log("-pid <int> : Default is 101, project ID that will be logged.");

   console.log("-source : This is the source of files gopher will be mirroring. ");
   console.log("-target : This is the folder which the clone server will use.");
	console.log("-host : This is the server gopher will be pulling from. ");
   console.log("-log <integer>: gopher log to console level ");

console.log("-help : This page.");
	console.log("");
	console.log("Example run:");
	console.log("node gopher -pid 1 -host localhost -project c:/www/myproject");
	console.log("");
	console.log("");
	process.exit(1);
}

//------------------------------------------------------------------------------------------------------------------------------------------------
function copyFileSync( source, target ) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

/*
    //if url is a real page add gopher helper to the end
   if ((BrowserRequest.url.indexOf('.htm') != -1) ||
      (BrowserRequest.url.indexOf('.html') != -1) ||
      (BrowserRequest.url.indexOf('.php') != -1) ||
      (BrowserRequest.url.substr(BrowserRequest.url.length - 1) == "/")) {
      if ((chunkStr.search(new RegExp("\<body.{0,255}\>", "i")) !== -1) && (!IsAjax) && (chunkStr.indexOf('<!--gopherscript-->')==-1)) {

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
*/

   if (path.extname(source)=='.php')
   {
      var shortpath = source;
      shortpath = shortpath.replace(SourceFolder,'');

      var PhpSource = fs.readFileSync(source,"utf-8");
      /*
      if (PhpSource.indexOf('<!--gopherscript-->')!=-1) {
         console.log('add gopher javascript helper');
         PhpSource = PhpSource.replace('<!--gopherscript-->','<!--gopherscript-->'+"<script>" + "var ParentFileName='" + BrowserRequest.url.replace(/'"/g, '\\\'') + "';\n" + HelperString + "</script>");
      }
      */


      var index = -1;
      var RegEx5 = RegExp('\\/\\*gopher(.*):(.*)\\*\\/', 'igm');
      var searchRes;

      while ((searchRes = RegEx5.exec(PhpSource)) !== null) {
         var GopherInsertString = 'gopher('+ lineNumberByIndex(RegEx5.lastIndex, PhpSource) +', \'' + shortpath.replace(/'"/g, '\\\'') + '\',\'' + searchRes[2].replace(/'/g, '\\\'') + '\','+ searchRes[2] + '); ';

         PhpSource = PhpSource.substring(0, searchRes.index) +GopherInsertString+PhpSource.substring(searchRes.index, PhpSource.length);

         RegEx5.lastIndex += GopherInsertString.length;
      }

      shortpath = path.dirname(shortpath);

      var temppaths=shortpath.split(path.sep);
      var upfolder = "";
      for (var i=0; i<temppaths.length-1; i++) { upfolder += "../"; }


      fs.writeFileSync(targetFile, '<?php include_once "'+upfolder+'Gopher.php"; ?>'+ PhpSource );
   } else {
      fs.writeFileSync(targetFile, fs.readFileSync(source));
   }
}



function copyFolderRecursiveSync( source, target, CreateFolder ) {
   var files = [];

   //check if folder needs to be created or integrated
   if (!CreateFolder) {
      var targetFolder = target;
   } else {
      var targetFolder = path.join( target, path.basename( source ) );
   }
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                if (file==".git") {} else {
                   copyFolderRecursiveSync( curSource, targetFolder,true );
                }
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

var ConsoleLogLvl = 1;
if(process.argv.indexOf("-log") != -1){ /*does our flag exist? grab the next item*/ ConsoleLogLvl = process.argv[process.argv.indexOf("-log") + 1]; }


var ProjectID = 101;
if(process.argv.indexOf("-pid") != -1){ ProjectID = process.argv[process.argv.indexOf("-pid") + 1]; }

var SourceFolder = "";
if(process.argv.indexOf("-source") != -1){ SourceFolder = process.argv[process.argv.indexOf("-source") + 1]; }

var TargetFolder = "";
if(process.argv.indexOf("-target") != -1){ TargetFolder = process.argv[process.argv.indexOf("-target") + 1]; }

var projectHost = ''; // 'localhost' 'testv2.phishproof.com';
var projectHTTP = 'http://';
var projectOnPort = 8081;

if(process.argv.indexOf("-host") != -1) {
   projectHost = process.argv[process.argv.indexOf("-host") + 1];

   if (projectHost.toLowerCase().indexOf('http://') != -1) {
      projectHTTP = 'http://';
   } else
   if (projectHost.toLowerCase().indexOf('https://') != -1) {
      projectHTTP = 'https://';
   }

   projectHost = projectHost.replace(/http:\/\//ig, '');
   projectHost = projectHost.replace(/https:\/\//ig, '');

   projectOnPort = getPort(projectHost);

   projectHost = projectHost.replace(':'+projectOnPort,'');
}

var gopherPort = 1337;  //check if gopherHost has :80 etc. then remove it from gopherHost and update this var with it

var showhelp = "";
if(process.argv.indexOf("-help") != -1){ showhelp="yes"; }


if (projectOnPort!="") {
   var gopherurl = projectHTTP+projectHost+":"+projectOnPort+"/";
} else
{
   var gopherurl = projectHTTP+projectHost+"/";
}


if ( (projectHost=="") || (showhelp!="") || (gopherurl=="") || (SourceFolder=="") || (TargetFolder=="")) {ShowHelpScreen();}


var HelperString = "";

fs.readFile('new-gopher-insert.js', 'utf8', function(err, data) {
	if (err) {
		return console.log(err);
	}
	HelperString = data;
});





if ((TargetFolder!=="") && (SourceFolder!=""))
{
   copyFolderRecursiveSync(SourceFolder,TargetFolder,false);
}

fs.writeFileSync(TargetFolder+'/Gopher.php', fs.readFileSync(__dirname+'/Gopher.php'));

chokidar.watch(SourceFolder, {ignored: /[\/\\]\.git/}).on('all', function(fileevent, filepath) {
   if (fileevent=="change") {
      var shortpath = filepath;
      shortpath = shortpath.replace(SourceFolder,'');
      if (shortpath.charAt(0) == path.sep) { shortpath = shortpath.substr(1);  }

      var copyto = TargetFolder+shortpath;
      if (TargetFolder.charAt(TargetFolder.length-1)!==path.sep) { copyto = TargetFolder+path.sep+shortpath; }


      console.log(fileevent, filepath, ' to ',copyto);
      copyFileSync( filepath, copyto );
   }
});


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

   post_req.on('error', function (chunk) {
      console.log("GOPHER: can't locate Gopher.php at "+gopherurl+"Gopher.php");
      console.log('');
      console.log('please check gopher help by running "node gopher -help"');
      process.exit(1);
   });

	post_req.write(post_data);
	post_req.end();
}

console.log("GOPHER: Deleting Network Cache Files.");
fs.readdirSync(__dirname + '/temp/').forEach(function(fileName) {
        if (path.extname(fileName) === ".txt") {
            fs.unlinkSync(__dirname + '/temp/'+fileName);
        }
    });



http.createServer(onRequest).listen(gopherPort);
console.log("GOPHER: Server started on port: "+gopherPort+".");

//------request data from php evey second

var php_requestLoop = setInterval(function(){
   var currenttimestamp = new Date().getTime();


   if (fileExists(projectfoler+"/gopher.log"))
   {
      var PHPLogs = fs.readFileSync(projectfoler+"/gopher.log");
      console.log('unlink: '+projectfoler+"/gopher.log");
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
*/
