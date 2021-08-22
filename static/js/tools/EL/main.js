//alert("注意：需要获取录音权限！");

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
                $(this).nextAll('audio').get(0).src = URL.createObjectURL(blob);
            });

        }
    });
    $('#upload').on('click', function () {

        $.ajax({
            url: '/tools/EL/upload',
            type: 'post',
            contentType:false,
            processData:false,
            data: fd,
            success: function (rel) {
                if (rel == 'False') {
                    new Event('数据不全')
                } else {
                    window.location.href = "/tools/EL/download/" + rel;
                }
            }
        })
    })
});

