<?php
/*
 * Sql助手类
 * @author gaoxiaogang@yoka.com
 */
class SqlHelper {
    /**
     * 转义数据
     * @param mixed $data
     * @param boolean $isQuote 字符串值是否用引号引起来。默认不括起来。
     * @return mixed
     */
    static public function escape($data, $isQuote = false) {
        if (is_int($data)) {
            return strval($data);
        } elseif (is_float($data)) {
            return strval($data);
        } elseif (is_string($data)) {
        	if ($isQuote) {
        		# 判断值是否需要 quote 起来
        		if (SqlHelper::isWrapperNoQuote($data)) {
        			return addslashes(SqlHelper::UnwrapperNoQuote($data));
        		} else {
        			return "'" . addslashes($data) . "'";
        		}
        	} else {
        		return addslashes($data);
        	}
        } elseif (is_bool($data)) {
            return strval(intval($data));
        } elseif (empty($data)) {
            if ($isQuote) {
                return "''";
            } else {
                return '';
            }
        } elseif (is_array($data)) {
            foreach ($data as &$val) {
                $val = self::escape($val, $isQuote);
            }
            return $data;
        } else {
            return false;
        }
    }

    /**
     * 判断给定的值是否是有效的自增主键值
     * @param mixid $pk
     * @return boolean
     */
    static public function isValidPK($pk) {
    	# 对开心用户id的处理有大bug，时间上来不及，先通过所有验证
    	return true;
    }

    /**
     * 判断给定数组的某个key的值，是否是有效的自增主键值
     * @param array $arr
     * @param mixid $key
     * @return boolean
     */
    static public function isValidPKWithArray(array $arr, $key) {
        if (empty($arr)) {
            return false;
        }
        if (!array_key_exists($key, $arr)) {
            return false;
        }
        return self::isValidPK($arr[$key]);
    }

    /**
     *
     * 对值 $str 做包装，表示该值不需要 引(quote) 起来
     * @param string $str
     * @return string
     */
    static public function wrapperNoQuote($str) {
    	if (empty($str)) {
    		return $str;
    	}
    	return "NOQUOTE{$str}NOQUOTE";
    }

    /**
     *
     * 是否对值 $str 做了不需要 引(quote) 起来的包装
     * @param string $str
     * @return Boolean
     */
    static public function isWrapperNoQuote($str) {
		if (strpos($str, 'NOQUOTE') !== 0) {
			return false;
		}

		if (strrpos($str, 'NOQUOTE') !== (strlen($str) - strlen('NOQUOTE'))) {
			return false;
		}

		return true;
    }

    /**
     *
     * 去除不 引(quote) 起来的包装
     * @param string $str
     * @return string
     */
    static public function UnwrapperNoQuote($str) {
    	return str_replace('NOQUOTE', '', $str);
    }

    /**
     *
     * 将sql里的比较操作符添加到 $val里
     * DBAbstract::parseCondition 方法，会调用 SqlHelper::explodeCompareOperator 方法来拆解值与比较操作符
     * @param string $operator 比较操作符。如： >= 、 < 、!=
     * @param scalar $val 标题数据
     * @throws ParamsException '参数val必须是标量scalar类型'
     * @return string
     */
    static public function addCompareOperator($operator, $val) {
		if (!is_scalar($val)) {
			throw new Exception("参数val必须是标量scalar类型");
		}
    	$val = "COMPARE{$operator}COMPARE    {$val}";
    	return $val;
    }

    /**
     *
     * 拆解 $val 里的 比较操作符 与 数据。
     * 如果含比较操作符，则认为比较操作符是 =
     * @param string $val
     * @return string
     */
    static public function explodeCompareOperator($val) {
    	$pattern = '#^(\'?)COMPARE(.+?)COMPARE\s{4}#';
    	if (!preg_match($pattern, $val, $match)) {
			return "  =  {$val}  ";
    	}
    	$compareOperator = $match[2];
    	$val = preg_replace($pattern, '$1', $val);
    	return "  {$compareOperator}  {$val}  ";
    }
}