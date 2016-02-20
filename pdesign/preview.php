<!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>pDesign</title>

		<link href="../../css/font-awesome.min.css" rel="stylesheet">
		<link href="../../css/bootstrap.colorpickersliders.css" rel="stylesheet" type="text/css" media="all">
      <link href="../../css/jquery.bootstrap-touchspin.css" rel="stylesheet" type="text/css" media="all">
		<link href="../../file-manager/jquery.file.manager.css" rel="stylesheet">

		<link href="../../css/jquery-ui.min.css" rel="stylesheet">
		<link href="../../css/bootstrap.min.css" rel="stylesheet">
		<link href="../../css/bootstrap-editable.css" rel="stylesheet">

		<link href="../../css/main.css" rel="stylesheet">

		<script src="../../js/jquery-2.1.4.min.js"></script>
		<script src="../../js/jquery-ui.min.js"></script>
		<script src="../../js/jquery.tmpl.min.js"></script>
		<script src="../../js/bootstrap.min.js"></script>

		<script src="../../js/tinycolor.min.js"></script>
	   <script src="../../js/bootstrap.colorpickersliders.js"></script>
		<script src="../../js/jquery.bootstrap-touchspin.js"></script>
		<script src="../../js/bootstrap-editable.js"></script>

		<script>
			var js = '<?php  //'
			$js2 = preg_replace("/\r\n|\r|\n/","\\\n",$js);
			echo str_replace("'","\\'",$js2);
			?>';

			var css = '<?php  //'
			$css2 = preg_replace("/\r\n|\r|\n/","\\\n",$css);
			echo str_replace("'","\\'",$css2);
			?>';
			var html = '<?php  //'
			$html2 = preg_replace("/\r\n|\r|\n/","\\\n",$html);
			echo str_replace("'","\\'",$html2);
			?>';
		</script>


		<script src="../../js/preview.js"></script>
	</head>

	<body>

		<div style="height:50px; background:#fff; font-size:18px; padding-left:10px; padding-top:8px; display:flex; width:100%; position:relative;   box-shadow: 0 0 5px rgba(57,70,78,.3); z-index:100;">
			<div style=" margin-right:5px;">
				<img src="../../17602239_s.jpg" style="height:40px;">
			</div>

				<div style=" margin-top:6px;">
					Elo Parametric Design
				</div>

				<div style="margin-right:10px; margin-top:2px;  flex: 3 0 0; text-align:right">
				</div>

				<div style="margin-right:20px;  text-align:right">
					<button class="btn btn-default" data-toggle="modal" id="PreviewButton">Preview</button>

					<button class="btn btn-default" data-toggle="modal" id="ForkButton">Fork This</button>
					<button class="btn btn-default" data-toggle="modal" id="UpdateButton">Update</button>

					<button class="btn btn-default" data-toggle="modal" id="ParametersButton">Parameters</button>

					<button class="btn btn-default file-manager-linked" data-input-id="">Image Library</button>
					<button class="btn btn-default" id="NewProject">New Project</button>
				</div>
		</div>

		<div id="sidebar_preview" style='width:400px;' >

			<div class="element">
		    <div class="elementBody" style="padding-top: 0px; border-top-style: none; padding-bottom: 0px; border-bottom-style: none; overflow: hidden; opacity: 1; height: auto;">
				<div class="ebCont">

					<div class="projectinfo active" style='margin-top:10px; ' >
		      		<a href="#" id="projecttitle" data-type="text" data-placement="right" data-title="Enter title"><?php echo $ProjectTitle; ?></a>
					</div>
				</div>

				<div id='ParametersList'></div>

		   </div> <!-- /elementBody -->
		  </div>

		</div>

		<iframe id="iframesource" src="" class="iframebox" style='margin-left:400px; background-color: white;'></iframe>
	</body>

	</html>
