var Montage = require("montage").Montage;
var Component = require("ui/component").Component;

exports.Tree = Montage.create(Component, {

    treeController: {
        value: null
    },

    handleAddChildButtonAction: {
        value: function (event) {
            event.target.iteration.expanded = true;
            event.target.iteration.object.children.push({
                label: "",
                children: []
            })
            console.log(JSON.stringify(this.root, null, 2));
        }
    },

    handleRemoveNodeButtonAction: {
        value: function (event) {
            if (!event.target.iteration.parent)
                return;
            var child = event.target.iteration.object;
            var parent = event.target.iteration.parent.object;
            parent.children.delete(child);
            console.log(JSON.stringify(this.root, null, 2));
        }
    }

});
