<?php
class ck {
    static function set ($name, $value, $expire=86400, $path='/', $domain='', $secure=false, $httponly = true ) {
        if (is_array($value)) {
            $value = json_encode($value);
        }
        return setcookie($name, $value, time()+$expire, $path, $domain, $secure, $httponly);;
    }

    static function get ($name) {
        if (!empty($_COOKIE [$name])) {
            $_COOKIE[$name] = stripslashes ($_COOKIE[$name]);
            if (is_string($_COOKIE[$name])) {
                return json_decode($_COOKIE [$name], true);
            } else {
                return urldecode($_COOKIE [$name]);
            }
        }
        return '';
    }

    static function del ($name) {
        setcookie($name, '', time()-86400, '/');
        return true;
    }
}