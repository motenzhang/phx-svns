<?php
/**
 * 账户绑定表读写类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class ThirdAccount extends DaoAbstract {
	protected $tableName = 'wt_third_account';
	/**
	 * 获取账户绑定信息
	 * @param int $uid		用户ID
	 * @param string $type	第三方平台类型
	 * @param int $pid		自建平台ID
	 */
	public function getThird($uid, $type, $pid) {
		$condition = array(
			'uid'	=> $uid,
			'type'	=> $type,
		);
		if ($pid > 0)	$condition['pid'] = $pid;
		return $this->fetchOne($condition);
	}
	/**
	 * 获取登录账户绑定信息
	 * @param string $type	第三方平台类型
	 * @param int $pid		自建平台ID
	 */
	public function getByType($type, $pid = 0, $uid = NULL) {
		$uid = if_null($uid, Passport::GetLoginUid());
		return $this->getThird($uid, $type, $pid);
	}
	/**
	 * 更新账户有效状态
	 * @param string $type	第三方平台类型
	 */
	public function fail($third, $error_msg = NULL) {
		$pid = $third['pid'];
		$type = $third['type'];
		ob_start();
		debug_print_backtrace();
		$trace = ob_get_contents();
		ob_clean();
		Log::customLog('token_expires_error.log', $this->rep_platform("Token 过期，平台：{pid}|{type}, {platform}，{weibo}，原因：{$error_msg}\r\n调用堆栈：\r\n{$trace}", $pid, $type));
		$mail = Config::get_mail('token_expire');
		sendmail($mail['to'], $this->rep_platform($mail['subject'], $pid, $type), $this->rep_platform($mail['content'], $pid, $type) . "<br>原因：{$error_msg}");
		return $this->update(array('valid'=>0), array('pid'=>$pid, 'type'=>$type));
	}
	/**
	 * 模板替换
	 * @param string $str
	 * @param int $pid
	 * @param string $type
	 */
	private function rep_platform($str, $pid, $type) {
		$wt = new WTOpen();
		$ret = $wt->get($pid);
		$str = str_ireplace('{platform}', $ret['name'], $str);
		$str = str_ireplace('{weibo}', Config::get_name($type), $str);
		$str = str_ireplace('{pid}', $pid, $str);
		$str = str_ireplace('{type}', $type, $str);
		return $str;
	}
	/**
	 * 拷贝第一个管理员的Token
	 * @param int $uid
	 * @param array $perms
	 */
	public function copyToken($uid, $perms) {
		$user = new User();
		$admin = $user->getFirstAdmin();
		$tokens = $this->findBy(array(
			'uid'	=> $admin['id'],
			'pid'	=> $perms,
		), $this->primary_key);

		foreach ($tokens as $item) {
			unset($item['id']);
			$item['uid'] = $uid;
			$this->replace($item);
		}
	}
}