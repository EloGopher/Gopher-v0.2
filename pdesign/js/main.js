'use strict';

var HTMLeditor;
var JSeditor;
var CSSeditor;
var iframe;
var iframedoc;
var requestTimer;
var xhr;
var LastEditor;
var paramArray = [];

//------------------------------------------------------------------------------------------------------------------
function loadCssFile(pathToFile) {
	var css = jQuery("<link>");
	css.attr({
		rel: "stylesheet",
		type: "text/css",
		href: pathToFile
	});
	$("head").append(css);
}

//------------------------------------------------------------------------------------------------------------------
function injectHTML(html_string) {
	if (iframedoc) {
		iframedoc.open();
		iframedoc.writeln(html_string);
		iframedoc.close();
	} else {
		alert('Cannot inject dynamic contents into iframe.');
	}
}

function findParams(inputText, filetype, paramtype) {
	var re = new RegExp('#' + paramtype + ':(.+?)(?=##)##(.+?)(?=##)', 'gi');
	var m;
	while ((m = re.exec(inputText)) !== null) {
		console.log(m);
		paramArray.push({
			"filetype": filetype,
			"type": paramtype,
			"varname": m[1],
			"defaultvalue": m[2]
		});

		inputText = inputText.substr(0, m.index) + inputText.substr(m.index + m[0].length + 2);
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}
		inputText = inputText.substr(0, m.index) + m[2] + SemiCol + inputText.substr(m.index);
	}
	return inputText;
}

//------------------------------------------------------------------------------------------------------------------
function updateiframe() {

	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();

	var newcss = css;
	var newhtml = html;
	var newjs = js;

	paramArray = [];

	newcss = findParams(newcss, 'css', 'text');
	newcss = findParams(newcss, 'css', 'number');
	newcss = findParams(newcss, 'css', 'color');

	newhtml = findParams(newhtml, 'html', 'text');
	newhtml = findParams(newhtml, 'html', 'number');
	newhtml = findParams(newhtml, 'html', 'color');

	newjs = findParams(newjs, 'js', 'text');
	newjs = findParams(newjs, 'js', 'number');
	newjs = findParams(newjs, 'js', 'color');


	$("#ParametersList").html("<div class='propheaderrow'><div class='proptype'>File</div><div class='propname'>Name</div><div class='propvalue-text' style='text-align:center'>Value</div></div>");

	for (var i = 0, l = paramArray.length; i < l; i++) {
		if (paramArray[i].type=="number") {
			$("#ParametersList").append("<div class='proprow'><div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace("_", " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div><input type=\"range\"></div>");
		} else {
			$("#ParametersList").append("<div class='proprow'><div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace("_", " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div></div>");
		}
	}


	injectHTML('<html><head><script src="js/jquery-2.1.4.min.js"></script><style>' + newcss + '</style><script>$(document).ready(function () {' + newjs + '});</script></head><body>' + newhtml + '</body></html>');

	if (requestTimer) window.clearTimeout(requestTimer); //see if there is a timeout that is active, if there is remove it.
	if (xhr) xhr.abort(); //kill active Ajax request
	requestTimer = setTimeout(function() {
		var PostValues = {
			"op": "update",
			"js": js,
			"css": css,
			"html": html
		};

		xhr = $.ajax({
			type: 'POST',
			url: "op.php",
			data: PostValues,
			dataType: "json",
			success: function(resultData) {

			},
			error: function(xhr, status, error) {
				console.log("Network connection error. Please check with your network administrator. Error:" + status);
			}
		});
	}, 500); //delay before making the call
}

//------------------------------------------------------------------------------------------------------------------
function completeAfter(cm, pred) {
	var cur = cm.getCursor();
	if (!pred || pred()) setTimeout(function() {
		if (!cm.state.completionActive)
			cm.showHint({
				completeSingle: false
			});
	}, 100);
	return CodeMirror.Pass;
}

//------------------------------------------------------------------------------------------------------------------
function completeIfAfterLt(cm) {
	return completeAfter(cm, function() {
		var cur = cm.getCursor();
		return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
	});
}

//------------------------------------------------------------------------------------------------------------------
function completeIfInTag(cm) {
	return completeAfter(cm, function() {
		var tok = cm.getTokenAt(cm.getCursor());
		if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
		var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
		return inner.tagName;
	});
}

//------------------------------------------------------------------------------------------------------------------
$(document).ready(function() {
	var rtime;
	var timeout = false;
	var delta = 200;
	$(window).resize(function() {
		rtime = new Date();
		if (timeout === false) {
			timeout = true;
			setTimeout(resizeend, delta);
		}
		$(".history_progress").css({width: ($("#iframesource").width()-140) + 'px' });
	});

	function resizeend() {
		if (new Date() - rtime < delta) {
			setTimeout(resizeend, delta);
		} else {
			timeout = false;
			$("#editorsdiv").css({
				height: ($(window).height() - 52) + 'px'
			});

			$("#iframesource").css({
				height: ($("#CSSPanel").height() - 40) + 'px'
			});

			$(".history_progress").css({width: ($("#iframesource").width()-135) + 'px' });
		}
	}

	Split(['#TopRow', '#BottomRow'], {
		gutterSize: 4,
		cursor: 'col-resize'
	})

	Split(['#HTMLPanel', '#JSPanel'], {
		direction: 'vertical',
		sizes: [50, 50],
		gutterSize: 4,
		cursor: 'row-resize'
	})

	Split(['#CSSPanel', '#PreviewPanel'], {
		direction: 'vertical',
		sizes: [50, 50],
		gutterSize: 4,
		cursor: 'row-resize'
	})

	$("#NewProject").on('click', function() {
		window.location.href = 'index.php';
	});


	$("#ParametersModal").draggable({
		handle: ".modal-header"
	});

	$("#ParametersButton").on('click', function() {
		$("#ParametersModal").modal({
			show: true
		});
	});

	$('#ParametersModal').on('shown.bs.modal', function(e) {
		$('.modal-backdrop.in').css({
			'opacity': '0'
		});
	});


	$("#htmleditor_div_hint").show();
	$("#csseditor_div_hint").show();
	$("#jseditor_div_hint").show();

	iframe = document.getElementById('iframesource');
	iframedoc = iframe.document;
	if (iframe.contentDocument) iframedoc = iframe.contentDocument;
	else if (iframe.contentWindow) iframedoc = iframe.contentWindow.document;

	HTMLeditor = CodeMirror.fromTextArea(document.getElementById("HTMLCode"), {
		lineNumbers: true,
		lineWrapping: true,
		mode: "text/html",
		htmlMode: true,
		extraKeys: {
			"'<'": completeAfter,
			"'/'": completeIfAfterLt,
			"' '": completeIfInTag,
			"'='": completeIfInTag,
			"Ctrl-Space": "autocomplete"
		},
		styleActiveLine: true,
		autoCloseBrackets: true,
		autoCloseTags: true,
		highlightSelectionMatches: {
			showToken: /\w/
		},
		matchTags: {
			bothTags: true
		}
	});

	HTMLeditor.setSize("100%", "100%");

	HTMLeditor.on('focus', function() {
		$("#htmleditor_div_hint").fadeOut(250);
		LastEditor = "HTMLeditor";
	});

	HTMLeditor.on('blur', function() {
		$("#htmleditor_div_hint").fadeIn(250);
	});

	HTMLeditor.on('keyup', function() {
		updateiframe();
	});


	JSeditor = CodeMirror.fromTextArea(document.getElementById("JSCode"), {
		lineNumbers: true,
		lineWrapping: true,
		mode: "javascript",
		extraKeys: {
			"'='": completeIfInTag,
			"Ctrl-Space": "autocomplete"
		},
		styleActiveLine: true,
		autoCloseBrackets: true,
		autoCloseTags: true,
		highlightSelectionMatches: {
			showToken: /\w/
		},
		matchTags: {
			bothTags: true
		}
	});

	JSeditor.setSize("100%", "100%");

	JSeditor.on('focus', function() {
		$("#jseditor_div_hint").fadeOut(250);
		LastEditor = "JSeditor";
	});

	JSeditor.on('blur', function() {
		$("#jseditor_div_hint").fadeIn(250);
	});

	JSeditor.on('keyup', function() {
		updateiframe();
	});


	CSSeditor = CodeMirror.fromTextArea(document.getElementById("CSSCode"), {
		lineNumbers: true,
		lineWrapping: true,
		mode: "css",
		extraKeys: {
			"Ctrl-Space": "autocomplete"
		},
		styleActiveLine: true,
		autoCloseBrackets: true,
		autoCloseTags: true,
		highlightSelectionMatches: {
			showToken: /\w/
		},
		matchTags: {
			bothTags: true
		}
	});

	CSSeditor.setSize("100%", "100%");

	CSSeditor.on('focus', function() {
		$("#csseditor_div_hint").fadeOut(250);
		LastEditor = "CSSeditor";

	});

	CSSeditor.on('blur', function() {
		$("#csseditor_div_hint").fadeIn(250);
	});

	CSSeditor.on('keyup', function() {
		updateiframe();
	});

	updateiframe();
	HTMLeditor.focus();

	$("#editorsdiv").css({
		height: ($(window).height() - 52) + 'px'
	});

	$("#iframesource").css({
		height: ($("#CSSPanel").height() - 40) + 'px'
	});

	$(".history_progress").css({width: ($("#iframesource").width()-135) + 'px' });



	var history_perc = 50;
	var history_playstate = false;

	$('.history_bufferBar').css('width', '100%');
	$('.history_timeBar').css('width', '100%');


	$('.history_btnPlay').on('click', function() {
		if (!history_playstate) {
			history_playstate = true;
			$('.history_btnPlay').addClass('history_paused');
			$('.history_btnPlay').find('.history_icon-play').addClass('history_icon-pause').removeClass('history_icon-play');
		} else {
			history_playstate = false;
			$('.history_btnPlay').removeClass('history_paused');
			$('.history_btnPlay').find('.history_icon-pause').removeClass('history_icon-pause').addClass('history_icon-play');
		}

	});


	var history_timeDrag = false; /* check for drag event */
	$('.history_progress').on('mousedown', function(e) {
		history_timeDrag = true;
		history_updatebar(e.pageX);
	});

	$(document).on('mouseup', function(e) {
		if (history_timeDrag) {
			history_timeDrag = false;
			history_updatebar(e.pageX);
		}
	});

	$(document).on('mousemove', function(e) {
		if (history_timeDrag) {
			history_updatebar(e.pageX);
		}
	});

	var history_updatebar = function(x) {
		var history_progress = $('.history_progress');

		var history_position = x - history_progress.offset().left;
		var history_percentage = 100 * history_position / history_progress.width();
		if (history_percentage > 100) {
			history_percentage = 100;
		}
		if (history_percentage < 0) {
			history_percentage = 0;
		}
		$('.history_timeBar').css('width', history_percentage + '%');
	};


});
