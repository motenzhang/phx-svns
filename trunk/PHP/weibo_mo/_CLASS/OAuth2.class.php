<?php
/**
 * 开放平台OAuth2.0基类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2012-3
 */
class OAuth2 extends WeiboOAuth {
	/**
	 * 构造函数
	 * @param string $consumer_key			APP KEY,申请的
	 * @param string $consumer_secret		APP SECRET，申请的
	 * @param string $oauth_token			AccessToken 之后拿到的token
	 * @param string $oauth_token_secret	AccessToken 之后拿到的token_secret
	 * @param int $openid					AccessToken 之后拿到的openid, 只有QQ空间日志用到
	 */
	function __construct($consumer_key, $consumer_secret, $oauth_token = NULL, $oauth_token_secret = NULL
						, $openid = NULL) {
		parent::__construct($consumer_key, $consumer_secret, $oauth_token, $oauth_token_secret, $openid);
	}
	/**
	 * 获取登录URL
	 * @param string $oauth_callback	登录回调url
	 * @param string $scope				权限标志，只有开心001用到
	 */
	public function GetAuthorizationUrl($oauth_callback, $scope = NULL) {
		Session::Set('redirect_uri', $oauth_callback);
		$oauth_callback = urlencode($oauth_callback);
		return $this->authorizeURL() . "?redirect_uri=$oauth_callback&client_id={$this->consumer->key}&response_type=code&scope={$scope}";
	}

	public function getAccessToken($code) {
		$params = array(
			'grant_type'	=> 'authorization_code',
			'client_id'		=> $this->consumer->key,
			'redirect_uri'	=> Session::Get('redirect_uri'),
			'client_secret'	=> $this->consumer->secret,
			'code'			=> $code,
		);
		$response = parent::http($this->accessTokenURL(), 'POST', $params);
        if ($this->format === 'json' && $this->decode_json) {
        	$response = json_decode($response, true);
        	$response['oauth_token'] = $response['access_token'];
        	$response['oauth_token_secret'] = $response['refresh_token'];
        	$this->token = new OAuthConsumer($response['oauth_token'], $response['oauth_token_secret']);
        	return $response;
        }
        return $response;
	}

	public function http($url, $method, $params = NULL , $multi = false) {
		$params = array_merge($params, array(
			'access_token'	=> $this->token->key,
		));
		$response = parent::http($url, $method, $params , $multi);
        if ($this->format === 'json' && $this->decode_json) {
        	$response = json_decode($response, true);
        }
        return $response;
	}

	public function get($url, $params) {
		return $this->http($url, 'GET', $params);
	}

	public function post($url, $params, $multi = false) {
		return $this->http($url, 'POST', $params, $multi);
	}
}
