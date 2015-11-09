<?php
require_once(__DIR__.'/../node-proxy/gopherMini.php');

Gopher("This comes from an ajax request php page");

echo json_encode(["result" => "ok"]);

?>
