<?php
$dbconn = new mysqli("localhost","root","A123456b","selenium");
if ($dbconn->connect_errno) {
  die('Connect Error: ' . $dbconn->connect_errno);
}

$urltoget    = $_POST["urltoget"];
$resolution  = $_POST["resolution"];
$jobid       = $_POST["jobid"];
$timeoutmsec = $_POST["timeoutmsec"];

//--------------------------------------
$qInsertNewCampaign = "INSERT INTO selenium_jobs (OpDate,urltoget,resolution,timeoutmsec,browser,os,jobid) VALUES (now(),'" .mysqli_real_escape_string($dbconn, $urltoget)."','".mysqli_real_escape_string($dbconn, $resolution)."','".mysqli_real_escape_string($dbconn, $timeoutmsec)."','ie8','windows7','".mysqli_real_escape_string($dbconn, $jobid)."')";

//echo $qInsertNewCampaign;

$dbconn->query($qInsertNewCampaign);

$newCampaignID = $dbconn->insert_id;

//--------------------------------------
$qInsertNewCampaign = "INSERT INTO selenium_jobs (OpDate,urltoget,resolution,timeoutmsec,browser,os,jobid) VALUES (now(),'" .mysqli_real_escape_string($dbconn, $urltoget)."','".mysqli_real_escape_string($dbconn, $resolution)."','".mysqli_real_escape_string($dbconn, $timeoutmsec)."','ie9','windows7','".mysqli_real_escape_string($dbconn, $jobid)."')";
$dbconn->query($qInsertNewCampaign);

$newCampaignID = $dbconn->insert_id;

//--------------------------------------
$qInsertNewCampaign = "INSERT INTO selenium_jobs (OpDate,urltoget,resolution,timeoutmsec,browser,os,jobid) VALUES (now(),'" .mysqli_real_escape_string($dbconn, $urltoget)."','".mysqli_real_escape_string($dbconn, $resolution)."','".mysqli_real_escape_string($dbconn, $timeoutmsec)."','ie10','windows7','".mysqli_real_escape_string($dbconn, $jobid)."')";
$dbconn->query($qInsertNewCampaign);

$newCampaignID = $dbconn->insert_id;

//--------------------------------------
$qInsertNewCampaign = "INSERT INTO selenium_jobs (OpDate,urltoget,resolution,timeoutmsec,browser,os,jobid) VALUES (now(),'" .mysqli_real_escape_string($dbconn, $urltoget)."','".mysqli_real_escape_string($dbconn, $resolution)."','".mysqli_real_escape_string($dbconn, $timeoutmsec)."','ie11','windows7','".mysqli_real_escape_string($dbconn, $jobid)."')";
$dbconn->query($qInsertNewCampaign);

$newCampaignID = $dbconn->insert_id;

//--------------------------------------
$qInsertNewCampaign = "INSERT INTO selenium_jobs (OpDate,urltoget,resolution,timeoutmsec,browser,os,jobid) VALUES (now(),'" .mysqli_real_escape_string($dbconn, $urltoget)."','".mysqli_real_escape_string($dbconn, $resolution)."','".mysqli_real_escape_string($dbconn, $timeoutmsec)."','firefox','windows7','".mysqli_real_escape_string($dbconn, $jobid)."')";
$dbconn->query($qInsertNewCampaign);

$newCampaignID = $dbconn->insert_id;

//--------------------------------------
$qInsertNewCampaign = "INSERT INTO selenium_jobs (OpDate,urltoget,resolution,timeoutmsec,browser,os,jobid) VALUES (now(),'" .mysqli_real_escape_string($dbconn, $urltoget)."','".mysqli_real_escape_string($dbconn, $resolution)."','".mysqli_real_escape_string($dbconn, $timeoutmsec)."','chrome','windows7','".mysqli_real_escape_string($dbconn, $jobid)."')";
$dbconn->query($qInsertNewCampaign);

$newCampaignID = $dbconn->insert_id;

$dbconn->close();
?>
