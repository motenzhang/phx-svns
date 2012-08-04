<?php
/**
 * 创建API工厂类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Factory {
	/**
	 * 创建API类
	 * @param string $type					类型，第三方平台列表配置的key
	 * @param int $pid						自建平台ID
	 * @param string $oauth_token			oauth方式的token 或者模拟登录的用户名
	 * @param string $oauth_token_secret	oauth方式的token_secret 或者模拟登录的密码
	 * @param string $blogname				博客名，目前只有点点网使用
	 * @param int $openid					openid，目前只有QQ空间日志开放平台用到
	 */
	public static function CreateAPI($type, $pid = 0, $oauth_token = NULL, $oauth_token_secret = NULL
									, $blogname = NULL, $openid = NULL) {
		switch ($type) {
			case 'qq' :
				$api = new QQAPI ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 'sohu' :
				$api = new SohuAPI ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 't_163' :
				$api = new T163API ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 'kx001' :
				$api = new Kx001API ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 'b_163' :
				$api = new B163API ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 'qzone' :
				$api = new QZoneAPI ( $pid, $oauth_token, $oauth_token_secret, $openid );
				break;
			case 'qzone_simula' :	// 走模拟登录
				$api = new QZoneSimulaAPI ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 'diandian' :
				$api = new DianAPI ( $pid, $oauth_token, $oauth_token_secret, $blogname );
				break;
			case 'i_sohu' :
				$api = new iSohuAPI ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 'sina_blog' :
				$api = new SinaBlog ( $pid, $oauth_token, $oauth_token_secret );
				break;
			case 'renren' :
				$api = new RenrenAPI ( $pid, $oauth_token, $oauth_token_secret, $openid );
				break;
			case 'douban' :
				$api = new DoubanSite ( $pid, $oauth_token, $oauth_token_secret, $blogname );
				break;
			case 'renren_zhan' :
				$api = new RenrenZhan ( $pid, $oauth_token, $oauth_token_secret, $blogname );
				break;
			default :
				$api = new SinaAPI ( $pid, $oauth_token, $oauth_token_secret );
				$api->type = 'sina';
				break;
		}
		if (! isset ( $api->type ))
			$api->type = $type;
		return $api;
	}
	/**
	 * 从数据库信息创建API类
	 * @param string $type		类型，第三方平台列表配置的key
	 * @param int $pid			自建平台ID
	 * @param array $oauth_info 账号绑定信息
	 */
	public static function CreateAPI2($type, $pid, $oauth_info) {
		return self::CreateAPI ( $type, $pid, $oauth_info ['token'], $oauth_info ['token_secret']
								, $oauth_info['blogname'], $oauth_info['openid'] );
	}
}

