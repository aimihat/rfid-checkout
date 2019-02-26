var utils = new Utils('errorMessage');
let userInstruction = document.getElementById('userInstruction');

var streaming = false;
var videoInput = document.getElementById('videoInput');
var circle = document.getElementById('circle');

const subscriptionKey = "a7a384b30ee447b3a52ee1b0e0923f0a";
var customerListObject;
var cv_ready = false;
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

        function processVideo() {
            console.log('processvideo');
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
                // draw faces.
                // schedule the next one.
                if (faces.size() == 0) {
                    userInstruction.textContent = "Get in the circle!";
                }
                for (let i = 0; i < faces.size(); ++i) {
                    var facesInCircle = 0;
                    let face = faces.get(i);
                    if (face.x > 125 && face.x < (475 - face.width) && face.y > 50 && face.y < (400 - face.height)) {
                        facesInCircle++;
                    }
                    else {
                        userInstruction.textContent = "Get in the circle!";
                    }
                }
                if (facesInCircle == 1) {
                    circle.style.border = "4px double rgba(12, 204, 82, 0.9)";
                    countToMicrosoftCall++;
                    console.log('+=1');
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
                        responsiveVoice.speak("No face was detected. Please select an alternative payment method or try again.");
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
    const ctx = canvas.getContext('2d'); // get its context

    canvas.width = videoInput.videoWidth; // set its size to the one of the video
    canvas.height = videoInput.videoHeight;

    ctx.drawImage(videoInput, 0, 0); // the video
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
    return new Blob([uInt8Array], {type: contentType});

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
                responsiveVoice.speak('No face match found. Please select an alternative payment method.');
                $('.face_detection video').hide();
                $('.face_detection #circle').hide();
                $('.payment-page').removeClass('nopadding');
                $('.payment-stuff').show();
                $('.face-payment').addClass('disabled').prop('disabled', true);
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

function errorCallingMicrosoft(jqXHR, textStatus, errorThrown) {
    var errorString = (errorThrown === "") ?
        "Error. " : errorThrown + " (" + jqXHR.status + "): ";
    errorString += (jqXHR.responseText === "") ?
        "" : (jQuery.parseJSON(jqXHR.responseText).message) ?
            jQuery.parseJSON(jqXHR.responseText).message :
            jQuery.parseJSON(jqXHR.responseText).error.message;
    alert(errorString);
}