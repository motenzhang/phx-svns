<?php
/**
 * 跳转到开放平台登录地址，RequestToken
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../init.php';

Passport::RequireLogin();

$type = $_GET['t'];
$pid = intval($_GET['pid']);
$api = Factory::CreateAPI($type, $pid);

// 获取开放平台登录地址，跳转
switch ($api->type) {
	case 'kx001':
		$scope = 'send_feed create_records create_diary';
		break;
	case 'renren':
		$scope = 'admin_page publish_blog';
		break;
}
$cross = get_absolute_url('cross.php');
$auth_url = $api->GetAuthorizationUrl( get_absolute_url("bind.php?t=$type&pid=$pid&redir=$cross", $api->callback)
										, $scope );

if (start_with($auth_url, 'http')) {
	redirect($auth_url);
} else {
	echo $auth_url;
}