<?php
/**
 * 点点网模拟登录发送类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class DianAPI extends SimulaLogin {
	/**
	 * 保存博客名，点点网每个账户支持多博客
	 * @var $blogname string
	 */
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
	 * 模拟登录
	 */
	public function Login() {
		if (empty($this->blogname)) {
			return '绑定账号失败：请填写博客名';
		}
		$data = $this->account;
		$data['account'] = $data['username'];
		$ret = $this->post('http://www.diandian.com/login', $data);
		//print_html($ret);
		if ($this->http_code == 302) {
			return true;
		}
		$error = $this->getMatch1('#<div id="login-error".*?>(.*?)</div>#', $ret);
		if ($error) {
			return $error;
		} else {
			return '绑定账号失败：获取错误信息已失效。';
		}
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		return "http://{$this->blogname}.diandian.com/";
	}
	/**
	 * 发布一篇博客
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	protected function _publish($title, $content) {
		if (preg_match_all('#<img .*?src="(.+?)".*?>#i', $content, $matches)) {
			foreach ($matches[1] as $img) {
				$mappath = UPLOAD_PATH . basename($img);
				$ret = $this->post('http://www.diandian.com/upload', array(
					'formdata'	=> "@$mappath",
				), 'UTF-8', true);
				if ($ret['id']) {
					$img_id = $ret['id'];
					$content = str_replace("\"$img\"", "\"$img\" id=\"$img_id\"", $content);
				}
			}
		}
        $url = "http://www.diandian.com/dianlog/{$this->blogname}/new/text";
        $ret = $this->get($url);
        $formkey = $this->getMatch1("#DDformKey = '(.*?)';#", $ret);
        if (empty($formkey)) {
        	return '模拟登录已过期！需重新<a href="bind.php">绑定账号</a>。';
        }
        $param = array(
        	'formKey'	=> $formkey,
			'title'		=> $title,
			'content'	=> $content,
        );
        $ret = $this->post($url, $param);
        //var_dump($ret);
        if (!$ret)	return '服务器返回 NULL。';
        if ($ret['errCode'] != 0) {
        	switch ($ret['errCode']) {
        		case -23:
        			return '博客名填写错误或模拟登录已过期！需重新<a href="bind.php">绑定账号</a>。';
        		default:
        			return $ret['result'];
        	}
        }
        return true;
	}

}