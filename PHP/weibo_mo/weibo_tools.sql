SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `weibo_tools`
--

-- --------------------------------------------------------

--
-- 表的结构 `wt_open`
--

CREATE TABLE IF NOT EXISTS `wt_open` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(10) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL,
  `app_key` varchar(128) NOT NULL,
  `app_secret` varchar(128) NOT NULL,
  `callback` varchar(128) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pid` (`pid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=61 ;

-- --------------------------------------------------------

--
-- 表的结构 `wt_task`
--

CREATE TABLE IF NOT EXISTS `wt_task` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(10) unsigned NOT NULL,
  `pid` int(10) unsigned NOT NULL DEFAULT '0',
  `cat` varchar(10) NOT NULL,
  `type` varchar(50) NOT NULL,
  `url` varchar(1024) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `content` text NOT NULL,
  `pic` varchar(2048) DEFAULT NULL,
  `send_time` int(10) unsigned NOT NULL,
  `msg_code` smallint(6) NOT NULL DEFAULT '0',
  `msg` varchar(100) DEFAULT NULL,
  `last_send` int(10) unsigned NOT NULL,
  `retry_count` smallint(5) unsigned NOT NULL DEFAULT '0',
  `status` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`,`type`),
  KEY `type` (`type`),
  KEY `send_time` (`send_time`),
  KEY `status` (`status`),
  KEY `msg_code` (`msg_code`),
  KEY `retry_count` (`retry_count`),
  KEY `pid` (`pid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=305 ;

-- --------------------------------------------------------

--
-- 表的结构 `wt_third_account`
--

CREATE TABLE IF NOT EXISTS `wt_third_account` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(10) unsigned NOT NULL,
  `pid` int(10) unsigned NOT NULL DEFAULT '0',
  `type` varchar(50) NOT NULL,
  `token` varchar(128) DEFAULT NULL,
  `token_secret` varchar(128) DEFAULT NULL,
  `openid` varchar(50) DEFAULT NULL,
  `blogname` varchar(50) DEFAULT NULL,
  `nick` varchar(50) DEFAULT NULL,
  `url` varchar(1024) DEFAULT NULL,
  `valid` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid_2` (`uid`,`pid`,`type`),
  KEY `uid` (`uid`),
  KEY `type` (`type`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=239 ;

-- --------------------------------------------------------

--
-- 表的结构 `wt_user`
--

CREATE TABLE IF NOT EXISTS `wt_user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `type` tinyint(4) NOT NULL DEFAULT '0',
  `perms` text NOT NULL,
  `reg_date` int(10) unsigned NOT NULL,
  `last_login` int(10) unsigned NOT NULL,
  `last_exec` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

