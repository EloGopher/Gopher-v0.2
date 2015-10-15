var GopherLimit = 500;
var GopherMsgs = [];

window.onerror = function(message, url, lineNumber) {
    try {
		var GMsg = new Object();
		GMsg.TY = 'js_er';
		GMsg.LN = lineNumber;
		GMsg.FN = encodeURIComponent(url);
		GMsg.LG = encodeURIComponent(message);
		GopherMsgs.push(GMsg);
    }
    catch(e) {
        // squelch, because we don’t want to prevent method from returning true
    }

    //return true;
};

var gopher = new function() {
	var MaxMessageLoop = 250;

	JSON.stringifyOnce = function(obj, replacer, indent){
		var printedObjects = [];
		var printedObjectKeys = [];

		function printOnceReplacer(key, value){
			if ( printedObjects.length > 100){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
			return 'object too long';
			}
			var printedObjIndex = false;
			printedObjects.forEach(function(obj, index){
				if(obj===value){
					printedObjIndex = index;
				}
			});

			if ( key == ''){ //root element
				 printedObjects.push(obj);
				printedObjectKeys.push("root");
				 return value;
			}

			else if(printedObjIndex+"" != "false" && typeof(value)=="object"){
				if ( printedObjectKeys[printedObjIndex] == "root"){
					return "(pointer to root)";
				}else{
					return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
				}
			}else{

				var qualifiedKey = key || "(empty key)";
				printedObjects.push(value);
				printedObjectKeys.push(qualifiedKey);
				if(replacer){
					return replacer(key, value);
				}else{
					return value;
				}
			}
		}
		return JSON.stringify(obj, printOnceReplacer, indent);
	};

	function isFunction(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}

	this.param = function(object) {
		var encodedString = '';
		for (var prop in object) {
			if (object.hasOwnProperty(prop)) {
				if (encodedString.length > 0) {
					encodedString += '&';
				}
				encodedString += encodeURI(prop + '=' + object[prop]);
			}
		}
		return encodedString;
	}

	this.sendlog = function()
	{
		if ((GopherMsgs.length !== 0) && (MaxMessageLoop>1))
		{
			MaxMessageLoop--;
			//console.log(GopherMsgs.length);
			//var strdata = JSON.stringify(GopherMsgs);
			//console.log("SEND LOG MESSAGES:"+strdata);

			var CurrentDataLength = GopherMsgs.length;
			var xhr = new XMLHttpRequest();
			xhr.open('POST',
			encodeURI('/gopherSave.js'));
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			xhr.onload = function() {
				if (xhr.status === 200) {
					for (var i=0; i<CurrentDataLength; i++) { GopherMsgs.shift(); }
					setTimeout(gopher.sendlog, 1000);
					//var result2 = JSON.parse(xhr.responseText);
					//console.log("RRR:"+xhr.responseText);
				} else
				if (xhr.status !== 200) {
					setTimeout(gopher.sendlog, 1000);
				}
			};
			xhr.send( gopher.param({ ParentFileName: ParentFileName, Data:JSON.stringify(GopherMsgs) }) );
         //xhr.send( JSON.stringify(GopherMsgs)  ); //testing simple
		} else
		{
			setTimeout(gopher.sendlog, 1000);
		}
	}


	//------------------------------------------------------------------------------
	this.tell = function (xCodeLine,xFileName,xMessage,xTags) {
		if (GopherMsgs.length<GopherLimit) {
			var GMsg = new Object();
			GMsg.TY = 'js_gt';
         GMsg.TS = gopherTimeStamp;
			GMsg.LN = xCodeLine;
			GMsg.FN = encodeURIComponent(xFileName);
			GMsg.LG = encodeURIComponent(xMessage);
         if(xTags === undefined) { GMsg.TG = ""; } else { GMsg.TG = encodeURIComponent(xTags); }
			GopherMsgs.push(GMsg);
		}
	};

	//------------------------------------------------------------------------------
	this.track = function (xCodeLine,xFileName,xVarName,xVarValue,xTags) {
		if (GopherMsgs.length<GopherLimit) {
			var GMsg = new Object();
			GMsg.TY = 'js_vt';
         GMsg.TS = gopherTimeStamp;
			GMsg.LN = xCodeLine;
			GMsg.FN = encodeURIComponent(xFileName);
			GMsg.VN = encodeURIComponent(xVarName);

			if (typeof(xVarValue)==="undefined")
			{
				GMsg.VV = "{UNDEFINED}";
            GMsg.VT = "undefined";
			} else
			if (Array.isArray(xVarValue))
			{
				GMsg.VV = xVarValue.toString();
            GMsg.VT = "array";
			} else
			if (typeof(xVarValue)==="object")
			{
				GMsg.VV = JSON.stringifyOnce(xVarValue);
            GMsg.VT = "object";
			} else
			if (isFunction(xVarValue))
			{
				GMsg.VV = "";
            GMsg.VT = "function";
			} else
			{
				GMsg.VV = xVarValue;
            GMsg.VT = "plain";
			}
			GMsg.VV = encodeURIComponent(GMsg.VV);

         if(xTags === undefined) { GMsg.TG = ""; } else { GMsg.TG = encodeURIComponent(xTags); }
			GopherMsgs.push(GMsg);
		}
	};
}

gopher.sendlog();