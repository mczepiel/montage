var Montage = require("montage").Montage,
    TestController = require("support/test-controller").TestController;

exports.TreeTest = Montage.create(TestController, {

    treeController: {
        value: null
    },

    templateDidLoad: {
        value: function () {
            this.treeController.object = {"label": "Root", "children": []};
        }
    }

});
