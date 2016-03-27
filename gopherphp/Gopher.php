<?php
/*todo:

- admin panel
  - ignore folders

- logging
  - d/l and store gopher.js
  - log php to array and ajax to server evern n sec and on page exit
  - websockets log js stuff to server
  - insert js helper to php files with head
  - insert js helper to html files with head

- display
  - php include floating div into files with head
  - floating div use websockets to get log data


*/

$SourceFolder = __DIR__.'/../GopherMiniTest';
//$SourceFolder = '/users/ekim/phpworkspace/phishproof';

$FileList = array();

if (file_exists($SourceFolder.'/gopher-files.txt')) {
    $str = file_get_contents($SourceFolder.'/gopher-files.txt');
    $FileList = unserialize($str);
}
//print_r($FileList);

$t0 = microtime(true);

$tracklines = [];

$tracklines = recurse_copy($SourceFolder,[]);
var_dump($tracklines);
echo 'done scan<br>';

//echo '<pre>time taken: '.(microtime(true) - $t0)."\n";

$fh = fopen($SourceFolder.'/gopher-files.txt', 'w');
fwrite($fh, serialize($FileList));
fclose($fh);

//

if (isset($_POST['op'])) {
    if ($_POST['op'] == 'hello') {
        echo "Hi, I'm here. <br>\n";
        die(1);
    }
}

function recurse_copy($src,$tracklines)
{
   global $SourceFolder,$FileList;
   $dir = opendir($src);

   $result = ($dir === false ? false : true);

   if ($result === false) { die(1); }

   while (false !== ($file = readdir($dir))) {
      if (($file != '.') && ($file != '..') && $result) {
         if (is_dir($src.'/'.$file)) {
            //echo $src.'/'.$file.'<br>';
            if ($file == '.git') {
            } else {
                $tracklines = recurse_copy($src.'/'.$file,$tracklines);
            }
         } else
         if ( (stripos($file,'.php')!==false) || (stripos($file,'.js')!==false) || (stripos($file,'.html')!==false) )
         {
//            echo $CurrentFileName.'<br>';
            $CurrentFileName = $src.'/'.$file;
            $CurrentFileChecksum = md5_file($src.'/'.$file);

            $skipfile = false;
            $filefound = false;

            foreach ($FileList as &$TheFile) {
               if ($CurrentFileName == $TheFile['filename']) {
                  $filefound = true;

                  if ($CurrentFileChecksum == $TheFile['checksum']) {
                     //echo "skip ".$CurrentFileName."\n";
                     $skipfile=true;
                  } else {
                     echo $CurrentFileName ." is modified.<br>\n";
                     $TheFile['checksum'] = $CurrentFileChecksum;
                  }
                  break;
               }
            }

            if (!$skipfile) {
               if (!$filefound) {
                  $FileList[] = array('filename' => $CurrentFileName, 'checksum' => $CurrentFileChecksum);
                  //echo $CurrentFileName ." is new scanning it over.<br>\n";
               }

               $file_ext = pathinfo($file, PATHINFO_EXTENSION);

               if (($file_ext == 'php') || ($file_ext == 'js') ) {
                  $shortpath = $src;
                  $shortpath = str_replace($SourceFolder, '', $shortpath);

                  $temppaths = explode('/', $shortpath);
                  $upfolder = '';
                  for ($i = 0; $i < count($temppaths) - 1; ++$i) {
                     $upfolder .= '../';
                  }

                  $PhpSource = file_get_contents($src.'/'.$file);

                  $index = -1;

                  $re = '/gopher\((.+?)\);/msi';

                  $fh = fopen($src.'/'.$file, 'rb');
                  //$out = fopen($dst.'/'.$file, 'w');

                  if ($file_ext == 'php') {
                     //fputs($out, '<?php include_once "'.$upfolder.'Gopher.php"; ? >');
                  }

                  //echo $src.'/'.$file.'<br>';

                  $linex = 1;
                  while ($line = fgets($fh)) {
                     preg_match_all($re, $line, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);
                     if (count($matches) > 0) {
                        //print_r($matches);
                        $offsetX = 0;
                        foreach ($matches as $match) {
                           echo $linex." ".$shortpath.'/'.$file." ".$match[1][0]."<br>";
                           $tracklines[] = array('line' => $linex, 'path' => $shortpath.'/'.$file, 'match' => $match[1][0]) ;
                           //var_dump($tracklines);
                        }
                     }
                     //fputs($out, $line);
                     ++$linex;
                  }
                  fclose($fh);
                  //fclose($out);
               }
            }
         }
      }
   }
   closedir($dir);

   return $tracklines;
}

if (!isset($GopherIsHere)) { //prevent php from trying to icnlude Gopher.php twice or more and fail

   $GopherIsHere = true;
    $PhpInlineShowErrors = true;

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

    function savaDataToFile($data)
    {
        if (file_exists($_SERVER['DOCUMENT_ROOT'].'/gopher.log')) {
            $fh = fopen($_SERVER['DOCUMENT_ROOT'].'/gopher.log', 'a');
            fwrite($fh, json_encode($data)."\n");
        } else {
            $fh = fopen($_SERVER['DOCUMENT_ROOT'].'/gopher.log', 'w');
            fwrite($fh, json_encode($data)."\n");
        }
        fclose($fh);
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
          exit();
      } elseif (isset($GLOBALS['ErrorCallback'])) {
          // Pass fatal errors up to the standard error callback.
        $GLOBALS['ErrorCallback']($Error['type'], 'Fatal Error: '.$Error['message'], $Error['file'], $Error['line']);

          return;
      } else {
          PrintError($Error['type'], 'Fatal Error: '.$Error['message'], $Error['file'], $Error['line']);

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

       $data = array('TY' => 'phperror1', 'RE' => 1, 'PFN' => $PhpParentFileName, 'LG' => $ReturnValue, 'FN' => str_replace('gopher-', '', $ErrorFile), 'LN' => $ErrorLine, 'PHPTS' => microtime(true));
       savaDataToFile($data);
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

            $data = array('TY' => 'phperror2', 'RE' => 1, 'PFN' => $PhpParentFileName, 'LG' => $ReturnValue, 'FN' => str_replace('gopher-', '', $ErrorFile), 'LN' => $ErrorLine, 'PHPTS' => microtime(true));
            savaDataToFile($data);

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


   function Gopher($GLineNumber, $GFileName, $xValueName, $xValue)
   {
       global $PhpParentFileName;
       $data = array('TY' => 'phpvar', 'RE' => 1, 'PFN' => $PhpParentFileName, 'VV' => json_encode($xValue), 'VN' => $xValueName, 'FN' => str_replace('gopher-', '', $GFileName), 'LN' => $GLineNumber, 'PHPTS' => microtime(true));
       savaDataToFile($data);
   }
}
