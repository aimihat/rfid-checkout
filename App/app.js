
//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var theft_address = "http://192.168.0.22"; //address to query for checking if customer is leaving
var theft;

$('.scan-button').click(function(){
	$('.scan-loader').show()
	$('.scan-button').hide()
	var total;
	// gotonext($('.scanning-page'))
	$.get("http://localhost:8000/scan",function(data){
		var obj = JSON.parse(data);
		// Todo: qanity
		obj.forEach(function(el) {
			total = total + parseFloat(el[1]);
			$('#table tbody').append('<tr><td>'+el[0]+'</td><td>£'+el[1]+'</td><td>1</td><td>£'+el[1]+'</td></tr>')
		});
		$('.fs-title.total').text('Total: £'+total.toString());
		gotonext($('.scanning-page'))
	})
})
$('.pay-button').click(function(){
	gotonext($('.item-confirmation-page'))
})
function gotonext(current_page){
	if(animating) return false;
	animating = true;
	current_fs = current_page;
	next_fs = current_page.next();

	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

	//show the next fieldset
	next_fs.show();

	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			scale = 1 - (1 - now) * 0.2;
			left = (now * 50)+"%";
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		},
		duration: 800,
		complete: function(){
			current_fs.hide();
			animating = false;
		},
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});

}
$(".submit").click(function(){
	return false;
})




window.onload = function() {
  Particles.init({
  	selector: '.background',
  	connectParticles: true,
  	// maxParticles: 0,
  	color: ['#ffffff'],
  });
};


setInterval(function(){$("#warning_triangle").fadeIn(750).fadeOut(750).fadeIn(750).fadeOut(750).fadeIn(750)}, 3000);
setInterval(check_theft(), 1000);



function check_theft() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           //document.getElementById("demo").innerHTML = xhttp.responseText;
           theft = xhttp.responseText.trim();
           //return xhttp.responseText;
        }
    };
	xhttp.open("GET", theft_address, true);
    xhttp.send();
	if (theft == "customer_leaving"){
		$("#warning_box").modal()
	}
}

function enable_assistant_coming() {
	var xhttp = new XMLHttpRequest();
	$("#help_box").modal();
	xhttp.open("GET", assistant_address, true);
    xhttp.send();
}

$('.debit-method').click(function(){
	// loader

	// thanks
	$('.payment-stuff').hide();
	$('.thank_you').show();
	setTimeout(function(){
		$('.thank_you h1').addClass('animated fadeInDown').show();
		$('.thank_you input').show();
		$('.thank_you .assistant-loader').hide();
		responsiveVoice.speak("Thank you for using Docsoc's favourite checkout system.")
	},1000)
	
})

// var tts = new GoogleTTS('en');
// responsiveVoice.speak("Shake that ass for me");
