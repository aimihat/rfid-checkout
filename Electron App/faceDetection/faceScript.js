let utils = new Utils('errorMessage');

let streaming = false;
let videoInput = document.getElementById('videoInput');
let startAndStop = document.getElementById('startAndStop');
let newCustomer = document.getElementById('newCustomer');
let userInstruction = document.getElementById('userInstruction');
let circle = document.getElementById('circle');
let nameField = document.getElementById('nameField');
let surnameField = document.getElementById('surnameField');
let emailField = document.getElementById('emailField');

const subscriptionKey = "9162906ad2fb44f99d886e995f113f3b";
let indexMicrosoftId = 7;
var customerListObject;

createCustomerList();

utils.loadOpenCv(() => {
    let faceCascadeFile = 'frontal_face.xml';
    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
        startAndStop.removeAttribute("disabled");
    });
});

startAndStop.addEventListener('click', () => {
    if (!streaming) {
        utils.clearError();
        utils.startCamera('vga', onVideoStarted, 'videoInput');
    } else {
        utils.stopCamera();
        onVideoStopped();
    }
});

newCustomer.addEventListener('click', () => { 
        opencvCapture(addNewCustomer);
});

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
                newCustomer.disabled =false;
            }
            else{
                newCustomer.disabled = true;
            }
        }
        else{
            newCustomer.disabled = true;
        }
    }
    else{
        newCustomer.disabled = true;
    }
}

function onVideoStarted() {
    streaming = true;
    startAndStop.innerText = 'Stop';
    videoInput.width = videoInput.videoWidth;
    videoInput.height = videoInput.videoHeight;
    opencvCapture(detectWithMicrosoft);
}

function onVideoStopped() {
    streaming = false;
    //canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    startAndStop.innerText = 'Start';
}

function opencvCapture(callBack){
    let video = document.getElementById('videoInput');
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let cap = new cv.VideoCapture(video);
    let faces = new cv.RectVector();
    let classifier = new cv.CascadeClassifier();

    // load pre-trained classifiers
    classifier.load('frontal_face.xml');

    const FPS = 3;
    var countToMicrosoftCall = 0;
    function processVideo() {
        try {
            if (!streaming) {
                // clean and stop.
                src.delete();
                dst.delete();
                gray.delete();
                faces.delete();
                classifier.delete();
                return(false);
            }
            let begin = Date.now();
            // start processing.
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            // detect faces.
            classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
            // draw faces.
            //console.log(faces.size());
            // schedule the next one.
            if (faces.size()==0){
                userInstruction.textContent = "Get in the circle!";
            }
            for (let i = 0; i < faces.size(); ++i) {
                var facesInCircle = 0;
                let face = faces.get(i);
                //console.log("x= " + face.x +", y= " + face.y);
                if (face.x>170 && face.x<(470-face.width) && face.y>100 && face.y<(420-face.height)){
                    facesInCircle++;
                    //console.log("In circle!");
                }
                else{
                    //console.log("Not in circle ):");
                    userInstruction.textContent ="Get in the circle!";
                }
            }
            if (facesInCircle==1){
                circle.style.border = "10px solid green";
                countToMicrosoftCall++;
            }
            else{
                countToMicrosoftCall == 0;
                circle.style.border = "10px solid orange";
                if (facesInCircle>1){
                    userInstruction.textContent = "Too many people in the circle";
                }
            }
            if (countToMicrosoftCall == 3){
                circle.style.border = "10px solid black";
                callBack(takeSnap());
            } 
            else{
                let delay = 1000/FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);
            }

        } catch (err) {
            utils.printError(err);
        }
    }
    // schedule the first one.
    setTimeout(processVideo, 0);
}

function takeSnap(){
    //console.log("TakingSnap...");
    //time2 = Date.now();
    const canvas = document.createElement('canvas'); // create a canvas
    const ctx = canvas.getContext('2d'); // get its context

    //canvas.width = videoInput.videoWidth; // set its size to the one of the video
    //canvas.height = videoInput.videoHeight;
   
    canvas.width = 350; // set its size to the one of the video
    canvas.height = 350;
    ctx.drawImage(videoInput, videoInput.videoWidth/2-175,videoInput.videoHeight/2-175,350,350,0,0,350,350); // the video

    //ctx.drawImage(videoInput, 0,0); // the video
    var dataURL = canvas.toDataURL('image/jpeg');
    var data = dataURL.split(',')[1];
    //var mimeType = dataUri.split(';')[0].slice(5)
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);
        return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    //console.log(Date.now()-time2);
    return new Blob([uInt8Array], { type: contentType });

  }

  function createCustomerList(){
    //time3 = Date.now();
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/largepersongroups/rfid_11_customergroup/persons";
    
    // Perform the REST API call.
    $.ajax({
        url: uriBase,
    
        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        processData: false,
        type: "GET",    
    })
    
    .done(function(data) {
        console.log(JSON.stringify(data, null, 2));
        //console.log(Date.now()-time3);
        customerListObject = data;
    })
    
    .fail(function(jqXHR, textStatus, errorThrown){errorCallingMicrosoft(jqXHR, textStatus, errorThrown)});
    }

function detectWithMicrosoft(blob) {
    //time3 = Date.now();
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
        //console.log(JSON.stringify(data, null, 2));
        //console.log(Date.now()-time3);
        if (data.length == 1){
            customerIdentify(data[0].faceId);
                }
        else{
            opencvCapture(detectWithMicrosoft);
            console.log("FaceIdentification Went Wrong!")
        }
    })

    .fail(function(jqXHR, textStatus, errorThrown){errorCallingMicrosoft(jqXHR, textStatus, errorThrown)});
}
function customerIdentify(faceID) {
    //time3 = Date.now();
    var uriBase =
        "https://uksouth.api.cognitive.microsoft.com/face/v1.0/identify";

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
        data: '{"largePersonGroupId": "rfid_11_customergroup","faceIds": ["'+faceID+'"],"maxNumOfCandidatesReturned": 1,"confidenceThreshold": 0.5}',
    })
    //

    .done(function(data) {
        console.log(JSON.stringify(data, null, 2));
        try{
            for (i = 0; i<customerListObject.length; i++){
                if (data[0].candidates[0].personId == customerListObject[i].personId){
                    userInstruction.textContent ="Person Identified: " + customerListObject[i].userData.split(",")[2];
                    console.log("Person Identified: " + customerListObject[i].userData.split(",")[2]);
                    i = customerListObject.length;

                }
                else if (i==customerListObject.length-1){
                    userInstruction.textContent ="Person not in our database";
                    console.log("Person not in our database");
                }
            }
        }
        catch {
            console.log("I dont know who you are");
            userInstruction.textContent = "I dont know who you are";
        }
    })

    .fail(function(jqXHR, textStatus, errorThrown){errorCallingMicrosoft(jqXHR, textStatus, errorThrown)});
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
        //customerDatabaseObject.push(customerData);
        //console.log("This is the response of addnewface");
        //console.log(JSON.stringify(data, null, 2));
        //console.log(Date.now()-time3);
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

function errorCallingMicrosoft(jqXHR, textStatus, errorThrown){
    var errorString = (errorThrown === "") ?
            "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ?
            "" : (jQuery.parseJSON(jqXHR.responseText).message) ?
                jQuery.parseJSON(jqXHR.responseText).message :
                    jQuery.parseJSON(jqXHR.responseText).error.message;
        alert(errorString);
}