'use strict';

var HTMLeditor;
var JSeditor;
var CSSeditor;
var iframe;
var iframedoc;
var requestTimer;
var xhr;

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

//------------------------------------------------------------------------------------------------------------------
function updateiframe() {

	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();
	injectHTML('<html><head><script src="js/jquery-2.1.4.min.js"></script><style>' + css + '</style><script>$(document).ready(function () {' + js + '});</script></head><body>' + html + '</body></html>');

	if (requestTimer) window.clearTimeout(requestTimer);  //see if there is a timeout that is active, if there is remove it.
	if (xhr) xhr.abort();  //kill active Ajax request
	requestTimer = setTimeout(function(){
		var PostValues = {
			"code": code,
			"js": js,
			"css": css,
			"html": html
		};

		xhr = $.ajax({
			type: 'POST',
			url: "index.php",
			data: PostValues,
			dataType: "json",
			success: function(resultData) {

			},
			error: function(xhr, status, error) {
				console.log("Network connection error. Please check with your network administrator. Error:" + status);
			}
		});
	}, 500);  //delay before making the call
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
	  sizes: [50,50],
	  gutterSize: 4,
	  cursor: 'row-resize'
	})

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
	});
	CSSeditor.on('blur', function() {
		$("#csseditor_div_hint").fadeIn(250);
	});
	CSSeditor.on('keyup', function() {
		updateiframe();
	});

	updateiframe();
});
