<?php
ini_set('error_reporting', E_ALL & ~E_DEPRECATED & ~E_NOTICE);
session_start();

/*gopher:'php begin 2'*/


// Show PHP errors (during development only)
//error_reporting(E_ALL | E_STRICT);
//ini_set("display_errors", 2);

// Configuration
$dbhost = 'localhost';
$dbname = 'pdesign';

// Connect to test database
$mongo = new MongoClient("mongodb://".$dbhost);
$mongodb = $mongo->$dbname;

$GlobalRoot = '/Gopher-v0.2/pdesign/';


// Get the users collection
//$c_users = $db->users;

// Insert this new document into the users collection
//$c_users->save($user);


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
   global $mongodb;
   $FoundUnique = false;

   while (!$FoundUnique)
   {
      $code = generateRandomString();

      $c_projects = $mongodb->projects;
      $project = $c_projects->find( array('code' => (string) $code ) );
      $project->next();
      $project = $project->current();

      if ($project==null) {

         $newproject = array(
         	'code' => $code,
         	'version' => 1
         );

         $c_projects = $mongodb->projects;
         $c_projects->save($newproject);

         mkdir(dirname(__FILE__).'/pimages/'.$code);
         file_put_contents(dirname(__FILE__).'/pimages/'.$code.'/index.html','first commit!');

         $FoundUnique = true;

         $_SESSION["code"] = $code;
         $_SESSION["version"] = '1';
      }
   }
   return $code."/1";
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
function recurse_copy($src,$dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                recurse_copy($src . '/' . $file,$dst . '/' . $file);
            }
            else {
                copy($src . '/' . $file,$dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
function GenerateNewFork()
{
   global $mongodb;

   $c_projects = $mongodb->projects;
   $origproject = $c_projects->find( array('code' => (string) $_SESSION["code"], 'version' => (int) $_SESSION["version"]) );
   $origproject->next();
   $origproject = $origproject->current();
   $origproject['project']['status'] = 'draft';

//   var_dump($origproject);
//   die();

   $FoundUnique = false;

   while (!$FoundUnique)
   {
      $code = generateRandomString();

      $c_projects = $mongodb->projects;
      $project = $c_projects->find( array('code' => (string) $code ) );
      $project->next();
      $project = $project->current();

      if ($project==null) {
         $temphtml = $_POST["html"];
         $temphtml = str_replace( $_SESSION['code'] , $code, $temphtml);

         $tempcss = $_POST["css"];
         $tempcss = str_replace( $_SESSION['code'] , $code, $tempcss);

         $tempjs = $_POST["js"];
         $tempjs = str_replace( $_SESSION['code'] , $code, $tempjs);

         $forkproject = array(
         	'code' => $code,
            'originalcode' => $_SESSION['code'],
            'html' => $temphtml,
            'css' => $tempcss,
            'js' => $tempjs,
            'project' => $origproject['project'],
         	'version' => 1
         );

         $c_projects = $mongodb->projects;
         $c_projects->save($forkproject);

         mkdir(dirname(__FILE__).'/pimages/'.$code);
         file_put_contents(dirname(__FILE__).'/pimages/'.$code.'/index.html','first commit!');

         recurse_copy(dirname(__FILE__).'/pimages/'.$_SESSION['code'],dirname(__FILE__).'/pimages/'.$code);

         $_SESSION["code"] = $code;
         $_SESSION["version"] = '1';

         $FoundUnique = true;
      }
   }
   return $code."/1";
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//update editor content
if ($_POST["op"]=="updateprojectinfo") {

   $c_projects = $mongodb->projects;

   $newdata = null;

   if ($_POST['name']=='projecttitle') {
      $newdata = array('project.title' => (string) $_POST['value'], 'updated_at' => new MongoDate() );
   }

   if ($_POST['name']=='projectdescription') {
      $newdata = array('project.description' => (string) $_POST['value'], 'updated_at' => new MongoDate() );
   }

   if ($_POST['name']=='projectstatus') {
      $newdata = array('project.status' => (string) $_POST['value'], 'updated_at' => new MongoDate() );
   }

   if ($_POST['name']=='projectimage') {
      $newdata = array('project.image' => (string) $_POST['value'], 'updated_at' => new MongoDate() );
   }

   if ($_POST['name']=='projectbrowsers') {
      $newdata = array('project.browsers' => $_POST['value'], 'updated_at' => new MongoDate() );
   }


   if ($newdata!=null) {
      $c_projects->update( array('code'=> (string) $_SESSION["code"], 'version' => (int) $_SESSION["version"]),
                           array('$set' => $newdata) );
   }

   $returnDelResult[] = array('success' => (bool) true, 'Message' => 'information updated');
   echo json_encode($returnDelResult);
   die();
} else

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//update preview files
if ($_POST["op"]=="updateiframe") {

   file_put_contents(dirname(__FILE__).'/pimages/'.$_SESSION["code"].'/index.css',$_POST["css"]);
   file_put_contents(dirname(__FILE__).'/pimages/'.$_SESSION["code"].'/index.js',"$(document).ready(function () {\n\n".$_POST["js"]."\n\n});");

   file_put_contents(dirname(__FILE__).'/pimages/'.$_SESSION["code"].'/index.html',"<html>\n<head>\n<script src='".$GlobalRoot."js/jquery-2.1.4.min.js'></script>\n<script src='".$GlobalRoot."pimages/".$_SESSION["code"]."/index.js?rnd=".rand()."'></script>\n<link href='".$GlobalRoot."pimages/".$_SESSION["code"]."/index.css?rnd=".rand()."'' rel='stylesheet' type='text/css'>\n</head>\n<body>".$_POST["html"]."</body>\n</html>");

   $returnDelResult[] = array('success' => (bool) true, 'Message' => 'information updated');
   echo json_encode($returnDelResult);
   die();

}


//---------------------------------------------------------------------------------------------------------------------------------------------------------
//update editor content
if ($_POST["op"]=="update") {
   if (($_POST["html"]!="") || ($_POST["js"]!="") || ($_POST["css"]!="")) {

      $c_projects = $mongodb->projects;
      $project = $c_projects->find( array('code' => (string) $_SESSION["code"]) );
      $project->sort( array( 'version' => -1 ) );
      $project->limit(1);
      $project->next();
      $project = $project->current();

      if ($project!=null) {

         file_put_contents(dirname(__FILE__).'/pimages/'.$_SESSION["code"].'/index.html'.$_SESSION["code"],'first commit!');

         $version = $project["version"];

         $origproject = $c_projects->find( array('code' => (string) $_SESSION["code"], 'version' => (int) $_SESSION["version"]) );
         $origproject->limit(1);
         $origproject->next();
         $origproject = $origproject->current();


         $updateproject = array(
         	'code' => $_SESSION["code"],
            'html' => $_POST["html"],
            'css' => $_POST["css"],
            'js' => $_POST["js"],
            'project' => $origproject["project"],
         	'version' => ($version+1)
         );

         $c_projects = $mongodb->projects;
         $c_projects->save($updateproject);

         $_SESSION["version"] = ($version+1);

         $returnDelResult[] = array('success' => (bool) true, 'code' => (string) $_SESSION["code"], 'version' => (int) ($version+1));
         echo json_encode($returnDelResult);

//         $returnDelResult[] = array('success' => (bool) false);
//         echo json_encode($returnDelResult);
      }
   } else {
      $returnDelResult[] = array('success' => (bool) false, 'Message' => 'nothing to update');
      echo json_encode($returnDelResult);
   }
   die();
} else

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//update editor content
if ($_POST["op"]=="fork") {
   $ForkPath = GenerateNewFork();

   if ($ForkPath!="") {
      $returnDelResult[] = array('success' => (bool) true, 'forkpath' => (string) $ForkPath);
      echo json_encode($returnDelResult);
   } else {
      $returnDelResult[] = array('success' => (bool) false);
      echo json_encode($returnDelResult);
   }
   die();
}


//echo $_SESSION["code"]." ".$_SESSION["version"]."  - ".$_SESSION["dbid"];

$html = "";
$css = "";
$js = "";

$compactcode_temp = $_GET["id"];
$compactcode = explode('/', $compactcode_temp);

$code = $compactcode[0];


if ((count($compactcode)==3) && ($code=="preview")) {
   $code = $compactcode[1];
   $version = $compactcode[2];

   $c_projects = $mongodb->projects;
   $project = $c_projects->find( array('code' => (string) $code, 'version' => (int) $version) );

   $project->next();
   $project = $project->current();

//   var_dump($project);
//   die();

   if ($project!=null) {
      $_SESSION["code"] = $code;
      $_SESSION["version"] = $version;

      $ProjectTitle = $project["project"]["title"];
      if ($ProjectTitle=='') { $ProjectTitle = 'Project Title'; }

      $ProjectDescription = $project["project"]["description"];
      if ($ProjectDescription=='') { $ProjectDescription = 'Project Description'; }

      $ProjectStatus = $project["project"]["status"];
      if ($ProjectStatus=='') { $ProjectStatus = 'draft'; }

      $ProjectImage = '../pimages/'.$_SESSION["code"].'/thumbnail/'.$project["project"]["image"];
      $ProjectRealImage = 'pimages/'.$_SESSION["code"].'/thumbnail/'.$project["project"]["image"];
      if ($project["project"]["image"]=='') { $ProjectImage = '../placeholder.jpg'; $ProjectRealImage = 'placeholder.jpg';}

      $imagewidth=80;
      $imageheight=80;
      if (file_exists($ProjectRealImage)) {
         list($imagewidth, $imageheight) = getimagesize($ProjectRealImage);
      }

      if ($project["project"]["browsers"]==null) {
         $ProjectBrowsers = '';
      } else {
         $ProjectBrowsers = implode (",", $project["project"]["browsers"] );
      }

      $html = $project["html"];
      $css = $project["css"];
      $js = $project["js"];
   }

//   var_dump($compactcode);
   include_once 'preview.php';
   die();
}



if ( ((count($compactcode)==1) && ($code!="")) || ((count($compactcode)==2) && ($code!="") && ($compactcode[1]=="")) ) {
   // find table with code
   $c_projects = $mongodb->projects;
   $project = $c_projects->find( array('code' => (string) $code) );
   $project->sort( array( 'version' => -1 ) );
   $project->limit(1);
   $project->next();
   $project = $project->current();

//   var_dump($project);
//   die();

   if ($project!=null) {
      $version = $project["version"];
      $_SESSION["code"] = $code;
      $_SESSION["version"] = $project['version'];
      header("Location: /Gopher-v0.2/pdesign/".$_SESSION["code"]."/".$version);
      die();
   } else {
      header("Location: /Gopher-v0.2/pdesign/".GenerateNewPage());
      die();
   }
} else
if ( (count($compactcode)==2) && ($code!="") && ($compactcode[1]!="")) {
   $version = $compactcode[1];

   // find table with code
   $c_projects = $mongodb->projects;
   $project = $c_projects->find( array('code' => (string) $code, 'version' => (int) $version) );

   $project->next();
   $project = $project->current();

//   var_dump($project);
//   die();

   if ($project!=null) {
      $_SESSION["code"] = $code;
      $_SESSION["version"] = $version;

      $ProjectTitle = $project["project"]["title"];
      if ($ProjectTitle=='') { $ProjectTitle = 'Project Title'; }

      $ProjectDescription = $project["project"]["description"];
      if ($ProjectDescription=='') { $ProjectDescription = 'Project Description'; }

      $ProjectStatus = $project["project"]["status"];
      if ($ProjectStatus=='') { $ProjectStatus = 'draft'; }

      $ProjectImage = '../pimages/'.$code.'/thumbnail/'.$project["project"]["image"];
      $ProjectRealImage = 'pimages/'.$code.'/thumbnail/'.$project["project"]["image"];
      if ($project["project"]["image"]=='') { $ProjectImage = '../placeholder.jpg'; $ProjectRealImage = 'zzzz.jpg';}

      $imagewidth=160;
      $imageheight=160;
      if (file_exists($ProjectRealImage)) {
         list($imagewidth, $imageheight) = getimagesize($ProjectRealImage);
      }

      if ($project["project"]["browsers"]==null) {
         $ProjectBrowsers = '';
      } else {
         $ProjectBrowsers = implode (",", $project["project"]["browsers"] );
      }

      $html = $project["html"];
      $css = $project["css"];
      $js = $project["js"];
   } else {
      header("Location: /Gopher-v0.2/pdesign/".GenerateNewPage());
      die();
   }
} else {
   header("Location: /Gopher-v0.2/pdesign/".GenerateNewPage());
   die();
}

?>
