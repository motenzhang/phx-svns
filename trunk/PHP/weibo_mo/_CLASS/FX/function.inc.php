<?php
/**
 * 通用函数
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */

/**
 * 302跳转
 * @param string $url
 */
function redirect ($url) {
	header("Location: $url");
}
/**
 * 判断字符串开始
 * @param string $str
 * @param string $find
 */
function start_with ($str, $find) {
	if (strlen($str) == 0)	return false;
	return substr_compare($str, $find, 0, count($find)) == 0;
}
/**
 * 判断字符串包含
 * @param $str
 * @param $find
 */
function str_contains ($str, $find) {
	return strpos($str, $find) !== false;
}
/**
 * 获取http绝对url
 * @param string $filename
 * @param string $host
 */
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
/**
 * 获取登录成功跳转页
 * @param string $url
 */
function get_returnurl($url)
{
	$ref = $_GET['return_url'];
	if($ref && strpos($ref, $_SERVER['REQUEST_URI']) === false)
	{
		return $ref;
	}
	return $url;
}
/**
 * 字符串截取
 * @param string $str
 * @param int $left
 */
function str_left($str, $left) {
	$str = strip_tags($str);
	return mb_strimwidth($str, 0, $left, '...');
}

/**
 * 输出xml
 * @param string $html
 */
function print_html($html) {
	echo "<xmp>$html</xmp>";
}

/**
 * HTML Decode
 * @param string $html
 */
function html_decode($html) {
	$html_regs = array(
		'#<script.*?>.*?</script>#si'		=> '',			// 去掉 javascript
		'#(<.+?>)\s+(?=<.+?>)#s'			=> '$1$2',		// 去掉HTML标签之间的空格
		'#<(p|h\d).*?>(.+?)</\1>#si'		=> "$2\n\n",	// p h1 回车
		'#<(div|li|tr).*?>(.+?)</\1>#si'	=> "$2\n",		// div li tr 换行
		'#<(td|th).*?>(.+?)</\1>#si'		=> "$2\t",		// td th \tab
		'#<br.*?>#si'						=> "$1\n",		// br 换行
	);
	$html = preg_replace(array_keys($html_regs), array_values($html_regs), $html);
	$html = strip_tags($html);	// 转换其他HTML代码
	$html = html_entity_decode($html, ENT_QUOTES, 'utf-8');	// &**; 编码
	return $html;
}
/**
 *
 * @param $var
 * @param $value
 */
function if_null($var, $value) {
	if (is_null($var)) {
		return $value;
	}
	return $var;
}
