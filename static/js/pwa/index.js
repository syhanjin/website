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

$(document).ready(function() {
    $.get('//aichistudio.space/api/getuserdata', function(rel) {
        if (rel['code'] != 0) {
            $.cookie('_uid', '', {
                path : '/'
            });
        } else {
            // alert($.cookie('_uid'));
            $.cookie('_uid', $.cookie('_uid'), {
                expires : 3
            });
            $(".oper").hide();
            var p=$(".user .photo");
            p.append('<img src="'+rel['photo']+'" />');
        }
    });
});
