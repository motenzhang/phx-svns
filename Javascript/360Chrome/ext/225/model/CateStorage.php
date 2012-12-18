<?php
class CateStorage extends gModel {
	public $table = 'cate';
	public $pk = 'id';
	public $tt = null;
	
	public function get_cate_sort_list () {
	    $tt = $this->get_cache_obj();
	    $list = $tt->get('cates');
	    if(empty($list)) {
	        $fields = 'id,cate';
	        $list = $this->findAll (NULL, "sort DESC", $fields);
	        $tt->set('cates', json_encode($list), 0, 300);
	    } else {
	        $list = json_decode($list, true);
	    }
		return $list;
	}
	
	function get_cache_obj () {
        if ($this->tt === null) {
            require_once SITE_PATH.'/include/tt_memcache.php';
            $this->tt = new tt_memcache($GLOBALS['G']['tt_memcache']);            
        }
        return $this->tt;
    }
}