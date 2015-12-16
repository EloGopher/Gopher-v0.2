var GopherLimit = 500;
var GopherMsgs = [];

// Only Chrome & Opera have an error attribute on the event.
/*
window.addEventListener("error", function (e) {
    console.log(e.error.message, "from", e.error.stack);
});
*/

window.onerror = function(message, url, lineNumber) {
	try {

		var DuplicateDontAdd = false;
		if (GopherMsgs.length > 0) {
			if ((GopherMsgs[GopherMsgs.length - 1].LN == lineNumber) &&
				(GopherMsgs[GopherMsgs.length - 1].FN == encodeURIComponent(url)) &&
				(GopherMsgs[GopherMsgs.length - 1].LG == encodeURIComponent(message))) {
				GopherMsgs[GopherMsgs.length - 1].RE = parseInt(GopherMsgs[GopherMsgs.length - 1].RE, 10) + 1;
				DuplicateDontAdd = true;
			}
		}

		if (!DuplicateDontAdd) {
			var GMsg = new Object();
			GMsg.RE = 1;

			GMsg.TY = 'js_er';
			GMsg.LN = lineNumber;
			GMsg.FN = encodeURIComponent(url);
			GMsg.LG = encodeURIComponent(message);
			GopherMsgs.push(GMsg);
		}
	} catch (e) {
		// squelch, because we don’t want to prevent method from returning true

	}

	//return true;
};

var gopher = new function() {
	var MaxMessageLoop = 250;

	function print_r(theObj, safeint, maxdata) {
		var jsonstr = "";
		//console.log(theObj.constructor);
		jsonstr += '{';
		if (theObj.constructor == Array || theObj.constructor == Object) {
			for (var p in theObj) {
				safeint++;
				if (safeint > maxdata) {
					break;
				}

				try {
					if (theObj[p].constructor == Array || theObj[p].constructor == Object) {
						jsonstr += p + ": ";
						jsonstr += print_r(theObj[p], safeint, maxdata);
					} else {
						jsonstr += p + ": '" + theObj[p] + "', ";
					}
				} catch (err) {}
			}
		} else {
			jsonstr += "result: 'not Object or Array'"
		}
		jsonstr += '}';

		return jsonstr;
	}


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

	this.sendlog = function() {
		if ((GopherMsgs.length !== 0) && (MaxMessageLoop > 1)) {
			MaxMessageLoop--;

			var CurrentDataLength = GopherMsgs.length;
			var xhr = new XMLHttpRequest();
			xhr.open('POST',
				encodeURI('/gopherSave.js'));
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			xhr.onload = function() {
				if (xhr.status === 200) {
					for (var i = 0; i < CurrentDataLength; i++) {
						GopherMsgs.shift();
					}
					setTimeout(gopher.sendlog, 1000);
					//var result2 = JSON.parse(xhr.responseText);
					//console.log("RRR:"+xhr.responseText);
				} else
				if (xhr.status !== 200) {
					setTimeout(gopher.sendlog, 1000);
				}
			};
			xhr.send(gopher.param({
				ParentFileName: ParentFileName,
				Data: JSON.stringify(GopherMsgs)
			}));
			//xhr.send( JSON.stringify(GopherMsgs)  ); //testing simple
		} else {
			setTimeout(gopher.sendlog, 1000);
		}
	}


	//------------------------------------------------------------------------------
	this.log = function(xCodeLine, xFileName, xVarName, xVarValue) {
		if (GopherMsgs.length < GopherLimit) {

			var GMsg = new Object();
			if (typeof(xVarValue) === "undefined") {
				GMsg.VV = "{UNDEFINED}";
				GMsg.VT = "undefined";
			} else
			if (Array.isArray(xVarValue)) {
				GMsg.VV = xVarValue.toString();
				GMsg.VT = "array";
			} else
			if (isFunction(xVarValue)) {
				GMsg.VV = "";
				GMsg.VT = "function";
			} else
			if (typeof(xVarValue) === "object") {
				GMsg.VV = print_r(xVarValue);
				GMsg.VT = "object";
			} else {
				GMsg.VV = xVarValue;
				GMsg.VT = "plain";
			}
			GMsg.VV = encodeURIComponent(GMsg.VV);


			var DuplicateDontAdd = false;
			if (GopherMsgs.length > 0) {
				if ((GopherMsgs[GopherMsgs.length - 1].LN == xCodeLine) &&
					(GopherMsgs[GopherMsgs.length - 1].FN == encodeURIComponent(xFileName)) &&
					(GopherMsgs[GopherMsgs.length - 1].VN == encodeURIComponent(xVarName)) &&
					(GopherMsgs[GopherMsgs.length - 1].VV == GMsg.VV) &&
					(GopherMsgs[GopherMsgs.length - 1].VT == GMsg.VT)) {
					GopherMsgs[GopherMsgs.length - 1].RE = parseInt(GopherMsgs[GopherMsgs.length - 1].RE, 10) + 1;
					DuplicateDontAdd = true;
				}
			}

			if (!DuplicateDontAdd) {
				GMsg.RE = 1;
				GMsg.TY = 'js_vt';
				GMsg.LN = xCodeLine;
				GMsg.FN = encodeURIComponent(xFileName);
				GMsg.VN = encodeURIComponent(xVarName);

				GopherMsgs.push(GMsg);
			}
		}
	};
}

gopher.sendlog();
