<?php
/**
 * 发送成功列表
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();

$task = new Task();

switch (strtolower($_GET['action'])) {
	case 'del':
		$task->UpdateStatus(Task::DELETE_OK, intval($_GET['id']), '已取消');
		break;
	case 'clear':
		$task->update(array('status'=>Task::DELETE_OK, 'msg'=>'被清空'),
					array('uid'=>Passport::GetLoginUid(), 'status'=>Task::OK));
		redirect('?');
		break;
}

$pager = new Pager($task->GetCount(Task::OK), 20);
$TEMPLATE['list'] = $task->GetList(Task::OK, $pager->offset());
$TEMPLATE['pager'] = $pager->render();
$TEMPLATE['title'] = '已发送';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['list_ok'] = 'current';
$smarty = new Template();
echo $smarty->r('list_ok');

