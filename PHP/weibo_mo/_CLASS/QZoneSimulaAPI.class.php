<?php
/**
 * QQ空间日志模拟登录
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class QZoneSimulaAPI extends SimulaLogin {
	/**
	 * 构造函数
	 * @param string $username	用户名
	 * @param string $password	密码
	 */
	function __construct($pid, $username, $password) {
		parent::__construct($pid, $username, $password);
	}
	/**
	 * 三次MD5运算，QQ模拟登录密码算法
	 * @param $str
	 */
	function md5_3 ($str) {
		return strtoupper(md5(md5(md5($str, true), true)));
	}
	/**
	 * 模拟登录
	 */
	public function Login() {
		$data = $this->account;
		if (!is_numeric($data['username']) && !str_contains($data['username'], '@')) {
			return '用户名格式错误，请输入QQ号或QQ邮箱。';
		}
		$ret = $this->get('http://ptlogin2.qq.com/check?appid=15000101&uin=' . $data['username']);//
		$arr = explode("'", $ret);
		$verifycode = $arr[3];
		if (strlen($verifycode) != 4) {
			return '登录服务暂时不可用，请稍后再试！';
		}

		$query = array(
			'u'				=> $data['username'],
			'p'				=> md5($this->md5_3($data['password']) . $verifycode),
			'verifycode'	=> $verifycode,
			'aid'			=> 15000101,
			'u1'			=> 'http://imgcache.qq.com/qzone/v5/loginsucc.html?para=izone',
			'h'				=> 1,
			'from_ui'		=> 1,
			'fp'			=> 'loginerroralert',
		);
		$ret = $this->get('http://ptlogin2.qq.com/login?' . http_build_query($query));
		$arr = explode("'", $ret);
		$ret = $arr[9];
		if (start_with($ret, '登录成功') ) {
			return true;
		}
		return $ret;
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		$qq = $this->account['username'];
		return "http://{$qq}.qzone.qq.com/";
	}

	/*
	 * QQ空间日志 Token算法，从一下面的JS转化而来
	 * @param string $skey	Cookie中存储的skey
	 *
	 * function _DJB (str) {
	 * 		var hash=5381;
	 * 		for(var i=0,len=str.length;i<len;++i){
	 * 			hash+=(hash<<5)+str.charAt(i).charCodeAt();
	 * 		}
	 * 		return hash&0x7fffffff;
	 * 	}
	 */
	function _DJB ($skey) {
		$hash = 5381;
		for ($i = 0; $i < strlen($skey); $i++) {
			$hash += ($hash << 5) + ord(substr($skey, $i));
		}
		return $hash & 0x7FFFFFFF;
	}
	/**
	 * 发布一篇QQ空间日志
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	protected function _publish($title, $content) {
		$skey = $this->getcookie('skey', '.qq.com');
		$data = $this->account;
        $param = array(
           	'category'	=> '个人日记',
        	'g_tk'		=> $this->_DJB($skey),
			'content'	=> strip_tags($content),
        	'html'		=> $content,
        	'title'		=> $title,
        	'uin'		=> $data['username'],
        );
        $ret = $this->post('http://b1.cnc.qzone.qq.com/cgi-bin/blognew/blog_add', $param, 'gbk');
		$ret = iconv('gbk', 'utf-8', $ret);
        if (!$ret)	return '服务器返回 NULL。';
        $msg = $this->getMatch1('#"msg":"(.+?)"#', $ret);
        return empty($msg) ? true : $msg;
	}
}