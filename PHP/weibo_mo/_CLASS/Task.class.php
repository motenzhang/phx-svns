<?php
/**
 * Task表读写类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Task extends DaoAbstract {
	protected $tableName = 'wt_task';

	const OK	= 100;	// 发送成功
	const DELETE_OK		= -10;	// 取消的
	const DELETE_ERR	= -20;
	const DELETE_TASK	= -30;
	const ERROR	= -1;	// 发送失败
	const TASK	= 0;	// 定时任务
	const EXECING= 1;	// 正在执行任务
	const TASK_EDIT = 2; // 修改中

	const RETRY_COUNT = 30;	// 失败重试次数

	/**
	 * 增加任务
	 * @param string $type
	 * @param string $content
	 * @param int|string $send_time
	 * @param string $pic
	 * @param int $status
	 * @param string $msg
	 * @param string $cat
	 * @param string $title
	 */
	public function AddTask($type, $content, $send_time, $pic = NULL,
							$status = Task::TASK, $msg = NULL, $cat = 'weibo', $title = NULL) {
		if (!is_int($send_time))	$send_time = strtotime($send_time);

		$type_arr = explode ('|', $type);
		$thirdAccount = new ThirdAccount();
		$third = $thirdAccount->getThird(Passport::GetLoginUid(), $type_arr[0], $type_arr[1]);

		$tableInfo = array(
			'uid'	=> Passport::GetLoginUid(),
			'pid'	=> $type_arr[1],
			'type'	=> $type,
			'url'	=> $third['url'],
			'cat'	=> $cat,
			'pic'	=> $pic,
			'title'	=> $title,
			'content'	=> $content,
			'send_time'	=> $send_time,
			'status'=> $status,
			'msg'=> $msg,
		);
		if (intval($tableInfo['uid']) <= 0) {
			Log::customLog('uid_0_error.txt', "产生UID为空的任务: \r\n" .
												print_r($tableInfo, true) .
												"\r\n-----------------------------------------\r\n" .
												print_r($_SERVER, true));
		}
		$this->insertIgnore($tableInfo);
	}
	/**
	 * 更改任务状态
	 * @param int $status
	 * @param int $id
	 * @param string $msg	状态描述
	 * @param int $send_time
	 */
	public function UpdateStatus($status, $id, $msg = NULL, $send_time = 0) {
		$tableInfo = array('status'=>$status, 'msg'=>$msg, 'last_send'=>time());
		if ($send_time)	$tableInfo['send_time'] = $send_time;
		if ($status == Task::ERROR) {
			$item = $this->get($id);
			$tableInfo['retry_count'] = $item['retry_count'] + 1;
		}
		if ($status == Task::OK) {
			$item = $this->get($id);
			$type_arr = explode ('|', $item['type']);
			$thirdAccount = new ThirdAccount();
			$third = $thirdAccount->getThird($item['uid'], $type_arr[0], $type_arr[1]);
			$tableInfo['url'] = $third['url'];
		}
		return $this->update($tableInfo, array('id'=>$id));
	}
	/**
	 * 获取将要执行的任务列表
	 */
	public function GetExecTasks() {
		$status = Task::TASK;
		$status_err = Task::ERROR;
		$now = time();
		$retry_count = Task::RETRY_COUNT;
		$sql = "select * from $this->tableName
				where (status = $status
						OR (status = $status_err AND retry_count < $retry_count))
					AND send_time <= $now
				order by send_time asc";
		return $this->db->fetchAll($sql, $this->primary_key);
	}
	/**
	 * 按状态或者当前登录用户的任务数
	 * @param int $status
	 */
	public  function GetCount($status) {
		$cond = array('status'=>$status);
		if (!Passport::IsAdmin()) {
			$cond['uid'] = Passport::GetLoginUid();
			$user = new User ();
			$perms = $user->getPerms ( Passport::GetLoginUid () );
			if (count($perms) > 0) {
				$cond['pid'] = array_keys($perms);
			} else {
				$cond['uid'] = Passport::GetLoginUid();
			}
		}
		return $this->totals($cond);
	}
	/**
	 * 按状态和分页获取任务列表
	 * @param int $status
	 * @param string $limit
	 */
	public function GetList($status, $limit = NULL) {
		$cond = array('status'=>$status);

		if (!Passport::IsAdmin()) {
			$user = new User ();
			$perms = $user->getPerms ( Passport::GetLoginUid () );
			if (count($perms) > 0) {
				$cond['pid'] = array_keys($perms);
			} else {
				$cond['uid'] = Passport::GetLoginUid();
			}
		}
		$list = $this->findBy($cond, $this->primary_key, $limit, null, 'send_time desc, id desc');
		// 查询 username 字段
		$uids = array();
		foreach ($list as $item) {
			$uids[] = $item['uid'];
		}
		$uids = array_unique($uids);
		$user = new User();
		$user_list = $user->gets($uids);
		foreach ($list as &$item) {
			$item['username'] = if_null($user_list[$item['uid']]['username'], 'uid: ' . $item['uid']);
			unset($item);
		}
		return $list;
	}
	public function ExecSql($sql) {
		return $this->db->fetchAll($sql, $this->primary_key);
	}
}