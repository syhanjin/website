$(document).ready(function() {
    $.get('/api/getuserdata', function(rel) {
        if (rel == 'False') {
            $.cookie('_uid', '', {
                path : '/',
                expires : -1
            });
        } else {
            // alert($.cookie('_uid'));
            $.cookie('_uid', $.cookie('_uid'), {
                expires : 3,
                path : '/'
            });
            var u = $('.nav .user');
            u.children('img').get(0).src = rel['photo'];
            var info = u.children('.uinfo');
            info.children('.uname').text(rel['user']);
            info.children('.uname').get(0).href='/m/user/'+rel['_uid'];
            if(rel['user'])info.children('.user-ops').show()
        }
    }).fail(function() {
        $.cookie('_uid', '', {
            path : '/'
        });
    });
    $.get('/c18/api/getnavitems', function(rel) {
        // alert(rel);
        var nav = $(".nav");
        for (var i = 0; i < rel.length; i++) {
            if (i >= 6)
                return;
            src = rel[i]['href'];
            if(src.indexOf('/static')==-1)src=src.replace('/c18', '/c18/m');
            nav.append("<a class='item' href=\"" + src + "\">" + rel[i]['title'] + "</a>");
        }
    });
    $('.open-nav').bind('click', function() {
        $('.nav').show().animate({
            'left' : '0'
        });
        $('.layout').show().animate({
            'opacity' : '1'
        });
    });
    $('.layout').bind('click', function() {
        $('.nav').animate({
            'left' : '-100%'
        });
        $('.layout').animate({
            'opacity' : '0'
        },function(){
            $('.layout').hide();
        });
    });
});
