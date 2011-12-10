/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = require("montage").Montage,
    Component = require("ui/component").Component,
    dom = require("ui/dom");

exports.ConnectionInspector = Montage.create(Component, {

    _connectionCanvas: {
        enumerable: false,
        value: null
    },

    deserializedFromTemplate: {
        value: function() {
            this.init();
        }
    },

    init: {
        value: function() {
            this.element = document.createElement("div");
            document.addEventListener("keydown", this, false);
        }
    },

    handleKeydown: {
        value: function(evt) {
            // ctrl-shift-d to toggle ?
            if (evt.ctrlKey && evt.shiftKey && 68 === evt.keyCode) {
                if (!this.element.parentNode) {
                    this.install();
                }

                this.enabled = !this.enabled;
            }
        }
    },

    install: {
        value: function() {
            document.body.appendChild(this.element);
            this.needsDraw = true;

            document.application.eventManager.delegate = this;
        }
    },

    _enabled: {
        value: false
    },

    enabled: {
        get: function() {
            return this._enabled;
        },
        set: function(value) {
            if (value === this._enabled) {
                return;
            }

            this._enabled = value;
            this.needsDraw = true;
        }
    },

    willDistributeEvent: {
        value: function(evt) {

            // Allow the activation toggle keystroke through (ctrl+shift+d)
            if ("keydown" === evt.type && evt.ctrlKey && evt.shiftKey && 68 === evt.keyCode) {
                return;
            }

            // Let bindings continue to work
            // TODO limit it to bindings involving the debugger system
            if (evt.type.match(/change/)) {
                return;
            }



            if (this.enabled) {

                console.log("")
                console.log("willDistribute", evt.type)
                var eventOnInspector = false,
                target = evt.target._element ? evt.target._element : event.target;

                while (!eventOnInspector && target && target.parentNode && target !== document.documentElement) {

                    if (target === this.element) {
                        eventOnInspector = true;
                    }

                    target = target.parentNode;
                }

                if (!eventOnInspector) {
                    evt.stopImmediatePropagation();
                    evt.preventDefault();

                    if ("mousedown" === evt.type) {
                        this.inspectedObject = this.nearestComponentToElement(evt.target);
                    }
                }
            }
        }
    },

    _inspectedObject: {
        value: null
    },

    inspectedObject: {
       get: function() {
           return this._inspectedObject;
       },
       set: function(value) {
           if (value === this._inspectedObject) {
               return;
           }

           this._boundProperties = null;

           this._inspectedObject = value;
           this.needsDraw = true;

           //TODO put in state to respond to component hierarchy traversal
       }
   },

    _boundProperties:{
        value:null
    },

    boundProperties:{
        dependencies:["inspectedObject"],
        get:function () {
            if (!this._boundProperties && this.inspectedObject && this.inspectedObject._bindingDescriptors) {
                this._boundProperties = Object.keys(this.inspectedObject._bindingDescriptors).map(function (key) {
                    return {"sourcePropertyPath": key, "bindingDescriptor": this[key]};
                }, this.inspectedObject._bindingDescriptors)
            }
            return this._boundProperties;
        }
    },

    handleParentButtonAction: {
        value: function() {
            if (this.inspectedObject && this.inspectedObject.parentComponent) {
                this.inspectedObject = this.inspectedObject.parentComponent;
            }
        }
    },

    willDraw: {
        value: function() {
            this._width = this.element.offsetWidth;
            this._height = this.element.offsetHeight;
        }
    },

    draw: {
        value: function() {

            if (this._enabled) {
                this.element.classList.add("enabled");
            } else {
                this.element.classList.remove("enabled");
            }

            if (!this.inspectedObject) {
                //TODO cleanup and then stop
                return;
            }

            var canvas = this._connectionCanvas,
                context;

            canvas.width = this._width;
            canvas.height = this._height;

            context = canvas.getContext('2d');

            var sourceColor = "hsl(195,96%,53%)",
                boundColor = "hsl(195,86%,40%)";

            context.font = "12px Helvetica";
            context.strokeStyle = sourceColor;
            context.lineWidth = 1;

            var sourceCenter = this._highlightElement(context, this.inspectedObject.element);

            var binding,
                boundCenter;
            for (var key in this.inspectedObject._bindingDescriptors) {
                binding = this.inspectedObject._bindingDescriptors[key];
                console.log(key, binding)
                if (binding.boundObject.element) {
                    context.strokeStyle = boundColor;
                    boundCenter = this._highlightElement(context, binding.boundObject.element);
                } else {
                    context.strokeStyle = "red";
                    context.strokeRect(100, 100, 100, 100);
                    boundCenter = {x: 150, y: 150};
                }

                context.strokeStyle = sourceColor;
                this._drawBinding(context, this.inspectedObject, key, binding, sourceCenter, boundCenter);
            }

        }
    },

    // returns the center point for easy line connections
    _highlightElement: {
        value: function(context, element) {
            var point = dom.convertPointFromNodeToPage(element);
            // minus border width of this whole thing
            context.strokeRect(point.x - 3, point.y - 3, element.offsetWidth, element.offsetHeight);
            return {x: point.x - 3 + element.offsetWidth/2, y: point.y - 3 + element.offsetHeight/2};
        }
    },

    _drawBinding: {
        value: function(context, source, key, binding, sourceCenter, boundCenter) {
            var boundObjectPropertyPath = binding.boundObjectPropertyPath;
            context.strokeText(key, sourceCenter.x, sourceCenter.y)

            context.beginPath();
            context.moveTo(sourceCenter.x, sourceCenter.y);
            context.lineTo(boundCenter.x, boundCenter.y);
            context.stroke();

            context.strokeText(boundObjectPropertyPath, boundCenter.x, boundCenter.y)
        }
    },

    nearestComponentToElement: {
        value: function(element) {

            var target = element,
                previousTarget,
                component;

            do {
                component = this.eventManager.eventHandlerForElement(target);


                if (component) {
                    return component;
                }

                // TODO this is pretty much too simple to work, but it's a start
                previousTarget = target;
                target = target.parentNode;

            } while (target);

            return null;
        }
    }

});
