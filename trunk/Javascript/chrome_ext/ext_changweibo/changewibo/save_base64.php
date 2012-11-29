<?php
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

function get_absolute_url($filename, $host = NULL) {
	if ($host) {
		$parts = parse_url($host);
		if ($parts['host'])	$host = $parts['host'];
	} else {
		$host = $_SERVER['HTTP_HOST'];
	}
	$path = dirname($_SERVER['REQUEST_URI']);
	return "http://$host$path/$filename";
}


$data = $_POST['dataUrl'];
$data = str_replace('data:image/png;base64,', '', $data);
$imgData = base64_decode($data);

@mkdir(UPLOAD_PATH, 0777, true);
$new_filename = microtime(true) . '_' . '.png';
$upload_file = UPLOAD_PATH . $new_filename;

file_put_contents($upload_file, $imgData);

echo get_absolute_url(UPLOAD_PATH_WWW . $new_filename);