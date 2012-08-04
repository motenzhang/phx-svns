<?php
/**
 * 配置文件
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */

// debug 开关
define('DEBUG', true);
define('ERROR_LEVEL', E_ALL & ~E_NOTICE & ~E_DEPRECATED);
error_reporting(ERROR_LEVEL);

//模板文件目录
define('TEMPLATE_PATH', ROOT_DIR . '_TEMPLATE/default');
//模板文件编绎目录
define('COMPILER_PATH', ROOT_DIR . '_TEMPLATE_C/default');
//默认的模板文件后缀名
define('TEMPLATE_TYPE','html');
//此项目日记文件地址
define('LOG_PATH',ROOT_DIR . '_LOG/');
// 上传文件夹
define('UPLOAD_PATH_WWW', 'uploadfiles/');
define('UPLOAD_PATH', ROOT_DIR . UPLOAD_PATH_WWW);

// 数据库
$CACHE['db'] = array(
		'default'=>array(
			'master' =>array(
 				array('host'=>'localhost','user'=>'root', 'password'=>'' , 'database'=>'weibo_tools'),
 			),
		),
);

// 支持第三方平台列表
$CACHE['platform_list'] = array(
		'weibo' => array(
			'kx001'	=> '开心记录',
			'sina'	=> '新浪微博',
			'qq'	=> '腾讯微博',
			't_163'	=> '网易微博',
			'sohu'	=> '搜狐微博',
		),
		'blog' => array(
			'kx001'		=> '开心日志',
			'b_163'		=> '网易博客',
			'qzone'		=> 'QQ空间日志',
			'qzone_simula'	=> 'QQ空间日志',
			'diandian'	=> '点点轻博客',
			'i_sohu'	=> '搜狐i空间博客',
			'sina_blog'	=> '新浪博客',
			'renren'	=> '人人网公共主页',
			'douban'	=> '豆瓣小站',
			'renren_zhan'	=> '人人小站',
		),
		// 使用开放平台的第三方
		'open' => array(
			'kx001'	=> '开心网',
			'sina'	=> '新浪微博',
			'qq'	=> '腾讯微博',
			't_163'	=> '网易微博',
			'sohu'	=> '搜狐微博',
			'qzone'	=> 'QQ空间',
			'renren'=> '人人网',
		),
);

// 邮件配置
$CACHE['mail'] = array(
	'smtp'	=> array(
		'host'		=> 'localhost',
		'ip'		=> '127.0.0.1',
		'port'		=> '25',
		'username'	=> 'administrator',
		'password'	=> '',
		'email'		=> 'panliu888@gmail.com',
		'display'	=> '微博工具',
	),
	'token_expire' => array(
		'to'		=> array(
			'panliu888@gmail.com',
			'panliu888@gmail.com',
		),
		'subject'	=> '【微博工具】Token 过期，平台：{platform}，{weibo}',
		'content'	=> 'Token 过期，平台：{platform}，{weibo}，时间：' . date('Y-m-d H:i'),
	),
);


