<?php
/**
 * 文件初始化设置,包含此目录包需要的文件及变量声明
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
set_time_limit(90);
header('Content-Type: text/html; charset=utf-8');

date_default_timezone_set('Asia/Chongqing');
define('DS', DIRECTORY_SEPARATOR);
define('ROOT_DIR', dirname(__FILE__) . DS);

include_once ROOT_DIR . '_LOCAL' . DS .'config.inc.php';
include_once ROOT_DIR . '_CLASS' . DS . 'FX' . DS .'function.inc.php';
include_once ROOT_DIR . '_CLASS' . DS .'function.inc.php';

function autoload($class_name) {
	$file = ROOT_DIR . '_CLASS' . DS . 'FX' . DS . $class_name.'.class.php';
	if (file_exists($file)) {
		include_once $file;
	} else {
		$file = ROOT_DIR . '_CLASS' . DS . $class_name.'.class.php';
		if (file_exists($file)) {
			include_once $file;
		}
	}
}
spl_autoload_register('autoload');

/*---Debug Begin---*/
if ( (defined('DEBUG') && DEBUG == true) || $_REQUEST['debug'] == 1) {
	//Debug模式将错误打开
	ini_set('display_errors', true);
	//设置错误级别
	error_reporting(ERROR_LEVEL);
	//开启ob函数
	ob_start();
	//Debug开关打开
	Debug::start();
	//注册shutdown函数用来Debug显示
	register_shutdown_function(array('Debug', 'show'));
}
/*---Debug End---*/

$TEMPLATE['is_admin'] = Passport::IsAdmin();
