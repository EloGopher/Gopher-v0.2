<?php

$dbconn = new mysqli("localhost","root","A123456b","selenium");
if ($dbconn->connect_errno) {
  die('Connect Error: ' . $dbconn->connect_errno);
}

$jobid = $_POST["jobid"];
if ($jobid=="") { $jobid = $_GET["jobid"]; }
//--------------------------------------
$qResults = "SELECT * FROM selenium_jobs WHERE jobid='".mysqli_real_escape_string($dbconn, $jobid)."'";
//echo $qResults;
$returnCampaigns = array();

if ($result = $dbconn->query($qResults)) {
	//print_r( $result );
	while ($row = $result->fetch_assoc()) {
		if ( ($row['isdone']=="1") && ($row['haserror']=="1") )
		{
			$returnCampaigns[] = array('browser' => $row['browser'], 'result' => 'error', 'errorfile' => $row['errortxt'], 'urltoget' => $row['urltoget']);
		} else
		if ( ($row['isdone']=="1") && ($row['haserror']=="0") )
		{
			$returnCampaigns[] = array('browser' => $row['browser'], 'result' => 'good', 'imagefile' => $row['imagefile'], 'urltoget' => $row['urltoget']);
		} else
		if ( ($row['inprogress']=="1")  )
		{
			$returnCampaigns[] = array('browser' => $row['browser'], 'result' => 'working', 'urltoget' => $row['urltoget']);
		} else
		{
			$returnCampaigns[] = array('browser' => $row['browser'], 'result' => 'queue', 'urltoget' => $row['urltoget']);
		}
	}
}

$dbconn->close();

header('Content-Type: application/json');
echo json_encode($returnCampaigns);

?>
