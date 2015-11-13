<?php
require_once('Gopher.php');

Gopher("Test Call 2");
Gopher("PHP Funcs Start");

function TestCall2()
{
	$localvar = "12";

	Gopher($localvar);
	Gopher("Test Call 2");
}

?>
