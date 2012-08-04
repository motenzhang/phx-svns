<?php
/**
 * 发送失败列表
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();

$task = new Task();

switch (strtolower($_GET['action'])) {
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
			$task->UpdateStatus($ret === true ? Task::OK : Task::ERROR, $id, $ret);
		}
		break;
	case 'del':
		$task->UpdateStatus(Task::DELETE_ERR, intval($_GET['id']), '已取消');
		break;
	case 'clear':
		$task->update(array('status'=>Task::DELETE_ERR, 'msg'=>'被清空'),
					array('uid'=>Passport::GetLoginUid(), 'status'=>Task::ERROR));
		redirect('?');
		break;
}

$pager = new Pager($task->GetCount(Task::ERROR), 20);
$TEMPLATE['list'] = $task->GetList(Task::ERROR, $pager->offset());
$TEMPLATE['pager'] = $pager->render();
$TEMPLATE['title'] = '失败列表';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['list_err'] = 'current';
$smarty = new Template();
echo $smarty->r('list_err');


