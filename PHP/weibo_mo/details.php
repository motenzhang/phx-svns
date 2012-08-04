<?php
/**
 * 详细信息
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();

$task = new Task();

$id = intval($_GET['id']);
$TEMPLATE['data'] = $task->get($id);

$TEMPLATE['data']['pic'] = get_pic($TEMPLATE['data']['pic']);

/**
 * 	const OK	= 100;	// 发送成功
	const DELETE_OK		= -10;	// 取消的
	const DELETE_ERR	= -20;
	const DELETE_TASK	= -30;
	const ERROR	= -1;	// 发送失败
	const TASK	= 0;	// 定时任务
	const EXECING= 1;	// 正在执行任务
	const TASK_EDIT = 2; // 修改中
 */

switch ($TEMPLATE['data']['status']) {
	case Task::OK:
		$TEMPLATE['data']['status_text'] = '发送成功';
		break;
	case Task::DELETE_OK:
		$TEMPLATE['data']['status_text'] = '从发送成功列表删除';
		break;
	case Task::DELETE_ERR:
		$TEMPLATE['data']['status_text'] = '从失败列表删除';
		break;
	case Task::DELETE_TASK:
		$TEMPLATE['data']['status_text'] = '从定时任务列表删除';
		break;
	case Task::TASK:
		$TEMPLATE['data']['status_text'] = '定时任务';
		break;
	case Task::EXECING:
		$TEMPLATE['data']['status_text'] = '正在执行的定时任务';
		break;
	case Task::TASK_EDIT:
		$TEMPLATE['data']['status_text'] = '修改中';
		break;
	case Task::ERROR:
		$TEMPLATE['data']['status_text'] = '发送失败：' . $TEMPLATE['data']['msg'];
		break;
	default:
		$TEMPLATE['data']['status_text'] = '未知状态：' . $TEMPLATE['data']['status'];
		break;
}

$TEMPLATE['title'] = '详细信息';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['list_ok'] = 'current';
$smarty = new Template();
echo $smarty->r('details');


