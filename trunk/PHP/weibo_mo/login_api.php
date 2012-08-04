<?php
/**
 * 登录接口，多域名同步登录使用
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::WriteCookie($_GET['uid'], $_GET['id'], $_GET['type'], $_GET['sign']);
echo '//ok';