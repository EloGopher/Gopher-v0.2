<?php
for ($i=0; $i<10; $i++)
{
	/*gopher:"Test Call 2"*/
}
gopher('1000-funcs',$i);

/*gopher:"Test Call 2"*/
/*gopher:"PHP Funcs Start"*/

function TestCall2()
{
	$localvar = "12";

	for ($i=0; $i<10; $i++)
	{
		/*gopher:$localvar*/
	}
	gopher('1001-funcs','Test Call 2');
}

?>
