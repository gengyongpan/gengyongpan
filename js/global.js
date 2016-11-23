/**
 * Created by chenyunbin on 2015/6/30.
 */

//变色主题 赋值
var theme_opt = theme_opt || '';
var option = option || {};
//请求图表数据的URL
var generateChartDataURL = "platformChartAction.do?method=generateChartData";
//请求SQL数据的URL
var generateSQLDataURL =  "useWebServiceGetJson.vd";
//用于ECharts组件JSP中的回调函数对象
var ec_callback = {
/*    ec: {},
    opt: {},
    setEc: function (ec) {
        this.ec =ec;
    },
    setOpt: function (opt) {
        this.opt =opt;
    },
    render: function(t, fn) {
        switch(t) {
            case "before":
                break;
            case "after":
                break;
            default: break;
        }
    },*/
    beforeRender: function (ec, opt) {
    },
    afterRender: function (ec, opt) {
    }
};

//Array.forEach implementation for IE support..
//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        // Hack to convert O.length to a UInt32
        if ( {}.toString.call(callback) != "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }
        if (thisArg) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if ( k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}

//添加Stirng对象的原型方法replaceAll:
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
};

//handlebars的jquery插件
//例子：
//$('#content').handlebars($('#template'), { name: "Alan" });
(function($) {
    var compiled = {};
    $.fn.handlebars = function(template, data) {
        if (template instanceof jQuery) {
            template = $(template).html();
        }
        compiled[template] = Handlebars.compile(template);
        this.html(compiled[template](data));
    };
})(jQuery);

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt)
{ //author: meizz
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

//复制JSON A里的属性至JSON B中并覆盖
function copyJSONAtoB(a, b) {
    var t;
    for (var i in a) {
        t = typeof b[i];
        if (t == "object") {
            copyJSONAtoB(a[i], b[i]);
        } else {
            b[i] = a[i];
        }
    }
    return b;
}

//复制JSON A里的属性至JSON B中并覆盖，A中的属性为数组且数组中存在null项则跳过此项
function copyJSONAtoB_noArrayNull(a, b) {
    var t, _t;
    for (var i in a) {
        t = typeof b[i];
        _t = typeof a[i];
        if(t != _t ){
            b[i] = a[i];
            continue;
        }
        if (t == "object") {
            copyJSONAtoB_noArrayNull(a[i], b[i]);
        } else {
            if( a.length != null && b.length != null){      //判断a,b是否为数组
                a[i] != null && (b[i] = a[i]);
            } else {
                b[i] = a[i];
            }
        }
    }
    return b;
}

function getChartDataURL(dataURL, contextPath){
    return (dataURL.substring(0,1) != "/") ? (contextPath + "/" + dataURL) : dataURL;
}

//为ECharts饼图添加背景圆圈，参数依次为 ECharts图形实例，间隔系数（可省略）
function appendPieBg(ec, distance) {
    //var opt = ec.getOption();
    var dom = ec.dom;
    var series = ec.getSeries();
    var width = $(dom).width();
    var height = $(dom).height();
    var distance = distance || 1.25;
    //间隔系数,默认为1.25
    var style = "position: absolute; background: url(images/pie_bg.png) no-repeat; background-size: 100% 100%;";
    for (var i = 0; i < series.length; i++) {
        if (series[i].type == "pie") {
            var center = series[i].center || ['50%', '50%'];
            var radius = series[i].radius || [0, '75%'];
            var d = Math.min(width, height);
            var r = ((radius[1] + "").indexOf("%") != -1) ? radius[1].replace("%", "") / 100 * d/2 : radius[1];
            var x = ((center[0] + "").indexOf("%") != -1) ? center[0].replace("%", "") / 100 * width : center[0];
            var y = ((center[1] + "").indexOf("%") != -1) ? center[1].replace("%", "") / 100 * height : center[1];
            var html = "<div class='pieBg' style='" + style + "width:" + r * 2 * distance + "px; height:" + r * 2 * distance + "px; left: " + (x - r * distance) + "px; top : " + (y - r * distance) + "px;'></div>";
            $(dom).parent().append(html);
        }
    }
}

//为ECharts单值环图的每个系列添加标题（css类样式需自行加入），参数依次为 ECharts图形实例，绝对定位时与底部间隔值（可省略）
function appendPieTitle(ec, bottom){
    var dom = ec.dom;
    var series = ec.getSeries();
    var len = series.length;
    var titleSet = $('<div class="chart_title"></div>');
    var bottom = bottom || "5%";
    titleSet.css({
        "bottom": bottom
    });
    for(var i = 0; i < len; i++){
        var txt = "";
        series[i].data.forEach(function(d, i){
            (d.name != "other") && (txt = d.name);
        });
        var tit = $('<div class="col-xs-1 chart_title_text">' + txt + '</div>');
        var wid = (100 / len).toFixed(2) + "%";
        tit.css({
            "width": wid
        });
        titleSet.append(tit);
        $(dom).parent().append(titleSet);
    }
}

//通过改变放缩比例scale调整body大小使其适应当前屏幕分辨率
function adjustBodySize() {
    $(function() {
        var w = window.screen.width;
        var h = window.screen.height;
        var bodyW = document.body.scrollWidth;
        var bodyH = document.body.scrollHeight;
        var wp = Math.floor(w / bodyW * 100) / 100;
        var hp = Math.floor(h / bodyH * 100) / 100;
        $("body").css({
            "background-size" : bodyW * wp + 'px ' + bodyH * hp + 'px',
            "transform" : 'scale(' + wp + ',' + hp + ')',
            "transform-origin" : '0 0'
        });
        $("html").css("height", "100%");
    });
}

//等比缩放调整widget所在div，使其适应当前元页面iframe的大小，并居中
function adjustWidgetScale(dom) {
    $(function() {
        $('html').css({
            'width' : '100%',
            'height' : '100%'
        });
        var pageW = $('html').width();
        var pageH = $('html').height();
        (!dom) && ( dom = $('body').children('div')[0]);
        var w = $(dom).width();
        var h = $(dom).height();
        var r = parseInt(100 * Math.min(pageW / w, pageH / h)) / 100;
        $(dom).css({
            'transform' : 'scale(' + r + ')',
            'transform-origin' : 'left'
        });
        $('body').css({
            'width' : pageW + 'px',
            'height' : pageH + 'px',
            'display' : 'table-cell',
            'text-align' : 'center',
            'vertical-align' : 'middle'
        });
    });
}

//更换主题
function changeBodyColor() {
    theme_opt = window.localStorage.getItem("theme_opt");
    if (theme_opt == 'red') {
        $("body").addClass("theme_2").removeClass("theme_1").removeClass("default");
    } else if (theme_opt == 'blue') {
        $("body").addClass("theme_1").removeClass("theme_2").removeClass("default");
    } else {
        $("body").addClass("default").removeClass("theme_1").removeClass("theme_2");
    }
};
