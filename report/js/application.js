$(document).ready(function(){
    $.ajax({
        method: 'GET',
        url: '../report.json',
        success: function(data) {
            new PediffReport(data);
        }
    });

    $('aside .panel-heading .btn').on('click',function(e){
        e.preventDefault();

        $('aside').toggleClass('closed');
    });

    $('.logo').addClass('in');
});
