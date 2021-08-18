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
            user = rel['user'];
            $(".oper").remove();
            var p = $(".user-photo");
            p.prepend('<img src="' + rel['photo'] + '" />');
            $(".user-name").append(rel['user']);
            $(".user .user-menu .header .user-name").get(0).href = '/user/' + rel['_uid'];
            p.show();
            user_data = rel;
            if(afterdata)afterdata();
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
