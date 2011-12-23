/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;

exports.Preloader = Montage.create(Component, {

    _images: {
        enumerable: false,
        value: null
    },

    images: {
        get: function() {
            return this._images;
        },
        set: function(value) {
            if (this._images) {
                throw "Sorry, images preloader is a one time use only right now";
            }

            this._images = value;
            this.preloadImages();

        }
    },

    preloadImages: {
        value: function() {
            var i, iImage, iImageElement;

            for(i = 0; (iImage = this.images[i]); i++) {
                iImageElement = document.createElement("img");
                this.canDrawGate.setField(iImageElement.uuid, false);
                iImageElement.addEventListener("load", this, false);
                iImageElement.setAttribute("src", iImage);
//                this.element.appendChild(iImageElement);
            }
        }
    },

    handleLoad: {
        value: function(event) {
            this.canDrawGate.setField(event.target.uuid, true);
        }
    }

});

