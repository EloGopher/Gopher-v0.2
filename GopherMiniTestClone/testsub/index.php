<?php include_once "../Gopher.php"; ?><?php
require '../funcs.php';
gopher(3, '/testsub','\'hello\'','hello'); /*gopher:'hello'*/
strpos();

$var1 = "xyz";

gopher(8, '/testsub','$var1',$var1); /*gopher:$var1*/

$cars = array("Vol vo", "BMW", "Toyota");
$car = "Honda";

class Car2
{
    public $color;
    public $type;
}

$myCar = new Car2();
$myCar->color = 'red';
$myCar->type = 'sedan';

$yourCar = new Car2();
$yourCar->color = 'blue';
$yourCar->type = 'suv';

$cars2 = array($myCar, $yourCar);



gopher(31, '/testsub','$cars',$cars); /*gopher:$cars*/
gopher(32, '/testsub','$car',$car); /*gopher:$car*/

gopher(34, '/testsub','$cars2',$cars2); /*gopher:$cars2*/

gopher(36, '/testsub','\"Start Timer',"Start Timer); /*gopher:"Start Timer*/

usleep(100000);

gopher(40, '/testsub','\"End Timer\"',"End Timer"); /*gopher:"End Timer"*/

TestCall2();

?>
<!DOCTYPE HTML>
<html>
<head>
		<link href="css/ui-lightness/jquery-ui-1.10.4.css" rel="stylesheet">
		<script src="js/jquery-1.10.2.js"></script>
		<script src="js/jquery-ui-1.10.4.js"></script>

		<link href="css/style.css" rel="stylesheet">
      <script src="js/calculator.js"></script>
      <script src="js/app.js"></script>
	</head>


		<div id="calculator">
			<!-- Screen and clear key -->
			<div class="top">
				<span class="clear">C</span>
				<div class="screen"></div>
			</div>

			<div class="keys">
				<!-- operators and other keys -->
				<span>7</span>
				<span>8</span>
				<span>9</span>
				<span class="operator">+</span>
				<span>4</span>
				<span>5</span>
				<span>6</span>
				<span class="operator">-</span>
				<span>1</span>
				<span>2</span>
				<span>3</span>
				<span class="operator">/</span>
				<span>0</span>
				<span>.</span>
				<span class="eval">=</span>
				<span class="operator">x</span>
			</div>
		</div>


      <br><br><br><br>
      <?php echo $_POST["test"]; ?>
   	<body style="overflow:hidden; margin:0px; padding:0px;">
         <form action="index.php" method="POST">
         <input type="hidden" name="test" value="abc">
         <input type="submit">
      </form>

	</body>
</html>
