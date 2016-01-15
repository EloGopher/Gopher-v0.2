<?php
if(!file_exists('gophersettings.php')) {
	header("Location: database-setup.php");
	die();
}
?><!DOCTYPE html>
<html>
<head lang="en">
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

	<title>Gopher B - Project Setup</title>

	<!-- Include our stylesheet -->
	<link rel='stylesheet' type='text/css' href='http://fonts.googleapis.com/css?family=Droid+Sans:400,700|Droid+Serif' />
   <link rel='stylesheet' type='text/css' href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />
	<link rel='stylesheet' type='text/css' href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" />
	<link rel='stylesheet' type='text/css' href="filemanager-styles.css" />

	<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="filemanager-script.js"></script>
</head>
<body>
	<div style="position: fixed; top:10px; right:0px; width:200px; text-align: center">
	<img src="gopherhole.gif" style="width:100px; margin-bottom: 5px;">
	<br>
	<a href="database-setup.php"><button type="button" id="db-setup" class="btn btn-success">Database Setup</button></a>
	</div>

	<div class="filemanager">
		<div class="breadcrumbs" style="border-radius: 3px; padding:10px; width:96%;  background-color: #373743;"></div>

		<ul class="data"></ul>

		<div class="nothingfound">
			<div class="nofiles"></div>
			<span>No files here.</span>
		</div>
	</div>
</body>
</html>
