<?php
/**
 * TT高速缓存类
 * 
 * @encode UTF-8
 * @author 服务端组-唐永刚 (mailto:TangYonggang@360.com)
 * 
 * @time 2011-7-4 10:10:14
 * 版权所有：奇虎360 All Right Reserved.
 */
class tt_memcache {
	private $config = array();
	
	private $obj_m = array();
	
	private $obj_s = array();
	
	private $multi_server = false;

    private $tt_prefix = 'mm_';
	
	/**
	 * 比较特殊，初始化的时候，主从都连接一次
	 *
	 * @param unknown_type $config
	 */
	public function __construct($config) {
		$this->config = $config;
        if(isset($this->config["prefix"])){
            $this->tt_prefix .= $this->config["prefix"];
        }
                
		$this->multi_server = isset ( $this->config ['slave'] ) ? true : false;
		$this->connectMaster();
		$this->connectSlave();
	}
	
	private function connectMaster() {
		$this->obj_m = new Memcache;
		$this->obj_m->addServer($this->config['master']['host'], $this->config['master']['port']);
	}
	
	private function connectSlave() {
		$this->obj_s = new Memcache;
		$slave = $this->multi_server ? $this->config ['slave'] : array($this->config['master']);
		foreach ($slave as $v){
			$this->obj_s->addServer($v['host'], $v['port']);
		}
	}
	
	public function get($key, $flag = 0){
		return $this->obj_m->get($this->tt_prefix . $key, $flag);
	}
	
	public function set($key, $value, $flag = 0, $expire = 0) {
		return $this->obj_m->set($this->tt_prefix . $key, $value, $flag, $expire);
	}
	
	public function delete($key) {
		return $this->obj_m->delete($this->tt_prefix . $key);
	}
	
	public function increment($key, $step=1) {
		return $this->obj_m->increment($this->tt_prefix . $key, $step);
	}
	
	public function decrement($key, $step=1) {
		return $this->obj_m->decrement($this->tt_prefix . $key, $step);
	}
	
    public function flush () {
        return $this->obj_m->flush();
    }	
    
}