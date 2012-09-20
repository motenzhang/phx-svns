<?php
/**
 * 人人小站模拟登录发送类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2012-8
 */
class RenrenZhan extends SimulaLogin {
	private $blogname;
	/**
	 * 构造函数
	 * @param string $username	用户名
	 * @param string $password	密码
	 * @param string $blogname	人人小站个性域名
	 */
	function __construct($pid, $username, $password, $blogname) {
		parent::__construct($pid, $username, $password);
		$this->blogname = $blogname;
	}
	/**
	 * 获取登录验证码
	 */
	public function showCode() {
		echo $this->get('http://icode.renren.com/getcode.do?t=web_login');
	}
	/**
	 * 模拟登录
	 */
	public function Login($verify_code = NULL) {
		if (empty($this->blogname)) {
			return '绑定账号失败：请填写个性域名';
		}
		$data = array(
			//'_rtk'		=> '2fb9d77e',
			'autoLogin'	=> 'true',
			'captcha_type'	=> 'web_login',
			//'domain'	=> 'renren.com',
			'email'		=> $this->account['username'],
			//'key_id'	=> 1,
			'origURL'	=> 'http://zhan.renren.com/home',
			'password'	=> $this->account['password'],
		);
		if ($verify_code) {
			$data['icode'] = $verify_code;
		}
		$ret = $this->post("http://www.renren.com/ajaxLogin/login", $data);
		if (!$ret['code']) {
			return '绑定账号失败：' . $ret['failDescription'];
		}
		$this->get($ret['homeUrl']);
		return true;
	}
	/**
	 * 退出登录
	 */
	public function Logout() {
		$ret = $this->get("http://www.renren.com/Logout.do?origURL=http://zhan.renren.com/login");
		return $ret;
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		return "http://zhan.renren.com/{$this->blogname}";
	}
	/**
	 * 发布一篇博客
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	protected function _publish($title, $content) {
		$rtk = $this->getMatch1("#get_check:'(.+?)'#", $this->get($this->getUrl()));
		if (empty($rtk)) {
			return '模拟登录已过期或个性域名填写错误！需重新<a href="bind.php">绑定账号</a>。';
		}
		$url = "http://zhan.renren.com/{$this->blogname}/word/create";
		if (preg_match_all('#<img .*?src="(.+?)".*?>#i', $content, $matches)) {
			foreach ($matches[1] as $img) {
				$mappath = UPLOAD_PATH . basename($img);
				$upload_data = array(
					'theFile'	=> "@$mappath",
				);
				$this->referer = $url;
				$ret = $this->post("http://upload.renren.com/uploadblog.do", $upload_data, 'UTF-8', true);
				$ret = @json_decode($this->getMatch1('#\[\{(.*?)\}\]#', $ret), true);
				if ($ret[0] && $ret[0]['url']) {
					$content = str_replace($img, $ret[0]['url'], $content);
				}
			}
		}
		$param = array(
			'subject'	=> $title,
			'body'		=> $content,
			'_rtk'		=> $rtk,
		);
		$ret = $this->post($url, $param);
        if (!$ret)	return '服务器返回 NULL。';
        if (start_with($this->http_code, '40')) {
        	return '模拟登录已过期！需重新<a href="bind.php">绑定账号</a>。';
        }
        if ($ret['code'] != 0) {
        	if ($ret['msg']) {
        		return $ret['msg'];
        	} else {
				Log::customLog('renren_zhan_error.txt', '发布失败：' . print_r($param, true) . print_r($this->http_header, true) . print_r($ret, true));
	        	return '发布失败，详细原因请参阅<a href="_LOG/renren_zhan_error.txt" target="_blank">renren_zhan_error.log</a>。';
        	}
        }
        return true;
	}

}