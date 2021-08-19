$(document).ready(function() {
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
});
