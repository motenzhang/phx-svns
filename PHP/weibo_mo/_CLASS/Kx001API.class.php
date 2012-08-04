<?php
/**
 * 开心001开放平台
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Kx001API extends OpenAPI {
	const AUTHORIZE		= 'http://api.kaixin001.com/oauth/authorize';
	const RequestToken	= 'http://api.kaixin001.com/oauth/request_token';
	const AccessToken	= 'http://api.kaixin001.com/oauth/access_token';
	/**
	 * 构造函数
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 */
	function __construct($pid, $oauth_token = NULL, $oauth_token_secret = NULL) {
		$wt_open = new WTOpen();
		$app = $wt_open->getApp($pid, 'kx001');
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
		return $this->get('http://api.kaixin001.com/users/me.json');
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
		$id = $userInfo['uid'];
		return "http://www.kaixin001.com/home/?uid=$id";
	}
	/**
	 * 发布一条开心记录
	 * @param string $text		微博内容
	 * @param string $pic_path	微博图片，http URL
	 */
	public function upload( $text , $pic_path=NULL ) {
        $param = array();
        $param['content'] = $text;
        if ($pic_path) {
        	$param['pic'] = '@'.$pic_path;
        }

        $ret = $this->post( "http://api.kaixin001.com/records/add.json" , $param , $pic_path != NULL );
        if (!$ret)	return '服务器返回 NULL。';
        if ($ret['error_code']) {
        	$arr = split(':', $ret['error']);
        	$error_code = intval($arr[0]);
        	switch ($error_code) {
        		case 40302:
        			return '请求的权限范围超过了数据拥有者所授予的权限范围！';
        		case 40072:
        		case 40101:
        			return '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
        		case 40033:
        			return '短期间内发表了内容重复的记录';
        		case 40034:
        			return '10秒内只能发一篇！';
        		case 40031:
        			return '上传图片出错！';
        		default:
        			break;
        	}
        	return $ret['error'];
        }
        return true;
	}
	/**
	 * 发布一条feed
	 * @param string $text		内容
	 * @param string $pic_path	图片
	 */
	public function feed( $text , $pic_path=NULL ) {
        $param = array();
        $param['text'] = $text;

        $ret = $this->post( "http://api.kaixin001.com/feed/send.json" , $param , $pic_path != NULL );
        //var_dump($ret);
        if (!$ret)	return '服务器返回 NULL。';
        if ($ret['error_code']) {
        	$arr = explode(':', $ret['error']);
        	$error_code = intval($arr[0]);
        	switch ($error_code) {
        		case 40302:
        			return '请求的权限范围超过了数据拥有者所授予的权限范围！';
        		case 40072:
        		case 40101:
        			return '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
        		case 40025:
        			return '重复发送！';
        		case 40045:
        			return '不支持的图片类型，仅支持: JPG, GIF, PNG!';
        		default:
        			break;
        	}
        	return $ret['error'];
        }
        return true;
	}
	/**
	 * 发布一条开心001日志
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	public function publish($title, $content) {
        $param = array(
        	'title'		=> $title,
        	'content'	=> $content,
        );

        $ret = $this->post( "http://api.kaixin001.com/diary/create.json" , $param);
        //var_dump($ret);
        if (!$ret)	return '服务器返回 NULL。';
        if ($ret['error_code']) {
        	$arr = split(':', $ret['error']);
        	$error_code = intval($arr[0]);
        	switch ($error_code) {
        		case 40002:
        			return '用户调用次数超过限制！';
        		case 40072:
        		case 40101:
        			return '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
        		case 40025:
        			return '重复发送！';
        		case 4000801:
        			return '日记标题为空！';
        		case 4000805:
        			return '日记发表频率超过限制！';
        		default:
        			break;
        	}
        	return $ret['error'];
        }
        return true;
	}
}