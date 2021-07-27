if (window.location.href.indexOf('#chat-box') == -1) window.location.href += '#chat-box';

$(document).ready(function () {
    chat_body = $('#chat-body');
    window.mesinterval = setInterval(messages, 1500);
    $('#send-textarea').bind('paste', function (e) {
        e.preventDefault();
        var clipboardData = e.originalEvent.clipboardData
        var items = clipboardData.items;
        var d = $(this);
        for (i = 0; i < items.length; i++) {
            if (items[i].kind == 'string' && items[i].type == 'text/plain') {
                items[i].getAsString(function (s) {
                    var oDiv = document.createElement('div');
                    oDiv.innerHTML = s;
                    s = oDiv.innerText;
                    // alert(s);
                    s = s.replace(/ /g, '&nbsp;').replace(/\\/g, "\\").replace(/\n/g, '<br/>');
                    d.append(s);
                })
            }
            if (items[i].kind == 'file' && items[i].type.indexOf('image') !== -1) {
                var src = "", file = items[i].getAsFile();
                if (!file) continue;
                // 下面函数执行的效果是一样的，只是需要针对不同的浏览器执行不同的 js 函数而已
                if (window.createObjectURL != undefined) {// basic
                    src = window.createObjectURL(file);
                } else if (window.URL != undefined) {// mozilla(firefox)
                    src = window.URL.createObjectURL(file);
                } else if (window.webkitURL != undefined) {// webkit or chrome
                    src = window.webkitURL.createObjectURL(file);
                }
                var img = document.createElement('img');
                img.src = src;
                document.getElementById('send-textarea').appendChild(img);
            }
        }
        return false;
    });
    $('#send').bind('click', function (e) {
        $.post('/chat/send',{'msg':$("#send-textarea").text()},function(rel){

        });
        $("#send-textarea").empty();
        return;
        var val = $('#send-textarea').html();
        var re = /<img [!<>\n]*src=["'].*["'][!<>\n]*>/g;
        var imgs = val.match(re);
        var texts = val.split(re);
        for (i in imgs) {
            var img = new Image();
            img.src = imgs[i].split(/src=['"]/)[1].split(/['"]/)[0];
            $('#upload').append('<div class="prograss" data-name="img">');
            img.pro = $('#upload').children("div.prograss").last();
            img.pro.append('<div class="before">')
            img.pro.append('<span>')
            img.onload = function (ev) {
				var formData = new FormData();
				formData.append("img", ev.target);
                $.ajax({
                    url: '/chat/uploadimg',
                    type: "post",
                    data: formData,
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    xhr: function () {
                        var myXhr = $.ajaxSettings.xhr()
                        if (myXhr.upload) {
                            myXhr.upload.addEventListener('progress', function (e) {
                                if (e.lengthComputable) {
                                    var max = e.total
                                    var current = e.loaded
                                    var Percentage = (current * 100) / max
                                    ev.target.pro.children('div.before').css('width', Percentage + '%');
                                    ev.target.pro.children('span').text((current / (1024 * 1024)).toFixed(2) + ' / ' + (max / (1024 * 1024)).toFixed(2) + ' MB');
                                }
                            }, false)
                        }
                        return myXhr
                    },
                    complete: function (response) {
                        ev.target.pro.remove();
                    }
                });
            }
        }
    });
});
var chat_body, locate = true;

function messages() {
    $.get('/chat/getmessages', function (data) {
        if (data != 'False') {
            // if(data.length==0)return;
            if (chat_body.get(0).scrollHeight - chat_body.get(0).scrollTop - chat_body.get(0).clientHeight <= 10) locate = true;
            for (i in data) {
                if (data[i]['sender'] == 'system') {
                    chat_body.append('<div class="system-message">');
                    chat_body.children('div.system-message').last().get(0).innerHTML =
                        data[i]['time'] + ' ' + data[i]['text'];
                    continue
                }
                acl = (data[i]['sender'] == user) ? 'r' : 'l'
                chat_body.append('<div class="message ' + acl + '">');
                chat_body.children('div.message').last().get(0).innerHTML =
                    '</div><div class="mes-text">' +
                    data[i]['text'] + '</div><div class="sender"><img src="' +
                    data[i]['photo'] +
                    '" /><span class="name">' +
                    data[i]['sender'] +
                    '</span><span class="time">' +
                    data[i]['time'] +
                    '</span>'
            }
        }
        if (locate) {
            $('#chat-body').animate({
                scrollTop: $('#chat-body').get(0).scrollHeight + 'px'
            }, 400);
            locate = false;
        }
    });
}
