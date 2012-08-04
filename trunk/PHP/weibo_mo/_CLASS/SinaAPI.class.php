<?php
/**
 * 新浪微博开放平台
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class SinaAPI extends OAuth2 {
	const AUTHORIZE		= 'https://api.weibo.com/oauth2/authorize';
	const AccessToken	= 'https://api.weibo.com/oauth2/access_token';
	/**
	 * 构造函数
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 */
	function __construct($pid, $oauth_token = NULL, $oauth_token_secret = NULL) {
		$wt_open = new WTOpen ();
		$app = $wt_open->getApp ( $pid, 'sina' );
		parent::__construct ( $app ['app_key'], $app ['app_secret'], $oauth_token, $oauth_token_secret );
	}
	/**
	 * 获取Authorize接口地址
	 */
	function authorizeURL() {
		return self::AUTHORIZE;
	}
	/**
	 * 获取AccessToken接口地址
	 */
	function accessTokenURL() {
		return self::AccessToken;
	}
	/**
	 * 获取 AccessToken
	 * @param string $code
	 */
	public function getAccessToken($code) {
		$token = parent::getAccessToken($code);
		$this->uid = $token['uid'];
		return $token;
	}
	/**
	 * 获取用户信息
	 */
	public function getUserInfo() {
		return $this->get('https://api.weibo.com/2/users/show.json', array('uid' => $this->uid));
	}
	/**
	 * 获取用户昵称
	 */
	public function getNick() {
		global $userInfo;
		$userInfo = $this->getUserInfo ();
		if ($userInfo['error_code']) {
			return $userInfo ['error'];
		}
		return $userInfo['screen_name'];
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		global $userInfo;
		if (! $userInfo) {
			$userInfo = $this->getUserInfo ();
		}
		$id = $userInfo ['id'];
		return "http://weibo.com/$id/profile";
	}
	/**
	 * 发布一条微博
	 * @param string $text		微博内容
	 * @param string $pic_path	微博图片，http URL
	 */
	public function upload($text, $pic_path = NULL) {
		$param = array ();
		$param ['status'] = $text;
		$action = 'update';
		if ($pic_path) {
			$param ['pic'] = '@' . $pic_path;
			$action = 'upload';
		}

        usleep(200 * 1000);	// 防止网络不稳定，等待200毫秒再发送
		$ret = $this->post ( "https://api.weibo.com/2/statuses/$action.json", $param, $pic_path != NULL );
        if (!$ret)	return '服务器返回 NULL。';
		if (!!($error_code = $ret ['error_code'])) {
			$my_error = '';
			switch ($error_code) {
				case 21602 :
				case 20021 :
					$my_error = '内容包含非法关键字！';
					break;
				case 20012 :
				case 20013 :
					$my_error = '内容超过最大长度！';
					break;
				case 21315 :
				case 21316 :
				case 21317 :
				case 21327 :
				case 21332 :
					$my_error = '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
					break;
				case 21321 :
					$my_error = '超过<a href="http://open.weibo.com/wiki/Rate-limiting" target=_blank>接口访问限制</a>。';
					break;
				case 20017 :
				case 20019 :
					$my_error = '重复发送！';
					break;
				case 20005 :
				case 40045 :
					$my_error = '不支持的图片类型，仅支持: JPG, GIF, PNG!';
					break;
				case 40009 :
					$my_error = '上传图片出错！';
					break;
				default :
					break;
			}
			return $ret['error_code'] . ': ' . $ret ['error'] . $my_error;
		}
		return true;
	}
}