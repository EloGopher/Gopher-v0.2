var fs = require('fs');
var http = require('http');
var url = require('url');
var path = require('path');
var queryString = require('querystring');

var gopherViewRoot = 'gopher-view';

var Global = require('./ServerB_Global.js');

var ViewServer = http.createServer(onRequest).listen(1337, function(err) {

});

var FileMap = {
	root: __dirname + '/',
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
		var PhysicalDirName = path.dirname(_requestUrl);
		if (PhysicalDirName !== '/') {
			PhysicalDirName += '/';
		}
		return FileMap.root + PhysicalDirName + FileMap.getCleanFileName(_requestUrl);
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
		return Global.extensions[FileMap.getFileExtension(_requestUrl)];
	}
};

function onRequest(request, response) {
	var RequestUrl = request.url;

	if (RequestUrl === '/' || RequestUrl === '/' + gopherViewRoot || RequestUrl === '/' + gopherViewRoot + '/') {
		RequestUrl = '/gopher-view/index.html';
	} else if (RequestUrl.search('/' + gopherViewRoot) === -1) {
		RequestUrl = '/' + gopherViewRoot + '/' + RequestUrl;
	}

	if (RequestUrl.indexOf('/' + gopherViewRoot) === 0) {
		mangerOnHttpRequest(request, response, RequestUrl);
	}

	request.on('end', function() {});
}

function mangerOnHttpRequest(request, response, requestUrl) {
	if (!Global.extensions[FileMap.getFileExtension(requestUrl)]) {
		console.log("404 not found on 2: " + requestUrl);
		response.writeHead(404, {
			'Content-Type': 'text/html'
		});
		response.end("<html><head></head><body>The requested file type is not supported</body></html>");

	} else {
		if (request.headers['x-requested-with'] !== 'XMLHttpRequest') {
			var FilePath = FileMap.getFilePath(requestUrl);
			fs.exists(FilePath, function(exists) {
				if (exists) {
					fs.readFile(FilePath, function(err, contents) {
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
					consoel.log("404 not found on: " + requestUrl);
					fs.readFile('./' + gopherViewRoot + '/404.html', function(err, contents) {
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
		} else {
			
		}
	}
}


