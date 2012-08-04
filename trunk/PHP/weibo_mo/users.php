<?php
/**
 * 用户管理页面。修改用户密码、类型、权限
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname ( __FILE__ ) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin ();
if (!Passport::IsAdmin()) {
	redirect('login.php');
}

$user = new User ();
$smarty = new Template ();
$TEMPLATE ['title'] = '用户管理';
$TEMPLATE ['login_name'] = Passport::GetLoginName ();
$TEMPLATE ['nav'] ['users'] = 'current';

switch (strtolower ( $_GET ['action'] )) {
	case 'edit' :
		$id = intval ( $_GET ['id'] );
		$TEMPLATE ['data'] = $user->get ( $id );
		$TEMPLATE ['data']['perms'] = unserialize($TEMPLATE ['data']['perms']);
		if (Request::IsPost ()) {
			$fields = $_POST ['f'];
			if (validate ( $fields )) {
				if (! isset ( $fields ['type'] ))
					$fields ['type'] = 0;
				// 按平台权限拷贝第一个管理员的Token
				$thirdAccount = new ThirdAccount();
				$thirdAccount->copyToken($id, @array_keys($fields['perms']));
				$fields ['perms'] = serialize ( $fields ['perms'] );
				$user->update ( $fields, array ('id' => $id ) );
				redirect ( '?' );
			} else {
				$fields['username'] = $TEMPLATE ['data']['username'];
				$TEMPLATE['data'] = $fields;
			}
		}

		$wt_open = new WTOpen ();

		$TEMPLATE['simula']['weibo_list']	= $wt_open->getWeiboList(0, false);
		$TEMPLATE['simula']['blog_list']	= $wt_open->getBlogList(0, false);

		$TEMPLATE ['platform_list'] = $wt_open->getPlatformList (false);
		foreach ( $TEMPLATE ['platform_list'] as &$item ) {
			$item ['weibo_list'] = $wt_open->getWeiboList ( $item ['id'], false );
			$item ['blog_list'] = $wt_open->getBlogList ( $item ['id'], false );
			unset ( $item );
		}
		if (!is_array($TEMPLATE ['data']['perms']))	{
			$TEMPLATE ['data']['perms'] = array();
		}
		exit ( $smarty->r ( 'users_edit' ) );
		break;
}

$TEMPLATE ['list'] = $user->getsAll ();
foreach ( $TEMPLATE ['list'] as &$item ) {
	$item ['perms'] = unserialize($item['perms']);
	unset ( $item );
}
echo $smarty->r ( 'users' );

function validate(&$fields)
{
	global $TEMPLATE;
	$ret = true;
	if($fields['password'] == '')
	{
		unset($fields['password']);
//		$TEMPLATE['error']['password'] = '密码不能为空！';
//		$ret = false;
	}
	return $ret;
}
