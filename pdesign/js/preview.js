'use strict';

var HTMLeditor;
var JSeditor;
var CSSeditor;
var iframe;
var iframedoc;
var requestTimer;
var requestTimerIFrame;
var xhr;
var xhrIFrame;
var updateIFrameTimer;
var updateIFrame=false;
var LastEditor;
var paramArray = [];
var ParametersModalCloseWithSave = false;

var GlobalRoot = '/Gopher-v0.2/pdesign/';

var rtime;
var timeout = false;
var delta = 200;


var CurrentCode = '';
var CurrentVersion = '';

var CurrentPath = window.location.pathname;
CurrentPath = CurrentPath.replace(GlobalRoot,'');

console.log(CurrentPath);
var CurrentPathParts = CurrentPath.split('/');
CurrentCode = CurrentPathParts[1];
CurrentVersion = CurrentPathParts[2];


//------------------------------------------------------------------------------------------------------------------
function varnamefromstr(inputstr)
{
	var outputstr=inputstr;
	outputstr = outputstr.replace(/ /ig,'_');
	return outputstr;
}

//------------------------------------------------------------------------------------------------------------------
function findParams(inputText, filetype, paramtype) {
	var re = new RegExp('#' + paramtype + '\\s?\\((.+?)\\)#', 'i');
	var m;
	var varcounter = 0;
	while ((m = re.exec(inputText)) !== null) {
//		console.log(m[1]);

		varcounter++;

		var params_str = m[1];
		var defaultvalue = '';
		if (paramtype=='text') {
			var params = params_str.split(',');

			paramArray.push({
				"filetype": filetype,
				"type": paramtype,
				"vartext": params[0],
				"varname": varnamefromstr(params[0]),
				"defaultvalue": params[1]
			});
			defaultvalue = params[1];

		} else
		if (paramtype=='int') {
			var params = params_str.split(',');

			if (params[2]==undefined) { params[2] = 0; }
			if (params[3]==undefined) { params[3] = 100; }
			if (params[4]==undefined) { params[4] = ''; }

			paramArray.push({
				"filetype": filetype,
				"type": paramtype,
				"vartext": params[0],
				"varname": varnamefromstr(params[0]),
				"defaultvalue": params[1],
				"minvalue": params[2],
				"maxvalue": params[3],
				"unit": params[4]
			});

			defaultvalue = params[1]+params[4];

		} else
		if (paramtype=='color') {
			var params = params_str.split(',');

			paramArray.push({
				"filetype": filetype,
				"type": paramtype,
				"vartext": params[0],
				"varname": varnamefromstr(params[0]),
				"defaultvalue": params[1]
			});

			defaultvalue = params[1];
		}


		inputText = inputText.substr(0, m.index) + inputText.substr(m.index + m[0].length );
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}
		inputText = inputText.substr(0, m.index) + defaultvalue + SemiCol + inputText.substr(m.index);
	}
	return inputText;
}

//------------------------------------------------------------------------------------------------------------------
function replaceParamsFromDialog(inputText, filetype) {
	var re = new RegExp('#(int|color|text)\\s?\\((.+?)\\)#', 'i');
	var m;
	while ((m = re.exec(inputText)) !== null) {

		var params_str = m[2];
		var varname = '';
		var defvalue = '';
		var paramtype = m[1];
		var minvalue = 0;
		var maxvalue = 100;
		var defunit = '';

		if (paramtype=='text') {
			var params = params_str.split(',');

			varname = varnamefromstr(params[0]);
			defvalue = params[1];
		} else
		if (paramtype=='int') {
			var params = params_str.split(',');

			if (params[2]==undefined) { params[2] = 0; }
			if (params[3]==undefined) { params[3] = 100; }
			if (params[4]==undefined) { params[4] = ''; }

			varname = varnamefromstr(params[0]);
			defvalue = params[1]+params[4];

			minvalue = params[2];
			maxvalue = params[3];
			defunit  = params[4];
		} else
		if (paramtype=='color') {
			var params = params_str.split(',');

			varname = varnamefromstr(params[0]);
			defvalue = params[1];
		}

//		console.log( "#" + filetype + varname + " = " +$("#" + filetype + varname).val() );

		var dialogvalue = $("#" + filetype + varname).val();
		if ($("#" + filetype + varname + "unit").length == 0) { /* doesn't have unit*/ } else {
			dialogvalue += "" + $("#" + filetype +  varname + "unit").val();
		}
		//console.log(filetype + varname+' = '+dialogvalue+' ' + m[0]);

		//console.log(inputText);

		inputText = inputText.substr(0, m.index) + inputText.substr(m.index + m[0].length );
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}
		inputText = inputText.substr(0, m.index) + dialogvalue + SemiCol + inputText.substr(m.index);
		//console.log(inputText);
	}
	return inputText;
}


//------------------------------------------------------------------------------------------------------------------
function updateiframefunc(refreshparams) {

	var newcss = css;
	var newhtml = html;
	var newjs = js;
//	console.log(css);

	if (refreshparams) {
		paramArray = [];

		newcss = findParams(newcss, 'css', 'text');
		newcss = findParams(newcss, 'css', 'int');
		newcss = findParams(newcss, 'css', 'color');

		newhtml = findParams(newhtml, 'html', 'text');
		newhtml = findParams(newhtml, 'html', 'int');
		newhtml = findParams(newhtml, 'html', 'color');

		newjs = findParams(newjs, 'js', 'text');
		newjs = findParams(newjs, 'js', 'int');
		newjs = findParams(newjs, 'js', 'color');
	} else {
		newcss = replaceParamsFromDialog(newcss, 'css');
		newhtml = replaceParamsFromDialog(newhtml, 'html');
		newjs = replaceParamsFromDialog(newjs, 'js');
	}
//	console.log(newcss);

	//*** save source and reload iframe

	if (xhrIFrame) xhrIFrame.abort(); //kill active Ajax request
	var PostValues = {
		"op": "updateiframe",
		"code": CurrentCode,
		"version": CurrentVersion,
		"js": newjs,
		"css": newcss,
		"html": newhtml
	};

	xhrIFrame = $.ajax({
		type: 'POST',
		url: GlobalRoot + "op.php",
		data: PostValues,
		dataType: "json",
		success: function(resultData) {
			if (resultData[0].success) {
				document.getElementById('iframesource').contentWindow.location.reload();
			}
		},
		error: function(xhr, status, error) {
			console.log("Network connection error. Please check with your network administrator. Error:" + status);
		}
	});


//	injectHTML('<html><head><script src="' + GlobalRoot + 'js/jquery-2.1.4.min.js"></script><style>' + newcss + '</style><script>$(document).ready(function () {' + newjs + '});</script></head><body>' + newhtml + '</body></html>');
}

//------------------------------------------------------------------------------------------------------------------
function replaceSourceFromDialog(inputText, filetype) {
	var re = new RegExp('#(int|color|text)\\s?\\((.+?)\\)#', 'i');
	var m;
	var inputTextTemp = inputText;
	var ReplaceList = [];
	while ((m = re.exec(inputTextTemp)) !== null) {
		var params_str = m[2];
		var params = params_str.split(',');
		var paramtype = m[1];
		var varname = varnamefromstr(params[0]);
		var newstring = '';

		var newvalue = $("#" + filetype + varname).val();
		var dialogvalue = newvalue;
		var newunit = '';
		if ($("#" + filetype + varname + "unit").length == 0) { /* doesn't have unit*/ } else {
			newunit = "" + $("#" + filetype + varname + "unit").val();
			dialogvalue += newunit;
		}



		if (paramtype=='text') {
			newstring = '#text('+params[0]+','+ newvalue +')#';
		} else
		if (paramtype=='int') {
			var params = params_str.split(',');

			if (params[2]==undefined) { params[2] = 0; }
			if (params[3]==undefined) { params[3] = 100; }
			if (params[4]==undefined) { params[4] = ''; }

			newstring = '#int('+params[0] +','+ newvalue +','+ params[2] +','+ params[3] +','+ params[4] +')#';
		} else
		if (paramtype=='color') {
			var params = params_str.split(',');

			newstring = '#color('+params[0]+','+ newvalue +')#';
		}


		ReplaceList.push({
			"old": m[0],
			"new": newstring
		});

		inputTextTemp = inputTextTemp.substr(0, m.index) + inputTextTemp.substr(m.index + m[0].length );
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}
		inputTextTemp = inputTextTemp.substr(0, m.index) + dialogvalue + SemiCol + inputTextTemp.substr(m.index);
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
	var PrevType = '';

	for (var i = 0, l = paramArray.length; i < l; i++) {

		if (paramArray[i].filetype!=PrevType) {
			$("#ParametersList").append("<div class='proprow_preview_header'>"+ paramArray[i].filetype +"</div>");
			PrevType = paramArray[i].filetype;
		}
		$("#ParametersList").append("<div class='proprow_preview' id='row_" + i + "'></div>");


		if (paramArray[i].type == "slider") {
			$("#row_" + i).html("<div class='proprow_preview_title'>" + paramArray[i].filetype + " - " + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-preview-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div><input type=\"range\">");
		} else
		if (paramArray[i].type == "int") {

			$("#row_" + i).html("<div class='propname_preview'>" + paramArray[i].vartext + "</div><div class='propvalue-preview-" + paramArray[i].type + "'><input type='hidden' id='" + paramArray[i].filetype + paramArray[i].varname + "unit' value='" + paramArray[i].unit + "' ><div class='input-group' style='width:200px;'>\
            <input type='text' class='form-control rangeselector' id='" + paramArray[i].filetype + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue +
				"' data-bts-min='"+paramArray[i].minvalue+"'  data-bts-max='"+paramArray[i].maxvalue+"'  data-bts-postfix='"+paramArray[i].unit+"'>\
            <div class='input-group-btn'>\
                <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'>\
                    <span class='caret'></span>\
                    <span class='sr-only'>Toggle Dropdown</span>\
                </button>\
                <ul class='dropdown-menu pull-right' role='menu'>\
                    <li><a href='#' data-numberstype='px' data-controllerid='" + paramArray[i].filetype + paramArray[i].varname + "unit' data-parentrowid='row_" + i + "' class='numberstylemenu'>px</a></li>\
                    <li><a href='#' data-numberstype='%' data-controllerid='" + paramArray[i].filetype + paramArray[i].varname + "unit' data-parentrowid='row_" + i + "' class='numberstylemenu'>%</a></li>\
                    <li><a href='#' data-numberstype='pt' data-controllerid='" + paramArray[i].filetype + paramArray[i].varname + "unit' data-parentrowid='row_" + i +
				"' class='numberstylemenu'>pt</a></li>\
						  <li><a href='#' data-numberstype='none' data-controllerid='" + paramArray[i].filetype + paramArray[i].varname + "unit' data-parentrowid='row_" + i + "' class='numberstylemenu'>none</a></li>\
                </ul>\
            </div>\
        </div>"); //'"
		} else
		if (paramArray[i].type == "color") {
			$("#row_" + i).html("<div class='propname_preview'>" + paramArray[i].vartext + "</div><div class='propvalue-preview-" + paramArray[i].type + "'><input type='text' class='form-control colorselector' id='" + paramArray[i].filetype + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else
		if (paramArray[i].type == "text") {
			$("#row_" + i).html("<div class='propname_preview'>" + paramArray[i].vartext + "</div><div class='propvalue-preview-" + paramArray[i].type + "'><input type='text' class='form-control textselector' id='" + paramArray[i].filetype + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else {
			$("#row_" + i).html("<div class='propname_preview'>" + paramArray[i].vartext + "</div><div class='propvalue-preview-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div>");
		}
	}

	$(".textselector").css("width", "200px");
	$(".textselector").on('keyup', function() {
		updateIFrame=true;
	});

	$(".colorselector").ColorPickerSliders({
		placement: 'right',
		hsvpanel: true,
		previewformat: 'hex',
		onchange: function(container, color) {
			console.log(				'update 1'			);
			updateIFrame=true;
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
		updateIFrame=true;
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
		updateIFrame=true;
		e.preventDefault();
	});


	$(document).on("shown.bs.dropdown", ".input-group-btn", function () {
	    // calculate the required sizes, spaces
	    var $ul = $(this).children(".dropdown-menu");
	    var $button = $(this).children(".dropdown-toggle");
	    var ulOffset = $ul.offset();
	    // how much space would be left on the top if the dropdown opened that direction
	    var spaceUp = (ulOffset.top - $button.height() - $ul.height()) - $(window).scrollTop();
	    // how much space is left at the bottom
	    var spaceDown = $(window).scrollTop() + $(window).height() - (ulOffset.top + $ul.height());
	    // switch to dropup only if there is no space at the bottom AND there is space at the top, or there isn't either but it would be still better fit
	    if (spaceDown < 0 && (spaceUp >= 0 || spaceUp > spaceDown))
	      $(this).addClass("dropup");
	}).on("hidden.bs.dropdown", ".input-group-btn", function() {
	    // always reset after close
	    $(this).removeClass("dropup");
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
			height: ($(window).height() - 52) + 'px'
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
		height: ($(window).height() - 52) + 'px'
	});

	updateIFrameTimer = setInterval(function() {
		if (updateIFrame) {
			updateiframefunc(false);
			updateIFrame = false;
		}
	},250);

	//------------------------------------------------------------------------------
	iframe = document.getElementById('iframesource');
	iframedoc = iframe.document;
	if (iframe.contentDocument) iframedoc = iframe.contentDocument;
	else if (iframe.contentWindow) iframedoc = iframe.contentWindow.document;

	updateiframefunc(true);
	updateparamdialog();

});
