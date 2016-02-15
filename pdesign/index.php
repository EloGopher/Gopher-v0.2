<?php include_once 'op.php';
?><!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>pDesign</title>

		<link rel="stylesheet" href="../codemirror-5.10/lib/codemirror.css">
		<link rel="stylesheet" href="../codemirror-5.10/addon/hint/show-hint.css">

		<script src="../codemirror-5.10/lib/codemirror.js"></script>

		<script type="text/javascript" src="../codemirror-5.10/addon/hint/show-hint.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/hint/xml-hint.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/hint/html-hint.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/hint/javascript-hint.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/hint/css-hint.js"></script>

		<script type="text/javascript" src="../codemirror-5.10/addon/search/searchcursor.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/search/match-highlighter.js"></script>

		<script type="text/javascript" src="../codemirror-5.10/addon/selection/active-line.js"></script>

		<script type="text/javascript" src="../codemirror-5.10/addon/comment/continuecomment.js"></script>

		<script type="text/javascript" src="../codemirror-5.10/addon/edit/matchbrackets.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/edit/closebrackets.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/edit/closetag.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/fold/xml-fold.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/addon/edit/matchtags.js"></script>

		<script type="text/javascript" src="../codemirror-5.10/addon/format/formatting.js"></script>

		<script type="text/javascript" src="../codemirror-5.10/mode/xml/xml.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/mode/css/css.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/mode/javascript/javascript.js"></script>
		<script type="text/javascript" src="../codemirror-5.10/mode/htmlmixed/htmlmixed.js"></script>

		<script src="../js/beautify.js"></script>
      <script src="../js/beautify-css.js"></script>
      <script src="../js/beautify-html.js"></script>

		<link href="../css/font-awesome.min.css" rel="stylesheet">
		<link href="../css/bootstrap.colorpickersliders.css" rel="stylesheet" type="text/css" media="all">
      <link href="../css/jquery.bootstrap-touchspin.css" rel="stylesheet" type="text/css" media="all">
		<link href="../file-manager/jquery.file.manager.css" rel="stylesheet">

		<link href="../css/jquery-ui.min.css" rel="stylesheet">
		<link href="../css/bootstrap.min.css" rel="stylesheet">
		<link href="../css/bootstrap-editable.css" rel="stylesheet">

		<link href="../css/main.css" rel="stylesheet">

		<link href="../css/jquery.fileupload.css" rel="stylesheet">

		<script src="../js/jquery-2.1.4.min.js"></script>
		<script src="../js/jquery-ui.min.js"></script>
		<script src="../js/jquery.tmpl.min.js"></script>
		<script src="../js/bootstrap.min.js"></script>
		<script src="../file-manager/jquery.file.manager.js"></script>
		<script src="../js/split.js"></script>

		<script src="../js/tinycolor.min.js"></script>
	   <script src="../js/bootstrap.colorpickersliders.js"></script>
		<script src="../js/jquery.bootstrap-touchspin.js"></script>
		<script src="../js/bootstrap-editable.js"></script>

		<script src="../js/vendor/jquery.ui.widget.js"></script>
		<script src="../js/jquery.iframe-transport.js"></script>
		<script src="../js/jquery.fileupload.js"></script>

		<script src="../js/main.js"></script>
	</head>

	<body>

		<div style="height:50px; background:#fff; font-size:18px; padding-left:10px; padding-top:8px; display:flex; width:100%; position:relative;   box-shadow: 0 0 5px rgba(57,70,78,.3); z-index:100;">
			<div style=" margin-right:5px;">
				<img src="../17602239_s.jpg" style="height:40px;">
			</div>

				<div style=" margin-top:6px;">
					Elo Parametric Design
				</div>

				<div style="margin-right:10px; margin-top:2px;  flex: 3 0 0; text-align:right">

					<div class="history_control" style='opacity:0.2'>
						<div class="history_btmControl">
							<div class="history_btnPlay " title="Play/Pause video">
								<span class="history_icon-play"></span>
							</div>
							<div class="history_progress-bar">
								<div class="history_progress">
									<span class="history_bufferBar"></span>
									<span class="history_timeBar"></span>
								</div>
							</div>
							<div class="history_sound " title="Mute/Unmute sound">
								<span class="history_icon-sound"></span>
							</div>
							<div class="history_btnFS " title="Switch to full screen">
								<span class="history_icon-fullscreen"></span>
							</div>
						</div>
					</div>
				</div>

				<div style="margin-right:20px;  text-align:right">
					<button class="btn btn-default" data-toggle="modal" id="ForkButton">Fork This</button>
					<button class="btn btn-default" data-toggle="modal" id="TidyButton">Tidy</button>
					<button class="btn btn-default" data-toggle="modal" id="UpdateButton">Update</button>

					<button class="btn btn-default" data-toggle="modal" id="ParametersButton">Parameters</button>

					<button class="btn btn-default file-manager-linked" data-input-id="">Image Library</button>
					<button class="btn btn-default" id="NewProject">New Project</button>
				</div>
		</div>

		<div id="sidebar" >
			<div id="author_toggler" class="toggler active">Design Author</div>

			<div class="element">
		    <div class="elementBody" style="padding-top: 0px; border-top-style: none; padding-bottom: 0px; border-bottom-style: none; overflow: hidden; opacity: 1; height: auto;">
		      <div class="ebCont">
		        <div class="avatar">
		          <img src="//www.gravatar.com/avatar/f16362708c253b0b17199935ff7c2cb6/?default=&amp;s=80" height="40" width="40">
		          <a title="See public fiddles" href="/user/lovlka/fiddles/">Lerumus Ipsumus</a>

		        </div> <!-- /avatar -->

		        <ul class="userDetails">
		            <li><i class="fa fa-map-marker"></i>Wolderlund</li>
		        </ul> <!-- /userDetails -->
		      </div> <!-- /ebCont -->

				<div class="ebCont">

					<div class="projectinfo active" style='margin-top:10px; ' >
		      		<a href="#" id="projecttitle" data-type="text" data-placement="right" data-title="Enter title">Project title</a>
					</div>

					<div class="projectinfo" style='margin-top:5px;' >
						<a href="#" id="projectdescription" data-type="textarea" data-placement="right" data-title="Enter title">Project description</a>
					</div>

					<div class="projectinfo " style='margin-top:5px;'>
					  <span>Status:</span>
					  <a href="#" id="status"></a>
					</div>


					<input id="ProjectImageUpload" type="file" name="files[]" style="display: none;">
					<div id="projectpicturediv" style='margin-top:10px; width:160px; margin-left:10px; cursor:pointer'>
						<div id="fadeContainer">
							<img src='../placeholder.jpg' id='fade1' style='width:160px;'>
						</div>
					</div>

					<div style='margin-top:10px; width:160px; margin-left:10px;'>
						<!-- The global progress bar -->
						<div id="progress" class="progress" style="display:none; margin-top:10px; margin-bottom:10px;">
							<div class="progress-bar progress-bar-success"></div>
						</div>
						<!-- div id="files" class="files"></div -->
					</div>
				</div>

		   	</div> <!-- /elementBody -->
		  </div>

		</div>
		<div id="editorsdiv" style="margin-left:200px;">
			<div class="split split-horizontal" id="TopRow">
				<div class="xPanel split content" id="HTMLPanel">
					<textarea id="HTMLCode" name="HTMLCode" class="editbox"><?php echo $html; ?></textarea>
					<div id="htmleditor_div_hint" class="EditorHint">HTML</div>
				</div>
				<div class="xPanel split content" id="JSPanel" style="border-top:1px solid #CCC;">
					<textarea id="JSCode" name="JSCode" class="editbox"><?php echo $js; ?></textarea>
					<div id="jseditor_div_hint" class="EditorHint">JAVASCRIPT</div>
				</div>
			</div>
			<div class="split split-horizontal" id="BottomRow">
				<div class="xPanel split content" id="CSSPanel" style="border-left:1px solid #CCC;">
					<textarea id="CSSCode" name="CSSCode" class="editbox"><?php echo $css; ?></textarea>
					<div id="csseditor_div_hint" class="EditorHint">CSS</div>
				</div>
				<div class="xPanel split content" id="PreviewPanel" style="overflow:hidden">
					<iframe id="iframesource" src="" class="iframebox"></iframe>
				</div>
			</div>
		</div>
		<div id="ParametersModal" class="modal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
						<h4 class="modal-title">Parameters</h4>

					</div>
					<div class="modal-body paramtable" id="ParametersList">

					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal" id="close-parameters">Close</button>
						<button type="button" id="save-parameters" class="btn btn-primary">Save changes</button>
					</div>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>
		<!-- /.modal -->


	</body>

	</html>
