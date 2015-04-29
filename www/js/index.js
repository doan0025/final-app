var app = {

    loadRequirements: 0,

    pages: [],
    numLinks: 0,
    numPages: 0,

    photo_c: null,
    thumb_c: null,
    context: null,
    i: null,

    init: function () {
        document.addEventListener("deviceready", app.onDeviceReady);
        document.addEventListener("DOMContentLoaded", app.onDomReady);
    },
    onDeviceReady: function () {
        console.log(device.uuid);

        app.loadRequirements++;
        if (app.loadRequirements === 2) {
            app.start();
        }
    },
    onDomReady: function () {
        app.loadRequirements++;
        if (app.loadRequirements === 2) {
            app.start();
        }
    },
    start: function () {
        console.log("ready to go");
        pages = document.querySelectorAll('[data-role="page"]');
        numPages = pages.length;
        var links = document.querySelectorAll('[data-role="pagelink"]');
        numLinks = links.length;

        for (var i = 0; i < numLinks; i++) {
            links[i].addEventListener("click", app.handleNav, false);
        }
        
        app.loadPage(null);

        document.getElementById("btnClose").addEventListener("click", app.close);
        document.addEventListener("scroll", app.handleScrolling, false);
    },

    handleNav: function (ev) {
        ev.preventDefault();
        var href = ev.target.href;
        var parts = href.split("#");
        app.loadPage(parts[1]);
        return false;
    },

    loadPage: function (url) {
        if (url == null) {
            //home page first call
            pages[0].style.display = 'block';
            history.replaceState(null, null, "#list-view");
        } else {
            for (var i = 0; i < numPages; i++) {
                if (pages[i].id == url) {
                    pages[i].style.display = "block";
                    history.pushState("#" + url);
                } else {
                    pages[i].style.display = "none";
                }
            }
        }

        if ((url == "list-view") || (url == null)) {
            console.log("ready to load thumbnails");
            app.loadListView();
        } else if (url == "camera") {
            console.log("ready to take pix")
            app.takePix();
        }

    },

    handleScrolling: function(ev){
        var height = window.innerHeight;
        var offset = window.pageYOffset;
        var tabHeight = 80;
        var tabs = document.querySelector(".tabs");
        tabs.style.position = "absolute";
        var total = height + offset - tabHeight;
        tabs.style.top = total + "px";
    },

    loadListView: function (ev) {
        console.log("loading list of image");
        var url = "http://m.edumedia.ca/doan0025/mad9022/final-w15/list.php?dev=" + device.uuid;
        sendRequest(url, app.listThumbs, null);
        console.log(url);

    },

    listThumbs: function (xhr) {
        console.log("thumbnails listed");
        var ul = document.querySelector("#imageList");
        ul.innerHTML = "";
        var imageArray = JSON.parse(xhr.responseText);

        for (i = 0; i < imageArray.thumbnails.length; i++) {
            
            console.log(imageArray.thumbnails[i].id);
            var li = document.createElement("li");
            li.setAttribute("imageId", imageArray.thumbnails[i].id);

            var thumbImage = document.createElement("img");
            thumbImage.addEventListener("click", app.fetchFullImage)

            var deleteBtn = document.createElement("button");
            deleteBtn.setAttribute("imageId", imageArray.thumbnails[i].id);
            deleteBtn.className = 'delete';

            var deleteBtnCaption = document.createTextNode("Delete"); // Create a text node
            deleteBtn.appendChild(deleteBtnCaption); // Append the text to 
            deleteBtn.addEventListener("click", app.deleteImage);

            thumbImage.src = imageArray.thumbnails[i].data;
            console.log(imageArray.thumbnails[0]);
            li.appendChild(thumbImage);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
        }
    },

    fetchFullImage: function (ev) {
        var imageId = ev.target.parentNode.getAttribute("imageId");
        var url = "http://m.edumedia.ca/doan0025/mad9022/final-w15/get.php?dev=" + device.uuid + "&img_id=" + imageId;
        sendRequest(url, app.showFullImage, null);
    },

    showFullImage: function (xhr) {
        document.querySelector("[data-role=modal]").style.display = "block";
        document.querySelector("[data-role=overlay]").style.display = "block";

        var fullImage = JSON.parse(xhr.responseText);
        var modal = document.getElementById("fullimage");
        var img = document.getElementById("fullsize");
        img.src = fullImage.data;
        
        modal.appendChild(img);
    },

    deleteImage: function (ev) {
        document.querySelector("[data-role=modal]").style.display = "none";
        document.querySelector("[data-role=overlay]").style.display = "none";
        
        var btnId = ev.target.parentNode.getAttribute("imageId");
    
        var url = "http://m.edumedia.ca/doan0025/mad9022/final-w15/delete.php?dev=" + device.uuid + "&img_id=" + btnId;
        sendRequest(url, app.imageDelete, null);
    },
    
    imageDelete: function(xhr){
        alert("Are you sure to delete?");
        app.loadListView();
    },

    close: function (ev) {
        document.querySelector("[data-role=modal]").style.display = "none";
        document.querySelector("[data-role=overlay]").style.display = "none";
    },

    takePix: function () {
        navigator.camera.getPicture(app.imgSuccess, app.imgFail, {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA
        });
    },

    imgSuccess: function (imageURI) {
        console.info("success");
        //console.log(imageURI);
        app.i = document.createElement("img");

        app.photo_c = document.getElementById('photo_c');
        app.thumb_c = document.getElementById('thumb_c');

        app.photo_c.height = 400;
        app.photo_c.width = 600;
        app.context = app.photo_c.getContext('2d');

        //thumb
        app.thumb_c.height = 120;
        app.thumb_c.width = 180;
        app.context_thumb_c = app.thumb_c.getContext('2d');

        app.i.addEventListener("load", function (ev) {
            app.context.drawImage(app.i, 0, 0, app.photo_c.width, app.photo_c.height);
            app.context_thumb_c.drawImage(app.i, 0, 0, app.thumb_c.width, app.thumb_c.height);
        });
    
        app.i.crossOrigin = "";
        app.i.src = imageURI;

        document.getElementById("addText").addEventListener("click", app.addText);
        document.getElementById("savePix").addEventListener("click", app.saveImg);

    },

    imgFail: function (message) {
        console.log('Failed because: ' + message);
    },

    //edit image
    addText: function (ev) {
        ev.preventDefault();

        var txt = document.getElementById("text").value;
        //https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
        var txtTop = document.getElementById("top").checked;

        var w = app.photo_c.width;
        var h = app.photo_c.height;
        var middle = app.photo_c.width / 2;
        var bottom = app.photo_c.height - 50;
        var top = app.photo_c.height - 350;

        var w_thumb_c = app.thumb_c.width;
        var h_thumb_c = app.thumb_c.height;
        var middle_thumb_c = app.thumb_c.width / 2;
        var bottom_thumb_c = app.thumb_c.height - 20;
        var top_thumb_c = app.thumb_c.height - 90;

        if (txt != "") {
            if (txtTop == true) {
                //Add Text Full
                app.context.clearRect(0, 0, app.photo_c.w, app.photo_c.h);
                //reload the image      
                app.context.drawImage(app.i, 0, 0, w, h);
                ////THEN add the new text to the image                    
                app.context.font = "30px sans-serif";
                app.context.fillStyle = "white";
                app.context.textAlign = "center";
                app.context.fillText(txt, middle, top);

                app.context_thumb_c.clearRect(0, 0, app.thumb_c.w, app.thumb_c.h);
                //reload the image      
                app.context_thumb_c.drawImage(app.i, 0, 0, w_thumb_c, h_thumb_c);
                //THEN add the new text to the image                        
                app.context_thumb_c.font = "30px sans-serif";
                app.context_thumb_c.fillStyle = "white";
                app.context_thumb_c.textAlign = "center";
                app.context_thumb_c.fillText(txt, middle_thumb_c, top_thumb_c);
                
            } else {
                app.context.clearRect(0, 0, app.photo_c.w, app.photo_c.h);
                //reload the image      
                app.context.drawImage(app.i, 0, 0, w, h);
                //THEN add the new text to the image                        
                app.context.font = "30px sans-serif";
                app.context.fillStyle = "white";
                app.context.textAlign = "center";
                app.context.fillText(txt, middle, bottom);
                

                //Add Text Thumb
                app.context_thumb_c.clearRect(0, 0, app.thumb_c.w, app.thumb_c.h);
                //reload the image      
                app.context_thumb_c.drawImage(app.i, 0, 0, w_thumb_c, h_thumb_c);
                ////THEN add the new text to the image                 
                app.context_thumb_c.font = "15px sans-serif";
                app.context_thumb_c.fillStyle = "white";
                app.context_thumb_c.textAlign = "center";
                app.context_thumb_c.fillText(txt, middle_thumb_c, bottom_thumb_c);
            }
        }
    },

    //save both full & thumb img
    saveImg: function (ev) {
        ev.preventDefault();
        
        var fullimage = app.photo_c.toDataURL("image/jpeg");
        var thumbphoto = app.thumb_c.toDataURL("image/jpeg");

        fullimage = encodeURIComponent(fullimage);
        thumbphoto = encodeURIComponent(thumbphoto);

        var url = "http://m.edumedia.ca/doan0025/mad9022/final-w15/save.php";
        var postData = "dev=" + device.uuid + "&img=" + fullimage + "&thumb=" + thumbphoto ;
        sendRequest(url, app.imgSaved, postData);
    },

    imgSaved: function (xhr) {
        alert("Image has been saved!");
    },
}

app.init();


// var app = {
//     // Application Constructor
//     initialize: function() {
//         this.bindEvents();
//     },
//     // Bind Event Listeners
//     //
//     // Bind any events that are required on startup. Common events are:
//     // 'load', 'deviceready', 'offline', and 'online'.
//     bindEvents: function() {
//         document.addEventListener('deviceready', this.onDeviceReady, false);
//     },
//     // deviceready Event Handler
//     //
//     // The scope of 'this' is the event. In order to call the 'receivedEvent'
//     // function, we must explicitly call 'app.receivedEvent(...);'
//     onDeviceReady: function() {
//         app.receivedEvent('deviceready');
//     },
//     // Update DOM on a Received Event
//     receivedEvent: function(id) {
//         var parentElement = document.getElementById(id);
//         var listeningElement = parentElement.querySelector('.listening');
//         var receivedElement = parentElement.querySelector('.received');

//         listeningElement.setAttribute('style', 'display:none;');
//         receivedElement.setAttribute('style', 'display:block;');

//         console.log('Received Event: ' + id);
//     }
// };

// app.initialize();