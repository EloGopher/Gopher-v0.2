<?php require_once 'member/app/init.php';
include_once 'op.php';

?><!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>pDesign</title>

		<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,300,300italic,400italic,600italic,700,700italic' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

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

	<link href="<?php echo asset_url('css/main.css') ?>" rel="stylesheet">

	<?php $color = Config::get('app.color_scheme'); ?>

	<script src="<?php echo asset_url('js/easylogin.js') ?>"></script>
	<script src="<?php echo asset_url('js/main.js') ?>"></script>
	<script>
		EasyLogin.options = {
			ajaxUrl: '<?php echo App::url("ajax.php") ?>',
			lang: <?php echo json_encode(trans('main.js')) ?>,
			debug: <?php echo Config::get('app.debug')?1:0 ?>,
		};
	</script>


	<script>
		var ThisPageCode = '<?php echo $CurrentCode; ?>';
		var ThisPageVersion = '<?php echo $CurrentVersion; ?>';
	</script>

	<script>
	  var HW_config = {
	    selector: "#applogo", // CSS selector where to inject the badge
	    account: "n7Q8gx" // your account ID
	  };
	</script>
	<script async src="//cdn.headwayapp.co/widget.js"></script>

	<body>

		<div style="height:50px;  background-color:#F9F9F9; font-size:18px; padding-left:10px; padding-top:8px; display:flex; width:100%; position:relative;   box-shadow: 0 0 5px rgba(57,70,78,.3); z-index:100;">
			<div style=" margin-right:5px; height:40px; width:40px;" id="applogo">
				<img src="../17602239_s.jpg" style="height:40px; float:left;">
			</div>

				<div class="logo-font">
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
					<button class="btn btn-default btn-pdesign" data-toggle="modal" id="RunButton"><i class="fa fa-play"></i> Run</button>
					<button class="btn btn-default" data-toggle="modal" id="UpdateButton"><i class="fa fa-pencil-square-o"></i> Update</button>
					<button class="btn btn-default" data-toggle="modal" id="PreviewButton"><i class="fa fa-eye"></i> Preview</button>

					<button class="btn btn-default" data-toggle="modal" id="TidyButton"><i class="fa fa-align-left"></i> Tidy</button>
					<button class="btn btn-default" data-toggle="modal" id="ParametersButton"><i class="fa fa-cogs"></i> Parameters</button>
					<button class="btn btn-default file-manager-linked" data-input-id=""><i class="fa fa-picture-o"></i> Images</button>
					<button class="btn btn-default" id="NewProject"><i class="fa fa-file-o"></i> New</button>
					<button class="btn btn-default" data-toggle="modal" id="ForkButton"><i class="fa fa-code-fork"></i> Fork</button>

					<?php if (Auth::check()): ?>
							<?php if (Auth::userCan('dashboard')): ?>

									<a href="admin.php" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="<?php _e('main.admin_dashboard'); ?>">
										<span class="glyphicon glyphicon-cog"></span>
									</a>
							<?php endif ?>
							<div class="btn-group dropdown">
								<button class="btn btn-default" id="UserDetails" data-toggle="dropdown" data-hover="dropdown"><img src="<?php echo Auth::user()->avatar ?>" class="avatar"> </a> <?php echo Auth::user()->display_name ?> <b class="caret"></b></button>
								<ul class="dropdown-menu dropdown-menu-right">
									<li><a href="<?php echo $GlobalRoot; ?>member/profile.php?u=<?php echo Auth::user()->id ?>"><?php _e('main.my_profile'); ?></a></li>
									<li><a href="<?php echo $GlobalRoot; ?>member/settings.php"><?php _e('main.settings'); ?></a></li>
									<li><a href="<?php echo $GlobalRoot; ?>member/logout.php"><?php _e('main.logout'); ?></a></li>
								</ul>
							</div>
					<?php else: ?>
						<a href='../member/login.php' class="btn btn-default" data-toggle="modal" id="ForkButton"><i class="fa fa-sign-in"></i> Sign in</a>
					<?php endif; ?>

				</div>
		</div>

		<div id="sidebar" >
			<div id="author_toggler" class="toggler active">Design Author</div>

			<div class="element">
		    <div class="elementBody" style="padding-top: 0px; border-top-style: none; padding-bottom: 0px; border-bottom-style: none; overflow: hidden; opacity: 1; height: auto;">
		      <div class="ebCont">
		        <div class="avatar2">
		          <img src="//www.gravatar.com/avatar/f16362708c253b0b17199935ff7c2cb6/?default=&amp;s=80" height="40" width="40">
		          <a title="See public fiddles" href="/user/lovlka/fiddles/">Lerumus Ipsumus</a>

		        </div> <!-- /avatar -->

		        <ul class="userDetails">
		            <li><i class="fa fa-map-marker"></i>Wolderlund</li>
		        </ul> <!-- /userDetails -->
		      </div> <!-- /ebCont -->

				<div class="ebCont">

					<div class="projectinfo active" style='margin-top:10px; ' >
		      		<a href="#" id="projecttitle" data-type="text" data-placement="right" data-title="Enter title"><?php echo $ProjectTitle; ?></a>
					</div>

					<div class="projectinfo" style='margin-top:5px;' >
						<a href="#" id="projectdescription" data-type="textarea" data-placement="right" data-title="Enter description"><?php echo $ProjectDescription; ?></a>
					</div>

					<div class="projectinfo " style='margin-top:5px;'>
					  <span>Status:</span>
					  <a href="#" id="projectstatus"><?php echo $ProjectStatus; ?></a>
					</div>

					<div class="projectinfo " style='margin-top:5px;'>
					  <span>Browser Support:</span>
					  <a href="#" id="projectbrowsers" data-title="Select Browsers" data-value='<?php echo $ProjectBrowsers; ?>'></a>
					</div>

					<input id="ProjectImageUpload" type="file" name="files[]" style="display: none;">
					<div id="projectpicturediv" style='margin-top:10px; width:160px; margin-left:10px; cursor:pointer'>
						<div id="fadeContainer">
							<img src='<?php echo $ProjectImage; ?>' id='fade1' style='max-width:160px; left:<?php echo 80-($imagewidth/2); ?>px; top:<?php echo 80-($imageheight/2); ?>px'>
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
				<div class="xPanel split content" id="PreviewPanel" style="overflow:hidden;">
					<iframe id="iframesource" src="<?php if (file_exists(dirname(__FILE__).'/pimages/'.$CurrentCode.'/index.html')) {
						echo $GlobalRoot.'pimages/'.$CurrentCode.'/index.html?rnd='.rand();
					} else {
						file_put_contents(dirname(__FILE__).'/pimages/'.$CurrentCode.'/index.html','first commit!');
						echo $GlobalRoot.'pimages/'.$CurrentCode.'/index.html?rnd='.rand();
					} ?>" class="iframebox"></iframe>
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

<!--

** TODO

** make preview in editor use real files loaded from server (separate file for html, css and js, files should be saved to the code folder)  ...OK
** optional min-max for integers  ...OK
** Preview code ...OK
** stop using session so can have multiple tabs open ...OK
** Preview unsaved changes ...OK (save to temp_ fields in mongo )

** sign up (use mysql/php component) ...OK
** login (use mysql/php component) ...OK
** membership panel (use mysql/php component) ...OK
** own code with cookie (only owner can update)
** own code (only member can update, if it is not private others can see and fork it)
** check user session when uploading/viewing images and project image upload dont only use url parameters for security

** make history slider work

** membership page with list of own projects
** index page with online public codes
** download customized version

** go live for QA

-->
