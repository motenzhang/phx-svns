<?php
class ExtStorage extends gModel {
	public $table = 'extensions';
	public $pk = 'id';
	public $tt = null;
	
	public function get_ext_list ($page, $count, $category, $sortType, $search_str=NULL) {		
        $offset = ($page - 1) * $count;
		$real_count= $count + 1;  //多取一条数据，判断下一页是否还是数据
		$conditions = array ();
		$conditions [] = "offline=0";
		if(!empty($category) && $category != '全部') {
		  $conditions [] = "tag LIKE '%".addslashes($category)."%'";
		}
		if (!empty($search_str)) {
		    if($_REQUEST['request_action'] == 'detail') {
		        $conditions [] = "crx_id='".addslashes($search_str)."'";
		    } else {
		    	$conditions [] = "tag LIKE '%".addslashes($search_str)."%'";
		    }
		}
		$conditions = implode (" AND ", $conditions);
		$sort = $sortType . ' DESC';
		$limit = "{$offset}, {$real_count}";
		$tt = $this->get_cache_obj();
	    $md5 = md5($conditions.$sort.$limit);
		$list = $tt->get('get_ext_list_'.$md5);
		if(empty($list)) {
		     $fields = 'id,crx_id,name,filename,author,version,hot,logo,cates,moredesc,shortdesc,descpic,lastupdate,create_time';
		     $list = $this->findAll ($conditions, $sort, $fields, $limit);
		     $tt->set('get_ext_list_'.$md5, json_encode($list), 0, 300);
		} else {
		     $list = json_decode($list, true);
		}

		return $list;
	}
	
	//根据crx_id取得搜索扩展
	public function find_one ($extid = '') {
		if (!$extid) return false;
		$tt = $this->get_cache_obj();
		$ext = $tt->get('crx_id_'.$extid);
		if(empty($ext)) {
		     $ext = $this->findBy ('crx_id', $extid);
		     $tt->set('crx_id_'.$extid, json_encode($ext), 0, 300);
		} else {
		     $ext = json_decode($ext, true);
		}
		return $ext;
	}

	function get_cache_obj () {
        if ($this->tt === null) {
            require_once SITE_PATH.'/include/tt_memcache.php';
            $this->tt = new tt_memcache($GLOBALS['G']['tt_memcache']);            
        }
        return $this->tt;
    }
}