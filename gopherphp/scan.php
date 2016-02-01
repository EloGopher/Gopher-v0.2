<?php

$dir = __DIR__."/../GopherMiniTest";

$ProjectName = "iEngine 4.8.16";
$ProjectID = "105";

if(file_exists('gophersettings.php')) {
	include 'gophersettings.php';
}

function preparePostFields($array) {
  $params = array();

  foreach ($array as $key => $value) {
    $params[] = $key . '=' . urlencode($value);
  }

  return implode('&', $params);
}


// This function scans the files folder recursively, and builds a large array

function scan($scandir){
	global $dir;
	global $ProjectID;

	$allowed=Array ( 'php','js','html','htm' );
	$notallowed=Array ( 'jquery','min','bootstrap', 'gopher' );
	$notallowedlength = count($notallowed);


	$files = array();

	// Is there actually such a folder/file?

	if(file_exists($scandir)){

		foreach(scandir($scandir) as $f) {

			if(!$f || $f[0] == '.') {
				continue; // Ignore hidden files
			}

			if ( (is_dir($scandir . '/' . $f)) && (stripos($scandir.'/'.$f,"/gopher/") === false) ) {

				// The path is a folder

				$files[] = array(
					"name" => $f,
					"type" => "folder",
					"path" => str_replace($dir, '', $scandir . '/' . $f),
					"items" => scan($scandir . '/' . $f) // Recursively get the contents of the folder
				);


			} else
			{
				// It is a file

				$retx = false;
				$fileinfo = pathinfo($scandir . '/' . $f);
				$shortfilename = $fileinfo['basename'];


				for($x = 0; $x < $notallowedlength; $x++) {
					if (stripos($shortfilename,$notallowed[$x]) !== false) { $retx = true; }
				}

				if ( ( (in_array(substr($f, strrpos($f, '.') + 1),$allowed)) && (!$retx))  )  {

					if ( substr($f, strrpos($f, '.') + 1) !="js")
					{
						$files[] = array(
							"name" => $f,
							"type" => "file",
							"path" => str_replace($dir, '', $scandir . '/' . $f),
							"size" => filesize($scandir . '/' . $f),
							"ischecked"  => $IsChecked
						);
					}
				}
			}
		}
	}
	return $files;
}



	// Output the directory listing as JSON
if ($_GET["op"]=="files")
{
	// Run the recursive function
	$response = scan($dir);

	header('Content-type: application/json');

	echo json_encode(array(
		"name" =>  "", /*"files",*/
		"type" => "folder",
		"path" => "",
		"items" => $response
	));
}

if ($_GET["op"]=="mark")
{
	//echo $_POST["filename"];
}

if ($_GET["op"]=="unmark")
{
//	echo $_POST["filename"];
}
