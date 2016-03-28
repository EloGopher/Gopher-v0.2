<?php
ini_set('error_reporting', E_ALL & ~E_DEPRECATED & ~E_NOTICE);

// Configuration
$dbhost = 'localhost';
$dbname = 'gopher';

// Connect to test database
$mongo = new MongoClient("mongodb://".$dbhost);
$mongodb = $mongo->$dbname;

$data = json_decode(file_get_contents('php://input'), true);

$headers = apache_request_headers();

$c_projects = $mongodb->logs;
$c_projects->save( array('type' => 'logblock', 'APILoginID' => $headers['APILoginID'], 'TransactionKey' => $headers['TransactionKey'], 'logtype' => $headers['LogData'], 'logdata' => $data, 'updated_at' => new MongoDate() ) );



echo json_encode( array('error' => '','result' => 'good') ); //, 'data' => $data
?>
