$(document).ready(function() {
    $("body").prepend('<div id="popup">');
});
var p_callback;
var openP = function(w, h, e, callback_close, callback) {
    var p = $('#popup');
    p.empty();
    p_callback = callback_close ||
    function() {
    };
    p.css({
        'width' : '0',
        'height' : '0',
        'display' : 'block',
        'opacity' : '1'
    });
    p.animate({
        width : (w < 80 ? 80 : w) + 'px',
        height : (h < 50 ? 50 : h) + 'px'
    }, 150, function() {

        document.getElementById('popup').innerHTML = '<div class="p-header"><div id="p-close" onclick="closeP()"></div></div>' + e;
        if (callback != null)
            callback();
    });
}
var closeP = function(rel) {
    var p = $('#popup');
    p.children().css("display", "none");
    p.animate({
        width : "0",
        height : "0",
        opacity : "0"
    }, 350, function() {
        p.css("display", "none");
        p_callback(rel);
    });
}
