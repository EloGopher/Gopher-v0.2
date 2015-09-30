var http = require('http');
var projectOnPort = 80;
var projectHost = 'localhost';
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
	//console.log(BrowserRequest.url);

	console.log(BrowserRequest.headers);

	//var tempStr = BrowserRequest.url+"";
	//var isPhp = tempStr.match(/.php/i);

	var BrowserData = [];
	/*
	    processRequest(BrowserRequest, function(data) {
	         console.log("BrowserRequest Data: "+data);
	    });
	*/
	//    console.log("=============================\n");

	BrowserRequest.on('data', function(chunk) {
		//console.log("BrowserRequest data:"+decoder.write(chunk));
		BrowserData.push(chunk);
	});
	var ApacheChunk = [];
	BrowserRequest.on('end', function() {
		var NodeProxyRequest = http.request(options, function(ApacheResponse) {
			//console.log("APACHE HEADER: %j", ApacheResponse.headers);

			ApacheResponse.on('data', function(chunk) {
				//console.log('============= _res.on data get chunk =============');
				//    if (isPhp) { console.log("Apache Response: "+ decoder.write(chunk)); }


				console.log("url:" + BrowserRequest.url + '\n');

				if ((BrowserRequest.url.indexOf('.htm')  != -1) ||
					 (BrowserRequest.url.indexOf('.html') != -1) ||
					 (BrowserRequest.url.indexOf('.js') != -1) ||
					 (BrowserRequest.url.indexOf('.php')  != -1))
				{
					//modify the urls in the page
					var chunkStr = decoder.write(chunk);
					var regx1 = new RegExp('http://' + projectHost, 'g');
					chunkStr = chunkStr.replace(regx1, 'http://' + gopherHost);
					var regx2 = new RegExp('http://' + projectHost + ':' + projectOnPort, 'g');
					chunkStr = chunkStr.replace(regx2, 'http://' + gopherHost + ':' + gopherPort);

					//console.log("Chunk:"+chunkStr);

					chunk = new Buffer(chunkStr, 'utf8');
				}

				ApacheChunk.push(chunk);
			});

			ApacheResponse.on('end', function() {
				//console.log(decoder.write(ApacheChunk));
				var ApacheBytes = Buffer.concat(ApacheChunk);
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
