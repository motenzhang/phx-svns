<?php
/**
 * 发博客
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
		// 首先获取内容中包含的远程图片，并替换为本地图片
		$content = save_remote_img($_POST['content']);
		$wbs = $_POST['target'];
		$task = new Task();
		if ($_POST['time'] == 'on') {
			// 定时发送
			foreach ($wbs as $type) {
				$task->AddTask($type, $content, $_POST['send_time'], NULL, Task::TASK, NULL, 'blog', $_POST['title']);
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
				$type_arr = explode ('|', $type);
				$third = $thirdAccount->getByType($type_arr[0], $type_arr[1]);
				$api = Factory::CreateAPI2($type_arr[0], $type_arr[1], $third);
				$ret = $api->publish($_POST['title'], $content);
				if ($ret !== true && str_contains($ret, '已过期')) {
					$thirdAccount->fail($third, $ret);
				}
				$TEMPLATE['report'][$type] = array(
					'status'	=> ($ret === true),
					 'msg'		=> ($ret === true ?
					 					('发送成功！' . ($third['url'] ? '<a href="' . $third['url'] . '" target="_blank">查看</a>' : ''))
										: ('发送失败：' . $ret . ' <a href="list_err.php">重新发送</a>')),
				);
				$task->AddTask($type, $content, time(), NULL, $ret === true ? Task::OK : Task::ERROR, $ret, 'blog', $_POST['title']);
			}
			$watch->Stop();
			$TEMPLATE['report']['watch'] = array(
				'status'	=> true,
				'msg'		=> "总耗时：{$watch->getElapsedSeconds()} 秒",
			);
		}
	}
}


$TEMPLATE['title'] = '发博客';
$TEMPLATE['login_name'] = Passport::GetLoginName();
$TEMPLATE['nav']['blog'] = 'current';
$TEMPLATE['target_list'] = $wt_open->getBlogList();
$TEMPLATE['platform_list'] = $wt_open->getPlatformList();
foreach ($TEMPLATE['platform_list'] as &$item) {
	$item['list'] = $wt_open->getBlogList($item['id']);
	unset($item);
}
$smarty = new Template();
echo $smarty->r('blog');

function validate() {
	global $TEMPLATE;
	$check = true;
	if (strlen($_POST['title']) == 0 || strlen($_POST['content']) == 0) {
		$TEMPLATE['report']['check_cont'] = array(
			'status'	=> false,
			'msg'		=> '标题和内容均不能为空！',
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
			'msg'		=> '没有选择任何博客平台！',
		);
		$check = false;
	}
	return $check;
}

function save_remote_img ($content) {
	if (preg_match_all('#<img .*?src="(.+?)".*?>#i', $content, $matches)) {
		foreach ($matches[1] as $img) {
			$img_host = parse_url($img, PHP_URL_HOST);
			if (empty($img_host) ||
					strtolower($img_host) == strtolower($_SERVER['HTTP_HOST'])) {
				continue;
			}
			$new_name = microtime(true) . '_' . basename($img);
			$mappath = UPLOAD_PATH . $new_name;
			$client = new WebClient(NULL, 10);
			$img_data = $client->get($img);
			@mkdir(UPLOAD_PATH, 0777, true);
			if (!empty($img_data) && file_put_contents($mappath, $img_data)) {
				$content = str_replace($img, get_absolute_url(UPLOAD_PATH_WWW . $new_name), $content);
			}
		}
	}
	return $content;
}

function disabled($type) {
	global $thirdAccount;
	$type_arr = explode ('|', $type);
	$ret = $thirdAccount->getByType($type_arr[0], $type_arr[1]);
	if (!$ret || !$ret['valid'])
		return ' disabled title="未绑定账户"';
	if (Request::IsPost()) {
		if (!@in_array($type, $_POST['target']))
			return '';
	}
	return ' checked';
}

function get_name_r($type){
	$name = get_name($type, 'blog');
	if ($name)
		return  $name . '：';
}