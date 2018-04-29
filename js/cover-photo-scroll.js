"use strict";

var locationRoller = {};

var locationMapping = {
    "North America": "northamerica",
    "South America": "southamerica",
    "Antarctica": "antarctica",
    "Africa": "africa",
    "Oceania": "oceania",
    "Asia": "asia",
    "Europe": "europe",
    "Caribbean": "caribbean"
};

var locationMapping2 = {
    "North America": "<li class=\"flag bs\">Bahamas</li><li class=\"flag ca lived\">Canada</li><li class=\"flag cu\">Cuba</li><li class=\"flag ht\">Haiti</li><li class=\"flag jm\">Jamaica</li><li class=\"flag mx\">Mexico</li><li class=\"flag us lived\">United States</li>",
    "South America": "<li class=\"flag ar\">Argentina</li><li class=\"flag br\">Brazil</li>",
    "Antarctica": "<li class=\"flag aq\">Antarctica</li><div style=\"height: 80px;\">Yep, I really went to Antarctica</div>",
    "Africa": "<li class=\"flag bw\">Botswana</li><li class=\"flag eg\">Egypt</li><li class=\"flag ke\">Kenya</li><li class=\"flag ma\">Morocco</li><li class=\"flag na\">Namibia</li><li class=\"flag za\">South Africa</li><li class=\"flag tz\">Tanzania</li><li class=\"flag zw\">Zimbabwe</li>",
    "Oceania": "<li class=\"flag au\">Australia</li><li class=\"flag nz\">New Zealand</li>",
    "Asia": "<li class=\"flag cn\">China</li><li class=\"flag in\">India</li><li class=\"flag id\">Indonesia</li><li class=\"flag jp\">Japan</li><li class=\"flag sg\">Singapore</li><li class=\"flag th\">Thailand</li><li class=\"flag tr\">Turkey</li><li class=\"flag ae\">United Arab Emirates</li><li class=\"flag vn\">Vietnam</li>",
    "Europe": "<li class=\"flag at\">Austria</li><li class=\"flag be\">Belgium</li><li class=\"flag hr\">Croatia</li><li class=\"flag cz\">Czech Republic</li><li class=\"flag dk\">Denmark</li><li class=\"flag ee\">Estonia</li><li class=\"flag fi\">Finland</li><li class=\"flag fr\">France</li><li class=\"flag de\">Germany</li><li class=\"flag gr\">Greece</li><li class=\"flag hu\">Hungary</li><li class=\"flag it\">Italy</li><li class=\"flag mc\">Monaco</li><li class=\"flag me\">Montenegro</li><li class=\"flag nl\">Netherlands</li><li class=\"flag ru\">Russia</li><li class=\"flag es\">Spain</li><li class=\"flag se\">Sweden</li><li class=\"flag ch\">Switzerland</li><li class=\"flag gb lived\">United Kingdom</li><li class=\"flag va\">Vatican City</li>"
};

window.onload = function () {
    function calcOffsetTop(elt) {
        var rect = elt.getBoundingClientRect();
        var bodyScrollTop = document.body.scrollTop;
        if (bodyScrollTop === 0) {
            bodyScrollTop = document.documentElement.scrollTop;
        }
        return rect.top + bodyScrollTop;
    }

    var setupRoller = function (baseElement, demoRollerOptions, displayElement, displayMapping, callback) {
        var demoCount = 0;
        var heightAdjustmentTimeout;
        var opacityTimeout;
        var angle = 0;
        var elementSelected = 0;
        var shapeElement = baseElement.getElementsByClassName("shape")[0];
        var stageElement = baseElement.getElementsByClassName("stage")[0];
        var itemElements = baseElement.getElementsByClassName("item");
        var angleDelta = 360 / itemElements.length;
        var lastItemElementIndex = itemElements.length - 1;

        function changeRollerItem() {
            if (shapeElement) {
                shapeElement.style.transform = "rotateX(" + angle + "deg)";
            }
            if (displayElement) {
                displayElement.style.opacity = 0;
                opacityTimeout = setTimeout(function(){
                    var currentItem = itemElements[elementSelected];
                    if (currentItem) {
                        var countryInfo = getCountryInfo();
                        var selectedMapType = getSelectedMapType();
                        console.log(selectedMapType)
                        var countriesToShow = Object.keys(countryInfo).filter(countryName =>
                            countryInfo[countryName].fillKey === displayMapping[currentItem.getAttribute("data-item")] &&
                            (selectedMapType === 'both-visited' && (countryInfo[countryName].brentVisited || countryInfo[countryName].dianaVisited)
                                || selectedMapType === 'diana-visited' && countryInfo[countryName].dianaVisited
                                || selectedMapType === 'brent-visited' && countryInfo[countryName].brentVisited
                            )
                        );
                        var listOutput = countriesToShow.map(countryCode => 
                            '<li class="flag ' + countryInfo[countryCode].flagName + '">' + countryInfo[countryCode].countryName + '</li>'
                        );
                        if (listOutput) {
                            displayElement.innerHTML = listOutput.join('');
                        }
                        if (callback) {
                            callback();
                            heightAdjustmentTimeout = setTimeout(function(){
                                displayElement.style.opacity = 1;
                                callForNewMap();
                            }, 500);
                        } else {
                            displayElement.style.opacity = 1;
                        }
                    }
                }, 300);
            }
        }

        var cancelDemo = function () {
            if (demoScroll) {
                clearInterval(demoScroll);
            }
        };

        var updateWheelAngle = function (event) {
            var change = event.deltaY > 0 ? 1 : -1;
            angle += change * angleDelta;
            updateElementSelected(-change);
        };

        var updateClickAngle = function (event) {
            var offsetTop = calcOffsetTop(shapeElement);
            var clickLocation = event.pageY - offsetTop;
            var change = clickLocation > 0 ? 1 : -1;
            if (change == 1 && 0 > clickLocation + 20) {
                return;
            }
            if (change == -1 && 0 < clickLocation - 20) {
                return;
            }
            angle += change * angleDelta;
            updateElementSelected(-change);
        };

        var updateElementSelected = function (changeValue) {
            elementSelected += changeValue;
            if (elementSelected < 0) {
                elementSelected = lastItemElementIndex;
            }
            if (elementSelected > lastItemElementIndex) {
                elementSelected = 0;
            }
        };

        var updateSpinner = function() {
            window.requestAnimationFrame(changeRollerItem);
            cancelDemo();
            if (heightAdjustmentTimeout) {
                clearTimeout(heightAdjustmentTimeout);
            }
            if (opacityTimeout) {
                clearTimeout(opacityTimeout);
            }
        };

        var demoScrollbar = function () {
            var fakeEvent = {deltaY: 10};
            updateWheelAngle(fakeEvent);
            window.requestAnimationFrame(changeRollerItem);

            demoCount++;
            if (demoCount > (itemElements.length * 2 - 1)) {
                cancelDemo();
            }
        };

        var setupRollerAppearance = function (elements) {
            var baseAngle = 0;
            var zTranslateValue = (elements.length - 2) * 20 + 10;
            if (elements.length <= 5) {
                zTranslateValue = 75;
            }
            for (var i=0; i<elements.length; i++) {
                // Order of operations matters here - rotate then translate
                elements[i].style.transform = "rotateX(" + baseAngle + "deg) translateZ(" + zTranslateValue + "px)";
                baseAngle += angleDelta;
            }
        };

        var getSelectedElement = function () {
            return itemElements[elementSelected].getAttribute("data-item");
        };

        if (stageElement) {
            stageElement.addEventListener("wheel", function(event) {
                updateWheelAngle(event);
                updateSpinner();
                event.preventDefault();
            });
        }

        if (shapeElement) {
            shapeElement.style.display = "block";
            shapeElement.addEventListener("click", function(event) {
                updateClickAngle(event);
                updateSpinner();
                event.preventDefault();
            });
        }

        var isIE = /MSIE \d|Trident.*rv:/.test(navigator.userAgent);
        window.requestAnimationFrame(function() {
            if(!isIE) {
                setupRollerAppearance(itemElements);
                changeRollerItem();
            }
        });

        if (demoRollerOptions.demo === true && !isIE) {
            var demoScroll = setInterval(demoScrollbar, demoRollerOptions.speed);
        }


        return {
            getSelectedElement: getSelectedElement,
            cancelDemo: cancelDemo,
            updateRoller: changeRollerItem,
        };
    };

    var adjustHeightOfDisplayElement = function () {
        window.requestAnimationFrame(function() {
            locationWrapper.style.height = (displayLocations.offsetHeight + displayLocationsHeader.offsetHeight) + "px";
        });
    };

    window.onresize = function () {
        adjustHeightOfDisplayElement();
    };

    var locationsDisplay = document.getElementsByClassName("country-list")[0];

    var locationRollerElement = document.getElementById("locations");

    var locationWrapper = document.getElementsByClassName("location-display-wrapper")[0];
    var displayLocations = locationWrapper.getElementsByClassName("display-locations")[0];
    var displayLocationsHeader = locationWrapper.getElementsByClassName("header")[0];

    var locationRollerOptions = {demo: false, speed: 3000};

    if (!locationRoller.getSelectedElement) {
        locationRoller = setupRoller(locationRollerElement, locationRollerOptions, locationsDisplay, locationMapping, adjustHeightOfDisplayElement);
    }
}
