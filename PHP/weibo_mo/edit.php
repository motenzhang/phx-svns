<?php
/**
 * 发微博
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();

$task = new Task();

$id = intval($_GET['id']);
$TEMPLATE['data'] = $data = $task->get($id);

if ($data['uid'] != Passport::GetLoginUid()) {
	echo '没有权限！';
	exit;
}

switch ($_POST['action']) {
	case '修改':
		$TEMPLATE['data'] = array_merge($data, $_POST);
		if (!validate()) {
		} else {
			$tableInfo = array(
				'title'	=> $_POST['title'],
				'content'	=> $_POST['content'],
			);
			if ($data['cat'] == 'weibo') {
				if ($_FILES['image']['tmp_name']) {
					@mkdir(UPLOAD_PATH, 0777, true);
					$save_file = $upload_file = UPLOAD_PATH . microtime(true) . '_' . Pinyin::get($_FILES['image']['name']);
					move_uploaded_file($_FILES['image']['tmp_name'], $save_file);
					$tableInfo['pic'] = $save_file;
				}
			}
			if ($_POST['time'] == 'on') {
				$tableInfo['status'] = Task::TASK;
				$tableInfo['send_time'] = strtotime($_POST['send_time']);
			}
			$task->update($tableInfo, array('id'=>$id));
			$item = $task->get($id);

			$TEMPLATE['report']['edit'] = array(
				'status'	=> true,
				'msg'		=> '修改成功，<a href="' . $_POST['return_url'] . '">&lt;返回</a>(<span id="countdown">5</span>)
<script>
var countd = 5;
var tt = setInterval(function(){
	if (--countd == 0) {
		clearInterval(tt);
		location = "' . $_POST['return_url'] . '";
		return;
	}
	$("#countdown").text(countd);
}, 1000);
</script>',
			);

			if ($_POST['time'] != 'on') {
				$arr = explode ('|', $item['type']);
				$thirdAccount = new ThirdAccount();
				$third = $thirdAccount->getThird($item['uid'], $arr[0], $arr[1]);
				$api = Factory::CreateAPI2($arr[0], $arr[1], $third);
				if ($item['cat'] == 'weibo') {
					$ret = $api->upload($item['content'], $item['pic']);
				} else {
					$ret = $api->publish($item['title'], $item['content']);
				}
				if ($ret === true) {
					$task->UpdateStatus(Task::OK, $id);
				} else {
					if (strpos($ret, '已过期') !== false) {
						$thirdAccount->fail($third, $ret);
					}
					$task->UpdateStatus(Task::ERROR, $id, $ret);
				}
				$TEMPLATE['report'][$item['type']] = array(
					'status'	=> ($ret === true),
					 'msg'		=> ($ret === true ?
					 					'发送成功！<a href="' . $third['url'] . '" target="_blank">查看</a>'
										: ('发送失败：' . $ret . ' <a href="list_err.php">重新发送</a>')),
				);
			} else {
				$TEMPLATE['report'][$item['type']] = array(
					'status'	=> true,
					 'msg'		=> '将于 ' . date('Y-m-d H:i', $item['send_time']) . ' 定时发送！',
				);
			}

			//redirect($_POST['return_url']);
		}
		break;
	case '取消':
		if ($data['status'] == Task::TASK_EDIT) {
			$task->UpdateStatus(Task::TASK, $id);
		}
		redirect($_POST['return_url']);
		break;
}

if (!Request::IsPost()) {
	$TEMPLATE['data']['return_url'] = str_replace('action=', '', Request::Referer());
	if ($data['status'] == Task::TASK) {
		$task->UpdateStatus(Task::TASK_EDIT, $id);
		$TEMPLATE['data']['time'] = 'on';
	}
}
if (preg_match('/^\d+$/', $TEMPLATE['data']['send_time'])) {
	$TEMPLATE['data']['send_time'] = date('Y-m-d H:i', $TEMPLATE['data']['send_time']);
}

$TEMPLATE['title'] = '修改' . ($data['cat'] == 'weibo' ? '微博' : '博客');
$TEMPLATE['login_name'] = Passport::GetLoginName();
$smarty = new Template();
echo $smarty->r('edit');

/**
 * 验证发送表单
 */
function validate() {
	global $TEMPLATE;
	global $data;
	$check = true;
	if ($data['cat'] == 'weibo') {
		if (strlen($_POST['content']) == 0) {
			$TEMPLATE['report']['check_cont'] = array(
				'status'	=> false,
				'msg'		=> '没有输入内容！',
			);
			$check = false;
		}
	} else {
		if (strlen($_POST['title']) == 0 || strlen($_POST['content']) == 0) {
			$TEMPLATE['report']['check_cont'] = array(
				'status'	=> false,
				'msg'		=> '标题和内容均不能为空！',
			);
			$check = false;
		}
	}
	if ($_POST['time'] == 'on' && strtotime($_POST['send_time']) < time() ) {
		$TEMPLATE['report']['check_time'] = array(
			'status'	=> false,
			'msg'		=> '定时发送时间比当前时间早，可能输入了一个错误的时间！',
		);
		$check = false;
	}
	return $check;
}
/**
 * 获取平台名称, smarty模板
 * @param string $type
 */
function get_name_r($type){
	$name = get_name($type, 'weibo');
	if ($name)
		return  $name . '：';
}