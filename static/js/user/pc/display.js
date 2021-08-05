$(document).ready(function () {
    // 判断 hash
    switch (window.location.hash) {
        case '#main':

            break;
        case '#activity':

            break;

    }

    $('.display-user-personalized').on('click', function () {
        $(this).hide();
        var text = $(this).text().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        if (text != '此人很懒，啥都没留')
            $('.display-personalized-modify').val(text);
        $('.display-personalized-modify').show().focus();
    });
    $('.display-personalized-modify').on('blur', function () {
        $(this).hide();
        var p = $('.display-user-personalized');
        var text = $(this).val().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        if (text.length > 0) {
            $.post('/user/modify/personalized', { 'text': text }, function (rel) {
                if (rel == 'True') {
                    p.text(text);
                } else {
                    var old_text = p.text();
                    p.text('修改失败');
                    setTimeout(function () {
                        p.text(old_text);
                    });
                }
                p.show();
            }).fail(function () {
                var old_text = p.text();
                p.text('修改失败');
                setTimeout(function () {
                    p.text(old_text);
                });
            });
        } else
            p.show();
    }).keyup(function (event) {
        if (event.keyCode == 13) {
            $(this).blur();
        }
    })
});