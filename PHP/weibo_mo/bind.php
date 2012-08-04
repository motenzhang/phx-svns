<?php
/**
 * 第三方账号绑定页面。
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();
if (!Passport::IsAdmin()) {
	redirect('login.php');
}

$wt_open = new WTOpen();
$thirdAccount = new ThirdAccount();

$TEMPLATE['platform_list'] = $wt_open->getPlatformList();

$pid = intval($_GET['id']);
if ($pid == 0 && count($TEMPLATE['platform_list']) > 0) {
	$ids = array_keys($TEMPLATE['platform_list']);
	redirect('?id=' . $ids[0]);
}

if ($_GET['action'] == 'unbind' && $_GET['type']) {
	$third = $thirdAccount->getByType($_GET['type'], $pid);
	$api = Factory::CreateAPI2($_GET['type'], $pid, $third);
	if (method_exists($api, 'Logout')) {
		$api->Logout();
	}
	$thirdAccount->delete(array('uid' => Passport::GetLoginUid(), 'type' => $_GET['type'], 'pid' => $pid));
	redirect("?id=$pid");
}
if ($_POST['action'] == 'bind') {
	$fields = $_POST['f'];
	$fields['pid'] = $pid;
	$fields['uid'] = Passport::GetLoginUid();
	$fields['nick'] = $fields['token'];
	$fields['valid'] = 1;
	if ($fields['token'] && $fields['token_secret']) {
		$api = Factory::CreateAPI2($fields['type'], $pid, $fields);
		$ret = $api->Login($_POST['verify_code']);
		if ($ret === true) {
			$fields['url'] = $api->getUrl();
			$user = new User();
			$users = $user->getsAll();
			foreach ($users as $uid => $item) {
				$fields['uid'] = $uid;
				$thirdAccount->replace($fields);
			}
		} else {
			$TEMPLATE['error'] = array(
				'type'	=> $fields['type'],
				'msg'	=> $ret,
			);
			$TEMPLATE['data'] = $fields;
		}
	} else {
		$TEMPLATE['error'] = array(
			'type'	=> $fields['type'],
			'msg'	=> '用户名和密码不能为空。',
		);
		$TEMPLATE['data'] = $fields;
	}
}

$TEMPLATE['title'] = '账号绑定';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['bind'] = 'current';
if ($pid > 0) {
	$TEMPLATE['pid'] = $pid;
}
$TEMPLATE['weibo_list'] = $wt_open->getWeiboList($pid);
foreach ($TEMPLATE['weibo_list'] as $key => &$value) {
	$value = array(
		'name' => $value,
		'third'=> get_status($key),
	);
	unset($value);
}
$TEMPLATE['blog_list'] = $wt_open->getBlogList($pid);
foreach ($TEMPLATE['blog_list'] as $key => &$value) {
	$value = array(
		'name' => $value,
		'third'=> get_status($key),
	);
	unset($value);
}

$smarty = new Template();
echo $smarty->r('bind');

/**
 * 获取账号绑定状态，smarty 模板用
 * @param string $type
 */
function get_status($type) {
	global $thirdAccount, $pid;
	$third = $thirdAccount->getByType($type, $pid);
	if (!$third) {
		return array('status'=>0); // 未绑定
	}
	if (!$third['valid']) {
		$third['status'] = -1;
		return $third;
	}
	$api = Factory::CreateAPI2($type, $pid, $third);
	if (method_exists($api, 'Test')) {
		if ($api->Test()) {
			$third['status'] = 1;  // 正常
			return $third;
		} else {
			$thirdAccount->fail($third, '执行Test方法失败。');
			$third['status'] = -1; // 失效
			return $third;
		}
	}
	$third['status'] = 1;  // 正常
	return $third;
}
