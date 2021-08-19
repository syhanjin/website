try {
    var urlhash = window.location.hash;
    if (!urlhash.match("fromapp")) {
        if ((navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad)/i))) {
            var t1 = document.location.toString();
            var t2 = t1.split("//")[1];
            var t3 = t2.split("/");
            var rel = "";
            for (var i = 1; i < t3.length; i++) {
                if (t3[i] != '')
                    rel += '/' + t3[i];
            }
            window.location = "/m" + rel;
        }
    }
} catch (err) {
}
var user, user_data,//
    afterdata = function () { }
$(function () {
    $.cookie.raw = true;
    $.get('/api/getuserdata', function (rel) {
        if (rel == 'False') {
            // alert('t');
            $.cookie('_uid', '', { path: '/', expires: -1 });
            $(".user .user-menu").remove();
        } else {
            // alert($.cookie('_uid'));
            $.cookie('_uid', $.cookie('_uid'), {
                expires: 3,
                path: '/'
            });
            // 处理用户名和头像 .user-photo 默认生成为用户头像
            user = rel['user'];
            $(".oper").remove();
            var p = $(".user-photo");
            p.prepend('<img src="' + rel['photo'] + '" />');
            // .user-name 默认生成为用户名 如果是a标记，自动添加链接
            $(".user-name").append(rel['user']);
            $("a.user-name").get(0).href = '/user/' + rel['_uid'];
            p.show();
            // 显示在界面上的信息处理
            if (rel['chat-count']){// 聊天室未读信息
            $('.bar-chat').append('<div class="after" data-count="' +
                (rel['chat-count'] > 99 ? '99+' : rel['chat-count'])
                + '" >');
            }
            // 某些页面可能会用到信息
            user_data = rel;
            if (afterdata) afterdata();
        }
    }).fail(function () {
        $(".user .user-menu").remove();
    });
    $.get('/api/getlinksitems', function (rel) {
        // alert(rel);
        var nav_bar = $(".tail .links");
        for (var i = 0; i < rel.length; i++) {
            if (i % 6 == 0)
                nav_bar.append("<div>");
            nav_bar.children("div").last().append("<a target=\"_Blank\" href=\"" + rel[i]['href'] + "\">" + rel[i]['title'] + "</a>");
        }
    });
    $(".user .user-photo").hover(function () {
        $(".user .user-menu").stop();
        $(".user .user-menu").css("display", "block");
        $(".user .user-menu").animate({
            opacity: '1',
        });
    }, function () {
        $(".user .user-menu").stop();
        $(".user .user-menu").animate({
            opacity: '0',
        }, function () {
            $(".user .user-menu").css("display", "none");
        });
    });
    $(".user .user-menu").hover(function () {
        $(".user .user-menu").stop();
        $(".user .user-menu").css("display", "block");
        $(".user .user-menu").css('opacity', '1');
    }, function () {
        $(".user .user-menu").stop();
        $(".user .user-menu").animate({
            opacity: '0',
        }, function () {
            $(".user .user-menu").css("display", "none");
        });
    });

    // events
    init_events();
})