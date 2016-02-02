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
	var re = new RegExp('#' + paramtype + ':(.+?)(?=##)##(.+?)(?=##)', 'i');
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

function replaceParamsFromDialog(inputText,filetype) {
	var re = new RegExp('[^#]#(.+?):(.+?)(?=##)##(.+?)(?=##)', 'i');
	var m;
	while ((m = re.exec(inputText)) !== null) {

		var varname = m[2];
		var defvalue = m[3];

		var dialogvalue = $("#"+filetype+"-"+varname).val();
		if ($("#"+filetype+"-"+varname+"-unit").length==0) { /* doesn't have unit*/ } else {
			dialogvalue += ""+ $("#"+filetype+"-"+varname+"-unit").val();
		}

//		console.log(varname+" "+defvalue+" "+dialogvalue+" "+"#"+filetype+"-"+varname+"-unit  "+$("#"+filetype+"-"+varname+"-unit").val());

		inputText = inputText.substr(0, m.index+1) + inputText.substr(m.index + m[0].length + 2);
		//console.log(inputText);
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}

		inputText = inputText.substr(0, m.index+1) + dialogvalue + SemiCol + inputText.substr(m.index+1);
	}
	return inputText;
}


//------------------------------------------------------------------------------------------------------------------
function updateiframe(refreshparams) {

	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();

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
		newcss = replaceParamsFromDialog(newcss,'css');
		newhtml = replaceParamsFromDialog(newhtml,'html');
		newjs = replaceParamsFromDialog(newjs,'js');

	}

	injectHTML('<html><head><script src="/Gopher-v0.2/pdesign/js/jquery-2.1.4.min.js"></script><style>' + newcss + '</style><script>$(document).ready(function () {' + newjs + '});</script></head><body>' + newhtml + '</body></html>');
}

function replaceSourceFromDialog(inputText,filetype) {
	var re = new RegExp('[^#]#(.+?):(.+?)(?=##)##(.+?)(?=##)', 'i');
	var m;
	var inputTextTemp = inputText;
	var ReplaceList = [];
	while ((m = re.exec(inputTextTemp)) !== null) {

		var varname = m[2];
		var defvalue = m[3];

		var dialogvalue = $("#"+filetype+"-"+varname).val();
		if ($("#"+filetype+"-"+varname+"-unit").length==0) { /* doesn't have unit*/ } else {
			dialogvalue += ""+ $("#"+filetype+"-"+varname+"-unit").val();
		}

		//console.log('#'+m[1]+':'+m[2]+'##'+m[3]+'##     '+dialogvalue);// varname+" "+defvalue+" "+dialogvalue+" "+"#"+filetype+"-"+varname+"-unit  "+$("#"+filetype+"-"+varname+"-unit").val());

		ReplaceList.push({"old":'#'+m[1]+':'+m[2]+'##'+m[3]+'##', "new":'#'+m[1]+':'+m[2]+'##'+dialogvalue+'##'});

		inputTextTemp = inputTextTemp.substr(0, m.index+1) + inputTextTemp.substr(m.index + m[0].length + 2);
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}

		inputTextTemp = inputTextTemp.substr(0, m.index+1) + dialogvalue + SemiCol + inputTextTemp.substr(m.index+1);
	}

	for (var i=0; i<ReplaceList.length; i++) {
		inputText = inputText.replace(ReplaceList[i].old,ReplaceList[i].new);
	}
	console.log(ReplaceList);
	return inputText;
}


//------------------------------------------------------------------------------------------------------------------
function updatesource() {

	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();

	var newcss = css;
	var newhtml = html;
	var newjs = js;

	newcss = replaceSourceFromDialog(newcss,'css');
	newhtml = replaceSourceFromDialog(newhtml,'html');
	newjs = replaceSourceFromDialog(newjs,'js');

	JSeditor.setValue(newjs);
	CSSeditor.setValue(newcss);
	HTMLeditor.setValue(newhtml);

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



//	injectHTML('<html><head><script src="js/jquery-2.1.4.min.js"></script><style>' + newcss + '</style><script>$(document).ready(function () {' + newjs + '});</script></head><body>' + newhtml + '</body></html>');
}


function updateserver()
{
	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();

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
			url: "/Gopher-v0.2/pdesign/op.php",
			data: PostValues,
			dataType: "json",
			success: function(resultData) {
				if (resultData[0].success) {
					console.log(resultData[0].version);
					history.pushState(null, null,'/Gopher-v0.2/pdesign/'+resultData[0].code+'/'+resultData[0].version );
				}

				//

			},
			error: function(xhr, status, error) {
				console.log("Network connection error. Please check with your network administrator. Error:" + status);
			}
		});
	}, 500); //delay before making the call
}

function updateparamdialog()
{

	$("#ParametersList").html("<div class='propheaderrow'><div class='propheadercell'>File</div><div class='propheadercell'>Name</div><div class='propheadercell'>Value</div></div>");

	for (var i = 0, l = paramArray.length; i < l; i++) {
		$("#ParametersList").append("<div class='proprow' id='row_"+ i +"'></div>");

		if (paramArray[i].type == "slider") {
			$("#row_"+i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div><input type=\"range\">");
		} else
		if (paramArray[i].type == "number") {
			var tempStr = paramArray[i].defaultvalue;
			var tempUnit = '';

			if (tempStr.indexOf('px')!=-1) { tempUnit = 'px'; }
			if (tempStr.indexOf('pt')!=-1) { tempUnit = 'pt'; }
			if (tempStr.indexOf('%')!=-1) { tempUnit = '%'; }


			$("#row_"+i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='hidden' id='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"-unit' value='"+tempUnit+"' ><div class='input-group' style='width:200px;'>\
            <input type='text' class='form-control rangeselector' id='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"' value='" + paramArray[i].defaultvalue +
				"'>\
            <div class='input-group-btn'>\
                <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'>\
                    <span class='caret'></span>\
                    <span class='sr-only'>Toggle Dropdown</span>\
                </button>\
                <ul class='dropdown-menu pull-right' role='menu'>\
                    <li><a href='#' data-numberstype='px' data-controllerid='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"-unit' data-parentrowid='row_"+ i +"' class='numberstylemenu'>px</a></li>\
                    <li><a href='#' data-numberstype='%' data-controllerid='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"-unit' data-parentrowid='row_"+ i +"' class='numberstylemenu'>%</a></li>\
                    <li><a href='#' data-numberstype='pt' data-controllerid='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"-unit' data-parentrowid='row_"+ i +"' class='numberstylemenu'>pt</a></li>\
						  <li><a href='#' data-numberstype='none' data-controllerid='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"-unit' data-parentrowid='row_"+ i +"' class='numberstylemenu'>none</a></li>\
                </ul>\
            </div>\
        </div>");
		} else
		if (paramArray[i].type == "color") {
			$("#row_"+i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='text' class='form-control colorselector' id='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else
		if (paramArray[i].type == "text") {
			$("#row_"+i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='text' class='form-control textselector' id='"+ paramArray[i].filetype +"-"+ paramArray[i].varname +"' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else {
			$("#row_"+i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div>");
		}
	}

	$(".textselector").css("width", "200px");
	$(".textselector").on('keyup',function() {		updateiframe(false);	});

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
		postfix : 'px',
		decimals: 1,
		boostat: 5,
		maxboostedstep: 10,
		forcestepdivisibility: 'none',
	}).on('change',function() {		updateiframe(false);	});

	$('.numberstylemenu').on('click', function(e) {

		//console.log($(this).data('numberstype'));
		//console.log($(this).data('controllerid'));


		if ($(this).data('numberstype')=="none") {
			$("#" + $(this).data('parentrowid') + " .bootstrap-touchspin-postfix").html( '' );
			$("#" + $(this).data('controllerid') ).val('');
		} else {
			$("#" + $(this).data('parentrowid') + " .bootstrap-touchspin-postfix").html( $(this).data('numberstype') );
			$("#" + $(this).data('controllerid') ).val($(this).data('numberstype'));
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
		$(".history_progress").css({
			width: ($("#iframesource").width() - 140) + 'px'
		});
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

			$(".history_progress").css({
				width: ($("#iframesource").width() - 135) + 'px'
			});
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
		window.location.href = '../';
	});

	$("#ProjectButton").on('click', function() {
		$("#ProjectModal").modal({
			show: true
		});
	});

	$("#UpdateButton").on('click', function() {
		updateserver();
	});


	$("#ParametersModal").draggable({
		handle: ".modal-header"
	});

	$("#ParametersButton").on('click', function() {
		updateparamdialog();
		$("#ParametersModal").modal({
			show: true
		});
	});

	$('#ParametersModal').on('shown.bs.modal', function(e) {
		$('.modal-backdrop.in').css({
			'opacity': '0'
		});
	});

	$('#ParametersModal').on('hidden.bs.modal', function () {
		if (!ParametersModalCloseWithSave) {
			updateiframe(true);
		}
		ParametersModalCloseWithSave = false;
	})

	$("#save-parameters").on('click',function() {
		ParametersModalCloseWithSave = true;
		updatesource();
		$("#ParametersModal").modal('hide');
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
		updateiframe(true);
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
		updateiframe(true);
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
		updateiframe(true);
	});

	updateiframe(true);
	HTMLeditor.focus();

	$("#editorsdiv").css({
		height: ($(window).height() - 52) + 'px'
	});

	$("#iframesource").css({
		height: ($("#CSSPanel").height() - 40) + 'px'
	});

	$(".history_progress").css({
		width: ($("#iframesource").width() - 135) + 'px'
	});



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
