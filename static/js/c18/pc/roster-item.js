var network_error = function () {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">网络错误</p>', function () {
        window.location = '/c18/roster';
    });
}
var not_logged_in = function () {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">请先登录</p>', function () {
        window.location = '/c18/roster';
    });
}


function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}


$(document).ready(function () {
    var num = window.location.pathname.split('/').slice(-1);
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
            document.title = 'C1818' + PrefixInteger(data['num'], 2) + data['name'];

            if (data['tel'])
                $(".stu-info .info- .tel").text(data['tel']);
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

    var obox = document.getElementById('pp'), aDiv = obox.getElementsByTagName('div');
    var open_pho = function () {
        document.getElementById("fixed").onmouseup = null;
        var sX, nX, desX = 0, tX = 0, index = 0;
        obox.style.transition = "";
        for (var i = 0; i < aDiv.length; i++) {
            aDiv[i].style.transform = "rotateY(" + (i * 60) + "deg) translate3d(0,0,650px)";
            aDiv[i].style.transition = "transform 1s " + (aDiv.length - i) * 0.2 + "s";
        }

        obox.autotimer = setInterval(function () {
            tX += 0.1;
            tX %= 360;
            obox.style.transform = "rotateX(0deg) rotateY(" + tX + "deg)";
        }, 20);

        document.getElementById("fixed").onmousedown = function (e) {
            clearInterval(obox.timer);
            e = e || window.event;
            var sX = e.clientX, hasMove = false;
            this.onmousemove = function (e) {
                e = e || window.event;
                var nX = e.clientX;
                // 当前点的坐标和前一点的坐标差值
                desX = nX - sX;
                tX += desX * 0.1;
                sX = nX;
                if (Math.abs(desX) > 1) hasMove = true;
            }
            this.onmouseup = function () {
                this.onmousemove = this.onmouseup = null;
                if (!hasMove) {
                    close_pho();
                }
                obox.timer = setInterval(function () {
                    desX *= 0.95;
                    tX += desX * 0.1;
                    if (Math.abs(desX) < 0.5) {
                        clearInterval(obox.timer);
                    }
                }, 13);
            }
            return false;
        }
        //滚轮放大缩小
        // mousewheel(document, function(e) {
        // e = e || window.event;
        // var d = e.wheelDelta / 120 || -e.detail / 3;
        // if (d > 0) {
        // index -= 20;
        // } else {
        // index += 30;
        // }(index < (-1050) && ( index = (-1050)));
        // document.body.style.perspective = 1000 + index + "px";
        // })
        // function mousewheel(obj, fn) {
        // document.onmousewheel === null ? obj.onmousewheel = fn : addEvent(obj, "DOMMouseScroll", fn)
        // }

        function addEvent(obj, eName, fn) {
            obj.attachEvent ? obj.attachEvent("on" + eName, fn) : obj.addEventListener(eName, fn);
        }

    }
    var close_pho = function () {
        clearInterval(obox.timer);
        clearInterval(obox.autotimer);
        document.getElementById("fixed").onmousedown = null;
        obox.style.transform = "rotateX(0deg) rotateY(0deg)";
        obox.style.transition = "transform 1s 0.2s";
        for (var i = 0; i < aDiv.length; i++) {
            aDiv[i].style.transform = "rotateY(0deg) translate3d(0,0,0)";
            aDiv[i].style.transition = "transform 1s " + (aDiv.length - i + 1) * 0.2 + "s";
        }
        document.getElementById("fixed").onmouseup = open_pho;
    };

    document.getElementById("fixed").onmouseup = open_pho;
});
