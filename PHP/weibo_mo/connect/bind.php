<?php
/**
 * 开放平台登录回调页面，AccessToken
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../init.php';

switch ($_GET['error']) {
	case 'login_denied':
		echo <<<HTML
<script>
window.close();
</script>
HTML;
		exit;
		break;
}

if (!Passport::IsLogin()) {
	redirect('../login.php?return_url=' . urlencode($_SERVER['REQUEST_URI']));
}

$pid = intval($_GET['pid']);
$api = Factory::CreateAPI($_GET['t'], $pid);

switch ($api->type) {
	case 'qzone':
		$code_key = 'oauth_vericode';
		break;
	case 'renren':
	case 'sina':
		$code_key = 'code';
		break;
	default:
		$code_key = 'oauth_verifier';
		break;
}
$token = $api->getAccessToken($_GET[$code_key], $_GET['oauth_token']);
if ($token['oauth_token']) {
	$api->openid = $token['openid'];
	$thirdAccount = new ThirdAccount();
	$tableInfo = array(
		'uid'	=> Passport::GetLoginUid(),
		'pid'	=> $pid,
		'type'	=> $api->type,
		'token'	=> $token['oauth_token'],
		'token_secret'	=> $token['oauth_token_secret'],
		'openid'=> $token['openid'],
		'nick'	=> $api->getNick(),
		'url'	=> $api->getUrl(),
		'valid'	=> 1,
	);
	Log::customLog('token_expires_error.txt', "绑定 Token，信息：" . print_r($tableInfo, true));
	$user = new User();
	$users = $user->getsAll();
	foreach ($users as $uid => $item) {
		$tableInfo['uid'] = $uid;
		$thirdAccount->replace($tableInfo);
	}
	redirect($_GET['redir']);
	echo <<<HTML
<script>
opener.location=opener.location;
window.close();
</script>
HTML;
} else {
	echo '获取 AccessToken 失败！请稍后再试。' . $token["error_msg"] . '<span style="color:#fff">' . print_r($token, true) . '</span>';
}
