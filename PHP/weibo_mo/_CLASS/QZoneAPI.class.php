<?php
/**
 * QQ空间日志开放平台
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class QZoneAPI extends OpenAPI {
	const AUTHORIZE		= 'http://openapi.qzone.qq.com/oauth/qzoneoauth_authorize';
	const RequestToken	= 'http://openapi.qzone.qq.com/oauth/qzoneoauth_request_token';
	const AccessToken	= 'http://openapi.qzone.qq.com/oauth/qzoneoauth_access_token';
	/**
	 * 构造函数
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 * @param int $openid					openid，目前只有QQ空间日志开放平台用到
	 */
	function __construct($pid, $oauth_token = NULL, $oauth_token_secret = NULL, $openid = NULL) {
		$wt_open = new WTOpen();
		$app = $wt_open->getApp($pid, 'qzone');
		$this->openid = $openid;
		$this->callback = $app['callback'];
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
		return $this->get("http://openapi.qzone.qq.com/user/get_user_info", array('openid'=>$this->openid));
	}
	/**
	 * 获取用户昵称
	 */
	public function getNick() {
		global $userInfo;
		$userInfo = $this->getUserInfo();
		return $userInfo['nickname'];
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		global $userInfo;
		if (!$userInfo) {
			$userInfo = $this->getUserInfo();
		}
		$id = $userInfo['uid'];
		return "http://qzone.qq.com";
	}
	/**
	 * 发布一篇QQ空间日志
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	public function publish($title, $content) {
        $param = array(
        	'title'		=> $title,
        	'content'	=> $content,
        	'openid'	=> $this->openid,
        );

        $ret = $this->post( "http://openapi.qzone.qq.com/blog/add_one_blog" , $param);
        if (!$ret)	return '接口返回 NULL，一般是网络问题。';
		if ($ret['ret'] == 0) {
			return true;
		}
		switch (intval($ret['ret'])) {
        	case -111:
        		return '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
			case 10:
				return '发表太快，被频率限制！';
			case 13:
				return '重复发送！';
			default:
				break;
		}
		return $ret['msg'];
	}
}