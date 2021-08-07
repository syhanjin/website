
function HTMLDecode(text) {
    var temp = document.createElement("div");
    temp.innerHTML = text;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}
var code_copy = function (e) {
    var t = e.target || e.srcElement;
    if (t.className.indexOf('hljs-button') > -1) {
        e.preventDefault();
        var i = document.getElementById("hljs-copy-el"), n = document.documentElement.scrollTop;
        i || (i = document.createElement("textarea"),
            i.style.position = "absolute",
            i.style.left = "-9999px",
            i.style.top = n + "px",
            i.id = "hljs-copy-el",
            document.body.appendChild(i)),
            i.textContent = e.currentTarget.innerText.replace(/[\u00A0]/gi, " ");
        i.select();
        try {
            var r = document.execCommand("copy");
            t.dataset.title = r ? '复制成功' : '复制失败', r && setTimeout(function () {
                t.dataset.title = '复制'
            }, 1e3)
        } catch (a) {
            t.dataset.title = '复制失败'
        }
    }
}
var numbering = function () {
    // 生成行号
    $("pre code").each(function () {
        $(this).append('<div class="hljs-button" data-title="复制"></div>');
        var code = this.innerText.replace(/(^\s*)|(\s*$)/g, "");
        $(this).bind('click', code_copy);
        $(this).after('<ul class="pre-numbering" >');
        var ul = $(this).next().get(0);
        for (var i = 1; i <= code.split('\n').length; i++) {
            ul.innerHTML += '<li style="color: rgb(153, 153, 153);">' + i + '</li>';
        }
    });
}

$(document).ready(function () {
    var stackedit = new Stackedit();
    // 判断 hash
    switch (window.location.hash) {
        case '#main':

            break;
        case '#activity':

            break;

    }
    var intr = $('.display-main-introduction');
    intr.html(HTMLDecode(intr.html()));
    numbering();
    intr.show();
    $('#edit').on('click', function () {
        var el = document.querySelector('.display-main-introduction');
        var ta = document.querySelector('.display-main-middle .card textarea');
        var old_html = el.innerHTML;
        var old_text = ta.innerText;
        stackedit.openFile({
            name: '编辑个人介绍',
            content: {
                text: ta.value
            }
        });
        stackedit.on('fileChange', (file) => {
            el.innerHTML = file.content.html;
            ta.value = file.content.text;
        });
        stackedit.on('close', () => {
            var text = ta.value;
            var html = el.innerHTML;
            $.post('/user/modify/introduction', { 'md': text, 'html': html }, function (rel) {
                if (rel == 'True') {
                    numbering();
                    return;
                } else {
                    el.innerText = '修改失败';
                    ta.innerText = old_text;
                    setTimeout(function () {
                        el.innerHTML = old_html;
                    }, 2500);
                }
            }).fail(function () {
                el.text('修改失败');
                ta.innerText = old_text;
                setTimeout(function () {
                    el.innerHTML = old_html;
                }, 2500);
            });
        });
    });

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
                    }, 2500);
                }
                p.show();
            }).fail(function () {
                var old_text = p.text();
                p.text('修改失败');
                setTimeout(function () {
                    p.text(old_text);
                }, 2500);
            });
        } else
            p.show();
    }).keyup(function (event) {
        if (event.keyCode == 13) {
            $(this).blur();
        }
    })
});