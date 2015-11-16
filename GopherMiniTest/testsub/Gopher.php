<?php
if ($_POST["op"]=="copyself") {

   echo "Starting copy self. \n";

   $directories = glob(__DIR__ . '/*' , GLOB_ONLYDIR);

   foreach ( $directories as $directory )
   {
      $phpfiles = glob($directory.'/*.php');

      if (count($phpfiles) > 0 )
      {
         echo "copying Gopher.php to ... ". $directory . "\n";
         copy(__FILE__,$directory.'/Gopher.php');
      }
   }
   die(1);
}

if (!isset($GopherIsHere)) { //prevent php from trying to icnlude Gopher.php twice or more and fail

   $GopherIsHere = true;

   $PhpInlineShowErrors = true;
   $LastSend = microtime(true);

   $GopherPHPLogs = [];

   $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
   $port = $_SERVER['SERVER_PORT'];
   $disp_port = ($protocol == 'http' && $port == 80 || $protocol == 'https' && $port == 443) ? '' : ":$port";

   $ParentFileName = '';
   if (isset($_SERVER['HTTP_REFERER'])) {
       $ParentFileName = htmlentities($_SERVER['HTTP_REFERER']);
   }

   $PhpParentFileName = $_SERVER['PHP_SELF'];
   if ($PhpParentFileName == '') {
       $PhpParentFileName = $ParentFileName;
   }

   $PhpHelperRoot = realpath($_SERVER['DOCUMENT_ROOT']);

   function GopherPreparePostFields($array)
   {
       $params = array();

       foreach ($array as $key => $value) {
           $params[] = $key.'='.urlencode($value);
       }

       return implode('&', $params);
   }

   function sendBufferDataToNode($data,$ForceSend)
   {
      global $LastSend,$GopherPHPLogs;

      if (!$ForceSend) {
         $GopherPHPLogs[] = $data;
      }
      //print_r($GopherPHPLogs);

      $ThisSend = microtime(true);

      if ( (($ThisSend-$LastSend) > 3) || ($ForceSend) || (count($GopherPHPLogs)>50) )
      {
         $LastSend = $ThisSend;
         $data_string = json_encode($GopherPHPLogs);

         $url = 'http://localhost:1337/gopherPHPsave.js';

         $ch = curl_init( $url );

      //   echo $data_string;

      //   curl_setopt( $ch, CURLOPT_POST, 1);
      //   curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
      //   curl_setopt( $ch, CURLOPT_HEADER, 0);

         curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
         curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Content-Length: ' . strlen($data_string)) );

         $response = curl_exec( $ch );

         if ($response == "All Good") {
            $GopherPHPLogs = [];
         }
      }
   }


   // Moved this line to the bottom of the 'file' for usability -
   // I keep each of the above mentioned 'pieces' in separate files.
   //$ErrorHandler = new ErrorHandler();

   $ErrorCallback = 'HandleRuntimeError';
   $ExceptionCallback = 'HandleException';
   $FatalCallback = 'HandleFatalError';

   $EnableReporting = true;
   $ErrorLevel = E_ALL;

   function InitializeErrors()
   {
       if ($GLOBALS['EnableReporting']) {
           error_reporting($GLOBALS['ErrorLevel']);

           if (isset($GLOBALS['ErrorCallback']) && strlen($GLOBALS['ErrorCallback']) > 0) {
               set_error_handler($GLOBALS['ErrorCallback']);

               // Prevent the PHP engine from displaying runtime errors on its own
               ini_set('display_errors', false);
           } else {
               ini_set('display_errors', true);
           }

           if (isset($GLOBALS['FatalCallback']) && strlen($GLOBALS['FatalCallback']) > 0) {
               register_shutdown_function($GLOBALS['FatalCallback']);

               // Prevent the PHP engine from displaying fatal errors on its own
               ini_set('display_startup_errors', false);
           } else {
               ini_set('display_startup_errors', true);
           }

           if (isset($GLOBALS['ExceptionCallback']) && strlen($GLOBALS['ExceptionCallback']) > 0) {
               set_exception_handler($GLOBALS['ExceptionCallback']);
           }
       } else {
           ini_set('display_errors', 0);
           ini_set('display_startup_errors', 0);
           error_reporting(0);
       }
   }

   function HandleRuntimeError($ErrorLevel, $ErrorMessage, $ErrorFile = null, $ErrorLine = null, $ErrorContext = null)
   {

      if (isset($GLOBALS['ErrorHandler'])) {
         //  Pass errors up to the global ErrorHandler to be later inserted into
         // final output at the appropriate time.
         $GLOBALS['ErrorHandler']->AppendError($ErrorLevel, 'Runtime Error: '.$ErrorMessage, $ErrorFile, $ErrorLine, $ErrorContext);


         return true;
      } else {
         PrintError($ErrorLevel, $ErrorMessage, $ErrorFile, $ErrorLine, $ErrorContext);

         return true;
      }
   }

   function HandleException($Exception)
   {
       if (isset($GLOBALS['ErrorCallback'])) {
           // Parse and pass exceptions up to the standard error callback.
           $GLOBALS['ErrorCallback']($Exception->getCode(), 'Exception: '.$Exception->getMessage(), $Exception->getFile(), $Exception->getLine(), $Exception->getTrace());

           return true;
       } else {
           PrintError($Exception->getCode(), 'Exception: '.$Exception->getMessage(), $Exception->getFile(), $Exception->getLine(), $Exception->getTrace());

           return true;
       }
   }

   function HandleFatalError()
   {
      $Error = error_get_last();

      // Unset Error Type and Message implies a proper shutdown.
      if (!isset($Error['type']) && !isset($Error['message'])) {
         sendBufferDataToNode(null,true);
         exit();
      } elseif (isset($GLOBALS['ErrorCallback'])) {
        // Pass fatal errors up to the standard error callback.
        $GLOBALS['ErrorCallback']($Error['type'], 'Fatal Error: '.$Error['message'], $Error['file'], $Error['line']);
        sendBufferDataToNode(null,true);
        return;
      } else {
        PrintError($Error['type'], 'Fatal Error: '.$Error['message'], $Error['file'], $Error['line']);
        sendBufferDataToNode(null,true);
        return;
      }
   }

   // In the event that our 'ErrorHandler' class is in fact the generator of the error,
   // we need a plain-Jane method that will still deliver the message.
   function PrintError($ErrorLevel, $ErrorMessage, $ErrorFile = null, $ErrorLine = null, $ErrorContext = null)
   {
       global $PhpParentFileName;
       global $PhpInlineShowErrors;

       if (class_exists('ErrorHandler')) {
           $ErrorTypeString = ErrorHandler::ErrorTypeString($ErrorLevel);
       } else {
           $ErrorTypeString = $ErrorLevel;
       }

       $ReturnValue = $ErrorTypeString.' - '.$ErrorMessage;

       if ($PhpInlineShowErrors) {
          if (($ErrorTypeString != 'E_NOTICE') && ($ErrorTypeString != 'E_WARNING') && ($ErrorTypeString != 'E_DEPRECATED')) {
              echo "<div style='border:1px solid black; padding:5px; margin:5px; color:black; background-color:#aaa;'>".$ErrorFile.' '.$ErrorLine.': '.$ReturnValue.'</div>';
          }
      }

       $data = array('TY' => 'phperror1', 'PFN' => $PhpParentFileName, 'LG' => $ReturnValue, 'FN' => $ErrorFile, 'LN' => $ErrorLine, 'TG' => '', 'TS' => microtime(true));
       sendBufferDataToNode($data,false);

   }

   class ErrorHandler
   {
       public function AppendError($ErrorLevel, $ErrorMessage, $ErrorFile = null, $ErrorLine = null, $ErrorContext = null)
       {
           global $PhpParentFileName;
           global $PhpInlineShowErrors;

           // Perhaps evaluate the error level and respond accordingly
           //
           // In the event that this actually gets used, something that might
           // determine if you're in a production environment or not, or that
           // determines if you're an admin or not - or something - could belong here.
           // Redirects or response messages accordingly.
           $ErrorTypeString = self::ErrorTypeString($ErrorLevel);

           $ReturnValue = $ErrorTypeString.' - '.$ErrorMessage;

           if ($PhpInlineShowErrors) {
              if (($ErrorTypeString != 'E_NOTICE') && ($ErrorTypeString != 'E_WARNING') && ($ErrorTypeString != 'E_DEPRECATED')) {
                  echo "<div style='border:1px dotted black; padding:5px; margin:5px; color:black; background-color:#ccc;'>".$ErrorFile.' '.$ErrorLine.': '.$ReturnValue.'</div>';
              }
           }

           $data = array('TY' => 'phperror2', 'PFN' => $PhpParentFileName, 'LG' => $ReturnValue, 'FN' => $ErrorFile, 'LN' => $ErrorLine, 'TG'=>'', 'TS' => microtime(true));
           sendBufferDataToNode($data,false);

           //print_r($phpgopherstore);
         //print_r($data);
       }

       public static function ErrorTypeString($ErrorType)
       {
           $ReturnValue = '';

           switch ($ErrorType) {
               default:
                   $ReturnValue = 'E_UNSPECIFIED_ERROR';
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

   //------------------------------------------------------


   function Gopher($xValue, $xTags = '')
   {
       global $PhpParentFileName;

       $backtr = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);

       $src = file($backtr[0]['file']);
       $line = $src[ $backtr[0]['line'] - 1 ];
       preg_match("#Gopher\((.+)\)#", $line, $match);

       $max = strlen($match[1]);
       $varname = '';
       $c = 0;
       for ($i = 0; $i < $max; ++$i) {
           if ($match[1]{$i} == '(') {
               $c++;
           } elseif ($match[1]{$i} == ')') {
               $c--;
           }
           if ($c < 0) {
               break;
           }
           $varname .=  $match[1]{$i};
       }

       $varnames[] = str_getcsv($varname); // explode(",", $varname);
       $newvarname = $varnames[0][0];

   //  var_dump($backtr); //DEBUG_BACKTRACE_IGNORE_ARGS
   //    echo "<div style='border:1px dotted black; padding:5px; margin:5px; color:white; font-weight:normal; background-color:#444;'>";
   //    echo ' Line:'.$backtr[0]['line'].' '.$varname.' = '.json_encode($xValue).' Tags:'.$xTags.' -- File:'.$backtr[0]['file'];
   //    echo '</div>';

      if ( (strpos($newvarname,"'") !== false) || (strpos($newvarname,"\"") !== false) || (strpos($newvarname,".") !== false) || (strpos($newvarname,"$") === false) )
      {
         $newvarname = "LOG"; //" ".$newvarname;
      }

       $data = array('TY' => 'phpvar', 'PFN' => $PhpParentFileName, 'VV' => json_encode($xValue), 'VN' => $newvarname, 'TG' => $xTags, 'FN' => $backtr[0]['file'], 'LN' => $backtr[0]['line'], 'TS' => microtime(true));
       sendBufferDataToNode($data,false);
   }





   //----------- Make Gopher.php call the php file if it exists in the header request.
   //----------- Later gopher should offer two different runtimes one where it includes the request in gopherMini.php and other way is direct run.

   $GopherIncludeFile = '';
   $GopherRedirect = 'z';
   foreach (getallheaders() as $name => $value) {
       if ($name == 'GopherPHPFile') {
           $GopherIncludeFileOrignal = $value;
           $GopherIncludeFile = reset((explode('?', $value))); //remove querystring

           $PhpParentFileName = $GopherIncludeFileOrignal;
       } else
       if ($name == 'GopherPHPRedirect') {
          $GopherRedirect = "yes";
       }
   }

   if ($GopherIncludeFile !== '') {
/*
      if ($GopherRedirect !== '')
      {
         echo $GopherIncludeFileOrignal."<br>";
         echo "a:".getcwd() ."<br>";
         echo "-->  ".$PhpHelperRoot." -- ".$GopherIncludeFile."<br>";
         echo "b:".dirname($PhpHelperRoot.$GopherIncludeFile)."<br>";
      }


      if ( getcwd() != dirname($PhpHelperRoot.$GopherIncludeFile) )
      {
         copy(getcwd()."/Gopher.php",dirname($PhpHelperRoot.$GopherIncludeFile)."/Gopher.php");

         header('GopherPHPFile: '.$GopherIncludeFileOrignal);
         header('GopherPHPRedirect: '.$GopherIncludeFileOrignal);
         header("Location: ".dirname($GopherIncludeFileOrignal)."/Gopher.php" );
         die();
      }
*/

      header('GopherMirrorRequest: '.$GopherIncludeFile);
      require_once $PhpHelperRoot.$GopherIncludeFile;
   }

}
?>
