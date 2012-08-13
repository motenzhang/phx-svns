<?php
/**
 * 执行定时发送任务脚本，需用crontab执行
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'init.php';

// test curl
$curl = curl_init();
curl_close($curl);

// 设置执行超时时间（秒）
set_time_limit(500);

// 更新脚本最后执行时间
$user = new User();
$user->update(array('last_exec'=>time()), array());

$watch = new Stopwatch();
$watch->Start();

$task = new Task();
$tasks = $task->GetExecTasks();
$taskIds = array_keys($tasks);
$task->UpdateStatus(Task::EXECING, $taskIds);

$thirdAccount = new ThirdAccount();
foreach ($tasks as $id => $item) {
	if (str_contains($item['msg'], '验证码') || str_contains($item['msg'], 'valCodeError')) {
		if (time() - $item['last_send'] < 10 *60) {
			continue;
		}
	}
	if (str_contains($item['msg'], '重复发送') || str_contains($item['msg'], '用户调用次数超过限制')) {
		$task->update(array('retry_count' => 10), array('id' => $id));
		continue;
	}
	$type_arr = explode ('|', $item['type']);
	$third = $thirdAccount->getThird($item['uid'], $type_arr[0], $type_arr[1]);
	if ($third && $third['valid'] == 1) {
		$api = Factory::CreateAPI2($type_arr[0], $type_arr[1], $third);
		if ($item['cat'] == 'weibo') {
			$ret = $api->upload($item['content'], $item['pic']);
		} else {
			$ret = $api->publish($item['title'], $item['content']);
		}
	} else {
		$ret = $third ? '账号绑定过期，尚未重新绑定' : '账号绑定已取消';
	}
	if ($ret === true) {
		$task->UpdateStatus(Task::OK, $id);
		echo "任务#{$id}：发送成功<br>\r\n";
	} else {
		if (str_contains($ret, '已过期')) {
			$thirdAccount->fail($third, $ret);
		}
		$task->UpdateStatus(Task::ERROR, $id, $ret);
		echo "任务#{$id}：发送失败：$ret<br>\r\n";
	}
	usleep(500 * 1000);
}

$watch->Stop();
$count = count($tasks);
echo "共{$count}个任务，总耗时：{$watch->getElapsedSeconds()} 秒<br>\r\n";

echo "\r\nOK";
