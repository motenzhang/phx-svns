<?php
/**
 * 获取第三方验证码
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../init.php';

Passport::RequireLogin();

$api = Factory::CreateAPI($_GET['t'], $_GET['pid']);
ob_clean();
$api->showCode();
ob_end_flush();
