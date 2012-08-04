<?php
/**
 * 登录页面
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

if ($_GET['action'] == 'logoff') {
	Passport::LogOff();
	redirect('login.php');
}

if (Passport::IsLogin()) {
	redirect('index.php');
}

if (Request::IsPost()) {
	$fields = $_POST['f'];
	if(validate($fields))
	{
		$ret = Passport::Login($fields['username'], $fields['password']);
		if (is_array($ret)) {
			$return_url = get_returnurl('index.php');

			$wt_open = new WTOpen();
			$cbs = $wt_open->getCallbackList();
			$scripts = '';
			if (count($cbs) > 0) {
				$token = http_build_query($ret);
				foreach ($cbs as $value) {
					$url = get_absolute_url("login_api.php?$token", $value);
					$scripts .= "<script src=\"$url\"></script>\n";
				}
			}

			echo <<<HTML
$scripts
<script>
location.replace('$return_url');
</script>
HTML;
			exit;
			redirect(get_returnurl('index.php'));
		} else {
			$TEMPLATE['error'] = array();
			if (strpos($ret, '密码') !== false) {
				$TEMPLATE['error']['password'] = $ret;
			} else {
				$TEMPLATE['error']['username'] = $ret;
			}
		}
	}
	// 保持填写的数据
	$TEMPLATE['data'] = $fields;
}

$TEMPLATE['title'] = '登录';
$TEMPLATE['nav']['login'] = 'current';
$smarty = new Template();
echo $smarty->r('login');

function validate($fields) {
	global $TEMPLATE;
	$ret = true;
	if($fields['username'] == '')
	{
		$TEMPLATE['error']['username'] = '请输入用户名！';
		$ret = false;
	}
	if($fields['password'] == '')
	{
		$TEMPLATE['error']['password'] = '请输入密码！';
		$ret = false;
	}
	return $ret;
}