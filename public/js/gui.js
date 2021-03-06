/* global MissionIntelApp */
// THE MINTERFACE!
MissionIntelApp.GUI = function() {

    /*
     *  Global Variables
     */

    var WIDTH = window.innerWidth - 1;
    var HEIGHT = window.innerHeight - 1;

    var mapCanvas;
    var mapContext;

    var menuDiv;
    var markerDiv;

    var menuUI;
    var mapObj = new Image();

    /**
     * Initialize GUI
     */
    this.initialize = function() {

        // Set up all CANVASes and DIVs
        menuDiv = document.createElement("div");
        menuDiv.width = WIDTH;
        menuDiv.height = HEIGHT;
        menuDiv.id = "div-menu";
        menuDiv.style = "position:absolute; left:0px; top:42px;";
        document.body.appendChild(menuDiv);

        menuUI = new dat.GUI({
            autoPlace: false
        });
        menuDiv = document.getElementById('div-menu');
        menuDiv.appendChild(menuUI.domElement);

        markerDiv = document.createElement("div");
        markerDiv.width = WIDTH;
        markerDiv.height = HEIGHT;
        markerDiv.id = "div-markers";
        markerDiv.style = "position:absolute; left:0px; top:0px;";
        document.body.appendChild(markerDiv);

        //        mapCanvas = document.createElement("canvas");
        //        mapCanvas.id = "canvas-map";
        //        mapCanvas.style = "position:absolute; left:0px; top:0px;";
        //        mapCanvas.width = WIDTH;
        //        mapCanvas.height = HEIGHT;
        //        document.body.appendChild(mapCanvas);
        //        mapContext = mapCanvas.getContext("2d");

        //        mapObj.src = 'resources/img/map.jpg';
        //        mapContext.drawImage(mapObj, -4000, -3000);

        //        mapObj.src = 'resources/img/troll.jpg';
        //        mapContext.drawImage(mapObj, 0, 0);

        console.log("--> gui.initialize() FINISHED");

        this.initUIElements();
        this.initOpenLayers();
    };

    /**
     * Initialize the OpenLayer3 map
     */
    this.initOpenLayers = function() {
        var mousePositionControl = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            //            projection: 'EPSG:3857'
            projection: 'EPSG:4326'
        });

        var scaleLineControl = new ol.control.ScaleLine();


        ////// EXAMPLE CODE FROM MILSYMBOLS
        var iconSize = {
            "C": 15,
            "D": 20,
            "E": 25,
            "F": 30,
            "G": 35,
            "H": 40,
            "I": 45
        };
        var ratio = window.devicePixelRatio || 1;

        // TEST SNIPPET
        // var features = new ol.Feature({
        //     name: "layer",
        //     type: "FeatureCollection",
        //     crs: {
        //         type: "name",
        //         properties: {
        //             name: "EPSG:4326"
        //         }
        //     },
        //     features: [{
        //         type: "Feature",
        //         geometry: {
        //             type: "Point",
        //             coordinates: [42.000,42.123],
        //             properties: {
        //                 SIDC: "SFGPU------E***",
        //                 name: "1.C2 komp",
        //                 fullname: "1.C2 komp/FTS/INSS",
        //                 command: "FTS",
        //                 source: "AWACS"
        //             }
        //         }
        //     }]
        // });

        var features = new ol.Feature({
            name: 'layer',
            geometry: new ol.geom.Point({
                coordinates: [42.000, 42.123],
                properties: {
                    SIDC: "SFGPU------E***",
                    name: "1.C2 komp",
                    fullname: "1.C2 komp/FTS/INSS",
                    command: "FTS",
                    source: "AWACS"
                }
            })
        });

        var vectorSource = new ol.source.Vector({
            //features: (new ol.format.GeoJSON()).readFeatures(situation,{featureProjection:'EPSG:3857'})
            features: features
        });

        vectorSource.forEachFeature(function(f) {
            var mysymbol = new MS.symbol(
                f.getProperties().SIDC, {
                    size: iconSize[(f.getProperties().SIDC).charAt(11)] * ratio,
                    uniqueDesignation: f.getProperties().name
                });
            var mycanvas = mysymbol.getMarker().asCanvas();

            f.setStyle(new ol.style.Style({
                image: new ol.style.Icon(({
                    scale: 1 / ratio,
                    anchor: [mysymbol.markerAnchor.x, mysymbol.markerAnchor.y],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    imgSize: [Math.floor(mysymbol.width), Math.floor(mysymbol.height)],
                    img: (mycanvas)
                }))
            }));
        });

        ////// EXAMPLE CODE FROM MILSYMBOLS END

        ////// TEST CODE

        // var symbolCollection = new ol.collection({
        //         // add a collection of markers here
        // });

        var symbolsSource = new ol.source.Vector({

        });

        var symbolLayer = new ol.layer.Vector({
            source: symbolsSource
        });

        ////// TEST CODE END

        var milsymbolLayer = new ol.layer.Vector({
            source: vectorSource
        });

        var mapLayer = new ol.layer.Tile({
            preload: 4,
            source: new ol.source.TileJSON({
                url: 'http://api.tiles.mapbox.com/v4/mapbox.dark.json?access_token=pk.eyJ1Ijoic2d0dGVkIiwiYSI6ImNpdWZ1bmZ0OTAwMWoyem5uaGl4a2s0ejIifQ.aqtpdqUySGs1lrPbtITp0g',
                crossOrigin: 'anonymous'
            })
        });

        var map = new ol.Map({
            layers: [mapLayer, milsymbolLayer, symbolLayer],
            target: 'div-map',
            controls: ol.control.defaults({
                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                    collapsible: true
                })
            }).extend([mousePositionControl, scaleLineControl]),
            view: new ol.View({
                //center: [0, 0],
                center: ol.proj.transform([43, 42], 'EPSG:4326', 'EPSG:3857'),
                zoom: 8
            })
        });

    };

    /**
     * Initialize all UI elements
     */
    this.initUIElements = function() {

        // SOURCE toggeling function
        var toggleSourceTypes = function(source) {

            elements = document.querySelectorAll("canvas[source]"); // Get everything that has a source attribute

            for (i = 0; i < elements.length; i++) {
                if (elements[i].getAttribute("source") == source) {
                    elements[i].style.visibility = elements[i].style.visibility == "visible" ? "hidden" : "visible";
                }
            }
        };

        // UNIT toggeling function
        var toggleMarkerTypes = function(affiliation, battleDimension, functionID) {

            affiliation = affiliation !== null ? affiliation : "F";
            battleDimension = battleDimension !== null ? battleDimension : "G";
            functionID = functionID !== null ? functionID : "CA";

            elements = document.querySelectorAll("canvas[markerhash]"); // Get canvas that has a markerhash, i.e. is a marker

            for (i = 0; i < elements.length; i++) {
                if (elements[i].getAttribute("affiliation") == affiliation && elements[i].getAttribute("battleDimension") == battleDimension && elements[i].getAttribute("functionID").startsWith(functionID)) {
                    elements[i].style.visibility = elements[i].style.visibility == "visible" ? "hidden" : "visible";
                }
            }
        };

        // SCALE Markers
        var scaleMarkers = function(scaleValue) {

            elements = document.querySelectorAll("canvas[markerhash]"); // Get canvas that has a markerhash, i.e. is a marker

            scaleValue = scaleValue / 100;

            for (i = 0; i < elements.length; i++) {
                elements[i].style.transform = "scale(" + scaleValue + "," + scaleValue + ")";
            }
        };

        // MENU-ITEMS
        var SourcesFilterObjects = function() {
            this.AWACS = true;
            this.JSTAR = true;
            this.HUMINT = true;
            this.GEOINT = true;
            this.SIGINT = true;
        };

        var BlueforFilterObjects = function() {
            this.INFANTRY = true;
            this.ARMOR = true;
            this.AIR_FW = true;
            this.AIR_RW = true;
            this.AA = true;
            this.SEA = true;
        };

        var RedforFilterObjects = function() {
            this.INFANTRY = true;
            this.ARMOR = true;
            this.AIR_FW = true;
            this.AIR_RW = true;
            this.AA = true;
            this.SEA = true;
        };

        var ShowAllMarkersObjects = function() {
            this.SHOW_ALL = function() {

                elements = document.querySelectorAll("canvas[markerhash]"); // Get canvas that has a markerhash, i.e. is a marker

                for (i = 0; i < elements.length; i++) {

                    elements[i].style.visibility = "visible";

                }
            };
        };

        var HideAllMarkersObjects = function() {
            this.HIDE_ALL = function() {

                elements = document.querySelectorAll("canvas[markerhash]"); // Get canvas that has a markerhash, i.e. is a marker

                for (i = 0; i < elements.length; i++) {

                    elements[i].style.visibility = "hidden";

                }
            };
        };

        var MarkerScaleObjects = function() {
            this.MARKER_SCALE = 100;
        };

        var f1 = menuUI.addFolder('SOURCES');
        var f2 = menuUI.addFolder('BLUEFOR');
        var f3 = menuUI.addFolder('REDFOR');
        //        f1.open();
        //        f2.open();
        //        f3.open();

        var SourceFilter = new SourcesFilterObjects();
        tglAWACS = f1.add(SourceFilter, 'AWACS');
        tglJSTAR = f1.add(SourceFilter, 'JSTAR');
        tglHUMINT = f1.add(SourceFilter, 'HUMINT');
        tglGEOINT = f1.add(SourceFilter, 'GEOINT');
        tglSIGINT = f1.add(SourceFilter, 'SIGINT');

        var BlueforFilter = new BlueforFilterObjects();
        tglINFANTRY_F = f2.add(BlueforFilter, 'INFANTRY');
        tglARMOR_F = f2.add(BlueforFilter, 'ARMOR');
        tglAIR_FW_F = f2.add(BlueforFilter, 'AIR_FW');
        tglAIR_RW_F = f2.add(BlueforFilter, 'AIR_RW');
        tglAA_F = f2.add(BlueforFilter, 'AA');
        tglSEA_F = f2.add(BlueforFilter, 'SEA');

        var RedforFilter = new RedforFilterObjects();
        tglINFANTRY_H = f3.add(RedforFilter, 'INFANTRY');
        tglARMOR_H = f3.add(RedforFilter, 'ARMOR');
        tglAIR_FW_H = f3.add(RedforFilter, 'AIR_FW');
        tglAIR_RW_H = f3.add(RedforFilter, 'AIR_RW');
        tglAA_H = f3.add(RedforFilter, 'AA');
        tglSEA_H = f3.add(RedforFilter, 'SEA');

        var ShowAllMarkers = new ShowAllMarkersObjects();
        btnShowAllMarkers = menuUI.add(ShowAllMarkers, 'SHOW_ALL');

        var HideAllMarkers = new HideAllMarkersObjects();
        btnHideAllMarkers = menuUI.add(HideAllMarkers, 'HIDE_ALL');

        var MarkerScaler = new MarkerScaleObjects();
        sliderMarkerScaler = menuUI.add(MarkerScaler, 'MARKER_SCALE', 50, 100);


        // SourceFilter events
        tglAWACS.onChange(function(state) {
            var toggle = toggleSourceTypes("AWACS"); // TOGGLE ALL MARKERS FROM AWACS
        });

        tglJSTAR.onChange(function(state) {
            var toggle = toggleSourceTypes("JSTAR"); // TOGGLE ALL MARKERS FROM JSTAR
        });

        tglHUMINT.onChange(function(state) {
            var toggle = toggleSourceTypes("HUMINT"); // TOGGLE ALL MARKERS FROM HUMINT
        });

        tglGEOINT.onChange(function(state) {
            var toggle = toggleSourceTypes("GEOINT"); // TOGGLE ALL MARKERS FROM GEOINT
        });

        tglSIGINT.onChange(function(state) {
            var toggle = toggleSourceTypes("SIGINT"); // TOGGLE ALL MARKERS FROM SIGINT
        });


        // BlueforFilter events
        tglINFANTRY_F.onChange(function(state) {
            var toggle = toggleMarkerTypes("F", "G", "UCI"); // FRIENDLY GROUND INFANTRY UNITS
        });

        tglARMOR_F.onChange(function(state) {
            var toggle = toggleMarkerTypes("F", "G", "UCA"); // FRIENDLY GROUND ARMORED UNITS
        });

        tglAIR_FW_F.onChange(function(state) {
            var toggle = toggleMarkerTypes("F", "A", "MF"); // FRIENDLY AIR FIXEDWING UNITS
        });

        tglAIR_RW_F.onChange(function(state) {
            var toggle = toggleMarkerTypes("F", "A", "MH"); // FRIENDLY AIR ROTARYWING UNITS
        });

        tglAA_F.onChange(function(state) {
            var toggle = toggleMarkerTypes("F", "G", "UCD"); // FRIENDLY GROUND AAA/SAM UNITS
        });

        tglSEA_F.onChange(function(state) {
            var toggle = toggleMarkerTypes("F", "S", "C"); // FRIENDLY SEA UNITS
        });


        // RedforFilter events
        tglINFANTRY_H.onChange(function(state) {
            var toggle = toggleMarkerTypes("H", "G", "UCI"); // FRIENDLY GROUND INFANTRY UNITS
        });

        tglARMOR_H.onChange(function(state) {
            var toggle = toggleMarkerTypes("H", "G", "UCA"); // FRIENDLY GROUND ARMORED UNITS
        });

        tglAIR_FW_H.onChange(function(state) {
            var toggle = toggleMarkerTypes("H", "A", "MF"); // FRIENDLY AIR FIXEDWING UNITS
        });

        tglAIR_RW_H.onChange(function(state) {
            var toggle = toggleMarkerTypes("H", "A", "MH"); // FRIENDLY AIR ROTARYWING UNITS
        });

        tglAA_H.onChange(function(state) {
            var toggle = toggleMarkerTypes("H", "G", "UCD"); // FRIENDLY GROUND AAA/SAM UNITS
        });

        tglSEA_H.onChange(function(state) {
            var toggle = toggleMarkerTypes("H", "S", "C"); // FRIENDLY SEA UNITS
        });


        // MarkerScaler Events
        sliderMarkerScaler.onChange(function(value) {
            var slider = scaleMarkers(value);
        });


        // // Clock
        // setInterval(function() {
        //     var clockElement = document.querySelectorAll('#clock');
        //     var DateString = new Date().toGMTString();
        //
        //     for (i = 0; i < clockElement.length; i++) {
        //         clockElement[i].textContent = DateString;
        //     }
        //
        // }, 1000);
        //
        // // FUNCTION-MENU
        // document.getElementById("menu-mode-button").onclick = function() {
        //     var height = window.innerHeight;
        //
        //     if (document.getElementById("menu-mode-dropdown").style.visibility == "visible") {
        //         document.getElementById("menu-mode-dropdown").style.visibility = "hidden";
        //         document.getElementById("menu-mode-dropdown").style.maxHeight = "0px";
        //     } else {
        //         document.getElementById("menu-mode-dropdown").style.visibility = "visible";
        //         document.getElementById("menu-mode-dropdown").style.maxHeight = height + "px";
        //     };
        // }
        //
        // // OTHER ONCLICK FUNCTIONS
        // window.onclick = function(event) {
        //     //  if(!event.target.matches('menu-mode-button')){
        //     //    document.getElementById("menu-mode-dropdown").style.display = "none";
        //     // }
        // }

        console.log("--> gui.UIelements() FINISHED");
    };

    // document.getElementById("menu-mode-notes").onclick = function() {
    //   if (document.getElementById("mode-notes-wrapper").style.visibility == "visible") {
    //       document.getElementById("mode-notes-wrapper").style.visibility = "hidden";
    //   } else {
    //       document.getElementById("mode-notes-wrapper").style.visibility = "visible";
    //   };
    // }
    //
    // // FUNCTION-MENU: Notes
    // document.getElementById("mode-notes-controls-add").onclick = function() {
    //   var node = document.createElement("LI");
    //   var notes = document.getElementById('mode-notes-content');
    //
    //
    //   node.innerHTML =  "<div><textarea class='note-title' placeholder='Untitled' maxlength='10'></textarea>"+
    //                     "<textarea class='note-content' placeholder='Your content here'/></textarea>"+
    //                     "<a href='#' id='mode-notes-controls-remove'>×</a></div>";
    //
    //   notes.appendChild(node);
    // }


    /**
     * Initialize Mouse Events
     */
    this.initMouseEvents = function() {

        setInterval(function() {
            var hoverElements = document.querySelectorAll(':hover');
            //console.log(hoverElements);
        }, 1000);
    };

    /**
     * Adds marker to respective ul in divs with id="div-markers"
     * @param {MissionIntelApp.Marker} newMarker
     */
    this.addMarker = function(newMarker) {

        MS.setStandard("APP6");

        function getHash(marker) {
            return MissionIntelApp.Marker.getHash(marker);
        }

        // Create marker element and set marker position
        var markerElement = new MS.symbol(getHash(newMarker), {
            size: 50
        }).getMarker().asCanvas();
        // markerElement.style = "position:absolute; left:" + newMarker.x + "px; top:" + newMarker.y + "px;";

        // Add custom attributes to context tag
        markerElement.setAttribute("markerhash", getHash(newMarker));
        markerElement.setAttribute("affiliation", newMarker.affiliation);
        markerElement.setAttribute("battleDimension", newMarker.battleDim);
        markerElement.setAttribute("functionID", newMarker.functionID);
        markerElement.setAttribute("source", newMarker.source);

        // Check if there is an <ul> to add this element to. If not, create it
        if (!document.getElementById(newMarker.source)) {
            var ul = document.createElement("ul");
            ul.id = newMarker.source;
            ul.style.visibility = "visible";
            document.getElementById("div-markers").appendChild(ul);
        }

        // Set any additional atributes
        markerElement.style.visibility = "visible";

        // Add the new marker element the <ul>
        document.getElementById(newMarker.source).appendChild(markerElement);

        console.log("--> gui.addMarker() FINISHED");
    };

    /**
     * Update marker
     * @param {MissionIntelApp.Marker} updateMarker
     */
    this.updateMarker = function(updateMarker) {

        // whipe all <li>'s

        // kjør addMarker
    };

    /**
     * Remove all units from view
     */
    this.clearUnits = function() {
        context.clearRect();
    };

    /**
     * @param {MissionIntelApp.MapTile} tile
     */
    this.handleTile = function(tile) {

        // TODO: Handle a tile here ...

    };
};
