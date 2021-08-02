var network_error = function () {
    openP(200, 100, '<p style="font-size:36px; text-align: center;">网络错误</p><div class="p-confirm" onclick="closeP()"></div>', function () {
        window.location = '/login';
    });
}
var not_logged_in = function () {
    openP(200, 100, '<p style="font-size:36px; text-align: center;">请先登录</p><div class="p-confirm" onclick="closeP()"></div>', function () {
        window.location = '/login';
    });
}
$(document).ready(function () {

    $("#clipArea").photoClip({
        width: 200,
        height: 200,
        file: "#file",
        ok: "#clipBtn",
        loadStart: function () {
            console.log("照片读取中");
        },
        loadComplete: function () {
            console.log("照片读取完成");
        },
        clipFinish: function (dataURL) {
            $.post('/user/settings/uplphoto', {
                'dataURL': dataURL
            }, function (rel) {
                if (rel == 'False') {
                    not_logged_in();
                } else {
                    location.reload();
                }
            }).fail(network_error);
            $(".htmleaf-container").hide();
        }
    });
    $('#cphoto button').on('click', function () { $(".htmleaf-container").show() });
    $('.uploader1 .cancel').on('click', function () { $(".htmleaf-container").hide() });
    
	$("#info-ops-umodify span").click(function () {
		$("#info-ops-umodify div #text").attr('placeholder', '');
		$("#info-ops-cuser").hide();
		$("#info-ops-umodify span").hide();
		$("#info-ops-umodify div").show();
		$("#info-ops-umodify div #text").focus();
	});
	$("#info-ops-umodify div #yes").click(function () {
		$("#info-ops-umodify div #text").attr('placeholder', '');
		newuser = $("#info-ops-umodify div #text").val();
		if (newuser == "") {
			$("#info-ops-umodify div #text").empty();
			$("#info-ops-umodify div #text").attr('placeholder', '不可为空');
            return ;
		}
		$.post('/user/settings/setuser', {
			'user': newuser
		}, function (rel) {
			if (rel == 'True') {
				location.reload();
			} else if (rel == 'Existed') {
				$("#info-ops-umodify div #mwarn").text('名字已存在');
				return;
			} else if (rel == 'Not Logged In') {
				not_logged_in();
			} else {
				$("#info-ops-umodify div #mwarn").text('无法修改');
				return;
			}
		});
	});
	$("#info-ops-umodify div #no").click(function () {
		$("#info-ops-cuser").show();
		$("#info-ops-umodify span").show();
		$("#info-ops-umodify div").hide();
	});
    $.get('/api/getuserdata', function (data) {
        if (data == 'False') {
            not_logged_in();
        } else {
            // alert(str(data));
            document.getElementById('info-ops-cphoto').src = data['photo'];
            $("#info-ops-cuser").text(data['user']);
            if (data['umodify'] == 0) {
                $("#info-ops-umodify #warn").text("每365天只能修改一次哦");
            } else {
                $("#info-ops-umodify #warn").text("还要" + data['umodify'] + "天才可以修改");
                $("#info-ops-umodify span").css('pointer-events', 'none');
                $("#info-ops-umodify span").click(function () {
                });
            }
            var tits = $('#info-user-titles');
            $("#info-user-titles .lvl-box").prepend('<span class="lvl lv' + data['lvl'] + '">');
            $("#info-user-titles .lvl-box").children('.lvl').last().append('Lv.' + data['lvl']);
            $.get('/api/getlvldata/' + data['lvl'], function (rel) {
                if (rel == 'False') {
                    $('#exp').remove();
                } else {
                    $('#exp em').eq(0).text(data['exp']);
                    $('#exp em').eq(1).text(rel['exp']);
                    $('#exp #bar').css('width', data['exp'] / rel['exp'] * 100 + '%');
                }
            }).fail(network_error);

            if (data['admin'] && data['admin'] <= 4) {
                tits.append('<span class="admin ad' + data['admin'] + '">');
                tits.children('.admin').last().append('管理员');
            }
            for (var i = 0; i < data['titles'].length; i++) {
                var tmp = data['titles'][i];
                tits.append('<span class="' + tmp['class'] + '">');
                tits.children('.' + tmp['class']).last().append(tmp['text']);
            }
        }
    }).fail(network_error);

	$("#usafe > span").click(function () {
		var index = $("#usafe > *").index(this);
		$("#usafe > *").eq(index + 1).find('div input').val('');
		$("#usafe > *").eq(index + 1).toggle();
	});
	$("#usafe .pwd #pmodify").click(function () {
		var oldp = $("#old").val();
		var newp = $("#new").val();
		var newp2 = $("#new2").val();
		if (newp.length < 8) {
			openP(200, 100, '<p style="font-size: 24px;text-align:center">密码太短</p><div class="p-confirm" onclick="closeP()"></div>');
			return false;
		}
		if (newp != newp2) {
			openP(200, 100, '<p style="font-size: 24px;text-align:center">两次输入不同</p><div class="p-confirm" onclick="closeP()"></div>')
			return false;
		}
		$.post('/user/settings/pwdmodify', {
			'old': oldp,
			'new': newp
		}, function (rel) {
			if (rel == 'Not Logged In') {
				not_logged_in();
			} else if (rel == 'pwd wrong') {
				openP(200, 100, '<p style="font-size: 24px;text-align:center">原密码错误</p><div class="p-confirm" onclick="closeP()"></div>', function () {
					$("#usafe .pwd").find('div input').val('');
				})
				return false;
			} else if (rel == 'True') {
				openP(200, 100, '<p style="font-size: 24px;text-align:center">修改成功</p><div class="p-confirm" onclick="closeP()"></div>', function () {
					$("#usafe .pwd").hide();
				})
			} else {
				openP(200, 100, '<p style="font-size: 24px;text-align:center">未知错误</p><div class="p-confirm" onclick="closeP()"></div>');
			}
		}).fail(network_error);
	});
	$("#usafe .pwd #pcancel").click(function () {
		$("#usafe .pwd").find('div input').val('');
		$("#usafe .pwd").toggle();
	})
});