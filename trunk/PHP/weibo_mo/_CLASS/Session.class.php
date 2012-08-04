<?php
/**
 * 文件Session类，用户ID作为KEY，可跨域名
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Session {
	/**
	 * 获取Session物理文件名
	 */
	private static function getSessionFile() {
		return LOG_PATH . Passport::GetLoginUid() . '.session';
	}
	/**
	 * 写 Session
	 * @param string $name
	 * @param string $value
	 */
	public static function Set ($name, $value) {
		$arr = self::Get();
		$arr[$name] = $value;
		file_put_contents(self::getSessionFile(), serialize($arr));
	}
	/**
	 * 读 Session
	 * @param string $name
	 */
	public static function Get($name = NULL) {
		$data = @file_get_contents(self::getSessionFile());
		$arr = unserialize($data);
		if (!is_array($arr))	$arr = array();
		if ($name) {
			return $arr[$name];
		}
		return $arr;
	}

}