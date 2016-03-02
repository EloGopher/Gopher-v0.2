<!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>pDesign</title>

		<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,300,300italic,400italic,600italic,700,700italic' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

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

		<div style="height:50px; background-color:#F9F9F9; font-size:18px; padding-left:10px; padding-top:8px; display:flex; width:100%; position:relative;   box-shadow: 0 0 5px rgba(57,70,78,.3); z-index:100;">
			<div style=" margin-right:5px;">
				<img src="../../17602239_s.jpg" style="height:40px;">
			</div>

				<div class="logo-font">
					Elo Parametric Design <b>Preview</b>
				</div>

				<div style="margin-right:10px; margin-top:2px;  flex: 3 0 0; text-align:right">
				</div>

				<div style="margin-right:20px;  text-align:right">
					<button class="btn btn-default" data-toggle="modal" id="DownloadPreviewButton"><i class="fa fa-download"></i> Download</button>
					<button class="btn btn-default" id="ClosePreview"><i class="fa fa-times"></i> Close</button>
				</div>
		</div>

		<div style='overflow: hidden;'>

			<div id="sidebar_preview">

				<div class="element">
			    <div class="elementBody" style="padding-top: 0px; border-top-style: none; padding-bottom: 0px; border-bottom-style: none; overflow: hidden; opacity: 1; height: auto;">
					<div class="ebCont">

						<div class="projectinfo active" style='margin-top:10px; text-align:center ' >
			      		<span class='preview_title'><?php echo $ProjectTitle; ?></span>
						</div>
					</div>

					<div id='ParametersList'></div>

			   </div> <!-- /elementBody -->
			  </div>

			</div>
		<div style='overflow: hidden; background-color: white;'>
			<iframe id="iframesource" src="<?php if (file_exists(dirname(__FILE__).'/pimages/'.$CurrentCode.'/index.html')) {
				echo $GlobalRoot.'pimages/'.$CurrentCode.'/index.html?rnd='.rand();
			} else {
				file_put_contents(dirname(__FILE__).'/pimages/'.$CurrentCode.'/index.html','first commit!');
				echo $GlobalRoot.'pimages/'.$CurrentCode.'/index.html?rnd='.rand();
			} ?>" class="iframebox_preview" style='width:100%; border:0px;'></iframe>
		</div>

	</div>

	</body>

	</html>
