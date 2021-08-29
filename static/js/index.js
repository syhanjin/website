$(document).ready(function () {
    $.get('/api/getnavitems', function (rel) {
        // alert(rel);
        var nav_bar = $(".nav .bar");
        for (var i = 0; i < rel.length; i++) {
            if (i >= 6)
                return;
            nav_bar.append("<div></div>");
            nav_bar.children("div").last().append("<a href=\"" + rel[i]['href'] + "\">" + rel[i]['title'] + "</a>");
        }
    });
    var event = new Event(
        '弹窗函数大改测试，如有出现样式问题，请到Q群<a target="_blank" href="http://shang.qq.com/wpa/qunwpa?idkey=057e58f1b40bec3f845e20596550131fd236577d698315bc0981c6f53af44a4c">1032103456</a>留言'
    )
    // var cnt=0,
    // interval = setInterval(() => {
    //     new Event('Event');
    //     if (cnt++>15)clearInterval(interval);
    // }, 1000);

});
