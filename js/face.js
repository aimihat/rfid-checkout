var utils = new Utils('errorMessage');
let userInstruction = document.getElementById('userInstruction');

let nameField = document.getElementById('nameField');
let surnameField = document.getElementById('surnameField');
let emailField = document.getElementById('emailField');

var streaming = false;
var videoInput = document.getElementById('videoInput');
var circle = document.getElementById('circle');

const subscriptionKey = "9162906ad2fb44f99d886e995f113f3b";
let indexMicrosoftId = 7;

var customerListObject;
var cv_ready = false;
var blob;
createCustomerList();
toggleVideo();

var xml_workaround = 'frontal_face.xml';
let data = new Uint8Array(frontal_face_xml); //string in js file, to avoid local google chrome file opening protections
cv.FS_createDataFile('/', xml_workaround, frontal_face_xml, true, false, false);
cv['onRuntimeInitialized'] = () => {cv_ready = true;};

function toggleVideo() {
    if (!streaming) {
        utils.clearError();
        utils.startCamera('vga', onVideoStarted, 'videoInput');
    } else {
        utils.stopCamera();
        onVideoStopped();
    }
}

function onVideoStarted() {
    streaming = true;
}

function onVideoStopped() {
    streaming = false;
}


nameField.addEventListener('input', function(evt){
    enableDisable();
});

surnameField.addEventListener('input', function(evt){
    enableDisable();
});

emailField.addEventListener('input', function(evt){
    enableDisable();
});

function enableDisable(){
if (nameField.value.length != 0){
    if (surnameField.value.length != 0){
        if(emailField.value.length != 0){
            $('.submit-data').removeClass('disabled').prop('disabled', false);
        }
        else{

            $('.submit-data').addClass('disabled').prop('disabled', true);

        }
    }
    else{
        $('.submit-data').addClass('disabled').prop('disabled', true);
    }
}
else{
    $('.submit-data').addClass('disabled').prop('disabled', true);

}
}

function opencvCapture(callBack) {
    $('.face-loader').show();
    $('.face_detection').addClass('active');
    $('#videoInput').css('opacity', '0.3');
    $('.face_detection').css('background', '#655e58f2');
    if (!cv_ready)
        window.setTimeout(function(){opencvCapture(callBack)},500);
    else
        subcap(callBack);
}

function subcap(callBack) {
    $('#videoInput').css('opacity', '1');
        $('.face_detection').css('background', 'white');
        $('.face-loader').hide();
        let video = document.getElementById('videoInput');
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(video);
        let faces = new cv.RectVector();
        let classifier = new cv.CascadeClassifier();
        // load pre-trained classifiers
        classifier.load('frontal_face.xml');

        const FPS = 7;
        var countToMicrosoftCall = 0;

        let very_beginning = Date.now();
        var previousX = 0;
        var previousY = 0;

        function processVideo() {
            try {
                if (!streaming) {
                    // clean and stop.
                    src.delete();
                    dst.delete();
                    gray.delete();
                    faces.delete();
                    classifier.delete();
                    return (false);
                }
                let begin = Date.now();
                // start processing.
                cap.read(src);
                src.copyTo(dst);
                cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
                // detect faces.
                classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
                var facesInCircle = 0;
                // draw faces.
                // schedule the next one.
                var finalFace;
                if (faces.size() == 0) {
                    userInstruction.textContent = "Get in the circle!";
                }
                for (let i = 0; i < faces.size(); ++i) {
                    let face = faces.get(i);
                    if (face.x > 125 && face.x < (475 - face.width) && face.y > 50 && face.y < (400 - face.height)) {
                        finalFace = face;
                        facesInCircle++;
                    }
                    else {
                        userInstruction.textContent = "Get in the circle!";
                    }
                }
                if (facesInCircle == 1) {
                    //console.log(Math.abs(finalFace.x-previousX) + ", " +Math.abs(finalFace.y-previousY));
                    //circle.style.border = "4px double rgba(12, 204, 82, 0.9)";
                    if (Math.abs(finalFace.x-previousX)<5 && Math.abs(finalFace.y-previousY)<5){
                        circle.style.border = "4px double rgba(12, 204, 82, 0.9)";
                        countToMicrosoftCall++;
                        //console.log('+=1');

                    }
                    else{
                        console.log("Don't move!");
                    }
                    previousX = finalFace.x;
                    previousY = finalFace.y;
                }
                else {
                    countToMicrosoftCall = 0;
                    circle.style.border = "4px double white";
                    if (facesInCircle > 1) {
                        responsiveVoice.speak("Too many people in the circle");
                    }
                }
                if (countToMicrosoftCall == 4) {
                    circle.style.border = "4px solid rgba(12, 204, 82, 0.9)";
                    callBack(takeSnap());
                }
                else {
                    let delay = 1000 / FPS - (Date.now() - begin);
                    if (Date.now()-very_beginning > 20 * 1000) {
                        responsiveVoice.speak("No face was detected. Select an alternative payment method or try again.");
                        $('.payment-page').removeClass('nopadding');
                        $('.payment-stuff').show();
                        $('.face_detection').hide();
                        Particles.resumeAnimation();
                    } else {
                        setTimeout(processVideo, delay);
                    }
                }

            } catch (err) {
                console.log(err);
                utils.printError(err);
            }

        }

        // schedule the first one.
        setTimeout(processVideo, 0);
}
function takeSnap() {
    const canvas = document.createElement('canvas'); // create a canvas
    const displayCanvas = document.getElementById('customerFace')
    const ctx = canvas.getContext('2d'); // get its context
    const displayctx = displayCanvas.getContext('2d')
    displayctx.drawImage(videoInput, videoInput.videoWidth/2-175,videoInput.videoHeight/2-175,350,350,0,0,174,174)
    canvas.width = 350; // set its size to the one of the video
    canvas.height = 350;
    ctx.drawImage(videoInput, videoInput.videoWidth/2-175,videoInput.videoHeight/2-175,350,350,0,0,350,350); // the video
    var dataURL = canvas.toDataURL('image/jpeg');
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);
        return new Blob([raw], {type: contentType});
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    blob = new Blob([uInt8Array], {type: contentType});
    return blob;

}

function createCustomerList() {
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/largepersongroups/rfid_11_customergroup/persons";

    // Perform the REST API call.
    $.ajax({
        url: uriBase,
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        processData: false,
        type: "GET",
    }).done(function (data) {
        // console.log(JSON.stringify(data, null, 2));
        customerListObject = data;
    }).fail(function (jqXHR, textStatus, errorThrown) {
        errorCallingMicrosoft(jqXHR, textStatus, errorThrown)
    });
}

function detectWithMicrosoft(blob) {
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/detect";

    // Request parameters.
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        /*"returnFaceAttributes":
            "age,gender,headPose,smile,facialHair,glasses,emotion," +
            "hair,makeup,occlusion,accessories,blur,exposure,noise"*/
    };

    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request headers.
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        processData: false,
        type: "POST",
        async: false,
        // Request body.
        data: blob,
    }).done(function (data) {
        if (data.length == 1) {
            customerIdentify(data[0].faceId);
        }
        else {
            opencvCapture(detectWithMicrosoft);
            console.log("FaceIdentification Went Wrong!")
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        errorCallingMicrosoft(jqXHR, textStatus, errorThrown)
    });
}

function customerIdentify(faceID) {
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/identify";

    // Perform the REST API call.
    $.ajax({
        url: uriBase,

        // Request headers.
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        processData: false,
        type: "POST",

        // Request body.
        data: '{"largePersonGroupId": "rfid_11_customergroup","faceIds": ["' + faceID + '"],"maxNumOfCandidatesReturned": 1,"confidenceThreshold": 0.5}',
    }).done(function (data) {
        console.log(JSON.stringify(data, null, 2));
        for (i = 0; i < customerListObject.length; i++) {
            if (!data[0].candidates[0]) {
                responsiveVoice.speak('No face match found.');
                $('.face_detection video').hide();
                $('.face_detection #circle').hide();

                $('.payment-page').removeClass('nopadding');
                $('.cant-recognize').show();
                //$('.face-payment').addClass('disabled').prop('disabled', true);
                $('.face_detection').hide();
                Particles.resumeAnimation();
                break;
            }
            if (data[0].candidates[0].personId == customerListObject[i].personId) {
                person = customerListObject[i].userData.split(",")[2];
                userInstruction.textContent = "Person Identified: " + customerListObject[i].userData.split(",")[2];
                console.log("Person Identified: " + customerListObject[i].userData.split(",")[2]);
                i = customerListObject.length;
                $('.face_detection h1').text('Thank you for choosing us, ' + person).addClass('animated fadeInDown').show();
                $('.face_detection video').hide();
                $('.face_detection #circle').hide();
                $('.payment-page').removeClass('nopadding');
                $('.face_detection').removeClass('active');
                $('.face_detection input').show();
                responsiveVoice.speak("Thanks " + person + " for trying the world's fastest checkout system!");
                Particles.resumeAnimation();
            }
            else if (i == customerListObject.length - 1) {
                userInstruction.textContent = "Person not in our database";
                console.log("Person not in our database");
            }
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        errorCallingMicrosoft(jqXHR, textStatus, errorThrown)
    });
}

function addNewCustomer(blob){
    customerID = customerListObject.length;
    var customerData = [customerID.toString(), emailField.value, nameField.value, surnameField.value, 0,"x","x","","0"];
    //time3 = Date.now();
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/largepersongroups/rfid_11_customergroup/persons";
        //console.log('{"name": '+customerData[0]+', "userData": '+customerData+'}');

    // Perform the REST API call.
    $.ajax({
        url: uriBase,

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        processData: false,
        type: "POST",

        // Request body.
        data: '{"name": "'+customerData[0]+'", "userData": "'+customerData+'"}',
    })

    .done(function(data) {
        //console.log(JSON.stringify(data, null, 2));
        //console.log(Date.now()-time3);
        customerData[indexMicrosoftId] = data.personId;
        addNewFace(blob, customerData);
    })

    .fail(function(jqXHR, textStatus, errorThrown){errorCallingMicrosoft(jqXHR, textStatus, errorThrown)});
}

function addNewFace(blob, customerData){
    //time3 = Date.now();
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/largepersongroups/rfid_11_customergroup/persons/"+customerData[indexMicrosoftId]+"/persistedfaces";

    // Perform the REST API call.
    $.ajax({
        url: uriBase,

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        processData: false,
        type: "POST",

        // Request body.
        data: blob,
    })

    .done(function(data) {
        $('.registration-page').hide();
        $('.face_detection').show();
        
        $('.face_detection h1').text('Thank you for choosing us, ' + customerData[2]).addClass('animated fadeInDown').show();
        $('.registration-page nameField').hide();
        $('.registration-page surnameField').hide();
        $('.registration-page emailField').hide();
        $('.registration-page submit-data').hide();
        $('.registration-page another-method').hide();
        $('.registration-page customerFace').hide();
        $('.payment-page').removeClass('nopadding');
        $('.face_detection').removeClass('active');
        $('.face_detection input').show();
        responsiveVoice.speak("Thanks " + customerData[2] + " for trying the world's fastest checkout system!");
        train();
    })

    .fail(function(jqXHR, textStatus, errorThrown){errorCallingMicrosoft(jqXHR, textStatus, errorThrown)});
}

function train(){
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/largepersongroups/rfid_11_customergroup/train";

    // Perform the REST API call.
    $.ajax({
        url: uriBase,

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        processData: false,
        type: "POST",
    })

    .done(function(data) {
        createCustomerList();
        //console.log(JSON.stringify(data, null, 2));
        //console.log(Date.now()-time3);
    })

    .fail(function(jqXHR, textStatus, errorThrown){errorCallingMicrosoft(jqXHR, textStatus, errorThrown)});
}

function errorCallingMicrosoft(jqXHR, textStatus, errorThrown) {
    var errorString = (errorThrown === "") ?
        "Error. " : errorThrown + " (" + jqXHR.status + "): ";
    errorString += (jqXHR.responseText === "") ?
        "" : (jQuery.parseJSON(jqXHR.responseText).message) ?
            jQuery.parseJSON(jqXHR.responseText).message :
            jQuery.parseJSON(jqXHR.responseText).error.message;
    alert(errorString);
}