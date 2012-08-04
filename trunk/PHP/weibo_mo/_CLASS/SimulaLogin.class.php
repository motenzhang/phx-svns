<?php
/**
 * 模拟登录基类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class SimulaLogin extends WebClient {
	/**
	 * 账户信息，保存用户名、密码
	 * @var $account array
	 */
	protected $pid, $account;
	/**
	 * 构造函数
	 * @param string $username	用户名
	 * @param string $password	密码
	 */
	function __construct($pid, $username, $password) {
		$this->pid = $pid;
		$this->account = array(
			'username' => $username,
			'password' => $password,
		);
		//parent::__construct(LOG_PATH . Passport::GetLoginUid() . '.cookie');
		parent::__construct(LOG_PATH . "{$pid}.cookie");
	}
	/**
	 * 模拟登录
	 * @param string $verify_code 验证码
	 */
	public function Login($verify_code = NULL) {
		return true;
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		return '';
	}
	/**
	 * 发布一篇博客
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	public function publish($title, $content) {
		$msg = $this->_publish($title, $content);
       	if (str_contains($msg, '登录') && ($this->account['username'] && $this->account['password']) ) {
       		$ret = $this->Login();
        	if ($ret === true) {
        		return $this->_publish($title, $content);
        	} else {
        		return "模拟登录已过期，自动重登录失败：$ret";
        	}
       	}
       	return $msg;
	}
	/**
	 * 测试模拟登录Session是否还有效
	 */
	public function Test() {
		return true;
	}
}