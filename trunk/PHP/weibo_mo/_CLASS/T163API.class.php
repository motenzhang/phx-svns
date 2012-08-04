<?php
/**
 * 网易微博开放平台
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class T163API extends OpenAPI {
	const AUTHORIZE		= 'http://api.t.163.com/oauth/authenticate';
	const RequestToken	= 'http://api.t.163.com/oauth/request_token';
	const AccessToken	= 'http://api.t.163.com/oauth/access_token';
	/**
	 * 构造函数
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 */
	function __construct($pid, $oauth_token = NULL, $oauth_token_secret = NULL) {
		$wt_open = new WTOpen();
		$app = $wt_open->getApp($pid, 't_163');
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
		return $this->get('http://api.t.163.com/users/show.json');
	}
	/**
	 * 获取用户昵称
	 */
	public function getNick() {
		global $userInfo;
		$userInfo = $this->getUserInfo();
		return $userInfo['name'];
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		global $userInfo;
		if (!$userInfo) {
			$userInfo = $this->getUserInfo();
		}
		$id = $userInfo['screen_name'];
		return "http://t.163.com/$id/home/mine";
	}
	/**
	 * 发布一条微博
	 * @param string $text		微博内容
	 * @param string $pic_path	微博图片，http URL
	 */
	public function upload( $text , $pic_path=NULL ) {
        $param = array();
        $param['source'] = $this->consumer->key;
        $param['status'] = $text;
        $action = 'update';
        if ($pic_path) {
        	$param['pic'] = '@'.$pic_path;
        	$ret = $this->post( "http://api.t.163.com/statuses/upload.json" , $param , $pic_path != NULL );
        	if ($ret['upload_image_url']) {
        		$param['status'] .= $ret['upload_image_url'];
        	}
        }

        $ret = $this->post( "http://api.t.163.com/statuses/$action.json" , $param , $pic_path != NULL );
        if (!$ret)	return '服务器返回 NULL。';
        if ($ret['error_code']) {
        	$error_code = intval($ret['error_code']);
			$my_error = '';
			switch ($error_code) {
        		case 401:
        			$my_error = '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
        			break;
        		default:
        			break;
        	}
        	return $ret['error_code'] . '|' . $ret['message_code'] . ': ' . $ret ['error'] . $my_error;
        }
        return true;
	}
}