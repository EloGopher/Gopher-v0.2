<?php
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
            $FoundUnique = true;
         }
      }
   }
   return $code;
}

$html = "";
$css = "";
$js = "";

$code = $_GET["id"];

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//update editor content
if (($_POST["code"]!="") && (($_POST["html"]!="") || ($_POST["js"]!="") || ($_POST["css"]!="")) ) {

   $code = $_POST["code"];

   $checkQ = 'SELECT * FROM projects WHERE code="'. mysqli_real_escape_string($dbconn,$code) .'" ORDER BY version DESC LIMIT 1';
   $resultQ = $dbconn->query($checkQ);

   if (mysqli_num_rows($resultQ)==1) {

      $rowQ = $resultQ->fetch_assoc();
      $version = $rowQ["version"];

      $newQ = 'INSERT INTO projects (code,version,html,css,js) VALUES ("'. mysqli_real_escape_string($dbconn,$code) .'",'. ($version+1) .',"'. mysqli_real_escape_string($dbconn,$_POST["html"]) .'","'. mysqli_real_escape_string($dbconn,$_POST["css"]) .'","'. mysqli_real_escape_string($dbconn,$_POST["js"]) .'")';

      //' SET html="'.mysqli_real_escape_string($dbconn,$_POST["html"]).'" WHERE code="'. mysqli_real_escape_string($dbconn,$_POST["code"]) .'"';
      $dbconn->query($newQ);
      if ($dbconn->insert_id > 0) {
         $saved = true;
         $returnDelResult[] = array('success' => (bool) true, 'insertID' => (int) $dbconn->insert_id);
         echo json_encode($returnRecipients);
      } else {
         $returnDelResult[] = array('success' => (bool) false);
         echo json_encode($returnRecipients);
      }
   }
   die();
}

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

   $rowQ = $resultQ->fetch_assoc();

   $html = $rowQ["html"];
   $css = $rowQ["css"];
   $js = $rowQ["js"];
}



?><!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>pDesign</title>

		<link rel="stylesheet" href="codemirror-5.10/lib/codemirror.css">
		<link rel="stylesheet" href="codemirror-5.10/addon/hint/show-hint.css">

      <script><?php echo 'var code="'. $code .'"'; ?></script>
		<script src="codemirror-5.10/lib/codemirror.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/hint/show-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/xml-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/html-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/javascript-hint.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/hint/css-hint.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/search/searchcursor.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/search/match-highlighter.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/selection/active-line.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/comment/continuecomment.js"></script>

		<script type="text/javascript" src="codemirror-5.10/addon/edit/matchbrackets.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/edit/closebrackets.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/edit/closetag.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/fold/xml-fold.js"></script>
		<script type="text/javascript" src="codemirror-5.10/addon/edit/matchtags.js"></script>


		<script type="text/javascript" src="codemirror-5.10/mode/xml/xml.js"></script>
		<script type="text/javascript" src="codemirror-5.10/mode/javascript/javascript.js"></script>
		<script type="text/javascript" src="codemirror-5.10/mode/css/css.js"></script>
		<script type="text/javascript" src="codemirror-5.10/mode/htmlmixed/htmlmixed.js"></script>

		<link href="css/bootstrap.min.css" rel="stylesheet">
		<link href="css/main.css" rel="stylesheet">

		<script src="js/jquery-2.1.4.min.js"></script>
		<script src="js/bootstrap.min.js"></script>
      <script src="js/split.min.js"></script>
		<script src="js/main.js"></script>
	</head>

	<body>

      <div style="height:5%; background:#fafafa; font-size:18px; text-align:center;">Parametric Design</div>
      <div style="height:95%;">
			<div class="split split-horizontal" id="TopRow">
				<div class="xPanel split content" id="HTMLPanel">
					<textarea id="HTMLCode" name="HTMLCode" class="editbox"><?php echo $html; ?></textarea>
					<div id="htmleditor_div_hint" class="EditorHint">HTML</div>
				</div>
				<div class="xPanel split content" id="JSPanel">
					<textarea id="JSCode" name="JSCode" class="editbox"><?php echo $js; ?></textarea>
					<div id="jseditor_div_hint" class="EditorHint">JavaScript</div>
				</div>
			</div>
			<div class="split split-horizontal" id="BottomRow">
				<div class="xPanel split content" id="CSSPanel">
					<textarea id="CSSCode" name="CSSCode" class="editbox"><?php echo $css; ?></textarea>
					<div id="csseditor_div_hint" class="EditorHint">CSS</div>
				</div>
				<div class="xPanel split content" id="PreviewPanel" style="overflow:hidden">
					<iframe id="iframesource" src="" class="iframebox"></iframe>
				</div>
			</div>
      </div>
	</body>

</html>
