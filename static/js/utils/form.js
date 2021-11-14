$(document).ready(function () {
    $('.input-text').each(function () {
        input = document.createElement('input');
        input.type = 'text';
        input.name = this.getAttribute('data-name');
        span = document.createElement('span');
        span.setAttribute('data-text', this.getAttribute('data-text'));
        $(this).append(span);
        $(this).append(input);
    })
    $('.input-text span').on('click', function () {
        var d = $(this);
        d.animate({
            'font-size': '16px',
            'left': '0',
            'top': '-10px',
            'height': '20px',
            'line-height': '20px',
            'padding-left': '5px',
        }, 100);
        d.siblings('input').focus()
    });
    $('.input-text input').on('blur', function () {
        if (this.value.length == 0) {
            var d = $(this).siblings('span');
            d.animate({
                'font-size': '20px',
                'top': '0px',
                'height': '100%',
                'line-height': '40px',
                'padding-left': '5%',
            }, 100);
        }
    });
})


function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return decodeURI(r[2]); return null; //返回参数值
}