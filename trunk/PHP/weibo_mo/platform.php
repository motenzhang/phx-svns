<?php
/**
 * 平台设定页面，新增、删除平台，APP KEY 设置
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();
if (!Passport::IsAdmin()) {
	redirect('login.php');
}

$wt_open = new WTOpen();

$pid = intval($_GET['id']);

$TEMPLATE['error'] = array();
switch (strtolower($_REQUEST['action'])) {
	case 'add':
		$name = $_POST['name'];
		if ($name) {
			if ($wt_open->getByName($name)) {
				$TEMPLATE['error']['name'] = '名称已存在';
			} else {
				$tableInfo = array(
					'name' => $name,
					'user' => Passport::GetLoginName(),
				);
				$newid = $wt_open->insertIgnore($tableInfo);
				redirect("?id=$newid");
			}
		} else {
			$TEMPLATE['error']['name'] = '名称不能为空';
		}
		$TEMPLATE['data'] = $_POST;
		break;
	case 'save':
		if ($pid > 0) {
			$app = $_POST['app'];
			$wt_open->delete(array('pid'=>$pid));
			foreach ($app as $key => $value) {
				$tableInfo = array(
					'pid'	=> $pid,
					'name'	=> $key,
					'app_key'	=> trim($value['key']),
					'app_secret'=> trim($value['secret']),
					'callback'	=> trim($value['callback']),
					'status'=> ($value['key'] && $value['secret']),
					'user'	=> Passport::GetLoginName(),
				);
				$wt_open->replace($tableInfo);
			}
			$TEMPLATE['error']['app'] = '<span style="color:#090">保存成功！</span>';
		}
		break;
	case 'delete':
		$wt_open->update(array('status'=>-1), array('id'=>$pid));
		$wt_open->update(array('status'=>-1), array('pid'=>$pid));
		redirect('?');
		break;
}

$TEMPLATE['title'] = '平台设定';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['platform'] = 'current';
$TEMPLATE['platform_list'] = $wt_open->getPlatformList(false);
$TEMPLATE['open_list'] = Config::open_list();
if ($pid > 0) {
	$TEMPLATE['pid'] = $pid;
	$TEMPLATE['open_data'] = $wt_open->findBy(array('pid'=>$pid), 'name');
	//var_dump($TEMPLATE['open_data']);
	foreach ($TEMPLATE['open_list'] as $key => &$value) {
		$value = array_merge(array('weibo_name'=>$value), (array)$TEMPLATE['open_data'][$key]);
		unset($value);
	}
}
$smarty = new Template();
echo $smarty->r('platform');

