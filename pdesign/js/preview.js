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
var ParametersModalCloseWithSave = false;

var GlobalRoot = '/Gopher-v0.2/pdesign/';

var rtime;
var timeout = false;
var delta = 200;


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
function findParams(inputText, filetype, paramtype) {
	var re = new RegExp('\\[#' + paramtype + ':(.+?)(?=##)##(.+?)(?=#\\])', 'i');
	var m;
	while ((m = re.exec(inputText)) !== null) {
		//console.log(m);
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
function replaceParamsFromDialog(inputText, filetype) {
	var re = new RegExp('\\[#(.+?):(.+?)(?=##)##(.+?)(?=#\\])', 'i');
	var m;
	while ((m = re.exec(inputText)) !== null) {

		var varname = m[2];
		var defvalue = m[3];
//                console.log('=====');
//		console.log(varname+" "+defvalue+" "+filetype);
                

		var dialogvalue = $("#" + filetype + "-" + varname).val();
		if ($("#" + filetype + "-" + varname + "-unit").length == 0) { /* doesn't have unit*/ } else {
			dialogvalue += "" + $("#" + filetype + "-" + varname + "-unit").val();
		}

		//console.log(varname+" "+defvalue+" "+dialogvalue+" "+"#"+filetype+"-"+varname+"-unit  "+$("#"+filetype+"-"+varname+"-unit").val());
                //console.log(inputText);

		inputText = inputText.substr(0, m.index ) + inputText.substr(m.index + m[0].length + 2);
		//console.log(inputText);
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}

		inputText = inputText.substr(0, m.index ) + dialogvalue + SemiCol + inputText.substr(m.index );
		//console.log(inputText);
	}
	return inputText;
}


//------------------------------------------------------------------------------------------------------------------
function updateiframe(refreshparams) {

	var newcss = css;
        
	var newhtml = html;
	var newjs = js;

	if (refreshparams) {
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
	} else {
		newcss = replaceParamsFromDialog(newcss, 'css');
		newhtml = replaceParamsFromDialog(newhtml, 'html');
		newjs = replaceParamsFromDialog(newjs, 'js');
	}

	injectHTML('<html><head><script src="' + GlobalRoot + 'js/jquery-2.1.4.min.js"></script><style>' + newcss + '</style><script>$(document).ready(function () {' + newjs + '});</script></head><body>' + newhtml + '</body></html>');
}

//------------------------------------------------------------------------------------------------------------------
function replaceSourceFromDialog(inputText, filetype) {
	var re = new RegExp('\\[#(.+?):(.+?)(?=##)##(.+?)(?=#\\])', 'i');
	var m;
	var inputTextTemp = inputText;
	var ReplaceList = [];
	while ((m = re.exec(inputTextTemp)) !== null) {

		var varname = m[2];
		var defvalue = m[3];

		var dialogvalue = $("#" + filetype + "-" + varname).val();
		if ($("#" + filetype + "-" + varname + "-unit").length == 0) { /* doesn't have unit*/ } else {
			dialogvalue += "" + $("#" + filetype + "-" + varname + "-unit").val();
		}

		//console.log('#'+m[1]+':'+m[2]+'##'+m[3]+'##     '+dialogvalue);// varname+" "+defvalue+" "+dialogvalue+" "+"#"+filetype+"-"+varname+"-unit  "+$("#"+filetype+"-"+varname+"-unit").val());

		ReplaceList.push({
			"old": '#' + m[1] + ':' + m[2] + '##' + m[3] + '##',
			"new": '#' + m[1] + ':' + m[2] + '##' + dialogvalue + '##'
		});

		inputTextTemp = inputTextTemp.substr(0, m.index + 1) + inputTextTemp.substr(m.index + m[0].length + 2);
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}

		inputTextTemp = inputTextTemp.substr(0, m.index + 1) + dialogvalue + SemiCol + inputTextTemp.substr(m.index + 1);
	}

	for (var i = 0; i < ReplaceList.length; i++) {
		inputText = inputText.replace(ReplaceList[i].old, ReplaceList[i].new);
	}
	console.log(ReplaceList);
	return inputText;
}

//------------------------------------------------------------------------------------------------------------------
function updateparamdialog() {

	$("#ParametersList").html("");

	for (var i = 0, l = paramArray.length; i < l; i++) {
		$("#ParametersList").append("<div class='proprow_preview' id='row_" + i + "'></div>");

		if (paramArray[i].type == "slider") {
			$("#row_" + i).html("<div class='proptype_preview'>" + paramArray[i].filetype + " - " + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div><input type=\"range\">");
		} else
		if (paramArray[i].type == "number") {
			var tempStr = paramArray[i].defaultvalue;
			var tempUnit = '';

			if (tempStr.indexOf('px') != -1) {
				tempUnit = 'px';
			}
			if (tempStr.indexOf('pt') != -1) {
				tempUnit = 'pt';
			}
			if (tempStr.indexOf('%') != -1) {
				tempUnit = '%';
			}


			$("#row_" + i).html("<div class='proptype_preview'>" + paramArray[i].filetype + " - " + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='hidden' id='" + paramArray[i].filetype + "-" + paramArray[i].varname + "-unit' value='" + tempUnit + "' ><div class='input-group' style='width:200px;'>\
            <input type='text' class='form-control rangeselector' id='" + paramArray[i].filetype + "-" + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue +
				"'>\
            <div class='input-group-btn'>\
                <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'>\
                    <span class='caret'></span>\
                    <span class='sr-only'>Toggle Dropdown</span>\
                </button>\
                <ul class='dropdown-menu pull-right' role='menu'>\
                    <li><a href='#' data-numberstype='px' data-controllerid='" + paramArray[i].filetype + "-" + paramArray[i].varname + "-unit' data-parentrowid='row_" + i + "' class='numberstylemenu'>px</a></li>\
                    <li><a href='#' data-numberstype='%' data-controllerid='" + paramArray[i].filetype + "-" + paramArray[i].varname + "-unit' data-parentrowid='row_" + i + "' class='numberstylemenu'>%</a></li>\
                    <li><a href='#' data-numberstype='pt' data-controllerid='" + paramArray[i].filetype + "-" + paramArray[i].varname + "-unit' data-parentrowid='row_" + i +
				"' class='numberstylemenu'>pt</a></li>\
						  <li><a href='#' data-numberstype='none' data-controllerid='" + paramArray[i].filetype + "-" + paramArray[i].varname + "-unit' data-parentrowid='row_" + i + "' class='numberstylemenu'>none</a></li>\
                </ul>\
            </div>\
        </div>"); //'"
		} else
		if (paramArray[i].type == "color") {
			$("#row_" + i).html("<div class='proptype_preview'>" + paramArray[i].filetype + " -" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='text' class='form-control colorselector' id='" + paramArray[i].filetype + "-" + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else
		if (paramArray[i].type == "text") {
			$("#row_" + i).html("<div class='proptype_preview'>" + paramArray[i].filetype + " - " + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='text' class='form-control textselector' id='" + paramArray[i].filetype + "-" + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else {
			$("#row_" + i).html("<div class='proptype_preview'>" + paramArray[i].filetype + " - " + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div>");
		}
	}

	$(".textselector").css("width", "200px");
	$(".textselector").on('keyup', function() {
		updateiframe(false);
	});

	$(".colorselector").ColorPickerSliders({
		placement: 'right',
		hsvpanel: true,
		previewformat: 'hex',
		onchange: function(container, color) {
			updateiframe(false); //color.tiny.toRgbString()
		}
	});

	$(".rangeselector").TouchSpin({
		min: 0,
		max: 100,
		step: 1,
		postfix: 'px',
		decimals: 1,
		boostat: 5,
		maxboostedstep: 10,
		forcestepdivisibility: 'none',
	}).on('change', function() {
		updateiframe(false);
	});

	$('.numberstylemenu').on('click', function(e) {

		//console.log($(this).data('numberstype'));
		//console.log($(this).data('controllerid'));


		if ($(this).data('numberstype') == "none") {
			$("#" + $(this).data('parentrowid') + " .bootstrap-touchspin-postfix").html('');
			$("#" + $(this).data('controllerid')).val('');
		} else {
			$("#" + $(this).data('parentrowid') + " .bootstrap-touchspin-postfix").html($(this).data('numberstype'));
			$("#" + $(this).data('controllerid')).val($(this).data('numberstype'));
		}
		updateiframe(false);
		e.preventDefault();
	});
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

//------------------------------------------------------------------------------
function resizeend() {
	if (new Date() - rtime < delta) {
		setTimeout(resizeend, delta);
	} else {
		timeout = false;
		$("#iframesource").css({
			height: ($(window).height() - 52) + 'px',
			width: ($(window).width() - 220) + 'px'
		});
	}
}

//------------------------------------------------------------------------------
$(window).resize(function() {
	rtime = new Date();
	if (timeout === false) {
		timeout = true;
		setTimeout(resizeend, delta);
	}
});

//------------------------------------------------------------------------------------------------------------------
$(document).ready(function() {
	$("#iframesource").css({
		height: ($(window).height() - 52) + 'px',
		width: ($(window).width() - 220) + 'px'
	});

	//------------------------------------------------------------------------------
	iframe = document.getElementById('iframesource');
	iframedoc = iframe.document;
	if (iframe.contentDocument) iframedoc = iframe.contentDocument;
	else if (iframe.contentWindow) iframedoc = iframe.contentWindow.document;

	updateiframe(true);
	updateparamdialog();

});
