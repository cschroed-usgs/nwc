/*global CONFIG,OpenLayers*/
OpenLayers.Control.WaterCensusToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {
    /**
     * @param {Object} object an optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (panelOptions, controls) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [panelOptions]);
        var controlsToAdd = [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.ZoomBox()
        ];
        if(controls){
            controlsToAdd = controlsToAdd.concat(controls);
        }
        this.addControls(controlsToAdd);
        // To make the custom navtoolbar use the regular navtoolbar style
        this.displayClass = 'olControlWaterCensusToolbar';
    },
    /**
     * Method: draw 
     * calls the default draw, and then activates mouse defaults.
     */
    draw: function () {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        this.defaultControl = this.controls[0];
        return div;
    }
});

OpenLayers.Control.HucSelectionTool = OpenLayers.Class(OpenLayers.Control, (function () {
    var exports = {};
    exports.type = OpenLayers.Control.TYPE_TOOL;
    exports.CLASS_NAME = 'OpenLayers.Control.HucSelectionTool';
    exports.handler = {
        setMap: function (map) {
            exports.map = map;
        },
        activate: function () {
            exports.map.getLayer(OpenLayers.Control.HucSelectionTool.mapLayerId).setVisibility(true);
            exports.map.getControl(OpenLayers.Control.HucSelectionTool.underlyingControlId).activate();
        },
        deactivate: function () {
            //restore non-base layer visibility
            exports.map.getControl(OpenLayers.Control.HucSelectionTool.underlyingControlId).deactivate();
        }
    };
    exports.initialize = function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.events.register('click', null, this.handler);
    };
    return exports;
}()));
//set static properties
OpenLayers.Control.HucSelectionTool.underlyingControlId = 'hucs';
OpenLayers.Control.HucSelectionTool.mapLayerId = 'huc-feature-layer';


OpenLayers.Control.BioSitesSelectionTool = OpenLayers.Class(OpenLayers.Control, (function () {
    var exports = {};
    exports.type = OpenLayers.Control.TYPE_TOOL;
    exports.CLASS_NAME = 'OpenLayers.Control.BioSitesSelectionTool';
    exports.handler = {
        setMap: function (map) {
            exports.map = map;
        },
        activate: function () {
            exports.map.getLayer(OpenLayers.Control.BioSitesSelectionTool.mapLayerId).setVisibility(true);
            exports.map.getControl(OpenLayers.Control.BioSitesSelectionTool.underlyingControlId).activate();
        },
        deactivate: function () {
            exports.map.getControl(OpenLayers.Control.BioSitesSelectionTool.underlyingControlId).deactivate();
        }
    };
    exports.initialize = function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.events.register('click', null, this.handler);
    };
    return exports;
}()));
//static properties
OpenLayers.Control.BioSitesSelectionTool.underlyingControlId = 'bioDataSites';
OpenLayers.Control.BioSitesSelectionTool.mapLayerId = 'biodata-sites-feature-layer';