<?php
/**
 * 修改个人信息(密码)页面
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();

if (Request::IsPost()) {
	$fields = $_POST['f'];
	if (validate($fields)) {
		$user = new User();
		$TEMPLATE['error'] = array();
		$tableInfo = array(
			'password' => md5($fields['password']),
			'last_login' => time(),
		);
		if ($user->update($tableInfo, array('id'=>Passport::GetLoginUid()))) {
			$TEMPLATE['error']['username'] = '<span style="color:#090">密码修改成功！</span>';
		} else {
			$TEMPLATE['error']['username'] = '密码修改失败！';
			$TEMPLATE['data'] = $fields;
		}
	} else {
		// 保持填写的数据
		$TEMPLATE['data'] = $fields;
	}
}

$TEMPLATE['title'] = '修改密码';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['profile'] = 'current';
$smarty = new Template();
echo $smarty->r('profile');

function validate($fields)
{
	global $TEMPLATE;
	$ret = true;
	if($fields['password'] == '')
	{
		$TEMPLATE['error']['password'] = '请输入新密码！';
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