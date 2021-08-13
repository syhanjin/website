// 定义变量
var search_box, choices = {}, chat_main;
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

function make_time_string(tstring) {
    moment.locale('zh-cn');
    var time = moment(tstring);
    // var today = moment().startOf('day');
    // if
    // var yesterday = today.clone().subtract(1,'days');
    return time.calendar();
}

function msg_box(_uid) {
    chat_main.empty();
    
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
                var div = document.createElement('div');
                div.className = 'msg-item';
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
                name_.className = 'user';
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
    search_box = $("#search-box"),chat_main=$('.index-main');
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