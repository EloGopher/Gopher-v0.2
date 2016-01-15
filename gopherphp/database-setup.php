<?php
error_reporting(E_ERROR);

$ProjectID = "106";
?>
<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
<head>
<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">
<meta http-equiv=\"Content-Language\" content=\"en-us\">
	<title>Gopher B - Project Setup - Database</title>

<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js\"></script>

<!-- Include our stylesheet -->
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">

<!-- Include our script files -->
<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>

<link href="filemanager-styles.css" rel="stylesheet"/>

</head>



<body>
	<div style="position: fixed; top:10px; right:0px; width:200px; text-align: center">
	<img src="gopherhole.gif" style="width:100px; margin-bottom: 5px;">
	<br>
	<?php
	if(file_exists('gophersettings.php')) {
	?>
		<a href="index.php"><button type="button" id="db-setup" class="btn btn-success">Select Files</button></a -->
	<?php
	}
	?>
	</div>
	
	
<?php
if ( ($_GET["action"]=="") && ($_POST["action"]=="") )
{
	
	$MySQLServer = '';
	$MySQLUser = '';
	$MySQLPassword = '';
	$MySQLdB = '';
	$MySQLprefix = '';
	
	if(file_exists('gophersettings.php')) {
		include 'gophersettings.php';	
	}
} else
if ($_POST["action"]=="save")
{
	$MySQLServer = $_POST["server"];
	$MySQLUser = $_POST["user"];
	$MySQLPassword = $_POST["pass"];
	$MySQLdB = $_POST["db"];
	$MySQLprefix = $_POST["table_prefix"];
}
?>
	
	
    <div id="login-overlay" class="modal-dialog" style="margin-top:100px;">
      <div class="modal-content">
          <div class="modal-header">
              <!-- button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button -->
              <h4 class="modal-title" id="myModalLabel">Gopher database setup</h4>
          </div>
          <div class="modal-body">
              <div class="row">
                  <div class="col-xs-6">
                      <div class="well">
						<form id="form" method="post" action="database-setup.php" novalidate="novalidate">
							<input type="hidden" name="action" value="save">
                              <div class="form-group">
                                  <label for="server" class="control-label">Mysql Server</label>
                                  <input type="text" class="form-control" id="server" name="server" value="<?php echo $MySQLServer; ?>" placeholder="localhost">
                                  <span class="help-block"></span>
                              </div>
							  
                              <div class="form-group">
                                  <label for="user" class="control-label">Username</label>
                                  <input type="text" class="form-control" id="user" name="user" value="<?php echo $MySQLUser; ?>" placeholder="root">
                                  <span class="help-block"></span>
                              </div>
							  
                              <div class="form-group">
                                  <label for="pass" class="control-label">Password</label>
                                  <input type="password" class="form-control" id="pass" name="pass" value="<?php echo $MySQLPassword; ?>">
                                  <span class="help-block"></span>
                              </div>
							  
                              <div class="form-group">
                                  <label for="db" class="control-label">Database Name</label>
                                  <input type="text" class="form-control" id="db" name="db" value="<?php echo $MySQLdB; ?>" placeholder="schema">
                                  <span class="help-block"></span>
                              </div>
							  
                              <div class="form-group">
                                  <label for="table_prefix" class="control-label">Table prefix</label>
                                  <input type="text" class="form-control" id="table_prefix" name="table_prefix" value="<?php echo $MySQLprefix; ?>" placeholder="gopher_">
                                  <span class="help-block"></span>
                              </div>
							  
							  
                              <div id="loginErrorMsg" class="alert alert-error hide">Wrong username og password</div>
                              <button type="submit" class="btn btn-success btn-block">Save Settings</button>
                          </form>
                      </div>
                  </div>
                  <div class="col-xs-6">
                      <p class="lead">Setup <span class="text-success">Progress</span></p>
                      <ul class="list-unstyled" style="line-height: 2">
							<?php
							if ($_POST["action"]=="save")
							{
								$hasError = false;
								$dbconn = new mysqli($MySQLServer,$MySQLUser,$MySQLPassword,$MySQLdB);
								if ($dbconn->connect_errno) {
									echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Testing connection...";
									die('Database connect Error: ' . $dbconn->connect_errno . '</li>');
								} else {
									echo "<li><span class=\"fa fa-check text-success\"></span> Connection successful</li>";
								}

								$TimestampTable = "DROP TABLE IF EXISTS ".$MySQLprefix."gopher_log;";
								if ($dbconn->query ($TimestampTable) === TRUE) {	
									echo "<li><span class=\"fa fa-check text-success\"></span> Dropped log table</li>";
								} else {
									echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Dropping log table... ";
									echo "Error: " . $dbconn->connect_errno." ".$dbconn->error."</li>";
									$hasError = true;
								}

								$LogTable = "CREATE TABLE ".$MySQLprefix."gopher_log (
								ID INT(11) NOT NULL AUTO_INCREMENT,
								ProjectID INT(11) NOT NULL DEFAULT '0',
								FileName VARCHAR(255) NULL DEFAULT NULL,
								CodeLine INT(11) NOT NULL DEFAULT '0',
								DataType VARCHAR(25) NULL DEFAULT NULL,
								LogMessage TEXT NULL,
								Tags VARCHAR(50) NULL DEFAULT NULL,
								VarName VARCHAR(100) NULL DEFAULT NULL,
								VarValue TEXT NULL,
								PRIMARY KEY (ID),
								INDEX Tags (Tags),
								INDEX FileName (FileName),
								INDEX ProjectID (ProjectID) ) COLLATE='utf8_general_ci';"; //ENGINE=MyISAM   ROW_FORMAT=DYNAMIC   AUTO_INCREMENT=2493

								//	echo $LogTable;

								if ($dbconn->query ($LogTable) === TRUE) { 
									echo "<li><span class=\"fa fa-check text-success\"></span> Created log table</li>";
								} else {
									echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Creating log table... ";
									echo "Error: " . $dbconn->connect_errno." ".$dbconn->error."</li>";
									$hasError = true;
								}
								

								$TimestampTable = "DROP TABLE IF EXISTS ".$MySQLprefix."gopher_files;";
								if ($dbconn->query ($TimestampTable) === TRUE) {	
									echo "<li><span class=\"fa fa-check text-success\"></span> Dropping files table</li>";
								} else {
									echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Dropping files table... ";
									echo "Error: " . $dbconn->connect_errno." ".$dbconn->error."</li>";
									$hasError = true;
								}

								$FilesTable = "CREATE TABLE ".$MySQLprefix."gopher_files (
								ID INT(11) NOT NULL AUTO_INCREMENT,
								ProjectID INT(11) NOT NULL DEFAULT '0',
								ChecksumX VARCHAR(255) NULL DEFAULT NULL,
								FileName VARCHAR(255) NULL DEFAULT NULL,
								IsFolder INT(11) NOT NULL DEFAULT '0',
								IsTemp INT(11) NOT NULL DEFAULT '0',
								IsChecked INT(11) NOT NULL DEFAULT '0',
								PRIMARY KEY (ID),
								INDEX ProjectID (ProjectID) ) COLLATE='utf8_general_ci';"; //ENGINE=MyISAM   ROW_FORMAT=DYNAMIC   AUTO_INCREMENT=559

								if ($dbconn->query ($FilesTable) === TRUE) {	
									echo "<li><span class=\"fa fa-check text-success\"></span> Created files table</li>";
								} else {
									echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Creating files table... ";
									echo "Error: " . $dbconn->connect_errno." ".$dbconn->error."</li>";
									$hasError = true;
								}


								$content = '<?php 
								$MySQLServer = \''.$MySQLServer.'\';
								$MySQLUser = \''.$MySQLUser.'\';
								$MySQLPassword = \''.$MySQLPassword.'\';
								$MySQLdB = \''.$MySQLdB.'\';
								$MySQLprefix = \''.$MySQLprefix.'\';
								?>';
								
								if (!$hasError) {
									if (!is_writable("gophersettings.php") && (file_exists("gophersettings.php"))) { //__DIR__ ."gophersettings.php"
										echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Saving settings to file... file isn't writable</li>";
										$hasError = true;
									} else {
										$fp = fopen("gophersettings.php","wb");
										$fwriteres = fwrite($fp,$content);
										fclose($fp);

										if (!$fwriteres) {
											echo "<li><span class=\"fa fa-exclamation-triangle text-danger\"></span> Saving settings to file... Could not save file</li>";
										} else {
											echo "<li><span class=\"fa fa-check text-success\"></span> Saved settings to file</li>";
										}
									}
								}
								
								
								?>
		                    </ul>
							<?php
							if ($hasError) {
							?>
								<p>please check your settings and try again.</p>
							<?php
							} else
							{
							?>
								<p><a href="index.php" class="btn btn-info btn-block">Continue to file setup!</a></p>
							<?php
							}
								
							} else
							{
								?>
								<li><span class="fa fa-check text-success"></span> Please fill in the form</li>
		                    </ul>
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



