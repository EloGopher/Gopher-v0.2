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

	function StartGopherLog() {
		$("#testframe").html("");
		var FirstBlock = true;
		var BlockConter  = 0;

		var LastFileName = "";

		var IntervalBusy = false;

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

							if (resultData[index].LogType == "NETWORK") {
								htmlrow += "</div>";
								htmlrow += " <div class='logrow flash'>";
								htmlrow += "<div class='networkdiv'></div><div class='networksubdiv' data-datafilename='" + resultData[index].DataFileName + "'>" + decodeURIComponent(resultData[index].FileName) + isAjax + "</div>";
								htmlrow += "</div>";
							} else {

								var CurrentFileName = decodeURIComponent(resultData[index].ParentFileName) + " " + decodeURIComponent(resultData[index].FileName) + isAjax;

								if (CurrentFileName != LastFileName) {
									LastFileName = CurrentFileName;
									if (!FirstBlock) { htmlrow += "</div>"; }

									FirstBlock = false;

									htmlrow += "<div class='fileblock flash'>";
									htmlrow += "<div class='filenamechange'>"+ decodeURIComponent(resultData[index].FileName) + isAjax + " ---&gt; parent " + decodeURIComponent(resultData[index].ParentFileName);
									htmlrow += "<div style='float:right'>"+date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "</div>";
									htmlrow += "</div>";

									htmlrow += " <div class='logrow'>";
								} else {
									htmlrow += " <div class='logrow'>";
								}

								var LogCount = "";
								if (resultData[index].LogCount > 1) {
									LogCount = " <span class='logcount'>" + resultData[index].LogCount + "</span> ";
								}
								var timespan = " <span class='timediv'>" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "</span>  ";

								htmlrow += " <div class='codeline'>" + LogCount + resultData[index].CodeLine + ":</div>";

								if (resultData[index].LogType == "phpvar") {
									htmlrow += " <div class='logdiv'>" + LogType + "<b>" + decodeURIComponent(resultData[index].VarName) + "</b> = " + decodeURIComponent(resultData[index].VarValue) + "</div>";

									if (resultData[index].Tags != "") {
										htmlrow += " <div class='tagdiv phptag'>" + (decodeURIComponent(resultData[index].Tags)) + "</div>";
									}
								} else

								if (resultData[index].LogType == "js_vt") {
									htmlrow += " <div class='logdiv'>" + LogType + " <b>" + safe_tags_replace(decodeURIComponent(resultData[index].VarName)) + "</b> {" + resultData[index].VarType + "} = " + safe_tags_replace(decodeURIComponent(resultData[index].VarValue)) + "</div>";

									if (resultData[index].Tags != "") {
										htmlrow += " <div class='tagdiv jstag'>" + (decodeURIComponent(resultData[index].Tags)) + "</div>";
									}
								} else {
									htmlrow += " <div class='logdiv'>" + LogType + safe_tags_replace(decodeURIComponent(resultData[index].LogMessage)) + "</div>";
								}

								htmlrow += "<div style='float:right'>" + timespan + "</div>";

								htmlrow += "</div>";
							}
						});

						if (NewContent) {
							BlockConter++;
							$("#testframe").append(htmlrow);


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
											'<b>POST DATA:</b> '+decodeURIComponent(safe_tags_replace(resultData[0]['post'])) + '<br>' +
											'<b>RESPONSE HEADERS:</b> '+decodeURIComponent(safe_tags_replace(resultData[0]['responseheaders'])) + '<br>' +
											'<b>RESPONSE:</b> '+decodeURIComponent(safe_tags_replace(resultData[0]['response']))
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
