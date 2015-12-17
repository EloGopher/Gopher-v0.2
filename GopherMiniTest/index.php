<?php
require_once('Gopher.php');


require 'funcs.php';

strpos();

$var1 = "xyz";

Gopher("PHP Start ".$var1,"Start Tag");

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



Gopher($cars,"Cars Tag");
Gopher($car,"Cars Tag");

Gopher($cars2,"Cars Tag");

Gopher("Start Timer","Tag 1");

usleep(1500000);

Gopher("End Timer","Tag 1");

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
      <script type="text/javascript" src="js/sizeof.js"></script>

	</head>

<body>
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
   	<div style="overflow:hidden; margin:0px; padding:0px;">
         <form action="index.php" method="POST">
         <input type="hidden" name="test" value="abc">
         <input type="submit">
      </form>


      <div id="editor2" contenteditable="true" style="width:600px; display:inline-block; border:1px solid black; padding:10px; margin:10px;">
<span style="font-weight:normal;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quam orci, ornare </span><span style="font-weight:bold;">sed ullamcorper id, eleifend in quam. Nulla facilisi. Aliquam vitae orci arcu. Aenean a nulla volutpat ante</span> ultrices euismod ut et magna. Nulla vitae vulputate urna. Donec tempus, nisi a pharetra placerat, diam nisi aliquam elit, a consectetur magna enim sed ligula. Aliquam iaculis rutrum dui et tristique. Nulla facilisi. Cras eu ante fringilla erat convallis rutrum in ac magna. Praesent porta bibendum augue sit amet rhoncus. Vestibulum nibh quam, posuere non consectetur eget, pharetra sit amet lectus.
      </div><br>
      <button onclick="getSelectionHtml();">Get HTML</button>
<br>


      <div id="area" style="width:600px; display:inline-block; border:1px solid black; padding:10px; margin:10px;" contentEditable="true">
         <span style="font-weight:normal;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quam orci, ornare </span><span style="font-weight:bold;">sed ullamcorper id, eleifend in quam. Nulla facilisi. Aliquam vitae orci arcu. Aenean a nulla volutpat ante</span> ultrices euismod ut et magna. Nulla vitae vulputate urna. Donec tempus, nisi a pharetra placerat, diam nisi aliquam elit, a consectetur magna enim sed ligula. Aliquam iaculis rutrum dui et tristique. Nulla facilisi. Cras eu ante fringilla erat convallis rutrum in ac magna. Praesent porta bibendum augue sit amet rhoncus. Vestibulum nibh quam, posuere non consectetur eget, pharetra sit amet lectus.
      </div><br>
      <button onclick="saveSelection();">save</button><button onclick="restoreSelection();">restore</button>
      <script type="text/javascript">
      var savedRange;
      function saveSelection()
      {
          if(window.getSelection)//non IE Browsers
          {
              savedRange = window.getSelection().getRangeAt(0) ;
          }
          else if(document.selection)//IE
          {
              savedRange =  document.selection.createRange() ;
          }
          console.log(savedRange);
      }

      function restoreSelection()
      {
          document.getElementById("area").focus();
          if (savedRange != null) {
              if (window.getSelection)//non IE and there is already a selection
              {
                  var s = window.getSelection();
                  if (s.rangeCount > 0)
                      s.removeAllRanges();
                  s.addRange(savedRange);
              }
              else if (document.createRange)//non IE and no selection
              {
                  window.getSelection().addRange(savedRange);
              }
              else if (document.selection)//IE
              {
                  savedRange.select();
              }
          }
      }
      </script>

	</body>
</html>
