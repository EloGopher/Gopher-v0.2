<?php include_once "Gopher.php"; ?><?php
$ProjectID = "105";

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$port      = $_SERVER['SERVER_PORT'];
$disp_port = ($protocol == 'http' && $port == 80 || $protocol == 'https' && $port == 443) ? '' : ":$port";

$ParentFileName = "";
if (isset($_SERVER['HTTP_REFERER'])) { $ParentFileName = htmlentities($_SERVER['HTTP_REFERER']); }


$PhpParentFileName = $_SERVER['PHP_SELF'];
if ($PhpParentFileName=="") { $PhpParentFileName = $ParentFileName;}

$PostType = "";
$GetType = "";

if (isset($_POST["type"])) { $PostType = $_POST["type"]; }
if (isset($_GET["type"])) { $GetType = $_GET["type"]; }





function preparePostFields($array) {
  $params = array();

  foreach ($array as $key => $value) {
    $params[] = $key . '=' . urlencode($value);
  }

  return implode('&', $params);
}







// Moved this line to the bottom of the 'file' for usability - 
// I keep each of the above mentioned 'pieces' in separate files.
//$ErrorHandler = new ErrorHandler();

$ErrorCallback = "HandleRuntimeError";
$ExceptionCallback = "HandleException";
$FatalCallback = "HandleFatalError";

$EnableReporting = true;
$ErrorLevel = E_ALL;

function InitializeErrors()
{
    if($GLOBALS["EnableReporting"])
    {
        error_reporting($GLOBALS["ErrorLevel"]);

        if( isset($GLOBALS["ErrorCallback"]) && strlen($GLOBALS["ErrorCallback"]) > 0 )
        {
            set_error_handler($GLOBALS["ErrorCallback"]);

            // Prevent the PHP engine from displaying runtime errors on its own
            ini_set('display_errors',false);
        }
        else
            ini_set('display_errors',true);

        if( isset($GLOBALS["FatalCallback"]) && strlen($GLOBALS["FatalCallback"]) > 0 )
        {
            register_shutdown_function($GLOBALS["FatalCallback"]);

            // Prevent the PHP engine from displaying fatal errors on its own
            ini_set('display_startup_errors',false);
        }
        else
            ini_set('display_startup_errors',true);

        if( isset($GLOBALS['ExceptionCallback']) && strlen($GLOBALS['ExceptionCallback']) > 0 )
            set_exception_handler($GLOBALS["ExceptionCallback"]);
    }
    else
    {
        ini_set('display_errors',0);
        ini_set('display_startup_errors',0);
        error_reporting(0);
    }
}

function HandleRuntimeError($ErrorLevel,$ErrorMessage,$ErrorFile=null,$ErrorLine=null,$ErrorContext=null)
{
    if( isset($GLOBALS['ErrorHandler']))
    {
        //  Pass errors up to the global ErrorHandler to be later inserted into
        // final output at the appropriate time.
        $GLOBALS['ErrorHandler']->AppendError($ErrorLevel,"Runtime Error: " . $ErrorMessage,$ErrorFile,$ErrorLine,$ErrorContext);

        return true;
    }
    else
    {
        PrintError($ErrorLevel,$ErrorMessage,$ErrorFile,$ErrorLine,$ErrorContext);
        return true;
    }
}

function HandleException($Exception)
{
    if( isset($GLOBALS['ErrorCallback']))
    {
        // Parse and pass exceptions up to the standard error callback.
        $GLOBALS['ErrorCallback']($Exception->getCode(), "Exception: " . $Exception->getMessage(), $Exception->getFile(), $Exception->getLine(), $Exception->getTrace());

        return true;
    }
    else
    {       
        PrintError($Exception->getCode(), "Exception: " . $Exception->getMessage(), $Exception->getFile(), $Exception->getLine(), $Exception->getTrace());
        return true;
    }
}

function HandleFatalError()
{
    $Error = error_get_last();

    // Unset Error Type and Message implies a proper shutdown.
    if( !isset($Error['type']) && !isset($Error['message']))
        exit();
    else if( isset($GLOBALS['ErrorCallback']))
    {
        // Pass fatal errors up to the standard error callback.
        $GLOBALS["ErrorCallback"]($Error['type'], "Fatal Error: " . $Error['message'],$Error['file'],$Error['line']);

        return null;
    }
    else
    {
        PrintError($Error['type'], "Fatal Error: " . $Error['message'],$Error['file'],$Error['line']);
        return null;
    }
}

// In the event that our 'ErrorHandler' class is in fact the generator of the error,
// we need a plain-Jane method that will still deliver the message.
function PrintError($ErrorLevel,$ErrorMessage,$ErrorFile=null,$ErrorLine=null,$ErrorContext=null)
{
	global $PhpParentFileName;
	global $ProjectID;
	
    if( class_exists("ErrorHandler"))
        $ErrorTypeString = ErrorHandler::ErrorTypeString($ErrorLevel);
    else
        $ErrorTypeString = $ErrorLevel;

    $ReturnValue = $ErrorTypeString." - ".$ErrorMessage;
	
	if ($ErrorTypeString!="E_NOTICE") {  }
		echo "<div style='border:1px solid black; padding:5px; margin:5px;'>".$ErrorFile." ".$ErrorLine.": ".$ReturnValue."</div>";
	

	$phpgopherstore = array("Msg"=>$ReturnValue, "Tags"=>"", "FileName"=>$ErrorFile, "CodeLine"=>$ErrorLine,"Type"=>"pe" );
	
	$data = array('posttype' => 'trackphpdata', 'phpdata' => json_encode($phpgopherstore), 'ProjectID' => $ProjectID, 'ParentFileName' => $PhpParentFileName); 
	
	//print_r($phpgopherstore);

	$url = 'http://localhost/gopherA/insertGopherMini2db.php';
	
	$ch = curl_init( $url );
	curl_setopt( $ch, CURLOPT_POST, 1);
	curl_setopt( $ch, CURLOPT_POSTFIELDS, preparePostFields($data));
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt( $ch, CURLOPT_HEADER, 0);
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);

	$response = curl_exec( $ch );
	
}

class ErrorHandler
{   
    public function AppendError($ErrorLevel,$ErrorMessage,$ErrorFile=null,$ErrorLine=null,$ErrorContext=null)
    {
		global $PhpParentFileName;
		global $ProjectID;
		
        // Perhaps evaluate the error level and respond accordingly
        //
        // In the event that this actually gets used, something that might 
        // determine if you're in a production environment or not, or that 
        // determines if you're an admin or not - or something - could belong here.
        // Redirects or response messages accordingly.
        $ErrorTypeString = ErrorHandler::ErrorTypeString($ErrorLevel);

        $ReturnValue = $ErrorTypeString." - ".$ErrorMessage;
		
//		if ($ErrorTypeString!="E_NOTICE") { echo $ReturnValue; }
		echo "<div style='border:1px solid black; padding:5px; margin:5px;'>".$ErrorFile." ".$ErrorLine.": ".$ReturnValue."</div>";

		$phpgopherstore = array("Msg"=>$ReturnValue, "Tags"=>"", "FileName"=>$ErrorFile, "CodeLine"=>$ErrorLine,"Type"=>"pe" );

		$data = array('posttype' => 'trackphpdata', 'phpdata' => json_encode($phpgopherstore), 'ProjectID' => $ProjectID, 'ParentFileName' => $PhpParentFileName); 

		//print_r($phpgopherstore);

		$url = 'http://localhost/gopherA/insertGopherMini2db.php';

		$ch = curl_init( $url );
		curl_setopt( $ch, CURLOPT_POST, 1);
		curl_setopt( $ch, CURLOPT_POSTFIELDS, preparePostFields($data));
		curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt( $ch, CURLOPT_HEADER, 0);
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);

		$response = curl_exec( $ch );
		
    }

    public static function ErrorTypeString($ErrorType)
    {
        $ReturnValue = "";

        switch( $ErrorType )
        {
            default:
                $ReturnValue = "E_UNSPECIFIED_ERROR"; 
                break;
            case E_ERROR: // 1 //
                $ReturnValue = 'E_ERROR'; 
                break;
            case E_WARNING: // 2 //
                $ReturnValue = 'E_WARNING'; 
                break;
            case E_PARSE: // 4 //
                $ReturnValue = 'E_PARSE'; 
                break;
            case E_NOTICE: // 8 //
                $ReturnValue = 'E_NOTICE'; 
                break;
            case E_CORE_ERROR: // 16 //
                $ReturnValue = 'E_CORE_ERROR'; 
                break;
            case E_CORE_WARNING: // 32 //
                $ReturnValue = 'E_CORE_WARNING'; 
                break;
            case E_COMPILE_ERROR: // 64 //
                $ReturnValue = 'E_COMPILE_ERROR'; 
                break;
            case E_CORE_WARNING: // 128 //
                $ReturnValue = 'E_COMPILE_WARNING'; 
                break;
            case E_USER_ERROR: // 256 //
                $ReturnValue = 'E_USER_ERROR'; 
                break;
            case E_USER_WARNING: // 512 //
                $ReturnValue = 'E_USER_WARNING'; 
                break;
            case E_USER_NOTICE: // 1024 //
                $ReturnValue = 'E_USER_NOTICE'; 
                break;
            case E_STRICT: // 2048 //
                $ReturnValue = 'E_STRICT';
                break;
            case E_RECOVERABLE_ERROR: // 4096 //
                $ReturnValue = 'E_RECOVERABLE_ERROR';
                break;
            case E_DEPRECATED: // 8192 //
                $ReturnValue = 'E_DEPRECATED'; 
                break;
            case E_USER_DEPRECATED: // 16384 //
                $ReturnValue = 'E_USER_DEPRECATED'; 
                break;
        }

        return $ReturnValue;
    }
}

$ErrorHandler = new ErrorHandler();
InitializeErrors();

function GopherTell($xMessage,$xTags = "")
{
	global $PhpParentFileName;
	global $ProjectID;
	$backtr = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
//  var_dump($backtr); //DEBUG_BACKTRACE_IGNORE_ARGS
//  echo "Msg:".$xMessage." File:".$backtr[0]['file']." Line:".$backtr[0]['line']."--------------<br>";
  
	$phpgopherstore = array("Msg"=>$xMessage, "Tags"=>$xTags, "FileName"=>$backtr[0]['file'], "CodeLine"=>$backtr[0]['line'],"Type"=>"pgt" );
	
	$data = array('posttype' => 'trackphpdata', 'phpdata' => json_encode($phpgopherstore), 'ProjectID' => $ProjectID, 'ParentFileName' => $PhpParentFileName); 
	
	//print_r($phpgopherstore);

	$url = 'http://localhost/gopherA/insertGopherMini2db.php';
	
	$ch = curl_init( $url );
	curl_setopt( $ch, CURLOPT_POST, 1);
	curl_setopt( $ch, CURLOPT_POSTFIELDS, preparePostFields($data));
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt( $ch, CURLOPT_HEADER, 0);
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);

	$response = curl_exec( $ch );
	
//	echo $response;
}


function GopherTrack($xValue,$xTags = "")
{
	global $PhpParentFileName;
	global $ProjectID;
	
	$backtr = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
//  var_dump($backtr); //DEBUG_BACKTRACE_IGNORE_ARGS
//  echo "Val:".json_encode($xValue)." File:".$backtr[0]['file']." Line:".$backtr[0]['line']."--------------<br>";

	$phpgopherstore = array("VarValue"=>json_encode($xValue), "Tags"=>$xTags,  "FileName"=>$backtr[0]['file'], "CodeLine"=>$backtr[0]['line'],"Type"=>"pvt" );
  
	
	$data = array('posttype' => 'trackphpdata', 'phpdata' => json_encode($phpgopherstore), 'ProjectID' => $ProjectID, 'ParentFileName' => $PhpParentFileName); 
	
	$url = 'http://localhost/gopherA/insertGopherMini2db.php';
	
	$ch = curl_init( $url );
	curl_setopt( $ch, CURLOPT_POST, 1);
	curl_setopt( $ch, CURLOPT_POSTFIELDS, preparePostFields($data));
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt( $ch, CURLOPT_HEADER, 0);
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);

	$response = curl_exec( $ch );
	
//	echo $response;
}


if ( ($PostType=="") && ($GetType=="") && 
	 (realpath(__FILE__) == realpath($_SERVER['DOCUMENT_ROOT'].$_SERVER['SCRIPT_NAME'])) ) { 
	echo "Gopher Mini Project Admin<br>";
	
	$it = new RecursiveDirectoryIterator(dirname(__FILE__));
	foreach(new RecursiveIteratorIterator($it) as $phpfile)
	{
		$extension = pathinfo($phpfile, PATHINFO_EXTENSION);
		if ( (($extension=="php") && (stripos($phpfile,"gophermini.php") === false)) ||
		     ($extension=="js") || ($extension=="htm") || ($extension=="html") )
		{
			echo $phpfile."<br>";
		}
	}
	
	
}


if ($PostType=="jslogpost") { 

	$data = array('posttype' => 'trackdata', 'data' => $_POST['data'], 'ProjectID' => $ProjectID, 'ParentFileName' => $ParentFileName); 

	$url = 'http://localhost/gopherA/insertGopherMini2db.php';

	//echo "XXSDATA:".$_POST['data']."---";
	//print_r($data);
	
	$ch = curl_init( $url );
	curl_setopt( $ch, CURLOPT_POST, 1);
	curl_setopt( $ch, CURLOPT_POSTFIELDS, preparePostFields($data));
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt( $ch, CURLOPT_HEADER, 0);
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);

	$response = curl_exec( $ch );
	
	//echo "R:".$response;
	
	$returnJson[] = array("success" => (bool) true );
	echo json_encode($returnJson);
} else

if ($GetType=="track") {

	//********** make the jsFileURL work better than this in the future
	$jsFileURL = str_replace(basename(__FILE__)."?type=track&path=","",$_SERVER['REQUEST_URI']);
	//echo $protocol.$_SERVER['SERVER_NAME'].$jsFileURL;
	
	//get contents of file
	$jsFile = file_get_contents($protocol.$_SERVER['SERVER_NAME'].$jsFileURL);
	
	//post unmodified source to GopherA
	$data = array('posttype' => 'source', 'source' => $jsFile, 'ProjectID' => $ProjectID, 'FileName' => $jsFileURL); 
	
	$url = 'http://localhost/gopherA/insertGopherMini2db.php';
	
	$ch = curl_init( $url );
	curl_setopt( $ch, CURLOPT_POST, 1);
	curl_setopt( $ch, CURLOPT_POSTFIELDS, preparePostFields($data));
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt( $ch, CURLOPT_HEADER, 0);
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);
	$response = curl_exec( $ch );
//	echo "---".$response."----";
	
	
	//modify javascript file
	$jsFile = preg_replace("/gopher.tell(.*?)\(/s", "$0##gline,'". $jsFileURL ."',", $jsFile);
	$jsFile = preg_replace("/gopher.track(.*?)\(/s", "$0##gline,'". $jsFileURL ."',##varname,", $jsFile);

	$jsFile = preg_replace("/##varname,(.*?)(,|\))/s", "'$1',$1$2", $jsFile);


	$jsFileLines = explode("\n", str_replace(array("\r\n","\n\r","\r"),"\n",$jsFile) );
	
	$length = count($jsFileLines);
	for ($i=0; $i<$length; $i++)
	{
		$jsFileLines[$i] = str_replace('##gline',$i+1,$jsFileLines[$i]);
	}
	
	
	header('Content-Type: application/javascript');
//	echo $GopherHelperInsert;
	echo implode("\n",$jsFileLines);
}

?>