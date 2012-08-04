<?php
/**
 * 人人网开放平台
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2012-3
 */
class RenrenAPI extends OAuth2 {
	const AUTHORIZE		= 'https://graph.renren.com/oauth/authorize';
	const AccessToken	= 'https://graph.renren.com/oauth/token';
	/**
	 * 构造函数
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 */
	function __construct($pid, $oauth_token = NULL, $oauth_token_secret = NULL, $openid = NULL) {
		$wt_open = new WTOpen();
		$app = $wt_open->getApp($pid, 'renren');
		$this->openid = $openid;
		parent::__construct($app['app_key'], $app['app_secret'], $oauth_token, $oauth_token_secret);
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
	 * OAuth2.0 签名算法
	 * @param array$arr
	 */
	function generateSignature($arr) {
		ksort($arr);
		reset($arr);
		$str = '';
		foreach($arr AS $k=>$v){
			$arr[$k] = $v;//转码，你懂得
			$str .= $k.'='.$v;
		}
		$str = md5($str . $this->consumer->secret);
		return $str;
	}
	/**
	 * 获取 AccessToken
	 * @param string $code
	 */
	public function getAccessToken($code) {
		$token = parent::getAccessToken($code);
        $list = $this->execute('pages.getManagedList');
        if ($list != NULL && !$list['error_code']) {
        	$this->openid = $token['openid'] = $list[0]['page_id'];
        	$this->nick = $list[0]['name'];
        } else {
        	unset($token['oauth_token']);
        	$token['error_msg'] = $list['error_msg'] ? $list['error_msg'] : '当前用户没有管理任何公共主页';
        }
		return $token;
	}
	/**
	 * 执行 人人网 API
	 * @param string $method
	 * @param array $params
	 */
	public function execute($method, $params = array()) {
		$params = array_merge(array(
			'api_key'	=> $this->consumer->key,
			'method'	=> $method,
			'v'			=> '1.0',
			'format'	=> 'JSON',
			'access_token'=> $this->token->key,
		), $params);
		$params['sig'] = $this->generateSignature($params);
		$response = $this->http('http://api.renren.com/restserver.do', 'POST', $params);
		return $response;
	}
	public function Test() {
		return true;
	}
	/**
	 * 获取用户昵称
	 */
	public function getNick() {
		return $this->nick;
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		return "http://page.renren.com/{$this->openid}/note";
	}
	/**
	 * 发布一条人人网公共主页日志
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	public function publish($title, $content) {
        $param = array(
        	'title'		=> $title,
        	'content'	=> $content,
        	'page_id'	=> $this->openid,
        );

		$ret = $this->execute('blog.addBlog', $param);
        if (!$ret)	return '服务器返回 NULL。';
        if ($ret['error_code']) {
			switch ($ret['error_code']) {
				case 2002 :
					return '账号绑定已过期！需重新<a href="bind.php">绑定账号</a>。';
				default :
					break;
			}
        	return $ret['error_code'] . ':' . $ret['error_msg'];
        }
        return true;
	}
}