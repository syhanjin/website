$(document).ready(function() {

    $.get("/c18/api/getteachers", function(data) {
        var f = $(".container");
        for (var i = 0; i < data.length; i++) {
            var t = f.append("<div class='teacher' onclick='window.location.href+=\"/" + data[i]['id'] + "\"'>").children().last();
            t.append('<img class="photo" />');
            t.append('<div class="text">');
            
            var text = t.children('div.text');
            text.append('<p class="name">');
            text.append('<p class="subject">');
            text.append('<p class="message">');
            text.children('.name').text(data[i]['name']);
            text.children('.subject').text(data[i]['subject']);
            text.children('.message').text(data[i]['message']);

            t.children('img.photo').css("background", "url(" + (data[i]['photo'] ? data[i]['photo'] : '/static/c18/user.png') + ") center/cover");
        }
    });
});
