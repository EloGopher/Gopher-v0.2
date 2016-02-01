<?php include_once "Gopher.php"; ?><?php
gopher(2, '','\"This comes from an ajax request php page\"',"This comes from an ajax request php page"); /*gopher:"This comes from an ajax request php page"*/

echo json_encode(["result" => "ok"]);

?>
