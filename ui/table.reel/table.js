/**
    @module "./table.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("ui/component").Component,
    observeProperty = require("frb/observers").observeProperty;

/**
    Description TODO
    @class module:"./table.reel".Table
    @extends module:montage/ui/component.Component
*/
exports.Table = Montage.create(Component, /** @lends module:"./table.reel".Table# */ {

    columnHeaderController: {
        value: null
    },

    contentController: {
        value: null
    },

    cellComponents: {
        value: null
    },

    observeProperty: {
        value: function (key, emit, source, parameters, beforeChange) {
            if (key === "valueAtCell") {
                console.log("get the value at a cell")
            } else {
                return observeProperty(this, key, emit, source, parameters, beforeChange);
            }
        }
    }


});
