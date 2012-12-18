<?php
//此变量名不能更改，它可以覆盖系统默认配置
$gConfig = array(
    'auto_session' => true, // 是否自动开启SESSION支持
    'db' => array(
            'driver' => 'gMysql', // 驱动类型
            'prefix' => '', // 表前缀
            'master' => array (
                'database' => '360chrome_ext', // 库名称
                'host' => '10.16.15.225', // 数据库地址
                'port' => 3306, // 端口
                'login' => 'tangyonggang', // 用户名
                'password' => 'tangyonggang@browser', // 密码
                'persistent' => false, // 是否使用长链接
                'charset' => 'utf8',
            ),
            'slave' => array (
                0 => array (
                    'database' => '360chrome_ext', // 库名称
                    'host' => '10.16.15.225', // 数据库地址
                    'port' => 3306, // 端口
                    'login' => 'tangyonggang', // 用户名
                    'password' => 'tangyonggang@browser', // 密码
                    'persistent' => false, // 是否使用长链接     
                    'charset' => 'utf8',
                )
            )
    ),
    'tt_memcache' => array (
        'prefix' => '360chrome_ext_',
        'master' => array (
            'host' => '10.16.15.215',
            'port' => '11211'
        ),
        'slave' => array (
            array ('host' => '10.16.15.215', 'port' => '11211')
        )
    ),
    'include_path' => array(
            SITE_PATH.'include/',
    ),
    'default_controller' => 'main',
    'googleBaseUrl' => "https://chrome.google.com"
); //用户配置，可替换框架默认配置