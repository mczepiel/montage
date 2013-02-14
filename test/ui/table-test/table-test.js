var Montage = require("montage").Montage,
    TestController = require("support/test-controller").TestController;

exports.TableTest = Montage.create(TestController, {

    columnHeaderController: {
        value: null
    },

    contentController: {
        value: null
    },

    templateDidLoad: {
        value: function () {
            this.contentController.content = [
                {name: "Alice", location: "Villanova"},
                {name: "Bob", location: "Bryn Mawr"},
                {name: "Carol", location: "Ardmore"},
                {name: "David", location: "Wynnewood"}];

            this.columnHeaderController.content = ["name", "location"];
        }
    }

});
