<?php
error_reporting(E_ERROR);

$ProjectID = "106";
?>
<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
<head>
<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">
<meta http-equiv=\"Content-Language\" content=\"en-us\">
	<title>Gopher B - Download setup</title>

<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js\"></script>

<!-- Include our stylesheet -->
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">

<!-- Include our script files -->
<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>

<style>

body {
	background-color: #23232e;
	font: 14px normal Arial, Helvetica, sans-serif;
	z-index: -4;

   -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

</style>

</head>

<body>
	<div style="position: fixed; top:10px; right:0px; width:200px; text-align: center">
	<img src="http://localhost/gophera/GopherB-filemanager/gopherhole.gif" style="width:100px; margin-bottom: 5px;">
	</div>


    <div id="login-overlay" class="modal-dialog" style="margin-top:100px; width:800px;">
      <div class="modal-content">
          <div class="modal-header">
              <!-- button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button -->
              <h4 class="modal-title" id="myModalLabel">Gopher setup downloader</h4>


          </div>
          <div class="modal-body">
              <div class="row">
                  <div class="col-xs-6">
                      <div class="well">

						<p><b>Welcome to gopher local setup downloader.</b></p>

						<p>This script will download the required php files for gopher to work in this project.</p>

						<p>After the download is complete you will need to setup the your mysql database to work with gopher and select the project files where you'll be using gopher for tracking.</p>

						<p style="margin-bottom:60px;">Please click the download now button to continue with the setup.</p>

						<a href="?download=yes"><button class="btn btn-success btn-block">Download Now</button></a>

                      </div>
                  </div>
                  <div class="col-xs-6">
					<p class="lead">Download <span class="text-success">Progress</span></p>
					<?php
					if ($_GET["download"]=="yes")
					{
						echo "<ul class=\"list-unstyled\" style=\"line-height: 2; margin-bottom:40px;\">";
						$filelist = array();

						$filedomain = "http://localhost/gophera/GopherB-filemanager/setup-get-file.php?f=";

						$filelist[] = "database-setup_php";
						$filelist[] = "filemanager-script_js";
						$filelist[] = "filemanager-styles_css";
						$filelist[] = "gopherPHPinclude_php";
						$filelist[] = "gopherhole_gif";
						$filelist[] = "index_php";
						$filelist[] = "new-gopher-insert.js";
						$filelist[] = "new-gopher-insert.min.js";
						$filelist[] = "scan_php";

						$haserror = false;

						foreach ($filelist as $filetoget) {
							$ch = curl_init();
							curl_setopt($ch, CURLOPT_URL, $filedomain.$filetoget);
							curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
							curl_setopt($ch, CURLOPT_FAILONERROR, true);

							$data = curl_exec ($ch);
							curl_close ($ch);

							if ($data === FALSE)
							{
								$haserror = true;
							} else
							{
								$destination = str_replace("_", ".", $filetoget);

								if (file_exists($destination)) {
									if ($_GET["force"]=="yes")
									{
										$file = fopen($destination, "w+");

										if (fwrite($file, $data) === FALSE) {

											echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Cannot write to file  \"".$destination ."\".</li>";
											$haserror = true;
											exit();
										} else {
											fclose($file);
											echo "<li><span class=\"fa fa-check text-success\"></span> \"".$destination ."\" downloaded and saved.</li>";
										}
									} else {
										echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> File \"".$destination ."\" exists, so skipping it.</li>";										}
								} else {
									$file = fopen($destination, "w+");
									if (fwrite($file, $data) === FALSE) {

										echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Cannot write to file  \"".$destination ."\".</li>";
										$haserror = true;
										exit();
									} else {
										fclose($file);
										echo "<li><span class=\"fa fa-check text-success\"></span> \"".$destination ."\" downloaded and saved.</li>";
									}
								}
							}
						}
						echo "</ul>";
						if (!$haserror)
						{
							?>
							<a href="index.php"><button class="btn btn-primary btn-block">Continue setup</button>
							<?php
						}
					} else {
						?>
						Progress will show when download is started.
						<?php
					}
				?>
			   </div>
            </div>
          </div>
      </div>
  </div>




</div>
</body>
