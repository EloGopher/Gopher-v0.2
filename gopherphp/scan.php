<?php

$dir = __DIR__."/../GopherMiniTest";
$ProjectName = "iEngine 4.8.16";
$ProjectID = "105";
$debugstr = "";
if(file_exists('gophersettings.php')) {
	include 'gophersettings.php';
}

$ignoredFileStr = "";
$ignoredList = array();
if(file_exists($dir.'/ignored.txt')){
	$ignoredFileStr = file_get_contents($dir.'/ignored.txt');
	if($ignoredFileStr !== ''){
		$ignoredList = explode("\n",$ignoredFileStr);
	}
}else{
	file_put_contents($dir.'/ignored.txt',$ignoredFileStr);
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
	global $ignoredFileStr;

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
				$pathPos = strpos($ignoredFileStr, $scandir.'/'.$f);
				if($pathPos >= 0 && $pathPos!== false){
					$IsChecked = 1;
				}else{
					$IsChecked = 0;
				}
				
				$files[] = array(
					"name" => $f,
					"type" => "folder",
					"path" => str_replace($dir, '', $scandir . '/' . $f),
					"items" => scan($scandir . '/' . $f), // Recursively get the contents of the folder
					"ischecked" => $IsChecked
        );


			} else
			{
				// It is a file
				$IsChecked = 0;
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
/*
function checkParentsForIgnored($list,$path,$IsChecked){
	global $dir;
	$checkListStr = implode("\n",$list);

	
	$checkFolders = array();
	$simplifiedPath = str_replace($dir,'',$path);
	$simplifiedPath = substr($simplifiedPath,1);
	if(strpos($simplifiedPath,'/') === false){
		return $list;
	}else{
		$checkFolders = explode('/',$simplifiedPath);
		$scandir = '';
		$countDir = 0;
		$countDirAdded = 0;
		for($i=0; $i<count($checkFolders); $++){
			$scandir .= $dir.'/'.$checkFolders[$i];
			if(file_exist($scandir)){
				foreach(scandir($scandir) as $f){
					if(is_dir($scandir)){
						$countDir++;
						for($j=0; $j<count($list); $j++){
							if($list[$j] == $scandir.'/'.$f){
								$countDirAdded++;
							}
						}
					}
				}
			}
			
			if($countDirAdded == $countDir){
				//check if path exist in $list str, if not, added to $list, breaks loop
				$listClean = array();
				for($k=0; $k<count($list); $k++){
					if(strpos($list[$k],$scandir)===false){
						array_push($listClean,$list[$k]);
					}
				}
				
				array_push($listClean,$scandir);
				$list = $listClean;
				break;
			}else{
				//do array_diff
			}
		}
	}

}
*/
function addOrRemoveFromIgnoredList($filePath,$isAdding){
	global $dir;
	global $ignoredList;
	global $ignoredFileStr;
	//$projectFolderName = basename($dir).'Clone';
	//$projectFolderPath = str_replace(basename($dir),$projectFolderName,$dir);

	$filePut = false;
	$filePath = $dir.$filePath;
	
	try{
		if($isAdding){
			array_push($ignoredList, $filePath);
		}else{
			$comparedArr = array($filePath);
			$ignoredList = array_diff($ignoredList,$comparedArr);
		}
		//$ignoredList = checkParentsForIgnored($ignoredList,$filePath,$isAdding);
	
		$ignoredFileStr = implode("\n",$ignoredList);
		$filePut = file_put_contents($dir.'/ignored.txt',$ignoredFileStr);
	
		$rst = array();
		$rst[] = array("success"=>true,"list"=>$ignoredList,"debug"=>$filePut);
	}catch(Exception $e){
		$rst = array();
		$rst[] = array("success"=>false,"list"=>$ignoredList,"error"=>$e->getMessage());
	}
	
	
	return json_encode($rst);
	
	/*
	global $dir;
	global $ignoredList;
	
	try{
		scanSetIgnored($dir.$filePath, $isAdding);
		$rst = array();
		$rst[] = array("success"=>true,"list"=>$ignoredList,"error"=>null);
	}catch(Exception $e){
		$rst = array();
		$rst[] = array("success"=>false,"list"=>$ignoredList,"error"=>$e->getMessage());
	}
	return json_encode($rst);
	*/
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

if($_POST["op"]=="ignorethis"){
	echo addOrRemoveFromIgnoredList($_POST["filePath"],true);
}
if($_POST["op"] == "trackthis"){
	echo addOrRemoveFromIgnoredList($_POST["filePath"],false);
}
