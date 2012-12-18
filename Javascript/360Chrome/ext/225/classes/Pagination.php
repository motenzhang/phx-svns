<?php
//note 分页类
class Pagination {
    public function __construct() {
        ;
    }

    public function creatPage($total_num, $url = '', $current  = 1, $param = '', $per_page = 20, $delta_left = 3, $delta_right = 7, $target = '_self') {
        $page = $current;
        $total_page = ceil ( $total_num / $per_page ); // 所有的页
        $page = min ( $page, $total_page );
        $page = max ( $page, 1 );

        $offset = ($page - 1) * $per_page; // 指针


        $low = $page - $delta_left;
        $high = $page + $delta_right;

        if ($high > $total_page) {
            $high = $total_page;
            $low = $total_page - $delta_left - $delta_right;
            $low = max ( $low, 1 );
        } elseif ($low < 1) {
            $low = 1;
            $high = $low + $delta_left + $delta_right;
            $high = min ( $high, $total_page );
        }

        $start = $total_num ? $offset + 1 : 0;
        $end = $offset + $per_page;
        $end = min ( $end, $total_num );

        $ret_string = "<div class=\"dataTables_info\">共{$total_num}条,当前{$start}-{$end}条</div><div class=\"dataTables_paginate\">";

        if ($page > 1) {
            $ret_string .= "<span class=\"paginate_button\"><a href=\"{$url}" . ($page - 1) . "/{$param}\" target=\"{$target}\">« prev </a></span>";
        } else {
            $ret_string .= "<span class=\"paginate_button_disabled\">« prev</span>";
        }
        
        $ret_string .= "<span>";

        $links = array ();
        for(; $low <= $high; $low ++) {
            if ($low == $page)
                $links [] = "<span class=\"paginate_active\">{$low}</span>";
            else
                $links [] = "<a href=\"{$url}{$low}/{$param}\" target=\"{$target}\"><span class=\"paginate_button\">{$low}</span></a>";
        }

        $links = implode ( '', $links );
        $ret_string .= ' ' . $links;
        
        $ret_string .= "</span>";
        
        if ($page < $total_page) {
            $ret_string .= "<span class=\"paginate_button\"><a href=\"{$url}" . ($page + 1) . "/{$param}\" target=\"{$target}\">next »</a></span>";
        } else {
            $ret_string .= "<span class=\"paginate_button_disabled\">next »</span>";
        }
        $ret_string .= '</div>';
    //    $ret_string .= $param_hidden;

        $ret_string = str_replace('?&', '?', $ret_string);

        $data = array ('offset' => $offset, 'per_page' => $per_page, 'html' => $ret_string );
        return $data;
    }
}