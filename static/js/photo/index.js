var jcropApi, scaling = [1, 1], i, pdatas = [], files, dataURLs = [],
    bW = 1000, bH = 500;
W = 1500, H = 750;
var jChange = function () {
    var pic = jcropApi.getWidgetSize();
    var sel = jcropApi.tellScaled();
    $('.p-jc').css({
        top: (sel.y) * -1 + 'px',
        left: (sel.x) * -1 + 'px'
    });
}
var pic_jcrop = function () {

    var src = "", file = files[i];
    // 下面函数执行的效果是一样的，只是需要针对不同的浏览器执行不同的 js 函数而已
    if (window.createObjectURL != undefined) {// basic
        src = window.createObjectURL(file);
    } else if (window.URL != undefined) {// mozilla(firefox)
        src = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) {// webkit or chrome
        src = window.webkitURL.createObjectURL(file);
    }
    $("#p-Jcrop").get(0).src = src;
    $("#now").bind("mousedown", function (e) {
        //console.log(e);
        var lx = e.clientX, ly = e.clientY;
        //console.log(lx + " " + ly)
        //console.log('mousedown')
        $(document).mousemove(function (e) {
            // 获取鼠标的位移
            var dx = e.clientX - lx;
            var dy = e.clientY - ly;
            lx = e.clientX, ly = e.clientY;

            var b = jcropApi.getBounds();
            var w = jcropApi.getWidgetSize();
            var sel = jcropApi.tellSelect();

            //console.log(dx + " " + dy)

            jcropApi.setSelect([
                sel.x - dx * b[0] / w[0], sel.y - dy * b[1] / w[1],
                sel.x - dx * b[0] / w[0] + b[0] / w[0] * bW, sel.y - dy * b[1] / w[1] + b[1] / w[1] * bH
            ]);
            jChange();

        })
        // 鼠标抬起
        $(document).mouseup(function (e) {
            $(document).off('mousemove');
            $(document).off('mouseup');
        })
    })
    document.getElementById('p-Jcrop').onload = function () {
        jcropApi = $.Jcrop('#p-Jcrop', {
            allowSelect: false,
            allowMove: false,
            allowResize: false,
            aspectRatio: bW / bH,
            sideHandles: false,
            minSize: [bW, bH],
            //onChange : jChange,
            addClass: 'p-jc'
        })
        $("#now *").unbind("mousedown")
        jChange();
        jcropApi.setSelect([300, 0, 120, 180]);
        $("#popup").bind("mousewheel DOMMouseScroll", function (e) {
            e.preventDefault();
            e = e || window.event;
            var d = e.originalEvent.wheelDelta || -e.originalEvent.detail
            //console.log(d);
            scaling = 1 + 0.0001 * d;
            //console.log(scaling[0] + ' ' + scaling[1]);
            var pho = jcropApi.getWidgetSize();
            var sel = jcropApi.tellSelect();
            //console.log(sel);
            var hig = pho[1] * scaling;
            if (hig * bW / bH < bW || hig < bH){
                hig = bH;
            }
            jcropApi.destroy();
            var s2 = jcropApi.getScaleFactor();
            jcropApi = $.Jcrop('#p-Jcrop', {
                allowSelect: false,
                allowMove: false,
                allowResize: false,
                aspectRatio: bW / bH,
                sideHandles: false,
                boxHeight: hig,
                minSize: [s2[0] * bW * scaling, s2[1] * bH * scaling],
                //onChange : jChange,
                addClass: 'p-jc'
            })
            $("#now *").unbind("mousedown")
            var b = jcropApi.getBounds();
            var w = jcropApi.getWidgetSize();
            jcropApi.setOptions({
                minSize: [b[0] / w[0] * bW, b[1] / w[1] * bH]
            })
            jcropApi.setSelect([sel.x, sel.y, sel.x + b[0] / w[0] * bW, sel.y + b[1] / w[1] * bH]);
            jChange();
            //console.log('boxWidth:  ' + pho[0] * scaling[0] + ' boxHeight: ' + pho[1] * scaling[1])

        });
    }
}
var pic_next = function () {
    var sel = jcropApi.tellSelect();
    var b = jcropApi.getBounds();
    var w = jcropApi.getWidgetSize();
    pdatas[i] = [sel.x, sel.y, sel.x + b[0] / w[0] * bW, sel.y + b[1] / w[1] * bH]
    jcropApi.destroy();
    i += 1;
    if (i + 1 == files.length) {
        $("#popup .p-btn.r").attr('data-text', '完成').attr('onclick', 'closeP("yes")');
    }
    pic_jcrop();
}

$(document).ready(function () {

    $("#pfile").change(function (e) {
        files = e.currentTarget.files;
        P.open(1000, 700, '<div id="now"><img id="p-Jcrop"></div>', function (rel) {
            if (rel == 'yes') {
                var sel = jcropApi.tellSelect();
                var b = jcropApi.getBounds();
                var w = jcropApi.getWidgetSize();
                pdatas[i] = [sel.x, sel.y, sel.x + b[0] / w[0] * bW, sel.y + b[1] / w[1] * bH]
                for (var f = 0; f < files.length; f++) {
                    var src = '';
                    // 下面函数执行的效果是一样的，只是需要针对不同的浏览器执行不同的 js 函数而已
                    if (window.createObjectURL != undefined) {// basic
                        src = window.createObjectURL(files[f]);
                    } else if (window.URL != undefined) {// mozilla(firefox)
                        src = window.URL.createObjectURL(files[f]);
                    } else if (window.webkitURL != undefined) {// webkit or chrome
                        src = window.webkitURL.createObjectURL(files[f]);
                    }
                    var img = new Image();
                    img.src = src;
                    img.f = f;
                    img.onload = function (e) {
                        var f = e.target.f;
                        var canvas = document.createElement('canvas')
                        canvas.width = W;
                        canvas.height = H;
                        var ctx = canvas.getContext('2d')
                        ctx.drawImage(
                            e.target,
                            pdatas[f][0], pdatas[f][1],
                            pdatas[f][2] - pdatas[f][0], pdatas[f][3] - pdatas[f][1],
                            0, 0, W, H
                        );
                        downLoad(canvas.toDataURL('image/jpeg'));
                    }
                }
            }
        }, function () {
            $("#popup").append('<div class="p-btn l" onclick="closeP()" data-text="取消"></div>');
            $("#popup").append('<div class="p-btn r" onclick="pic_next()" data-text="下一张"></div>');
            i = 0;
            if (1 == files.length) {
                $("#popup .p-btn.r").attr('data-text', '完成').attr('onclick', 'closeP("yes")');
            }
            pic_jcrop();

        }, { 'btn': 'none' });
    });

});
function downLoad(url) {
    var oA = document.createElement("a");
    oA.download = '';
    // 设置下载的文件名，默认是'下载'
    oA.href = url;
    oA.download = (new Date().getTime()) + '' + (parseInt(Math.random() * 899 + 100)) + '.jpg';
    document.body.appendChild(oA);
    oA.click();
    oA.remove();
    // 下载之后把创建的元素删除
}