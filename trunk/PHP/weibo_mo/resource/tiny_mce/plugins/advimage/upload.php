<?php
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../../../init.php';

Passport::RequireLogin();

if ($_FILES) {
	$ret = array();
	foreach ($_FILES as $file) {
		$success = false;
		$errReason = "";
		if ($file['size'] == 0) {
			$errReason = "文件大小为 0 字节。";
		} else {
			@mkdir(UPLOAD_PATH, 0777, true);
			$new_filename = microtime(true) . '_' . Pinyin::get(str_replace(' ', '-', $file['name']));
			$upload_file = UPLOAD_PATH . $new_filename;
			if (move_uploaded_file($file['tmp_name'], $upload_file)) {
				$success = true;
			}
		}
		$ret[] = array(
			'Success'	=> $success,
			'ErrReason'	=> $errReason,
			'NewFileName'=> UPLOAD_PATH_WWW . $new_filename,
		);
	}
	echo json_encode($ret);
	exit;
}
?>
<form enctype="multipart/form-data" method="post">
  <input type="file" name="file1">
  <input type="submit" value="上传">
</form>
