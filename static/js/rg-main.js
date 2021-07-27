var lastmail = "";
var rgjudge = {
    'user' : false,
    'pwd1' : false,
    'pwd2' : false,
    'mail' : false,
    'veri' : false
};
var judgemail = function() {
    $("#emailmsg").empty();
    var email = document.getElementById('e-mail').value;
    if (email != "") {
        var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
        isok = reg.test(email);
        if (!isok) {
            $("#emailmsg").append("邮箱错误");
            document.getElementById("e-mail").focus();
            return false;
        }
    } else {
        $("#emailmsg").append("不可为空");
        return false;
    }
    if (email != lastmail) {
        $.get('/register/emailchange', function(rel) {
            if (rel == 'False') {
                $("#emailmsg").append("数据有误");
            } else if (rel == 'True') {
                lastmail = email;
                judgeveri();
            }
        }).fail(function() {
            $("#emailmsg").append("对服务器的请求出错");
        });
    }
    return true;
}
var judgeveri = function() {
    $("#vericodewarn").empty();
    if (document.getElementById("vericode").value == '') {
        $("#vericodewarn").text("验证码错误");
        return false;
    }
    $.post('/register/judgeveri', {
        'veri' : document.getElementById("vericode").value
    }, function(rel) {
        if (rel == 'False') {
            $("#vericodewarn").text("验证码错误");
            return false;
        }
    }).fail(function() {
        $("#vericodewarn").append('获取失败');
        return false;
    });
    return true;
}
var judgeuser = function() {
    $("#usermsg").empty();
    if (document.getElementById("user").value == '') {
        $("#usermsg").text("不可为空");
        return false;
    }
    $.post('/register/judgeuser', {
        'user' : document.getElementById("user").value
    }, function(rel) {
        if (rel == 'False') {
            $("#usermsg").text("该用户名已被占用");
            return false;
        }
    }).fail(function() {
        $("#usermsg").append('获取失败');
        return false;
    });
    return true;
}
var CharMode = function(iN) {
    if (iN >= 48 && iN <= 57)
        return 1;
    if (iN >= 65 && iN <= 90)
        return 2;
    if (iN >= 97 && iN <= 122)
        return 4;
    else
        return 8;
}
var bitTotal = function(num) {
    modes = 0;
    for ( i = 0; i < 4; i++) {
        if (num & 1)
            modes++;
        num >>>= 1;
    }
    return modes;
}
var judgepwd = function() {
    $("#pwd1msg").empty();
    $(".rg-pwd-strength").empty();
    var pwd = document.getElementById("pwd1").value;
    if (pwd.length < 8) {
        $("#pwd1msg").append("密码太短");
        return false;
    }
    Modes = 0;
    for ( i = 0; i < pwd.length; i++) {
        Modes |= CharMode(pwd.charCodeAt(i));
    }
    var modes = bitTotal(Modes);
    var strength = $(".rg-pwd-strength");

    switch(modes) {
        case 1:
            strength.append('<div class="sgh1 sgh">弱');
            strength.append('<div class="_sgh2 sgh">中');
            strength.append('<div class="_sgh3 sgh">强');
            strength.append('<div class="_sgh4 sgh">极强');
            //$("#pwd1msg").append("警告：密码过于简单，易被破解！");
            break;
        case 2:
            strength.append('<div class="sgh1 sgh">弱');
            strength.append('<div class="sgh2 sgh">中');
            strength.append('<div class="_sgh3 sgh">强');
            strength.append('<div class="_sgh4 sgh">极强');
            //$("#pwd1msg").append("警告：密码过于简单，易被破解！");
            break;
        case 3:
            strength.append('<div class="sgh1 sgh">弱');
            strength.append('<div class="sgh2 sgh">中');
            strength.append('<div class="sgh3 sgh">强');
            strength.append('<div class="_sgh4 sgh">极强');
            break;
        case 4:
            strength.append('<div class="sgh1 sgh">弱');
            strength.append('<div class="sgh2 sgh">中');
            strength.append('<div class="sgh3 sgh">强');
            strength.append('<div class="sgh4 sgh">极强');
            break;
    }
    return true;
}
var judgeall = function() {
    if (rgjudge['mail'] && rgjudge['user'] && rgjudge['veri'] && rgjudge['pwd1'] && rgjudge['pwd2']) {
        $(".submit").removeAttr("disabled");
    } else {
        $(".submit").attr("disabled", "disabled");
    }
}
$(document).ready(function() {
    $("#e-mail").blur(function() {
        if (judgemail()) {
            rgjudge['mail'] = true;
        } else
            rgjudge['mail'] = false;
        judgeall();
    });
    $("#vericode").blur(function() {
        if (judgeveri()) {
            rgjudge['veri'] = true;
        } else
            rgjudge['veri'] = false;
        judgeall();
    });
    $("#user").blur(function() {
        if (judgeuser()) {
            rgjudge['user'] = true;
        } else
            rgjudge['user'] = false;
        judgeall();
    });
    $("#pwd1").blur(function() {
        if (judgepwd()) {
            rgjudge['pwd1'] = true;
        } else
            rgjudge['pwd1'] = false;
        judgeall();
    });
    $("#pwd2").blur(function() {
        $("#pwd2msg").empty();
        if (document.getElementById("pwd1").value != document.getElementById("pwd2").value) {
            $("#pwd2msg").append("两次输入不一样");
            rgjudge['pwd2'] = false;
        } else {
            rgjudge['pwd2'] = true;
        }
        judgeall();
    });
});
var getvericode = function() {
    if (judgemail()) {
        var data = {
            'mail' : document.getElementById("e-mail").value
        };
        $("#vericodewarn").empty();
        $.post('/register/getvericode', data, function(rel) {
            if (rel == 'False') {
                $("#vericodewarn").append('获取失败');
            } else if (rel == 'True') {
                var veri_btn = $("#vericode-get"), t = 60;
                veri_btn.attr("disabled", "disabled");
                var interval = setInterval(function() {
                    t--;
                    if (t == 0) {
                        veri_btn.removeAttr("disabled");
                        document.getElementById("vericode-get").value = "重新发送";
                        clearInterval(interval);
                    } else
                        document.getElementById("vericode-get").value = "重新发送(" + t + ")";
                }, 1000);
            }
        }).fail(function() {
            $("#vericodewarn").append('请求失败');
        });
    } else {
        $("#vericodewarn").empty();
        $("#vericodewarn").append("邮箱错误");
    }
}
