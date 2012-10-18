<?php
/**
 * 搜狐微博开放平台
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class SohuAPI extends OpenAPI {
	const AUTHORIZE		= 'http://api.t.sohu.com/oauth/authorize';
	const RequestToken	= 'http://api.t.sohu.com/oauth/request_token';
	const AccessToken	= 'http://api.t.sohu.com/oauth/access_token';
	/**
	 * 构造函数
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 */
	function __construct($pid, $oauth_token = NULL, $oauth_token_secret = NULL) {
		$wt_open = new WTOpen();
		$app = $wt_open->getApp($pid, 'sohu');
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
		return $this->get('http://api.t.sohu.com/users/show.json');
	}
	/**
	 * 获取用户昵称
	 */
	public function getNick() {
		global $userInfo;
		$userInfo = $this->getUserInfo();
		return $userInfo['screen_name'];
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		global $userInfo;
		if (!$userInfo) {
			$userInfo = $this->getUserInfo();
		}
		$id = $userInfo['id'];
		return "http://t.sohu.com/u/$id";
	}
	/**
	 * 发布一条微博
	 * @param string $text		微博内容
	 * @param string $pic_path	微博图片，http URL
	 */
	public function upload( $text , $pic_path=NULL ) {
        $param = array();
        $param['status'] = urlencode($text);
        $action = 'update';
        if ($pic_path) {
        	$param['pic'] = '@'.$pic_path;
        	$action = 'upload';
        }

        usleep(200 * 1000);	// 防止网络不稳定，等待200毫秒再发送
        $ret = $this->post( "http://api.t.sohu.com/statuses/$action.json" , $param , $pic_path != NULL );
        if (!$ret) {
        	if (filesize($pic_path) > 1000 * 1024) {
        		return '上传图片超出限制(1Mb)!';
        	}
        	return '接口返回 NULL，一般是网络问题。';
        }
        if ($ret['code']) {
        	$error_code = intval($ret['code']);
			$my_error = '';
        	switch ($error_code) {
        		case 400:
        			$my_error = '重复发送！';
        			break;
        		case 401:
        			$my_error = '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
        			break;
        		default:
        			break;
        	}
        	return $ret['code'] . ': ' . $ret ['error'] . $my_error;
        }
        return true;
	}
}