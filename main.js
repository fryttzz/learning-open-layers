var mapView = new ol.View({
    center: ol.proj.fromLonLat([-49.3833, -26.2400]),
    zoom: 13
})
var map = new ol.Map({
    target: "map",
    view: mapView
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