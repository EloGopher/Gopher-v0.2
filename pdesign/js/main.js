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

//------------------------------------------------------------------------------------------------------------------
function replaceParamsFromDialog(inputText, filetype) {
	var re = new RegExp('[^#]#(.+?):(.+?)(?=##)##(.+?)(?=##)', 'i');
	var m;
	while ((m = re.exec(inputText)) !== null) {

		var varname = m[2];
		var defvalue = m[3];

		var dialogvalue = $("#" + filetype + "-" + varname).val();
		if ($("#" + filetype + "-" + varname + "-unit").length == 0) { /* doesn't have unit*/ } else {
			dialogvalue += "" + $("#" + filetype + "-" + varname + "-unit").val();
		}

		//		console.log(varname+" "+defvalue+" "+dialogvalue+" "+"#"+filetype+"-"+varname+"-unit  "+$("#"+filetype+"-"+varname+"-unit").val());

		inputText = inputText.substr(0, m.index + 1) + inputText.substr(m.index + m[0].length + 2);
		//console.log(inputText);
		var SemiCol = "";
		if (m[0].substr([0].length - 1) == ";") {
			SemiCol = ";";
		}

		inputText = inputText.substr(0, m.index + 1) + dialogvalue + SemiCol + inputText.substr(m.index + 1);
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
		newcss = replaceParamsFromDialog(newcss, 'css');
		newhtml = replaceParamsFromDialog(newhtml, 'html');
		newjs = replaceParamsFromDialog(newjs, 'js');

	}

	injectHTML('<html><head><script src="' + GlobalRoot + 'js/jquery-2.1.4.min.js"></script><style>' + newcss + '</style><script>$(document).ready(function () {' + newjs + '});</script></head><body>' + newhtml + '</body></html>');
}

//------------------------------------------------------------------------------------------------------------------
function replaceSourceFromDialog(inputText, filetype) {
	var re = new RegExp('[^#]#(.+?):(.+?)(?=##)##(.+?)(?=##)', 'i');
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
function updatesource() {

	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();

	var newcss = css;
	var newhtml = html;
	var newjs = js;

	newcss = replaceSourceFromDialog(newcss, 'css');
	newhtml = replaceSourceFromDialog(newhtml, 'html');
	newjs = replaceSourceFromDialog(newjs, 'js');

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


//------------------------------------------------------------------------------------------------------------------
function updateserver() {
	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();

	var ProjectInfo = {};

	if ($("#projecttitle").text() != "") {
		ProjectInfo.title = $("#projecttitle").text();
		ProjectInfo.description = $("#projectdescription").text();
		ProjectInfo.title = $("#projectpicture").attr('src');
		ProjectInfo.publish = ($("#ans").is(':checked')) ? 1 : 0;
	}

	console.log(ProjectInfo);


	if (requestTimer) window.clearTimeout(requestTimer); //see if there is a timeout that is active, if there is remove it.
	if (xhr) xhr.abort(); //kill active Ajax request
	requestTimer = setTimeout(function() {
		var PostValues = {
			"op": "update",
			"js": js,
			"css": css,
			"html": html,
			"project": ProjectInfo
		};

		xhr = $.ajax({
			type: 'POST',
			url: GlobalRoot + "op.php",
			data: PostValues,
			dataType: "json",
			success: function(resultData) {
				if (resultData[0].success) {
					console.log(resultData[0].version);
					history.pushState(null, null, GlobalRoot + '' + resultData[0].code + '/' + resultData[0].version);
				}

				//

			},
			error: function(xhr, status, error) {
				console.log("Network connection error. Please check with your network administrator. Error:" + status);
			}
		});
	}, 500); //delay before making the call
}


//------------------------------------------------------------------------------------------------------------------
function forkproject() {
	var js = JSeditor.getValue();
	var css = CSSeditor.getValue();
	var html = HTMLeditor.getValue();

	if (requestTimer) window.clearTimeout(requestTimer); //see if there is a timeout that is active, if there is remove it.
	if (xhr) xhr.abort(); //kill active Ajax request
	requestTimer = setTimeout(function() {
		var PostValues = {
			"op": "fork",
			"js": js,
			"css": css,
			"html": html
		};

		xhr = $.ajax({
			type: 'POST',
			url: GlobalRoot + "op.php",
			data: PostValues,
			dataType: "json",
			success: function(resultData) {
				console.log(resultData);
				if (resultData[0].success) {
					window.location.href = GlobalRoot + '' + resultData[0].forkpath;
				}
			},
			error: function(xhr, status, error) {
				console.log("Network connection error. Please check with your network administrator. Error:" + status);
			}
		});
	}, 500); //delay before making the call
}


//------------------------------------------------------------------------------------------------------------------
function updateparamdialog() {

	$("#ParametersList").html("<div class='propheaderrow'><div class='propheadercell'>File</div><div class='propheadercell'>Name</div><div class='propheadercell'>Value</div></div>");

	for (var i = 0, l = paramArray.length; i < l; i++) {
		$("#ParametersList").append("<div class='proprow' id='row_" + i + "'></div>");

		if (paramArray[i].type == "slider") {
			$("#row_" + i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div><input type=\"range\">");
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


			$("#row_" + i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='hidden' id='" + paramArray[i].filetype + "-" + paramArray[i].varname + "-unit' value='" + tempUnit + "' ><div class='input-group' style='width:200px;'>\
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
			$("#row_" + i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='text' class='form-control colorselector' id='" + paramArray[i].filetype + "-" + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else
		if (paramArray[i].type == "text") {
			$("#row_" + i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'><input type='text' class='form-control textselector' id='" + paramArray[i].filetype + "-" + paramArray[i].varname + "' value='" + paramArray[i].defaultvalue + "' ></div>");
		} else {
			$("#row_" + i).html("<div class='proptype'>" + paramArray[i].filetype + "</div><div class='propname'>" + paramArray[i].varname.replace(/\_/g, " ") + "</div><div class='propvalue-" + paramArray[i].type + "'>" + paramArray[i].defaultvalue + "</div>");
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
		$("#editorsdiv").css({
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

	//------------------------------------------------------------------------------
	$("#editorsdiv").css({
		height: ($(window).height() - 52) + 'px'
	});

	//------------------------------------------------------------------------------
	$("#htmleditor_div_hint").show();
	$("#csseditor_div_hint").show();
	$("#jseditor_div_hint").show();


	//------------------------------------------------------------------------------
	iframe = document.getElementById('iframesource');
	iframedoc = iframe.document;
	if (iframe.contentDocument) iframedoc = iframe.contentDocument;
	else if (iframe.contentWindow) iframedoc = iframe.contentWindow.document;


	//------------------------------------------------------------------------------
	Split(['#TopRow', '#BottomRow'], {
		gutterSize: 8,
		sizes: [50, 50],
		cursor: 'col-resize'
	})

	Split(['#HTMLPanel', '#JSPanel'], {
		direction: 'vertical',
		sizes: [60, 40],
		gutterSize: 8,
		cursor: 'row-resize'
	})

	Split(['#CSSPanel', '#PreviewPanel'], {
		direction: 'vertical',
		sizes: [40, 60],
		gutterSize: 8,
		cursor: 'row-resize'
	})

	//------------------------------------------------------------------------------
	//toggle `popup` / `inline` mode
	$.fn.editable.defaults.mode = 'popup';

	//make username editable
	$('#projecttitle').editable({
		container: 'body',
		title : 'Project Title',
		placeholder : 'Project title',
		params : function(params) {
			params.op = 'updateprojectinfo';
			return params
		},
		url: GlobalRoot + 'op.php',
		pk :1,
		type:'text'

	});

	$('#projectdescription').editable({
		container: 'body',
		title : 'Project description',
		placeholder : 'Project description',
		params : function(params) {
			params.op = 'updateprojectinfo';
			return params
		},
		url: GlobalRoot + 'op.php',
		pk :1,
		type : 'textarea',
		rows : 5,

	});

	//make status editable
	$('#status').editable({
		container: 'body',
		type: 'select',
		title: 'Select status',
		placement: 'right',
		value: 1,
		source: [{
				value: 1,
				text: 'draft'
			}, {
				value: 2,
				text: 'offline'
			}, {
				value: 3,
				text: 'online'
			}]
			/*
			//uncomment these lines to send data on server
			,pk: 1
			,url: '/post'
			*/
	});


	//------------------------------------------------------------------------------
	$("#NewProject").on('click', function() {
		window.location.href = GlobalRoot;
	});

	//------------------------------------------------------------------------------
	$("#ForkButton").on('click', function() {
		forkproject();
	});

	//------------------------------------------------------------------------------
	$("#save-projectdetails").on('click', function() {

		if ($("#ProjectTitleInput").val() != '') {
			$("#projecttitle").html($("#ProjectTitleInput").val());
		} else {
			$("#projecttitle").html('no title');
		}

		if ($("#ProjectDescriptionInput").val() != '') {
			$("#projectdescription").html($("#ProjectDescriptionInput").val());
		} else {
			$("#projectdescription").html('no description');
		}

		if ($("#ProjectImageInput").val() != '') {
			$("#projectpicture").attr('src', $("#ProjectImageInput").val());
		}

		updateserver();
		//$("#ProjectTitleInput").val()


		$("#ProjectModal").modal('hide');
	});

	//------------------------------------------------------------------------------
	$('#projectpicturediv').on('click', function() {
		$('#ProjectImageUpload').click();
	});


	$('#ProjectImageUpload').fileupload({
			maxNumberOfFiles: 1,
			acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
			disableImageResize: true,
			url: GlobalRoot + 'phpupload/',
			dataType: 'json',
			start: function(e) {
				$("#progress").show();
			},
			done: function(e, data) {
				//console.log(data.result.files[0]);

				setTimeout(function() {
					$("#progress").fadeOut();

					var oldImg = $("#fade1");

					var img = new Image();
					img.src = data.result.files[0].thumbnailUrl;

					var newImg = $(img).hide();

					var loaded = false,
						wait;

					img.addEventListener('load', function() {
						loaded = true;
					}, true);

					wait = setInterval(function() {
						if (loaded) {
							clearInterval(wait);
							var newimg_width = img.width;
							var newimg_height = img.height;
							if (newimg_width > 160) {
								newimg_width = 160;
							}
							if (newimg_height > 160) {
								newimg_height = 160;
							}

							//console.log(img.width+ 'x' + img.height);

							$("#fadeContainer").append(img);

							newImg.css({
								'top': 80 - (img.height / 2) + 'px',
								'left': 80 - (img.width / 2) + 'px'
							});


							oldImg.stop(true).fadeOut(500, function() {
								$(this).remove();
								newImg.attr('id', 'fade1');
								$(".progress-bar").css({
									'width': '0%'
								});
								console.log(newImg.height());
							});
							newImg.fadeIn(500);
						}
					}, 0);
				}, 500);

				/*
         $.each(data.result.files, function (index, file) {
             $('<p/>').text(file.name).appendTo('#files');
         });
			*/
			},
			progressall: function(e, data) {
				var progress = parseInt(data.loaded / data.total * 100, 10);
				$('#progress .progress-bar').css('width', progress + '%');
			}
		}).prop('disabled', !$.support.fileInput)
		.parent().addClass($.support.fileInput ? undefined : 'disabled');



	//------------------------------------------------------------------------------
	$("#UpdateButton").on('click', function() {
		updateserver();
	});

	//------------------------------------------------------------------------------
	$("#ParametersButton").on('click', function() {
		updateparamdialog();
		$("#ParametersModal").modal({
			show: true
		});
	});

	$("#ParametersModal").draggable({
		handle: ".modal-header"
	});

	$('#ParametersModal').on('shown.bs.modal', function(e) {
		$('.modal-backdrop.in').css({
			'opacity': '0'
		});
	});

	$('#ParametersModal').on('hidden.bs.modal', function() {
		if (!ParametersModalCloseWithSave) {
			updateiframe(true);
		}
		ParametersModalCloseWithSave = false;
	})

	$("#save-parameters").on('click', function() {
		ParametersModalCloseWithSave = true;
		updatesource();
		$("#ParametersModal").modal('hide');
	});


	//------------------------------------------------------------------------------
	$("#TidyButton").on('click', function() {

		var opts = {};
		opts.indent_size = 1;
		opts.indent_char = '\t';
		opts.max_preserve_newlines = 5;
		opts.preserve_newlines = true;
		opts.keep_array_indentation = false;
		opts.break_chained_methods = false;
		opts.indent_scripts = 'normal';
		opts.brace_style = 'collapse';
		opts.space_before_conditional = true;
		opts.unescape_strings = false;
		opts.jslint_happy = false;
		opts.end_with_newline = false;
		opts.wrap_line_length = 0;
		opts.indent_inner_html = false;
		opts.comma_first = false;
		opts.e4x = false;

		var tempHTML = HTMLeditor.getValue();
		var re = new RegExp('[^#]#(.+?):(.+?)(?=##)##(.+?)(?=##)', 'i');
		var m;
		var templist = [];
		var tempcounter = -1;
		while ((m = re.exec(tempHTML)) !== null) {
			tempcounter++;
			templist.push(tempHTML.substr(m.index + 1, m[0].length + 1)); //  m[0]+'##');
			tempHTML = tempHTML.substr(0, m.index + 1) + '((' + tempcounter + '))' + tempHTML.substr(m.index + m[0].length + 2);
		}
		var output = html_beautify(tempHTML, opts);

		for (var i = 0; i < templist.length; i++) {
			output = output.replace('((' + i + '))', templist[i]);
		}

		HTMLeditor.setValue(output);
		//---------------------------


		var tempCSS = CSSeditor.getValue();
		var re = new RegExp('[^#]#(.+?):(.+?)(?=##)##(.+?)(?=##)', 'i');
		var m;
		var templist = [];
		var tempcounter = -1;
		while ((m = re.exec(tempCSS)) !== null) {
			tempcounter++;
			templist.push(tempCSS.substr(m.index + 1, m[0].length + 1)); //  m[0]+'##');
			tempCSS = tempCSS.substr(0, m.index + 1) + '((' + tempcounter + '))' + tempCSS.substr(m.index + m[0].length + 2);
		}
		var output = css_beautify(tempCSS, opts);

		for (var i = 0; i < templist.length; i++) {
			output = output.replace('((' + i + '))', templist[i]);
		}

		CSSeditor.setValue(output);
		//---------------------------


		var tempJS = JSeditor.getValue();
		var re = new RegExp('[^#]#(.+?):(.+?)(?=##)##(.+?)(?=##)', 'i');
		var m;
		var templist = [];
		var tempcounter = -1;
		while ((m = re.exec(tempJS)) !== null) {
			tempcounter++;
			templist.push(tempJS.substr(m.index + 1, m[0].length + 1)); //  m[0]+'##');
			tempJS = tempJS.substr(0, m.index + 1) + '((' + tempcounter + '))' + tempJS.substr(m.index + m[0].length + 2);
		}
		var output = js_beautify(tempJS, opts);

		for (var i = 0; i < templist.length; i++) {
			output = output.replace('((' + i + '))', templist[i]);
		}

		JSeditor.setValue(output);
	});


	//------------------------------------------------------------------------------
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


	//------------------------------------------------------------------------------
	JSeditor = CodeMirror.fromTextArea(document.getElementById("JSCode"), {
		lineNumbers: true,
		lineWrapping: true,
		mode: "javascript",
		extraKeys: {
			"'='": completeIfInTag,
			"Ctrl-Space": "autocomplete"
		},
		styleActiveLine: true,
		matchBrackets: true,
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


	//------------------------------------------------------------------------------
	CSSeditor = CodeMirror.fromTextArea(document.getElementById("CSSCode"), {
		lineNumbers: true,
		lineWrapping: true,
		mode: "css",
		extraKeys: {
			"Ctrl-Space": "autocomplete"
		},
		styleActiveLine: true,
		matchBrackets: true,
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


	//------------------------------------------------------------------------------
	updateiframe(true);
	HTMLeditor.focus();


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
