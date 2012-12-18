<?php
class crx_parser_exception extends Exception {
	
}

/**
 * Chrome crx 解析器，用于获取扩展、皮肤ID
 * @author wuhao5
 *
 */
class crx_parser {
	const MAX_PUBLIC_KEY_SIZE = 65535;
	const MAX_SIGNATURE_SIZE  = 65535;
	const HEADER_MAGIC_PREFIX = 'Cr24';
	const CURRENT_VERSION     = 2; 
	
	private $_crx_file = null;
	/**
	 * 开始解析该 crx 文件
	 */
	public function parse($crx_file) {
		if(substr($crx_file,0,'4') != 'http' && !file_exists($crx_file)) {
			throw new crx_parser_exception("parser init: crx file does not exisit");
		}
		$this->_crx_file = fopen($crx_file, 'r');
		$this->parse_header(); // 解析头部信息
		$this->parse_key();
		fclose($this->_crx_file);
		return $this->get_crx_id();
	}
	/**
	 * crx 文件的头信息
	 * @var unknown_type
	 */
	private $_header = array();
	/**
	 * 解析头部信息，并设置 $_header 数组
	 * @throws crx_parser_exception 解析错误抛出异常
	 */
	private function parse_header() {
		$data = fread($this->_crx_file, 16); // HEADER 头信息有16个字节
		if($data) {
			$data = @unpack('C4prefix/Vversion/Vkey_size/Vsig_size',$data);
		}else{
			throw new crx_parser_exception("header parse: error reading header");
		}
		// 前四个字节拼合 prefix
		$data['prefix'] = chr( $data['prefix1'] ).chr( $data['prefix2'] ).chr( $data['prefix3'] ).chr( $data['prefix4'] );
		unset($data['prefix1'],$data['prefix2'],$data['prefix3'],$data['prefix4']);
		
		if($data['prefix'] != self::HEADER_MAGIC_PREFIX) {
			throw new crx_parser_exception("header parse: illegal prefix");
		}
		if( $data['version'] != self::CURRENT_VERSION ) {
			throw new crx_parser_exception("header parse: illegal version");
		}
		if(
			empty($data['key_size']) || $data['key_size'] > self::MAX_PUBLIC_KEY_SIZE ||
			empty($data['sig_size']) || $data['sig_size'] > self::MAX_SIGNATURE_SIZE
		){
			throw new crx_parser_exception("header parse: illegal public key size or signature size");
		}
		$this->_header = $data;
	}
	private function parse_key() {
		$key = fread($this->_crx_file,$this->_header['key_size']);
		if($key) {
			$this->_key = $key;
		}else{
			throw new crx_parser_exception("key parse: error reading key");
		}
	}
	private function get_crx_id() {
		$hash = hash('sha256',$this->_key);
		$hash = substr($hash,0,32);
		
		$length = strlen($hash);
		$ascii_0 = ord('0');
		$ascii_9 = ord('9');
		$ascii_a = ord('a');
		$data = '';
		for($i=0;$i<$length;$i++) {
			$c = ord($hash[$i]);
			
			if($c >= $ascii_0 && $c <= $ascii_9) {
				$d = chr($ascii_a + $c - $ascii_0);
			} else if($c >= $ascii_a && $c < $ascii_a + 6) {
				$d = chr($ascii_a + $c - $ascii_a + 10);
			} else {
				$d = 'a';
			}
			$data .= $d;
		}
		return $data;
	}
}