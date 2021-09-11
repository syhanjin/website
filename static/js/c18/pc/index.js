$(document).ready(function () {
    $.get('/c18/api/getnavitems', function (rel) {
        // alert(rel);
        if (rel['code'] != 0) return;
        rel = rel['data']
        var nav_bar = $(".nav .bar");
        for (var i = 0; i < rel.length; i++) {
            if (i >= 6)
                return;
            nav_bar.append("<div></div>");
            nav_bar.children("div").last().append("<a href=\"" + rel[i]['href'] + "\">" + rel[i]['title'] + "</a>");
        }
    });
});
