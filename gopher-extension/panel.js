var LastID = 0;
var NearBottom = false;
var FirstLoad = true;
var refreshIntervalId;

$(document).ready(function() {

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

	function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
	}


	function StartGopherLog() {
		$("#testframe").html("");
		var FirstBlock = true;
		var BlockConter  = 0;

		var LastFileName = "";

		var IntervalBusy = false;
		var FileBlock;
		var MainFileBlock;

		//$("#testframe").html("Loading... ");
		refreshIntervalId = setInterval(function() {
			if (!IntervalBusy) {
				IntervalBusy=true;

				$.ajax({
					type: 'POST',
					data: 'LastID=' + LastID,
					url: "http://localhost:1337/gopherdata.js",
					crossDomain: true,
					error: function(xhr, status, error) {
						IntervalBusy=false;
						$("#testframe").html("LOAD ERROR:" + xhr.responseText + " (" + status + ") -" + error);
					},

					success: function(resultData) {
						var NewContent = false;
						var htmlrow = "";


						$.each(resultData, function(index) {
							NewContent = true;
							var date = new Date(resultData[index].LogTime);

							var LogType = "";
							if (resultData[index].LogType == "phperror2") {
								LogType += "<b>PHP ERROR</b>: ";
								date = new Date((resultData[index].LogTime * 1000));
							} else
							if (resultData[index].LogType == "phpvar") {
								LogType += "<i>php</i>: ";
								date = new Date((resultData[index].LogTime * 1000));
							} else
							if (resultData[index].LogType == "js_er") {
								LogType += "<b>JS ERROR</b>: ";
							} else
							if (resultData[index].LogType == "js_gt") {
								LogType += "<i>js</i>: ";
							} else
							if (resultData[index].LogType == "js_vt") {
								LogType += "<i>js</i>: ";
							}
							LogType += "";

							var isAjax = "";
							var DataFileName = resultData[index].DataFileName + "";
							if (DataFileName.indexOf("AJAX") != -1) {
								isAjax = " <b>AJAX</b> ";
							}

							LastID = resultData[index].ID;

							if (isAjax=="") {

								var CurrentFileName = decodeURIComponent(resultData[index].ParentFileName) + " " + decodeURIComponent(resultData[index].FileName);
								if (CurrentFileName != LastFileName) {
									LastFileName = CurrentFileName;

									FirstBlock = false;

									if (resultData[index].LogType == "NETWORK") {
										htmlrow = "<div class='mainfileblock flash'>";
										htmlrow += "<div class='mainfilenamechange'><b>"+ decodeURIComponent(resultData[index].FileName) + "</b>";
										htmlrow += "<div style='float:right'>"+date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "</div>";
										htmlrow += "</div>";
										htmlrow += "<div id='contentarea' class='maincontentarea'></div>";
										htmlrow += "</div>";

										MainFileBlock = $(htmlrow);
										$("#testframe").append(MainFileBlock);


									} else {
										htmlrow = "<div class='fileblock flash'>";
										htmlrow += "<div class='filenamechange'><b>"+ decodeURIComponent(resultData[index].FileName) + "</b>  (" + decodeURIComponent(resultData[index].ParentFileName) + ")";
										htmlrow += "<div style='float:right'>"+date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "</div>";
										htmlrow += "</div>";
										htmlrow += "</div>";

										FileBlock = $(htmlrow);
										$(MainFileBlock).find("#contentarea").append(FileBlock);

									}


								}
							}

							if ((resultData[index].LogType == "NETWORK") && (isAjax!="")) {
								htmlrow = " <div class='logrow flash'>";

								htmlrow += "<div class='networkdiv'></div><div class='networksubdiv' data-datafilename='" + resultData[index].DataFileName + "'>" + decodeURIComponent(resultData[index].FileName) + isAjax + "</div>";
								htmlrow += "</div>";
								$(FileBlock).append(htmlrow);

							} else
							if (resultData[index].LogType !== "NETWORK") {
								htmlrow = " <div class='logrow flash'>";

								var LogCount = "";
								if (resultData[index].LogCount > 1) {
									LogCount = " <span class='logcount'>" + resultData[index].LogCount + "</span> ";
								}
								var timespan = " <span class='timediv'>" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "</span>  ";

								htmlrow += " <div class='codeline'>" + LogCount + resultData[index].CodeLine + ":</div>";

								if ((resultData[index].LogType == "js_er") || (resultData[index].LogType == "phperror2")) {
									htmlrow += " <div class='logdiv'>" + LogType + safe_tags_replace(decodeURIComponent(resultData[index].LogMessage)) + "</div>";
								} else {
									var VarName = safe_tags_replace(decodeURIComponent(resultData[index].VarName));
									var VarValue = safe_tags_replace(decodeURIComponent(resultData[index].VarValue));
									if (VarName.indexOf(VarValue)!==-1) {
										htmlrow += " <div class='logdiv'><i>" + VarValue +  "</i></div>";
									} else {
										htmlrow += " <div class='logdiv'><b>" + VarName + "</b>";
										if (resultData[index].VarType!="") { htmlrow += " {" + resultData[index].VarType + "}"; }

										if (resultData[index].VarType=="object") { htmlrow += " = " + syntaxHighlight(VarValue) + "</div>"; } else { htmlrow += " = " + VarValue + "</div>"; }

									}
								}

								htmlrow += "<div style='float:right'>" + timespan + "</div>";

								htmlrow += "</div>";
								$(FileBlock).append(htmlrow);
							}
						});

						if (NewContent) {
							BlockConter++;

							//remove to keep 800 rows only
							var numRows = $('.logrow').length;
							if (numRows > 800) {
								$('#testframe').find('.logrow:lt(' + (numRows - 800) + ')').remove();
							}

							$(".fn").on({
								mouseenter: function() {
									$(this).find('.pfn').show();
									$(this).parent().find('.logdiv').css({
										"width": "300px"
									});
								},
								mouseleave: function() {
									$(this).find('.pfn').hide();
									$(this).parent().find('.logdiv').css({
										"width": "900px"
									});
								}
							});

							$(".networksubdiv").on('click', function () {

								$("#sourceres").html( 'loading...' );
								$("#sourceview").show();

								$.ajax({
									type: 'POST',
									data: 'DataFile=' + $(this).data('datafilename'),
									url: "http://localhost:1337/gopherdata.js",
									crossDomain: true,
									error: function(xhr, status, error) {
										$("#testframe").html("LOAD ERROR:" + xhr.responseText + " (" + status + ") -" + error);
									},

									success: function(resultData) {
										$("#sourceres").html(
											'<b>POST HEADERS:</b> '+safe_tags_replace(decodeURIComponent(resultData[0]['header'])) + '<br>' +
											'<b>POST DATA:</b> '+safe_tags_replace(decodeURIComponent(resultData[0]['post'])) + '<br>' +
											'<b>RESPONSE HEADERS:</b> '+safe_tags_replace(decodeURIComponent(resultData[0]['responseheaders'])) + '<br>' +
											'<b>RESPONSE:</b> '+safe_tags_replace(decodeURIComponent(resultData[0]['response']))
										);
									}
								});


							});

							$('.modal').on('click', function () {
								$("#sourceview").hide();
							});


							$('.modalclose').on('click', function () {
								$("#sourceview").hide();
							});

							$(".logdiv").on({
								mouseenter: function() {
									$(this).css({
										"overflow": "auto",
										"background-color": "#eee",
										"white-space": "normal",
										"text-overflow": "clip"
									});
								},
								mouseleave: function() {
									$(this).css({
										"overflow": "hidden",
										"background-color": "#fff",
										"white-space": "nowrap",
										"text-overflow": "ellipsis"
									});
								}
							});

							$(".logrow").on({
								mouseenter: function() {
									$(this).find('.timediv').show(); //css({'display': 'inline-block'});
								},
								mouseleave: function() {
									$(this).find('.timediv').hide();
								}
							});
						}

						//if (NewContent) { $('html, body').scrollTop($(document).height()-$(window).height()); }
						if (((NewContent) && (NearBottom)) || (FirstLoad)) {
							$('html, body').animate({
								scrollTop: $(document).height() - $(window).height()
							}, 0);
							FirstLoad = false;
						}
						IntervalBusy=false;
					}
				});
			}
		}, 100);
	}

	var scroll_to_bottom = function(element) {
		var tries = 0,
			old_height = new_height = element.height();
		var intervalId = setInterval(function() {
			if (old_height != new_height) {
				// Env loaded
				clearInterval(intervalId);
				element.animate({
					scrollTop: new_height
				}, 'slow');
			} else if (tries >= 30) {
				// Give up and scroll anyway
				clearInterval(intervalId);
				element.animate({
					scrollTop: new_height
				}, 'slow');
			} else {
				new_height = content.height();
				tries++;
			}
		}, 100);
	}

	$("#bottom_btn").on('click', function() {
		$('html, body').animate({
			scrollTop: $(document).height() - $(window).height()
		}, 250);
	});

	$("#refresh_btn").on('click', function() {
		clearInterval(refreshIntervalId);
		LastID = 0;
		StartGopherLog();
	});

	$(window).scroll(function() {
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
			NearBottom = true;
		} else {
			NearBottom = false;
		}
	});

	StartGopherLog();
});
