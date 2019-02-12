/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una caja de texto
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", ControlVacio);

    function ControlVacio(control) {
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var rowNewDiv = $('<div><div class="sat-height-field"></div><div class="sat-height-field ctlvacio"></div></div>');

        ctrlBase.sinTitulo.apply(this, [control, rowNewDiv]);
        rowNewDiv.find('div:last').attr('view-model', db_id);
        return rowNewDiv.html();
    }
})();