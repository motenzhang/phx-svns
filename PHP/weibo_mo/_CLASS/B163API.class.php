<?php
/**
 * 网易博客发送类，走网易一键转帖的一个接口
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class B163API extends SimulaLogin {
	/**
	 * 构造函数
	 * @param string $username	用户名
	 * @param string $password	密码
	 */
	function __construct($pid, $username, $password) {
		parent::__construct($pid, $username, $password);
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		return "http://blog.163.com";
	}
	/**
	 * 发布一篇博客
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	public function publish($title, $content) {
        $param = array(
			'name'		=> $this->account['username'],
			'password'	=> $this->account['password'],
			'title'		=> $title,
			'content'	=> $content,
        );
        $ret = $this->post( "http://blog.163.com/common/targetgo.s" , $param, 'GBK');
        if (!$ret)	return '服务器返回 NULL。';
        $error_code = $this->getResult($ret);
        if ($error_code != 'ok') {
        	return "接口限制：{$error_code}。";
        }
        return true;
	}
	/**
	 * 获取网易博客接口返回信息
	 * @param string $str	请求返回body
	 */
	function getResult($str){
		return $this->getMatch1('/doAfterSubmit\(\'([^\',]+)\',/', $str);
	}
}