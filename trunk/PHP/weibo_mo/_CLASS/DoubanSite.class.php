<?php
/**
 * 豆瓣小站模拟登录发送类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2012-3
 */
class DoubanSite extends SimulaLogin {
	private $blogname;
	/**
	 * 构造函数
	 * @param string $username	用户名
	 * @param string $password	密码
	 * @param string $blogname	点点网博客名
	 */
	function __construct($pid, $username, $password, $blogname) {
		parent::__construct($pid, $username, $password);
		$this->blogname = $blogname;
	}
	/**
	 * 获取登录验证码
	 */
	public function showCode() {
		$ret = $this->get('http://www.douban.com/accounts/login?error=requirecaptcha');
		$captcha = $this->getMatch1('#<img.*? src="(.+?)" alt="captcha"#i', $ret);
		$captcha_id = $this->getMatch1('#name="captcha-id" value="(.*?)"#i', $ret);
		Session::Set('douban_chapcha_id', $captcha_id);
		echo $this->get(urldecode($captcha));
	}
	/**
	 * 模拟登录
	 */
	public function Login($verify_code = NULL) {
		if (empty($this->blogname)) {
			return '绑定账号失败：请填写Widget ID';
		}
		$data = array(
			'form_email'	=> $this->account['username'],
			'form_password'	=> $this->account['password'],
			'redir'			=> 'http://success',
			'remember'		=> 'on',
		);
		if ($verify_code) {
			$data['captcha-solution'] = $verify_code;
			$data['captcha-id'] = Session::Get('douban_chapcha_id');
		}
		$ret = $this->post("https://www.douban.com/accounts/login", $data);
		if (str_contains($this->http_header['Location'], 'requirecaptcha')
			|| str_contains($this->http_header['Location'], 'error=1011')) {
			return '绑定账号失败：请输入验证码';
		}
		if ($this->http_header['Location'] != $data['redir']) {
			return '绑定账号失败：用户名或密码错误';
		}
		return true;
	}
	/**
	 * 退出登录
	 */
	public function Logout() {
		$ck = $this->getcookie('ck', '.douban.com');
		$ret = $this->get("http://www.douban.com/accounts/logout?ck=$ck");
		return $ret;
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		return "http://site.douban.com/widget/notes/{$this->blogname}/";
		//return "http://www.douban.com/site/";
	}
	/**
	 * 发布一篇博客
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	protected function _publish($title, $content) {
		$url = "http://site.douban.com/widget/notes/{$this->blogname}/create";
		$ret = $this->get($url);
		$ck = $this->getMatch1('#name="ck".*? value="(.*?)"#', $ret);
		$nid = $this->getMatch1('#name="note_id".*? value="(.*?)"#', $ret);
		if (empty($nid)) {
			return '模拟登录已过期或Widget ID填写错误！需重新<a href="bind.php">绑定账号</a>。';
		}

		$param = array(
			'ck'			=> $ck,
			'note_id'		=> $nid,
			'note_title'	=> $title,
			'note_text'		=> $content,
			'note_submit'	=> '发表',
        );

        if (preg_match_all('#<img .*?src="(.+?)".*?>#i', $content, $matches)) {
			foreach ($matches[1] as $img) {
				$mappath = UPLOAD_PATH . basename($img);
				$upload_data = array(
					'image_file'	=> "@$mappath",
					'note_id'	=> $nid,
        			'ct'	=> 'text',
					'ck'	=> $ck,
				);
				$this->referer = $url;
				$ret = $this->post("http://site.douban.com/j/note/add_photo", $upload_data, 'UTF-8', true);
				$seqid = $ret['photo']['seq'];
				if ($seqid) {
					$content = preg_replace('#<img .*?src="' . preg_quote($img) . '".*?>#i', "[图片{$seqid}]", $content);
					$param["p{$seqid}_layout"] = 'C';
					$param["p{$seqid}_title"] = '';
				}
			}
		}
		$param['note_text'] = preg_replace('#\[(图片\d+)\]#', '<$1>', html_decode($content));
		$ret = $this->post($url, $param);
        if (!$ret)	return '服务器返回 NULL。';
        if (start_with($this->http_code, '40')) {
        	return '模拟登录已过期！需重新<a href="bind.php">绑定账号</a>。';
        }
        if (empty($this->http_header['Location'])) {
			Log::customLog('douban_site_error.txt', '发布失败：' . print_r($param, true) . print_r($this->http_header, true) . $ret);
        	return '发布失败，详细原因请参阅<a href="_LOG/douban_site_error.txt" target="_blank">douban_site_error.log</a>。';
        } else if (str_contains($this->http_header['Location'], $nid)) {
			Log::customLog('douban_site_error.txt', '发布成功：' . print_r($param, true) . print_r($this->http_header, true) . $ret);
        	return true;
        }
	}

}