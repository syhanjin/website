tip = null

$(document).ready(function () {
    tip = document.getElementsByClassName('tip')[0]
    $('#user').on('blur', 'input', function () {
        tip.innerHTML = '';
        $('.submit').attr('disabled', 'disabled');
        if (this.value.length === 0) {
            tip.innerHTML = '<i class="fas fa-times"></i>' + '用户名不可为空';
            return;
        }
        $.post('/register/judgeuser', { 'user': this.value }, function (rel) {
            console.log(rel)
            if (rel == 'False') {
                tip.innerHTML = '<i class="fas fa-times"></i>' + '该用户名已存在';
            }else{
                $('.submit').removeAttr('disabled');
            }
        })
    });
    $('.submit').on('click', function(){
        key = getUrlParam('key');
        $.post('/login/qq/new', {
            'key': key,
            'user': $('#user input').val()
        }, function(rel){
            if(rel == True){

            }
        })
    })
})