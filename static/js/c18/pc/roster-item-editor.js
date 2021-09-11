var network_error = function () {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">网络错误</p>', function () {
        window.location = '/c18/roster';
    });
}
var submit_fail = function () {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">提交失败</p>');
}
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}


$(document).ready(function () {
    var num = window.location.pathname.split('/').slice(-2)[0];
    $.get('/c18/api/getstuinfo?num=' + num, function (data) {
        if (data['code'] != 0) {
            P.open(200, 100, '<p style="font-size:36px; text-align: center;">粗错了</p>', function () {
                window.location = '/c18/roster';
            });
        } else {
            data = data['data']
            $(".stu-info .r-photo img").get(0).src = data['photo'] ? data['photo'] : '/static/c18/user.png';
            $(".stu-info .r-info p .name").get(0).innerHTML = data['name'];
            $(".stu-info .r-info p .num").get(0).innerHTML = 'C1818' + PrefixInteger(data['num'], 2);
            document.title = 'C1818' + PrefixInteger(data['num'], 2) + data['name'] + '-编辑';

            $(".stu-info .info- .tel").val(data['tel']);
            $(".stu-info .info- .nick").val(data['nick']);
            $(".stu-info .info- .addr").val(data['addr']);
            $(".stu-info .info- .seni").val(data['seni']);
            $(".stu-info .info- .qq").val(data['qq']);

            $(".message textarea").text(data['message']);

            if (data['gp']) {
                $(".gp .ph-left").css('background', 'url(' + data['gp'][0] + ') center/cover');
                $(".gp .ph-right").css('background', 'url(' + data['gp'][1] + ') center/cover');
            }
            for (var i = 0; i < 6; i++) {
                $(".pp div:not(.frame)").eq(i).css("background", "url(" + data['pp'][i] + ") center/cover");
            }
        }
    }).fail(network_error);
    $("#pp div:not(.frame)").bind("mousedown", function (e) {
        var d = $(this);
        d.css("z-index", "9999");
        var distenceX = d.position().left;
        //page  显示鼠标指针的位置   （此时相当于，鼠标按下的初始值）
        var distenceY = d.position().top;
        var lx = e.pageX, ly = e.pageY;
        var to = null;
        // 鼠标移动
        $(document).mousemove(function (e) {
            // 获取鼠标的位移（鼠标此时的page值 - 鼠标按下时的初始值 = 元素的移动值）
            var x = distenceX + e.pageX - lx;
            var y = distenceY + e.pageY - ly;
            d.css({
                'left': x + 'px',
                'top': y + 'px'
            });
            $("#pp .frame").css("opacity", "");
            if (d.position().top <= (50 + d.outerHeight() * 0.5) && //
                d.position().top >= (50 - d.outerHeight() * 0.5)) {
                var d2 = $("#pp .frame"), width = d2.eq(1).outerWidth();
                for (var i = 0; i < 6; i++) {
                    var t = d2.eq(i);
                    var left = t.get(0).offsetLeft;
                    if (d.position().left >= left - width * 0.5 && //
                        d.position().left <= left + width * 0.5) {
                        t.css("opacity", "1");
                        to = d2.index(t);
                        return;
                    }
                }
            }
        })
        // 鼠标抬起
        $(document).mouseup(function (e) {
            $(document).off('mousemove');
            d.css({
                'left': "",
                'top': ""
            });
            d.css("z-index", "");
            $("#pp .frame").css("opacity", "");
            if (to != null) {
                var temp = d.css("background");
                to = $("#pp div:not(.frame)").eq(to);
                d.css("background", to.css("background"));
                to.css("background", temp);
            }
        })
    })
    $("#cancel").bind("click", function () {
        var last = "", s = window.location.href.split('/');
        for (var i = 0; i < s.length - 1; i++)
            last += s[i] + '/';
        window.location.href = last.slice(0, -1);
    });
    $("#preserve").bind("click", function () {
        var pp = [];
        try {

            for (var i = 0; i < 6; i++) {
                pp[i] = $("#pp div:not(.frame)").eq(i).css("background").split("url(")[1].split(")")[0];
            }
        } catch (err) {
            console.log(err)
            pp = []
        }
        var data = {
            'tel': $(".stu-info .info- .tel").val(),
            'nick': $(".stu-info .info- .nick").val(),
            'addr': $(".stu-info .info- .addr").val(),
            'seni': $(".stu-info .info- .seni").val(),
            'qq': $(".stu-info .info- .qq").val(),
            'message': $(".message textarea").val(),
            'pp': pp
        };
        $.post(window.location.href, data, function (rel) {
            if (rel['code'] == 0) {
                var last = "", s = window.location.href.split('/');
                for (var i = 0; i < s.length - 1; i++)
                    last += s[i] + '/';
                window.location.href = last.slice(0, -1);
            } else {
                submit_fail();
            }
        }).fail(network_error);
        ;
    });
});
