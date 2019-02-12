/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una lista
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", list);

    function list(control) {
        var rowNewDiv = $('<div><select multiple="multiple" class="form-control"></select></div>');

        var elementAdding = '';
        $.each(FormsBuilder.Catalogs.getAll().find("[id='002']").find("item"), function (k, v) {
            elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("value"), $(v).attr("text"));
        });

        rowNewDiv.find('select').append(elementAdding);

        return rowNewDiv.html();
    }
})();