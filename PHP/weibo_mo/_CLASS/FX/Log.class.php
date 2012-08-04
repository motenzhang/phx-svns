<?php
/**
 * @name Log.class.php
 * @desc YEPF日志文件记录类
 * @author 曹晓冬
 * @createtime 2009-03-30 15:46
 * @updatetime
 * @usage
 */
class Log
{
	protected $path ;
	static $instance = false;
	/**
	 * @name __construct
	 * @desc 构造函数
	 */
	protected function __construct()
	{
		$this->path = LOG_PATH;
	}
	/**
	 * @name getInstance
	 * @desc 返回Log类的实例
	 * @return object of instance
	 */
	static public function getInstance()
	{
		if(false === self::$instance)
		{
			self::$instance = new Log();
		}
		return self::$instance;
	}
	/**
	 * @name sysLog
	 * @desc 采用 syslog 记录系统日志,操作系统必须为linux,记录至系统日志local4中,请修改/etc/syslog.conf文件
	 * @param string $ident 日志
	 * @param string $string 日志信息
	 */
	public function sysLog($ident, $errstr)
	{
		if(!defined('LOG_LOCAL4') && !empty($_ENV['OS']) && substr($_ENV['OS'], 0 , 7) == 'Windows')
		{
			$filename = "syslog_" . date('Ymd') . '.log';
			return Log::customLog($filename, $errstr);
		}else
		{
			openlog($ident, LOG_PID | LOG_PERROR, LOG_SYSLOG);
			syslog(LOG_ALERT, $errstr);
			closelog();
		}
	}
	/**
	 * @name customLog
	 * @desc 记录自定义日志,请注意日志文件大小问题
	 * @param string $filename 记录日志的文件名
	 * @param string $msg    错误信息
	 * @param int $priority  接受的类型
	 * LOG_EMERG system is unusable
	 * LOG_ALERT action must be taken immediately
	 * LOG_CRIT critical conditions
	 * LOG_ERR error conditions
	 * LOG_WARNING warning conditions
	 * LOG_NOTICE normal, but significant, condition
	 * LOG_INFO informational message
	 * LOG_DEBUG debug-level message
	 */
	static public function customLog($filename, $msg, $priority = '')
	{
		$log_obj = LOG::getInstance();
		$string = "" ;
		$string .= "/*********************** ".$priority." ".date('Y-m-d H:i:s')." ***********************/\r\n";
		$string .= $msg . "\r\n";
		$fp = fopen($log_obj->path . DIRECTORY_SEPARATOR . $filename, 'a');
		flock($fp, LOCK_EX);
		fwrite($fp, $string);
		flock($fp, LOCK_UN);
		fclose($fp);
		return true;
	}
}
?>