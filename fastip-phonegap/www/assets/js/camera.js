
var pictureSource;   // picture source
var destinationType; // sets the format of returned value 
var photoNumber;
var photoStep;

function setupCamera() { //in use
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
}

function onPhotoURISuccess(imageURI) { //in use
    var largeImage = $('#' + photoStep); //HUSK
   
    $(largeImage).attr("src", imageURI);
    //alert("'" + photoStep + "' - 'divEditProfilePhoto'");

    if (photoStep == 'divEditProfilePhoto') {
    $('#divMyProfilePhoto').attr("src", imageURI);    
    }

    hidePhotoAdd();
}

function onFail(message) { //in use
    alert('Failed because: ' + message);
}

function deletePhoto() { //in use
    var photoToDelete = $('#' + photoStep); 
   
    $(photoToDelete).attr("src", "assets/img/camera.png");

    hidePhotoAdd();
}

function getCameraPhoto() { //in use
    try {
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.FILE_URI,
        saveToPhotoAlbum: true
    });
    }
    catch (err) {
        alert(err);
    }
}

function getLibraryPhoto() {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.FILE_URI,
        sourceType: pictureSource.PHOTOLIBRARY
    });
}
