/**
    @module "ui/table-cell.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Substitution = require("ui/substitution.reel").Substitution;

/**
    Description TODO
    @class module:"ui/table-cell.reel".TableCell
    @extends module:montage/ui/component.Component
*/
exports.TableCell = Montage.create(Substitution, /** @lends module:"ui/table-cell.reel".TableCell# */ {

    didCreate: {
        value: function () {
            Substitution.didCreate.call(this);
            console.log("heyeyey create")
        }
    },

    hasTemplate: {
        enumerable: false,
        value: true
    },

    owner: {
        value: null
    },

    property: {
        value: null
    },

    prepareForDraw: {
        value: function () {
            console.log("cell template loaded", this.innerTemplate.html, this.switchComponents);
        }
    },

    innerTemplate: {
        serializable: false,
        get: function() {
            var innerTemplate = this._innerTemplate,
                ownerDocumentPart,
                ownerTemplate,
                elementId,
                deserializer,
                externalObjectLabels,
                externalObjects;

            if (!innerTemplate) {
                ownerDocumentPart = this._ownerDocumentPart;

                if (ownerDocumentPart) {
                    ownerTemplate = ownerDocumentPart.template;

                    elementId = this.element.getAttribute("data-montage-id");
                    innerTemplate = ownerTemplate.createTemplateFromElementContents(elementId);

                    deserializer = innerTemplate.getDeserializer();
                    externalObjectLabels = deserializer.getExternalObjectLabels();
                    ownerTemplateObjects = ownerDocumentPart.objects;
                    externalObjects = Object.create(null);

                    for (var i = 0, label; (label = externalObjectLabels[i]); i++) {
                        externalObjects[label] = ownerTemplateObjects[label];
                    }
                    innerTemplate.setInstances(externalObjects);

                    this._innerTemplate = innerTemplate;
                }
            }

            return innerTemplate;
        },
        set: function(value) {
            console.log("set InnerTemplate", value.html, this, value.uuid)
            var self = this;
            this._innerTemplate = value;

            if (this.element) {
                value.instantiate(this.element.ownerDocument)
                    .then(function(part) {
                        console.log("hello")

                    }).done();
            }
            console.log("here we go!")
        }
    }

});
