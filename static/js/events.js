var event_root;
class Event {
    target;
    close() {
        this.target.animate({ 'left': '300px' }, 200, 'swing', function () {
            this.target.empty();
        });
        this.target.animate({
            'height': '0', 'min-height': '0',
            'padding': '0', 'margin': '0'
        }, 200, function () {
            this.target.remove();
        });
    }
    html(html) {
        return this.target.html(html);
    }
    constructor(html) {
        var tmp = document.createElement('div');
        this.target = $(tmp);
        this.target.addClass("event");
        this.target.html(html);
        this.target.prepend('<div class="close">');
        this.target.css('top', '-100000px');
        event_root.prepend(tmp);
        var height = this.target.height();
        this.target.css({ 'top': '', 'height': '0' });
        this.target.animate({
            'min-height': '60px',
            'height': height + 'px',
            'margin': '10px 0',
            'padding': '14px 5px 10px'
        }, 100);
        this.target.animate({
            'left': '0'
        }, 200, 'swing');
    }

}


// init
function init_events() {
    $('body').append('<div id="events">');
    event_root = $('#events');
    $('#events').on('click', '.event', function (e) {
        if (e.target.className == "close") {
            $(this).animate({ 'left': '300px' }, 200, 'swing', function () {
                $(this).empty();
            });
            $(this).animate({
                'height': '0', 'min-height': '0',
                'padding': '0', 'margin': '0'
            }, 200, function () {
                $(this).remove();
            });
        }
    })
}