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
    layers: [SBSLimite, SBSLinhas, SBSTerminais],
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

map.addControl(fsControl)
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
})