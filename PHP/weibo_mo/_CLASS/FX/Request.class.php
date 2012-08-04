<?php
/**
 * HTTP请求相关方法
 */
class Request {
	/**
	 * 判断是否是POST请求
	 */
	public static function IsPost() {
		return ('POST' == $_SERVER['REQUEST_METHOD']);
	}
	/**
	 * 获取 HTTP_REFERER
	 */
	public static function Referer() {
		return $_SERVER['HTTP_REFERER'];
	}
}