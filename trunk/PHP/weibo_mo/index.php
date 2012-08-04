<?php
/**
 * 发微博
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

Passport::RequireLogin();

$wt_open = new WTOpen();
$thirdAccount = new ThirdAccount();

if (Request::IsPost()) {
	if (!validate()) {
		$TEMPLATE['data'] = $_POST;
	} else {
		if ($_FILES['image']['tmp_name']) {
			@mkdir(UPLOAD_PATH);
			$save_file = $upload_file = UPLOAD_PATH . microtime(true) . '_' . Pinyin::get($_FILES['image']['name']);
			move_uploaded_file($_FILES['image']['tmp_name'], $save_file);
		}
		$wbs = $_POST['target'];
		$task = new Task();
		if ($_POST['time'] == 'on') {
			// 定时发送
			foreach ($wbs as $type) {
				$task->AddTask($type, $_POST['content'], $_POST['send_time'], $upload_file);
			}
			$TEMPLATE['report']['time'] = array(
				'status'	=> true,
				'msg'		=> '定时发送成功！<a href="task.php">查看</a>',
			);
		} else {
			$watch = new Stopwatch();
			$watch->Start();
			// 直接发送
			foreach ($wbs as $type) {
				$arr = explode ('|', $type);
				$third = $thirdAccount->getByType($arr[0], $arr[1]);
				$api = Factory::CreateAPI2($arr[0], $arr[1], $third);
				$ret = $api->upload($_POST['content'], $upload_file);
				if ($ret !== true && strpos($ret, '已过期') !== false) {
					$thirdAccount->fail($third, $ret);
				}
				$TEMPLATE['report'][$type] = array(
					'status'	=> ($ret === true),
					 'msg'		=> ($ret === true ?
					 					'发送成功！<a href="' . $third['url'] . '" target="_blank">查看</a>'
										: ('发送失败：' . $ret . ' <a href="list_err.php">重新发送</a>')),
				);
				$task->AddTask($type, $_POST['content'], time(), $upload_file, $ret === true ? Task::OK : Task::ERROR, $ret);
			}
			$watch->Stop();
			$TEMPLATE['report']['watch'] = array(
				'status'	=> true,
				'msg'		=> "总耗时：{$watch->getElapsedSeconds()} 秒",
			);
		}
	}
}

if ($_GET['testmail']) {
	$mail = Config::get_mail('token_expire');
	if (sendmail($mail['to'], '【微博工具】测试邮件', '测试邮件内容', $error)) {
		echo '发送成功';
	} else {
		echo "<font color=red>发送失败：$error</font>";
	}
}

$TEMPLATE['title'] = '发微博';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['index'] = 'current';
$TEMPLATE['target_list'] = $wt_open->getWeiboList();
$TEMPLATE['platform_list'] = $wt_open->getPlatformList();
foreach ($TEMPLATE['platform_list'] as &$item) {
	$item['list'] = $wt_open->getWeiboList($item['id']);
	unset($item);
}
$smarty = new Template();
echo $smarty->r('index');

/**
 * 验证发送表单
 */
function validate() {
	global $TEMPLATE;
	$check = true;
	if (strlen($_POST['content']) == 0) {
		$TEMPLATE['report']['check_cont'] = array(
			'status'	=> false,
			'msg'		=> '没有输入内容！',
		);
		$check = false;
	}
	if ($_POST['time'] == 'on' && strtotime($_POST['send_time']) < time() ) {
		$TEMPLATE['report']['check_time'] = array(
			'status'	=> false,
			'msg'		=> '定时发送时间比当前时间早，可能输入了一个错误的时间！',
		);
		$check = false;
	}
	if ($_POST['target'] == NULL) {
		$TEMPLATE['report']['check_select'] = array(
			'status'	=> false,
			'msg'		=> '没有选择任何微博平台！',
		);
		$check = false;
	}
	return $check;
}
/**
 * 判断平台checkbox是否可用，smarty模板
 * @param string $type
 */
function disabled($type) {
	global $thirdAccount;
	$arr = explode ('|', $type);
	$ret = $thirdAccount->getByType($arr[0], $arr[1]);
	if (!$ret || !$ret['valid'])
		return ' disabled title="未绑定账户"';
	if (Request::IsPost()) {
		if (!@in_array($type, $_POST['target']))
			return '';
	}
	return ' checked';
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