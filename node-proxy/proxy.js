var http = require('http');
var projectOnPort = 80;
var projectHost = 'testv2.phishproof.com';
var gopherHost = 'localhost';
var gopherPort = 8080;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

http.createServer(onRequest).listen(gopherPort);


function onRequest(BrowserRequest, BrowserResponse) {
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

	console.log(BrowserRequest.headers['cache-control']);

/*
	convert:

'cache-control': 'max-age=0',
'if-none-match': '"b5f8a8-5b18-51e0759a2d040"',
'if-modified-since': 'Mon, 24 Aug 2015 04:50:01 GMT',

	to:

'pragma': 'no-cache',
'cache-control': 'no-cache',

*/
//-------------------------


	var BufferData = false;

	if ((BrowserRequest.url.indexOf('.htm')  != -1) ||
		 (BrowserRequest.url.indexOf('.html') != -1) ||
		 (BrowserRequest.url.indexOf('.js') != -1) ||
		 (BrowserRequest.url.indexOf('.php')  != -1))
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
				console.log("on data... url:" + BrowserRequest.url + '\n');
				ApacheChunk.push(chunk);
			});

			ApacheResponse.on('end', function() {

				var ApacheBytes = Buffer.concat(ApacheChunk);

				if (BufferData)
				{
					//modify the urls in the page
					var chunkStr = decoder.write(ApacheBytes);
					var regx1 = new RegExp('http://' + projectHost, 'g');
					chunkStr = chunkStr.replace(regx1, 'http://' + gopherHost);
					var regx2 = new RegExp('http://' + projectHost + ':' + projectOnPort, 'g');
					chunkStr = chunkStr.replace(regx2, 'http://' + gopherHost + ':' + gopherPort);

					var regx2 = new RegExp('Panel', 'g');
					chunkStr = chunkStr.replace(regx2, 'Panels');

					//console.log("Chunk:"+chunkStr);

					ApacheBytes = new Buffer(chunkStr, 'utf8');
				}

				//console.log(decoder.write(ApacheChunk));

				console.log('ApacheBytes on end ' + BrowserRequest.url);
				console.log('ApacheBytes.length ' + ApacheBytes.length);
				console.log('ApacheResponse.headers content-length ' + ApacheResponse.headers['content-length']);

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
