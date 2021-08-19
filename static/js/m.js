$(function () {

    $.get('/api/getnavitems', function (rel) {
        // alert(rel);
        var nav = $(".nav");
        for (var i = 0; i < rel.length; i++) {
            if (i >= 6)
                return;
            nav.append("<a class='item' href=\"/m" + rel[i]['href'] + "\">" + rel[i]['title'] + "</a>");
        }
    });
})