// 定义变量
var search_box, choices = {}, chat_main,
    msg_interval, msg_list = {}, msg_timestamp, msg_page;
// 数据获取完后运行
var afterdata = function () {
    // 同步用户数据
    if (user_data['allowStrangers'])
        $('#alws').addClass('select');
}
// 定义函数
choices['alws'] = function (status) {
    if (status)
        $.get('/chat/modify/allowStrangers?s=yes');
    else
        $.get('/chat/modify/allowStrangers?s=no');
};
choices['ar'] = function (status) {
    if (status)
        msg_interval = setInterval(get_new_msg, 1000);
    else
        clearInterval(msg_interval);
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

function get_new_msg() {

}

function get_msg(_uid) {
    $.get('/chat/all_msg/' + _uid + '?p=' + msg_page + '&t=' + (msg_timestamp / 1000), function (rel) {
        if (rel == 'False') return;
        var mcb = $(".msg-content-box div");
        for (var i = 0; i < rel.length; i++) {
            switch (rel[i]['type']) {
                case 'text':
                    /*
                    <div class="msg">
                        <div class="system-propmt"></div>
                        <div class="msg-main">
                            <img src="/static/images/icon.jpg">
                            <div class="msg-text"></div>
                        </div>
                    </div>
                    */
                    var msg_item = document.createElement('div');
                    msg_item.className = 'msg';
                    if (i + 1 == rel.length ||
                        moment(rel[i]['time']).diff(moment(rel[i + 1]['time']), 'minutes', true) > 300) {
                        var system_propmt = document.createElement('div');
                        system_propmt.className = 'system-propmt';
                        system_propmt.innerText = make_time_string(rel[i]['time']);
                        msg_item.appendChild(system_propmt);
                    }
                    var msg_main = document.createElement('div');
                    msg_main.className = 'msg-main';
                    var img = document.createElement('img');
                    img.src = "/api/userphoto/" + rel[i]['s_uid'];
                    msg_main.appendChild(img);
                    var msg_text = document.createElement('div');
                    msg_text.className = 'msg-text';
                    msg_text.innerHTML = make_msg_string(rel[i]['text']);
                    msg_main.appendChild(msg_text);
                    msg_item.appendChild(msg_main);
                    mcb.prepend(msg_item);
                    break;
                case 'mkfriends':
                    var msg_item = document.createElement('div');
                    msg_item.className = 'msg';
                    var system_propmt = document.createElement('div');
                    system_propmt.className = 'system-propmt';
                    system_propmt.innerText = make_time_string(rel[i]['time']);
                    msg_item.appendChild(system_propmt);
                    var msg_main = document.createElement('div');
                    msg_main.className = 'msg-main';
                    var img = document.createElement('img');
                    img.src = "/api/userphoto/" + rel[i]['s_uid'];
                    msg_main.appendChild(img);
                    var msg_text = document.createElement('div');
                    msg_text.className = 'msg-text mkfriends';
                    msg_text.innerHTML =
                        '对方请求添加你为好友\n'
                        + '验证信息：\n'
                        + rel[i]['text']
                        + '<span class="yes" data-_uid="'
                        + rel[i]['s_uid']
                        + '">同意</span><span class="no" data-_uid="'
                        + rel[i]['s_uid']
                        + '">拒绝</span>'
                    msg_main.appendChild(msg_text);
                    msg_item.appendChild(msg_main);
                    mcb.prepend(msg_item);
                    break;
            }

        }
    });
    msg_page += 1;
}

function msg_box(_uid, user) {
    $.get('/chat/can_chat?u=' + _uid, function (rel) {
        if (rel == 'False') {
            new Event(
                '你还不是' + (user ? user : 'TA') + '的好友，你可以选择 <span id="mkfriends" data-user="'
                + (user ? user : '')
                + '" data-_uid="'
                + _uid + '">添加好友</span>'
            )
            return;
        }
        chat_main.empty();
        /*
        <div class="chat-header">
            <a class="char-header-user"></a>
            <div>
                <span>自动刷新</span>
                <div class="choice" id="ar" title="开启后，会自动获取最新消息"></div>
            </div>
        </div>
        */
        /*
        <div class="msg-content-box">
             <div>
                 <!--
                 <div class="msg r">
                     <div class="system-propmt">08-04 16:38</div>
                     <div class="msg-main">
                         <img src="/static/images/icon.jpg">
                         <div class="msg-text"></div>
                     </div>
                 </div>
                 -->
             </div>
         </div>
         */
        /*
         <div class="send-msg-box">
             <div class="edit-textarea">
                 <textarea id="msg-text" autofocus="autofocus" maxlength="500"></textarea>
             </div>
             <footer>
                 <p class="word-count"><span>0</span> / 500</p>
                 <button id="send-msg">发送<span>Enter</span></button>
             </footer>
         </div>
        */
        //#region 头部
        var header = document.createElement('div');
        header.className = 'chat-header';
        {
            var un = document.createElement('a');
            un.href = "/user/" + _uid;
            un.innerText = user || chat_list[_uid]['user'];
            un.className = 'chat-header-user';
            header.appendChild(un);
        } {
            var div = document.createElement('div');
            div.innerHTML = '<span>自动刷新</span><div class="choice" id="ar" title="开启后，会自动获取最新消息"></div>';
            header.appendChild(div);
        }
        chat_main.append(header);
        //#endregion
        //#region 主体
        var main = document.createElement('div');
        main.className = 'msg-content-box';
        main.appendChild(document.createElement('div'));
        chat_main.append(main);
        //#endregion
        //#region 发送消息
        var smb = document.createElement('div');
        smb.className = 'send-msg-box';
        {
            var edit_box = document.createElement('div');
            edit_box.className = 'edit-textarea';
            var textarea = document.createElement('textarea');
            textarea.id = "msg-text";
            textarea.autofocus = "autofocus";
            textarea.maxLength = "500";
            edit_box.appendChild(textarea);
            smb.appendChild(edit_box);
        } {
            var footer = document.createElement('footer');
            var p = document.createElement('p');
            p.className = 'word-count';
            p.innerHTML = '<span>0</span> / 500';
            footer.appendChild(p);
            var button = document.createElement('button');
            button.id = "send-msg";
            button.innerHTML = '发送<span>Enter</span>';
            footer.appendChild(button);
            smb.appendChild(footer);
        }
        chat_main.append(smb);
        //#endregion
        msg_timestamp = new Date().getTime();
        msg_page = 1;
        get_msg(_uid);
    })
}

function chat_list() {
    $.get('/chat/list', function (rel) {
        if (rel == 'False') {

        } else {
            var cl = $('.chat-list');
            for (i in rel) {
                /*
                <div class="msg-item">
                    <div class="left photo">
                        <img src="/api/userphoto/9889573" />
                    </div>
                    <div class="right">
                        <div class="right-top">
                            <div class="name">
                                <span></span>
                            </div>
                            <div class="time"></div>
                        </div>
                        <div class="right-bottom">
                            <p class="last-msg"></p>
                            <span class="count"></span>
                        </div>
                    </div>
                </div>
                */
                msg_list[rel[i]['_uid']] = rel[i];
                var div = document.createElement('div');
                div.className = 'msg-item';
                div.setAttribute('data-_uid', rel[i]['s_uid']);
                div.setAttribute('data-user', rel[i]['s_user']);
                // 头像
                var photo = document.createElement('div');
                photo.className = 'left photo';
                var img = document.createElement('img')
                img.src = '/api/userphoto/' + rel[i]['s_uid'];
                photo.appendChild(img); // photo | img
                div.appendChild(photo); // msg-item | { photo | img }
                // 右侧
                var right = document.createElement('div');
                right.className = 'right';
                // 右上
                var r_top = document.createElement('div');
                r_top.className = 'right-top';
                // 用户名
                var name_ = document.createElement('div');
                name_.className = 'name';
                var span = document.createElement('span');
                span.innerText = rel[i]['s_user'];
                name_.appendChild(span);// name | span | s_user
                r_top.appendChild(name_);// right-top | { name | span | s_user }
                // 时间
                var time = document.createElement('div');
                time.className = 'time';
                time.innerText = make_time_string(rel[i]['time']);
                r_top.appendChild(time);// right-top | { name | span | s_user} { time }
                right.appendChild(r_top);// right | { right-top | { name | span | s_user} time }
                // 右下
                var r_bottom = document.createElement('div');
                r_bottom.className = 'right-bottom';
                // 最后一条消息
                var last_msg = document.createElement('p');
                last_msg.className = 'last-msg';
                last_msg.innerText = rel[i]['last_msg'];
                r_bottom.appendChild(last_msg)// right-bottom | last-msg
                //未读消息计数
                if (rel[i]['count'] > 0) {
                    var count = document.createElement('span');
                    count.className = 'count';
                    count.innerText = rel[i]['count'];
                    r_bottom.appendChild(count)// right-bottom | last-msg count
                }
                right.appendChild(r_bottom)
                /* right | 
                { right-top | { name | span | s_user} time }
                { right-bottom | last-msg [count] }
                */
                div.appendChild(right);
                /* msg-item | 
                { photo | img }
                { right | 
                    { right-top | 
                        { name | span | s_user}
                        time 
                    }
                    { right-bottom | 
                        last-msg 
                        [count]
                    }
                }
                */
                cl.append(div);
            }
        }
    });

}


$(document).ready(function () {
    // 获取jQuery对象
    search_box = $("#search-box"), chat_main = $('.index-main');
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
        msg_box(d.attr("data-_uid"), d.text())
    });
    $(document)
        // 绑定输入框字数限制
        .on('input', '#msg-text', function (e) {
            $('.word-count span').text(this.value.length);
        })
        // 绑定 好友操作
        .on('click', '.mkfriends .yes', function () {
            $.get('/chat/make_friends/agree?u=' + $(this).attr('data-_uid'));
        })
        .on('click', '.mkfriends .no', function () {
            $.get('/chat/make_friends/disagree?u=' + $(this).attr('data-_uid'));
        })
        .on('click', '.msg-item', function () {
            msg_box(
                $(this).attr('data-_uid'),
                $(this).attr('data-user')
            );
        })
        //绑定 添加好友
        .on('click', '#mkfriends', function () {
            var _uid = $(this).attr('data-_uid');
            openP(500, 300,
                `<p style="font-size: 18px;text-align: center;">添加好友</p>
                <span>`+ $(this).attr('data-user') + `</span>
            <textarea data-_uid=`+ _uid + ` id="mk-text" type="text" maxlength="32" autofocus="autofocus" placeholder="填写验证信息..."
                style="resize:none;width: 80%;max-width: 450px;display: block;outline: 0;border: 2px solid #000000;margin: auto;padding: .2em 1em;height: 72px;"></textarea>
            <button id="mk-send"
                style="padding: .2em 1em;text-align: center;margin: auto;display: block;margin-top: 1em;">发送请求</button>`,
                null, function () {
                    $(document).on('click', '#mk-send', function () {
                        $.post("/chat/make_friends", {
                            "u": $("#mk-text").attr('data-_uid'),
                            "t": $("#mk-text").val()
                        }, (rel) => {
                            if (rel == 'False')
                                new Event('已经发送过请求');
                        })
                    })
                });
        });

    // 接收方式按钮
    $(".right-btn").on('click', function (e) {
        $(this).toggleClass('R180');
        var titset = $(".title-settings")
            .slideToggle(500);

    });

    // 选择器
    $(document).on('click', '.choice', function () {
        var d = $(this);
        d.toggleClass('select');
        if (choices[d.attr('id')]) choices[d.attr('id')](d.hasClass('select'));
    });


    // chat-list
    chat_list();
});