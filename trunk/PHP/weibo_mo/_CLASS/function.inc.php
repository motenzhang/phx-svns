<?php
/**
 * 与系统有关的公共函数
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */

/**
 * 列表页获取 平台-博客 名称
 * @param string $type	类型
 * @param string $cat	类别 weibo|blog
 */
function get_name ($type, $cat = 'weibo') {
	global $platform_name_list;
	$arr = explode ('|', $type);
	if (!isset($platform_name_list[$arr[1]])) {
		$wt_open = new WTOpen();
		$platform = $wt_open->get($arr[1]);
		if ($platform) {
			$platform_name_list[$arr[1]] = $platform['name'] . ' - ';
		}
	}
	if	($cat != 'weibo') {
		$name = Config::get_blog_name($arr[0]);
	} else {
		$name = Config::get_weibo_name($arr[0]);
	}
	return $platform_name_list[$arr[1]] . $name;
}
/**
 * 获取GET参数
 * @param mixed $args	排除的key
 */
function url_param($arg1 = NULL, $arg2 = NULL, $arg3 = NULL, $arg4 = NULL, $arg5 = NULL ) {
	return Pager::url_param($arg1, $arg2, $arg3, $arg4, $arg5);
}

/**
 * 获取图片相对路径
 * @param $path
 */
function get_pic ($path) {
	return str_replace(ROOT_DIR, '', $path);
}

/**
 * SMTP方式发邮件
 * @param string $to		目标邮箱，多个地址半角逗号分隔
 * @param string $subject
 * @param string $content
 */
function sendmail($to, $subject, $content, &$error = null) {
	$smtp = Config::get_mail('smtp');
	if (!$smtp) {
		return false;
	}
	$mail = new SmtpMail($smtp['host'], $smtp['ip'], $smtp['port']);
	$mail->setFromEnv($smtp['email'], $smtp['username'], $smtp['password'], $smtp['display']);
	$ret = false;
	foreach ($to as $item) {
		$ret = $mail->send($item, $subject, $content, array(), $error);
	}
	return $ret;
}
