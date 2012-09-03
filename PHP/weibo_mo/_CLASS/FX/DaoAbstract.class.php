<?php
/**
 * 数据库操作的抽象类
 * @author gaoxiaogang@yoka.com
 *
 */
abstract class DaoAbstract {
    /**
     * 数据表名
     * 该抽象类针对表的操作（如：delete、create、findBy)都是基于该属性。由继承的子类填充该值。
     * 好处：1、如果继承的子类只针对一个表，把tableName设为静态表名即可。
     * 2、如果继承的子类针对一类表操作(如根据某个唯一标志把相同结构的数据hash到多张表中)，则针对不同表操作时，动态设置该值
     * @var string
     */
    protected $tableName;

    /**
     * 表的主键名。默认为id
     * @var string
     */
    protected $primary_key = 'id';

    /**
     * 数据库主库实例
     *
     * @var DB
     */
    protected $mdb;

    /**
     * 数据库从库实例
     *
     * @var DB
     */
    protected $sdb;

    /**
     * 数据库实例，可被动态切换到主库或从库
     *
     * @var DB
     */
    protected $db;

    /**
     * 使用主库
     */
    protected function useMdb() {
        $this->db = $this->mdb;
    }

    /**
     * 使用从库
     */
    protected function useSdb() {
        $this->db = $this->sdb;
    }

    public function __construct() {
        $this->mdb = DB::getInstance('default', true);
        $this->sdb = DB::getInstance('default', false);

        $this->db = $this->mdb;
    }

//    /**
//     * 关闭主数据库的出错处理标志，转为手动处理
//     */
//    public function closeMdbError() {
//      $this->mdb->is_show_error = false;
//    }
//
//    /**
//     * 开启主数据库的出错处理标志
//     */
//    public function openMdbError() {
//      $this->mdb->is_show_error = true;
//    }

    /**
     * 设置表名
     * 动态设置表名是为了拆表
     * @param $tableName
     */
    public function setTableName($tableName) {
        $this->tableName = $tableName;
    }

    /**
     * 解析条件
     * @param array $condition
     * @throws Exception parameter errors
     * @return string
     */
    protected function parseCondition(array $condition = null) {
        if(empty($condition)) return '';

        $condition = $this->quote($condition);
        $where = array();
        foreach($condition as $key => $val) {
            if(is_scalar($val)) {
                $where[] = "`{$key}` = $val";
            } elseif(is_array($val)) {
                $where[] = "`{$key}` IN (".join(',', $val).")";
            } else {
                throw new Exception('parameter errors');
            }
        }
        return "
            WHERE ".join(' && ', $where)."
        ";
    }

    /**
     * 根据条件查找主键id列表集
     * 做这个方法，是出于架构上的考虑。只取出主键id集，然后通过主键id集才去取数据（内存或数据库）
     * @param array $condition 条件
     * @param string | int $limit 指定分页
     * @param string $order 指定排序
     * @return array 如：array(123, 124)。无值时返回空数组
     */
    public function findIdsBy(array $condition = null, $limit = null, $order = null) {
        $result = $this->findBy($condition, $this->primary_key, $limit, $this->primary_key, $order);
        if (! $result) {
            return array();
        }

        return array_keys($result);
    }

    /**
     * 查找的底层方法。对查找只提供有限支持，太复杂的查询请手动sql
     * final 让该方法禁止被继承
     * 1、根据条件查找，多条件只支持 与（＆＆），不支持或之类的
     * 2、支持limit
     * 3、group by
     * @param array $condition
     * @param string $returnAssociateKey 如果指定该指，返回的值不再以0，1，2为key，而是以其对应的值为key
     * @param string | int $limit
     * @param string $selectCols 要获取的列。语法：id, uid ,默认为 *
     * @param string $order 指定排序
     * @return array
     */
    final public function findBy(array $condition = null, $returnAssociateKey = null, $limit = null, $selectCols = '*', $order = null) {
        $where = $this->parseCondition($condition);
        if (!isset($limit) || !preg_match('#^(?:\d+\s*,\s*)?\d+$#', $limit)) {
            $strLimit = ' ';
        } else {
            $strLimit = " LIMIT $limit ";
        }

        $strOrder = '';
        if(!empty($order)) {
            $strOrder = " ORDER BY {$order} ";
        }

        if(!isset($selectCols)) {
            $selectCols = '*';
        }

        $sql = "SELECT {$selectCols} FROM {$this->tableName}
            {$where}
            {$strOrder}
            {$strLimit}
            ;
        ";
        return $this->db->fetchAll($sql, $returnAssociateKey);
    }

    public function fetchOne(array $condition = null, $selectCols = '*', $order = null) {
        $result = self::findBy($condition, null, 1, $selectCols, $order);
        if (!$result) {
        	return false;
        }
        return array_pop($result);
    }
    /**
     * 获取所有
     * @param string $order 排序方式。默认以主键倒序;有效的格式："create_time desc"
     * @param string $limit 该参数用于支持分页，默认为不使用分页。格式 "offset, length"
     * @return false | array
     */
    public function getsAll($order = null, $limit = null) {
        if (is_null($order)) {
            $order = "{$this->primary_key} desc";
        }
        if (!is_string($order)) {
            throw new Exception('$order 必须是字符串或null');
        }

        $condition = null;
        $ids = self::findIdsBy($condition, $limit, $order);
        return $this->gets($ids);
    }

    /**
     * 获取所有id列表集
     * @param string $order 排序方式。默认以主键倒序;有效的格式："create_time desc"
     * @param string $limit 该参数用于支持分页，默认为不使用分页。格式 "offset, length"
     * @return false | array
     */
    public function getsAllIds($order = null, $limit = null) {
    	if (is_null($order)) {
            $order = "{$this->primary_key} desc";
        }
        if (!is_string($order)) {
            throw new Exception('$order 必须是字符串或null');
        }

        $condition = null;
        $ids = self::findIdsBy($condition, $limit, $order);
        return $ids;
    }

    /**
     * 获取指定$id
     * @param int | string $id
     * @return false | array
     */
    public function get($id) {
        if (is_int($id)) {
            if ($id < 1) {
                return false;
            }
        } elseif (is_string($id)) {
            if (strlen($id) == 0) {
                return false;
            }
        } else {
            return false;
        }

        $result = self::gets(array($id));// 调用该类自身的gets方法，而不是继承者的gets方法！
        if (!$result) {
            return false;
        }
        return array_pop($result);
    }

    /**
     * 批量获取信息
     * @param array $ids id组成的数组
     * @return false | array
     */
    public function gets(array $ids) {
        if (empty($ids)) {
            return false;
        }

        $condition = array(
            $this->primary_key => $ids,
        );
        $result = $this->findBy($condition, $this->primary_key);
        if (!$result) {
            return false;
        }

        $return = array();
        foreach ($ids as $id) {
            if (array_key_exists($id, $result)) {
                $return[$id] = $result[$id];
            }
        }
        return $return;
    }

    const PARAM_CREATE_ACTION_INSERT = 'INSERT INTO';

    const PARAM_CREATE_ACTION_INSERT_IGNORE = 'INSERT IGNORE';

    const PARAM_CREATE_ACTION_REPLACE = 'REPLACE INTO';

    /**
     * 创建一条记录
     * @param array $tableInfo 待插入的数据
     * @param boolean $isAutoIncrement 操作成功时，如果该值为true，返回最后插入的id；否则返回true
     * @return boolean | int
     */
    private function _create(array $tableInfo, $isAutoIncrement = true, $action = self::PARAM_CREATE_ACTION_INSERT) {
        if(empty($tableInfo)) return false;

        switch($action) {
            case self::PARAM_CREATE_ACTION_INSERT :
            case self::PARAM_CREATE_ACTION_INSERT_IGNORE :
            case self::PARAM_CREATE_ACTION_REPLACE :
                break;
            default:
                throw new Exception('error insert action');
        }

        $sql = "{$action} {$this->tableName}
            SET
        ";
        $sqlSets = '';
        $tableInfo = $this->quote($tableInfo);
        foreach($tableInfo as $key => $val) {
            if($sqlSets != '') $sqlSets .= ' ,';
            $sqlSets .= "
               `{$key}` = {$val}
            ";
        }
        $sql .= $sqlSets;

        if($this->mdb->query($sql)) {
            if($isAutoIncrement) {
                $id = $this->mdb->insertId();
                return $id > 0 ? $id : true;
            } else {
                return true;
            }
        }

        return false;
    }

    /**
     * 创建一条记录，如果重复，则替换
     * @param array $tableInfo 待插入的数据
     * @param boolean $isAutoIncrement 操作成功时，如果该值为true，返回最后插入的id；否则返回true
     * @return boolean | int
     */
    public function replace(array $tableInfo, $isAutoIncrement = true) {
        return $this->_create($tableInfo, $isAutoIncrement, self::PARAM_CREATE_ACTION_REPLACE);
    }

    /**
     * 创建一条记录
     * @param array $tableInfo 待插入的数据
     * @param boolean $isAutoIncrement 操作成功时，如果该值为true，返回最后插入的id；否则返回true
     * @return boolean | int
     */
    public function create(array $tableInfo, $isAutoIncrement = true) {
        return $this->_create($tableInfo, $isAutoIncrement, self::PARAM_CREATE_ACTION_INSERT);
    }

    /**
     * 创建一条记录，如果重复，则忽略
     * @param array $tableInfo 待插入的数据
     * @param boolean $isAutoIncrement 操作成功时，如果该值为true，返回最后插入的id；否则返回true
     * @return boolean | int PS：$isAutoIncrement = true时：1、如果插入了，返回自动id值；2、如果已存在，返回true。
     */
    public function insertIgnore(array $tableInfo, $isAutoIncrement = true) {
        return $this->_create($tableInfo, $isAutoIncrement, self::PARAM_CREATE_ACTION_INSERT_IGNORE);
    }

    /**
     * 根据条件更新指定数据
     * @param array $tableInfo 待更新的数据（与数据库字段对应的数据）
     * @param array $condition 条件（与数据库字段对应的数据）
     * @return boolean
     */
    public function update(array $tableInfo, array $condition) {
        if(empty($tableInfo)) return false;

        $sql = "UPDATE {$this->tableName}
            SET
        ";
        $sqlSets = '';
        foreach($tableInfo as $key => $val) {
            if($sqlSets != '') $sqlSets .= ' ,';
            $sqlSets .= "
               `{$key}` = {$this->quote($val)}
            ";
        }
        $sql .= $sqlSets;

        $where = $this->parseCondition($condition);
        $sql .= "
            {$where}
            ;
        ";

        return $this->mdb->query($sql);
    }

    /**
     * 根据条件删除数据
     * @param Array $condition 条件
     * @return boolean
     */
    public function delete(array $condition) {
        $where = $this->parseCondition($condition);

        $sql = "DELETE FROM {$this->tableName}
            {$where}
            ;
        ";
        return $this->mdb->query($sql);
    }

    /**
     * 转义数据
     * @param mixed $data
     */
    public function quote($data) {
        return SqlHelper::escape($data, true);
    }

    /**
     * 判断给定的值是否是有效的自增主键值
     * @param mixid $pk
     * @return boolean
     */
    static protected function isValidPK($pk) {
        return SqlHelper::isValidPK($pk);
    }

    /**
     * 判断给定数组的某个key的值，是否是有效的自增主键值
     * @param array $arr
     * @param mixid $key
     * @return boolean
     */
    static protected function isValidPKWithArray(array $arr, $key) {
        return SqlHelper::isValidPKWithArray($arr, $key);
    }

    /**
     * 获取某个表里记录的数量
     * @return false | int
     */
    public function totals(array $condition = null){
        $result = $this->findBy($condition, null, null, "count(*)");
        if (!$result) {
            return false;
        }
		$p0 = array_pop($result);
        return array_pop($p0);
    }
}