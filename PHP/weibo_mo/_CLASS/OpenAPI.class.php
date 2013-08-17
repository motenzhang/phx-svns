<?php
/**
 * 开放平台OAuth1.0基类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class OpenAPI extends WeiboOAuth {
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
		$this->token = NULL;
		$token = $this->getRequestToken($oauth_callback, $scope);

		$app_key_invalid = false;
		if (array_key_exists('Invalid signature', $token)) {
			$app_key_invalid = true;
		} else if ($token['oauth_problem'] == 'consumer not found') {
			$app_key_invalid = true;
		} else if ($token['error'] == 'token_rejected') {
			$app_key_invalid = true;
		} else if ($token['error_code'] == 11000) {
			$app_key_invalid = true;
		} else {
			$arr = explode(':', $token['error']);
	        $error_code = intval($arr[0]);
			switch ($error_code) {
				case 40109:
				case 40111:
					$app_key_invalid = true;
					break;
			}
		}
		if ($app_key_invalid) {
			return 'App Key 无效，请到平台设定修改。<span style="color:#fff">' . print_r($token, true) . '</span>';
		}

		if (empty($token['oauth_token'])) {
			Log::customLog('oauth_error.txt', '获取 RequestToken 失败！
请求信息：' . print_r($this, true));
			return '获取 RequestToken 失败！请稍后再试。<span style="color:#ccc">' . print_r($token, true) . '</span>';
		}
		$oauth_callback = urlencode($oauth_callback);
		return $this->authorizeURL() . "?oauth_callback=$oauth_callback&oauth_consumer_key={$this->consumer->key}&oauth_token=" . $token['oauth_token'];
	}
	/**
	 * 测试AccessToken是否还有效
	 */
	public function Test() {
		return $this->getNick() != NULL;
	}

}