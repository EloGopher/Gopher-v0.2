<?php
session_start();

/*gopher:'php begin 2'*/
define('pdesign_username', 'pdesign');
define('pdesign_password', 'A123456b');
define('pdesign_hostname', 'localhost');
define('pdesign_database', 'pdesign');

$dbconn = new mysqli(pdesign_hostname,pdesign_username,pdesign_password,pdesign_database);
if ($dbconn->connect_errno) {
  die('Connect Error: ' . $dbconn->connect_errno);
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
function GenerateNewPage()
{
   global $dbconn;
   $FoundUnique = false;

   while (!$FoundUnique)
   {
      $code = generateRandomString();

      $checkQ = 'SELECT * FROM projects WHERE code="'. mysqli_real_escape_string($dbconn,$code) .'"';
      $resultQ = $dbconn->query($checkQ);

      if (mysqli_num_rows($resultQ)==0) {
         $newQ = 'INSERT INTO projects (code,version) VALUES ("'. mysqli_real_escape_string($dbconn,$code) .'",1)';
         $dbconn->query($newQ);
         if ($dbconn->insert_id > 0) {
            mkdir(dirname(__FILE__).'/pimages/'.$code);
            $_SESSION["code"] = $code;
            $FoundUnique = true;
         }
      }
   }
   return $code;
}

$html = "";
$css = "";
$js = "";

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//update editor content
if ($_POST["op"]=="update") {
   if (($_POST["html"]!="") || ($_POST["js"]!="") || ($_POST["css"]!="")) {

      $checkQ = 'SELECT * FROM projects WHERE code="'. mysqli_real_escape_string($dbconn,$_SESSION["code"]) .'" ORDER BY version DESC LIMIT 1';

      $resultQ = $dbconn->query($checkQ);

      if (mysqli_num_rows($resultQ)==1) {

         $rowQ = $resultQ->fetch_assoc();
         $version = $rowQ["version"];

         $newQ = 'INSERT INTO projects (code,version,html,css,js) VALUES ("'. mysqli_real_escape_string($dbconn,$_SESSION["code"]) .'",'. ($version+1) .',"'. mysqli_real_escape_string($dbconn,$_POST["html"]) .'","'. mysqli_real_escape_string($dbconn,$_POST["css"]) .'","'. mysqli_real_escape_string($dbconn,$_POST["js"]) .'")';

         //' SET html="'.mysqli_real_escape_string($dbconn,$_POST["html"]).'" WHERE code="'. mysqli_real_escape_string($dbconn,$_POST["code"]) .'"';
         $dbconn->query($newQ);
         if ($dbconn->insert_id > 0) {
            $saved = true;
            $returnDelResult[] = array('success' => (bool) true, 'insertID' => (int) $dbconn->insert_id);
            echo json_encode($returnDelResult);
         } else {
            $returnDelResult[] = array('success' => (bool) false);
            echo json_encode($returnDelResult);
         }
      }
   } else {
      $returnDelResult[] = array('success' => (bool) true, 'Message' => 'nothing to update');
      echo json_encode($returnDelResult);
   }
   die();
}

$code = $_GET["id"];

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//first visit redirect to code page
if ($code=="") {
   header("Location: ".GenerateNewPage());
   die();

} else
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//second visit load latest version
{
   $checkQ = 'SELECT * FROM projects WHERE code="'. mysqli_real_escape_string($dbconn,$code) .'" ORDER BY version DESC LIMIT 1';
   $resultQ = $dbconn->query($checkQ);

   if (mysqli_num_rows($resultQ)==0) {
      header("Location: ".GenerateNewPage());
      die();
   }

   $_SESSION["code"] = $code;

   $rowQ = $resultQ->fetch_assoc();

   $html = $rowQ["html"];
   $css = $rowQ["css"];
   $js = $rowQ["js"];
}

?>
