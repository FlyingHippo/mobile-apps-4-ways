var map;
var markersArray = [];

function setupMaps(latitude, longitude, zoom) {
    var mapOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: zoom,
        streetViewControl: false,
        noClear: true,
        panControl: false,
        rotateControl: false,
        zoomControl: false,
        mapTypeControl: false,
        minZoom:6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);

    //google.maps.event.addListener(map, 'idle', function () {
    //    var bounds = map.getBounds();

    //    var southWest = bounds.getSouthWest();

    //    var northEast = bounds.getNorthEast();

    //    console.log("sw " + southWest);
    //    console.log("ne " + northEast);
    //});

    //sw (54, 7.8)
    //ne (57, 15.2)

    // bounds of the desired area
    var allowedBounds = new google.maps.LatLngBounds(
         new google.maps.LatLng(54, 7.8),
        new google.maps.LatLng(57, 15.2)

    );
    var lastValidCenter = map.getCenter();

    google.maps.event.addListener(map, 'center_changed', function () {
        if (allowedBounds.contains(map.getCenter())) {
            // still within valid bounds, so save the last valid position
            lastValidCenter = map.getCenter();
            return;
        }

        // not valid anymore => return to last valid position
        map.panTo(lastValidCenter);
    });
    
    google.maps.event.addListener(map, 'idle', function () {

        var bounds = map.getBounds();

        var southWest = bounds.getSouthWest();
        var northEast = bounds.getNorthEast();

        //console.log("min lat " + southWest.lat() + " max lat " + northEast.lat() + " min long " + southWest.lng() + " max long " + northEast.lng());
        loadMarkers(southWest.lat(), northEast.lat(), southWest.lng(), northEast.lng());
    });

    google.maps.event.addListener(map, 'click', function () {
        $(".infoBox").hide();
    });

    //alert("fisk loaded;");

}

function loadMarkers(minLat, maxLat, minLong, maxLong) {
    deleteOverlays();
    $.getJSON("https://srv1.jobwalk.dk/ws/Service1.svc/getjobs/" + minLat + "/" + maxLat + "/" + minLong + "/" + maxLong, function (json) {
        if (json != "Nothing found.") {
            $.each(json, function (i, item) {
               // console.log(item.Title);
                var latLng = new google.maps.LatLng(item.Latitude, item.Longitude);


                var image = new google.maps.MarkerImage(
                    'images/static/maps/marker-images/image.png',
                    new google.maps.Size(41, 40),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(21, 40)
                );

                var shadow = new google.maps.MarkerImage(
                    'images/static/maps/marker-images/shadow.png',
                    new google.maps.Size(65, 40),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(21, 40)
                );

                var shape = {
                    coord: [22, 3, 24, 4, 25, 5, 26, 6, 26, 7, 27, 8, 27, 9, 27, 10, 27, 11, 27, 12, 26, 13, 26, 14, 25, 15, 24, 16, 22, 17, 20, 18, 38, 19, 40, 20, 40, 21, 40, 22, 40, 23, 40, 24, 40, 25, 40, 26, 40, 27, 38, 28, 36, 29, 33, 30, 29, 31, 27, 32, 26, 33, 25, 34, 24, 35, 23, 36, 23, 37, 22, 38, 22, 39, 16, 39, 16, 38, 16, 37, 16, 36, 16, 35, 18, 34, 18, 33, 18, 32, 18, 31, 18, 30, 18, 29, 18, 28, 18, 27, 18, 26, 18, 25, 18, 24, 18, 23, 18, 22, 18, 21, 18, 20, 18, 19, 18, 18, 16, 17, 14, 16, 13, 15, 12, 14, 12, 13, 12, 12, 12, 11, 12, 10, 12, 9, 12, 8, 12, 7, 12, 6, 13, 5, 14, 4, 16, 3, 22, 3],
                    type: 'poly'
                };


                var marker = new google.maps.Marker({
                    raiseOnDrag: false,
                    icon: image,
                    shadow: shadow,
                    shape: shape,
                    position: latLng,
                    map: map
                });

                var boxText = document.createElement("div");
                boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: #000000; border-radius:5px; padding: 5px; color:#FFF;";


                boxText.innerHTML = "<a href='/view-job.aspx?id=" + item.ID + "'><h3>" + item.Title + "</h3></a><img src='" + item.Image + "' /><br/><span>" + item.Address + "</span><br/><p style='border-radius: 5px 5px 5px 5px;background-color:grey;'>" + item.Description + "</p>";
                var myOptions1 = {
                    content: boxText,
                    disableAutoPan: false,
                    maxWidth: 0,
                    pixelOffset: new google.maps.Size(-140, 0),
                    zIndex: null,
                    boxStyle: {
                        background: "url('scripts/infobox/tipbox.gif') no-repeat",
                        opacity: 0.85,
                        width: "280px"
                    },
                    //closeBoxMargin: "10px 2px 2px 2px",
                    closeBoxURL: "",
                    //closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
                    infoBoxClearance: new google.maps.Size(1, 1),
                    isHidden: false,
                    pane: "floatPane",
                    enableEventPropagation: false
                };

                var ib = new InfoBox(myOptions1);

                //ib.open(map, marker);

                markersArray.push(marker);

                google.maps.event.addListener(marker, "click", function () {

                    $(".infoBox").hide();
                    ib.open(map, marker);
                });

            });
        }
    }).error(function () { alert(noConnectionErrMsg); });
}

// Deletes all markers in the array by removing references to them
function deleteOverlays() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles                                   :::
//:::                  'K' is kilometers (default)                            :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at http://www.geodatasource.com                          :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: http://www.geodatasource.com                        :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2013            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var radlon1 = Math.PI * lon1 / 180
    var radlon2 = Math.PI * lon2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
}

distance(56.89283711375379, 8.528246842332676, 56.892874, 8.528036, 'K');