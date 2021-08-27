//alert("注意：需要获取录音权限！");

function create_url(blob) {
    var src;
    if (window.createObjectURL != undefined) {// basic
        src = window.createObjectURL(blob);
    } else if (window.URL != undefined) {// mozilla(firefox)
        src = window.URL.createObjectURL(blob);
    } else if (window.webkitURL != undefined) {// webkit or chrome
        src = window.webkitURL.createObjectURL(blob);
    }
    return src;
}
var recorder = new Recorder({
    sampleRate: 44100,
    bitRate: 128,
    success: function () {
    },
    error: function (msg) {
    },
    fix: function (msg) {
    }
});
var fd = new FormData();
$(document).ready(function () {
    $("#main .part input").click(function (e) {
        if ($(this).val() == "录制" || $(this).val() == "重录") {
            $("#main .part input").attr("disabled", "disabled");
            $(this).val("停止");
            $("#recording").css({ 'display': 'block' });
            $(this).removeAttr("disabled");
            recorder.time = 0;
            $("#recording em").text(0);
            recorder.interval = setInterval(function () {
                recorder.time++;
                console.log(recorder.time);
                $("#recording em").eq(0).text(parseInt(recorder.time / 60));
                $("#recording em").eq(1).text(recorder.time % 60);
            }, 1000);
            recorder.start();
        } else {
            $("#main .part input").removeAttr("disabled");
            $("#recording").css({ 'display': 'none' });
            $(this).val("重录");
            clearInterval(recorder.interval);
            recorder.stop()
            recorder.name = $(this).attr('name')
            recorder.getBlob((blob) => {
                fd.set(recorder.name, blob)
                $(this).nextAll('audio').get(0).src = create_url(blob);
            });

        }
    });
    $('#upload').on('click', function () {
        $(this).attr('disabled', 'disabled').val('上传中...');
        $.ajax({
            url: '/tools/EL/upload',
            type: 'post',
            contentType: false,
            processData: false,
            data: fd,
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr()
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', function (e) {
                        if (e.lengthComputable) {
                            var max = e.total
                            var current = e.loaded
                            var Percentage = (current * 100) / max
                            $('#upload-pro').text(Percentage + '%');
                            if (Percentage == 100) {
                                $('#upload-pro').empty();
                                $('#upload').val('后台处理中...');
                            }
                            // $("#popup div #before").css('width', Percentage + '%');
                            // $("#popup div span").text((current / (1024 * 1024)).toFixed(2) + ' / ' + (max / (1024 * 1024)).toFixed(2) + ' MB');
                        }
                    }, false)
                }
                return myXhr
            },
            success: function (rel) {
                if (rel == 'False') {
                    new Event('数据不全');
                    $('#upload').removeAttr('disabled').val('提交生成');
                } else {
                    var a = document.createElement('a')
                    a.href = "/tools/EL/download/" + rel;
                    a.download = rel;
                    document.body.appendChild(a);
                    a.click();
                    location.reload()
                }
            }
        })
    })
});

