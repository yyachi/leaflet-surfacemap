L.Map.include({
    _surface: function () {
        return this.options.surface;
    },
    latLng2world: function (latLng) {
        surface = this._surface();
        center = [surface.center_x, surface.center_y];
        length = surface.length;
        point = this.project(latLng, 0)
        ratio = 2 * 20037508.34 / length
        x = center[0] - length / 2.0 + point.x * length / 256;
        y = center[1] + length / 2.0 - point.y * length / 256;
        return [x, y]
    },
    world2latLng: function (world) {
        x_w = world[0];
        y_w = world[1];
        surface = this._surface();
        center = [surface.center_x, surface.center_y];
        length = surface.length;
        x = (x_w - center[0] + length / 2.0) * 256 / length
        y = (-y_w + center[1] + length / 2.0) * 256 / length
        latLng = this.unproject([x, y], 0)
        return latLng;
    }
});