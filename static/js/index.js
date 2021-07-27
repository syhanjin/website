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
var user;
$(document).ready(function() {
    $.cookie.raw = true; 
    $.get('/api/getuserdata', function(rel) {
        if (rel == 'False') {
            // alert('t');
            $.cookie('user', '', { path : '/', expires: -1 });
            $(".user .user-menu").remove();
        } else {
            // alert($.cookie('user'));
            $.cookie('user', $.cookie('user'), {
                expires : 3,
                path : '/'
            });
            user=$.cookie('user');
            $(".oper").remove();
            var p = $(".user .photo");
            p.prepend('<img src="' + rel['photo'] + '" />');
            $(".user .user-menu .header .name").append(rel['user']);
            p.show();
        }
    }).fail(function() {
        $.cookie('user', '', {
            path : '/'
        });
        $(".user .user-menu").remove();
    });
    $.get('/api/getnavitems', function(rel) {
        // alert(rel);
        var nav_bar = $(".nav .bar");
        for (var i = 0; i < rel.length; i++) {
            if (i >= 6)
                return;
            nav_bar.append("<div></div>");
            nav_bar.children("div").last().append("<a href=\"" + rel[i]['href'] + "\">" + rel[i]['title'] + "</a>");
        }
    });
    $.get('/api/getlinksitems', function(rel) {
        // alert(rel);
        var nav_bar = $(".tail .links");
        for (var i = 0; i < rel.length; i++) {
            if (i % 6 == 0)
                nav_bar.append("<div>");
            nav_bar.children("div").last().append("<a target=\"_Blank\" href=\"" + rel[i]['href'] + "\">" + rel[i]['title'] + "</a>");
        }
    });
    $(".user .photo").hover(function() {
        $(".user .user-menu").stop();
        $(".user .user-menu").css("display", "block");
        $(".user .user-menu").animate({
            opacity : '1',
        });
    }, function() {
        $(".user .user-menu").stop();
        $(".user .user-menu").animate({
            opacity : '0',
        }, function() {
            $(".user .user-menu").css("display", "none");
        });
    });
    $(".user .user-menu").hover(function() {
        $(".user .user-menu").stop();
        $(".user .user-menu").css("display", "block");
        $(".user .user-menu").css('opacity', '1');
    }, function() {
        $(".user .user-menu").stop();
        $(".user .user-menu").animate({
            opacity : '0',
        }, function() {
            $(".user .user-menu").css("display", "none");
        });
    });
});
