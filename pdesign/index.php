<?php include_once "op.php"; ?><!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>pDesign</title>

		<link rel="stylesheet" href="codemirror-5.10/lib/codemirror.css">
		<link rel="stylesheet" href="codemirror-5.10/addon/hint/show-hint.css">

      <script><?php echo 'var code="'. $code .'"'; ?></script>
		<script src="codemirror-5.10/lib/codemirror.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/hint/show-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/xml-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/html-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/javascript-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/css-hint.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/search/searchcursor.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/search/match-highlighter.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/selection/active-line.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/comment/continuecomment.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/edit/matchbrackets.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/edit/closebrackets.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/edit/closetag.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/fold/xml-fold.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/edit/matchtags.js"></script>


		<script type="text/javascript" src="codemirror-5.10/mode/xml/xml.js"></script>
		<script type="text/javascript" src="codemirror-5.10/mode/javascript/javascript.js"></script>
		<script type="text/javascript" src="codemirror-5.10/mode/css/css.js"></script>
		<script type="text/javascript" src="codemirror-5.10/mode/htmlmixed/htmlmixed.js"></script>


      <link href="file-manager/jquery.file.manager.css" rel="stylesheet">

		<link href="css/bootstrap.min.css" rel="stylesheet">
		<link href="css/main.css" rel="stylesheet">

		<script src="js/jquery-2.1.4.min.js"></script>
		<script src="js/bootstrap.min.js"></script>
      <script src="file-manager/jquery.file.manager.js"></script>
      <script src="js/split.min.js"></script>
		<script src="js/main.js"></script>
      <!--gopherscript-->


	</head>

	<body>

      <div style="height:5%; background:#fafafa; font-size:18px; text-align:center;">
         Parametric Design
         <button class="btn btn-default file-manager-linked" type="button" data-input-id="image-2" >Click to select Image</button>
      </div>
      <div style="height:95%;">
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
	</body>

</html>
