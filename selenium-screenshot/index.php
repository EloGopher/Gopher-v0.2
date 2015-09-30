<!DOCTYPE html>
<html>
<head lang="en">
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

	<title>Gopher B - Project Setup - File Browser</title>

	<!-- Include our stylesheet -->
	<link href='http://fonts.googleapis.com/css?family=Droid+Sans:400,700|Droid+Serif' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" href="css/font-awesome.min.css">

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="css/bootstrap-dark.css">

	<!-- Include our script files -->
	<script src="js/jquery-1.11.2.min.js"></script>
	<script src="js/bootstrap.min.js"></script>

	<link rel="stylesheet" href="css/blueimp-gallery.min.css">
	<link rel="stylesheet" href="css/bootstrap-image-gallery.min.css">

	<script src="js/jquery.blueimp-gallery.min.js"></script>
	<script src="js/bootstrap-image-gallery.min.js"></script>

	<script src="js/custom.js"></script>
	<link href="css/custom.css" rel="stylesheet"/>


</head>
<body>
	<div style="position: fixed; top:10px; left:0px; width:200px; text-align: center">
	<img src="gopherhole.gif" style="width:100px; margin-bottom: 5px;">
	</div>

	<div class="filemanager">

		<div class="well bs-component form-horizontal">
			    <div class="form-group" style="margin-bottom:0px;">
			      <div class="col-lg-9">
			        <input type="text" class="form-control" id="inputUrl" placeholder="http://...">
					</div>
				  <div class="col-lg-2">
					  <!--option value="8">800x600</option -->
					  <select class="form-control" id="screensizebox">
			          <option value="7">1024x768</option>
			          <option value="6" selected>1280x800</option>
			          <option value="5">1280x1024</option>
			          <option value="4">1366x768</option>
						 <option value="3">1440x900</option>
						 <option value="2">1600x900</option>
						 <option value="1">1680x1050</option>
						 <option value="0">1920x1080</option>
			        </select>
					</div>
					<div class="col-lg-1">
						<button class="btn btn-primary" id="CaptureURL">Capture</button>
					</div>
			   </div>

				<div class="form-group" style="margin-bottom:0px;">
					<div class="checkbox" style="display:inline-block"><label><input type="checkbox" id="job_msie8" checked><span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span> Internet Explorer 8</label></div>

					<div class="checkbox" style="display:inline-block"><label><input type="checkbox" id="job_msie9" checked><span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span> Internet Explorer 9</label></div>

					<div class="checkbox" style="display:inline-block"><label><input type="checkbox" id="job_msie10" checked><span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span> Internet Explorer 10</label></div>

					<div class="checkbox" style="display:inline-block"><label><input type="checkbox" id="job_msie11" checked><span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span> Internet Explorer 11</label></div>

					<div class="checkbox" style="display:inline-block"><label><input type="checkbox" id="job_chrome" checked><span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span> Google Chrome</label></div>

					<div class="checkbox" style="display:inline-block"><label><input type="checkbox" id="job_firefox" checked><span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span> Mozilla Firefox</label></div>


				</div>

			 <!-- span class="help-block">A longer block of help text that breaks onto a new line and may extend beyond one line.</span -->

		</div>

		<div class="well" style="background-color:#5e6d7c;" id="statusbar">
			<div class="progress progress-striped" style="margin-bottom:8px; " id="download-progress-box">
			  <div class="progress-bar" style="width: 45%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="download-progress"></div>
			</div>

			<div style="">
			  <div class="input-group">
				 <span class="input-group-addon">permanent link</span>
				 <input type="text" class="form-control" id="permalinktxt">
				 <span class="input-group-btn">
					<button class="btn btn-default" type="button">copy</button>
				 </span>
			  </div>
			</div>

		</div>


		<div class="alert alert-dismissible alert-danger" id="errormsg">

		  <strong>Warning!</strong> Best check the url, it's not looking too good.
		</div>


		<div style="margin-top:20px;" class="containerX" id="preview-area">

			<div class="thumbnail with-caption">
				<div class="image-scroller"><a href="loader1.gif" id="ie8_link" title="Internet Explorer 8" data-gallery><img src="loader1.gif" class="thumbimage" id="ie8_thumb"></a></div>
			  <p>Internet Explorer 8<small>Windows 7</small></p>
			</div>

			<div class="thumbnail with-caption">
			  <div class="image-scroller"><a href="loader1.gif" id="ie9_link" title="Internet Explorer 9" data-gallery><img src="loader1.gif" class="thumbimage"  id="ie9_thumb"></a></div>
			  <p>Internet Explorer 9<small>Windows 7</small></p>
			</div>

			<div class="thumbnail with-caption">
			  <div class="image-scroller"><a href="loader1.gif" id="ie10_link" title="Internet Explorer 10" data-gallery><img src="loader1.gif" class="thumbimage"  id="ie10_thumb"></a></div>
			  <p>Internet Explorer 10<small>Windows 7</small></p>
			</div>

			<div class="thumbnail with-caption">
			  <div class="image-scroller"><a href="loader1.gif" id="ie11_link" title="Internet Explorer 11" data-gallery><img src="loader1.gif" class="thumbimage"  id="ie11_thumb"></a></div>
			  <p>Internet Explorer 11<small>Windows 7</small></p>
			</div>

			<div class="thumbnail with-caption">
			  <div class="image-scroller"><a href="loader1.gif" id="chrome_link" title="Chrome 44" data-gallery><img src="loader1.gif" class="thumbimage"  id="chrome_thumb"></a></div>
			  <p>Chrome 45<small>Windows 7</small></p>
			</div>

			<div class="thumbnail with-caption">
			  <div class="image-scroller"><a href="loader1.gif" id="firefox_link" title="Firefox 34" data-gallery><img src="loader1.gif" class="thumbimage"  id="firefox_thumb"></a></div>
			  <p>Firefox 34<small>Windows 7</small></p>
			</div>

		</div>

	</div>

	<!-- The Bootstrap Image Gallery lightbox, should be a child element of the document body -->
	<div id="blueimp-gallery" class="blueimp-gallery" data-use-bootstrap-modal="false"> <!-- data-use-bootstrap-modal="false" -->
	    <!-- The container for the modal slides -->
	    <div class="slides"></div>
	    <!-- Controls for the borderless lightbox -->
	    <h3 class="title"></h3>
	    <a class="prev">‹</a>
	    <a class="next">›</a>
	    <a class="close">×</a>
	    <a class="play-pause"></a>
	    <ol class="indicator"></ol>
	    <!-- The modal dialog, which will be used to wrap the lightbox content -->
	    <div class="modal fade">
	        <div class="modal-dialog" style="width:1280px">
	            <div class="modal-content">
	                <div class="modal-header">
	                    <button type="button" class="close" aria-hidden="true">&times;</button>
	                    <h4 class="modal-title"></h4>
	                </div>
	                <div class="modal-body next"></div>
	                <div class="modal-footer">
	                    <button type="button" class="btn btn-default pull-left prev">
	                        <i class="glyphicon glyphicon-chevron-left"></i>
	                        Previous
	                    </button>
	                    <button type="button" class="btn btn-primary next">
	                        Next
	                        <i class="glyphicon glyphicon-chevron-right"></i>
	                    </button>
	                </div>
	            </div>
	        </div>
	    </div>
	</div>
</body>
</html>
