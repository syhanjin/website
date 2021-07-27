var Tn, Tl, ems, Ts;
$(document).ready(function() {
    Tn = $("#together ul li").first();
    Tl = $("#together ul li").last();
    Ts=$("#together ul li");
    Tmake();
    var toInterval = setInterval(function() {
        Tnext();
    }, 10000);
});
var Tmake = function() {
    Tl.css("z-index", "0").animate({
        'opacity' : '0'
    }, 2000);
    Tn.css("z-index", "1").animate({
        'opacity' : '1'
    }, 2000);
}
var Tlast = function() {
    Tl=Tn;
    Tn=Tn.prev().length ? Tn.prev() : $("#together ul li").last();
    Tmake();
}
var Tnext = function() {
    Tl=Tn;
    Tn=Tn.next().length ? Tn.next() : $("#together ul li").first();
    Tmake();
}