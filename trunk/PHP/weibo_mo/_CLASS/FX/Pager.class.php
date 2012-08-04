<?php
/**
 * 通用分页类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class Pager {
	public $page_size = 20;
	public $record_count = 0;
	public $page_count = 1;
	public $page = -1;
	/**
	 * 构造函数
	 * @param int $record_count	记录数
	 * @param int $page_size	每页显示条数
	 */
	public function __construct($record_count, $page_size = NULL) {
		if ($page_size) {
			$this->page_size = $page_size;
		}
		$this->record_count = $record_count;
		$this->page_count = max(ceil($record_count / $this->page_size), 1);
		$page = intval($_GET['page']);
		$this->page = min($this->page_count, max($page, 1));
	}
	/**
	 * 获取mysql limit
	 */
	public function offset() {
		$offset = ($this->page - 1) * $this->page_size;
		return "$offset, $this->page_size";
	}
	/**
	 * 获取GET参数
	 * @param mixed $args	排除的key
	 */
	public function url_param(/*...*/)
	{
		$req = $_GET;
		foreach(func_get_args() as $param)
		{
			unset($req[$param]);
		}
		$str = http_build_query($req);
		if ($str)	$str .= '&';
		return $str;
	}
	/**
	 * 渲染 分页
	 */
	public function render() {
		$page = $this->page;
		$page_count = $this->page_count;
		$param = $this->url_param('page');

		$html = "共 {$this->record_count} 条记录 ";

		if ($page > 1) {
			$prev_page = $page - 1;
			$html .= "<a href=\"?{$param}page={$prev_page}\"><img src=\"resource/img/pre_page_simple_act.gif\" align=\"absmiddle\"></a> ";
		} else {
			$html .= "<img src=\"resource/img/pre_page_simple.gif\" align=\"absmiddle\"> ";
		}

		$prev_num = 2;
		$next_num = 2;
		$fixed_num = 2;
		for ($i = 1; $i <= $fixed_num && $i < $page - $prev_num; $i++) {
			$html .= "<a href=\"?{$param}page={$i}\">$i</a> ";
		}
		if ($fixed_num + 1 < $page - $prev_num) {
			$np = ceil(($page - $prev_num - $fixed_num) / 2) + $fixed_num;
			$html .= "<a href=\"?{$param}page={$np}\">...</a> ";
		}
		for ($i = max(1, $page - $prev_num); $i < $page; $i++) {
			$html .= "<a href=\"?{$param}page={$i}\">$i</a> ";
		}

		$html .= "<span>$page</span> ";

		for ($i = $page + 1; $i <= min($page_count, $page + $next_num); $i++) {
			$html .= "<a href=\"?{$param}page={$i}\">$i</a> ";
		}
		if ($page + $next_num < $page_count - $fixed_num) {
			$xp = floor(($page_count - $fixed_num + $page + $next_num) / 2) + 1;
			$html .= "<a href=\"?{$param}page={$xp}\">...</a> ";
		}
		for ($i = max($page_count - $fixed_num, $page + $next_num) + 1; $i <= $page_count; $i++) {
			$html .= "<a href=\"?{$param}page={$i}\">$i</a> ";
		}

		if ($page < $page_count) {
			$next_page = $page + 1;
			$html .= "<a href=\"?{$param}page={$next_page}\"><img src=\"resource/img/next_page_act.gif\" align=\"absmiddle\"></a> ";
		} else {
			$html .= "<img src=\"resource/img/next_page.gif\" align=\"absmiddle\"> ";
		}

		return $html;
	}
}