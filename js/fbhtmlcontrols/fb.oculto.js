/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea un control oculto
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", Oculto);

    var CONTROL_LAYOUT = 'input';

    function Oculto(control) {
        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var rowNewDiv = $('<div><input type="hidden" class="form-control" id=""></div>');

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));

        var copiadoDesde = $(control).find('atributo[nombre="CopiadoDesde"]');
        if (copiadoDesde.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('copiadoDesde', copiadoDesde.attr('valor'));
        }

        if (atributo.attr('tipoDatos') === 'Numerico') {
            rowNewDiv.find(CONTROL_LAYOUT).addClass('currency');
        }

        ctrlBase.muestraEnGrid.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('id', $(control).attr('id'));

        rowNewDiv.find(CONTROL_LAYOUT).attr('data-bind', 'value: {0}'.format(db_id));
        rowNewDiv.find(CONTROL_LAYOUT).attr('view-model', db_id);
        return rowNewDiv.html();
    }
})();