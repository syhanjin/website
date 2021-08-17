$(function(){
    var sep_interval = setInterval(function () {
        $.get('/audio/separator/status', function (rel) {
            for (i in rel) {
                $('#' + rel[i]['id'] + '-1 .status').attr('data-status', rel[i]['status']);
                if (rel[i]['status'] == 'finished') {
                    // console.log('#' + rel[i]['id'] + ' .vocals');
                    $('#' + rel[i]['id'] + '-2 .vocals')
                    .html('<a href="/audio/separator/download/' + rel[i]['id'] + '/vocals' + '" target="_blank" data-text="下载">')
                    $('#' + rel[i]['id'] + '-2 .accompaniment')
                    .html('<a href="/audio/separator/download/' + rel[i]['id'] + '/accompaniment' + '" target="_blank"  data-text="下载">')
                }
            }
        })
    }, 1000);
})