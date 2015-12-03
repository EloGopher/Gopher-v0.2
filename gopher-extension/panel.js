var LastID = 0;
var NearBottom = false;
var FirstLoad = true;
var refreshIntervalId;
var TimeRefreshIntervalId;

var LogWidth = 0;

$(document).ready(function() {

	LogWidth = $('#testframe').width();

	var DURATION_IN_SECONDS = {
	  epochs: ['year', 'month', 'day', 'hour', 'minute', 'second', 'milisecond'],
	  year:   31536000,
	  month:  2592000,
	  day:    86400,
	  hour:   3600,
	  minute: 60,
	  second: 1,
	  milisecond: 1/1000
	};

	function getDuration(seconds) {
	  var epoch, interval;

	  for (var i = 0; i < DURATION_IN_SECONDS.epochs.length; i++) {
	    epoch = DURATION_IN_SECONDS.epochs[i];
	    interval = Math.floor(seconds / DURATION_IN_SECONDS[epoch]);
	    if (interval >= 1) {
	      return { interval: interval, epoch: epoch };
		}
	  }
	  return { interval: '', epoch: 'just now' };

	};

	function timeSince(date) {
		//deal with timestamp in seconds from php logs first
		if (parseInt(date,10).toString().length<=12) { date = parseInt(date*1000);}

		var seconds = Math.floor((new Date() - new Date(date)) / 1000);
		var duration = getDuration(seconds);
		var suffix  = (duration.interval > 1 || duration.interval === 0) ? 's' : '';
		if (duration.interval=='') {
			return 'just now';
		} else {
			return duration.interval + ' ' + duration.epoch + suffix+' ago ';
		}
	};

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
		var FileBlockCounter = 0;

		var MainFileBlock;
		var MainFileBlockCounter = 0;

		var RowCounter = 0;

		var FirstLogLine = true;


		TimeRefreshIntervalId = setInterval(function() {
			$('.timefloat').each( function() {
				$(this).html( timeSince($(this).data('epochtime')) );
			});
		},5000);

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

							//new NETWORK request without AJAX make it a main container
							if ((isAjax=="") && (resultData[index].LogType == "NETWORK")) {
								FirstBlock = false;
								MainFileBlockCounter++;

								htmlrow = "<div class='mainfileblock' id='main_"+MainFileBlockCounter+"'>";
								htmlrow += "<div class='mainfilenamechange'><b>"+ decodeURIComponent(resultData[index].FileName) + "</b>";
								htmlrow += "<div class='timefloat' data-epochtime='"+resultData[index].LogTime+"'>"+ timeSince( resultData[index].LogTime ) +"</div>";
								htmlrow += "</div>";
								htmlrow += "<div class='maincontentarea'></div>";
								htmlrow += "</div>";

								MainFileBlock = $(htmlrow);
								$("#testframe").append(MainFileBlock);
								FileBlockCounter = 0;
								LastFileName = "";
							}

							//the filename of a log entry is different than the one before make a new child box
							var CurrentFileName = decodeURIComponent(resultData[index].FileName);
							if ((CurrentFileName != LastFileName) && (resultData[index].LogType !== "NETWORK") ) {

								FirstLogLine = true;

								LastFileName = CurrentFileName;
								FileBlockCounter++;
								htmlrow = "<div class='fileblock' id='sub_"+ MainFileBlockCounter+"_"+FileBlockCounter +"'>";
								htmlrow += "<div class='filenamechange'><b>"+ decodeURIComponent(resultData[index].FileName) + "</b>";
								if (decodeURIComponent(resultData[index].FileName)!=decodeURIComponent(resultData[index].ParentFileName)) {
									htmlrow += " (" + decodeURIComponent(resultData[index].ParentFileName) + ")";
								}
								htmlrow += "<div class='timefloat' data-epochtime='"+resultData[index].LogTime+"'>"+ timeSince( resultData[index].LogTime ) +"</div>";
								htmlrow += "</div>";
								htmlrow += "</div>";

								FileBlock = $(htmlrow);
								$(MainFileBlock).find(".maincontentarea").append(FileBlock);
							}

							if ((resultData[index].LogType == "NETWORK") && (isAjax!="")) {
								RowCounter++;
								if (FirstLogLine) {
									FirstLogLine = false;
									htmlrow = " <div id='logrow_"+RowCounter+"' class='logrow first flash'>";
								} else {
									htmlrow = " <div id='logrow_"+RowCounter+"' class='logrow flash'>";
								}

								htmlrow += "<div class='networkdiv'>XHR: </div><div class='networksubdiv' data-datafilename='" + resultData[index].DataFileName + "'>" + decodeURIComponent(resultData[index].FileName) + "</div>";
								htmlrow += "</div>";
								if (FileBlockCounter == 0) { $(MainFileBlock).find(".maincontentarea").append(htmlrow); } else { $(FileBlock).append(htmlrow); }
							} else
							if (resultData[index].LogType !== "NETWORK") {
								RowCounter++;

								if (FirstLogLine) {
									FirstLogLine = false;
									htmlrow = " <div id='logrow_"+RowCounter+"' class='logrow first flash'>";
								} else {
									htmlrow = " <div id='logrow_"+RowCounter+"' class='logrow flash'>";
								}

								var LogCount = "";
								if (resultData[index].LogCount > 1) {
									LogCount = " <span class='logcount'>" + resultData[index].LogCount + "</span> ";
								}

								htmlrow += " <div class='codeline'>" + LogCount + resultData[index].CodeLine + ":</div>";

								htmlrow += " <div id='logdiv_"+RowCounter+"' class='logdiv' style='width:"+ (LogWidth-100) +"px'>";

								if ((resultData[index].LogType == "js_er") || (resultData[index].LogType == "phperror2")) {
									htmlrow += LogType + safe_tags_replace(decodeURIComponent(resultData[index].LogMessage));
								} else {
									var VarName = safe_tags_replace(decodeURIComponent(resultData[index].VarName));
									var VarValue = safe_tags_replace(decodeURIComponent(resultData[index].VarValue));
									if (VarName.indexOf(VarValue)!==-1) {
										htmlrow += " <i>" + VarValue +  "</i>";
									} else {
										htmlrow += " <b>" + VarName + "</b>";
										if (resultData[index].VarType!="") { htmlrow += " {" + resultData[index].VarType + "}"; }

										if (resultData[index].VarType=="object") { htmlrow += " = " + syntaxHighlight(VarValue) + "</div>"; } else { htmlrow += " = " + VarValue; }
									}
								}
								htmlrow += "</div>";


								htmlrow += "</div>";
								if (FileBlockCounter == 0) {
									$(MainFileBlock).find(".maincontentarea").append(htmlrow);
								} else {
									$(FileBlock).append(htmlrow);
								}
							}
						});

						if (NewContent) {
							BlockConter++;

							//remove blocks to keep 800 rows only
							var numRows = $('.logrow').length;
							var numBlocks = $('.mainfileblock').length;

							if ((numRows > 800) && (numBlocks>1)) {
								$('#testframe').find('.mainfileblock').first().remove();
							}

							$('.logdiv').each( function() {

								if (this.offsetHeight < this.scrollHeight ||
								    this.offsetWidth < this.scrollWidth) {
									$(this).addClass("expandthis");
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
		clearInterval(TimeRefreshIntervalId);
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

	function resize_calculate() {
		LogWidth = $('#testframe').width();
		$(".logdiv").css({'width' : (LogWidth-100)+"px" });
	};

	var resizeTimer;
	$(window).resize(function() {
	    clearTimeout(resizeTimer);
	    resizeTimer = setTimeout(resize_calculate, 50);
	});

	StartGopherLog();
});
