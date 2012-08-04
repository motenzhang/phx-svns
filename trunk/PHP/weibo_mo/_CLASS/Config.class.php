<?php
/**
 * 封装读$CACHE的方法
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Config {
	/**
	 * 获取 $CACHE 项
	 * @param string $item
	 */
	public static function get($item) {
    	global $CACHE;
		return $CACHE[$item];
	}
	/**
	 * 获取支持开放API的平台列表
	 */
	public static function open_list() {
		$platform_list = self::get('platform_list');
		return $platform_list['open'];
	}
	/**
	 * 获取微博平台列表
	 */
	public static function weibo_list() {
		$platform_list = self::get('platform_list');
		return $platform_list['weibo'];
	}
	/**
	 * 获取指定微博平台名称
	 * @param string $type
	 */
	public static function get_weibo_name($type) {
		$list = self::weibo_list();
		return $list[$type];
	}
	/**
	 * 获取博客平台列表
	 */
	public static function blog_list() {
		$platform_list = self::get('platform_list');
		return $platform_list['blog'];
	}
	/**
	 * 获取指定博客平台名称
	 * @param string $type
	 */
	public static function get_blog_name($type) {
		$list = self::blog_list();
		return $list[$type];
	}
	/**
	 * 获取微博或者博客名称
	 * @param string $type
	 */
	public static function get_name($type) {
		$name = self::get_weibo_name($type);
		if (!$name) {
			$name = self::get_blog_name($type);
		}
		return $name;
	}
	public static function simula_list() {
		$list = array_merge(self::weibo_list(), self::blog_list());
		foreach ( $list as $key => $value ) {
			if (array_key_exists ( $key, self::open_list () )) {
				unset ( $list [$key] );
			}
		}
		return $list;
	}
	public static function get_mail($type) {
		$mail = self::get('mail');
		$item = $mail[$type];
		return $item;
	}
}