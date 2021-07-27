try {
    var urlhash = window.location.hash;
    if (!urlhash.match("fromapp")) {
        if ((navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad)/i))) {
            var t1 = document.location.toString();
            var t2 = t1.split("//")[1];
            var t3 = t2.split("/");
            var rel = "";
            for (var i = 2; i < t3.length; i++) {
                if (t3[i] != '')
                    rel += '/' + t3[i];
            }
            window.location = "/c18/m" + rel;
        }
    }
} catch (err) {
}

$(document).ready(function() {
    $.get('/api/getuserdata', function(rel) {
        if (rel == 'False') {
            // alert('t');
            $.cookie('user', '', {
                path : '/',
                expires : -1
            });
            $(".user .user-menu").remove();
        } else {
            // alert($.cookie('user'));
            $.cookie('user', $.cookie('user'), {
                expires : 3,
                path : '/'
            });
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
    $.get('/c18/api/getnavitems', function(rel) {
        // alert(rel);
        var nav_bar = $(".nav .bar");
        for (var i = 0; i < rel.length; i++) {
            if (i >= 6)
                return;
            nav_bar.append("<div></div>");
            nav_bar.children("div").last().append("<a href=\"" + rel[i]['href'] + "\">" + rel[i]['title'] + "</a>");
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
