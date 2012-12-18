<?php
/**
 * 扩展接口类
 *
 **/
class provider extends gController {
	/**
	 * 获取扩展分类数据，返回JSON格式数据
	 */
	public function categorylist () {
		//按排序字段降序排列
		$catelist = gClass ('CateStorage')->get_cate_sort_list ();
		exit (json_encode ($catelist));
	}
	
	/**
	 * 获取扩展数据接口，支持搜索，增量读取
	 *
	 */
	public function extlist ($output = true) {
		$search = isset($GLOBALS['G']['url_args'][0]) ? urldecode(trim($GLOBALS['G']['url_args'][0])) : '';
		$page = isset($_REQUEST['token']) ? intval($_REQUEST['token']) : 1;
		if ($page <= 0) {
		   $page = 1;
		}
		$count = isset($_REQUEST['count']) ? intval($_REQUEST['count']) : 20;
		$category = isset($_REQUEST['category']) ? urldecode(trim($_REQUEST['category'])) : '全部';
		$sortType = isset($_REQUEST['sortType']) ? trim($_REQUEST['sortType']) : 'hot';
		if (!in_array($sortType, array ('hot', 'download', 'lastupdate'))) {
			$sortType = 'hot';
		}
		$Ext = gClass('ExtStorage');
		$extlist = $Ext->get_ext_list ($page, $count, $category, $sortType, $search);

		$query_count = count ($extlist);
		($query_count > $count) && array_pop($extlist);
		$res = array ();
		$res ['list'] = $extlist;
		$res ['left'] = ($query_count > $count) ? 1 : 0;
		$res ['total'] = $extlist ? count ($extlist) : 0;
		$res ['token'] = $page + 1;
		$res ['query'] = array('search' => htmlspecialchars($search), 'sortType' => $sortType, 'category' => htmlspecialchars($category), 'count' => $count);

		if ($output) {
			echo json_encode ($res);
			exit;
		} else {
			return json_encode ($res);
		}
	}
	
	/**
	 * 获取一个扩展的详细数据
	 * GET PARAMS:
	 *	crx_id	扩展ID 	
	 * @return json
	 */
	public function extone () {
		$extid = isset($GLOBALS['G']['url_args'][0]) ? trim ($GLOBALS['G']['url_args'][0]) : '';
		if(empty($extid)) {
		   exit ('');
		}
		
		$extid = strip_tags ($extid);
		$extone = gClass ('ExtStorage')->find_one ($extid); //通过封装的find_one函数可以取到扩展分类
		if ($extone['offline']) {
			exit ('');
		}
		echo json_encode ($extone);
		exit;
	}
	
	/**
	 * 扩展更新接口，upext调用
	 * GET PARAMS:
	 *	crx_id	扩展ID 	
	 * @return json
	 */
	function checkUpdate () {
		$res = array ();
		if (!empty($_GET['data'])) {
			$ids = json_decode (urldecode($_GET['data']), true);
			if (is_array ($ids)) {
				foreach ($ids as $crx_id) {
					$res[$crx_id] = gClass('ExtStorage')->find (array('crx_id'=>$crx_id),null, "crx_id,name, logo, hot, shortdesc, filename,version");
				}
			}
		}
		exit (json_encode($res));
	}
	
	function getRankExt () {
		$res = array ();
		$sortType = empty($_GET['sortType']) ? 'hot' : trim($_GET['sortType']);
		$count = empty($_GET['count']) ? 50 : intval($_GET['count']);
		
		$list = gClass('ExtStorage')->findAll (NULL, "{$sortType} DESC", "crx_id,name, logo, hot, shortdesc, filename,version", "0, {$count}");
		exit (json_encode($list));
	}
	
	/**
	 * 扩展安装接口
	 *		访问此接口后，如果扩展存在则header 302，跳转下载地址。
	 * @return json
	 */
	function crxInstall () {
		if (isset($_GET['response']) && trim($_GET['response']) == 'redirect' || !isset($_GET['x'])) {
			$x = urldecode (trim($_GET['x']));
			parse_str ($x);
			if ($id) {
				$ext = gClass ('ExtStorage')->find_one ($id);
				header("HTTP/1.1 302 Moved Temporarily");
				header("Content-Type:application/x-chrome-extension");
				header("Location: ".$ext['filename']); 
				exit();
			} else {
				exit ('Extension Not Found!');
			}
		}
		exit ('Access Illegal!');
	}
	
	//下载统计
	function clk () {
		$extid = isset($GLOBALS['G']['url_args'][0]) ? trim ($GLOBALS['G']['url_args'][0]) : '';
		if(empty($extid)) {
		   exit;
		}
		if (gClass ('ExtStorage')->incrField (array ('crx_id'=>$extid), 'download', 1) ) {
			echo 'ok';
		}
	}
}