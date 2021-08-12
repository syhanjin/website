// 定义变量
var search_box, choices = {};
// 数据获取完后运行
var afterdata = function () {
    // 同步用户数据
    if (user_data['allowStrangers'])
        $('#alws').addClass('select');
}
// 定义函数
function make_search_item(u, user, _uid) {
    var re = new RegExp(u, 'gi');
    rel = user.replace(re, function (i) {
        return '<span class="matched">' + i + '</span>'
    }
    );
    rel.replace
    return rel
}

function close_search_box(op) {
    if (op == 'empty')
        search_box.empty()
    search_box.stop().animate({
        'height': '0',
        'min-height': '0'
    }, 500, function () {
        search_box.css({
            'height': '',
            'z-index': '',
            'opacity': '',
            'min-height': ''
        });
    })
}

function open_search_box(users, u) {
    var box = search_box
        .stop()
        .css('height', '');
    var sheight = 0;
    if (users.type == null) {
        sheight = box.html().length <= 0 && box.css('z-index') == '9999999' ? 30 : box.height();
        box.empty();
        for (i in users) {
            var p = document.createElement('p');
            box.append(p);
            p.className = "search-item";
            p.setAttribute("data-_uid", users[i]['_uid'])
            p.innerHTML = make_search_item(u, users[i]['user']);
        }
    }
    var height = box.height();
    box.css({
        "z-index": "9999999",
        "opacity": "1",
        "height": sheight + "px",
    });
    box.animate({
        'height': Math.max(Math.min(400, height), 30) + 'px'
    }, 500);
}

function msg_box(_uid) {

}

function chat_list(){
    $.get('/chat/list',function(rel){

    });

}


$(document).ready(function () {
    // 获取jQuery对象
    search_box = $("#search-box");
    // 事件监听
    $("#search").on('keyup', function () {
        var u = this.value;
        if (u == '') {
            close_search_box('empty');
            return;
        }
        $.get('/user/search?u=' + u, function (rel) {
            if (rel == 'False') {
                new Event('用户查找失败');
            } else {
                open_search_box(rel, u)
            }
        }).fail(function () {
            new Event('用户查找失败');
        });
    }).on('focus', open_search_box)
        .on('blur', close_search_box)
    search_box.on("click", ".search-item", function () {
        var d = $(this);
        $("#search").val('');
        search_box.empty();
        mes_box(d.attr("data-_uid"))
    });
    // 接收方式按钮
    $(".right-btn").on('click', function (e) {
        $(this).toggleClass('R180');
        var titset = $(".title-settings")
            .slideToggle(500);

    });

    // 选择器
    choices['alws'] = function (status) {
        if (status)
            $.get('/chat/modify/allowStrangers?s=yes');
        else
            $.get('/chat/modify/allowStrangers?s=no');
    };
    $(document).on('click', '.choice', function () {
        var d = $(this);
        d.toggleClass('select');
        if (choices[d.attr('id')]) choices[d.attr('id')](d.hasClass('select'));
    });


    // chat-list
    chat_list();
});