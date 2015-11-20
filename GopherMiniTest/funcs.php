<?php
require_once('Gopher.php');
for ($i=0; $i<10; $i++)
{
	Gopher("Test Call 2");
}

Gopher("Test Call 2");
Gopher("PHP Funcs Start");

function TestCall2()
{
	$localvar = "12";

	for ($i=0; $i<10; $i++)
	{
		Gopher($localvar,"PHP Tag");
	}



	Gopher("Test Call 2");
}

?>
