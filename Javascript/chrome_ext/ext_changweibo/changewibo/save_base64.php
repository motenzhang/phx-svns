<?php
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

$data = $_POST['dataUrl'];
$data = str_replace('data:image/png;base64,', '', $data);
$imgData = base64_decode($data);

@mkdir(UPLOAD_PATH, 0777, true);
$new_filename = microtime(true) . '_' . '.png';
$upload_file = UPLOAD_PATH . $new_filename;

file_put_contents($upload_file, $imgData);

echo UPLOAD_PATH_WWW . $new_filename;