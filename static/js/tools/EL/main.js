//alert("注意：需要获取录音权限！");

var recorder = new Recorder({
sampleRate: 44100,
bitRate: 128,
success: function(){
},
error: function(msg){
},
fix: function(msg){
}
});
$(document).ready(function() {
    $("#main .part div input").click(function(e) {
        if ($(this).val() == "录制" || $(this).val() == "重录") {
            $("#main .part div input").attr("disabled", "disabled");
            $(this).val("停止");
            $("#recording").css({'display':'block'});
            $(this).removeAttr("disabled");
            setInterval(function(){
                $("#recording em").text(recorder.duration);
            },1000);
            recorder.start();
        }else{
            $("#main .part div input").removeAttr("disabled");
            $("#recording").css({'display':'none'});
            $(this).val("重录");
            recorder.stop();
        }
    });
});

