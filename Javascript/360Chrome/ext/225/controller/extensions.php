<?php
/**
 * 扩展程序-官方推荐 接口
 *
 */
class extensions extends gController {
    public $tt = null;
    
    public function __construct(){
       global $__action;
       if($__action == 'list' || $__action == 'index') {
          header ("Location:/webstore/home");
       }
    }
	
	
	public function detail() {
		$extid = urldecode(trim(@$GLOBALS['G']['url_args'][0]));
		header ("Location:/webstore/detail/".$extid);
	}
	
	public function GetRecomendData() {
	     $tt = $this->get_cache_obj();
	     $data = $tt->get('recommend_ext');
	     if(empty($data)) {
		     $recommendDataUrl = 'http://chrome.360.cn/recommend.txt';
		     $data = file_get_contents($recommendDataUrl);
		     $data = $this->_explodeCsv($data);
			 $data = json_encode($data);
		     $tt->set('recommend_ext', $data, 0, 3600);
	     }
		 if (isset($_REQUEST['callback'])) {
			echo $_REQUEST['callback'] . "(".$data.")";
		 } else {
			echo $data;
		 }
		 exit;
	}
	
	public function _explodeCsv ($content) {
		if (!$content) return false;
		$lines = explode ("\n", $content);
		$return = array ();
		if (is_array($lines)) {
			foreach ($lines as $ext) {
				if (empty($ext)) continue;
				$fields = explode (",", $ext);
				if ( count($fields) == 8) {
					array_push ($return, array (
						'name'=> trim($fields[0]),
						'author'=> trim($fields[1]),
						'version'=> trim($fields[2]),
						'date' => trim($fields[3]),
						'desc'=> trim ($fields[4]),
						'logo'=> trim($fields[5]),
						'extUrl'=> trim($fields[6]),
						'id'=> trim($fields[7])
					));
				}
			}
		}
		return $return;
	}
	
	function get_cache_obj () {
        if ($this->tt === null) {
            require_once SITE_PATH.'/include/tt_memcache.php';
            $this->tt = new tt_memcache($GLOBALS['G']['tt_memcache']);            
        }
        return $this->tt;
    }
}