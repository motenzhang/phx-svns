(function() {
    var $id = function(id) {
        return document.getElementById(id);
    }
    var $tag = function(tagname, element) {
        try {
            if (element && element.getElementsByTagName) {
                return element.getElementsByTagName(tagname);
            } else {
                return document.getElementsByTagName(tagname);
            }
        } catch(e) {
            return [];
        }
    }
    var addEvent;
    if (document.addEventListener) {
        addEvent = function(ele, eventtype, listener) {
            if (ele) {
                ele.addEventListener(eventtype, listener);
            }
        }
    } else if (document.attachEvent) {
        addEvent = function(ele, eventtype, listener) {
            if (ele) {
                ele.attachEvent('on' + eventtype,
                function() {
                    var e = window.event;
                    listener(e)
                });
            }
        }
    }
    function getStyleObject(tip) {
        if (window.getComputedStyle) {
            return {
                'style': window.getComputedStyle(tip),
                getstyle: function(name) {
                    return this.style[name]
                }
            };
        } else {
            return {
                'style': tip.currentStyle,
                getstyle: function(name) {
                    var stylename = name.split('-');
                    for (var i = 1; i < stylename.length; i++) {
                        stylename[i] = stylename[i].substring(0, 1).toUpperCase() + stylename[i].substring(1)
                    }
                    return this.style[stylename.join('')]
                }
            };
        }
    }
    function isposition0(positiony) {
        return true;
    }
    addEvent(window, 'load', function(e) {
        try {
            var when = false;
            try {
                when = eval($id('whenyellowtipshow').innerHTML);
            } catch(e) {}

            if (when) {
                var tip = $id('yellowtip');
                var ss = getStyleObject(tip);
                var h = parseInt(ss.getstyle('height')) || 0;
                var pt = parseInt(ss.getstyle('padding-top')) || 0;
                var mt = parseInt(ss.getstyle('margin-top')) || 0;
                var pb = parseInt(ss.getstyle('padding-bottom')) || 0;
                var mb = parseInt(ss.getstyle('margin-bottom')) || 0;
                var bodyss = getStyleObject(document.body);
                var bodymt = parseInt(bodyss.getstyle('margin-top')) || 0;
                var bodypt = parseInt(bodyss.getstyle('padding-top')) || 0;
                var bodybackpositiony = bodyss.getstyle('background-position-y');
                var bodybackimg = bodyss.getstyle('background-image');
                var oldbodycsstext = document.body.style.cssText;
                if (bodyss.getstyle('position') == "relative") {
                    document.body.style.paddingTop = (h + pt + mt + pb + mb + bodypt) + 'px';
                } else {
                    document.body.style.marginTop = (h + pt + mt + pb + mb + bodymt) + 'px';
                }
                if (bodybackimg && isposition0(bodybackpositiony)) {
                    document.body.style.backgroundPositionY = (h + pt + mt + pb + mb) + "px";
                }
                tip.style.cssText += ";position:absolute;top:0;display:block;";
                document.body.appendChild(tip);
                var tipclosebtn = $id('yellowtipclose');
                addEvent(tipclosebtn, 'click',
                function(e) {
                    try {
                        document.body.style.cssText = oldbodycsstext;
                        tip.style.display = "none";
                        try {
                            eval($id("whenyellowtipclose").innerHTML);
                        } catch(e) {}
                    } catch(e) {}
                });
            }
        } catch(e) {
        }
    });
})();