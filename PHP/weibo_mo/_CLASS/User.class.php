<?php
/**
 * User表读写类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class User extends DaoAbstract {
	protected $tableName = 'wt_user';
	/**
	 * 按用户名查找
	 * @param string $username
	 */
	public function getByName($username) {
		return $this->fetchOne(array('username' => $username));
	}
	/**
	 * 获取指定用户权限
	 * @param int $id	用户ID
	 */
	public function getPerms($id) {
		$info = $this->get($id);
		$perms = unserialize($info['perms']);
		if (!is_array($perms)) {
			$perms = array();
		}
		return $perms;
	}
	/**
	 * 获得第一个管理员
	 */
	public function getFirstAdmin() {
		return $this->fetchOne(array('type'=>1), '*', 'id asc');
	}
}