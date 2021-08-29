var network_error = function() {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">网络错误</p>', function() {
        window.location = '/c18';
    });
}
var not_logged_in = function() {
    P.open(200, 100, '<p style="font-size:36px; text-align: center;">请先登录</p>', function() {
        window.location = '/c18';
    });
}
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}


$(document).ready(function() {
    $.get('/c18/api/getroster', function(data) {
        if (data == 'False') {
            P.open(200, 100, '<p style="font-size:36px; text-align: center;">粗错了</p>', function() {
                window.location = '/c18';
            });
        } else {
            var r = $("#roster table tbody");
            for (var i = 0; i < data.length; i++) {
                var item = r.append("<tr class='roster-tr' onclick=\"window.location.href+='/'+" + PrefixInteger(data[i]['num'], 2) + "\">").children('.roster-tr').last();
                item.append('<td class="num">')//
                .append('<td class="name">')//
                .append('<td class="gender"> ')//
                .append('<td class="posi posi-cadres"> ')//
                var subjects=['CH','M','E','PH','C','P','H','B','G','A','CO'];
                for(j in subjects){
                    item.append('<td class="pr pr-'+subjects[j]+'"> ');
                }
                item.children('.num').get(0).innerHTML = 'C1818' + PrefixInteger(data[i]['num'], 2);
                item.children('.name').get(0).innerHTML = data[i]['name'];
                item.children('.gender').get(0).innerHTML = data[i]['gender'] ? data[i]['gender'] : '未知';
                if (data[i]['posi-cadres']) {
                    var posi_cadres = item.children('.posi-cadres');
                    data[i]['posi-cadres'].sort();
                    for (var j = 0; j < data[i]['posi-cadres'].length; j++) {
                        posi_cadres.append('<span>').children().last().append(data[i]['posi-cadres'][j]);
                    }
                }
                if (data[i]['posi-repr']) {
                    for (j in data[i]['posi-repr']) {
                        item.children('.pr-'+data[i]['posi-repr'][j]).css('opacity','1');
                    }
                }
            }

            // for (var i = 0; i < data.length; i++) {
            // var item = r.append("<div class='roster-item' onclick='window.location.href=\"/c18/roster/" + PrefixInteger(data[i]['num'], 2) + "\"'>").children().last();
            // item.append('<img class="photo">');
            // item.append('<div class="text">');
            // var text = item.children('div.text');
            // text.append('<span class="num">');
            // text.append('<span class="name">');
            // item.children('img.photo').css("background","url("+(data[i]['photo'] ? data[i]['photo'] : '/static/c18/user.png') +") center/cover");
            // text.children('span.name').get(0).innerHTML = data[i]['name'];
            // text.children('span.num').get(0).innerHTML = 'C1818' + PrefixInteger(data[i]['num'], 2);
            // }
            // $("#roster .roster-item .text").css({
            // "font-size" : parseFloat($('#roster .roster-item').css("width")) * 0.1,
            // "height" : parseFloat($('#roster .roster-item').css("width")) * .25,
            // "line-height" : parseFloat($('#roster .roster-item').css("width")) * .25 + 'px'
            // });
        }
    }).fail(network_error);
    $(window).resize(function() {
        $("#roster .roster-item .text").css({
            "font-size" : parseFloat($('#roster .roster-item').css("width")) * 0.1,
            "height" : parseFloat($('#roster .roster-item').css("width")) * .25,
            "line-height" : parseFloat($('#roster .roster-item').css("width")) * .25 + 'px'
        });
    });
});
