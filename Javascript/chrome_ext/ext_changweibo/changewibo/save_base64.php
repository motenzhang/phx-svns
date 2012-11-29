<?php

$data = $_POST['dataUrl'];
$data = str_replace('data:image/png;base64,', '', $data);
var_dump($data);
$imgData = base64_decode($data);

var_dump($imgData);
file_put_contents(dirname(__FILE__) . '/changweibo.png', $imgData);