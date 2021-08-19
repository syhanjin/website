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
        'SY右下角弹窗函数测试，如果您觉得这个弹窗不好看，欢迎来群<a target="_blank" href="http://shang.qq.com/wpa/qunwpa?idkey=057e58f1b40bec3f845e20596550131fd236577d698315bc0981c6f53af44a4c">1032103456</a>提提建议'
    )
    // var cnt=0,
    // interval = setInterval(() => {
    //     new Event('Event');
    //     if (cnt++>15)clearInterval(interval);
    // }, 1000);

});
