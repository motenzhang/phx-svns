<?php
/**
 * 封装 curl，HTTP请求类
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
class WebClient {
	protected $cookie_file;
	public $http_code, $http_header, $timeout, $referer;
	/**
	 * 构造函数
	 * @param string $cookie_file	cookie存储物理路径
	 * @param int	$timeout		超时时间，默认30秒
	 */
	function __construct($cookie_file = NULL, $timeout = 30) {
		$this->cookie_file = $cookie_file;
		$this->timeout = $timeout;
	}
	/**
	 * GET请求
	 * @param string $url
	 */
	public function get($url) {
		return $this->http($url, 'GET');
	}
	/**
	 * POST请求
	 * @param string $url				URL
	 * @param array $data				post数据
	 * @param string $request_encoding	请求的编码
	 * @param bool $multipart			是否是上传请求
	 */
	public function post($url, $data, $request_encoding = 'UTF-8', $multipart = false, $cookie = NULL) {
		$ret = $this->http($url, 'POST', $data, $request_encoding, $multipart, $cookie);
		if (start_with($ret, '{') || start_with($ret, '{')) {
			$json = @json_decode($ret, true);
			if ($json) {
				$ret = $json;
			}
		}
		return $ret;
	}
	/**
	 * HTTP请求
	 * @param $url
	 * @param $method
	 * @param $postdata
	 * @param $request_encoding
	 * @param $multipart
	 */
	public function http($url, $method, array $postdata = NULL,
							$request_encoding = 'UTF-8', $multipart = false, $cookie = NULL) {
		$page_encoding = 'UTF-8';
		if( strtoupper($request_encoding) != strtoupper($page_encoding)) {
			foreach ($postdata as $name => $value) {
				$name = iconv($page_encoding, $request_encoding, $name);
				$value = iconv($page_encoding, $request_encoding, $value);
				$postfields[$name] = $value;
			}
		} else {
			$postfields = $postdata;
		}
		if ($postfields && !$multipart)	$postfields = http_build_query($postfields);

		$ci = curl_init();
        curl_setopt($ci, CURLOPT_URL, $url);
        curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, $this->timeout);
        curl_setopt($ci, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ci, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1)');
        curl_setopt($ci, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ci, CURLOPT_HEADER, FALSE);
        curl_setopt($ci, CURLOPT_HEADERFUNCTION, array($this, 'getHeader'));
       	curl_setopt($ci, CURLOPT_COOKIEFILE, $this->cookie_file);
        curl_setopt($ci, CURLOPT_COOKIEJAR, $this->cookie_file);
        if ($cookie) {
        	curl_setopt($ci, CURLOPT_COOKIE, $cookie);
        }
        if ($this->referer) {
        	curl_setopt($ci, CURLOPT_REFERER, $this->referer);
        }

        switch (strtoupper($method)) {
        	case 'POST':
	            curl_setopt($ci, CURLOPT_POST, TRUE);
	            if (!empty($postfields)) {
	                curl_setopt($ci, CURLOPT_POSTFIELDS, $postfields);
//	                echo "=====post data======\r\n";
//	                var_dump( $postfields);
	            }
        		break;
        }
		$this->http_header = array();
        $response = curl_exec($ci);
        $this->http_code = curl_getinfo($ci, CURLINFO_HTTP_CODE);

//        echo '=====info====='."\r\n";
//        var_dump( curl_getinfo($ci) );

//        echo '=====$response====='."\r\n";
//        var_dump( $response );

        curl_close ($ci);
        return $response;
	}
	/**
	 * 分析header functio, CURL用
	 * @param resource $ch
	 * @param string $header
	 */
	private function getHeader($ch, $header) {
		$str = str_replace("\r\n", '', $header);
		if ($str) {
			if (!($pos = strpos($str, ': '))) {
				$this->http_header['(Status-Line)'] = $str;
			} else {
				if(isset($this->http_header[$name = substr($str, 0, $pos)])){
					if(';' != substr($this->http_header[$name], -1))
						$this->http_header[$name] .= ';';
					$this->http_header[$name] .= ' ';
				}
				$value = substr($str, $pos+2);
				$this->http_header[$name] .= $value;
			}
		}

		return strlen($header);
	}
	/**
	 * 获取正则表达式第一个子匹配
	 * @param string $pattern	正则表达式
	 * @param string $subject	搜索字符串
	 */
	public function getMatch1($pattern, $subject)
	{
		preg_match($pattern, $subject, $matches);
		return $matches[1];
	}
	/**
	 * 读取Cookie
	 * @param string $name
	 * @param string $domain
	 */
	public function getcookie($name, $domain = NULL) {
		$handle = @fopen($this->cookie_file, 'r');
		if ($handle) {
		   while (!feof($handle)) {
		       $line = fgets($handle, 4096);
		       $c_domain = $this->getMatch1('#^(\S+?)\t#', $line);
		       $c_domain = str_replace('#HttpOnly_', '', $c_domain);
		       if (empty($domain) || $domain == $c_domain) {
					$c_name = $this->getMatch1('#^(?:\S+\t){5}(\S+)#', $line);
					if ($name == $c_name) {
						$ret = $this->getMatch1('#^(?:\S+\t){6}(\S+)#', $line);
						break;
					}
		       }
		   }
		   fclose($handle);
		}
		return preg_replace('#(^")|("$)#', '', $ret);
	}
	/**
	 * 删除一项cookie
	 * @param string $domain
	 * @param string $name
	 */
	public function deletecookie($domain, $name = NULL) {
		$handle = @fopen($this->cookie_file, 'r');
		if ($handle) {
			$sb = '';
			while (!feof($handle)) {
			   $deleted = false;
		       $line = fgets($handle, 4096);
		       $c_domain = $this->getMatch1('#^(\S+?)\t#', $line);
		       $c_domain = str_replace('#HttpOnly_', '', $c_domain);
		       if ($domain == $c_domain) {
					$c_name = $this->getMatch1('#^(?:\S+\t){5}(\S+)#', $line);
					if (empty($name) || $name == $c_name) {
						$deleted = true;
					}
		       }
		       if (!$deleted) {
		       		$sb .= $line;
		       }
		   }
		   fclose($handle);

		   file_put_contents($this->cookie_file, $sb);
		}
	}
}