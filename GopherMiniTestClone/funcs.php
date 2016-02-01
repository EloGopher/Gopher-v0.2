<?php include_once "Gopher.php"; ?><?php
for ($i=0; $i<10; $i++)
{
gopher(4, '','\"Test Call 2\"',"Test Call 2"); 	/*gopher:"Test Call 2"*/
}

gopher(7, '','\"Test Call 2\"',"Test Call 2"); /*gopher:"Test Call 2"*/
gopher(8, '','\"PHP Funcs Start\"',"PHP Funcs Start"); /*gopher:"PHP Funcs Start"*/

function TestCall2()
{
	$localvar = "12";

	for ($i=0; $i<10; $i++)
	{
gopher(16, '','$localvar',$localvar); 		/*gopher:$localvar*/
	}

gopher(19, '','\"Test Call 2\"',"Test Call 2"); 	/*gopher:"Test Call 2"*/
}

?>
