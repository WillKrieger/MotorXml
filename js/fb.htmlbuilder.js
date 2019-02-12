"use strict";

(function () {
    namespace("FormsBuilder.HTMLBuilder", generate);

    var CONTROL_TYPE = "tipoControl";

    function generate(item) {
        var html = '';
        var control = $(item).attr(CONTROL_TYPE);

        if (FormsBuilder.Modules.hasOwnProperty(control)) {
            var widget = FormsBuilder.Modules[control];

            html = widget.call(widget, item);
        }

        return html;
    }
})();
