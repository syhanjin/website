var network_error = function() {
    openP(200, 100, '<p style="font-size:36px; text-align: center;">网络错误</p><div class="p-confirm" onclick="closeP()"></div>', function() {
        window.location = '/c18/m/roster';
    });
}
var submit_fail = function() {
    openP(200, 100, '<p style="font-size:36px; text-align: center;">提交失败</p><div class="p-confirm" onclick="closeP()"></div>');
}
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}

$(document).ready(function() {
    var num = window.location.pathname.split('/').slice(-2)[0];
    $.get('/c18/api/getstuinfo?num=' + num, function(data) {
        if (data == 'False') {
            openP(200, 100, '<p style="font-size:36px; text-align: center;">粗错了</p><div class="p-confirm" onclick="closeP()"></div>', function() {
                window.location = '/c18/roster';
            });
        } else {
            $(".stu-info .r-photo").css('background', 'url(' + (data['photo'] ? data['photo'] : '/static/c18/user.png') + ') center/cover');
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

                $(".gp .ph-left").css('background','url('+data['gp'][0]+') center/cover');
                $(".gp .ph-right").css('background','url('+data['gp'][1]+') center/cover');

            }
            if (data['pp'])
                for (var i = 0; i < 6; i++) {
                    $(".pp div:not(.frame)").eq(i).css("background", "url(" + data['pp'][i] + ") center/cover");
                }
        }
    }).fail(network_error);

    var p_divs = $("#pp div"), phos = [];
    for (var i = 0; i < 6; i++)
        phos[i] = p_divs.eq(i);
    p_divs.bind("click", function(e) {
        var d=$(this),index=-1;
        for(var i=0;i<phos.length;i++){
            if(phos[i].get(0)==d.get(0)){
                index = i
                break;
            }
        }
        if(index != -1)phos.splice(index,1);
        else phos.push(d);
        $("#pp div span").text("");
        for(var i=0;i<phos.length;i++){
            phos[i].children('span').text(i+1);
        }
    });

    $("#cancel").bind("click", function() {
        var last = "", s = window.location.href.split('/');
        for (var i = 0; i < s.length - 1; i++)
            last += s[i] + '/';
        window.location.href = last.slice(0, -1);
    });
    $("#preserve").bind("click", function() {
        if (phos.length < 6) {
            openP(200, 100, '<p style="font-size:24px; text-align: center;">个人照排序未完成</p><div class="p-confirm" onclick="closeP()"></div>');
            return;
        }
        var pp = [];
        try {
            for (var i = 0; i < 6; i++) {
                pp[i] = phos[i].css("background").split("url(")[1].split(")")[0];
            }
        } catch(err) {
            console.log(err)
        }
        var data = {
            'tel' : $(".stu-info .info- .tel").val(),
            'nick' : $(".stu-info .info- .nick").val(),
            'addr' : $(".stu-info .info- .addr").val(),
            'seni' : $(".stu-info .info- .seni").val(),
            'qq' : $(".stu-info .info- .qq").val(),
            'message' : $(".message textarea").val(),
            'pp' : pp
        };
        $.post(window.location.href, data, function(rel) {
            if (rel == 'True') {
                var last = "", s = window.location.href.split('/');
                for (var i = 0; i < s.length - 1; i++)
                    last += s[i] + '/';
                window.location.href = last.slice(0, -1);
            } else {
                submit_fail();
            }
        }).fail(network_error);
    });
});
