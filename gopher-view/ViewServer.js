var global = require('./ViewServer_Global.js');
var sqlite3 = require('sqlite3');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var dbPath = '../node-proxy/gopherlog.db';
var db = undefined;

var ViewServer = http.createServer(onRequest).listen(1337, function(err) {
	console.log('**======================**=======================**=====================**')
	console.log('ViewServer is up.');
});

global.fs.exists(dbPath, function (exists) {
	if (exists) {
		db = new sqlite3.Database(dbPath);
		console.log('dbPath exists');
	} else {
		console.log('database path does not exist.');
	}
});

var FileMap = {
	root: __dirname+'/',
	getCleanFileName: function(_requestUrl) {
		var UrlObj = url.parse(_requestUrl);
		if (UrlObj.pathname !== '') {
			var FileName = '';
			var PathArr = UrlObj.pathname.split('/');
			FileName = PathArr[PathArr.length - 1];
			if (FileName.indexOf('.') === -1) {
				FileName = FileName + '.html';
			}
			return FileName;
		} else {
			return 'index.html';
		}
	},
	getFilePath: function(_requestUrl) {
		if(_requestUrl.search('/'+global.gopherViewRoot) > -1){
			_requestUrl = _requestUrl.replace('/'+global.gopherViewRoot,'');
		}
		return FileMap.root + _requestUrl;
	},
	getFileExtension: function(_requestUrl) {
		var DotArr = (FileMap.getCleanFileName(_requestUrl)).split('.');
		if (DotArr.length > 1 && DotArr[0] !== '') {
			return '.' + (DotArr[DotArr.length - 1]).toLowerCase();
		} else if (DotArr.length === 0 && DotArr[0].indexOf('.') === -1) {
			return '.html';
		} else {
			return '';
		}
	},
	getMimeType: function(_requestUrl) {
		return global.extensions[FileMap.getFileExtension(_requestUrl)];
	}
};


function getTimeSlots(_db,response){
	console.log('getTimeSlots()');
	_db.serialize(function(){
		var data = [];
		console.log('before select query');
		_db.each('SELECT * FROM Logs ORDER BY ID DESC', function (error, row) {
			console.log('select query call back');
			data.push(row);
			console.log('_db select push row');

		}, function complete() {
			var xresponse = JSON.stringify(data);
			console.log(xresponse.length);
			console.log(data.length);

			response.writeHead(200, { 'Content-Length': xresponse.length, 'Content-Type': 'text/plain' });
			response.end(xresponse);

//			console.log(data);

			//_callBack(null,result);
		});
	});
}


function onRequest(request, response) {
	var RequestUrl = request.url;
	if (RequestUrl === '/' || RequestUrl === '/' + global.gopherViewRoot || RequestUrl === '/' + global.gopherViewRoot + '/') {
		RequestUrl = '/gopher-view/index.html';
	} else if (RequestUrl.search('/' + global.gopherViewRoot) === -1) {
		RequestUrl = '/' + global.gopherViewRoot + RequestUrl;
	}

	if (RequestUrl.indexOf('/' + global.gopherViewRoot) === 0) {
		viewOnHttpRequest(request, response, RequestUrl);
	}

	//mangerOnHttpRequest(request, response, RequestUrl);
	request.on('end', function() {});
}

function viewOnHttpRequest(request, response, requestUrl) {
	if (!global.extensions[FileMap.getFileExtension(requestUrl)]) {
		console.log("404 not found on 2: " + requestUrl);
		response.writeHead(404, {
			'Content-Type': 'text/html'
		});
		response.end("<html><head></head><body>The requested file type is not supported</body></html>");

	} else {
		console.log(request.url);

		if (request.url == "/timeband.js")  {

			console.log('is a XMLhttpRequest');

			var body = '';

			request.on('data',function(data){
				body += data;
				if(body.length > 1e6){
					request.connection.destroy();
				}
			});

			request.on('end',function(){
				if(request.method === 'POST'){
					var post = qs.parse(body);
					console.log(post.task);
					if (post.task=="getAllTimeSlots") { getTimeSlots(db,response); }
				}
			});

		} else {
			console.log(requestUrl);
			console.log(request.headers['x-requested-with']);

			var FilePath = FileMap.getFilePath(requestUrl);
			console.log(FilePath);
			console.log('***********************');
			global.fs.exists(FilePath, function(exists) {
				if (exists) {
					global.fs.readFile(FilePath, function(err, contents) {
						if (!err) {
							response.writeHead(200, {
								"Content-type": FileMap.getMimeType(requestUrl),
								"Content-Length": contents.length
							});
							response.end(contents);
						} else {
							console.dir(err);
						}
					});
				} else {
					console.log("404 not found on: " + requestUrl);
					global.fs.readFile('./' + global.gopherViewRoot + '/404.html', function(err, contents) {
						if (!err) {
							response.writeHead(404, {
								'Content-Type': 'text/html'
							});
							response.end(contents);
						} else {
							console.dir(err);
						};
					});
				};
			});

		}
	}
}
