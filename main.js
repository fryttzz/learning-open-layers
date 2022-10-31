var mapView = new ol.View({
    center: ol.proj.fromLonLat([-49.3833, -26.2400]),
    zoom: 13
})
var map = new ol.Map({
    target: "map",
    view: mapView,
    controls: []
})
var noneTile = new ol.layer.Tile({
    title: "None",
    type: "base",
    visible: false
})
var osmTile = new ol.layer.Tile({
    title: "Open Street Map",
    visible: true,
    type: "base",
    source: new ol.source.OSM()
})
var baseGroup = new ol.layer.Group({
    title: "Base Maps",
    layers: [noneTile, osmTile],
    fold: true
})
map.addLayer(baseGroup)

var SBSLimite = new ol.layer.Tile({
    title: "Limite da Cidade de São Bento do Sul",
    source: new ol.source.TileWMS({
        url: "http://192.168.1.166:8080/geoserver/sao_bento_do_sul/wms",
        params: { "LAYERS": "sao_bento_do_sul:lmt_sbs", "TILED": true },
        serviceType: "geoserver",
        visible: true
    })
})
var SBSLinhas = new ol.layer.Tile({
    title: "Sistema de Linhas de São Bento do Sul",
    source: new ol.source.TileWMS({
        url: "http://192.168.1.166:8080/geoserver/sao_bento_do_sul/wms",
        params: { "LAYERS": "sao_bento_do_sul:sistema_completo", "TILED": true },
        serviceType: "geoserver",
        visible: true
    })
})
var SBSLinhaTroncais = new ol.layer.Tile({
    title: "Linhas Troncais do Sistema de Linhas de São Bento do Sul",
    source: new ol.source.TileWMS({
        url: "http://192.168.1.166:8080/geoserver/sao_bento_do_sul/wms",
        params: { "LAYERS": "sao_bento_do_sul:linhas_troncais", "TILED": true },
        serviceType: "geoserver",
        visible: true
    })
})
var SBSTerminais = new ol.layer.Tile({
    title: "Terminais do Sistema de Linhas de São Bento do Sul",
    source: new ol.source.TileWMS({
        url: "http://192.168.1.166:8080/geoserver/sao_bento_do_sul/wms",
        params: { "LAYERS": "sao_bento_do_sul:terminais", "TILED": true },
        serviceType: "geoserver",
        visible: true
    })
})
var overlaysGroup = new ol.layer.Group({
    title: "Overlays",
    layers: [SBSLimite, SBSLinhaTroncais, SBSLinhas, SBSTerminais],
    fold: true
})
map.addLayer(overlaysGroup)

var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: "click",
    startActive: false,
    groupSelectStyle: "children"
})
map.addControl(layerSwitcher)

var mousePosition = new ol.control.MousePosition({
    className: "mousePosition",
    projection: "EPSG:4326",
    coordinateFormat: function(coordinate) { return ol.coordinate.format(coordinate, `{y}, {x}`, 6) }
})
map.addControl(mousePosition)

var scaleControl = new ol.control.ScaleLine({
    bar: true,
    text: true
})
map.addControl(scaleControl)

var container = document.getElementById("popup")
var content = document.getElementById("popup-content")
var closer = document.getElementById("popup-closer")

var popup = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
})

map.addOverlay(popup)

closer.onclick = function() {
    popup.setPosition(undefined)
    closer.blur()
    return false
}

var homeButton = document.createElement("button")
homeButton.innerHTML = '<img src="resources/images/home.svg" alt="home" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align: middle"></img>'
homeButton.className = 'mybutton'

var homeElement = document.createElement("div")
homeElement.className = 'homeButtonDiv'
homeElement.appendChild(homeButton)

var homeControl = new ol.control.Control({
    element: homeElement
})

homeButton.addEventListener("click", () => {
    location.href = "index.html"
})

map.addControl(homeControl)
    //end of home button

var fsButton = document.createElement("button")
fsButton.innerHTML = '<img src="resources/images/fullscreen.svg" alt="fullscreen" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align: middle"></img>'
fsButton.className = 'mybutton'

var fsElement = document.createElement("div")
fsElement.className = 'fsButtonDiv'
fsElement.appendChild(fsButton)

var fsControl = new ol.control.Control({
    element: fsElement
})

fsButton.addEventListener("click", () => {
    var mapEle = document.getElementById("map")
    if (mapEle.requestFullscreen) {
        mapEle.requestFullscreen()
    } else if (mapEle.msRequestFullscreen) {
        mapEle.msRequestFullscreen()
    } else if (mapEle.mozRequestFullscreen) {
        mapEle.mozRequestFullscreen()
    } else if (mapEle.webkitRequestFullscreen) {
        map.webkitRequestFullscreen()
    }
})

map.addControl(fsControl);
//end of fullscreen button

map.on("singleclick", function(evt) {
    content.innerHTML = ""
    var resolution = mapView.getResolution()
    var url = SBSLinhas.getSource().getFeatureInfoUrl(evt.coordinate, resolution, "EPSG:3857", {
        'INFO_FORMAT': 'application/json',
        'propertyName': 'fid,nome,extensao',
    })

    if (url) {
        $.getJSON(url, function(data) {
            var feature = data.features[0]
            var props = feature.properties
            content.innerHTML = "<h3> Nome : </h3> <p> " + props.nome.toUpperCase() + "</p> <br> <h3> Extensão : </h3>" +
                props.extensao.toFixed(2).toString().toUpperCase() + " km</p>"
            popup.setPosition(evt.coordinate)
        })
    } else {
        popup.setPosition(undefined)
    }
});

//lengthButton
var lengthButton = document.createElement("button")
lengthButton.innerHTML = '<img src="resources/images/measure-length.svg" alt="fullscreen" style="width:17px;height:17px;filter:brightness(0) invert(1); vertical-align: middle"></img>'
lengthButton.className = 'mybutton'
lengthButton.id = 'lengthButton';
lengthButton.title = 'Measure Length';

var lengthElement = document.createElement("div")
lengthElement.className = 'lengthButtonDiv'
lengthElement.appendChild(lengthButton)

var lengthControl = new ol.control.Control({
    element: lengthElement
})

var lengthFlag = false
lengthButton.addEventListener("click", () => {
    // disableOtherInteraction("lengthButton")
    lengthButton.classList.toggle("clicked")
    lengthFlag = !lengthFlag
    document.getElementById("map").style.cursor = "default"
    if (lengthFlag) {
        map.removeInteraction(draw)
        addInteraction('LineString')
    } else {
        map.removeInteraction(draw)
        source.clear()
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static")
        while (elements.length > 0) elements[0].remove()
    }
})
map.addControl(lengthControl);
//lengthButton

//areaButton
var areaButton = document.createElement("button")
areaButton.innerHTML = '<img src="resources/images/measure-area.svg" alt="fullscreen" style="width:17px;height:17px;filter:brightness(0) invert(1); vertical-align: middle"></img>'
areaButton.className = 'mybutton'

var areaElement = document.createElement("div")
areaElement.className = 'areaButtonDiv'
areaElement.appendChild(areaButton)

var areaControl = new ol.control.Control({
    element: areaElement
})

var areaFlag = false;
areaButton.addEventListener("click", () => {
    // disableOtherInteraction('areaButton');
    areaButton.classList.toggle('clicked');
    areaFlag = !areaFlag;
    document.getElementById("map").style.cursor = "default";
    if (areaFlag) {
        map.removeInteraction(draw);
        addInteraction('Polygon');
    } else {
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
    }
})
map.addControl(areaControl);
//areaButton

var continuePolygonMsg = "Click to continue line, Double click to complete"
var continueLineMsg = "Click to continue line, Double click to complete"
var draw;

var source = new ol.source.Vector()
var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
})
map.addLayer(vector)

function addInteraction(intType) {
    draw = new ol.interaction.Draw({
        source: source,
        type: intType,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(200,200,200,0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0,0,0,0.5)',
                lineDash: '[10,10]',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0,0,0,0.7)',
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)'
                })
            })
        })
    })

    map.addInteraction(draw)

    createMeasureTooltip()
    createHelpTooltip()

    var sketch;

    var pointerMoveHandler = function(evt) {
        if (evt.dragging) {
            return;
        }

        var helpMsg = 'Click to start drawing'

        if (sketch) {
            var geom = sketch.getGeometry()
        }
    }

    map.on('pointermove', pointerMoveHandler)

    draw.on('drawstart', function(evt) {
        // set sketch
        sketch = evt.feature;

        var tooltipCoord = evt.coordinate;

        sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });

    draw.on('drawend', function() {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
    });
}
/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
var helpTooltipElement;

/**
 * The help tooltip element.
 * @type {Overlay}
 */
var helpTooltip;

function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
    });
    map.addOverlay(helpTooltip);
}

// map.getViewport().addEventListener('mouseout', function() {
//     helpTooltipElement.classList.add('hidden')
// })

var measureTooltipElement;
var measureTooltip;

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);
}

var formatLength = function(line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};

var formatArea = function(polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
};