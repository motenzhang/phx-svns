<?php
/**
 * 搜狐i空间博客模拟登录发送类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2012-2
 */
class iSohuAPI extends SimulaLogin {
	/**
	 * 构造函数
	 * @param string $username	用户名
	 * @param string $password	密码
	 * @param string $blogname	点点网博客名
	 */
	function __construct($pid, $username, $password) {
		parent::__construct($pid, $username, $password);
	}
	/**
	 * 模拟登录
	 */
	public function Login() {
		$userid = $this->account['username'];
		$password = md5($this->account['password']);
		$time = time();
		$ret = $this->get("http://passport.sohu.com/sso/login.jsp?userid={$userid}&password={$password}&appid=1019&persistentcookie=1&isSLogin=1&s={$time}&b=2&w=1366&pwdtype=1&v=26");
		$error = $this->getMatch1('#login_status=\'(.*?)\';#', $ret);
		if ($error != 'success') {
			switch ($error) {
				case 'error2':
					$errmsg = '用户名不存在';
					break;
				case 'error3':
					$errmsg = '密码错误';
					break;
				default:
					$errmsg = $error;
					break;
			}
			return '登录失败：' . $errmsg;
		}
		return true;
	}
	/**
	 * 搜狐用户名编码
	 * @param string $str
	 */
	private function sohu_encode($str) {
		function str_exchange(&$str, $x, $y) {
			$eax = $str[$x];
			$str[$x] = $str[$y];
			$str[$y] = $eax;
		}

		$enc = base64_encode($str);
		str_exchange($enc, 1, 12);
		str_exchange($enc, 2, 10);
		str_exchange($enc, 3, 15);
		str_exchange($enc, 4, 14);
		str_exchange($enc, 5, 9);
		str_exchange($enc, 6, 16);
		str_exchange($enc, 7, 11);
		str_exchange($enc, 8, 13);
		return $enc;
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		$id = $this->sohu_encode($this->account['username']);
		return "http://i.sohu.com/p/=v2={$id}/blog/index.htm";
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
				$ret = $this->post('http://upload.pp.sohu.com/blogUpload.do', array(
					'Filedata'	=> "@$mappath",
				), 'UTF-8', true);
				$src = $ret['data']['image'][1];
				if ($src) {
					$content = str_replace("\"$img\"", "\"$src\"", $content);
				}
			}
		}
		$url = "http://i.sohu.com/a/blog/home/entry/save.htm?_input_encode=UTF-8&_output_encode=UTF-8";
        $param = array(
			'title'		=> $title,
			'content'	=> $content,
        	'oper'		=> 'art_ok',
        );
        $ret = $this->post($url, $param);
        if (is_string($ret)) {
        	$ret = json_decode(iconv('gbk//IGNORE', 'utf-8//IGNORE', $ret), true);
        }
        switch ($this->http_code) {
        	case 500:
        		return '模拟登录已过期，需重新<a href="bind.php">绑定账号</a>。';
        }
        if (!$ret)	return '服务器返回 NULL。';

        if (is_array($ret)) {
	        if ($ret['status'] === 0) {
	        	return true;
	        } else {
	       		return $ret['statusText'];
	        }
        } else {
			Log::customLog('isohu_error.txt', '发布失败：' . print_r($param, true) . print_r($this->http_header, true) . $ret);
        	return '未知错误，详细原因请参阅<a href="_LOG/isohu_error.txt" target="_blank">isohu_error.log</a>。';
        }
	}

}