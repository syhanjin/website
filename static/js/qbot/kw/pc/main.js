var table, group_id, page = 0, nid = 0, fd = {}, key = '';

function import_template(template) {
    var div = document.importNode(document.getElementById('template-' + template), true)
    return div.content || div;
}
function table_prepend(div) {
    table.children().eq(0).after(div);
}
function table_append(div) {
    table.children().last().before(div);
}
function make_kw(opened, id, kw, main_op, seco_op, degree, data) {
    var div = import_template('kw');
    // var div = document.importNode(document.getElementById('template-' + template), true)

    div.querySelector('.opened input[type="checkbox"]').checked = opened;
    div.querySelector('.id').innerText = id;
    div.querySelector('.kw').innerText = kw;
    var mo = div.querySelector('.main-op')
    if (main_op == 'ban') {
        mo.querySelector('.kick').remove();
        mo.querySelector('.ban-time').innerText = data['ban_time'];
    } else if (main_op == 'kick') {
        mo.querySelector('.ban').remove();
        mo.querySelector('.kick-warn').innerText = data['kick_warn'];
    }
    for (i in seco_op) {
        div.querySelector('.seco-op').innerHTML += '<div class="so-' + seco_op[i] + '"></div>'
    }
    div.querySelector('.degree').innerText = degree;
    div.querySelector('.opened').setAttribute('checked', 'checked');
    div.querySelector('.item').setAttribute('data-id', id);
    return div;
}

function add(opened, id, kw, main_op, seco_op, degree, data, pos) {
    div = make_kw(opened, id, kw, main_op, seco_op, degree, data)
    if (pos == 'append') table_append(div)
    else table_prepend(div);
}

function edit(id) {
    var e = import_template('kw-edit');
    if (id === undefined) {
        e.querySelector('.id').innerText = ++nid;
        e.querySelector('.item-edit').setAttribute('data-id', nid);
        table_prepend(e);
        return;
    }
    var div = document.querySelector('.item[data-id="' + id + '"]')
    // 临时储存数据
    var opened = div.querySelector('.opened input[type="checkbox"]').checked;
    var kw = div.querySelector('.kw').innerText;
    var degree = div.querySelector('.degree').innerText;
    var main_op = div.querySelector('.main-op div').className;
    var number = div.querySelector('.main-op span').innerText;
    var seco_op = [];
    var so = $(div.querySelector('.seco-op'));
    so.children().each(function (i, e) {
        seco_op.push(e.className.split('-')[1])
    });
    // 模板更改
    div.className = "item-edit";
    div.innerHTML = e.querySelector('.item-edit').innerHTML;
    // 数据迁移
    div.querySelector('.opened input[type="checkbox"]').checked = opened;
    div.querySelector('.id').innerText = id;
    div.querySelector('.kw input').value = kw;
    var mo = div.querySelector('.main-op');
    if (main_op == 'ban') {
        $(mo.querySelector('div.ban')).show();
        $(mo.querySelector('div.kick')).hide();
        mo.querySelector('.ban input[type="number"]').value = number;
        mo.querySelector('option.ban').selected = true;
    } else if (main_op == 'kick') {
        $(mo.querySelector('div.ban')).hide();
        $(mo.querySelector('div.kick')).show();
        mo.querySelector('.kick input[type="number"]').value = number;
        mo.querySelector('option.kick').selected = true;
    }
    so = div.querySelector('.seco-op')
    for (i in seco_op) {
        so.querySelector('input[type="checkbox"][value="' + seco_op[i] + '"]').checked = true;
    }
    div.querySelector('.degree input').value = degree;
}

function load(p) {
    $.get(location.pathname + '/get?group_id=' + group_id + "&p=" + p, function (rel) {
        if (rel['code'] == 0) {
            var datas = rel['data']
            for (i in datas) {
                var data = datas[i];
                nid = nid < data['id'] ? data['id'] : nid;
                add(data['opened'], data['id'], data['kw'], data['main_op'], data['seco_op'], data['degree'], {
                    'ban_time': data['ban_time'],
                    'kick_warn': data['kick_warn']
                }, 'append');
            }
            if (datas.length < 20) {
                $("#load").text('已无更多').off('click');
            }
            $("#load").attr('class', '');
        }
    }).fail(function () {
        console.log('加载错误')
    })
}

$(function () {
    table = $("#kws tbody");
    group_id = $("#group_id").text();
    key = $("#key").text();
    load(++page);
    // 绑定事件
    $("#add").on('click', function (e) {
        edit();
    })
    $("#load").on('click', function (e) {
        load(++page);
        this.className = "loading";
    })
    $(document)
        // 修改opened
        .on('change', '.item .opened', function (e) {
            var div = $(this).parents('.item');
            fd[div.attr('data-id')] = {
                'opened': e.target.checked
            }
        })
        // 确认修改条目
        .on('click', '.item-edit td .yes', function (e) {
            var div = $(this).parents('.item-edit').get(0);
            var id = parseInt(div.querySelector('.id').innerText);
            var opened = div.querySelector('.opened input[type="checkbox"]').checked;
            var kw = div.querySelector('.kw input').value.replace(' ', '');
            if (kw.length == 0) return;
            var degree = parseInt(div.querySelector('.degree input').value);
            var main_op = div.querySelector('.main-op div').className;
            var seco_op = [];
            var so = $(div.querySelector('.seco-op'));
            so.find('input[type="checkbox"]:checked').each(function (i, e) {
                seco_op.push(e.value)
            });
            fd[id] = {
                'opened': opened,
                'kw': kw,
                'degree': degree,
                'main_op': main_op,
                'seco_op': seco_op,
            }
            if (main_op == 'ban') {
                fd[id]['ban_time'] = parseInt(div.querySelector('.main-op div.ban input').value);
            } else if (main_op == 'kick') {
                fd[id]['kick_warn'] = parseInt(div.querySelector('.main-op div.kick input').value);
            }
            div.className = "item";
            div.innerHTML = make_kw(opened, id, kw, main_op, seco_op, degree, {
                'ban_time': fd[id]['ban_time'],
                'kick_warn': fd[id]['kick_warn']
            }).querySelector('.item').innerHTML;

        })
        // 删除条目
        .on('click', '.item-edit td .no', function (e) {
            var div = $(this).parents('.item-edit').get(0);
            var id = div.querySelector('.id').innerText;
            fd[id] = 'deleted';
            div.remove();
        })
        // 编辑
        .on('click', '.item td .edit', function (e) {
            edit($(this).parents('.item').attr('data-id'))
        })
        // 主操作变换事件
        .on('change', '.main-op select', function (e) {
            if (e.target.value == 'ban') {
                $(this).siblings('.ban').show();
                $(this).siblings('.kick').hide();
            } else if (e.target.value == 'kick') {
                $(this).siblings('.ban').hide();
                $(this).siblings('.kick').show();
            }
        })
    // 提交
    $("#submit").on('click', function (e) {
        $.ajax({
            type: "POST",
            url: window.location.pathname + '/update',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                'kws': fd,
                'key': key
            }),
            dataType: "json",
            success: function (rel) {
                console.log('提交成功')
                window.location.reload();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // console.log(jqXHR)
                // console.log(textStatus)
                // console.log(errorThrown)
            }
        });
    })
})