<?php
/**
 * 管理定时发送任务。立即发送、取消
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();

$user = new User();
$data = $user->get(Passport::GetLoginUid());
$last_exec = $data['last_exec'];
if ((time() - $last_exec) > 60 * 60) {
	$TEMPLATE['last_exec'] = max($last_exec, 1);
}

$task = new Task();

switch ($_GET['action']) {
	case 'send':
		$thirdAccount = new ThirdAccount();
		$id = intval($_GET['id']);
		$item = $task->get($id);
		if ($item/* && $item['uid'] == Passport::GetLoginUid()*/) {
			$type = $item['type'];
			$arr = explode ('|', $type);
			$third = $thirdAccount->getByType($arr[0], $arr[1], $item['uid']);
			$api = Factory::CreateAPI2($arr[0], $arr[1], $third);
			if ($item['cat'] == 'weibo') {
				$ret = $api->upload($item['content'], $item['pic']);
			} else {
				$ret = $api->publish($item['title'], $item['content']);
			}
			$TEMPLATE['report'] = array();
			$TEMPLATE['report'][$type] = array(
				'id'		=> $id,
				'status'	=> ($ret === true),
				 'msg'		=> ($ret === true ?
				 					'发送成功！<a href="' . $third['url'] . '" target="_blank">查看</a>'
									: ('发送失败：' . $ret)),
			);
			$task->UpdateStatus($ret === true ? Task::OK : Task::ERROR, $id, $ret, time());
		}
		break;
	case 'del':
		$task->UpdateStatus(Task::DELETE_TASK, intval($_GET['id']), '已取消');
		break;
}

$TEMPLATE['list'] = $task->GetList(Task::TASK);

$TEMPLATE['title'] = '定时发送任务';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['task'] = 'current';
$smarty = new Template();
echo $smarty->r('task');


