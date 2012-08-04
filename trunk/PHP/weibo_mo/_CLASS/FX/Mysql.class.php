<?php
/**
 * @name Mysql.class.php
 * @desc Mysql 操作类
 * @author 曹晓冬
 * @createtime 2008-9-9 08:59
 * @updatetime 2008-9-9 13:08
 * @caution @ expensive by caoxd
 **/
class Mysql
{
	private $language;
	private $link = false;
	private $host;
	private $user;
	private $password;
	private $dbname;
	private $pconnect;
	/**
	 * @name __construct
	 * @desc 构造函数
	 * @param string $host
	 * @param string $user
	 * @param string $password
	 * @param string $dbname
	 */
	public  function __construct($host, $user, $password, $dbname, $charset, $pconnect) {
		$this->host = $host;
		$this->user = $user;
		$this->password = $password;
		$this->dbname = $dbname;
		$this->language = $charset;
		$this->pconnect = $pconnect;
	}
	/**
	 * @name connect
	 * @desc 创建一个Mysql数据库连接
	 */
	private function connect()
	{
		if($this->link === false)
		{
			if($this->pconnect)
			{
				$this->link = @mysql_pconnect($this->host, $this->user, $this->password);
			}else
			{
				$this->link = mysql_connect($this->host, $this->user, $this->password, 1);
			}
			if( false ===  $this->link )
			{
				return false;
			}
			if($this->language)
			{
				$this->query("SET NAMES ".$this->language."");
			}
		}
		mysql_select_db($this->dbname);
		return true ;
	}

	/**
	 * 如果连接已经断开，则新建连接；
	 * 如果连接还存在，但是已经超时，关闭后再重新连接
	 * @name reconnect
	 * @param Boolean $force_newconnect 是否强制重新创建连接，默认：是。
	 * @desc 重新连接mysql
	 */
	public function reconnect($force_newconnect = true)
	{
		if ($force_newconnect)
		{	// 强制重新连接
			$this->close();
			$this->connect();
		}
		else if ($this->link == false)
		{	// 连接已经断开，重新连接
			$this->connect();
		}
		else if (!@mysql_ping($this->link))
		{	// 连接超时断开，关闭后重新连接
			$this->close();
			$this->connect();
		}
	}
	/**
	 * @name close
	 * @desc 关闭Mysql数据库
	 */
	public function close() {
		$ok = @mysql_close($this->link);
		$this->link = false;
		return $ok;
	}
	/**
	 * @name query
	 * @desc 执行SQL查询
	 */
	public function query($sql) {
		if(false === $this->connect())
		{
			//抛出错误信息
			throw new Exception($this->getError(), $this->getErrno());
			return false;
		}
		$query = @mysql_query($sql,$this->link);
		if(false === $query)
		{
			if (in_array($this->getErrno(), array(2006, 2013)))
			{	// 出现 2006, 2013 的异常代码，重连后再次执行
				$this->reconnect(false);
				$query = @mysql_query($sql,$this->link);
				if ($query !== false)
				{
					return $query;
				}
			}
			//抛出错误信息
			throw new Exception($this->getError(), $this->getErrno());
			return false;
		}
		return $query;
	}
	/**
	 * @name query
	 * @desc 执行SQL操作
	 */
	public function numRows($query) {
		$query = @mysql_num_rows($query);
		return $query;
	}
	/**
	 * @name affectedRows
	 * @desc 获得上一次操作影响的行数
	 * @return int
	 */
	public function affectedRows() {
		return @mysql_affected_rows($this->link);
	}
	/**
	 * @name numFields
	 * @desc 取得结果集中字段的数目
	 * @param resource $query
	 * @return int
	 */
	public function numFields($query) {
		return @mysql_num_fields($query);
	}
	/**
	 * @name fetchAll
	 * @desc 获得完整结果集
	 * @param string $sql
	 * @param string $id 主键
	 * @param int $method
	 * @return mixed
	 */
	public function fetchAll($sql, $id = '', $method = MYSQL_ASSOC) {
		$res = $this->query($sql);
		if(false === $res) return false;
		$result = array();
		if ($id)
		{
			while(($row = $this->fetch($res,$method)) == true){
				$result[$row[$id]]=$row;
			}
		}
		else
		{
			while(($row = $this->fetch($res,$method)) == true){
				$result[]=$row;
			}
		}
		return $result;
	}
	/**
	 * @name fetchOne
	 * @desc 获得一条结果
	 * @param string $sql
	 * @param int $method
	 * @return mixed
	 */
	public function fetchOne($sql, $method=MYSQL_ASSOC){
		$res = $this->query($sql);
		if(false === $res) return false;
		$result = $this->fetch($res,$method);
		return $result;
	}
	/**
	 * @name fetch
	 * @desc 获得结果
	 */
	public function fetch($query, $method = MYSQL_ASSOC) {
		$res = @mysql_fetch_array($query, $method);
		return $res;
	}
	/**
	 * @name insertId
	 * @desc 取得上一步 INSERT 操作产生的 ID
	 * @return int
	 */
	public function insertId(){
		$id = @mysql_insert_id($this->link);
		return $id;
	}
	/**
	 * @name freeResult
	 * @desc 释放结果内存
	 * @param resource $query
	 * @return bool
	 */
	public function freeResult($query){
		return @mysql_free_result($query);
	}
	/**
	 * @name getErrno
	 * @desc 获得错误编号
	 * @return int
	 * @access public
	 */
	public function getErrno()
	{
		return mysql_errno();
	}
	/**
	 * @name getError
	 * @desc 获得错误信息
	 * @return string
	 * @access public
	 */
	public function getError()
	{
		return mysql_error();
	}
}
?>