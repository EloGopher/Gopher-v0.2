var backgroundLastID = 0;
var refreshIntervalId;
var TimeRefreshIntervalId;
var IntervalBusy=false;

var tagsToReplace = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};

function replaceTag(tag) {
	return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
	return str.replace(/[&<>]/g, replaceTag);
}


refreshIntervalId = setInterval(function() {
	if (!IntervalBusy) {
		IntervalBusy=true;

		$.ajax({
			type: 'POST',
			data: 'LastID=' + backgroundLastID,
			url: "http://localhost:1337/gopherdata.js",
			crossDomain: true,
			error: function(xhr, status, error) {
				IntervalBusy=false;
				console.log("!");
				clearInterval(refreshIntervalId);
//				$("#testframe").html("LOAD ERROR:" + xhr.responseText + " (" + status + ") -" + error);
			},

			success: function(resultData) {
				$.each(resultData, function(index) {
					var LogType = "";

					if (resultData[index].LogType == "phperror2") {
						LogType += "<b>PHP ERROR</b>: ";
						date = new Date((resultData[index].LogTime * 1000));
					} else
					if (resultData[index].LogType == "phpvar") {
						LogType += "<i>php</i>: ";
						date = new Date((resultData[index].LogTime * 1000));
					}

					if ( LogType!="" ) {
						var isAjax = "";
						var DataFileName = resultData[index].DataFileName + "";
						if (DataFileName.indexOf("AJAX") != -1) {
							isAjax = " <b>AJAX</b> ";
						}

						backgroundLastID = resultData[index].ID;
						if ((isAjax=="") && (resultData[index].LogType == "NETWORK")) {
						}

						if ((resultData[index].LogType == "NETWORK") && (isAjax!="")) {
						}

						if (resultData[index].LogType !== "NETWORK") {

							var lognfilename = decodeURIComponent(resultData[index].FileName);
							var shortfilename = lognfilename.replace(/^.*[\\\/]/, '')

							if (resultData[index].LogType == "phperror2") {
								console.warn("%c"+shortfilename+":" +resultData[index].CodeLine+"   %c"+resultData[index].LogMessage,"color:blue","color:red;font-weight: bold;");
							} else {
								var VarName = safe_tags_replace(decodeURIComponent(resultData[index].VarName));
								var VarValue = safe_tags_replace(decodeURIComponent(resultData[index].VarValue));

								if (( (VarName.indexOf(VarValue)!==-1) || (VarValue.indexOf(VarName)!==-1)) && (VarValue!="")) {
									console.log("%c"+shortfilename+":" +resultData[index].CodeLine+"   %c"+resultData[index].VarValue,"color:blue","color:green");
								} else {
									console.log("%c"+shortfilename+":" +resultData[index].CodeLine+"   %c"+resultData[index].VarName+" = %c"+resultData[index].VarValue,"color:blue","color:gray","color:black");
//									console.log(resultData[index].VarValue);
								}
							}

						}
					}
				});
			}
		});
		IntervalBusy=false;
	}
}, 1000);
