/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var dom = require("montage/ui/dom");
var Point = require("montage/core/geometry/point").Point;

var ZOOM_IN_KEY = 61;
var ZOOM_OUT_KEY = 45;

exports.GridMagnifier = Montage.create(Component, {

    _loupe: {
        value: null,
        serializable: true
    },

    _canvas: {
        value: null
    },

    _gridCanvas: {
        value: null
    },

    _gridContext: {
        value: null
    },

    _zoomChanged: {
        value: true
    },

    _imageModified: {
        value: true
    },

    _sourceCanvas: {
        value: null
    },

    sourceCanvas: {
        get: function() {
            return this._sourceCanvas;
        },
        set: function(value) {
            if (value === this._sourceCanvas) {
                return;
            }

            this._sourceCanvas = value;
            this.needsDraw = true;
        }
    },

    _width: {
        value: null
    },

    _height: {
        value: null
    },

    _pageCenterX: {
        value: null
    },

    _pageCenterY: {
        value: null
    },

    x: {
        value: null
    },

    y: {
        value: null
    },

    pointMonitor: {
        value: null
    },

    colorPickerEnabled: {
        value: false
    },

    handleColorpick: {
        value: function(event) {
            this._pageCenterX = event.pageX;
            this._pageCenterY = event.pageY;
            this.x = event.canvasX;
            this.y = event.canvasY;
            this.sourceCanvas = event.canvas
            this.active = true;

            //TODO a change at any of these properties really indicates we need to draw
            this.needsDraw = true;
        }
    },

    handleColorpickend: {
        value: function() {
            this._pageCenterX = null;
            this._pageCenterY = null;
            this.grid = null;
            this.active = false;
        }
    },

    _followPointer: {
        value: false,
        serializable: true
    },

    followPointer: {
        get: function() {
            return this._followPointer;
        },
        set: function(value) {
            if (value === this._followPointer) {
                return;
            }

            this._followPointer = value;
            this.needsDraw = true;
        }
    },

    _active: {
        value: false
    },

    active: {
        get: function() {
            return this._active;
        },
        set: function(value) {
            if (value === this._active) {
                return;
            }

            // We only support zooming if we can turn off image smoothing canvas support

            if (this._active) {
                if (this._supportsImageSmoothingEnabled) {
                    document.removeEventListener("keypress", this, false);
                    document.removeEventListener("mousewheel", this, false);
                }
                document.application.removeEventListener("imagemodified", this, false);
            }

            this._active = value;

            if (this._active) {
                if (this._supportsImageSmoothingEnabled) {
                    document.addEventListener("keypress", this, false);
                    document.addEventListener("mousewheel", this, false);
                }
                document.application.addEventListener("imagemodified", this, false);
            }

            this.needsDraw = true;
        }
    },

    _zoomLevels: {
        distinct: true,
        value: [1,2,5,10,20]
    },

    zoomLevels: {
        get: function() {
            return this._zoomLevels;
        },
        set: function(value) {
            if (value === this._zoomLevels) {
                return;
            }

            this._zoomLevels = value;
            this._zoomChanged = true;
            this.needsDraw = true;
        }
    },

    zoomIndex: {
        enumerable: false,
        value: 3
    },

    zoom: {
        dependencies: ["zoomLevels", "zoomIndex"],
        get: function() {
             return this.zoomLevels[this.zoomIndex];
        }
    },

    zoomIn: {
        value: function() {
            if (this.zoomIndex === this.zoomLevels.length - 1) {
                return;
            }

            this.zoomIndex++;
            this._zoomChanged = true;
            this.needsDraw = true;
        }
    },

    zoomOut: {
        value: function() {
            if (0 === this.zoomIndex) {
                return;
            }

            this.zoomIndex--;
            this._zoomChanged = true;
            this.needsDraw = true;
        }
    },

    handleKeypress: {
        value: function(evt) {
            if (evt.charCode === ZOOM_IN_KEY) {
                this.zoomIn();
            } else if (evt.charCode === ZOOM_OUT_KEY) {
                this.zoomOut();
            }
        }
    },

    handleMousewheel: {
        value: function(evt) {
            if (evt.wheelDelta > 1) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        }
    },

    handleImagemodified: {
        value: function() {
            this._imageModified = true;
            this.needsDraw = true;
        }
    },

    _supportsImageSmoothingEnabled: {
        value: false
    },

    prepareForDraw: {
        value: function() {
            document.application.addEventListener("colorpick", this, false);
            document.application.addEventListener("colorpickend", this, false);

            // TODO this is a workaround for a problem with our deserialization in iOS concerning
            // canvas elements. Debugging points to some issue with adoptNode. Either way,
            // if we don't do this it takes two draw cycles to actually get the canvas rendering.
            var newCanvas = this._canvas.cloneNode(true);
            this._canvas.parentNode.replaceChild(newCanvas, this._canvas);
            this._canvas = newCanvas;

            this._context = this._canvas.getContext("2d");

            this._gridContext = this._gridCanvas.getContext("2d");

            if (this._context.hasOwnProperty("webkitImageSmoothingEnabled")) {
                this._context.webkitImageSmoothingEnabled = false;
                this._supportsImageSmoothingEnabled = true;
            }
        }
    },

    _borderTopWidth: {
        value: 0
    },

    _borderLeftWidth: {
        value: 0
    },

    _sourceWidth: {
        value: 0
    },

    _sourceHeight: {
        value: 0
    },

    willDraw: {
        value: function() {
            this._width = this._loupe.offsetWidth;
            this._height = this._loupe.offsetHeight;

            var getStyle = this._loupe.ownerDocument.defaultView.getComputedStyle;
            this._borderTopWidth = getStyle(this._loupe).getPropertyValue("border-top-width").replace("px", "");
            this._borderLeftWidth = getStyle(this._loupe).getPropertyValue("border-left-width").replace("px", "");

            if (this.sourceCanvas) {
                this._sourceWidth = this.sourceCanvas.offsetWidth;
                this._sourceHeight = this.sourceCanvas.offsetHeight;
            }
        }
    },

    draw: {
        value: function() {

              // Don't draw unless we have something to actually draw
            if (!this.active) {
                this.element.classList.remove("active");
                return;
            }

            this.element.classList.add("active");

            if (this.followPointer) {
                this.element.classList.remove("stationary");
            } else {
                this.element.classList.add("stationary");
            }

            var loupeWidth = this._width,
                loupeHeight = this._height,
                loupeCenterX = loupeWidth/2,
                loupeCenterY = loupeHeight/2,
                zoom = this.zoom,
                gridSize = zoom,
                gridCenterDistance = gridSize / 2,
                translateX = this._pageCenterX - loupeCenterX - gridCenterDistance,
                translateY = this._pageCenterY - loupeCenterY - gridCenterDistance,
                relativePoint = dom.convertPointFromPageToNode(this.element.parentNode, Point.create().init(translateX, translateY)),
                context = this._context,
                rowCount = Math.floor(loupeWidth / gridSize),
                columnCount = Math.floor(loupeHeight / gridSize),
                elementStyle = this.element.style;

            // Move to the right spot
            if (this.followPointer) {
                elementStyle.transform =
                elementStyle.MozTransform = "translate(" + relativePoint.x + "px, " + relativePoint.y + "px)";
                elementStyle.webkitTransform = "translate3d(" + relativePoint.x + "px, " + relativePoint.y + "px , 0)";

            } else {
                elementStyle.transform =
                elementStyle.MozTransform = "translate(0, 0)";
                elementStyle.webkitTransform = "translate3d(0, 0, 0)";
            }

            if (window.largeCanvas && this._supportsImageSmoothingEnabled) {
                this.drawLargeCanvasLoupe(context, zoom, loupeCenterX, loupeCenterY);
            } else if (this._supportsImageSmoothingEnabled) {
                context.clearRect(0, 0, loupeWidth, loupeHeight);
                this.drawCanvasLoupe(context, zoom, loupeCenterX, loupeCenterY);
            } else {
                context.clearRect(0, 0, loupeWidth, loupeHeight);
                this.drawManualLoupe(context, gridSize, rowCount, columnCount);
            }

            if (this._zoomChanged) {
                this.drawGrid(this._gridContext, zoom, gridSize, loupeWidth, loupeHeight, columnCount, rowCount);
            }

        }
    },

    drawManualLoupe: {
        value: function(context, gridSize, rowCount, columnCount) {

            if (10 !== gridSize) {
                return;
            }

            var gridExtent = 20,
                halfGridExtent = 10,
                focusGrid = this._sourceCanvas.getContext("2d").getImageData(this.x - halfGridExtent, this.y - halfGridExtent, gridExtent, gridExtent),
                gridData = focusGrid.data,
                x,
                y,
                i = 0;

            // Draw color squares
            for (y = 0; y < rowCount; y++) {
                for (x = 0; x < columnCount; x++) {
                    context.fillStyle = "rgba(" + gridData[i] + "," + gridData[i+1] + "," + gridData[i+2] + "," + gridData[i+3] + ")";
                    context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                    i += 4;
                }
            }
        }
    },

    drawCanvasLoupe: {
        value: function(context, zoom, loupeCenterX, loupeCenterY) {

            var inverseZoom = zoom * -1,
                left = this.x * inverseZoom + loupeCenterX - this._borderLeftWidth,
                top = this.y * inverseZoom + loupeCenterY - this._borderTopWidth;

            // TODO I used the splice aspects of drawImage, but it didn't seem to help much
            context.drawImage(this._sourceCanvas, left, top, this._sourceWidth * zoom, this._sourceHeight * zoom);
        }
    },

    drawLargeCanvasLoupe: {
        value: function(context, zoom, loupeCenterX, loupeCenterY) {

            var inverseZoom = zoom * -1,
                left = this.x * inverseZoom + loupeCenterX - this._borderLeftWidth,
                top = this.y * inverseZoom + loupeCenterY - this._borderTopWidth,
                w,
                h;

            if (this._imageModified || this._zoomChanged) {
                w = this._canvas.width = this._sourceWidth * zoom;
                h = this._canvas.height = this._sourceHeight * zoom;
                context = this._canvas.getContext("2d");
                context.webkitImageSmoothingEnabled = false;
                context.drawImage(this._sourceCanvas, 0, 0, w, h);
                this._imageModified = false;
            }

            this._canvas.style.webkitTransform = "translate3d(" +left + "px, " + top + "px , 0)";
        }
    },

    drawGrid: {
        value: function(context, zoom, gridSize, loupeWidth, loupeHeight, columnCount, rowCount) {
            var x,
                y;

            context.clearRect(0, 0, loupeWidth, loupeHeight);

            context.strokeStyle = '#000';
            context.lineWidth   = 1;

            if (zoom >= 10) {
                context.globalAlpha = 0.1;
                context.globalCompositeOperation = 'xor';

                context.beginPath();

                for (x = 0; x <= loupeWidth; x += gridSize) {
                    context.moveTo(x, 0);
                    context.lineTo(x, loupeHeight);
                }

                for (y = 0; y <= loupeHeight; y += gridSize) {
                    context.moveTo(0, y);
                    context.lineTo(loupeWidth, y);
                }

                context.stroke();
                context.closePath();
            }

            // Draw focus rectangle
            context.globalAlpha = 1;
            context.globalCompositeOperation = 'source-over';
            context.strokeRect(Math.floor(columnCount/2) * gridSize, Math.floor(rowCount/2)* gridSize, gridSize, gridSize);

            this._zoomChanged = false;
        }
    }

});
