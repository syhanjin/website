var network_error = function () {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">网络错误</p>', function () {
        window.location = '/c18/m/roster';
    });
}
var not_logged_in = function () {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">请先登录</p>', function () {
        window.location = '/c18/m/roster';
    });
}
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}


$(document).ready(function () {
    var num = window.location.pathname.split('/').slice(-1);
    $.get('/c18/api/getstuinfo?num=' + num, function (data) {
        if (data == 'False') {
            P.open(200, 100, '<p style="font-size:36px; text-align: center;">粗错了</p>', function () {
                window.location = '/c18/roster';
            });
        } else {
            $(".stu-info .r-photo").css('background', 'url(' + (data['photo'] ? data['photo'] : '/static/c18/user.png') + ') center/cover');
            $(".stu-info .r-info p .name").get(0).innerHTML = data['name'];
            $(".stu-info .r-info p .num").get(0).innerHTML = 'C1818' + PrefixInteger(data['num'], 2);
            document.title = 'C1818' + PrefixInteger(data['num'], 2) + data['name'];

            if (data['tel'])
                $(".stu-info .info- .tel").text(data['tel']).get(0).href = "tel:" + data['tel'];;
            if (data['nick'])
                $(".stu-info .info- .nick").text(data['nick']);
            if (data['addr'])
                $(".stu-info .info- .addr").text(data['addr']);
            if (data['seni'])
                $(".stu-info .info- .seni").text(data['seni']);
            if (data['qq'])
                $(".stu-info .info- .qq").text(data['qq']).get(0).href = "tencent://Message/?Uin=" + data['qq'] + "&amp;websiteName=q-zone.qq.com&amp;Menu=yes";

            if (data['message']) {
                var spl = data['message'].replace(/ /g, "&nbsp;").split(/\n/g);
                var res = '';
                for (i in spl) res += '<p>' + spl[i] + '</p>';
                $(".message div").html(res);
            }

            if (data['gp']) {
                $(".gp .ph-left").css('background', 'url(' + data['gp'][0] + ') center/cover');
                $(".gp .ph-right").css('background', 'url(' + data['gp'][1] + ') center/cover');
            }
            if (data['pp']) {
                for (var i = 0; i < 6; i++) {
                    $(".pp div").eq(i).css("background", "url(" + data['pp'][i] + ") center/cover");
                }
            }
        }
    }).fail(network_error);
});
