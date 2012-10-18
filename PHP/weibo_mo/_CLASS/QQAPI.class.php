<?php
/**
 * 腾讯微博开放平台
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class QQAPI extends OpenAPI {
	const AUTHORIZE		= 'https://open.t.qq.com/cgi-bin/authorize';
	const RequestToken	= 'https://open.t.qq.com/cgi-bin/request_token';
	const AccessToken	= 'https://open.t.qq.com/cgi-bin/access_token';
	/**
	 * 构造函数
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 */
	function __construct($pid, $oauth_token = NULL, $oauth_token_secret = NULL) {
		$wt_open = new WTOpen();
		$app = $wt_open->getApp($pid, 'qq');
		parent::__construct($app['app_key'], $app['app_secret'], $oauth_token, $oauth_token_secret);
	}
	/**
	 * 获取RequestToken接口地址
	 */
	function requestTokenURL() {
		return self::RequestToken;
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
	 * 获取用户信息
	 */
	public function getUserInfo() {
		return $this->get('http://open.t.qq.com/api/user/info');
	}
	/**
	 * 获取用户昵称
	 */
	public function getNick() {
		global $userInfo;
		$userInfo = $this->getUserInfo();
		return $userInfo['data']['nick'];
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		global $userInfo;
		if (!$userInfo) {
			$userInfo = $this->getUserInfo();
		}
		$id = $userInfo['data']['name'];
		return "http://t.qq.com/$id";
	}
	/**
	 * 发布一条微博
	 * @param string $text		微博内容
	 * @param string $pic_path	微博图片，http URL
	 */
	public function upload($text, $pic_path = NULL) {
		$param = array ();
		$param ['content'] = $text;
		$action = 'add';
		if ($pic_path) {
			$param ['pic'] = '@' . $pic_path;
			$action = 'add_pic';
		}

		usleep(200 * 1000);	// 防止网络不稳定，等待200毫秒再发送
		$ret = $this->post ( "http://open.t.qq.com/api/t/$action", $param, $pic_path != NULL );
        if (!$ret)	return '接口返回 NULL，一般是网络问题。';
		//var_dump($ret);
		if ($ret['ret'] == 0) {
			return true;
		}
		$my_error = '';
		switch ($ret['ret']) {
			case 2:
				$my_error = '频率受限';
				break;
			case 3:
				$my_error = '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
				break;
			case 4:
				switch ($ret['errcode']) {
					case 4:
						$my_error = '有过多脏话';
						break;
					case 5:
						$my_error = '禁止访问，如城市，uin黑名单限制等';
						break;
					case 8:
						$my_error = '内容超过最大长度：420字节 （以进行短url处理后的长度计）';
						break;
					case 9:
						$my_error = '包含垃圾信息：广告，恶意链接、黑名单号码等';
						break;
					case 10:
						$my_error = '发表太快，被频率限制';
						break;
					case 12:
						$my_error = '源消息审核中';
						break;
					case 13:
						$my_error = '重复发表';
						break;
					case 14:
						$my_error = '未实名认证';
						break;
				}
				break;
			case 7:
				$my_error = '未实名认证';
				break;
		}
		return $ret['ret'] . ': ' . $ret['errcode'] . ': ' . $ret['msg'] . $my_error;
	}
}