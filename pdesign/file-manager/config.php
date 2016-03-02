<?php

session_start();

$GlobalRoot = '/Gopher-v0.2/pdesign/';

$CurrentCode = $_GET["code"];
if ($CurrentCode=='') { $CurrentCode = 'unknownfolder'; }

if (!preg_match('/[^A-Za-z0-9]/', $CurrentCode))
{
  // string contains only english letters & digits
} else {
	$CurrentCode = 'unknownfolder';
}

/** Full path to the folder that images will be used as library and upload. Include trailing slash */
define('FOLDER_PATH', '//users/Ekim/phpworkspace/Gopher-v0.2/pdesign/pimages/'.$CurrentCode.'/');

/** Full URL to the folder that images will be used as library and upload. Include trailing slash and protocol (i.e. http://) */
define('FOLDER_URL', '/Gopher-v0.2/pdesign/pimages/'.$CurrentCode.'/');

/** The extensions for to use in validation */
define('ALLOWED_IMG_EXTENSIONS', 'gif,jpg,jpeg,png,json');

/** Should the files be renamed to a random name when uploading */
define('RENAME_UPLOADED_FILES', false);

/** Number of folders/images to display per page */
define('ROWS_PER_PAGE', 8);


/** Should Images be resized on upload. You will then need to set at least one of the dimensions sizes below */
define('RESIZE_ON_UPLOAD', false);

/** If resizing, width */
define('RESIZE_WIDTH', 300);
/** If resizing, height */
define('RESIZE_HEIGHT', 300);


/** Should a thumbnail be created? */
define('THUMBNAIL_ON_UPLOAD', true);

/** If thumbnailing, thumbnail postfix */
define('THUMBNAIL_POSTFIX', '_thumb');
/** If thumbnailing, maximum width */
define('THUMBNAIL_WIDTH', 100);
/** If thumbnailing, maximum height */
define('THUMBNAIL_HEIGHT', 100);
/** If thumbnailing, hide thumbnails in listings */
define('THUMBNAIL_HIDE', true);



/**  Use these 9 functions to check cookies and sessions for permission.
Simply write your code and return true or false */


/** If you would like each user to have their own folder and only upload
 * to that folder and get images from there, you can use this funtion to
 * set the folder name base on user ids or usernames. NB: make sure it return
 * a valid folder name. */
function CurrentUserFolder(){
	return '';
}


function CanAcessLibrary(){
	return true;
}

function CanAcessUploadForm(){
	return true;
}

function CanAcessAllRecent(){
	return true;
}

function CanCreateFolders(){
	return true;
}

function CanDeleteFiles(){
	return true;
}

function CanDeleteFolder(){
	return true;
}

function CanRenameFiles(){
	return true;
}

function CanRenameFolder(){
	return true;
}


define("ENCRYPTION_KEY", "!@#$%^&*");
