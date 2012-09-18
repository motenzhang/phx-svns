<?php
/**
 * 新浪博客模拟登录发送类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2012-2
 */
class SinaBlog extends SimulaLogin {
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
	 * 获取登录验证码
	 */
	public function showCode() {
		echo $this->get('http://login.sina.com.cn/cgi/pin.php');
		Session::Set('sina_blog_vcode_cookie', $this->http_header['Set-Cookie']);
	}
	/**
	 * 模拟登录
	 */
	public function Login($verify_code = NULL) {
		// getServerTime
		$token = $_POST['sina'];

		//$sp = sha1(sha1(sha1($this->account['password'])) . $token['servertime'] . $token['nonce']);
		$data = array(
			'callback'		=> 'loginCallBack',
			'encoding'		=> 'UTF-8',
			'entry'			=> 'boke',
			'from'			=> 'referer:blog.sina.com.cn/',
			'gateway'		=> 1,
			'nonce'			=> $token['nonce'],
			'prelt'			=> 37,
			'pwencode'		=> 'rsa2',
			'returntype'	=> 'IFRAME',
			'rsakv'			=> $token['rsakv'],
			'savestate'		=> '365',
			'servertime'	=> $token['servertime'],
			'service'		=> 'sso',
			'setdomain'		=> '1',
			'sp'			=> $token['sp'],
			'su'			=> $token['su'],
			'useticket'		=> '0',
		);
		if ($verify_code) {
			$data['door'] = $verify_code;
		}
		$this->deletecookie('.sina.com.cn', 'ULOGIN_IMG');
		//var_dump($data);
		$ret = $this->post('http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.2)', $data
							, 'UTF-8', false, Session::Get('sina_blog_vcode_cookie')
							);
		//var_dump($ret);
		$ret = $this->getMatch1('#loginCallBack\((.*?)\);;#', $ret);
		$json = json_decode($ret, true);
		if (empty($json) || $json['retcode'] != 0) {
			return '登录失败：' . $json['reason'];
		}
		$this->uid = $json['uid'];
		return true;
	}
	/**
	 * 获取该平台用户首页
	 */
	public function getUrl() {
		return "http://blog.sina.com.cn/u/{$this->uid}";
	}
	/**
	 * 发布一篇博客
	 * @param string $title		标题
	 * @param string $content	内容(html)
	 */
	protected function _publish($title, $content) {
		$add_url = 'http://control.blog.sina.com.cn/admin/article/article_add.php';
		$ret = $this->get($add_url);
		$vtoken = $this->getMatch1('/<input type="hidden" name="vtoken" value="([^"]+)"/', $ret);
		if (empty($vtoken)) {
			return '模拟登录已过期，需重新<a href="bind.php">绑定账号</a>。';
		}

        $param = array(
        	'album'			=> '',
        	'album_cite'	=> '',
        	'articleStatus_preview'=> 1,
        	'article_BGM'	=> '',
        	'articletj'		=> '',
        	'assoc_article'	=> '',
        	'assoc_article_data'=> '',
        	'assoc_style'	=> 1,
			'blog_body'		=> $content,
        	'blog_class'	=> '00',
        	'blog_id'		=> '',
        	'blog_title'	=> $title,
        	'book_worksid'	=> '',
        	'channel'		=> '',
        	'channel_id'	=> '',
        	'commentGlobalSwitch'=> '',
        	'commenthideGlobalSwitch'=> '',
        	'conlen'		=> mb_strlen($content, 'utf-8'),
        	'date_pub'		=> date('Y-m-d'),
        	'fromuid'		=> '',
        	'is_album'		=> 0,
			'is_media'		=> 0,
			'is_stock'		=> 0,
			'is_tpl'		=> 0,
        	'join_circle'	=> 1,
        	'newsid'		=> '',
        	'ptype'			=> '',
        	'sina_sort_id'	=> 117,
        	'sno'			=> '',
        	'source'		=> '',
        	'stag'			=> '',
        	'tag'			=> '',
        	'teams'			=> '',
        	'time'			=> date('H:i:s'),
			'topic_channel'	=> 0,
			'topic_id'		=> 0,
			'topic_more'	=> '',
			'url'			=> '',
        	'utf8'			=> 1,
	        'vtoken'		=> $vtoken,
        	'wid'			=> '',
			'worldcuptags'	=> '',
			'xRankStatus'	=> '',
			'x_cms_flag'	=> 0,
        );
        $this->referer = $add_url;
        $ret = $this->post('http://control.blog.sina.com.cn/admin/article/article_post.php', $param);
        if (!$ret)	return '服务器返回 NULL。';
        switch ($ret['code']) {
        	case 'B06001':
        	case 'B06011':
           	case 'B06012':
        		return true;
        	case 'B06013':
        		return '出现验证码！';
        	case 'B07005':
        	case 'B08001':
        		return '不能一分钟内连续发博文，请稍后再试。';
        	default:
        		return '错误码: ' . $ret['code'];
        }
        return true;
	}

}