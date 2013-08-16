<?php
/**
 * 注册页面
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';


if (Passport::IsLogin()) {
	redirect('index.php');
}

if (Request::IsPost()) {
	$fields = $_POST['f'];
	if(validate($fields))
	{
		$user = new User();
		$ret = $user->getByName($fields['username']);
		$TEMPLATE['error'] = array();
		if ($ret) {
			$TEMPLATE['error']['username'] = '用户已存在！';
		} else {
			$tableInfo = array(
				'username'	=> $fields['username'],
				'password'	=> md5($fields['password']),
				'type'		=> ($user->totals() == 0 ? 1 : 0),
				'reg_date'	=> time(),
				'last_login'=> time(),
			);
			$newid = $user->insertIgnore($tableInfo);
			if ($newid) {
				$ret = Passport::WriteCookie($newid, $tableInfo['username'], $tableInfo['type']);
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
				$TEMPLATE['error']['username'] = '注册失败！';
			}
		}
	}
	// 保持填写的数据
	$TEMPLATE['data'] = $fields;
}

$TEMPLATE['title'] = '注册';
$TEMPLATE['nav']['register'] = 'current';
$smarty = new Template();
echo $smarty->r('register');

function validate($fields)
{
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
	if($fields['re_password'] == '')
	{
		$TEMPLATE['error']['re_password'] = '请输入确认密码！';
		$ret = false;
	} elseif ($fields['re_password'] != $fields['password']) {
		$TEMPLATE['error']['re_password'] = '两次输入密码不一致！';
		$ret = false;
	}
	return $ret;
}