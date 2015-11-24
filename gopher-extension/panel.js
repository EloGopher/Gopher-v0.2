var LastID=0;
var NearBottom = false;
var FirstLoad = true;
var refreshIntervalId;

$(document).ready( function(){


	function StartGopherLog()
	{
		$("#testframe").html("");

		//$("#testframe").html("Loading... ");
		refreshIntervalId = setInterval(function () {
			$.ajax({
				type: 'POST',
				data: 'LastID='+LastID,
				url: "http://localhost:1337/gopherdata.js",
				crossDomain:true,
				error: function(xhr, status, error) {
					$("#testframe").html("LOAD ERROR:"+xhr.responseText+" ("+status+") -"+error);
				},

				success: function(resultData) {
					var NewContent = false;
					$.each(resultData, function(index) {
						NewContent = true;
						var htmlrow = "";
						var date = new Date(resultData[index].LogTime);

						var LogType = "<i>";
						if (resultData[index].LogType=="NETWORK") { LogType += "LOAD: "; } else
						if (resultData[index].LogType=="phperror2") { LogType += "<b>PHP ERROR</b>: ";  date = new Date((resultData[index].LogTime*1000)); } else
						if (resultData[index].LogType=="phpvar") { LogType += "PHP var: "; date = new Date((resultData[index].LogTime*1000)); } else
						if (resultData[index].LogType=="js_er") { LogType += "<b>JS ERROR</b>: "; } else
						if (resultData[index].LogType=="js_gt") { LogType += "JS Log: "; } else
						if (resultData[index].LogType=="js_vt") { LogType += "JS var: "; }
						LogType += "</i>";

						LastID = resultData[index].ID;

						var LogCount = "";
						if (resultData[index].LogCount>1) { LogCount = " <span style='font-weight:bold; border-radius:10px; padding:3px; background-color:#ccc;'>" + resultData[index].LogCount + "</span> "; }

						htmlrow += " <div style='border-bottom:1px solid #ddd;'>";

						htmlrow += " <div style='width:60px; overflow:hidden; white-space:nowrap; display:inline-block; text-align:right;'>" +  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()+"</div>";

						if (resultData[index].LogType=="NETWORK") {
							htmlrow += "<div style='width:60px; overflow:hidden; white-space:nowrap; display:inline-block; text-align:right;'>"+LogType+"</div><div style='width:600px; text-overflow: ellipsis; overflow:hidden; white-space:nowrap; display:inline-block; text-align:left; color:blue;'><b><u>" + decodeURIComponent(resultData[index].FileName)  + "</b></u></div>";
						} else {

							htmlrow += " <div style='width:60px; overflow:hidden; white-space:nowrap; display:inline-block; text-align:right;'>" + LogCount + resultData[index].CodeLine + ":</div>";

							if (resultData[index].LogType=="phpvar") {
								htmlrow += " <div style='width:900px; text-overflow: ellipsis; overflow:hidden; white-space:nowrap; display:inline-block; text-align:left;'>" + LogType + "<b>"+decodeURIComponent(resultData[index].VarName) + "</b> = " + decodeURIComponent(resultData[index].VarValue) + "</div>";
							} else
							if ( (decodeURIComponent(resultData[index].VarName) == "null") || (decodeURIComponent(resultData[index].VarName) == "LOG") ) {
								htmlrow += " <div style='width:900px; text-overflow: ellipsis; overflow:hidden; white-space:nowrap; display:inline-block; text-align:left;'>" + LogType+decodeURIComponent(resultData[index].LogMessage) + "</div>";
							} else {
								htmlrow += " <div style='width:900px; text-overflow: ellipsis; overflow:hidden; white-space:nowrap; display:inline-block; text-align:left;'>" + LogType + "<b>"+decodeURIComponent(resultData[index].VarName) + "</b> = " + decodeURIComponent(resultData[index].VarValue) + "</div>";
							}

							htmlrow += "<div style='float:right'> " + decodeURIComponent(resultData[index].FileName) + " (" + decodeURIComponent(resultData[index].ParentFileName) + ")" + "</div>";
						}

						htmlrow += "</div>" ;

						$("#testframe").append(htmlrow);
					});

					$("#refresh_btn").html('Restart From: '+(LastID-50));

					//if (NewContent) { $('html, body').scrollTop($(document).height()-$(window).height()); }
					if ( ( (NewContent) && (NearBottom) ) || (FirstLoad) ) { $('html, body').animate( {scrollTop : $(document).height()-$(window).height() },0); FirstLoad=false;}

				}
			});
		}, 100);

	}


	var scroll_to_bottom = function(element){
    var tries = 0, old_height = new_height = element.height();
    var intervalId = setInterval(function() {
        if( old_height != new_height ){
            // Env loaded
            clearInterval(intervalId);
            element.animate({ scrollTop: new_height }, 'slow');
        }else if(tries >= 30){
            // Give up and scroll anyway
            clearInterval(intervalId);
            element.animate({ scrollTop: new_height }, 'slow');
        }else{
            new_height = content.height();
            tries++;
        }
    }, 100);
	}

	$("#bottom_btn").on('click' , function(){
		$('html, body').animate( {scrollTop : $(document).height()-$(window).height() },250);
	});

	$("#refresh_btn").on('click' , function(){
		clearInterval(refreshIntervalId);
		LastID = LastID-50;
		StartGopherLog();
	});

	$(window).scroll(function() {
	   if($(window).scrollTop() + $(window).height() > $(document).height() - 100) { NearBottom=true; } else { NearBottom=false; }
	});

	StartGopherLog();
});
