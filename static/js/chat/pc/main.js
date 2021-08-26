// 定义变量
var search_box, choices = {}, chat_main,
    msg_interval, msg_list = {}, msg_timestamp, msg_page,
    my_uid, now_uid, auto_refresh, ctrl, last_time;
// 数据获取完后运行
var afterdata = function () {
    // 同步用户数据
    if (user_data['allowStrangers'])
        $('#alws').addClass('select');
    if (user_data['MSG_CTRL']) {
        $('#ctrl').addClass('select');
        $('#send-msg span').text('Ctrl + Enter');
        ctrl = true;
    } else {
        $('#send-msg span').text('Enter');
        ctrl = false;
    }
    my_uid = user_data['_uid'];
}
// 定义函数
choices['alws'] = function (status) {
    if (status)
        $.get('/chat/modify/allowStrangers?s=yes');
    else
        $.get('/chat/modify/allowStrangers?s=no');
};
choices['ar'] = function (status) {
    // new Event('这个东西还没做好，暂时不能开启');
    // $('#ar').removeClass('select');
    // return;
    if (status)
        msg_interval = setInterval(get_new_msg, 1000),
            auto_refresh = true;
    else
        clearInterval(msg_interval),
            auto_refresh = false;
}
choices['ctrl'] = function (status) {
    if (status) {
        $.get('/chat/modify/MSG_CTRL?s=yes');
        $('#send-msg span').text('Ctrl + Enter');
        ctrl = true;
    } else {
        $.get('/chat/modify/MSG_CTRL?s=no');
        $('#send-msg span').text('Enter');
        ctrl = false;
    }
}
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

function make_time_string(tstring) {
    moment.locale('zh-cn');
    var time = moment(tstring);
    // var today = moment().startOf('day');
    // if
    // var yesterday = today.clone().subtract(1,'days');
    return time.calendar(null);
}

function make_msg_string(text) {
    // 匹配链接
    var res = text.replace(
        /(https?:\/\/)?(([0-9a-z.]+\.[a-z]+)|(([0-9]{1,3}\.){3}[0-9]{1,3}))(:[0-9]+)?(\/[0-9a-z%/.\-_]*)?(\?[0-9a-z=&%_\-]*)?(\#[0-9a-z=&%_\-]*)?/ig,
        function ($0, $1) {
            return '<a href="' + ($1 ? '' : 'http://') + $0 + '">' + $0 + '</a>';
        }
    )

    return res;
}

function make_msg(data, i2_time, T) {
    var div = document.importNode(document.getElementById('template-msg'), true), div = div.content || div;
    switch (data['type']) {
        case 'text':
            div.className = 'msg' + (my_uid == data['s_uid'] ? ' r' : '');
            if (T || moment(data['time']).diff(moment(i2_time), 'seconds') > 300) 
                div.querySelector('.system-propmt').innerText = make_time_string(data['time']);
            div.querySelector('.msg-main img').src = "/api/userphoto/" + data['s_uid'];
            div.querySelector('.msg-text').innerHTML = make_msg_string(data['text']);
            break;
        case 'mkfriends':
            if (my_uid == data['s_uid']) return null;
            div.querySelector('.system-propmt').innerText = make_time_string(data['time']);
            div.querySelector('.msg-main img').src = "/api/userphoto/" + data['s_uid'];
            div.querySelector('.msg-text').className = 'msg-text mkfriends';
            div.querySelector('.msg-text').innerHTML =
                '对方请求添加你为好友\n'
                + '验证信息：\n'
                + data['text']
                + '<span class="yes" data-_uid="'
                + data['s_uid']
                + '">同意</span><span class="no" data-_uid="'
                + data['s_uid']
                + '">拒绝</span>'
            break;
    }
    return div;
}

function get_new_msg() {
    var flag = ($('.msg-content-box')[0].clientHeight
        + $('.msg-content-box')[0].scrollTop
        + 10 >= $('.msg-content-box > div')[0].scrollHeight);
    $.get('/chat/unread_msg/' + now_uid, function (rel) {
        if (rel == 'False') return;
        var mcb = $(".msg-content-box > div");
        for (var i = 0; i < rel.length; i++) {
            mcb.append(make_msg(rel[i], last_time));
            last_time = rel[i]['time'];
        }
        if (flag) {
            $('.msg-content-box').scrollTop($('.msg-content-box > div').height());
        }
    });
}

function send_msg(_uid, text) {
    $.post('/chat/send_msg', {
        'r_uid': _uid,
        'text': text
    }, function (rel) {
        if (rel == 'False') {
            var user = $('.chat-header-user').text();
            var msg_item = document.createElement('div');
            msg_item.className = 'msg';
            var system_propmt = document.createElement('div');
            system_propmt.className = 'system-propmt';
            system_propmt.innerHTML = '你还不是'
                + (user ? user : 'TA')
                + '的好友，你可以选择 <span id="mkfriends" data-user="'
                + (user ? user : '')
                + '" data-_uid="'
                + _uid + '">添加好友</span>';
            msg_item.appendChild(system_propmt);
            $(".msg-content-box > div").append(msg_item);
        } else {
            if (!auto_refresh) location.reload();
            else {
                $(".msg-content-box > div").append(make_msg({
                    's_uid': my_uid,
                    'r_uid': _uid,
                    'text': text,
                    'time': moment().format("YYYY-MM-DD HH:mm:ss"),
                    'type': 'text'
                }, last_time));
                last_time = moment().format("YYYY-MM-DD HH:mm:ss");
                $('.msg-content-box').scrollTop($('.msg-content-box > div').height());
            }
        }
    });
}

function get_msg(_uid) {
    if (msg_page == -1) return;
    $.get('/chat/all_msg/' + _uid + '?p=' + msg_page + '&t=' + (msg_timestamp / 1000), function (rel) {
        if (rel == 'False') return;
        if (rel.length == 0) {
            msg_page = -1;
            return;
        }
        var mcb = $(".msg-content-box > div");
        for (var i = 0; i < rel.length; i++) {
            if (i + 1 == rel.length)
                mcb.prepend(make_msg(rel[i], null, true));
            else
                mcb.prepend(make_msg(rel[i], rel[i + 1]['time']))
        }
        if (msg_page == 1) {
            last_time = rel[0]['time'];
            $('.msg-content-box').scrollTop($('.msg-content-box > div').height())
        }
        msg_page += 1;
    });
}

function msg_box(_uid, user) {
    now_uid = _uid;
    $.get('/chat/has_uid?u=' + _uid, function (rel) {
        if (rel == 'False') {
            chat_main.empty();
            chat_main.html('<div class="tip">找不到用户：uid = ' + _uid + '</div>')
        } else {
            $('.chat-header-user').text(rel);
        }
    })
    chat_main.empty();
    var div = document.importNode(document.getElementById('template-index-main'), true), div = div.content || div;
    div.querySelector('.chat-header a').href = "/user/" + _uid;
    div.querySelector('.chat-header a').innerText = user || '';
    div.querySelector('#send-msg span').innerText = (ctrl ? 'Ctrl + ' : '') + 'Enter';
    chat_main.html(div);
    // return;
    // 滚动条到最上方自动加载消息
    $('.msg-content-box').off('scroll').on('scroll', function (e) {
        if (this.scrollTop == 0)
            get_msg(now_uid);
    });
    msg_timestamp = new Date().getTime();
    msg_page = 1;
    get_msg(_uid);
}

function chat_list() {
    $.get('/chat/list', function (rel) {
        if (rel == 'False') {

        } else {
            var cl = $('.chat-list');
            for (i in rel) {
                var div = document.importNode(document.getElementById('template-msg-item'), true), div = div.content || div;
                div.querySelector('.msg-item').href = "#" + rel[i]['s_uid'];
                div.querySelector('.left.photo img').src = '/api/userphoto/' + rel[i]['s_uid'];
                div.querySelector('.name span').innerText = rel[i]['s_user'];
                div.querySelector('.time').innerText = make_time_string(rel[i]['time']);
                div.querySelector('.last-msg').innerText = rel[i]['last_msg'];
                div.querySelector('.count').setAttribute('data-count', rel[i]['count'] < 100 ? rel[i]['count'] : '99+');
                cl.append(div);
            }
        }
        $('.msg-item[href="' + window.location.hash + '"]').addClass('active');
    });

}

function check_hash() {
    var hash = window.location.hash;
    if (!hash) return;
    _uid = hash.substr(1);
    if (!_uid) return;
    msg_box(_uid);
    $('.msg-item.active').removeClass('active');
    $('.msg-item[href="' + hash + '"]').addClass('active');
    $('.msg-item[href="' + hash + '"] .count').remove();
}

$(document).ready(function () {
    // 获取jQuery对象
    search_box = $("#search-box"), chat_main = $('.index-main');
    // 锚点监控
    check_hash();
    $(window).on('hashchange', check_hash);
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
        window.location.hash = '#' + d.attr("data-_uid");
    });
    $(document)
        // 绑定输入框字数限制
        .on('input', '#msg-text', function (e) {
            $('.word-count span').text(this.value.length);
        })
        // 绑定 好友操作
        .on('click', '.mkfriends .yes', function () {
            $.get('/chat/make_friends/accept?u=' + $(this).attr('data-_uid'));
            if (!auto_refresh) location.reload();
        })
        .on('click', '.mkfriends .no', function () {
            $.get('/chat/make_friends/refuse?u=' + $(this).attr('data-_uid'));
            if (!auto_refresh) location.reload();
        })
        //绑定 添加好友
        .on('click', '#mkfriends', function () {
            var _uid = $(this).attr('data-_uid');
            openP(500, 300,
                `<p style="font-size: 18px;text-align: center;">添加好友</p>
                <span style="text-align: center;display: block;">`+ $(this).attr('data-user') + `</span>
            <textarea data-_uid=`+ _uid + ` id="mk-text" type="text" maxlength="32" autofocus="autofocus" placeholder="填写验证信息..."
                style="resize:none;width: 80%;max-width: 450px;display: block;outline: 0;border: 2px solid #000000;margin: auto;padding: .2em 1em;height: 72px;"></textarea>
            <button id="mk-send"
                style="padding: .2em 1em;text-align: center;margin: auto;display: block;margin-top: 1em;">发送请求</button>`,
            );
        })
        // 添加好友按钮，事件绑定
        .on('click', '#mk-send', function () {
            $.post("/chat/make_friends", {
                "u": $("#mk-text").attr('data-_uid'),
                "t": $("#mk-text").val()
            }, (rel) => {
                if (rel == 'False')
                    new Event('已经发送过请求');
                else
                    new Event('请求发送成功');
            })
            closeP();
        })
        // 发送消息 事件
        .on('keydown', '#msg-text', function (e) {
            if (e.keyCode == 13 && (!ctrl || e.ctrlKey) && this.value) {
                send_msg(now_uid, this.value);
                this.value = '';
                $('#msg-text').trigger('input');
            }
        })
        .on('click', '#send-msg', function () {
            if (!$("#msg-text").val()) return;
            send_msg(now_uid, $("#msg-text").val());
            $("#msg-text").val('');
            $('#msg-text').trigger('input');
        })
        // 选择器
        .on('click', '.choice', function () {
            var d = $(this);
            d.toggleClass('select');
            if (choices[d.attr('id')]) choices[d.attr('id')](d.hasClass('select'));
        })


    // 接收方式按钮
    $(".right-btn").on('click', function (e) {
        $(this).toggleClass('R180');
        var titset = $(".title-settings")
            .slideToggle(500);

    });


    // chat-list
    chat_list();
});