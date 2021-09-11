var network_error = function () {
	P.open(200, 100, '<p style="font-size:36px; text-align: center;">网络错误</p>', function () {
		window.location = '/login';
	});
}
var not_logged_in = function () {
	P.open(200, 100, '<p style="font-size:36px; text-align: center;">请先登录</p>', function () {
		window.location = '/login';
	});
}
$(document).ready(function () {
	$.get('/api/getuserdata', function (data) {
		if (data['code'] != 0) {
			not_logged_in();
		} else {
			data = data['data']
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
			tits.append('<span class="lvl lv' + data['lvl'] + '">');
			tits.children('.lvl').last().append('Lv.' + data['lvl']);
			$.get('/api/getlvldata/' + data['lvl'], function (rel) {
				if (rel['code'] != 0) {
					$('#exp').remove();
				} else {
					rel = rel['data']
					$('#exp em').eq(0).text(data['exp']);
					$('#exp em').eq(1).text(rel['exp']);
					$('#exp #bar').css('width', data['exp'] / rel['exp'] * 100 + '%');
				}
			}).fail(network_error);

			$('#info-user-titles .lvl').hover(function () {
				$('#exp').show();
			}, function () {
				$('#exp').hide();
			});
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
	var jcropApi;
	var src = null;
	$("#info-ops-uplphoto").change(function () {
		var e = $("#info-ops-uplphoto");

		var file = document.getElementById('info-ops-uplphoto').files[0];
		// 下面函数执行的效果是一样的，只是需要针对不同的浏览器执行不同的 js 函数而已
		if (window.createObjectURL != undefined) {// basic
			src = window.createObjectURL(file);
		} else if (window.URL != undefined) {// mozilla(firefox)
			src = window.URL.createObjectURL(file);
		} else if (window.webkitURL != undefined) {// webkit or chrome
			src = window.webkitURL.createObjectURL(file);
		}
		P.open(1000, 700, '<p style="font-size:24px; text-align: center;">是否修改头像？<div style="overflow: auto;position: relative;margin: 0;margin-left:40px;width: 820px;height: 600px;align-self: flex-start" ><img id="p-Jcrop" src="' + src + '" style=" max-width:800px;margin:15px auto;position:relative;" /></div><div id="pre" style="border-radius: 50%;overflow:hidden;width: 100px;height: 100px;position:absolute;right: 40px;top: 100px;border: 1px solid purple;"><img id="pre-p" src="' + src + '" style="" ></div></p><p style="position: absolute;right: 10px;width:120px;top: 350px;text-align: center;">图片将会被压缩至 250 × 250</p>',
		function (rel) {
			if (rel == 'yes') {
				var img = new Image();
				img.src = src;
				img.onload = function (e) {
					var img = e.target;
					var canvas = document.createElement('canvas')
					canvas.width = 250;
					canvas.height = 250
					var ctx = canvas.getContext('2d')
					var c = jcropApi.tellSelect();
					var bounds = jcropApi.getBounds();
					boundx = bounds[0];
					boundy = bounds[1];
					var rx = 100 / c.w;
					var ry = 100 / c.h;
					var rw = img.width;
					var rh = img.height;
					console.log(jcropApi.tellScaled());
					ctx.drawImage(img, c.x / boundx * rw, c.y / boundy * rh, c.w / boundx * rw, c.h / boundy * rh, 0, 0, 250, 250);
					var dataURL = canvas.toDataURL('image/jpeg');
					$.post('/user/settings/uplphoto', {
						'dataURL': dataURL
					}, function (rel) {
						if (rel['code'] != 0) {
							not_logged_in();
						} else {
							location.reload();
						}
					}).fail(network_error);
				}
			} else {
				e.val('');
			}
		}, function () {
			$('#p-Jcrop').Jcrop({
				allowSelect: false,
				allowMove: true,
				allowResize: true,
				aspectRatio: 1,
				sideHandles: false,
				minSize: [50, 50],
				onRelease: function () {
					$("#p-yes").attr("onclick", "");
					$("#p-yes").removeClass('p-choose');
					$("#p-yes").addClass('p-choose-grey');
				},
				onChange: function (c) {
					var bounds = this.getBounds();
					boundx = bounds[0];
					boundy = bounds[1];
					var rx = 100 / c.w;
					var ry = 100 / c.h;
					$("#pre-p").css({
						maxWidth: Math.round(rx * boundx) + 'px',
						maxHeight: Math.round(ry * boundy) + 'px',
						width: Math.round(rx * boundx) + 'px',
						height: Math.round(ry * boundy) + 'px',
						marginLeft: '-' + Math.round(rx * c.x) + 'px',
						marginTop: '-' + Math.round(ry * c.y) + 'px'
					});
				},
				onSelect: function () {
					$("#p-yes").attr("onclick", "closeP('yes')");
					$("#p-yes").removeClass('p-choose-grey');
					$("#p-yes").addClass('p-choose');
					console.log(jcropApi.tellScaled());
				},
				baseClass: 'jcrop'
			}, function () {
				jcropApi = this;
				jcropApi.setSelect([0, 0, 100, 100]);
			})
		}, { btn: 'yes-no', up_offset: 0 });
	});
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
			return;
		}
		$.post('/user/settings/setuser', {
			'user': newuser
		}, function (rel) {
			if (rel['code'] == 0) {
				location.reload();
			} else if (rel['code'] == 2) {
				$("#info-ops-umodify div #mwarn").text('名字已存在');
				return;
			} else if (rel['code'] == 3) {
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
			P.open(200, 100, '<p style="font-size: 24px;text-align:center">密码太短</p>');
			return false;
		}
		if (newp != newp2) {
			P.open(200, 100, '<p style="font-size: 24px;text-align:center">两次输入不同</p>')
			return false;
		}
		$.post('/user/settings/pwdmodify', {
			'old': oldp,
			'new': newp
		}, function (rel) {
			if(rel['code'] == 3) {
				not_logged_in();
			} else if (rel['code'] == 1) {
				P.open(200, 100, '<p style="font-size: 24px;text-align:center">原密码错误</p>', function () {
					$("#usafe .pwd").find('div input').val('');
				})
				return false;
			} else if (rel['code'] == 0) {
				P.open(200, 100, '<p style="font-size: 24px;text-align:center">修改成功</p>', function () {
					$("#usafe .pwd").hide();
				})
			} else {
				P.open(200, 100, '<p style="font-size: 24px;text-align:center">未知错误</p>');
			}
		}).fail(network_error);
	});
	$("#usafe .pwd #pcancel").click(function () {
		$("#usafe .pwd").find('div input').val('');
		$("#usafe .pwd").toggle();
	})
});
