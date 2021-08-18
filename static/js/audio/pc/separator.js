$(document).ready(function () {
    var sep_interval = setInterval(function () {
        $.get('/audio/separator/status', function (rel) {
            for (i in rel) {
                $('#' + rel[i]['id'] + ' .status').attr('data-status', rel[i]['status']);
                if (rel[i]['status'] == 'finished') {
                    // console.log('#' + rel[i]['id'] + ' .vocals');
                    $('#' + rel[i]['id'] + ' .vocals')
                    .html('<a href="/audio/separator/download/' + rel[i]['id'] + '/vocals' + '" target="_blank" data-text="下载地址">')
                    $('#' + rel[i]['id'] + ' .accompaniment')
                    .html('<a href="/audio/separator/download/' + rel[i]['id'] + '/accompaniment' + '"  target="_blank" data-text="下载地址">')
                }
            }
        })
    }, 1000);
});