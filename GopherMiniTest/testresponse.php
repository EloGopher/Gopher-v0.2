<?php
require '../gopherSimple/Gopher.php';
gopher('1001-testresponse',"This comes from an ajax request php page");

echo json_encode(["result" => "ok"]);

?>
