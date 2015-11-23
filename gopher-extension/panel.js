$("#testframe").html("1");

$(document).ready( function(){

	$("#testframe").html("Loading... ");
	setInterval(function () {

		$.ajax({
			type: 'POST',
			url: "http://localhost:1337/gopherdata.js",
			crossDomain:true,
			error: function(xhr, status, error) {
				$("#testframe").html("LOAD ERROR:"+xhr.responseText+" ("+status+") -"+error);
			},

			success: function(resultData) {
				var reshtml = "";
				$.each(resultData, function(index) {
					var date = new Date(resultData[index].LogTime);

					var LogCount = "";
					if (resultData[index].LogCount>1) { LogCount = " <span style='font-weight:bold; border-radius:10px; padding:3px; background-color:#ccc;'>" + resultData[index].LogCount + "</span> "; }

					reshtml += " <div style='border-bottom:1px solid #ddd;'>";

					reshtml += " <div style='width:60px; overflow:hidden; white-space:nowrap; display:inline-block; text-align:right;'>" +  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()+"</div>";

					reshtml += " <div style='width:60px; overflow:hidden; white-space:nowrap; display:inline-block; text-align:right;'>" + LogCount + resultData[index].CodeLine + ":</div>";

					var LogType = "<i>";
					if (resultData[index].LogType=="NETWORK") { LogType += "NETWORK: "; } else
					if (resultData[index].LogType=="phperror2") { LogType += "<b>PHP ERROR</b>: "; } else
					if (resultData[index].LogType=="phpvar") { LogType += "PHP var: "; } else
					if (resultData[index].LogType=="js_gt") { LogType += "JS Log: "; } else
					if (resultData[index].LogType=="js_vt") { LogType += "JS var: "; }
					LogType += "</i>";

					if ( (resultData[index].VarName == null) || (resultData[index].VarName == "LOG") ) {
						reshtml += " <div style='width:600px; text-overflow: ellipsis; overflow:hidden; white-space:nowrap; display:inline-block; text-align:left;'>" + LogType+resultData[index].LogMessage + "</div>";
					} else {
						reshtml += " <div style='width:600px; text-overflow: ellipsis; overflow:hidden; white-space:nowrap; display:inline-block; text-align:left;'>" + LogType + "<b>"+resultData[index].VarName + "</b> = " + resultData[index].VarValue + "</div>";
					}


					reshtml += "<div style='float:right'> " + resultData[index].FileName + " (" + resultData[index].ParentFileName + ")" + "</div>";
					reshtml += "</div>" ;
				});
				$("#testframe").html(reshtml);
			}
		});
	}, 1000);
});
