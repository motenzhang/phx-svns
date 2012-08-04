<?php
/**
 * 平台表读写类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class WTOpen extends DaoAbstract {
	protected $tableName = 'wt_open';
	/**
	 * 按平台名称获取信息
	 * @param string $name	平台名称
	 */
	public function getByName($name) {
		return $this->fetchOne ( array ('status' => 0, 'pid' => 0, 'name' => $name ) );
	}
	/**
	 * 获取APP key 信息
	 * @param int $pid	平台ID
	 * @param string $name	第三方平台配置key
	 */
	public function getApp($pid, $name) {
		return $this->fetchOne ( array ('pid' => $pid, 'name' => $name ) );
	}
	/**
	 * 按权限获取平台列表
	 * @param bool $perm	按不按当前登录用户权限
	 */
	public function getPlatformList($perm = TRUE) {
		$list = $this->findBy ( array ('status' => 0, 'pid' => 0 ), 'id' );
		if (! $perm || Passport::IsAdmin()) {
			return $list;
		}
		$new_list = array ();
		$user = new User ();
		$perms = $user->getPerms ( Passport::GetLoginUid () );
		foreach ( $list as $key => $value ) {
			if (array_key_exists ( $key, $perms )) {
				$new_list [$key] = $value;
			}
		}
		return $new_list;
	}
	/**
	 * 按平台和权限获取微博列表
	 * @param int $pid
	 * @param bool $perm
	 */
	public function getWeiboList($pid = 0, $perm = TRUE) {
		if ($pid == 0) {
			return array ();
		}
		if ($perm) {
			$user = new User ();
			$perms = $user->getPerms ( Passport::GetLoginUid () );
			if (! array_key_exists ( $pid, $perms )) {
				return array ();
			}
		}
		$list = Config::weibo_list ();
		if ($pid > 0) {
			$set_list = $this->findBy ( array ('status' => 1, 'pid' => $pid ), 'name' );
			$new_list = array ();
			foreach ( $list as $key => $value ) {
				if (array_key_exists ( $key, $set_list )
					|| array_key_exists($key, Config::simula_list())) {
					$new_list [$key] = $value;
				}
			}
			$list = $new_list;
		} else {
			foreach ( $list as $key => $value ) {
				if (array_key_exists ( $key, Config::open_list () )) {
					unset ( $list [$key] );
				}
			}
		}
		return $list;
	}
	/**
	 * 按平台和权限获取博客列表
	 * @param int $pid
	 * @param bool $perm
	 */
	public function getBlogList($pid = 0, $perm = TRUE) {
		if ($pid == 0) {
			return array ();
		}
		if ($perm) {
			$user = new User ();
			$perms = $user->getPerms ( Passport::GetLoginUid () );
			if (! array_key_exists ( $pid, $perms )) {
				return array ();
			}
		}
		$list = Config::blog_list ();
		if ($pid > 0) {
			$set_list = $this->findBy ( array ('status' => 1, 'pid' => $pid ), 'name' );
			$new_list = array ();
			foreach ( $list as $key => $value ) {
				if (array_key_exists ( $key, $set_list )
					|| array_key_exists($key, Config::simula_list())) {
					$new_list [$key] = $list [$key];
				}
			}
			$list = $new_list;
		} else {
			foreach ( $list as $key => $value ) {
				if ($key == 'qzone_simula') {
					//	只要设定任何一个 qzone APPKEY，qzone模拟登录就关闭
					if ($this->fetchOne ( array ('status' => 1, 'name' => 'qzone' ) )) {
						unset ( $list [$key] );
						continue;
					}
				}
				if (array_key_exists ( $key, Config::open_list () )) {
					unset ( $list [$key] );
				}
			}
		}
		return $list;
	}
	/**
	 * 获取回调地址域名列表
	 */
	public function getCallbackList() {
		$list = $this->findBy ( null, null, null, 'callback' );
		$new_list = array ();
		foreach ( $list as $value ) {
			if (! $value ['callback']) {
				continue;
			}
			$parts = parse_url ( $value ['callback'] );
			if ($parts ['host']) {
				$new_list [] = $parts ['host'];
			} else {
				$new_list [] = $value ['callback'];
			}
		}
		return $new_list;
	}
}