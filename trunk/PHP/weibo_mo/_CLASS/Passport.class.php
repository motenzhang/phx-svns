<?php
/**
 * 用户通行证类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Passport {
	const CookieKey = 'KM.PASSPORT.MEMBER';
	/**
	 * 登录
	 * @param string $username	用户名
	 * @param string $password	密码
	 */
	public function Login ($username, $password) {
		$user = new User();
		$ret = $user->getByName($username);
		if (!$ret) {
			return '用户名不存在！';
		}
		if ($ret['password'] != $password) {
			return '密码错误！';
		}
		$user->update(array('last_login'=>time()), $ret);
		return self::WriteCookie($ret['id'], $ret['username'], $ret['type']);
	}
	/**
	 * 退出
	 */
	public function LogOff () {
		setcookie(self::CookieKey, '', 0);
	}
	/**
	 * 判断是否登录
	 */
	public static function IsLogin () {
		return self::GetLoginUid() > 0;
	}
	/**
	 * 判断未登录，则跳转到登陆页
	 */
	public static function RequireLogin () {
		if (!Passport::IsLogin()) {
			redirect('login.php?return_url=' . urlencode($_SERVER['REQUEST_URI']));
			exit('尚未登录，<a href="login.php?return_url=' . urlencode($_SERVER['REQUEST_URI']) . '">请登录</a>！');
		}
	}
	/**
	 * 获取登录用户UID，从cookie读取
	 */
	public static function GetLoginUid () {
		$info = self::GetLoginInfo();
		return intval($info['uid']);
	}
	/**
	 * 获取登录用户名
	 */
	public static function GetLoginName () {
		$info = self::GetLoginInfo();
		return $info['id'];
	}
	/**
	 * 判断是否是管理员
	 */
	public static function IsAdmin () {
		$info = self::GetLoginInfo();
		return $info['type'] == 1;
	}
	/**
	 * 写登录Cookie
	 * @param int $uid			用户ID
	 * @param string $username	用户名
	 * @param int $type			用户类型
	 * @param string $sign		签名，传入时才判断
	 */
	public static function WriteCookie ($uid, $username, $type, $sign = NULL) {
        $guid = md5(base64_encode($uid) . strlen($uid));
		$pwd = md5(base64_encode($username) . strlen($username));
        $passport_member = array(
            'guid'	=> $guid,
            'uid'   => $uid,
        	'id'    => $username,
            'pwd'   => $pwd,
            'type'  => $type,
        	'sign'  => md5(substr(md5($pwd), 0, 20) . substr(md5($username . $uid . $guid . $type), 10, 20)),
        );
        if ($sign) {
        	if ($sign != $passport_member['sign']) {
        		return;
        	}
        }
        $ym_cookie = http_build_query($passport_member);
        $expires = time() + 60*60*24*7;
        setcookie(self::CookieKey, $ym_cookie, $expires);
        return $passport_member;
	}
	/**
	 * 从Cookie解析登录信息
	 */
	public function GetLoginInfo () {
		$enc_passpott = $_COOKIE ['KM_PASSPORT_MEMBER'];
		if (empty($enc_passpott))	$enc_passpott = $_GET['key'];
		parse_str($enc_passpott, $info);
		$sign = md5(substr(md5($info['pwd']), 0, 20) . substr(md5($info['id'] . $info['uid'] . $info['guid'] . $info['type']), 10, 20));
		if ($info['sign'] == $sign) {
			return $info;
		}
		return false;
	}

}