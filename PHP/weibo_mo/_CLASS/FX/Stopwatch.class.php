<?php
/**
 * 计时器类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Stopwatch {
	private $isRunning = false;
	private $startTimeStamp;
	public  $elapsed;

	public function __construct() {
	}
	/**
	 * 开始计时
	 */
	public function Start() {
		if (!$this->isRunning) {
			$this->startTimeStamp = microtime(true);
			$this->isRunning = true;
		}
	}
	/**
	 * 停止计时
	 */
	public function Stop() {
		if ($this->isRunning) {
			$this->elapsed = microtime(true) - $this->startTimeStamp;
			$this->isRunning = false;
		}
	}
	/**
	 * 获取耗时
	 * @param int $decimals	number_format第二个参数
	 */
	public function getElapsedSeconds($decimals = 1) {
		return number_format($this->elapsed, $decimals);
	}
}