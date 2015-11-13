<?php
require_once('Gopher.php');

Gopher("This comes from an ajax request php page");

echo json_encode(["result" => "ok"]);

?>
