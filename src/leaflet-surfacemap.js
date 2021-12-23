L.SpotEditor = L.Class.extend({
  options: {
    placeholderHTML: ``
  },
  initialize: function (spot, options) {
    this.spot = spot;
    L.setOptions(this, options)
    this.inputs = Object.assign({});
    this.createUI()
  },
  createUI: function () {
    var container = L.DomUtil.create('div','surface-map-editor');
    this.ui = container;
    if (this.spot === undefined){
      this.editUI = this.createNewUI();
    } else {
      this.infoUI = this.createInfoUI();
      this.editUI = this.createEditUI();
    }
  },
  to_attrib: function(){
    attrib = this.input_values()
    var style_options = {};
    if ('style_options' in this){
      style_options = this.style_options;
      if ('color' in style_options){
        attrib['stroke_color'] = style_options.color;
      }
      if ('fillColor' in style_options){
        attrib['fill_color'] = style_options.fillColor;
      }
      if ('fillOpacity' in style_options){
        attrib['opacity'] = style_options.fillOpacity;
      }
    }
    return attrib;
  },
  input_values: function(){
    values = {};
    inputs = this.inputs
    Object.keys(inputs).forEach(function(data){
      values[data] = inputs[data].value
    });
    return values;
  },
  createNewUI: function(){
    var spotEditor = this;
    var surface = this.options.surface;
    var geometry = this.options.geometry;
    var container = L.DomUtil.create('div','surface-map-editor spot-editor', this.ui);
    var table = L.DomUtil.create(
      `table`,
      `surface-map-editor-table`,
      container
    );
    this.inputs['name'] = this.addInputRow(table, `Name`,"inputSpotName");
    this.inputs['target_uid'] = this.addInputRow(table, `Link ID`,"inputSpotTarget");
    this.inputs['world_x'] = this.addInputRow(table, `X (μm)`,"inputSpotWorldX");
    this.inputs['world_y'] = this.addInputRow(table, `Y (μm)`,"inputSpotWorldY");
    this.inputs['radius_in_um'] = this.addInputRow(table, `Radius (μm)`,"inputSpotRadius");
    var save_btn = L.DomUtil.create('button', 'btn btn-primary', container);
    save_btn.innerHTML = 'Save';
    L.DomEvent.on(save_btn, `click`, function (e) {
      attrib = spotEditor.to_attrib();
      spotEditor.options.onCreate(attrib, {
        onSuccess: function(){
          geometry.closePopup();
          geometry._map.removeLayer(geometry);
        }
      });
    });
    var cancel_btn = L.DomUtil.create('button', 'btn btn-info', container);
    cancel_btn.innerHTML = 'Cancel';
    L.DomEvent.on(cancel_btn, `click`, function (e) {
      geometry.closePopup();
      geometry._map.removeLayer(geometry);
    });
  },
  createEditUI: function(){
    var spotEditor = this;
    var spot = this.spot;
    var geometry = this.options.geometry;
    var container = L.DomUtil.create('div','surface-map-editor spot-editor', this.ui);
    var table = L.DomUtil.create(
      `table`,
      `surface-map-editor-table`,
      container
    );
    this.inputs['name'] = this.addInputRow(table, `Name`,"inputSpotName");
    this.inputs['name'].value = spot.name;
    this.inputs['target_uid'] = this.addInputRow(table, `Link ID`,"inputSpotTarget");
    this.inputs['target_uid'].value = spot.target_uid;
    this.inputs['world_x'] = this.addInputRow(table, `X (μm)`,"inputSpotWorldX");
    this.inputs['world_y'] = this.addInputRow(table, `Y (μm)`,"inputSpotWorldY");
    this.inputs['radius_in_um'] = this.addInputRow(table, `Radius (μm)`,"inputSpotRadius");
    this.inputs['world_x'].value = L.surfaceNumberFormatter(spot.world_x);
    this.inputs['world_y'].value = L.surfaceNumberFormatter(spot.world_y);
    if ('radius_in_um' in spot && spot.radius_in_um !== null){
      this.inputs['radius_in_um'].value = L.surfaceNumberFormatter(spot.radius_in_um);
    }
    var save_btn = L.DomUtil.create('button', 'btn btn-primary', container);
    save_btn.innerHTML = 'Save';
    var cancel_btn = L.DomUtil.create('button', 'btn btn-info', container);
    cancel_btn.innerHTML = 'Cancel';
    var delete_btn = L.DomUtil.create('button', 'btn btn-danger', container);
    delete_btn.innerHTML = 'Delete';
    L.DomEvent.on(save_btn, `click`, function (e) {
      attrib = spotEditor.to_attrib();
      spotEditor.options.onSave(attrib, {
        onSuccess: function(){
          geometry.closePopup();
          geometry._map.removeLayer(geometry);
        }
      });
    });
    L.DomEvent.on(cancel_btn, `click`, function (e) {
      spotEditor.options.onCancel({
        onSuccess: function(pos, opts){
          geometry.closePopup();
          geometry.setLatLng(pos);
          geometry.setRadius(opts.radius);
          geometry.setStyle(opts);    
        }
      });
    });
    L.DomEvent.on(delete_btn, `click`, function (e) {
      console.log('deleting...');
      spotEditor.options.onDelete({
        onSuccess: function(){
          geometry.closePopup();
          geometry._map.removeLayer(geometry);
        }
      });
    });
    return container;
  },
  createInfoUI: function(){
    if (this.spot === undefined){
      return;
    }
    var spot = this.spot;
    var container = L.DomUtil.create('div','surface-map-editor spot-info', this.ui);
    var title = L.DomUtil.create('div', 'nowrap', container);
    title.innerHTML = spot.name_with_id;
    if (spot.attachment_file_id){
      var image_url = "../attachment_files/" + spot.attachment_file_id;
      var image = L.DomUtil.create('div', '', container);
      var label = L.DomUtil.create('span','',image);
      label.innerHTML = 'image: '
      var image_link = L.DomUtil.create('a','nowrap',image)
      image_link.href = image_url;
      image_link.innerHTML = spot.attachment_file_name;
    }
    if (spot.target_uid){
      var link = L.DomUtil.create('div', '', container);
      link.innerHTML = 'link: ' + spot['target_link'];
    }
    return container;
  },
  addDividerRow: function (tableElement, labelString) {
    let tr = tableElement.insertRow();
    let tdDivider = tr.insertCell();
    tdDivider.colSpan = 2;
    tdDivider.innerHTML = labelString;
  },
  addDataRow: function (tableElement, labelString, ) {
    let tr = tableElement.insertRow();
    let tdLabel = tr.insertCell();
    tdLabel.innerText = labelString;
    let tdData = tr.insertCell();
    tdData.innerHTML = this.options.placeholderHTML;
    return tdData;
  },  
  addInputRow: function (tableElement, labelString, classname) {
    let tr = tableElement.insertRow();
    let tdLabel = tr.insertCell();
    tdLabel.innerText = labelString;
    let tdData = tr.insertCell();
    _inputcontainer = L.DomUtil.create("span", "uiElement input", tdData);
    var input = L.DomUtil.create("input", classname, _inputcontainer);
    input.type = "text";
    L.DomEvent.disableClickPropagation(input);
    input.value = this.options.placeholderHTML;
    return input;
  },
});
L.spotEditor = function(spot, options) {
  return new L.SpotEditor(spot, options);
}

L.surfaceNumberFormatter = function(number, opts = {digits:3}){
  return Number(number.toFixed(opts.digits));
}
L.SurfaceCircle = L.Circle.extend({
  getLatLngOnCircle: function (){
    var lng = this._latlng.lng,
        lat = this._latlng.lat,
        map = this._map,
        crs = map.options.crs;

    var d = Math.PI / 180,
        latR = (this._mRadius / crs.R) / d,
        top = map.project([lat + latR, lng]),
        bottom = map.project([lat - latR, lng]),
        p = top.add(bottom).divideBy(2),
        lat2 = map.unproject(p).lat,
        lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

        if (isNaN(lngR) || lngR === 0) {
          lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
        }
        return L.latLng(lat2, lng - lngR);
  },
  _project: function () {

    var lng = this._latlng.lng,
        lat = this._latlng.lat,
        map = this._map,
        crs = map.options.crs;
          if (true) {
              var d = Math.PI / 180,
                  latR = (this._mRadius / crs.R) / d,
                  top = map.project([lat + latR, lng]),
                  bottom = map.project([lat - latR, lng]),
                  p = top.add(bottom).divideBy(2),
                  lat2 = map.unproject(p).lat,
                  lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
                          (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

              if (isNaN(lngR) || lngR === 0) {
                  lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
        }
              this._point = p.subtract(map.getPixelOrigin());
              this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
        this._radiusY = p.y - top.y;
          } else {
              var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

              this._point = map.latLngToLayerPoint(this._latlng);
              this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
      }        
    this._updateBounds();
  }
});
L.SurfaceCircle.addInitHook(function(){
  var surface = this.options.surface;
  var styleEditor = this.options.styleEditor;
  var spotsLayer = this.options.spotsLayer;
  var spot = this.options.obj;
  var spotEditor = L.spotEditor(spot, {
                                        geometry: this, 
                                        spotsLayer: spotsLayer,
                                        onCreate: this.options.onCreate,
                                        onSave: this.options.onSave,
                                        onDelete: this.options.onDelete,
                                        onCancel: this.options.onCancel
                                      });
  this.options.spotEditor = spotEditor;
  popupContent = spotEditor.ui;
  this.bindPopup(popupContent, {
    maxWidth: "auto",
    minWidth: 200
  });
  this.on("popupopen", function(){
    var spotEditor = this.options.spotEditor;
    console.log("PopupOpen");
    styleEditor.enable(this);
    this.pm.enable();
    var tempMarker = this;
    var world = surface.latLng2world(tempMarker.getLatLng());
    var latlng1 = tempMarker.getLatLng();
    var latlng2 = tempMarker.getLatLngOnCircle();
    var radius_in_um = surface.latLngDistance2um(latlng1, latlng2);
    spotEditor.inputs['world_x'].value = L.surfaceNumberFormatter(world[0]);
    spotEditor.inputs['world_y'].value = L.surfaceNumberFormatter(world[1]);
    spotEditor.inputs['radius_in_um'].value = L.surfaceNumberFormatter(radius_in_um);
  });
  this.on("popupclose", function(){
    console.log("PopupClose");
    styleEditor.disable(this);
    this.pm.disable();
  });
  this.on('pm:edit', e => {
    var target = e.target
    var spotEditor = target.options.spotEditor;
    var latlng1 = target._latlng;
    var world1 = surface.latLng2world(latlng1);
    var latlng2 = target.getLatLngOnCircle();
    var radius_in_um = surface.latLngDistance2um(latlng1, latlng2);
    spotEditor.inputs['world_x'].value = L.surfaceNumberFormatter(world1[0]);
    spotEditor.inputs['world_y'].value = L.surfaceNumberFormatter(world1[1]);
    spotEditor.inputs['radius_in_um'].value = L.surfaceNumberFormatter(radius_in_um);
  });
  this.bindTooltip(spot.name, {permanent: true, className: "spotLabel", offset: [0, 0], opacity: 0.9 });
});
L.surfaceCircle = function(latlng, options) {
  var marker = new L.SurfaceCircle(latlng, options);
  return marker;
};