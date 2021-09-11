

// 配置信息
var katex_config = {
    delimiters:
        [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
        ]
},showdown_config = {
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
    ghCodeBlocks: true,
    tasklists: true,
    emoji: true,
    ghCodeBlocks: true,
    // simpleLineBreaks: true,
    disableForced4SpacesIndentedSublists: true,
    extensions: []
};
// 方法函数
function HTMLDecode(text) {
    var temp = document.createElement("div");
    temp.innerHTML = text;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}
function markdown(el, text) {
    // '<div class="hljs-button" data-title="复制"></div>'
    var converter = new showdown.Converter(showdown_config);
    el.innerHTML = converter.makeHtml(text);
    hljs.initHighlighting();
    renderMathInElement(document.body, katex_config);
    numbering();
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
function failed_intr(el, ta, old_text) {
    el.innerText = '修改失败';
    ta.innerText = old_text;
    setTimeout(function () {
        markdown(el, old_text);
    }, 2500);
}
function failed_pers(p, old_text) {
    var old_text = p.text();
    p.text('修改失败');
    setTimeout(function () {
        p.text(old_text);
    }, 2500);
}
var this_page, stackedit, activity_page = 1;
function check_hash() {
    var hash = window.location.hash || '#main';
    if (this_page)
        this_page.hide();
    this_page = $('#page-' + hash.slice(1));
    this_page.show();
    $('.selected').removeClass('selected');
    $('a.entry[href="' + hash + '"]').addClass('selected');
    // 判断 hash
    switch (hash) {
        case '#main':
            $.get(location.pathname + '/introduction', function (rel) {
                if (rel['code'] != 0) return;
                var el = document.querySelector('.display-main-introduction');
                var ta = document.querySelector('.display-main-middle .card textarea');
                rel = rel['data']
                ta.value = rel;
                markdown(el, rel);
            });
            break;
        case '#activity':
            this_page.html('<p>该功能暂停开发</p>');
            return;
            $.get(location.pathname + '/activity?page=' + activity_page, function (rel) {
                if (rel == 'False')
                    this_page.html('<p>获取动态失败</p>')
                else if (rel.length == 0)
                    this_page.html('<p>此人无动态</p>')
                else {
                    for (i in rel) {
                        var div = document.createElement('div');
                        div.className = "activity";

                    }
                }
            }).fail(function () {
                this_page.html('<p>获取动态失败</p>')
            });
            break;

    }
}
function init() {
    // pages
    this_page = $('#page-main');
    check_hash();
    $(window).on('hashchange', check_hash);
    // 初始化stackedit
    stackedit = new Stackedit();
}

// main
$(document).ready(function () {
    init();
    var intr = $('.display-main-introduction');
    intr.html(HTMLDecode(intr.html()));
    numbering();
    intr.show();
    $('#edit').on('click', function () {
        var el = document.querySelector('.display-main-introduction');
        var ta = document.querySelector('.display-main-middle .card textarea');
        var old_text = ta.innerText;
        stackedit.openFile({
            name: '编辑个人介绍',
            content: {
                text: ta.value
            }
        });
        stackedit.on('fileChange', (file) => {
            ta.value = file.content.text;
        });
        stackedit.on('close', () => {
            var text = ta.value;
            $.post('/user/modify/introduction', { 'text': text }, function (rel) {
                if (rel['code'] == 0)
                    markdown(el, text);
                else
                    failed_intr(el, ta, old_text);
            }).fail(function () {
                failed_intr(el, ta, old_text);
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
                if (rel['code'] == 0)
                    p.text(text);
                else
                    failed_pers(p, old_text);
                p.show();
            }).fail(function () {
                failed_pers(p, old_text);
            });
        } else
            p.show();
    }).keyup(function (event) {
        if (event.keyCode == 13) {
            $(this).blur();
        }
    })
});