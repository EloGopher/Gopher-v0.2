<?php include_once "op.php"; ?><!DOCTYPE html>
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


		<link href="../css/bootstrap.colorpickersliders.css" rel="stylesheet" type="text/css" media="all">
      <link href="../css/jquery.bootstrap-touchspin.css" rel="stylesheet" type="text/css" media="all">
		<link href="../file-manager/jquery.file.manager.css" rel="stylesheet">

		<link href="../css/jquery-ui.min.css" rel="stylesheet">
		<link href="../css/bootstrap.min.css" rel="stylesheet">
		<link href="../css/main.css" rel="stylesheet">

		<script src="../js/jquery-2.1.4.min.js"></script>
		<script src="../js/jquery-ui.min.js"></script>
		<script src="../js/bootstrap.min.js"></script>
		<script src="../file-manager/jquery.file.manager.js"></script>
		<script src="../js/split.min.js"></script>

		<script src="../js/tinycolor.min.js"></script>
	   <script src="../js/bootstrap.colorpickersliders.js"></script>
		<script src="../js/jquery.bootstrap-touchspin.js"></script>

		<script src="../js/main.js"></script>
	</head>

	<body>

		<div style="height:50px; background:#fafafa; font-size:18px; padding-left:10px; padding-top:8px; display:flex; width:100%">
				<div style="flex: 1 0 0;">
					Elo Parametric Design
				</div>

				<div style="margin-right:20px; margin-top:2px;  flex: 3 0 0; text-align:right">

					<div class="history_control">
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


					<button class="btn btn-default" data-toggle="modal" id="ProjectButton">Project Info</button>

					<button class="btn btn-default" data-toggle="modal" id="ParametersButton">Parameters</button>

					<button class="btn btn-default file-manager-linked" data-input-id="">Image Library</button>
					<button class="btn btn-default" id="NewProject">New Project</button>
				</div>
		</div>
		<div id="editorsdiv" style="height:99%;">
			<div class="split split-horizontal" id="TopRow">
				<div class="xPanel split content" id="HTMLPanel">
					<textarea id="HTMLCode" name="HTMLCode" class="editbox"><?php echo $html; ?></textarea>
					<div id="htmleditor_div_hint" class="EditorHint">HTML</div>
				</div>
				<div class="xPanel split content" id="JSPanel">
					<textarea id="JSCode" name="JSCode" class="editbox"><?php echo $js; ?></textarea>
					<div id="jseditor_div_hint" class="EditorHint">JavaScript</div>
				</div>
			</div>
			<div class="split split-horizontal" id="BottomRow">
				<div class="xPanel split content" id="CSSPanel">
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

		<div id="ProjectModal" class="modal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
						<h4 class="modal-title">Project</h4>

					</div>
					<div class="modal-body paramtable" id="ProjectDiv">

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
