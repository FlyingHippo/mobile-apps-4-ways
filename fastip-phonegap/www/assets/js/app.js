(function ($) {
    "use strict";

    var tipPercent = 15.0;

    var calcTip = function () {
        var billAmt = Number($('#billAmount').val());
        var tipAmt = billAmt * tipPercent / 100;
        var totalAmt = billAmt + tipAmt;
        $('#tipAmount').text('$' + tipAmt.toFixed(2));
        $('#totalAmount').text('$' + totalAmt.toFixed(2));
    };

    var saveSettings = function () {
        try {
            var tipPct = parseFloat($('#tipPercentage').val());
            localStorage.setItem('tipPercentage', tipPct);
            tipPercent = tipPct;
            window.history.back();
        } catch (ex) {
            alert('Tip percentage must be a decimal value');
        }
    };

    $(document).on("ready", function () {
        $('#calcTip').on('click', calcTip);
        $('#saveSettings').on('click', saveSettings);
        var tipPercentSetting = localStorage.getItem('tipPercentage');
        if (tipPercentSetting) {
            tipPercent = parseFloat(tipPercentSetting);
        }
        $('#tipPercentage').val(tipPercent);
    });

    $(document).on("deviceready", function () {
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByName("gray");
    });

}
)(jQuery);

$.fn.wait = function (time, type) {
    time = time || 1000;
    type = type || "fx";
    return this.queue(type, function() {
        var self = this;
        setTimeout(function() {
            $(self).dequeue();
        }, time);
    });
};

function checkLocation() {
    var checkLocationwin = function(position) {
        var lati = position.coords.latitude;
        var longi = position.coords.longitude;
        var zoom = 10;
        //setupMaps(lati, longi, zoom);
    };

    var checkLocationfail = function(e) {
        switch (e.code) {
        case 1:
            navigator.notification.alert(
                _('msgGpsDeactivatedMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsDeactivatedTitle'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("User denied the request for Geolocation.");
            break;
        case 2:
            navigator.notification.alert(
                _('msgGpsErrorMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
            break;
        }
        //setupMaps(56.16390607394954, 10.56884765625, 6);
    };

    //navigator.geolocation.getCurrentPosition(checkLocationwin, checkLocationfail, { maximumAge: 0, });
    navigator.geolocation.getCurrentPosition(checkLocationwin, checkLocationfail, { maximumAge: 0, timeout: 10000, enableHighAccuracy: true });
}

function checkLocationJobStart(json) {
    var joblat = json.Latitude;
    var joblong = json.Longitude;

    var checkLocationJobStartwin = function(position) {
        var lati = position.coords.latitude;
        var longi = position.coords.longitude;
        var latLngA = new google.maps.LatLng(lati, longi);
        var latLngB = new google.maps.LatLng(json.Latitude, json.Longitude);

        dist = (google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB) / 1000).toFixed(1);

        // setupMaps(lati, longi, zoom);

        populateSteps(json, lati, longi, 0, false);
    };

    var checkLocationJobStartfail = function(e) {
        switch (e.code) {
        case 1:
            navigator.notification.alert(
                _('msgGpsDeactivatedMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsDeactivatedTitle'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("User denied the request for Geolocation.");
            break;
        case 2:
            navigator.notification.alert(
                _('msgGpsErrorMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
            break;
        }
        //setupMaps(56.16390607394954, 10.56884765625, 6);
        populateSteps(json, 0, 0, 0, false);
    };

    navigator.geolocation.getCurrentPosition(checkLocationJobStartwin, checkLocationJobStartfail, { maximumAge: 0, timeout: 10000, enableHighAccuracy: true });
}

function activateInputDiv(inputDiv) {
    $(inputDiv).find('.inputLabel').hide();
    $(inputDiv).find('.icon-pencil').hide();

    //$(inputDiv).find('.inputtextbox').parent().css('margin-left', '10px').css('margin-right', '10px');
    ////$(inputDiv).find('.inputtextbox').parent().css('margin', '0px 10px 0px 10px;');
    //$(inputDiv).find('.inputtextbox').parent().css('width', '280px');
    //setTimeout(function () {
    //    $(inputDiv).find('.inputtextbox').first().focus();
    //});
}

function focusOutInputDiv(inputDiv) {
    $(inputDiv).parent().parent().find('.inputLabel').show();
    $(inputDiv).parent().parent().find('.icon-pencil').show();

    //var width = realWidth($(inputDiv).parent().parent().find('.inputLabel'));
    //$(inputDiv).parent().css('margin-left', width + 5);
    //$(inputDiv).parent().width(252 - width);
}

function realWidth(obj) {
    var clone = obj.clone();
    clone.css("visibility", "hidden");
    $('body').append(clone);
    var width = clone.outerWidth();
    clone.remove();
    return width;
}

function realHeigth(obj) {
    var clone = obj.clone();
    clone.css("visibility", "hidden");
    $('body').append(clone);
    var height = clone.outerHeight();
    clone.remove();
    return height;
}

var animationInProgress = false;
var animationTime = 200;
var currentPos;
var currentjobJSON;
var globalCurrentDiv;

function goForwardFooter(newDiv) {
    //alert("footer");
    if (spinner == null) {
        spinnerStart();
    }
    if (newDiv == '#divFindJobList') {
        loadJobList(false);
        //if (spinner != null) {
        //    spinnerStop();
        //}
    }
    if (newDiv == '#divMyJobs') {
        updateMyjobs();
    } else if (newDiv == '#divMyProfile') {
        loadMyProfile(true);
    } else if (newDiv == '#divYourAccount') {
        loadAccount();
    }

    if (animationInProgress == true) {
        return;
    }
    try {
        animationInProgress = true;

        var newHead = $(newDiv).find(".head");
        var newContent = $(newDiv).find(".content");
        var newFoot = $(newDiv).find(".foot");
        var newBackA = $(newDiv).find(".head").find(".header-back-button");

        var oldHead = $('#currentHead').find(".head");
        var oldContent = $('#currentContent').find(".content");
        var oldFoot = $('#currentFoot').find(".foot");

        if (newHead.html() == null || newContent.html() == null || newFoot.html() == null) {
            animationInProgress = false;

        } else {


            if (newDiv != '#divLogin' && newDiv != '#divCreateProfile') {
                $(newBackA).attr('onclick', '').unbind('click');
                $(newBackA).click(function() {
                    goBack(globalCurrentDiv);
                    return false;
                });
                $(newBackA).find("button").text("Tilbage");
            }

            $(newContent).appendTo($('#currentContent'));

            setTimeout(function() {
                $(oldContent).attr('class', 'content stage-left transition');
                $(newContent).attr('class', 'content stage-center transition');
                //});
                //setTimeout(function() {
                $(newHead).appendTo($('#currentHead'));
                $(newFoot).appendTo($('#currentFoot'));
                $(oldHead).appendTo($(globalCurrentDiv));
                $(oldContent).appendTo($(globalCurrentDiv));
                $(oldFoot).appendTo($(globalCurrentDiv));

                $('#currentContent').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
                $('#currentContent').find('.content').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
                $('#currentContent').find('.scroll').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());

                globalCurrentDiv = newDiv;

                animationInProgress = false;
            });

            if (newDiv == '#divLogin' || newDiv == '#divCreateProfile') {
                if (spinner != null) {
                    spinnerStop();
                }
            }
        }
    } catch(err) {
        //console.log(err);
        if (spinner != null) {
            spinnerStop();
        }
    }
}

function goForwardList(newDiv) {
    if (newDiv == '#divFindJobList') {
        loadJobList(false);
    } else if (newDiv == '#divMyJobs') {
        updateMyjobs();
        if (spinner != null) {
            spinnerStop();
        }
    } else if (newDiv == '#divMyProfile') {
        loadMyProfile(true);
    } else if (newDiv == '#divYourAccount') {
        loadAccount();
        if (spinner != null) {
            spinnerStop();
        }
    }
    if (animationInProgress == false) {
        animationInProgress = true;
        var newHead = $(newDiv).find(".head");
        var newContent = $(newDiv).find(".content");
        var newFoot = $(newDiv).find(".foot");

        var oldHead = $('#currentHead').find(".head");
        var oldContent = $('#currentContent').find(".content");
        var oldFoot = $('#currentFoot').find(".foot");

        if (newHead.html() == null || newContent.html() == null || newFoot.html() == null) {
            //animationInProgress = false;
            //if (spinner != null) {
            //    spinnerStop();
            //}
            //setTimeout(function () {
            //    $('' + lastListElement).find('a').css('background-image', '');
            //    $('' + lastListElement).find('.joblistTitle').css('color', 'black').css('text-shadow', '');
            //    $('' + lastListElement).find('.joblistPrice').css('color', 'black').css('text-shadow', '');
            //    $('' + lastListElement).find('.joblistDistance').css('color', 'lightgray').css('text-shadow', '');
            //    $('' + lastListElement).find('.joblistAddress').css('color', '#000000').css('text-shadow', '');
            //    $('' + lastListElement).find('.joblistDesc').css('color', '#7f7f7f').css('text-shadow', '');

            //    $('' + lastListElement).find('.jobListArrow').css('display', 'block');
            //    $('' + lastListElement).find('.jobListArrowActive').css('display', 'none');
            //}, 500);
        } else {
            $(newContent).appendTo($('#currentContent'));

            setTimeout(function() {
                if (newDiv != '#divFindJobList') {
                    if (spinner != null) {
                        spinnerStop();
                    }
                }

                $(oldContent).attr('class', 'content stage-left transition');
                $(newContent).attr('class', 'content stage-center transition');
                //});
                //setTimeout(function() {
                $(newHead).appendTo($('#currentHead'));
                $(newFoot).appendTo($('#currentFoot'));
                $(oldHead).appendTo($(globalCurrentDiv));
                $(oldContent).appendTo($(globalCurrentDiv));
                $(oldFoot).appendTo($(globalCurrentDiv));


                $('#currentContent').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
                $('#currentContent').find('.content').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
                $('#currentContent').find('.scroll').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());

                globalCurrentDiv = newDiv;

                animationInProgress = false;

                setTimeout(function() {
                    $('' + lastListElement).find('a').css('background-image', '');
                    $('' + lastListElement).find('.joblistTitle').css('color', 'black').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistPrice').css('color', 'black').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistDistance').css('color', 'lightgray').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistAddress').css('color', '#000000').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistDesc').css('color', '#7f7f7f').css('text-shadow', '');

                    $('' + lastListElement).find('.jobListArrow').css('display', 'block');
                    $('' + lastListElement).find('.jobListArrowActive').css('display', 'none');
                }, 500);
            });
        }
    }
}

var hideSplash = true;

function goToFirstPage(newDiv) {
    if (spinner == null) {
        spinnerStart();
    }
    if (newDiv == '#divFindJobList') {
        loadJobList(false);
    }
    var newHead = $(newDiv).find(".head");
    var newContent = $(newDiv).find(".content");
    var newFoot = $(newDiv).find(".foot");

    $(newContent).appendTo($('#currentContent'));
    setTimeout(function() {
        $(newContent).attr('class', 'content stage-center transition');

        setTimeout(function() {
            $(newHead).appendTo($('#currentHead'));
            $(newFoot).appendTo($('#currentFoot'));
            $('#currentContent').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
            $('#currentContent').find('.content').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
            $('#currentContent').find('.scroll').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());

            globalCurrentDiv = newDiv;

            setTimeout(function() {
                if (hideSplash == true) {
                    if (testrun == false) {
                        navigator.splashscreen.hide();
                    }
                    hideSplash = false;
                }
                if (newDiv != '#divFindJobList') {
                    if (spinner != null) {
                        spinnerStop();
                    }
                }
            }, 1000);
        }, animationTime);
    });
}

var spinner = null;

function spinnerStart() {
    if (spinner != null) {
        spinnerStop();
    }

    $('#spinnerBG').show();
    var opts = {
        lines: 13, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#fff', // #rgb or #rrggbb
        speed: 1.6, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: true, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };
    var target = document.getElementById('spinnerBG');
    spinner = new Spinner(opts).spin(target);
}

function spinnerStop() {
    $('#spinnerBG').hide();
    spinner.stop();
    spinner = null;
}

function goForward(newDiv) {

    if (newDiv != '#divIntro1' && newDiv != '#divIntro2' && newDiv != '#divIntro3') {
        if (spinner == null) {
            spinnerStart();
        }
    }

    if (newDiv == '#divFindJobList') {
        loadJobList(false);

    } else if (newDiv == '#divMyJobs') {
        updateMyjobs();
    } else if (newDiv == '#divMyProfile') {
        loadMyProfile(true);
    } else if (newDiv == '#divYourAccount') {
        loadAccount();
    }


    $('#currentHead').find(".header-button-right").addClass('tappable-active');

    var newHead = $(newDiv).find(".head");
    var newContent = $(newDiv).find(".content");
    var newFoot = $(newDiv).find(".foot");

    var oldHead = $('#currentHead').find(".head");
    var oldContent = $('#currentContent').find(".content");
    var oldFoot = $('#currentFoot').find(".foot");

    $(newHead).appendTo($('#currentHead'));
    $(newContent).appendTo($('#currentContent'));
    $(newFoot).appendTo($('#currentFoot'));

    setTimeout(function() {
        $(oldContent).attr('class', 'content stage-left transition');
        $(newContent).attr('class', 'content stage-center transition');

        setTimeout(function() {
            //$(newHead).css("display", "block");
            //$(newFoot).css("display", "block");
            $(oldHead).appendTo($(globalCurrentDiv));
            $(oldContent).appendTo($(globalCurrentDiv));
            $(oldFoot).appendTo($(globalCurrentDiv));

            //setTimeout(function () {
            $('#currentContent').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
            $('#currentContent').find('.content').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
            $('#currentContent').find('.scroll').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());

            //              $('#currentHead').find('h1').text($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
            setTimeout(function() {
                $(globalCurrentDiv).find(".header-button-right").removeClass('tappable-active');
                globalCurrentDiv = newDiv;
                if (newDiv != '#divFindJobList') {
                    if (spinner != null) {
                        spinnerStop();
                    }
                }
            }, animationTime);
            //}, animationTime); 
        }, animationTime);
    });
}

function goBack(newDiv) {

    if (newDiv == '#divMyJobs') {
        updateMyjobs();
    }

    if (newDiv == '#divMyProfile') {
        loadMyProfile(true);
    }

    if (newDiv == '#divYourAccount') {
        loadAccount();
    }

    $('#currentHead').find(".header-back-button").addClass('tappable-active');

    var newHead = $(newDiv).find(".head");
    var newContent = $(newDiv).find(".content");
    var newFoot = $(newDiv).find(".foot");

    var oldHead = $('#currentHead').find(".head");
    var oldContent = $('#currentContent').find(".content");
    var oldFoot = $('#currentFoot').find(".foot");

    $(newHead).css("display", "none").appendTo($('#currentHead'));
    $(newContent).appendTo($('#currentContent'));
    $(newFoot).css("display", "none").appendTo($('#currentFoot'));


    setTimeout(function() {
        $(oldContent).attr('class', 'content stage-right transition');
        $(newContent).attr('class', 'content stage-center transition');

        setTimeout(function() {
            $(newHead).css("display", "block");
            $(newFoot).css("display", "block");
            $(oldHead).appendTo($(globalCurrentDiv));
            $(oldContent).appendTo($(globalCurrentDiv));
            $(oldFoot).appendTo($(globalCurrentDiv));

            $('#currentContent').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
            $('#currentContent').find('.content').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());
            $('#currentContent').find('.scroll').height($(window).height() - $('#currentHead').height() - $('#currentFoot').find('.footer').height());

            setTimeout(function() {
                $(globalCurrentDiv).find(".header-back-button").removeClass('tappable-active');
                globalCurrentDiv = newDiv;
                if (newDiv != '#divMyJobs' && newDiv != '#divMyProfile' && newDiv != '#divYourAccount') {
                    if (spinner != null) {
                        spinnerStop();
                    }
                }

            }, animationTime);
        }, animationTime);
    });

}

var noOfCompletedJobs = null;

function updateMyjobs() {
    var loadMyJobsListwin = function(position) {
        var userID = window.localStorage["userID"];
        //current jobs start
        var CurrentJobsJSON = null;

        currentPos = position;
        var lati = currentPos.coords.latitude;
        var longi = currentPos.coords.longitude;

        $.getJSON(server + "/ws/Service1.svc/GetUsersCurrentJobsWithDistance/" + userID + "/" + lati + "/" + longi, function(json) {
            $('#CurrentJobsList').empty();
            if (json != '') {
                populateCurrentJobs(json);
            }
            $('#MyJobsCurrentJobsCount').text("(" + json.length + ")");
            updatePendingJobs(userID);
        }).error(function() {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
        });
    };

    var loadMyJobsListfail = function(e) {
        switch (e.code) {
        case 1:
            navigator.notification.alert(
                _('msgGpsDeactivatedMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsDeactivatedTitle'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("User denied the request for Geolocation.");
            break;
        case 2:
            navigator.notification.alert(
                _('msgGpsErrorMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
            break;
        //case 3:
        //    alert("The request to get user location timed out.");
        //    break;
        //case 4:
        //    alert("An unknown error occurred.");
        //    break;
        }

        if (spinner != null) {
            spinnerStop();
        }
    };
    if (testrun) {
        var coords = new Object();
        coords.latitude = 0;
        coords.longitude = 0;

        var currentPos = new Object();
        currentPos.coords = coords;

        loadMyJobsListwin(currentPos);
    } else {
        navigator.geolocation.getCurrentPosition(loadMyJobsListwin, loadMyJobsListfail, { maximumAge: 0, timeout: 10000, enableHighAccuracy: true }); //, timeout:5000, enableHighAccuracy:true
    }

}

//current jobs end
    


//pending jobs start

function updatePendingJobs(userID) {
    var PendingJobsJSON = null;
    $.getJSON(server + "/ws/Service1.svc/GetUsersPendingJobs/" + userID, function(json) {
        $('#divWaitingJobs').find('ul').empty();
        if (json != '') {
            PendingJobsJSON = json;
            populatePendingJobs(PendingJobsJSON);
        }
        $('#MyJobsAwaitingApprovalJobsCount').text("(" + json.length + ")");
        updateCompletedJobs(userID);
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('msgGpsErrorTitle'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

//pending jobs end
//completed jobs start

function updateCompletedJobs(userID) {
    var CompletedJobsJSON = null;

    $.getJSON(server + "/ws/Service1.svc/GetUsersCompletedJobs/" + userID, function(json) {
        $('#divApprovedJobs').find('ul').empty();
        if (json != '') {
            CompletedJobsJSON = json;
            populateCompletedJobs(CompletedJobsJSON);
            noOfCompletedJobs = json.length;
        } else {
            noOfCompletedJobs = 0;
        }
        $('#MyJobsApprovedJobsCount').text("(" + json.length + ")");
        updateRejectedJobs(userID);
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('msgGpsErrorTitle'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

//completed jobs end
//rejected jobs start

function updateRejectedJobs(userID) {
    var RejectedJobsJSON = null;

    $.getJSON(server + "/ws/Service1.svc/GetUsersRejectedJobs/" + userID, function(json) {
        $('#divRejectedJobs').find('ul').empty();
        if (json != '') {
            RejectedJobsJSON = json;
            populateRejectedJobs(RejectedJobsJSON);
        }
        $('#MyJobsRejectedJobsCount').text("(" + json.length + ")");
        if (spinner != null) {
            spinnerStop();
        }
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('msgGpsErrorTitle'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

//rejected jobs end


function populateCurrentJobs(tempJSON) {
    $.each(tempJSON, function(i, item) {

        var title = "";
        if (item.Title.length > 25) {
            title = $.trim(item.Title.substring(0, 22)) + '...';
        } else {
            title = item.Title;
        }

        var desc = "";
        if (item.Description.length > 90) {
            desc = $.trim(item.Description.substring(0, 87)) + '...';
        } else {
            desc = item.Description;
        }

        var address;
        if (item.ShopName != null) {
            address = item.ShopName + ", " + item.Address;
        } else {
            address = item.Address;
        }

        var payment = item.PayAmount + ' kr.';

        if (item.PayAmount == 0) {
            payment = "";
        }

        $('#CurrentJobsList').append(
            '<li id="JobListJobs' + item.ID + '">' +
                '<a class="whiteLi" onclick="showResumeOrAbandonJobMenu(' + item.ID + ')" style="border-left:0px; border-right:0px;">' +
                '<div style="float:left; width:95%;">' +
                '<div>' +
                '<div class="jobText joblistTitle" style="color:black; float:left; font-weight:bold;">'
                + title +
                '</div>' +
                '<div class="jobText joblistDistance" style="color: lightgray; font-size: 12px; margin-left:10px; float:left;">' +
                '(' + item.Distance + ' km)' +
                '</div>' +
                '<br/>' +
                '</div>' +
                '<div>' +
                '<div style="float:left; width:80%;">' +
                '<div class="jobText joblistAddress" style="color: darkgray; font-size: 12px; margin-top:0px; line-height: 1;">' +
                address +
                '</div>' +
                '<div class="joblistDesc" style="color:black; font-size: 12px; float:left; line-height: 1;">' +
                desc +
                '</div>' +
                '</div>' +
                '<div style="float:left; width:20%;">' +
                '<div class="jobText joblistPrice" style="float:left; color: black; margin-top:0px; font-weight:bold; line-height: 16px;">' +
                payment +
                '</div>' +
                '</div>' +
                '<br style="clear:both;"/>' +
                '</div>' +
                '</div>' +
                '<div style="float:right; width:5%; margin-top:5px;">' +
                '<img class="jobListArrow" style="float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow.png" onclick="showJobDetails(' + item.ID + ')" />' +
                '<img class="jobListArrowActive" style=" display: none; float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow-active.png" onclick="showJobDetails(' + item.ID + ')" />' +
                '</div>' +
                '<br style="clear:both;"/>' +
                '</a>' +
                '</li>'
        ); //'<li>' +
        //    '<a class="whiteLi" onclick="showResumeOrAbandonJobMenu(' + item.ID + ');" style="border-left:0px; border-right:0px; height:64px;">' +
        //        '<div class="jobText" style="color:black; float:left;">' + title + '</div> <br style="clear:both;"/>' +//<div class="jobText" style="color: lightgray; font-size: 12px; margin-left:10px; float:left;">(??? km)</div>
        //        '<div style="float:left; width:220px;">' +
        //            '<div class="jobText" style="color: #000000; font-size: 10px; margin-top:0px; line-height: 10px;">' + address + '</div>' +
        //            '<div class="jobText" style="color: #7f7f7f; font-size: 10px; margin-top:0px; line-height: 10px;">' + desc + '</div>' +
        //        '</div>' +
        //        '<img class="jobListArrow" style="float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow.png" onclick="showResumeOrAbandonJobMenu(' + item.ID + ');" />' +
        //        '<img class="jobListArrowActive" style=" display: none; float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow-active.png" onclick="showResumeOrAbandonJobMenu(' + item.ID + ');" />' +
        //        '<div class="jobText" style="float:right; margin-right:20px; color: black; margin-top:6px;" onclick="showResumeOrAbandonJobMenu(' + item.ID + ');">' +
        //            +item.PayAmount + ' kr.' +
        //        '</div>' +
        //        '<br style="clear:both;"/>' +
        //    '</a>' +
        //'</li>');


    });
}

function populatePendingJobs(tempJSON) {
    
    
    $.each(tempJSON, function(i, item) {
        var title = "";
        if (item.Title.length > 25) {
            title = $.trim(item.Title.substring(0, 22)) + '...';
        } else {
            title = item.Title;
        }

        var desc = "";
        if (item.Description.length > 90) {
            desc = $.trim(item.Description.substring(0, 87)) + '...';
        } else {
            desc = item.Description;
        }
        var address;
        if (item.ShopName != null) {
            address = item.ShopName + ", " + item.Address;
        } else {
            address = item.Address;
        }

        $('#divWaitingJobs').find('ul').append(
            '<li>' +
                '<a class="whiteLi" style="border-left:0px; border-right:0px; height:64px;">' +
                '<div class="jobText" style="color:black; float:left;">' + title + '</div> <div class="jobText" style="color: lightgray; font-size: 12px; margin-left:10px; float:left;">(??? km)</div><br style="clear:both;"/>' +
                '<div style="float:left; width:220px;">' +
                '<div class="jobText" style="color: #000000; font-size: 10px; margin-top:0px; line-height: 10px;">' + address + '</div>' +
                '<div class="joblistDesc" style="color: #7f7f7f; font-size: 10px; margin-top:0px; line-height: 10px;">' + desc + '</div>' +
                '<div class="jobText" style="color: #7f7f7f; font-size: 10px; margin-top:10px; line-height: 10px;">' + '(JobID: ' + item.ID + ')</div>' +
                '</div>' +
                '<div class="jobText" style="float:right; margin-right:20px; color: black; margin-top:6px;">' +
                +item.PayAmount + ' kr.' +
                '</div>' +
                '<br style="clear:both;"/>' +
                '</a>' +
                '</li>');
    });
}

function populateCompletedJobs(tempJSON) {

    $.each(tempJSON, function(i, item) {
        var title = "";
        if (item.Title.length > 25) {
            title = $.trim(item.Title.substring(0, 22)) + '...';
        } else {
            title = item.Title;
        }

        var desc = "";
        if (item.Description.length > 90) {
            desc = $.trim(item.Description.substring(0, 87)) + '...';
        } else {
            desc = item.Description;
        }
        var address;
        if (tempJSON.ShopName != null) {
            address = item.ShopName + ", " + item.Address;
        } else {
            address = item.Address;
        }

        $('#divApprovedJobs').find('ul').append(
            '<li>' +
                '<a class="whiteLi" style="border-left:0px; border-right:0px; height:64px;">' +
                '<div class="jobText" style="color:black; float:left;">' + title + '</div> <div class="jobText" style="color: lightgray; font-size: 12px; margin-left:10px; float:left;">(??? km)</div><br style="clear:both;"/>' +
                '<div style="float:left; width:220px;">' +
                '<div class="jobText" style="color: #000000; font-size: 10px; margin-top:0px; line-height: 10px;">' + address + '</div>' +
                '<div class="joblistDesc" style="color: #7f7f7f; font-size: 10px; margin-top:0px; line-height: 10px;">' + desc + '</div>' +
                '</div>' +
                //'<img class="jobListArrow" style="float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow.png" />' +
                //'<img class="jobListArrowActive" style=" display: none; float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow-active.png" />' +
                '<div class="jobText" style="float:right; margin-right:20px; color: black; margin-top:6px;">' +
                +item.PayAmount + ' kr.' +
                '</div>' +
                '<br style="clear:both;"/>' +
                '</a>' +
                '</li>');
    });
}

function populateRejectedJobs(tempJSON) {
    $.each(tempJSON, function(i, item) {
        var title = "";
        if (item.Title.length > 25) {
            title = $.trim(item.Title.substring(0, 22)) + '...';
        } else {
            title = item.Title;
        }
        var desc = "";
        if (item.Description.length > 90) {
            desc = $.trim(item.Description.substring(0, 87)) + '...';
        } else {
            desc = item.Description;
        }
        var address;
        if (item.ShopName != null) {
            address = item.ShopName + ", " + item.Address;
        } else {
            address = item.Address;
        }

        $('#divRejectedJobs').find('ul').append(
            '<li>' +
                '<a class="whiteLi" onclick="showResumeOrAbandonJobMenu(' + item.ID + ');"style="border-left:0px; border-right:0px; height:64px;">' +
                '<div class="jobText" style="color:black; float:left;">' + title + '</div> <div class="jobText" style="color: lightgray; font-size: 12px; margin-left:10px; float:left;">(??? km)</div><br style="clear:both;"/>' +
                '<div style="float:left; width:220px;">' +
                '<div class="jobText" style="color: #000000; font-size: 10px; margin-top:0px; line-height: 10px;">' + address + '</div>' +
                '<div class="joblistDesc" style="color: #7f7f7f; font-size: 10px; margin-top:0px; line-height: 10px;">' + desc + '</div>' +
                '</div>' +
                //'<img class="jobListArrow" style="float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow.png" />' +
                    //'<img class="jobListArrowActive" style=" display: none; float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow-active.png" />' +
                '<div class="jobText" style="float:right; margin-right:20px; color: black; margin-top:6px;">' +
                +item.PayAmount + ' kr.' +
                '</div>' +
                '<br style="clear:both;"/>' +
                '</a>' +
                '</li>');
    });
    if (spinner != null) {
        spinnerStop();
    }
}

function loadJobList(redirect) {
    if (spinner == null) {
        spinnerStart();
    }
    var latLngA;
    var latLngB;
    var dist;
    var loadJobListwin = function(position) {
        currentPos = position;
        var lati = currentPos.coords.latitude;
        var longi = currentPos.coords.longitude;
        //alert("win "+lati+" "+longi);
        //latLngA = new google.maps.LatLng(lati, longi);
        $.getJSON(server + "/ws/Service1.svc/GetJobsWithUserID/" + 1 + "/" + 100 + "/" + 1 + "/" + 100 + "/" + lati + "/" + longi + "/" + window.localStorage["userID"], function(json) {
            if (json != "Nothing found." && json.length > 0) {
                $.each(json, function(i, item) {
                    var title = "";
                    if (item.Title.length > 25) {
                        title = $.trim(item.Title.substring(0, 22)) + '...';
                    } else {
                        title = item.Title;
                    }

                    var desc = "";
                    if (item.Description.length > 90) {
                        desc = $.trim(item.Description.substring(0, 87)) + '...';
                    } else {
                        desc = item.Description;
                    }

                    var address = "";
                    if (item.ShopName != null) {
                        address = item.ShopName + ", " + item.Address;
                    } else {
                        address = item.Address;
                    }
                    //if (address.length > 44) {
                    //    address = $.trim(address.substring(0, 40)) + '...';
                    //} 
                    //$('#divViewJobDetails').find('.header-button-right').click('startJob(' + item.ID + ')');

                    var payment = item.PayAmount + ' kr.';

                    if (item.PayAmount == 0) {
                        payment = "";
                    }

                    $('#divJobListJobs').append(
                        '<li id="JobListJobs' + item.ID + '">' +
                            '<a class="whiteLi" onclick="showJobDetails(' + item.ID + ')" style="border-left:0px; border-right:0px;">' + // height:40px;
                            '<div style="float:left; width:95%;">' +
                            '<div>' +
                            '<div class="jobText joblistTitle" style="color:black; float:left; font-weight:bold;">'
                            + title +
                            '</div>' +
                            '<div class="jobText joblistDistance" style="color: lightgray; font-size: 12px; margin-left:10px; float:left;">' +
                            '(' + item.Distance + ' km)' +
                            '</div>' +
                            '<br/>' +
                            '</div>' +
                            '<div>' +
                            '<div style="float:left; width:80%;">' +
                            '<div class="jobText joblistAddress" style="color: darkgray; font-size: 12px; margin-top:0px; line-height: 1;">' +
                            address +
                            '</div>' +
                            '<div class="joblistDesc" style="color:black; font-size: 12px; float:left;">' +
                            desc +
                            '</div>' +
                            '</div>' +
                            '<div style="float:left; width:20%;">' +
                            '<div class="jobText joblistPrice" style="float:left; color: black; margin-top:0px; font-weight:bold; line-height: 16px;">' +
                            payment +
                            '</div>' +
                            '</div>' +
                            '<br style="clear:both;"/>' +
                            '</div>' +
                            '</div>' +
                            '<div style="float:right; width:5%; margin-top:5px;">' +
                            '<img class="jobListArrow" style="float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow.png" onclick="showJobDetails(' + item.ID + ')" />' +
                            '<img class="jobListArrowActive" style=" display: none; float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow-active.png" onclick="showJobDetails(' + item.ID + ')" />' +
                            '</div>' +
                            '<br style="clear:both;"/>' +
                            '</a>' +
                            '</li>'
                    );
                });
            } else {
                $('#divJobListJobs').append(
                    '<li>' +
                        '<div style="margin-left:-15px; padding: 20px 0 20px 0; text-align:center; font-size:13px; border-bottom: 1px solid #ddd;">' +
                        _('noJobsAvailable') +
                        '</div>' +
                        '</li>'
                );
            }

            $.getJSON(server + "/ws/Service1.svc/GetOccupiedJobsWithUserID/" + 1 + "/" + 100 + "/" + 1 + "/" + 100 + "/" + lati + "/" + longi + "/" + window.localStorage["userID"], function(json) {
                if (json.length > 0) {
                    $('#divJobListJobs').append(
                        '<li style="">' +
                            '<div style="margin-left:-15px; padding: 20px 0 20px 0; text-align:center; font-size:18px; border-bottom: 1px solid #ddd;">' +
                            _('jobsOthersAreWorkingOn') +
                            '</div>' +
                            '</li>'
                    );
                    $.each(json, function(i, item) {

                        var title = "";
                        if (item.Title.length > 25) {
                            title = $.trim(item.Title.substring(0, 22)) + '...';
                        } else {
                            title = item.Title;
                        }

                        var desc = "";
                        if (item.Description.length > 90) {
                            desc = $.trim(item.Description.substring(0, 87)) + '...';
                        } else {
                            desc = item.Description;
                        }

                        var address = "";
                        if (item.ShopName != null) {
                            address = item.ShopName + ", " + item.Address;
                        } else {
                            address = item.Address;
                        }
                        //if (address.length > 44) {
                        //    address = $.trim(address.substring(0, 40)) + '...';
                        //}

                        var payment = item.PayAmount + ' kr.';

                        if (item.PayAmount == 0) {
                            payment = "";
                        }

                        $('#divJobListJobs').append(
                            '<li id="JobListJobs' + item.ID + '">' +
                                '<a class="whiteLi" style="border-left:0px; border-right:0px; height:40px;">' +
                                '<div style="float:left; width:95%;">' +
                                '<div>' +
                                '<div class="jobText joblistTitle" style="color:black; float:left; font-weight:bold;">'
                                + title +
                                '</div>' +
                                '<div class="jobText joblistDistance" style="color: lightgray; font-size: 12px; margin-left:10px; float:left;">' +
                                '(' + item.Distance + ' km)' +
                                '</div>' +
                                '<br/>' +
                                '</div>' +
                                '<div>' +
                                '<div style="float:left; width:80%;">' +
                                '<div class="jobText joblistAddress" style="color: darkgray; font-size: 12px; margin-top:0px; line-height: 1;">' +
                                address +
                                '</div>' +
                                '</div>' +
                                '<div style="float:left; width:20%;">' +
                                '<div class="jobText joblistPrice" style="float:left; color: black; font-weight:bold; line-height: 16px;">' +
                                +payment +
                                '</div>' +
                                '</div>' +
                                '<br style="clear:both;"/>' +
                                '</div>' +
                                '</div>' +
                                '<div style="float:right; width:5%; margin-top:5px;">' +
                                '<img class="jobListArrow" style="float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow.png" />' +
                                '<img class="jobListArrowActive" style=" display: none; float:right; margin-top:8px; height:18px;" src="assets/css/images/arrow-active.png" />' +
                                '</div>' +
                                '<br style="clear:both;"/>' +
                                '</a>' +
                                '</li>'
                        );
                    });
                    if (spinner != null) {
                        spinnerStop();
                    }
                } else {
                    if (spinner != null) {
                        spinnerStop();
                    }
                }
            }).error(function() {
                if (spinner != null) {
                    spinnerStop();
                }
                navigator.notification.alert(
                    _('noConnection'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('msgGpsErrorTitle'), // title
                    _('btnOk')   // buttonLabels
                );
            });
            if (lastListElement != null) {

                $('' + lastListElement).find('a').css('background-image', '-webkit-linear-gradient(#058cf5, #015de6)');
                $('' + lastListElement).find('.jobText').css('color', 'white').css('text-shadow', 'none');
                $('' + lastListElement).find('.jobListArrow').css('display', 'none');
                $('' + lastListElement).find('.jobListArrowActive').css('display', 'block');


                if (redirect == true) {
                    goBack('#divFindJobList');
                    $('.scroll').animate({
                        scrollTop: $('' + lastListElement).position().top - 164
                    }, 'fast');
                } else {
                    $('.scroll').animate({
                        scrollTop: 0
                    }, 'fast');
                }
                setTimeout(function() {
                    $('' + lastListElement).find('a').css('background-image', '');
                    $('' + lastListElement).find('.joblistTitle').css('color', 'black').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistPrice').css('color', 'black').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistDistance').css('color', 'lightgray').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistAddress').css('color', '#000000').css('text-shadow', '');
                    $('' + lastListElement).find('.joblistDesc').css('color', '#7f7f7f').css('text-shadow', '');

                    $('' + lastListElement).find('.jobListArrow').css('display', 'block');
                    $('' + lastListElement).find('.jobListArrowActive').css('display', 'none');
                }, animationTime);

            } else {
                $('.scroll').animate({
                    scrollTop: 0
                }, 'fast');
                if (redirect == true) {
                    goBack('#divFindJobList');
                }
            }
        }).error(function() {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
        });
    };

    var loadJobListfail = function(e) {
        switch (e.code) {
        case 1:
            navigator.notification.alert(
                _('msgGpsDeactivatedMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsDeactivatedTitle'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("User denied the request for Geolocation.");
            break;
        case 2:
            navigator.notification.alert(
                _('msgGpsErrorMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
            break;
        //case 3:
        //    alert("The request to get user location timed out.");
        //    break;
        //case 4:
        //    alert("An unknown error occurred.");
        //    break;
        }

        if (spinner != null) {
            spinnerStop();
        }
    };
    $('#divJobListJobs').empty();
    if (testrun) {
        var coords = new Object();
        coords.latitude = 0;
        coords.longitude = 0;

        var currentPos = new Object();
        currentPos.coords = coords;

        loadJobListwin(currentPos);
    } else {
        navigator.geolocation.getCurrentPosition(loadJobListwin, loadJobListfail, { maximumAge: 0, timeout: 10000, enableHighAccuracy: true }); //, timeout:5000, enableHighAccuracy:true
    }
}

var reservedJobJson;

function reserveJob(json) {
    $.getJSON(server + "/ws/Service1.svc/ReserveJob/" + window.localStorage["userID"] + "/" + json.ID + "/" + appVersion, function(resJson) {
        if (resJson != 'ok') {
            if (spinner != null) {
                spinnerStop();
            }
            //$('#divMenuBG').show();
            //$('#CommitMenu').attr('class', 'menu transition menu-hidden');
            //$('#CommitMenu').hide();
            reserveJobFailedMsg = _(resJson);
            reserveJobFailedMenu();
            //$('#ReserveJobFailed').find('h4').text(resJson);
            //$('#ReserveJobFailed').show();
            //setTimeout(function () {
            //    $('#ReserveJobFailed').attr('class', 'menu transition menu-visible');
            //}, 100);

        } else {
            reservedJobJson = json;
            window.localStorage["reservedJobJson" + json.ID] = JSON.stringify(reservedJobJson);
            $('#currentHead').find('.header-button-right').attr('onclick', '').unbind('click');
            $('#currentHead').find('.header-button-right').find('button').text(_('reserved'));
            $('#currentHead').find('.header-button-right').click(function() {
                if (window.localStorage["userType"] == 0) {
                    reserveJobSuccessMenu();
                } else {
                    goForwardFooter('#divMyJobs');
                }
            });
            $('#currentContent').find('.content-button').attr('onclick', '').unbind('click');
            $('#currentContent').find('.content-button').find('button').text(_('reserved'));
            $('#currentContent').find('.content-button').click(function() {
                if (window.localStorage["userType"] == 0) {
                    reserveJobSuccessMenu();
                } else {
                    goForwardFooter('#divMyJobs');
                }
            });
            if (window.localStorage["userType"] == 0) {
                reserveJobSuccessMenu();
            } else {
                goForwardFooter('#divMyJobs');
            }
        }
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('jobCouldnotBeReserved'), // title
            _('btnOk')   // buttonLabels
        );
    });
    reservedJobJson = json;

}

function checkDistanceToJob(json) {
    var joblat = json.Latitude;
    var joblong = json.Longitude;

    var checkDistanceToJobwin = function(position) {
        var dist = 0;
        if (json.OnSitejob) {
            var lati = position.coords.latitude;
            var longi = position.coords.longitude;
            coordinatesMsg = _('latitude') + ': ' + position.coords.latitude.toFixed(6) + '. ' + _('longitude') + ' ' + position.coords.longitude.toFixed(6);
            var latLngA = new google.maps.LatLng(lati, longi);
            var latLngB = new google.maps.LatLng(joblat, joblong);
            dist = (google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB) / 1000).toFixed(1);
        }
        if (dist <= maxDistanceTooJobKM) {
            //hideResumeOrAbandonJobMenu();
            //hidedivTooFarFromJobMenu();
            if (spinner != null) {
                spinnerStop();
            }

            startJob(json.ID);
        } else {
            //$('#divTooFarFromJobMenuDist').text("stadigt " + dist);
            tooFarFromjobMsg = _('msgTooFarMsgBeforeDist') + dist + _('msgTooFarMsgAfterDist');
            //hideResumeOrAbandonJobMenu();
            if (spinner != null) {
                spinnerStop();
            }
            //showdivTooFarFromJobMenu();

            tooFarFromJobMenu(json.ID);
        }
    };

    var checkDistanceToJobfail = function(e) {
        //hideResumeOrAbandonJobMenu();
        switch (e.code) {
        case 1:
            navigator.notification.alert(
                _('msgGpsDeactivatedMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsDeactivatedTitle'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("User denied the request for Geolocation.");
            break;
        case 2:
            navigator.notification.alert(
                _('msgGpsErrorMsg'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
            break;
        }
        if (spinner != null) {
            spinnerStop();
        }

        //startJob(json.ID);
    };

    navigator.geolocation.getCurrentPosition(checkDistanceToJobwin, checkDistanceToJobfail, { maximumAge: 0, timeout: 10000, enableHighAccuracy: true });
}

var isScrolling = false;
var lastListElement = null;

function showJobDetails(id) {
    if (isScrolling == false) {
        lastListElement = '#JobListJobs' + id;

        $('' + lastListElement).find('a').css('background-image', '-webkit-linear-gradient(#058cf5, #015de6)');
        $('' + lastListElement).find('.jobText').css('color', 'white').css('text-shadow', 'none');
        $('' + lastListElement).find('.joblistDesc').css('color', 'white').css('text-shadow', 'none');
        $('' + lastListElement).find('.jobListArrow').css('display', 'none');
        $('' + lastListElement).find('.jobListArrowActive').css('display', 'block');
        if (spinner == null) {
            spinnerStart();
        }
        $.getJSON(server + "/ws/Service1.svc/GetJobDetails/" + id, function(json) {
            if ($.trim(json) != '') {
                //currentjobJSON = json;
                var posFound = function(position) {
                    var tempJSON = jQuery.parseJSON(window.localStorage["currentJob" + id]);
                    var closeEnough = !json.OnSitejob;
                    var dist = '???';
                    if (position != null) {
                        var lati = position.coords.latitude;
                        var longi = position.coords.longitude;
                        var latLngA = new google.maps.LatLng(lati, longi);
                        var latLngB = new google.maps.LatLng(json.Latitude, json.Longitude);

                        dist = (google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB) / 1000).toFixed(1);
                        if (json.OnSitejob) {
                            closeEnough = dist <= maxDistanceTooJobKM;
                        }
                    }
                    if (tempJSON != null && tempJSON.HasBeenStarted != null && tempJSON.HasBeenStarted == true && tempJSON.ID != null && tempJSON.ID == id) {
                        $('#divViewJobDetails').find('.header-button-right').attr('onclick', '').unbind('click');
                        $('#divViewJobDetails').find('.header-button-right').find('button').text(_('btnStart'));
                        $('#divViewJobDetails').find('.header-button-right').click(function() {
                            goForward('#' + tempJSON.Steps[0].ContentType + "_" + tempJSON.Steps[0].ID);
                        });
                        $('#divViewJobDetails').find('.content-button').attr('onclick', '').unbind('click');
                        $('#divViewJobDetails').find('.content-button').find('button').text(_('btnStartJob'));
                        $('#divViewJobDetails').find('.content-button').click(function() {
                            goForward('#' + tempJSON.Steps[0].ContentType + "_" + tempJSON.Steps[0].ID);
                        });
                    } else {
                        if (closeEnough) {
                            $('#divViewJobDetails').find('.header-button-right').attr('onclick', '').unbind('click');
                            $('#divViewJobDetails').find('.header-button-right').find('button').text(_('btnStart'));
                            $('#divViewJobDetails').find('.header-button-right').click(function() {
                                startJob(json.ID);
                            });
                            $('#divViewJobDetails').find('.content-button').attr('onclick', '').unbind('click');
                            $('#divViewJobDetails').find('.content-button').find('button').text(_('btnStartJob'));
                            $('#divViewJobDetails').find('.content-button').click(function() {
                                startJob(json.ID);
                            });
                        } else {
                            $('#divViewJobDetails').find('.header-button-right').attr('onclick', '').unbind('click');
                            $('#divViewJobDetails').find('.header-button-right').find('button').text(_('btnReserve'));
                            $('#divViewJobDetails').find('.header-button-right').click(function() {
                                if (window.localStorage["userType"] == 0) {
                                    reserveJobMenu(json);
                                } else {
                                    reserveJob(json);
                                }
                            });
                            $('#divViewJobDetails').find('.content-button').attr('onclick', '').unbind('click');
                            $('#divViewJobDetails').find('.content-button').find('button').text(_('btnReserveJob'));
                            $('#divViewJobDetails').find('.content-button').click(function() {
                                if (window.localStorage["userType"] == 0) {
                                    reserveJobMenu(json);
                                } else {
                                    reserveJob(json);
                                }
                            });
                        }
                    }

                    $('#jobDetailsAddress').text(json.Address);
                    if (json.ShopName != null) {
                        $('#jobDetailsShopName').text(json.ShopName);
                        $('#jobDetailsShopName').show();
                    } else {
                        $('#jobDetailsShopName').text('');
                        $('#jobDetailsShopName').hide();
                    }
                    $('#jobDetailsDistance').text(dist);
                    $('#jobDetailsPaymentAmount').text(json.PayAmount);
                    $('#jobDetailsTitel').text(json.Title);
                    $('#jobDetailsDeadline').text(json.Deadline);
                    $('#jobDetailsStartDate').text(json.StartDate);
                    if (json.StartDate != '') {
                        $('#jobDetailsStartDateDiv').hide();
                    }

                    $('#jobDetailsDescription').text(json.Description);
                    $('#jobDetailsID').text(json.ID);

                    goForwardList('#divViewJobDetails'); //goForwardList
                };

                var posNotFound = function (e) {
                    switch (e.code) {
                    case 1:
                        navigator.notification.alert(
                            _('msgGpsDeactivatedMsg'), // message
                            function() {
                            }, // callback to invoke with index of button pressed
                            _('msgGpsDeactivatedTitle'), // title
                            _('btnOk')   // buttonLabels
                        );
                        //alert("User denied the request for Geolocation.");
                        break;
                    case 2:
                        navigator.notification.alert(
                            _('msgGpsErrorMsg'), // message
                            function() {
                            }, // callback to invoke with index of button pressed
                            _('msgGpsErrorTitle'), // title
                            _('btnOk')   // buttonLabels
                        );
                        break;
                    }
                    var tempJSON = jQuery.parseJSON(window.localStorage["currentJob" + id]);
                    if (tempJSON != null && tempJSON.HasBeenStarted != null && tempJSON.HasBeenStarted == true && tempJSON.ID != null && tempJSON.ID == id) {
                        $('#divViewJobDetails').find('.header-button-right').attr('onclick', '').unbind('click');
                        $('#divViewJobDetails').find('.header-button-right').find('button').text(_('btnStart'));
                        $('#divViewJobDetails').find('.header-button-right').click(function() {
                            goForward('#' + tempJSON.Steps[0].ContentType + "_" + tempJSON.Steps[0].ID);
                        });
                        $('#divViewJobDetails').find('.content-button').attr('onclick', '').unbind('click');
                        $('#divViewJobDetails').find('.content-button').find('button').text(_('btnStartJob'));
                        $('#divViewJobDetails').find('.content-button').click(function() {
                            goForward('#' + tempJSON.Steps[0].ContentType + "_" + tempJSON.Steps[0].ID);
                        });
                    } else {
                        $('#divViewJobDetails').find('.header-button-right').attr('onclick', '').unbind('click');
                        $('#divViewJobDetails').find('.header-button-right').find('button').text(_('btnStart'));
                        $('#divViewJobDetails').find('.header-button-right').click(function() {
                            startJob(json.ID);
                        });
                        $('#divViewJobDetails').find('.content-button').find('button').text(_('btnStartJob'));
                        $('#divViewJobDetails').find('.content-button').click(function() {
                            startJob(json.ID);
                        });
                    }
                    $('#jobDetailsAddress').text(json.Address);
                    if (json.ShopName != null) {
                        $('#jobDetailsShopName').text(json.ShopName);
                        $('#jobDetailsShopName').show();
                    } else {
                        $('#jobDetailsShopName').text('');
                        $('#jobDetailsShopName').hide();
                    }
                    $('#jobDetailsDistance').text('???');
                    $('#jobDetailsPaymentAmount').text(json.PayAmount);
                    $('#jobDetailsTitel').text(json.Title);
                    $('#jobDetailsDeadline').text(json.Deadline);
                    $('#jobDetailsDescription').text(json.Description);
                    $('#jobDetailsID').text(json.ID);

                    goForwardList('#divViewJobDetails'); //goForwardList
                };

                navigator.geolocation.getCurrentPosition(posFound, posNotFound, { maximumAge: 0, timeout: 10000, enableHighAccuracy: true });
            }
        }).error(function() {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
        });
    }
}

function validateStep(MustCompleteAllJobs, stepID, contentType, callBack) {

    if (!MustCompleteAllJobs) {
        callBack();
    } else {


        var step = $('#currentContent');
        var conflictingAnswers = false;
        var nothingSelected = false;
        var ok = true;
        if (contentType == 'Text') {
            if ($.trim(step.find('.textAnswer').val()) != '' && step.find('.chkNA').find('.icon-ok').is(":visible")) {
                ok = false;
                conflictingAnswers = true;
            }
        } else if (contentType == 'Comment') {

        } else if (contentType == 'MultipleAnswers') {

            $.each($('#currentContent').find('.answersUL li'), function(j, answer) {
                if ($(answer).find('.customYesNoSelected').length == 0) {
                    nothingSelected = true;
                    // ok = false;
                }
            });

        } else if (contentType == 'YesNo') {
            somethingSelected = false;

            if (step.find('.divStepYesNoYes').parent().find('i').css('display') == 'none') {
            } else {
                somethingSelected = true;
            }

            if (step.find('.divStepYesNoNo').parent().find('i').css('display') == 'none') {
            } else {
                somethingSelected = true;
            }
            if (somethingSelected == false) {
                nothingSelected = true;
                // ok = false;
            }

        } else if (contentType == 'Image') {
            somethingSelected = false;
            if (step.find('.photo1').attr('src') != 'assets/img/camera.png') {
                somethingSelected = true;
            }

            if (step.find('.photo2').attr('src') != 'assets/img/camera.png') {
                somethingSelected = true;
            }

            if (step.find('.photo3').attr('src') != 'assets/img/camera.png') {
                somethingSelected = true;
            }
            //if (somethingSelected == true && step.find('.chkNA').find('.icon-ok').is(":visible")) {
            //    ok = false;
            //    conflictingAnswers = true;
            //}
        }
        if (ok == true) {
            callBack();
        } else {
            if (conflictingAnswers == true) {
                navigator.notification.alert(
                    _('msgConflictingAnswers'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('oops'), // title
                    _('btnOk')   // buttonLabels
                );
            } else if (nothingSelected == true) {
                navigator.notification.alert(
                    _('msgNothingSelected'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('oops'), // title
                    _('btnOk')   // buttonLabels
                );
            }
        }
    }
}

function saveJob(stepNO, callBack) {
    //alert("save");
    var tempJson = currentjobJSON;
    var step = $('#currentContent');
    tempJson.Steps[stepNO].NotInStore = step.find('.chkNA').find('.icon-ok').is(":visible");
    if (tempJson.Steps[stepNO].ContentType == 'Text') {
        tempJson.Steps[stepNO].TextAnswer = step.find('.textAnswer').val();
    } else if (tempJson.Steps[stepNO].ContentType == 'Comment') {
        tempJson.Steps[stepNO].TextAnswer = step.find('.textAnswer').val();
    } else if (tempJson.Steps[stepNO].ContentType == 'MultipleAnswers') {
        $.each(tempJson.Steps[stepNO].Answers, function(j, answer) {
            if (step.find('ul li').eq(j).find('.customYesNoSelected.customYesNoYes').length == 1) {
                answer.Selected = true;
                answer.FollowUpAnswer = step.find('ul li').eq(j).find('.followUpQuestion').val();
            } else if (step.find('ul li').eq(j).find('.customYesNoSelected.customYesNoNo').length == 1) {

                answer.Selected = false;
            } else {
                answer.Selected = null;
            }
            //if (step.find('ul li').eq(j).find('.customYesNoSelected.customYesNoNo').length == 0) {
            //    answer.Selected = true;
            //    answer.FollowUpAnswer = step.find('ul li').eq(j).find('.followUpQuestion').val();
            //}
            //else {
            //    answer.Selected = false;
            //}
        });

    } else if (tempJson.Steps[stepNO].ContentType == 'YesNo') {
        $.each(tempJson.Steps[stepNO].Answers, function(j, answer) {
            if (step.find('ul li').eq(j).find('i').css('display') == 'none') {
                answer.Selected = false;
            } else {
                answer.Selected = true;
            }
        });

    } else if (tempJson.Steps[stepNO].ContentType == 'Image') {
        tempJson.Steps[stepNO].Images = new Array();
        tempJson.Steps[stepNO].Images[0] = '';
        tempJson.Steps[stepNO].Images[1] = '';
        tempJson.Steps[stepNO].Images[2] = '';

        if (step.find('.photo1').attr('src') != 'assets/img/camera.png') {
            tempJson.Steps[stepNO].Images[0] = step.find('.photo1').attr('src');
        }

        if (step.find('.photo2').attr('src') != 'assets/img/camera.png') {
            tempJson.Steps[stepNO].Images[1] = step.find('.photo2').attr('src');
        }

        if (step.find('.photo3').attr('src') != 'assets/img/camera.png') {
            tempJson.Steps[stepNO].Images[2] = step.find('.photo3').attr('src');
        }
    }
    tempJson.Steps[stepNO].NA = step.find('.chkNA').is(':checked');
    window.localStorage["currentJob" + tempJson.ID] = JSON.stringify(tempJson);
    window.localStorage["currentJobStepNO" + tempJson.ID] = stepNO;

    callBack();
}

function abandonJob(id) {
    if (spinner == null) {
        spinnerStart();
    }

    $.getJSON(server + "/ws/Service1.svc/AbandonJob/" + window.localStorage["userID"] + "/" + id, function(resJson) {
        if (resJson != 'ok') {
            //hideAbandonJobConfirmMenu();
            //hidedivTooFarFromJobMenu();

            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _(resJson), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('jobCouldNotBeCancelled'), // title
                _('btnOk')   // buttonLabels
            );
        } else {
            //hideAbandonJobConfirmMenu();
            //hidedivTooFarFromJobMenu();

            //    $('#currentContent').find('ul').empty();
            //hidedivTooFarFromJobMenu();
            setTimeout(function() {
                window.localStorage["currentJob" + id] = null;
                window.localStorage["reservedJobJson" + id] = null;
                window.localStorage["currentJobStepNO" + id] = null;

                updateMyjobs();
                tempJSON = null;
                reservedJobJson = null;
                if (spinner != null) {
                    spinnerStop();
                }
            }, 1000);
        }
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('jobCouldNotBeCancelled'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

function resumeJob(id) {
    //try {
    if (spinner == null) {
        spinnerStart();
    }

    var stepNO = window.localStorage["currentJobStepNO" + id];
    var tempJSON = jQuery.parseJSON(window.localStorage["currentJob" + id]);
    //if (tempJSON != null) {
    //alert(tempJSON.HasBeenStarted + " - " + tempJSON.ID + " - " + id + " - " + tempJSON.LatitudeOnSubmit + " - " + tempJSON.LongitudeOnSubmit + " - " + stepNO);
    //}
    if (tempJSON != null && tempJSON.HasBeenStarted != null && tempJSON.HasBeenStarted == true && tempJSON.ID != null && tempJSON.ID == id && stepNO != null) {
        // alert('local');
        $('#StepDivs').empty();

        currentjobJSON = tempJSON;
        populateSteps(tempJSON, tempJSON.LatitudeOnSubmit, tempJSON.LongitudeOnSubmit, stepNO, true);

    } else {
        $.getJSON(server + "/ws/Service1.svc/GetJobDetails/" + id, function(json) {
            if ($.trim(json) != '') {
                checkDistanceToJob(json);
            }
        }).error(function() {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgGpsErrorTitle'), // title
                _('btnOk')   // buttonLabels
            );
        });
    }
}

function startJob(ID) {
    if (spinner == null) {
        spinnerStart();
    }
    $('#StepDivs').empty();
    $.getJSON(server + "/ws/Service1.svc/ReserveJob/" + window.localStorage["userID"] + "/" + ID + "/" + appVersion, function(resJson) {
        if (resJson != 'ok') {
            if (spinner != null) {
                spinnerStop();
            }
            startJobFailedMsg = _(resJson);
            startJobFailedMenu();
        } 
        else {
            $.getJSON(server + "/ws/Service1.svc/GetJobDetails/" + ID, function (json) {
                if ($.trim(json) != '') {
                    currentjobJSON = json;
                    currentjobJSON.HasBeenStarted = true;
                    window.localStorage["currentJob" + ID] = JSON.stringify(currentjobJSON);
                    checkLocationJobStart(json);
                }
            }).error(function() {
                if (spinner != null) {
                    spinnerStop();
                }
                navigator.notification.alert(
                    _('noConnection'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('msgGpsErrorTitle'), // title
                    _('btnOk')   // buttonLabels
                );
            });
        }
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('msgGpsErrorTitle'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

function populateSteps(json, lati, longi, stepNO, jobResumed) {
    var tempJSON = jQuery.parseJSON(window.localStorage["currentJob" + json.ID]);
    if (tempJSON != null && tempJSON.ID == json.ID) {
        json = tempJSON;
    }

        currentjobJSON.LatitudeOnSubmit = lati;
        currentjobJSON.LongitudeOnSubmit = longi;
        if (!jobResumed) {
            $.each(currentjobJSON.Steps, function(i, item) {
                if (item.ContentType == 'MultipleAnswers') {
                    $.each(item.Answers, function(j, answer) {
                        answer.Selected = null;
                        json.Steps[i].Answers[j].Selected = null;
                    });
                }
            });
        }
    
    window.localStorage["currentJob" + json.ID] = JSON.stringify(currentjobJSON);
    $.each(json.Steps, function(i, item) {
        var step;
        if (item.ContentType == 'Text') {
            step = $('#divStepText').clone();
            step.find('.textAnswer').val(item.TextAnswer);
        } else if (item.ContentType == 'Comment') {
            step = $('#divStepComment').clone();
            //step.find('.chkNA').remove();
            //step.find('.stepQuestionHeader').text('Kommentarer til opgaven');
            //step.find('.stepInstructionsHeader').text('Support');
            step.find('.textAnswer').val(item.TextAnswer);
        } else if (item.ContentType == 'MultipleAnswers') {
            step = $('#divStepMultipleAnswers').clone();
            $.each(item.Answers, function(j, answer) {
                step.find('.stepID').val(item.ID);
                if (answer.FollowUpQuestion != null && $.trim(answer.FollowUpQuestion) != '') {
                    step.find('.answersUL').append(
                        '<li data-val="' + answer.ID + '">' +
                            '<a class="greyLi" style="color:black; border-color:#ababab; min-height:40px; overflow:hidden; " >' +
                            '<div style=" float:left;">' + //
                            '<img onclick="showProductImage(\'http://images.jobwalk.dk/products/' + answer.Barcode + '.jpg?w=240&h=240&mode=max\', ' + answer.Barcode + ',\'' + answer.Value + '\',\'' + answer.ID + '\',\'' + item.ID + '\')" class="descImageThumb" width="30px" height="30px" style="padding-right:10px;' + (answer.Barcode == '' ? 'display:none;' : '') + '" src="assets/img/showProduct.png" />' +
                            '</div>' +
                            '<div style=" float:left;">' +
                            '<div class="jobText" style="line-height:20px; color:black; width:183px; font-size:14px;">' + answer.Value + '</div>' +
                            '<div class="jobText" style="color: #000000; font-size: 12px; margin-top:0px; line-height: 10px;">' + (answer.HelpText == "" ? (answer.Barcode == "" ? "" : _('barcode')) : answer.HelpText) + ' ' + answer.Barcode + '</div>' +
                            '</div>' +                            
                            '<div class="customYesNoNo" onclick="customYesNo(this);">' +
                            '<div class="customYesNoText">' +
                            _('no') +
                            '</div>' +
                            '</div>' +
                            '<div class="customYesNoYes" onclick="customYesNo(this);">' +
                            '<div class="customYesNoText">' +
                            _('yes') +
                            '</div>' +
                            '</div>' +
                            '<i class="icon-ok" style="float:right; margin-top: 13px; display:none;"></i>' +
                            '</a>' +
                            '<input class="followUpQuestion" type="text" style="display:none; border-radius:0px; border-bottom-right-radius: 4px; border-bottom-left-radius: 4px; width:286px; margin-bottom:5px;" placeholder="' + answer.FollowUpQuestion + '" />' +
                            '</li>'
                    ); //bredden paa followUpQuestion skal vaere 286, det ser fucked ud i browseren men paa mobilen ser det rigtigt ud
                } else {
                    step.find('.answersUL').append(
                        '<li data-val="' + answer.ID + '">' +
                            '<a class="greyLi" style="color:black; border-color:#ababab; min-height:40px; overflow:hidden; " >' + //position:relative;
                            '<div style=" float:left;">' + //
                            '<img onclick="showProductImage(\'http://images.jobwalk.dk/products/' + answer.Barcode + '.jpg?w=240&h=240&mode=max\', ' + answer.Barcode + ',\'' + answer.Value + '\',\'' + answer.ID + '\',\'' + item.ID + '\')" class="descImageThumb" width="30px" height="30px" style="padding-right:10px;' + (answer.Barcode == '' ? 'display:none;' : '') + '" src="assets/img/showProduct.png" />' +
                            '</div>' +
                            '<div style=" float:left;">' +
                            '<div class="jobText" style="line-height:20px; color:black; width:183px; font-size:14px;">' + answer.Value + '</div>' +
                            '<div class="jobText" style="color: #000000; font-size: 12px; margin-top:0px; line-height: 10px;">' + (answer.HelpText == "" ? (answer.Barcode == "" ? "" : _('barcode')) : answer.HelpText) + ' ' + answer.Barcode + '</div>' +
                            '</div>' +                            
                            '<div class="customYesNoNo" onclick="customYesNo(this);">' +
                            '<div class="customYesNoText">' +
                            _('no') +
                            '</div>' +
                            '</div>' +
                            '<div class="customYesNoYes" onclick="customYesNo(this);">' +
                            '<div class="customYesNoText">' +
                            _('yes') +
                            '</div>' +
                            '</div>' +                            
                            '<i class="icon-ok" style="float:right; margin-top: 13px; display:none;"></i>' +
                            '</a>' +
                            '</li>'
                    );
                }
            });
            if (jobResumed) {
                $.each(item.Answers, function(j, answer) {
                    if (answer.Selected == null || answer.Selected == false) {
                        step.find('ul li').eq(j).find('.customYesNoNo').addClass('customYesNoSelected');
                    }
                    if (answer.Selected == true) {
                        step.find('ul li').eq(j).find('.customYesNoYes').addClass('customYesNoSelected');
                        if (step.find('ul li').eq(j).find('.followUpQuestion') != null) {
                            step.find('ul li').eq(j).find('.followUpQuestion').toggle();
                            step.find('ul li').eq(j).find('.followUpQuestion').val(answer.FollowUpAnswer);
                        }
                    }
                });
            }
            step.find('.answersUL').find('.customYesNoYes').each(function() { //fastbutton
                new FastButton(this, goSomewhere);
                $(this).height(realHeigth($(this).parent().find('div:nth-child(2)')) + 16);
                $(this).find('.customYesNoText').css('margin-top', (realHeigth($(this).parent().find('div:nth-child(2)')) - 4) / 2);
            });
            step.find('.answersUL').find('.customYesNoNo').each(function() { //fastbutton
                new FastButton(this, goSomewhere);
                $(this).height(realHeigth($(this).parent().find('div:nth-child(2)')) + 16);
                $(this).find('.customYesNoText').css('margin-top', (realHeigth($(this).parent().find('div:nth-child(2)')) - 4) / 2);
            });

            step.find('.answersUL').find('.descImageThumb').each(function() { //fastbutton
                new FastButton(this, goSomewhere);
                $(this).css('margin-top', (realHeigth($(this).parent().parent().find('div:nth-child(2)')) - 34) / 2);
            });
        } else if (item.ContentType == 'YesNo') {
            step = $('#divStepYesNo').clone();
            $(step).find('.divStepYesNoYes').text(item.Answers[0].Value);
            $(step).find('.divStepYesNoNo').text(item.Answers[1].Value);
            if (item.Answers[0].Selected == null || item.Answers[0].Selected == false) {
            } else {
                step.find('.divStepYesNoYes').parent().find('i').toggle();
            }
            if (item.Answers[1].Selected == false) {
            } else {
                step.find('.divStepYesNoNo').parent().find('i').toggle();
            }
            step.find('.divStepYesNoYes').closest("li").each(function() { //fastbutton
                new FastButton(this, goSomewhere);
            });

            step.find('.divStepYesNoNo').closest("li").each(function() { //fastbutton
                new FastButton(this, goSomewhere);
            });
        } else if (item.ContentType == 'Image') {
            step = $('#divStepPhoto').clone();
            step.find('.photo1').attr("id", item.ContentType + "_" + item.ID + "_photo1");
            //if (item.Images != null && item.Images[0] != null && item.Images[0] != "") {
            if (item.Images != null && item.Images[0]) {
                step.find('.photo1').attr('src', item.Images[0]);
            }
            step.find('.photo2').attr("id", item.ContentType + "_" + item.ID + "_photo2");
            if (item.Images != null && item.Images[1]) {
                step.find('.photo2').attr('src', item.Images[1]);
            }
            step.find('.photo3').attr("id", item.ContentType + "_" + item.ID + "_photo3");
            if (item.Images != null && item.Images[2]) {
                step.find('.photo3').attr('src', item.Images[2]);
            }
        }
        if (item.NotInStore != null && item.NotInStore == true) {
            step.find('.chkNA').find('.icon-ok').show();
        }
        step.find('.chkNA').find('li').each(function () { //fastbutton
            new FastButton(this, goSomewhere);
        });
        step.attr("id", item.ContentType + "_" + item.ID);
        step.find('.question').html(parseLineBreaks(item.Description));
        if (item.Instructions != null) {
            step.find('.instructions').html(parseLineBreaks(item.Instructions));
        }
        if (item.ContentType != 'Comment') {
            step.find('.head').find('h1').text(_('stepXofYFirstPart') + (i + 1) + _('stepXofYSecondPart') + (json.Steps.length - 1));
        }
        //step.find('.stepNO').html("L\u00F8s trin " + (i + 1));
        if (item.ContentType == 'Comment') {
            step.find('.stepNO').html(_('anyComments'));
        } else {
            step.find('.stepNO').html(_('readInstructionsAtBottom'));
        }
        if (i == 0) { //first
            step.find('.header-back-button').attr('onclick', '').unbind('click');
            //step.find('.header-back-button').click(function () { goBack('#divViewJobDetails'); });
            step.find('.header-back-button').click(function() {
                saveJob(i, function() {
                    showJobDetails(json.ID);
                });
            });
            step.find('.header-back-button').find('button').text(_('details'));
        } else {
            step.find('.header-back-button').attr('onclick', '').unbind('click');
            step.find('.header-back-button').click(function() {
                saveJob(i, function() {
                    goBack('#' + currentjobJSON.Steps[i - 1].ContentType + "_" + currentjobJSON.Steps[i - 1].ID);
                });
            });
            step.find('.header-back-button').find('button').text(_('step') + (i));
        }
        if (i == json.Steps.length - 1) { //last
            lastStep = '#' + json.Steps[i].ContentType + "_" + json.Steps[i].ID;
            step.find('.header-button-right').attr('onclick', '').unbind('click');
            //step.find('.header-button-right').click(function () { finishJob('#' + item.ContentType + "_" + item.ID); });
            step.find('.header-button-right').click(function() {
                validateStep(currentjobJSON.MustCompleteAllJobs, '#' + currentjobJSON.Steps[i].ContentType + "_" + currentjobJSON.Steps[i].ID, currentjobJSON.Steps[i].ContentType, function() {
                    saveJob(i, function() {
                        showCommitMenu();
                    });
                });
            });
            step.find('.header-button-right').find('button').html(_('btnProceed'));
        } else {
            step.find('.header-button-right').attr('onclick', '').unbind('click');
            step.find('.header-button-right').click(function() {
                validateStep(currentjobJSON.MustCompleteAllJobs, '#' + currentjobJSON.Steps[i].ContentType + "_" + currentjobJSON.Steps[i].ID, currentjobJSON.Steps[i].ContentType, function() {
                    saveJob(i, function() {
                        goForward('#' + currentjobJSON.Steps[i + 1].ContentType + "_" + currentjobJSON.Steps[i + 1].ID);
                    });
                });
            });
            if ((i) < (json.Steps.length - 2)) {
                step.find('.header-button-right').find('button').text(_('step') + (i + 2));
            } else {
                step.find('.header-button-right').find('button').text(_('btnProceed'));
            }

        }
        step.find('.footerButtonMyJobs').unbind('click');
        step.find('.footerButtonMyJobs').click(function() {
            saveJob(i, function() {
                goForwardFooter('#divMyJobs');
            });
        });
        step.find('.footerButtonProfile').unbind('click');
        step.find('.footerButtonProfile').click(function() {
            saveJob(i, function() {
                goForwardFooter('#divMyProfile');
            });
        });
        step.find('.footerButtonAllJobs').unbind('click');
        step.find('.footerButtonAllJobs').click(function() {
            saveJob(i, function() {
                goForwardFooter('#divFindJobList');
            });
        });

        $('#StepDivs').append(step);
        //Text,
        //Image,
        //Video,
        //YesNo,
        //MultipleAnswers,
        //SoundClip,
        //Questionaire
        if (i == json.Steps.length - 1) {
            bindTouch();

            //if (spinner != null) {
            //    spinnerStop();
            //}
            goForward('#' + json.Steps[stepNO].ContentType + "_" + json.Steps[stepNO].ID);
        }
    });
}

var lastStep = '';

function parseLineBreaks($text) {
    if ($text == null) {
        return '';
    } else {
        $text = $text.replace(/\r\n/g, "<br/>");
        $text = $text.replace(/\n/g, "<br/>");
        $text = $text.replace(/\r/g, "<br/>");
        return $text;
    }
}

function finishJob() {

    //puts the last step back to its original div so we can extract the values

    var oldHead = $('#currentHead').find(".head");
    var oldContent = $('#currentContent').find(".content");
    var oldFoot = $('#currentFoot').find(".foot");

    $(oldContent).attr('class', 'content stage-left transition');

    $(oldHead).appendTo($(globalCurrentDiv));
    $(oldContent).appendTo($(globalCurrentDiv));
    $(oldFoot).appendTo($(globalCurrentDiv));

    uploadJob();
}

function goToMissingStep() {
    var item = $(currentjobJSON.Steps).get($(IncompleteSteps).get(0) - 1);
    goBack('#' + item.ContentType + "_" + item.ID);
}

function goToAllJobs(sender) {
    //$(sender).css('background-image', 'url(assets/css/images/alljobs-dark.png)');
    goForwardFooter('#divFindJobList');
    //setTimeout(function () {
    //    $(sender).css('background-image', 'url(assets/css/images/alljobs.png)');
    //}, animationTime);
}

function goToMyProfile(sender) {
    //$(sender).css('background-image', 'url(assets/css/images/myprofile-active.png)');
    goForwardFooter('#divMyProfile');
    //setTimeout(function () {
    //    $(sender).css('background-image', 'url(assets/css/images/myprofile.png)');
    //}, animationTime);
}

function goToMyJobs(sender) {
    //$(sender).css('background-image', 'url(assets/css/images/myjobs-active.png)');
    goForwardFooter('#divMyJobs');
    //setTimeout(function () {
    //    $(sender).css('background-image', 'url(assets/css/images/myjobs.png)');
    //}, animationTime);
}

var IncompleteSteps = new Array();
var FilesToUpload = new Array();
var FilesToUploadIndex = 0;
var loadbarPercent;

function uploadJob() {

    $('#CommitMenuUploading').find('p').text(_('compressingData'));
    $('#CommitMenuUploading').find('.bar').css('width', '0%');

    FilesToUpload = new Array();
    FilesToUploadIndex = 0;
    loadbarPercent = null;
    IncompleteSteps = new Array();

    $('#divMenuBG').show();
    $('#CommitFailed').hide();
    $('#CommitMenu').show();

    setTimeout(function() {
        $('#CommitMenu').attr('class', 'menu transition menu-visible');
    }, 100);
    $('#CommitMenuContent').hide();
    $('#CommitMenuUploading').show();

    //$('#CommitMenuUploading').find('.bar').css('width', '100%');
    var imgError = false;
    $.each(currentjobJSON.Steps, function(i, item) {
        var step = $('#' + item.ContentType + "_" + item.ID);
        if (item.ContentType == 'Text') {
            item.TextAnswer = step.find('.textAnswer').val();
            //if ($.trim(item.TextAnswer) =='' && step.find('.chkNA').is(':checked')==false) {
            if ($.trim(item.TextAnswer) == '' && step.find('.chkNA').find('.icon-ok').css('display') == 'none') {
                IncompleteSteps[IncompleteSteps.length] = i + 1;
            }
        } else if (item.ContentType == 'Comment') {
            item.TextAnswer = step.find('.textAnswer').val();
            //if ($.trim(item.TextAnswer) =='' && step.find('.chkNA').is(':checked')==false) {
        } else if (item.ContentType == 'MultipleAnswers') {

            $.each(item.Answers, function(j, answer) {
                var somethingSelected = false;
                if (step.find('ul li').eq(j).find('.customYesNoSelected.customYesNoYes').length == 1) {
                    answer.Selected = true;
                    somethingSelected = true;
                    answer.FollowUpAnswer = step.find('ul li').eq(j).find('.followUpQuestion').val();
                } else if (step.find('ul li').eq(j).find('.customYesNoSelected.customYesNoNo').length == 1) {
                    somethingSelected = true;
                    answer.Selected = false;
                } else {
                    answer.Selected = null;
                }
                //if (somethingSelected == false && step.find('.chkNA').is(':checked') == false) {
                if (somethingSelected == false) { // && step.find('.chkNA').find('.icon-ok').css('display') == 'none') {
                    if (jQuery.inArray(i + 1, IncompleteSteps) == -1) {
                        IncompleteSteps[IncompleteSteps.length] = i + 1;
                    }
                }
            });


        } else if (item.ContentType == 'YesNo') {
            somethingSelected = false;

            if (step.find('.divStepYesNoYes').parent().find('i').css('display') == 'none') {
                item.Answers[0].Selected = false;
            } else {
                somethingSelected = true;
                item.Answers[0].Selected = true;
            }

            if (step.find('.divStepYesNoNo').parent().find('i').css('display') == 'none') {
                item.Answers[1].Selected = false;
            } else {
                somethingSelected = true;
                item.Answers[1].Selected = true;
            }
            //$.each(item.Answers, function (j, answer) {
            //    if (step.find('ul li').eq(j).find('i').css('display') == 'none') {
            //        answer.Selected = false;
            //        console.log("false");
            //    }
            //    else {
            //        somethingSelected = true;
            //        answer.Selected = true;
            //        console.log("true");
            //    }
            //});
            //if (somethingSelected == false && step.find('.chkNA').is(':checked') == false) {
            if (somethingSelected == false) { //&& step.find('.chkNA').find('.icon-ok').css('display') == 'none') {

                IncompleteSteps[IncompleteSteps.length] = i + 1;
            }

        } else if (item.ContentType == 'Image') {
            item.Images = new Array();
            item.Images[0] = '';
            item.Images[1] = '';
            item.Images[2] = '';
            if (!imgError && !ImageExist(step.find('.photo1').attr('src'))) {
                imgError = true;
                $('#CommitMenu').attr('class', 'menu transition menu-hidden');
                $('#CommitMenu').hide();
                $('#CommitMenuUploading').hide();
                $('#divMenuBG').hide();
                navigator.notification.alert(
                    _('couldNotFindImagePart1') + '1' + _('couldNotFindImagePart2') + (i + 1) + _('couldNotFindImagePart3'), // message
                    function() { goBack('#' + item.ContentType + "_" + item.ID); }, // callback to invoke with index of button pressed
                    'Fejl ved billedet', // title
                    _('btnOk')   // buttonLabels
                );
            }
            if (step.find('.photo1').attr('src') != 'assets/img/camera.png') {
                item.Images[0] = "userphoto";
                //uploadPhoto(step.find('.photo1').attr('src'), currentjobJSON.ID, item.ID,1);
                FilesToUpload[FilesToUpload.length] = { imageURI: step.find('.photo1').attr('src'), jobID: currentjobJSON.ID, stepID: item.ID, photoNO: 1 };
            }
            if (!imgError && !ImageExist(step.find('.photo2').attr('src'))) {
                imgError = true;
                $('#CommitMenu').attr('class', 'menu transition menu-hidden');
                $('#CommitMenu').hide();
                $('#CommitMenuUploading').hide();
                $('#divMenuBG').hide();
                navigator.notification.alert(
                    _('couldNotFindImagePart1') + '2' + _('couldNotFindImagePart2') + (i + 1) + _('couldNotFindImagePart3'), // message
                    function() { goBack('#' + item.ContentType + "_" + item.ID); }, // callback to invoke with index of button pressed
                    'Fejl ved billedet', // title
                    _('btnOk')   // buttonLabels
                );
            }
            if (step.find('.photo2').attr('src') != 'assets/img/camera.png') {
                item.Images[1] = "userphoto";
                //uploadPhoto(step.find('.photo2').attr('src'), currentjobJSON.ID, item.ID, 2);
                FilesToUpload[FilesToUpload.length] = { imageURI: step.find('.photo2').attr('src'), jobID: currentjobJSON.ID, stepID: item.ID, photoNO: 2 };
            }
            if (!imgError && !ImageExist(step.find('.photo3').attr('src'))) {
                imgError = true;
                $('#CommitMenu').attr('class', 'menu transition menu-hidden');
                $('#CommitMenu').hide();
                $('#CommitMenuUploading').hide();
                $('#divMenuBG').hide();
                navigator.notification.alert(
                    _('couldNotFindImagePart1') + '3' + _('couldNotFindImagePart2') + (i + 1) + _('couldNotFindImagePart3'), // message
                    function() { goBack('#' + item.ContentType + "_" + item.ID); }, // callback to invoke with index of button pressed
                    _('errorWithImage'), // title
                    _('btnOk')   // buttonLabels
                );
            }
            if (step.find('.photo3').attr('src') != 'assets/img/camera.png') {
                item.Images[2] = "userphoto";
                //uploadPhoto(step.find('.photo3').attr('src'), currentjobJSON.ID, item.ID, 3);
                FilesToUpload[FilesToUpload.length] = { imageURI: step.find('.photo3').attr('src'), jobID: currentjobJSON.ID, stepID: item.ID, photoNO: 3 };
            }
            //if (FilesToUpload.length == 0 && step.find('.chkNA').is(':checked') == false) {
            if (FilesToUpload.length == 0 && step.find('.chkNA').find('.icon-ok').css('display') == 'none') {
                IncompleteSteps[IncompleteSteps.length] = i + 1;
            }
        }
    });
    if (!imgError) {
        if (currentjobJSON.MustCompleteAllJobs && IncompleteSteps.length > 0) {
            var bla = '';
            jQuery.each(IncompleteSteps, function() {
                bla += this + ' ';
            });

            setTimeout(function() {
                $('#CommitMenu').attr('class', 'menu transition menu-hidden');
                $('#CommitMenu').hide();
                $('#CommitMenuUploading').hide();
                $('#CommitMenuContent').show();
                missingStepsMsg = bla;
                missingStepsMenu();
                $('#divMenuBG').hide();
                //$('#DivCommitMissingSteps').text(bla);
                //$('#CommitMissingSteps').show();
                //setTimeout(function () {
                //    $('#CommitMissingSteps').attr('class', 'menu transition menu-visible');
                //}, 100);
            }, 1000);
        } else {
            loadbarPercent = 100 / (FilesToUpload.length + 1);
            uploadPhoto();
        }
    }
}

function ImageExist(url) {
    var img = new Image();
    img.src = url;
    console.log(url + " " + img.height);
    return img.height != 0;
}

function uploadPhoto() {
    //$('#CommitMenuUploading').find('.bar').css('width', (loadbarPercent * FilesToUploadIndex)+'%');
    console.log('uploadPhoto');
    if (FilesToUploadIndex < FilesToUpload.length) {
        console.log('billede ' + FilesToUploadIndex + ' af ' + FilesToUpload.length);
        if (ImageExist(FilesToUpload[FilesToUploadIndex].imageURI)) {

            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = FilesToUpload[FilesToUploadIndex].imageURI.substr(FilesToUpload[FilesToUploadIndex].imageURI.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            //options.chunkedMode = false;


            //var params = new Object();
            //params.value1 = "test";
            //params.value2 = "param";

            //options.params = params;
            var ft = new FileTransfer();

            ft.onprogress = function(result) {
                var percent = (result.loaded / result.total) * (loadbarPercent * FilesToUploadIndex);
                percent = Math.round(percent);
                $('#CommitMenuUploading').find('p').html(_('uploadingPhoto') + (FilesToUploadIndex + 1) + ". <br/>" + (result.loaded / 1024).toFixed(1) + _('kbOf') + (result.total / 1000).toFixed(1) + _('kbSent'));
                $('#CommitMenuUploading').find('.bar').css('width', percent + '%');
                //console.log('Downloaded:  ' + percent + '%');
            };

            ft.upload(FilesToUpload[FilesToUploadIndex].imageURI, server + "/AppImageHandler.ashx?jobID=" + FilesToUpload[FilesToUploadIndex].jobID +
                "&stepID=" + FilesToUpload[FilesToUploadIndex].stepID +
                "&photoNO=" + FilesToUpload[FilesToUploadIndex].photoNO, uploadPhotowin, uploadPhotofail, options);
        } else {
            var error = new Object();
            error.code = _('problemWithImage') + " '" + FilesToUpload[FilesToUploadIndex].imageURI + "'";

            uploadPhotofail(error);
        }
    } else {
        upload();
    }
}

function uploadPhotowin(r) {
    //alert("Code = " + r.responseCode);
    //alert("Response = " + r.response);
    //alert("Sent = " + r.bytesSent);
    //alert("upload af photo" + FilesToUploadIndex + " done");
    FilesToUploadIndex++;
    uploadPhoto();
}

function uploadPhotofail(error) {
    //alert("An error has occurred: Code = " + error.code);
    //alert("upload error source " + error.source);
    //alert("upload error target " + error.target);
    //alert(_('problemWithImageUpload')+" - "+error.code);
    uploadFailedMenu();
    FilesToUpload = new Array();
    FilesToUploadIndex = 0;
    loadbarPercent = null;
    setTimeout(function() {
        $('#CommitMenu').attr('class', 'menu transition menu-hidden');
        $('#CommitMenu').hide();
        $('#CommitMenuUploading').hide();
        $('#divMenuBG').hide();
        //$('#CommitMenuContent').show();
        //$('#CommitFailed').show();
        //setTimeout(function () {
        //    $('#CommitFailed').attr('class', 'menu transition menu-visible');
        //}, 100);
    }, 1000);
}

function upload() {
    $('#CommitMenuUploading').find('p').text("Afslutter upload");
    // This is the URL that is used for the service.
    var serviceUrl = server + "/ws/Service1.svc/UploadJSON";

    $.ajax({
        type: "POST",
        url: serviceUrl,
        contentType: "application/json; charset=utf-8",

        // Stringify the userInfo to send a string representation of the JSON Object
        data: JSON.stringify(currentjobJSON),
        dataType: "json",
        success: function(msg) {
            //alert(msg);
            window.localStorage["currentJob" + currentjobJSON.ID] = null;
            $('#StepDivs').empty();
            FilesToUpload = new Array();
            FilesToUploadIndex = 0;
            loadbarPercent = null;            

            
            $('#CommitMenuUploading').find('p').text("F\u00E6rdig");
            $('#CommitMenuUploading').find('.bar').css('width', '100%');
            setTimeout(function() {
                $('#CommitMenu').attr('class', 'menu transition menu-hidden');
                $('#CommitMenu').hide();
                $('#CommitMenuUploading').hide();
                $('#CommitMenuContent').show();
                $('#CommitComplete').show();
                if (window.localStorage["userType"] == 0) {
                    $.getJSON(server + "/ws/Service1.svc/GetUsersCompletedJobs/" + window.localStorage["userID"], function(json) {

                        if (json != '' && json.length > 0) {
                            $('#CommitCompleteText').html(_('jobComplete'));
                        } else {
                            $('#CommitCompleteText').text(_('firstJobComplete'));
                        }
                    });
                } else {
                    $('#CommitCompleteText').text('Jobbet er modtaget');
                }

                //if (noOfCompletedJobs < 1) {
                //    $('#CommitCompleteText').html('Du har udf\u00F8rt din f\u00F8rste opgave. Vi har sendt en mail hvor du kan l\u00E6se mere om hvorn\u00E5r vi gennemser dine besvarelser.');
                //} else {
                //    $('#CommitCompleteText').text('N\u00E5r besvarelsen er godkendt s\u00E6tter vi betalingen ind p\u00E5 din Jobwalk konto. Du modtager en email indenfor 24 timer.');
                //}

                window.localStorage["currentJob" + currentjobJSON.ID] = null;
                window.localStorage["reservedJobJson" + currentjobJSON.ID] = null;
                window.localStorage["currentJobStepNO" + currentjobJSON.ID] = null;

                setTimeout(function() {
                    $('#CommitComplete').attr('class', 'menu transition menu-visible');
                    //setTimeout(function () {
                    //    $('#CommitMenuUploading').find('p').text("Uploader");
                    //    $('#CommitMenuUploading').find('.bar').css('width', '0%');
                    //}, 1000);
                }, 100);
            }, 1000);
        },
        error: function(msg) {
            // navigator.notification.alert(
            //    _('noConnection'),               // message
            //    function () { }, // callback to invoke with index of button pressed
            //    _('msgGpsErrorTitle'), // title
            //    _('btnOk')   // buttonLabels
            //);

            uploadFailedMenu();

            FilesToUpload = new Array();
            FilesToUploadIndex = 0;
            loadbarPercent = null;
            setTimeout(function() {
                $('#CommitMenu').attr('class', 'menu transition menu-hidden');
                $('#CommitMenu').hide();
                $('#CommitMenuUploading').hide();
                $('#divMenuBG').hide();
                // $('#CommitMenuContent').show();
                //$('#CommitFailed').show();
                //setTimeout(function () {
                //    $('#CommitFailed').attr('class', 'menu transition menu-visible');
                //}, 100);
            }, 1000);
        }
    });
}

function customCheck(btn) {
    var parent = $(btn).closest("li");
    if ($(parent).attr('checked') == null) {
        $(parent).attr('checked', 'true');
        $(parent).find('.icon-ok').show();
        if ($(parent).find('.followUpQuestion') != null) {
            $(parent).find('.followUpQuestion').show();
        }
    } else if ($(parent).attr('checked') == 'checked') {
        $(parent).removeAttr('checked');
        $(parent).find('.icon-ok').hide();
        if ($(parent).find('.followUpQuestion') != null) {
            $(parent).find('.followUpQuestion').hide();
        }
    }
    //$(btn).css('background-image', 'none !important!');
}

function customRadio(btn) {
    var lis = $(btn).closest("li").parent().children('li');
    $(lis).each(function() {
        $(this).removeAttr('checked');
        $(this).find('.icon-ok').hide();
    });

    $(btn).closest("li").attr('checked', 'true');
    $(btn).closest("li").find('.icon-ok').show();
    //$(btn).css('background-image', 'none !important!');
}

function customYesNo(btn) {
    if ($(btn).hasClass('customYesNoSelected')) {
        $(btn).removeClass('customYesNoSelected');
    } else {
        $.each($(btn).parent().find('.customYesNoSelected'), function(i, item) {
            $(item).removeClass('customYesNoSelected');
        });
        $(btn).addClass('customYesNoSelected');

    }
}

function showdivTooFarFromJobMenu(id) {
    OrAbandonJobID = id;
    setTimeout(function() {
        $('#divMenuBG').show();

        //var bottom = ($(document).height() - realHeigth($('#divAbandonJobConfirmMenu'))) / 2;
        var bottom = ($(document).height() - realHeigth($('#divTooFarFromJobMenu').find('div'))) / 2;
        $('#divTooFarFromJobMenu').css("bottom", bottom);
        $('#divTooFarFromJobMenu').show();
        setTimeout(function() {
            $('#divTooFarFromJobMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hidedivTooFarFromJobMenu() {
    $('#divTooFarFromJobMenu').attr('class', 'menu transition menu-hidden');
    setTimeout(function() {
        $('#divTooFarFromJobMenu').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showdivResetPasswordMenu() {
    setTimeout(function() {
        $('#divMenuBG').show();

        //var bottom = ($(document).height() - realHeigth($('#divAbandonJobConfirmMenu'))) / 2;
        var bottom = ($(document).height() - realHeigth($('#divResetPasswordMenu').find('div'))) / 2;
        $('#divResetPasswordMenu').css("bottom", bottom);
        $('#divResetPasswordMenu').show();
        setTimeout(function() {
            $('#divResetPasswordMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hidedivResetPasswordMenu() {
    $('#divResetPasswordMenu').attr('class', 'menu transition menu-hidden');
    setTimeout(function() {
        $('#divResetPasswordMenu').hide();
        $('#divMenuBG').hide();
    }, 100);
}

//function showProductImage(imgUrl) {
//    $('#ProductImageImg').attr('src', imgUrl);
//    $('#ProductImageBarCodeDiv').hide();
//    setTimeout(function () {
//        $('#divMenuBG').show();
//        $('#divProductImage').show();
//        setTimeout(function () {
//            $('#divProductImage').attr('class', 'menu transition menu-visible');
//        }, 100);
//    }, 300);
//}

function showProductImage(imgUrl, barCode, product, answerID, stepID) {
    $('#ProductImageImg').attr('src', imgUrl);
    $('#ProductImageBarCode').text(barCode);
    $('#ProductImageProductName').text(product);
    $('#ProductImageAnswerID').val(answerID);
    $('#ProductImageStepID').val(stepID);

    if (barCode == null) {
        $('#ProductImageBarCodeDiv').hide();
    } else {
        $('#ProductImageBarCodeDiv').show();
    }

    setTimeout(function() {
        $('#divMenuBG').show();
        $('#divProductImage').show();
        setTimeout(function() {
            $('#divProductImage').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function productImageSetAnswer(exist) {
    if (exist) {
        customYesNo($('input[value="' + $('#ProductImageStepID').val() + '"]').parent().find('.answersUL').find("[data-val='" + $('#ProductImageAnswerID').val() + "']").find('.customYesNoYes'));
        hideProductImage();
    } else {
        customYesNo($('input[value="' + $('#ProductImageStepID').val() + '"]').parent().find('.answersUL').find("[data-val='" + $('#ProductImageAnswerID').val() + "']").find('.customYesNoNo'));
        hideProductImage();
    }
}

function hideProductImage() {
    $('#divProductImage').attr('class', 'menu transition menu-hidden');
    setTimeout(function() {
        $('#divProductImage').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showResumeOrAbandonJobMenu(id) {

    ResumeOrAbandonJobID = id;
    setTimeout(function() {
        $('#divMenuBG').show();
        $('#divResumeOrAbandonJobMenu').show();
        setTimeout(function() {
            $('#divResumeOrAbandonJobMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hideResumeOrAbandonJobMenu() {
    $('#divResumeOrAbandonJobMenu').attr('class', 'menu transition menu-hidden');
    setTimeout(function() {
        $('#divResumeOrAbandonJobMenu').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showAbandonJobConfirmMenu() {
    setTimeout(function() {
        $('#divMenuBG').show();

        //var bottom = ($(document).height() - realHeigth($('#divAbandonJobConfirmMenu'))) / 2;
        var bottom = ($(document).height() - realHeigth($('#divAbandonJobConfirmMenu').find('div'))) / 2;
        $('#divAbandonJobConfirmMenu').css("bottom", bottom);
        $('#divAbandonJobConfirmMenu').show();
        setTimeout(function() {
            $('#divAbandonJobConfirmMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hideAbandonJobConfirmMenu() {
    $('#divAbandonJobConfirmMenu').attr('class', 'menu transition menu-hidden');

    setTimeout(function() {
        $('#divAbandonJobConfirmMenu').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showPhotoAdd(sender, photoIndex) {
    photoStep = $(sender).find('img').attr('id');
    photoNumber = photoIndex;
    $(sender).addClass('ui-btn-active');
    //css("background", "linear-gradient(#5393C5, #6FACD5) !important");//linear-gradient(#5393C5, #6FACD5) repeat scroll 0 0 #5393C5 !important
    if ($('#' + photoStep).attr("src") != "assets/img/camera.png") {
        $('#btnDeletePhoto').show();
    } else {
        $('#btnDeletePhoto').hide();
    }
    setTimeout(function() {
        $('#divMenuBG').show();
        $('#divStepPhotoAddMenu').show();

        setTimeout(function() {
            $('#divStepPhotoAddMenu').attr('class', 'menu transition menu-visible');
            $(sender).removeClass('ui-btn-active');
        }, 100);
    }, 300);
}

function hidePhotoAdd() {
    $('#divStepPhotoAddMenu').attr('class', 'menu transition menu-hidden');

    setTimeout(function() {
        $('#divStepPhotoAddMenu').hide();
        $('#divMenuBG').hide();
    }, 0);
}

function showPhotoDelete() {
    setTimeout(function() {
        $('#divMenuBG').show();
        $('#divStepPhotoDeleteMenu').show();
        setTimeout(function() {
            $('#divStepPhotoDeleteMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hidePhotoDelete() {
    $('#divStepPhotoDeleteMenu').attr('class', 'menu transition menu-hidden');

    setTimeout(function() {
        $('#divStepPhotoDeleteMenu').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showCommitMenu() {
    setTimeout(function() {
        $('#divMenuBG').show();
        $('#CommitMenu').show();
        $('#CommitMenuContent').show();
        setTimeout(function() {
            $('#CommitMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hideCommitMenu() {
    $('#CommitMenu').attr('class', 'menu transition menu-hidden');
    $('#CommitComplete').attr('class', 'menu transition menu-hidden');
    $('#CommitFailed').attr('class', 'menu transition menu-hidden');
    $('#ReserveJobFailed').attr('class', 'menu transition menu-hidden');
    $('#CommitMissingSteps').attr('class', 'menu transition menu-hidden');


    setTimeout(function() {
        $('#CommitMenu').hide();
        $('#CommitComplete').hide();
        $('#CommitFailed').hide();
        $('#ReserveJobFailed').hide();
        $('#divMenuBG').hide();
        $('#CommitMissingSteps').hide();
    }, 100);
}

function showConfirmTransfer() {
    setTimeout(function() {
        $('#divMenuBG').show();
        $('#divConfirmTransferMenu').show();
        setTimeout(function() {
            $('#divConfirmTransferMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hideConfirmTransfer() {
    $('#divConfirmTransferMenu').attr('class', 'menu transition menu-hidden');
    $('#divConfirmTransferDone').attr('class', 'menu transition menu-hidden');

    setTimeout(function() {
        $('#divConfirmTransferMenu').hide();
        $('#divConfirmTransferDone').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showConfirmUpdateUser() {
    setTimeout(function() {
        $('#divMenuBG').show();

        $('#divConfirmUpdateUserMenuTitle').text(_('msgUpdateUserTitle'));

        $('#divConfirmUpdateUserMenu').show();
        setTimeout(function() {
            $('#divConfirmUpdateUserMenu').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hideConfirmUpdateUser() {
    $('#divConfirmUpdateUserMenu').attr('class', 'menu transition menu-hidden');

    setTimeout(function() {
        $('#divConfirmUpdateUserMenu').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showCreateUserChooseLanguage() {
    setTimeout(function() {
        $('#divMenuBG').show();

        $('#divCreateUserChooseLanguage').show();
        setTimeout(function() {
            $('#divCreateUserChooseLanguage').attr('class', 'menu transition menu-visible');
        }, 100);
    }, 300);
}

function hideCreateUserChooseLanguage() {
    $('#divCreateUserChooseLanguage').attr('class', 'menu transition menu-hidden');

    setTimeout(function() {
        $('#divCreateUserChooseLanguage').hide();
        $('#divMenuBG').hide();
    }, 100);
}

function showChangePasswordWin() {
    setTimeout(function() {
        $('#divMenuBG').show();

        $('#divChangePasswordWin').show();
        setTimeout(function() {
            $('#divChangePasswordWin').attr('class', 'menu transition menu-visible');
            $('#divEditProfileChangePasswordNew').val('');
            $('#divEditProfileChangePasswordNewRepeat').val('');
            $('#divEditProfileChangePasswordOld').val('');
        }, 100);
    }, 300);
}

function showChangePasswordFail() {
    setTimeout(function() {
        $('#divMenuBG').show();

        $('#divChangePasswordFail').show();
        setTimeout(function() {
            $('#divChangePasswordFail').attr('class', 'menu transition menu-visible');
            $('#divEditProfileChangePasswordNew').val('');
            $('#divEditProfileChangePasswordNewRepeat').val('');
            $('#divEditProfileChangePasswordOld').val('');
        }, 100);
    }, 300);
}

function hideChangePassword() {
    $('#divChangePasswordWin').attr('class', 'menu transition menu-hidden');
    $('#divChangePasswordFail').attr('class', 'menu transition menu-hidden');

    setTimeout(function() {
        $('#divChangePasswordWin').hide();
        $('#divChangePasswordFail').hide();
        $('#divMenuBG').hide();
    }, 100);
}


function CreateUser() {
    if (spinner == null) {
        spinnerStart();
    }
    var fname = $("#inputNewUserFirstName").val();
    var lname = $("#inputNewUserLastName").val();
    var email = $("#inputNewUserEmail").val();
    var pass = $("#inputNewUserPassword").val();

    var zips = '';
    //    $.each($('#inputNewUserZipCodes :selected'), function (i, item) {
    $.each($('#inputNewUserZipCodes :checked'), function(i, item) {
        zips += $(item).val() + ';';
    });

    var countryCode = ' ';
    $.each($('#inputNewUserCountryCodes :selected'), function(i, item) {
        countryCode = $(item).val();
    });


    var phoneNumber = $("#inputNewUserPhoneNumber").val();
    if (phoneNumber == "") {
        phoneNumber = " ";
    }
    if (fname != '' && lname != '' && email != '' && pass != '' && zips != '') {
        $.getJSON(server + "/ws/Service1.svc/CreateUser/" + fname + "/" + lname + "/" + zips + "/" + countryCode + "/" + phoneNumber + "/" + email + "/" + pass + "/" + phoneType, function(json) {
            if (json == "success") {
                navigator.notification.alert(
                    _('msgUserCreatedMsg'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('msgUserCreatedTitle'), // title
                    _('btnOk')   // buttonLabels
                );

                $("#username").val(email);
                $("#password").val(pass);
                DoLogin();
                //goForward('#divLogin');
            } else {
                if (spinner != null) {
                    spinnerStop();
                }
                //navigator.notification.alert(json, function () { goForward('#divCreateProfile', '#divLogin'); });
                navigator.notification.alert(
                    _(json), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('msgUserCreatedFailTitle'), // title
                    _('btnOk')   // buttonLabels
                );
                //alert(json);

            }

        }).error(function() {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgUserCreatedFailTitle'), // title
                _('btnOk')   // buttonLabels
            );
        });
    } else {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('allFieldsRequired'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('msgUserCreatedFailTitle'), // title
            _('btnOk')   // buttonLabels
        );
        $("#btnCreateUser").removeAttr("disabled");
    }
    //$("#btnCreateUser").removeAttr("disabled");
}

function resetPassword() {
    if (spinner == null) {
        spinnerStart();
    }
    var userID = window.localStorage["userID"];
    $.getJSON(server + "/ws/Service1.svc/ResetPassword/" + $('#divResetPasswordMenuEmail').val(), function(json) {
        if (json == "") {

            hidedivResetPasswordMenu();

            navigator.notification.alert(
                _('msgNewPasswordMsg') + $('#divResetPasswordMenuEmail').val(), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgNewPasswordTitle'), // title
                _('btnOk')   // buttonLabels
            );

            spinnerStop();
        } else {
            //if (spinner != null) {
            spinnerStop();
            //}
            hidedivResetPasswordMenu();
            navigator.notification.alert(
                _(json), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('passwordCouldNotBeReset'), // title
                _('btnOk')   // buttonLabels
            );
        }
    }).error(function() {
        //if (spinner != null) {
        spinnerStop();
        //}
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('oops'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

var currentUser = null;

function loadCreateUserData() {
    $('#inputNewUserFirstName').val("");
    $('#inputNewUserLastName').val("");
    $('#inputNewUserZipCodes').empty();
    //$('#inputNewUserZipCodes').parent().find('.ui-btn-text').empty();
    $('#inputNewUserEmail').val("");
    $('#inputNewUserPassword').val("");
    $('#inputNewUserCountryCodes').empty();
    $('#inputNewUserCountryCodes').parent().find('.ui-btn-text').empty();
    $('#inputNewUserPhoneNumber').val("");

    //$.getJSON(server + "/ws/Service1.svc/GetZipCodes", function (zipjson) {
    $.getJSON(server + "/ws/Service1.svc/GetZipCodesWithCountry/" + $('#ddlCreateUserChooseLanguage :selected').val(), function(zipjson) {
        if (zipjson != null) {

            $.each(zipjson, function(i, item) {
                if (item.From == item.To) {
                    $('#inputNewUserZipCodes').append('<div style="margin-bottom: 5px;"><input style="float:left;" type="checkbox" value="' + item.ID + '"><div style="float:left; margin-left: 5px;" onclick="$(this).parent().find(\'input\').attr(\'checked\', !$(this).parent().find(\'input\').attr(\'checked\'));">' + item.From + ' ' + item.City + '</div></div><br style="clear:both;"/>');
                } else {
                    $('#inputNewUserZipCodes').append('<div style="margin-bottom: 5px;"><input style="float:left;" type="checkbox" value="' + item.ID + '"><div style="float:left; margin-left: 5px;" onclick="$(this).parent().find(\'input\').attr(\'checked\', !$(this).parent().find(\'input\').attr(\'checked\'));">' + item.From + ' - ' + item.To + ' ' + item.City + '</div></div><br style="clear:both;"/>');
                }
                //if (item.From == item.To) {
                //    $('#inputNewUserZipCodes').append('<option value="' + item.ID + '">' + item.From + ' ' + item.City + '</option>');
                //} else {
                //    $('#inputNewUserZipCodes').append('<option value="' + item.ID + '">' + item.From + '-' + item.To + ' ' + item.City + '</option>');
                //}
            });
            //$('#inputNewUserZipCodes').parent().find('.ui-btn-text').empty();
            $.getJSON(server + "/ws/Service1.svc/GetCountryCodes", function(countryjson) {
                if (countryjson != null) {

                    $.each(countryjson, function(i, item) {
                        $('#inputNewUserCountryCodes').append('<option value="' + item.Code + '">+' + item.Code + '</option>');
                    });
                    $('#inputNewUserCountryCodes').parent().find('.ui-btn-text').empty();
                    goForwardFooter('#divCreateProfile');
                } else {
                    if (spinner != null) {
                        spinnerStop();
                    }
                    navigator.notification.alert(
                        _('noConnection'), // message
                        function() {
                        }, // callback to invoke with index of button pressed
                        _('oops'), // title
                        _('btnOk')   // buttonLabels
                    );
                }
            }).error(function() {
                if (spinner != null) {
                    spinnerStop();
                }
                navigator.notification.alert(
                    _('noConnection'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('oops'), // title
                    _('btnOk')   // buttonLabels
                );
            });
        } else {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('oops'), // title
                _('btnOk')   // buttonLabels
            );
        }
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('oops'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

function loadMyProfile(stopSpinner) {
    var userID = window.localStorage["userID"];
    $.getJSON(server + "/ws/Service1.svc/GetUserDetails/" + userID, function(json) {

        if (json != null && parseInt(json) != NaN) {
            currentUser = json;
            $('#divMyProfileName').text(json.FirstName + ' ' + json.LastName);

            $('#divEditProfileName').text(json.FirstName + ' ' + json.LastName);

            $('#inputUpdateUserFirstName').val(json.FirstName);
            $('#inputUpdateUserLastName').val(json.LastName);
            $('#inputUpdateUserPhoneNumber').val(json.PhoneNumber);
            $('#inputUpdateUserZips').empty();
            $.each(json.ZipCodes, function(i, item) {
                if (item.Selected) {
                    //if (item.From == item.To) {
                    //    $('#inputUpdateUserZips').append('<option value="' + item.ID + '" selected>' + item.From + ' ' + item.City + '</option>');
                    //} else {
                    //    $('#inputUpdateUserZips').append('<option value="' + item.ID + '" selected>' + item.From + '-' + item.To + ' ' + item.City + '</option>');
                    //}
                    if (item.From == item.To) {
                        $('#inputUpdateUserZips').append('<div style="margin-bottom: 5px;"><input style="float:left;" type="checkbox" checked="checked" value="' + item.ID + '"><div style="float:left; margin-left: 5px;" onclick="$(this).parent().find(\'input\').attr(\'checked\', !$(this).parent().find(\'input\').attr(\'checked\'));">' + item.From + ' ' + item.City + '</div></div><br style="clear:both;"/>');
                    } else {
                        $('#inputUpdateUserZips').append('<div style="margin-bottom: 5px;"><input style="float:left;" type="checkbox" checked="checked" value="' + item.ID + '"><div style="float:left; margin-left: 5px;" onclick="$(this).parent().find(\'input\').attr(\'checked\', !$(this).parent().find(\'input\').attr(\'checked\'));">' + item.From + ' - ' + item.To + ' ' + item.City + '</div></div><br style="clear:both;"/>');
                    }
                } else {
                    //if (item.From == item.To) {
                    //    $('#inputUpdateUserZips').append('<option value="' + item.ID + '">' + item.From + ' ' + item.City + '</option>');
                    //} else {
                    //    $('#inputUpdateUserZips').append('<option value="' + item.ID + '">' + item.From + '-' + item.To + ' ' + item.City + '</option>');
                    //}
                    if (item.From == item.To) {
                        $('#inputUpdateUserZips').append('<div style="margin-bottom: 5px;"><input style="float:left;" type="checkbox" value="' + item.ID + '"><div style="float:left; margin-left: 5px;" onclick="$(this).parent().find(\'input\').attr(\'checked\', !$(this).parent().find(\'input\').attr(\'checked\'));">' + item.From + ' ' + item.City + '</div></div><br style="clear:both;"/>');
                    } else {
                        $('#inputUpdateUserZips').append('<div style="margin-bottom: 5px;"><input style="float:left;" type="checkbox" value="' + item.ID + '"><div style="float:left; margin-left: 5px;" onclick="$(this).parent().find(\'input\').attr(\'checked\', !$(this).parent().find(\'input\').attr(\'checked\'));">' + item.From + ' - ' + item.To + ' ' + item.City + '</div></div><br style="clear:both;"/>');
                    }
                }
            });
            $('#inputUpdateUserZips').prev().prev().children().first().empty();
            $.each($('#inputUpdateUserZips').children(":selected"), function(i, item) {
                $('#inputUpdateUserZips').prev().prev().children().first().append('<span>' + $(item).text() + ' - </span>');
            });

            $('#inputUpdateUserCountryCodes').empty();
            $.each(json.CountryCodes, function(i, item) {
                if (item.Selected) {
                    $('#inputUpdateUserCountryCodes').append('<option value="' + item.Code + '" selected>+' + item.Code + '</option>');
                } else {
                    $('#inputUpdateUserCountryCodes').append('<option value="' + item.Code + '">+' + item.Code + '</option>');
                }
            });

            $('#inputUpdateUserCountryCodes').prev().children().first().empty();
            $.each($('#inputUpdateUserCountryCodes').children(":selected"), function(i, item) {
                $('#inputUpdateUserCountryCodes').prev().children().first().append('<span>' + $(item).text() + '</span>');
            });

            $('#inputUpdateUserEmail').val(json.Email);
            $('#txtPayPalSettingsEmail').val(json.PayPalAccount);
            $('#CommitCompleteName').val(json.FirstName);
            //updateMyjobs();
            if (spinner != null && stopSpinner == true) {
                spinnerStop();
            }
        } else {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('userCouldnotBeFound'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('oops'), // title
                _('btnOk')   // buttonLabels
            );
            goForwardFooter('#divFindJobList');
        }
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('oops'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

function reloadMyProfile() {
    if (currentUser != null) {
        $('#divMyProfileName').text(currentUser.FirstName + ' ' + currentUser.LastName);

        $('#divEditProfileName').text(currentUser.FirstName + ' ' + currentUser.LastName);

        $('#inputUpdateUserFirstName').val(currentUser.FirstName);
        $('#inputUpdateUserLastName').val(currentUser.LastName);
        $('#inputUpdateUserZipCode').val(currentUser.ZipCode);
        $('#inputUpdateUserEmail').val(currentUser.Email);
        $('#txtPayPalSettingsEmail').val(currentUser.PayPalAccount);
    } else {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('msgErrorTitle'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('oops'), // title
            _('btnOk')   // buttonLabels
        );
    }
}

function UpdateUser() {
    hideConfirmUpdateUser();

    var fname = $("#inputUpdateUserFirstName").val();
    var lname = $("#inputUpdateUserLastName").val();
    var email = $("#inputUpdateUserEmail").val();
    var curpass = $("#txtUpdateUserPW").val();
    var zips = '';
    //$.each($('#inputUpdateUserZips').children(":selected"), function(i, item) {
    //$.each($('#inputUpdateUserZips').children(":checked"), function (i, item) {
    $.each($('#inputUpdateUserZips :checked'), function (i, item) {
        zips += $(item).val() + ';';
    });

    var countryCode = ' ';
    $.each($('#inputUpdateUserCountryCodes').children(":selected"), function(i, item) {
        countryCode = $(item).val();
    });


    var phoneNumber = $("#inputUpdateUserPhoneNumber").val();
    if (phoneNumber == "") {
        phoneNumber = " ";
    }
    var userID = window.localStorage["userID"];
    if (fname != '' && lname != '' && email != '' && curpass != '' && zips != '') {
        $.getJSON(server + "/ws/Service1.svc/UpdateUser/" + userID + "/" + fname + "/" + lname + "/" + zips + "/" + countryCode + "/" + phoneNumber + "/" + email + "/" + curpass, function(json) {
            if (json == "success") {
                loadMyProfile(true);
                //navigator.notification.alert("Din bruger er oprettet. Du kan nu logge ind.", function () { });
                $('#inputUpdateUserNewPassword').val('');
                $('#txtUpdateUserPW').val('');

                navigator.notification.alert(
                    _('msgUserDetailsUpdatedMsg'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('msgUserDetailsUpdatedTitle'), // title
                    _('btnOk')   // buttonLabels
                );

                goForward('#divEditProfile');
            } else {
                $('#inputUpdateUserNewPassword').val('');
                $('#txtUpdateUserPW').val('');
                navigator.notification.alert(
                    _(json), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('msgUserDetailsUpdateFailedTitle'), // title
                    _('btnOk')   // buttonLabels
                );

                //hideConfirmUpdateUser();
            }
        }).error(function() {
            if (spinner != null) {
                spinnerStop();
            }
            $('#inputUpdateUserNewPassword').val('');
            $('#txtUpdateUserPW').val('');
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('msgUserDetailsUpdateFailedTitle'), // title
                _('btnOk')   // buttonLabels
            );
        });
    } else {
        navigator.notification.alert(
            _('allFieldsRequired'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('msgUserDetailsUpdateFailedTitle'), // title
            _('btnOk')   // buttonLabels
        );
    }
}

function UpdatePassword() {
    var newpass = $("#divEditProfileChangePasswordNew").val();
    var newpassRepeat = $("#divEditProfileChangePasswordNewRepeat").val();
    var curpass = $("#divEditProfileChangePasswordOld").val();
    var userID = window.localStorage["userID"];

    if (newpass != '' && newpassRepeat != '' && curpass != '') {

        if (newpass == newpassRepeat) {
            $.getJSON(server + "/ws/Service1.svc/UpdatePassword/" + userID + "/" + newpass + "/" + curpass, function(json) {
                if (json == "success") {
                    $('#divChangePasswordWintext').text(_('passwordChanged'));

                    changePasswordWinMenu();
                    $('#divEditProfileChangePasswordOld').val('');
                    $('#divEditProfileChangePasswordNew').val('');
                    $('#divEditProfileChangePasswordNewRepeat').val('');
                    //showChangePasswordWin();
                } else {
                    navigator.notification.alert(
                        _(json), // message
                        function() {
                        }, // callback to invoke with index of button pressed
                        _('passwordCouldnotBeChanged'), // title
                        _('btnOk')   // buttonLabels
                    );

                    //navigator.notification.alert(json, function () { goForward('#divCreateProfile', '#divLogin'); });
                    //$('#divChangePasswordFailtext').text(json);

                    //showChangePasswordFail();
                }
            }).error(function() {
                if (spinner != null) {
                    spinnerStop();
                }
                navigator.notification.alert(
                    _('noConnection'), // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('passwordCouldnotBeChanged'), // title
                    _('btnOk')   // buttonLabels
                );
                //alert(_('noConnection'));
            });
        } else {
            //$('#divChangePasswordFailtext').text('De indtastede kodeord er ikke ens. Pr\u00F8v igen');

            navigator.notification.alert(
                _('passwordsDontMatch'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('passwordCouldnotBeChanged'), // title
                _('btnOk')   // buttonLabels
            );
            //showChangePasswordFail();
        }
    } else {
        //$('#divChangePasswordFailtext').text('Du skal indtaste noget i alle felterne. Pr\u00F8v igen');

        navigator.notification.alert(
            _('allFieldsRequired'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('passwordCouldnotBeChanged'), // title
            _('btnOk')   // buttonLabels
        );
        //showChangePasswordFail();
    }

}

function loadAccount() {
    var userID = window.localStorage["userID"];
    $.getJSON(server + "/ws/Service1.svc/GetUserAccountDetails/" + userID, function(json) {
        if (json != "") {
            //navigator.notification.alert("Din bruger er oprettet. Du kan nu logge ind.", function () { });
            $('#divYourAccountMoneyEarned').text(json.MoneyEarned.toFixed(2).replace('.', ','));
            $('#divYourAccountPayPal').text(json.PayPalAccount);
            if (spinner != null) {
                spinnerStop();
            }
        } else {
            if (spinner != null) {
                spinnerStop();
            }
            navigator.notification.alert(
                _('userCouldnotBeFound'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('oops'), // title
                _('btnOk')   // buttonLabels
            );
        }
    }).error(function() {
        if (spinner != null) {
            spinnerStop();
        }
        navigator.notification.alert(
            _('noConnection'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('oops'), // title
            _('btnOk')   // buttonLabels
        );
    });
}

function transferMoney() {
    var moneyInAccount = $('#divYourAccountMoneyEarned').text();
    var moneyToTranfer = $('#txtMoneyToTransfer').val().replace(",", ".");

    if (!isNaN(parseFloat(moneyToTranfer))) {


        var regNO = $('#txtTransferReg').val();
        var accountNO = $('#txtTransferAccount').val();


        if (parseInt(regNO) == 'NaN') { //} || regNO.length != 4) {
            navigator.notification.alert(
                _('bankCodeInvalid'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('transferFailed'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("Du skal angive dit 4 cifrede registreringsnummer");
        } else if (parseInt(accountNO) == 'NaN') {
            navigator.notification.alert(
                _('accountnumberInvalid'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('transferFailed'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("Du skal angive dit 10 cifrede kontonummer");
        } else if (moneyToTranfer == null || moneyToTranfer == '' || moneyToTranfer < 1) {
            navigator.notification.alert(
                'minimumAmoluntNotMet', // message
                function() {
                }, // callback to invoke with index of button pressed
                _('transferFailed'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("Du skal overf\u00F8re mindst x kr");
        } else if (parseFloat(moneyToTranfer) > parseFloat(moneyInAccount)) {
            navigator.notification.alert(
                _('insufficientFunds'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('transferFailed'), // title
                _('btnOk')   // buttonLabels
            );
            //alert("Du kan ikke overf\u00F8re flere penge end du har p\u00E5 din konto");
        } else {
            showConfirmTransfer();
        }
    } else {
        navigator.notification.alert(
            _('invalidAmount'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('transferFailed'), // title
            _('btnOk')   // buttonLabels
        );
        //alert("Du skal indtaste et bel\u00F8b i talform");
    }
}

function ConfirmTransfer() {
    if ($('#txtTransferPW').val() == null || $('#txtTransferPW').val() == "") {
        navigator.notification.alert(
            _('passwordNeeded'), // message
            function() {
            }, // callback to invoke with index of button pressed
            _('transferFailed'), // title
            _('btnOk')   // buttonLabels
        );
        //alert("du skal skrive dit password");
    } else {


        var userID = window.localStorage["userID"];
        $.getJSON(server + "/ws/Service1.svc/TransferMoney/" + userID + "/" + $('#txtTransferPW').val() + "/" + $('#txtMoneyToTransfer').val() + "/" + $('#txtTransferReg').val() + "/" + $('#txtTransferAccount').val(), function(json) {
            if (json.Success == true) {
                $('#divYourAccountMoneyEarned').text(json.AmountLeftInAccount.toFixed(2));
                $('#txtMoneyToTransfer').val('');
                $('#txtTransferReg').val('');
                $('#txtTransferAccount').val('');
                $('#txtTransferPW').val('');

                $('#divConfirmTransferMenu').attr('class', 'menu transition menu-hidden');

                setTimeout(function() {
                    $('#divConfirmTransferMenu').hide();
                    $('#divConfirmTransferDone').hide();
                    $('#divMenuBG').hide();
                }, 100);

                navigator.notification.alert(
                    json.Message, // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('transferInitialized'), // title
                    _('btnOk')   // buttonLabels
                );
                //alert(json.Message + " " + json.AmountTransfered);

            } else {
                $('#txtTransferPW').val('');
                navigator.notification.alert(
                    json.Message, // message
                    function() {
                    }, // callback to invoke with index of button pressed
                    _('transferFailed'), // title
                    _('btnOk')   // buttonLabels
                );
                //alert("error: " + JSON.stringify(json));
            }
        }).error(function() {
            if (spinner != null) {
                spinnerStop();
            }
            $('#txtTransferPW').val('');
            navigator.notification.alert(
                _('noConnection'), // message
                function() {
                }, // callback to invoke with index of button pressed
                _('transferFailed'), // title
                _('btnOk')   // buttonLabels
            );
        });
    }
}

function ChangeLanguage() {
    var language;

    $.each($('#inputMyProfileChangeLanguage').children(":selected"), function(i, item) {
        language = $(item).val();
    });

    MasterLanguage = language;
    window.localStorage["MasterLanguage"] = MasterLanguage;
    Localization.initialize(
        // Dictionnary
        dictionary_master,
        // Fallback language
        "en"
    );
}