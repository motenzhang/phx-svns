<?php
/**
 * @name Debug.class.php
 * @desc YEPF调试类,基于FirePHP
 * @author 曹晓冬
 * @createtime 2009-01-15 11:18
 * @updatetime 2009-03-30 15:26
 * @usage
 * 	//Debug开关打开
 *	Debug::start();
 *	//注册shutdown函数用来Debug显示
 *	register_shutdown_function(array('Debug', 'show'));
 * @todo
 */
class Debug
{
	/**
	 * @desc Debug开关,默认为关闭
	 * @var bool
	 */
	static $open = false ;
	/**
	 * @desc Debug类实例化对象
	 * @var bool
	 */
	static $instance = false;
	/**
	 * @desc 运行时间显示数组
	 * @var array
	 */
	static $time_table = array();
	/**
	 * @desc 用户自定义中间变量显示数组
	 * @var array
	 */
	static $log_table = array();
	/**
	 * @desc 数据库查询执行时间数组
	 * @var array
	 */
	static $db_table = array();
	/**
	 * @desc 缓存查询执行时间数组
	 * @var array
	 */
	static $cache_table = array();
	/**
	 * @desc 表单方式的接口
	 */
	static $form_table = array();
	/**
	 * @desc 起始时间
	 * @var int
	 */
	static $begin_time;
	/**
	 * @name __construct
	 * @desc 构造函数
	 */
	protected function __construct()
	{

	}
	/**
	 * @name start
	 * @desc 启动debug类
	 * @return null
	 */
	static public function start()
	{
		self::$open = true;
		self::$begin_time = microtime();
		self::$time_table = array(array('Description', 'Time', 'Caller'));
		self::$log_table = array(array('Label', 'Results', 'Caller'));
	}
	/**
	 * @name getTime
	 * @desc 获得从起始时间到目前为止所花费的时间
	 * @return int
	 */
	static public function getTime()
	{
		if(false === self::$open)
		{
			return ;
		}
    	list($pusec, $psec) = explode(" ", self::$begin_time);
    	list($usec, $sec) = explode(" ", microtime());
		return ((float)$usec - (float)$pusec) + ((float)$sec - (float)$psec);
	}
	/**
	 * @name getInstance
	 * @desc 返回debug类的实例
	 * @return object
	 */
	static public function getInstance()
	{
		if(false === self::$instance)
		{
			self::$instance = &new Debug();
		}
		return self::$instance;
	}
	/**
	 * @name log
	 * @desc 记录用户自定义变量
	 * @param string $label 自定义变量显示名称
	 * @param mixed $results 自定义变量结果
	 * @param string $callfile 调用记录用户自定义变量的文件名
	 * @return null
	 * @access public
	 */
	static public function log($label, $results = '', $caller = '')
	{
		if(false === self::$open || (defined('DEBUG_SHOW_LOG') && !DEBUG_SHOW_LOG))
		{
			return ;
		}
		if($results == '')$results = $GLOBALS[$label];
		array_push(self::$log_table, array($label, $results, $caller));
	}
	/**
	 * @name db
	 * @desc 记录数据库查询操作执行时间
	 * @param string $ip 数据库IP
	 * @param int $port 数据库端口
	 * @param string $sql 执行的SQL语句
	 * @param float $times 花费时间
	 * @param mixed $results 查询结果
	 * @return null
	 * @access public
	 */
	static public function db($ip, $database ,$sql, $times, $results)
	{
		if(false === self::$open || (defined('DEBUG_SHOW_DB') && !DEBUG_SHOW_DB))
		{
			return ;
		}
		array_push(self::$db_table, array($ip, $database, $times, $sql, $results));
	}
	/**
	 * @name cache
	 * @desc 缓存查询执行时间
	 * @param array $server 缓存服务器及端口列表
	 * @param string $key 缓存所使用的key
	 * @param float $times 花费时间
	 * @param mixed $results 查询结果
	 * @return null
	 * @access public
	 */
	static public function cache($server, $key, $times, $results, $method = null)
	{
		if(false === self::$open || (defined('DEBUG_SHOW_CACHE') && !DEBUG_SHOW_CACHE))
		{
			return ;
		}
		array_push(self::$cache_table, array($server ,$key, $times, $results, $method));
	}
	/**
	 * @name time
	 * @desc 记录程序执行时间
	 * @param string $desc 描述
	 * @param mixed $results 结果
	 * @return null
	 * @access public
	 */
	static public function time($desc, $caller)
	{
		if(false === self::$open || (defined('DEBUG_SHOW_TIME') && !DEBUG_SHOW_TIME))
		{
			return ;
		}
		array_push(self::$time_table, array($desc, self::getTime(), $caller));
	}
	/**
	 * 记录form表单的方式接口请求
	 * @param label 说明标签
	 * @param action 表单的请求地址
	 * @param params 表单的数据项
	 * @param caller 处理程序
	 */
	static public function form($label, $action, $params = array(),$method='post', $times = 0, $results = '', $caller = __FILE__)
	{
		if (false === self::$open || (defined('DEBUG_SHOW_FORM') && !DEBUG_SHOW_FORM))
		{
			return ;
		}
		$form_html = '<html><head><meta http-equiv="content-type" content="text/html;charset=utf-8" /><title>Debug Form</title></head><body><form action="'.$action.'" method="'.$method.'">';
		if ($params)
		{
			foreach ($params as $k => $v)
			{
				$form_html .= $k.': <input type="text" name="'.$k.'" value="'.$v.'" /><br/>';
			}
		}
		$form_html .= '<input type="submit" value="submit" /></form></body></html>';
		array_push(self::$form_table, array($label, $form_html, $times, $results, $caller));
	}
	/**
	 * @name fb
	 * @desc 调用FirePHP函数
	 * @return mixed
	 * @access public
	 */
	static public function fb()
	{
		$instance = FirePHP::getInstance(true);
		$args = func_get_args();
		return call_user_func_array(array($instance,'fb'),$args);
	}
	/**
	 * @name show
	 * @desc 显示调试信息
	 * @todo 目前只实现了在FirePHP中显示结果.需要实现记录LOG日志形式
	 * @return null
	 * @access public
	 */
	static public function show()
	{
		global $YOKA, $TEMPLATE, $CFG;
		if (!defined('DEBUG_SHOW_LOG') || (defined('DEBUG_SHOW_LOG') && DEBUG_SHOW_LOG))
		{
			//用户记录变量
			Debug::fb(array('Custom Log Object', self::$log_table), FirePHP::TABLE );
		}
		if (!defined('DEBUG_SHOW_TIME') || (defined('DEBUG_SHOW_TIME') && DEBUG_SHOW_TIME))
		{
			//页面执行时间
			Debug::fb(array('This Page Spend Times ' . self::getTime(), self::$time_table), FirePHP::TABLE );
		}

		/*---------记录至日记文件中------------*/
		if(count(self::$log_table) > 1 || count(self::$time_table) > 1)
		{
			if(isset($_SERVER['TERM']))
			{
				$string = "PWD：" . $_SERVER['PWD'] . "\n";
				$string .= "SCRIPT_NAME：" . $_SERVER['SCRIPT_NAME'] . "\n";
				$string .= "ARGV：" . var_export($_SERVER['argv'], true) . "\n";
			}else
			{
				$string = "HTTP_HOST：" . $_SERVER['HTTP_HOST'] . "\n";
				$string .= "SCRIPT_NAME：" . $_SERVER['SCRIPT_NAME'] . "\n";
				$string .= "QUERY_STRING：" . $_SERVER['QUERY_STRING'] . "\n";
			}
			$string .= 'This Page Spend Times：' . self::getTime() . "\n";
			array_shift(self::$log_table);
			array_shift(self::$time_table);
			if(!empty(self::$time_table))
			{
				$string .= "\n";
				foreach (self::$time_table as $v)
				{
					$string .= "|--  ".$v[0]."  ".$v[1]."  ".$v[2]."  --|\n";
				}
			}
			if(!empty(self::$log_table))
			{
				$string .= "\n";
				foreach (self::$log_table as $v)
				{
					$string .= "|----  ".$v[0]."  ".$v[2]."  ----|\n";
					$string .= var_export($v[1], true) . "\n";
				}
			}
			$filename = "debug_" . date("Ymd") . ".log";
			Log::customLog($filename, $string);
		}
		//数据库执行时间
		if(count(self::$db_table) > 0)
		{
			$i = 0 ;
			$db_total_times = 0 ;
			foreach (self::$db_table as $v)
			{
				$db_total_times += $v[2];
				$i++;
			}
			array_unshift(self::$db_table, array('IP', 'Database', 'Time', 'SQL Statement','Results'));
			Debug::fb(array($i . ' SQL queries took '.$db_total_times.' seconds', self::$db_table), FirePHP::TABLE );
		}
		//Cache执行时间
		if(count(self::$cache_table) > 0)
		{
			$i = 0 ;
			$cache_total_times = 0 ;
			foreach (self::$cache_table as $v)
			{
				$cache_total_times += $v[2];
				$i++;
			}
			array_unshift(self::$cache_table, array('Server', 'Cache Key', 'Time','Results', 'Method'));
			Debug::fb(array($i.' Cache queries took '.$cache_total_times.' seconds', self::$cache_table), FirePHP::TABLE );
		}
		//Form执行时间
		if(self::$form_table)
		{
			$i = 0;
			$form_total_times = 0;
			foreach (self::$form_table as $v)
			{
				$form_total_times += $v[2];
				$i++;
			}
			array_unshift(self::$form_table, array('Label', 'FormHtml', 'Times', 'Results', 'Caller'));
			Debug::fb(array($i.' Form action request took '.$form_total_times.' seconds', self::$form_table), FirePHP::TABLE );
		}

		if (!defined('DEBUG_SHOW_UTILITY') || (defined('DEBUG_SHOW_UTILITY') && DEBUG_SHOW_UTILITY))
		{
			//自定义函数
			$functions = get_defined_functions();
			//定义的常量
			$constants = get_defined_constants(true);
			$sessions = isset($_SESSION) ? $_SESSION : array();
			Debug::fb(array('Utility Variables',
					  array(
						array('name', 'values'),
						array('GET Variables', $_GET),
						array('POST Variables', $_POST),
						array('Custom Defined Functions', $functions['user']),
						array('Include Files', get_included_files()),
						array('Defined Constants', $constants['user']),
						array('SESSION Variables', $sessions),
						array('SERVER Variables', $_SERVER),
						array('$YOKA', $YOKA),
						array('$TEMPLATE', $TEMPLATE),
						array('$CFG', $CFG),
					  )
			), FirePHP::TABLE );
		}
	}
}

class FirePHP {


  const VERSION = '0.2.1';

  const LOG = 'LOG';

  const INFO = 'INFO';

  const WARN = 'WARN';

  const ERROR = 'ERROR';

  const DUMP = 'DUMP';

  const TRACE = 'TRACE';

  const EXCEPTION = 'EXCEPTION';

  const TABLE = 'TABLE';

  const GROUP_START = 'GROUP_START';

  const GROUP_END = 'GROUP_END';

  protected static $instance = null;

  protected $messageIndex = 1;

  protected $options = array();

  protected $objectFilters = array();

  protected $objectStack = array();

  protected $enabled = true;

  function __construct() {
    $this->options['maxObjectDepth'] = 10;
    $this->options['maxArrayDepth'] = 20;
    $this->options['useNativeJsonEncode'] = true;
    $this->options['includeLineNumbers'] = true;
  }

  public function __sleep() {
    return array('options','objectFilters','enabled');
  }

  public static function getInstance($AutoCreate=false) {
    if($AutoCreate===true && !self::$instance) {
      self::init();
    }
    return self::$instance;
  }

  public static function init() {
    return self::$instance = new self();
  }

  public function setEnabled($Enabled) {
    $this->enabled = $Enabled;
  }

  public function getEnabled() {
    return $this->enabled;
  }

  public function setObjectFilter($Class, $Filter) {
    $this->objectFilters[$Class] = $Filter;
  }

  public function setOptions($Options) {
    $this->options = array_merge($this->options,$Options);
  }

  public function registerErrorHandler()
  {
    set_error_handler(array($this,'errorHandler'));
  }

  public function errorHandler($errno, $errstr, $errfile, $errline, $errcontext)
  {
    // Don't throw exception if error reporting is switched off
    if (error_reporting() == 0) {
      return;
    }
    // Only throw exceptions for errors we are asking for
    if (error_reporting() & $errno) {
      throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
    }
  }

  public function registerExceptionHandler()
  {
    set_exception_handler(array($this,'exceptionHandler'));
  }

  function exceptionHandler($Exception) {
    $this->fb($Exception);
  }

  public function setProcessorUrl($URL)
  {
    $this->setHeader('X-FirePHP-ProcessorURL', $URL);
  }

  public function setRendererUrl($URL)
  {
    $this->setHeader('X-FirePHP-RendererURL', $URL);
  }

  public function group($Name) {
    return $this->fb(null, $Name, FirePHP::GROUP_START);
  }

  public function groupEnd() {
    return $this->fb(null, null, FirePHP::GROUP_END);
  }

  public function log($Object, $Label=null) {
    return $this->fb($Object, $Label, FirePHP::LOG);
  }

  public function info($Object, $Label=null) {
    return $this->fb($Object, $Label, FirePHP::INFO);
  }

  public function warn($Object, $Label=null) {
    return $this->fb($Object, $Label, FirePHP::WARN);
  }

  public function error($Object, $Label=null) {
    return $this->fb($Object, $Label, FirePHP::ERROR);
  }

  public function dump($Key, $Variable) {
    return $this->fb($Variable, $Key, FirePHP::DUMP);
  }

  public function trace($Label) {
    return $this->fb($Label, FirePHP::TRACE);
  }

  public function table($Label, $Table) {
    return $this->fb($Table, $Label, FirePHP::TABLE);
  }

  public function detectClientExtension() {
    /* Check if FirePHP is installed on client */
    if(!@preg_match_all('/\sFirePHP\/([\.|\d]*)\s?/si',$this->getUserAgent(),$m) ||
       !version_compare($m[1][0],'0.0.6','>=')) {
      return false;
    }
    return true;
  }

  public function fb($Object) {

    if(!$this->enabled) {
      return false;
    }

    if (headers_sent($filename, $linenum)) {
        throw $this->newException('Headers already sent in '.$filename.' on line '.$linenum.'. Cannot send log data to FirePHP. You must have Output Buffering enabled via ob_start() or output_buffering ini directive.');
    }

    $Type = null;
    $Label = null;

    if(func_num_args()==1) {
    } else
    if(func_num_args()==2) {
      switch(func_get_arg(1)) {
        case self::LOG:
        case self::INFO:
        case self::WARN:
        case self::ERROR:
        case self::DUMP:
        case self::TRACE:
        case self::EXCEPTION:
        case self::TABLE:
        case self::GROUP_START:
        case self::GROUP_END:
          $Type = func_get_arg(1);
          break;
        default:
          $Label = func_get_arg(1);
          break;
      }
    } else
    if(func_num_args()==3) {
      $Type = func_get_arg(2);
      $Label = func_get_arg(1);
    } else {
      throw $this->newException('Wrong number of arguments to fb() function!');
    }


    if(!$this->detectClientExtension()) {
      return false;
    }

    $meta = array();
    $skipFinalObjectEncode = false;

    if($Object instanceof Exception) {

      $meta['file'] = $this->_escapeTraceFile($Object->getFile());
      $meta['line'] = $Object->getLine();

      $trace = $Object->getTrace();
      if($Object instanceof ErrorException
         && isset($trace[0]['function'])
         && $trace[0]['function']=='errorHandler'
         && isset($trace[0]['class'])
         && $trace[0]['class']=='FirePHP') {

        $severity = false;
        switch($Object->getSeverity()) {
          case E_WARNING: $severity = 'E_WARNING'; break;
          case E_NOTICE: $severity = 'E_NOTICE'; break;
          case E_USER_ERROR: $severity = 'E_USER_ERROR'; break;
          case E_USER_WARNING: $severity = 'E_USER_WARNING'; break;
          case E_USER_NOTICE: $severity = 'E_USER_NOTICE'; break;
          case E_STRICT: $severity = 'E_STRICT'; break;
          case E_RECOVERABLE_ERROR: $severity = 'E_RECOVERABLE_ERROR'; break;
          case E_DEPRECATED: $severity = 'E_DEPRECATED'; break;
          case E_USER_DEPRECATED: $severity = 'E_USER_DEPRECATED'; break;
        }

        $Object = array('Class'=>get_class($Object),
                        'Message'=>$severity.': '.$Object->getMessage(),
                        'File'=>$this->_escapeTraceFile($Object->getFile()),
                        'Line'=>$Object->getLine(),
                        'Type'=>'trigger',
                        'Trace'=>$this->_escapeTrace(array_splice($trace,2)));
        $skipFinalObjectEncode = true;
      } else {
        $Object = array('Class'=>get_class($Object),
                        'Message'=>$Object->getMessage(),
                        'File'=>$this->_escapeTraceFile($Object->getFile()),
                        'Line'=>$Object->getLine(),
                        'Type'=>'throw',
                        'Trace'=>$this->_escapeTrace($trace));
        $skipFinalObjectEncode = true;
      }
      $Type = self::EXCEPTION;

    } else
    if($Type==self::TRACE) {

      $trace = debug_backtrace();
      if(!$trace) return false;
      for( $i=0 ; $i<sizeof($trace) ; $i++ ) {

        if(isset($trace[$i]['class'])
           && isset($trace[$i]['file'])
           && ($trace[$i]['class']=='FirePHP'
               || $trace[$i]['class']=='FB')
           && (substr($this->_standardizePath($trace[$i]['file']),-18,18)=='FirePHPCore/fb.php'
               || substr($this->_standardizePath($trace[$i]['file']),-29,29)=='FirePHPCore/FirePHP.class.php')) {
          /* Skip - FB::trace(), FB::send(), $firephp->trace(), $firephp->fb() */
        } else
        if(isset($trace[$i]['class'])
           && isset($trace[$i+1]['file'])
           && $trace[$i]['class']=='FirePHP'
           && substr($this->_standardizePath($trace[$i+1]['file']),-18,18)=='FirePHPCore/fb.php') {
          /* Skip fb() */
        } else
        if($trace[$i]['function']=='fb'
           || $trace[$i]['function']=='trace'
           || $trace[$i]['function']=='send') {
          $Object = array('Class'=>isset($trace[$i]['class'])?$trace[$i]['class']:'',
                          'Type'=>isset($trace[$i]['type'])?$trace[$i]['type']:'',
                          'Function'=>isset($trace[$i]['function'])?$trace[$i]['function']:'',
                          'Message'=>$trace[$i]['args'][0],
                          'File'=>isset($trace[$i]['file'])?$this->_escapeTraceFile($trace[$i]['file']):'',
                          'Line'=>isset($trace[$i]['line'])?$trace[$i]['line']:'',
                          'Args'=>isset($trace[$i]['args'])?$this->encodeObject($trace[$i]['args']):'',
                          'Trace'=>$this->_escapeTrace(array_splice($trace,$i+1)));

          $skipFinalObjectEncode = true;
          $meta['file'] = isset($trace[$i]['file'])?$this->_escapeTraceFile($trace[$i]['file']):'';
          $meta['line'] = isset($trace[$i]['line'])?$trace[$i]['line']:'';
          break;
        }
      }

    } else
    if($Type==self::TABLE) {

      if(isset($Object[0]) && is_string($Object[0])) {
        $Object[1] = $this->encodeTable($Object[1]);
      } else {
        $Object = $this->encodeTable($Object);
      }

      $skipFinalObjectEncode = true;

    } else {
      if($Type===null) {
        $Type = self::LOG;
      }
    }

    if($this->options['includeLineNumbers']) {
      if(!isset($meta['file']) || !isset($meta['line'])) {

        $trace = debug_backtrace();
        for( $i=0 ; $trace && $i<sizeof($trace) ; $i++ ) {

          if(isset($trace[$i]['class'])
             && isset($trace[$i]['file'])
             && ($trace[$i]['class']=='FirePHP'
                 || $trace[$i]['class']=='FB')
             && (substr($this->_standardizePath($trace[$i]['file']),-18,18)=='FirePHPCore/fb.php'
                 || substr($this->_standardizePath($trace[$i]['file']),-29,29)=='FirePHPCore/FirePHP.class.php')) {
            /* Skip - FB::trace(), FB::send(), $firephp->trace(), $firephp->fb() */
          } else
          if(isset($trace[$i]['class'])
             && isset($trace[$i+1]['file'])
             && $trace[$i]['class']=='FirePHP'
             && substr($this->_standardizePath($trace[$i+1]['file']),-18,18)=='FirePHPCore/fb.php') {
            /* Skip fb() */
          } else
          if(isset($trace[$i]['file'])
             && substr($this->_standardizePath($trace[$i]['file']),-18,18)=='FirePHPCore/fb.php') {
            /* Skip FB::fb() */
          } else {
            $meta['file'] = isset($trace[$i]['file'])?$this->_escapeTraceFile($trace[$i]['file']):'';
            $meta['line'] = isset($trace[$i]['line'])?$trace[$i]['line']:'';
            break;
          }
        }

      }
    } else {
      unset($meta['file']);
      unset($meta['line']);
    }

  	$this->setHeader('X-Wf-Protocol-1','http://meta.wildfirehq.org/Protocol/JsonStream/0.2');
  	$this->setHeader('X-Wf-1-Plugin-1','http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/'.self::VERSION);

    $structure_index = 1;
    if($Type==self::DUMP) {
      $structure_index = 2;
    	$this->setHeader('X-Wf-1-Structure-2','http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1');
    } else {
    	$this->setHeader('X-Wf-1-Structure-1','http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1');
    }

    if($Type==self::DUMP) {
    	$msg = '{"'.$Label.'":'.$this->jsonEncode($Object, $skipFinalObjectEncode).'}';
    } else {
      $msg_meta = array('Type'=>$Type);
      if($Label!==null) {
        $msg_meta['Label'] = $Label;
      }
      if(isset($meta['file'])) {
        $msg_meta['File'] = $meta['file'];
      }
      if(isset($meta['line'])) {
        $msg_meta['Line'] = $meta['line'];
      }
    	$msg = '['.$this->jsonEncode($msg_meta).','.$this->jsonEncode($Object, $skipFinalObjectEncode).']';
    }

    $parts = explode("\n",chunk_split($msg, 5000, "\n"));

    for( $i=0 ; $i<count($parts) ; $i++) {

        $part = $parts[$i];
        if ($part) {

            if(count($parts)>2) {
              // Message needs to be split into multiple parts
              $this->setHeader('X-Wf-1-'.$structure_index.'-'.'1-'.$this->messageIndex,
                               (($i==0)?strlen($msg):'')
                               . '|' . $part . '|'
                               . (($i<count($parts)-2)?'\\':''));
            } else {
              $this->setHeader('X-Wf-1-'.$structure_index.'-'.'1-'.$this->messageIndex,
                               strlen($part) . '|' . $part . '|');
            }

            $this->messageIndex++;

            if ($this->messageIndex > 99999) {
                throw new Exception('Maximum number (99,999) of messages reached!');
            }
        }
    }

  	$this->setHeader('X-Wf-1-Index',$this->messageIndex-1);

    return true;
  }

  protected function _standardizePath($Path) {
    return preg_replace('/\\\\+/','/',$Path);
  }

  protected function _escapeTrace($Trace) {
    if(!$Trace) return $Trace;
    for( $i=0 ; $i<sizeof($Trace) ; $i++ ) {
      if(isset($Trace[$i]['file'])) {
        $Trace[$i]['file'] = $this->_escapeTraceFile($Trace[$i]['file']);
      }
      if(isset($Trace[$i]['args'])) {
        $Trace[$i]['args'] = $this->encodeObject($Trace[$i]['args']);
      }
    }
    return $Trace;
  }

  protected function _escapeTraceFile($File) {
    /* Check if we have a windows filepath */
    if(strpos($File,'\\')) {
      /* First strip down to single \ */

      $file = preg_replace('/\\\\+/','\\',$File);

      return $file;
    }
    return $File;
  }

  protected function setHeader($Name, $Value) {
    return header($Name.': '.$Value);
  }

  protected function getUserAgent() {
    if(!isset($_SERVER['HTTP_USER_AGENT'])) return false;
    return $_SERVER['HTTP_USER_AGENT'];
  }

  protected function newException($Message) {
    return new Exception($Message);
  }

  public function jsonEncode($Object, $skipObjectEncode=false)
  {
    if(!$skipObjectEncode) {
      $Object = $this->encodeObject($Object);
    }

    if(function_exists('json_encode')
       && $this->options['useNativeJsonEncode']!=false) {

      return json_encode($Object);
    } else {
      return $this->json_encode($Object);
    }
  }

  protected function encodeTable($Table) {
    if(!$Table) return $Table;
    for( $i=0 ; $i<count($Table) ; $i++ ) {
      if(is_array($Table[$i])) {
        for( $j=0 ; $j<count($Table[$i]) ; $j++ ) {
          $Table[$i][$j] = $this->encodeObject($Table[$i][$j]);
        }
      }
    }
    return $Table;
  }

  protected function encodeObject($Object, $ObjectDepth = 1, $ArrayDepth = 1)
  {
    $return = array();

    if (is_resource($Object)) {

      return '** '.(string)$Object.' **';

    } else
    if (is_object($Object)) {

        if ($ObjectDepth > $this->options['maxObjectDepth']) {
          return '** Max Object Depth ('.$this->options['maxObjectDepth'].') **';
        }

        foreach ($this->objectStack as $refVal) {
            if ($refVal === $Object) {
                return '** Recursion ('.get_class($Object).') **';
            }
        }
        array_push($this->objectStack, $Object);

        $return['__className'] = $class = get_class($Object);

        $reflectionClass = new ReflectionClass($class);
        $properties = array();
        foreach( $reflectionClass->getProperties() as $property) {
          $properties[$property->getName()] = $property;
        }

        $members = (array)$Object;

        foreach( $properties as $raw_name => $property ) {

          $name = $raw_name;
          if($property->isStatic()) {
            $name = 'static:'.$name;
          }
          if($property->isPublic()) {
            $name = 'public:'.$name;
          } else
          if($property->isPrivate()) {
            $name = 'private:'.$name;
            $raw_name = "\0".$class."\0".$raw_name;
          } else
          if($property->isProtected()) {
            $name = 'protected:'.$name;
            $raw_name = "\0".'*'."\0".$raw_name;
          }

          if(!(isset($this->objectFilters[$class])
               && is_array($this->objectFilters[$class])
               && in_array($raw_name,$this->objectFilters[$class]))) {

            if(array_key_exists($raw_name,$members)
               && !$property->isStatic()) {

              $return[$name] = $this->encodeObject($members[$raw_name], $ObjectDepth + 1, 1);

            } else {
              if(method_exists($property,'setAccessible')) {
                $property->setAccessible(true);
                $return[$name] = $this->encodeObject($property->getValue($Object), $ObjectDepth + 1, 1);
              } else
              if($property->isPublic()) {
                $return[$name] = $this->encodeObject($property->getValue($Object), $ObjectDepth + 1, 1);
              } else {
                $return[$name] = '** Need PHP 5.3 to get value **';
              }
            }
          } else {
            $return[$name] = '** Excluded by Filter **';
          }
        }

        // Include all members that are not defined in the class
        // but exist in the object
        foreach( $members as $raw_name => $value ) {

          $name = $raw_name;

          if ($name{0} == "\0") {
            $parts = explode("\0", $name);
            $name = $parts[2];
          }

          if(!isset($properties[$name])) {
            $name = 'undeclared:'.$name;

            if(!(isset($this->objectFilters[$class])
                 && is_array($this->objectFilters[$class])
                 && in_array($raw_name,$this->objectFilters[$class]))) {

              $return[$name] = $this->encodeObject($value, $ObjectDepth + 1, 1);
            } else {
              $return[$name] = '** Excluded by Filter **';
            }
          }
        }

        array_pop($this->objectStack);

    } elseif (is_array($Object)) {

        if ($ArrayDepth > $this->options['maxArrayDepth']) {
          return '** Max Array Depth ('.$this->options['maxArrayDepth'].') **';
        }

        foreach ($Object as $key => $val) {

          // Encoding the $GLOBALS PHP array causes an infinite loop
          // if the recursion is not reset here as it contains
          // a reference to itself. This is the only way I have come up
          // with to stop infinite recursion in this case.
          if($key=='GLOBALS'
             && is_array($val)
             && array_key_exists('GLOBALS',$val)) {
            $val['GLOBALS'] = '** Recursion (GLOBALS) **';
          }

          $return[$key] = $this->encodeObject($val, 1, $ArrayDepth + 1);
        }
    } else {
      if(self::is_utf8($Object)) {
        return $Object;
      } else {
        return utf8_encode($Object);
      }
    }
    return $return;
  }

  protected static function is_utf8($str) {
    $c=0; $b=0;
    $bits=0;
    $len=strlen($str);
    for($i=0; $i<$len; $i++){
        $c=ord($str[$i]);
        if($c > 128){
            if(($c >= 254)) return false;
            elseif($c >= 252) $bits=6;
            elseif($c >= 248) $bits=5;
            elseif($c >= 240) $bits=4;
            elseif($c >= 224) $bits=3;
            elseif($c >= 192) $bits=2;
            else return false;
            if(($i+$bits) > $len) return false;
            while($bits > 1){
                $i++;
                $b=ord($str[$i]);
                if($b < 128 || $b > 191) return false;
                $bits--;
            }
        }
    }
    return true;
  }

  private $json_objectStack = array();

  private function json_utf82utf16($utf8)
  {
      // oh please oh please oh please oh please oh please
      if(function_exists('mb_convert_encoding')) {
          return mb_convert_encoding($utf8, 'UTF-16', 'UTF-8');
      }

      switch(strlen($utf8)) {
          case 1:
              // this case should never be reached, because we are in ASCII range
              // see: http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
              return $utf8;

          case 2:
              // return a UTF-16 character from a 2-byte UTF-8 char
              // see: http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
              return chr(0x07 & (ord($utf8{0}) >> 2))
                   . chr((0xC0 & (ord($utf8{0}) << 6))
                       | (0x3F & ord($utf8{1})));

          case 3:
              // return a UTF-16 character from a 3-byte UTF-8 char
              // see: http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
              return chr((0xF0 & (ord($utf8{0}) << 4))
                       | (0x0F & (ord($utf8{1}) >> 2)))
                   . chr((0xC0 & (ord($utf8{1}) << 6))
                       | (0x7F & ord($utf8{2})));
      }

      // ignoring UTF-32 for now, sorry
      return '';
  }

  private function json_encode($var)
  {

    if(is_object($var)) {
      if(in_array($var,$this->json_objectStack)) {
        return '"** Recursion **"';
      }
    }

      switch (gettype($var)) {
          case 'boolean':
              return $var ? 'true' : 'false';

          case 'NULL':
              return 'null';

          case 'integer':
              return (int) $var;

          case 'double':
          case 'float':
              return (float) $var;

          case 'string':
              // STRINGS ARE EXPECTED TO BE IN ASCII OR UTF-8 FORMAT
              $ascii = '';
              $strlen_var = strlen($var);

             /*
              * Iterate over every character in the string,
              * escaping with a slash or encoding to UTF-8 where necessary
              */
              for ($c = 0; $c < $strlen_var; ++$c) {

                  $ord_var_c = ord($var{$c});

                  switch (true) {
                      case $ord_var_c == 0x08:
                          $ascii .= '\b';
                          break;
                      case $ord_var_c == 0x09:
                          $ascii .= '\t';
                          break;
                      case $ord_var_c == 0x0A:
                          $ascii .= '\n';
                          break;
                      case $ord_var_c == 0x0C:
                          $ascii .= '\f';
                          break;
                      case $ord_var_c == 0x0D:
                          $ascii .= '\r';
                          break;

                      case $ord_var_c == 0x22:
                      case $ord_var_c == 0x2F:
                      case $ord_var_c == 0x5C:
                          // double quote, slash, slosh
                          $ascii .= '\\'.$var{$c};
                          break;

                      case (($ord_var_c >= 0x20) && ($ord_var_c <= 0x7F)):
                          // characters U-00000000 - U-0000007F (same as ASCII)
                          $ascii .= $var{$c};
                          break;

                      case (($ord_var_c & 0xE0) == 0xC0):
                          // characters U-00000080 - U-000007FF, mask 110XXXXX
                          // see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
                          $char = pack('C*', $ord_var_c, ord($var{$c + 1}));
                          $c += 1;
                          $utf16 = $this->json_utf82utf16($char);
                          $ascii .= sprintf('\u%04s', bin2hex($utf16));
                          break;

                      case (($ord_var_c & 0xF0) == 0xE0):
                          // characters U-00000800 - U-0000FFFF, mask 1110XXXX
                          // see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
                          $char = pack('C*', $ord_var_c,
                                       ord($var{$c + 1}),
                                       ord($var{$c + 2}));
                          $c += 2;
                          $utf16 = $this->json_utf82utf16($char);
                          $ascii .= sprintf('\u%04s', bin2hex($utf16));
                          break;

                      case (($ord_var_c & 0xF8) == 0xF0):
                          // characters U-00010000 - U-001FFFFF, mask 11110XXX
                          // see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
                          $char = pack('C*', $ord_var_c,
                                       ord($var{$c + 1}),
                                       ord($var{$c + 2}),
                                       ord($var{$c + 3}));
                          $c += 3;
                          $utf16 = $this->json_utf82utf16($char);
                          $ascii .= sprintf('\u%04s', bin2hex($utf16));
                          break;

                      case (($ord_var_c & 0xFC) == 0xF8):
                          // characters U-00200000 - U-03FFFFFF, mask 111110XX
                          // see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
                          $char = pack('C*', $ord_var_c,
                                       ord($var{$c + 1}),
                                       ord($var{$c + 2}),
                                       ord($var{$c + 3}),
                                       ord($var{$c + 4}));
                          $c += 4;
                          $utf16 = $this->json_utf82utf16($char);
                          $ascii .= sprintf('\u%04s', bin2hex($utf16));
                          break;

                      case (($ord_var_c & 0xFE) == 0xFC):
                          // characters U-04000000 - U-7FFFFFFF, mask 1111110X
                          // see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
                          $char = pack('C*', $ord_var_c,
                                       ord($var{$c + 1}),
                                       ord($var{$c + 2}),
                                       ord($var{$c + 3}),
                                       ord($var{$c + 4}),
                                       ord($var{$c + 5}));
                          $c += 5;
                          $utf16 = $this->json_utf82utf16($char);
                          $ascii .= sprintf('\u%04s', bin2hex($utf16));
                          break;
                  }
              }

              return '"'.$ascii.'"';

          case 'array':

              // treat as a JSON object
              if (is_array($var) && count($var) && (array_keys($var) !== range(0, sizeof($var) - 1))) {

                  $this->json_objectStack[] = $var;

                  $properties = array_map(array($this, 'json_name_value'),
                                          array_keys($var),
                                          array_values($var));

                  array_pop($this->json_objectStack);

                  foreach($properties as $property) {
                      if($property instanceof Exception) {
                          return $property;
                      }
                  }

                  return '{' . join(',', $properties) . '}';
              }

              $this->json_objectStack[] = $var;

              // treat it like a regular array
              $elements = array_map(array($this, 'json_encode'), $var);

              array_pop($this->json_objectStack);

              foreach($elements as $element) {
                  if($element instanceof Exception) {
                      return $element;
                  }
              }

              return '[' . join(',', $elements) . ']';

          case 'object':
              $vars = self::encodeObject($var);

              $this->json_objectStack[] = $var;

              $properties = array_map(array($this, 'json_name_value'),
                                      array_keys($vars),
                                      array_values($vars));

              array_pop($this->json_objectStack);

              foreach($properties as $property) {
                  if($property instanceof Exception) {
                      return $property;
                  }
              }

              return '{' . join(',', $properties) . '}';

          default:
              return null;
      }
  }

  private function json_name_value($name, $value)
  {
      if($name=='GLOBALS'
         && is_array($value)
         && array_key_exists('GLOBALS',$value)) {
        $value['GLOBALS'] = '** Recursion **';
      }

      $encoded_value = $this->json_encode($value);

      if($encoded_value instanceof Exception) {
          return $encoded_value;
      }

      return $this->json_encode(strval($name)) . ':' . $encoded_value;
  }
}
?>