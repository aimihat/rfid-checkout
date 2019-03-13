//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var theft_address = "http://192.168.0.22"; //address to query for checking if customer is leaving
var theft;
var ngrok = "6828954a";
var started_process = false;

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

$('.scan-button').click(function () {
    started_process = true;
    // Particles.pauseAnimation();
    $('.scan-loader').show();
    $('.scan-button').hide();

    scanner_callback('null');
    // THIS MAY HAVE BROKEN CODE:
    //$.get("http://localhost:8000/scan", scanner_callback)
    // setTimeout(function(){Particles.resumeAnimation();},1000);
});

function check_customer_entry () {
    $.get("http://"+ngrok+".ngrok.io/check_customer", {}, function (data) {
        if (!started_process) {
            if (data) 
            {
                console.log('Customer enterered!  (entry US)');
                started_process = true;
                // Particles.pauseAnimation();
                $('.scan-loader').show();
                $('.scan-button').hide();

                scanner_callback('null');
                // THIS MAY HAVE BROKEN CODE:
                //$.get("http://localhost:8000/scan", scanner_callback)
                // setTimeout(function(){Particles.resumeAnimation();},1000);
            } else {
                console.log('No customer yet (entry US)');
                check_customer_entry();
            }
        }
    });
}
check_customer_entry();

$('.pay-button').click(function () {
    // Particles.pauseAnimation();
    gotonext($('.item-confirmation-page'));
    // setTimeout(function(){Particles.resumeAnimation();},1000);
});

$('.new-user').click(function () {
    // Particles.pauseAnimation();
    $('.cant-recognize').hide();
    $('.registration-page').show();
    // setTimeout(function(){Particles.resumeAnimation();},1000);
});

$('.submit-data').click(function () {
    // Particles.pauseAnimation();
    console.log("Data submitted")
    addNewCustomer(blob);
    // setTimeout(function(){Particles.resumeAnimation();},1000);
});


$('.another-method').click(function () {
    // Particles.pauseAnimation();
    $('.cant-recognize').hide();
    $('.registration-page').hide();
    $('.payment-stuff').show();
    $('.face-payment').addClass('disabled').prop('disabled', true);
    // setTimeout(function(){Particles.resumeAnimation();},1000);
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


setInterval(function () {
    $("#warning_triangle").fadeIn(750).fadeOut(750).fadeIn(750).fadeOut(750).fadeIn(750)
}, 3000);
setInterval(check_theft(), 1000);


function check_theft() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            //document.getElementById("demo").innerHTML = xhttp.responseText;
            theft = xhttp.responseText.trim();
            //return xhttp.responseText;
        }
    };
    xhttp.open("GET", theft_address, true);
    xhttp.send();
    if (theft == "customer_leaving") {
        $("#warning_box").modal()
    }
}

// function enable_assistant_coming() {
//     var xhttp = new XMLHttpRequest();
//     $("#help_box").modal();
//     xhttp.open("GET", assistant_address, true);
//     xhttp.send();
// }

$('.debit-method').click(function () {
    // thanks
    $('.payment-stuff').hide();
    $('.thank_you').show();
    setTimeout(function () {
        $('.thank_you h1').addClass('animated fadeInDown').show();
        $('.thank_you input').show();
        $('.thank_you .assistant-loader').hide();
        $.get("http://"+ngrok+".ngrok.io/open_door", {}, function () {
        });
        responsiveVoice.speak("Thank you for trying the world's fastest checkout system.")
    }, 2500)
});

$('.face-payment').click(function () {
    $('.payment-stuff').hide();
    Particles.pauseAnimation();
    $('.payment-page').addClass('nopadding');
    $('.face_detection').show();
    opencvCapture(detectWithMicrosoft);
});