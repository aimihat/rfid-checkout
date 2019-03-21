//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var theft_address = "http://192.168.0.22"; //address to query for checking if customer is leaving
var theft;
var started_process = false;

cardInput = document.getElementById("cardInput");

function scanner_callback(data) {
    var obj = JSON.parse(data);
    var total = 0;
    if (obj != null) {
        obj.forEach(function (el) {
            total = total + parseFloat(el[1]) * parseFloat(el[3]);
            $('#table tbody').append('<tr><td>' + el[0] + '</td><td>£' + el[1] + '</td><td>' + el[3] + '</td><td>£' + el[1] * el[3] + '</td></tr>')
        });
    }
    total = Math.round(total * 100) / 100;
    $('.fs-title.total').text('Total: £' + total.toString());
    $('span.payment-price').text(total.toString());
    gotonext($('.scanning-page'))
}

function next_client() {
    $.get("http://rfidcheckout.ngrok.io/close_door");
    location.reload();
}
$('.scan-button').click(function () {
    started_process = true;
    $('.scan-loader').show();
    $('.scan-button').hide();

    // THIS MAY HAVE BROKEN CODE:
    $.get("http://localhost:8000/scan", scanner_callback)
});

function check_customer_entry () {
    $.get("http://rfidcheckout.ngrok.io/check_customer", {}, function (data) {
        console.log(data);
        if (!started_process) {
            if (data=="true") 
            {
                console.log('Customer enterered!  (entry US)');
                started_process = true;
                $('.scan-loader').show();
                $('.scan-button').hide();

                // THIS MAY HAVE BROKEN CODE:
                responsiveVoice.speak('Please wait for scanning to complete.')
                $.get("http://localhost:8000/scan", scanner_callback)
            } else {
                console.log('No customer yet (entry US)');
                check_customer_entry();
            }
        }
    });
}
check_customer_entry();

$('.pay-button').click(function () {
    gotonext($('.item-confirmation-page'));
});

$('.new-user').click(function () {
    $('.cant-recognize').hide();
    $('.registration-page').show();
});

$('.submit-data').click(function () {
    console.log("Data submitted")
    addNewCustomer(blob);
});


$('.another-method').click(function () {
    $('.cant-recognize').hide();
    $('.registration-page').hide();
    $('.payment-stuff').show();
    $('.face-payment').addClass('disabled').prop('disabled', true);
});


function gotonext(current_page) {
    if (animating) return false;
    animating = true;
    current_fs = current_page;
    next_fs = current_page.next();

    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();

    current_fs.animate({opacity: 0}, {
        step: function (now, mx) {
            scale = 1 - (1 - now) * 0.2;
            left = (now * 50) + "%";
            opacity = 1 - now;
            current_fs.css({
                'transform': 'scale(' + scale + ')',
                'position': 'absolute'
            });
            next_fs.css({'left': left, 'opacity': opacity});
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });

}

$(".submit").click(function () {
    return false;
});


window.onload = function () {
    Particles.init({
        selector: '.background',
        connectParticles: true,
        // maxParticles: 0,
        color: ['#ffffff'],
    });
};


function enable_assistant_coming() {
    $('#help_box').modal();
    responsiveVoice.speak('Please wait, an assistant is coming to help you.');
    $.get("http://rfidcheckout.ngrok.io/red_light");
}

$('.debit-method').click(function () {
    // thanks
    var paid = false;
    $('.payment-stuff').hide();
    $('.thank_you').show();
    $('.thank_you .paytext').show();
    $('.thank_you .assistant-loader').show();
    $('.scan-card').show();
    responsiveVoice.speak("Please present your debit card.");
    $(window).keypress(function(e) {
        if (paid==false) {
        paid = true;     
        $('.thank_you .paytext').hide()
        $('.thank_you h1').addClass('animated fadeInDown').show();
        $('.thank_you input').show();
        $('.thank_you .assistant-loader').hide();
        $.get("http://rfidcheckout.ngrok.io/open_door");
        setTimeout(function(){location.reload()},11000);
        responsiveVoice.speak("Thank you for trying the world's fastest checkout system.");
        }
    });
    setTimeout(function() {
        if (!paid) {
          // show notification that evt has not been fired
          responsiveVoice.speak("No card payment detected.");
          $('.thank_you').hide();
          $('.thank_you .paytext').hide();
          $('.thank_you .assistant-loader').hide();
            $('.payment-stuff').show();
            $(window).off("keypress");
        }
    }, 9000);
});

$('.face-payment').click(function () {
    $('.payment-stuff').hide();
    Particles.pauseAnimation();
    $('.payment-page').addClass('nopadding');
    $('.face_detection').show();
    opencvCapture(detectWithMicrosoft);
});