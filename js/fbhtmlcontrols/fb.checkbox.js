/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una caja de texto
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", CuadroVerificacion);

    var CONTROL_LAYOUT = 'input';
    var LABEL_LAYOUT = 'texto';

    function CuadroVerificacion(control) {
        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var rowNewDiv = $('<div><div class="sat-height-field"></div><input class="form-control sat-height-field" type="checkbox"><div style="clear: both;"></div></div>');

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));

        var titleLarge = atributo.find('atributo[nombre="TituloLargo"]');
        //Roo
        //var helpText = atributo.find('atributo[nombre="AyudaEnLinea"]');
        var helpText = ctrlBase.getHelpText.apply(this, [control]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('id', $(control).attr('id'));

        var title = atributo.find('atributo[nombre="TituloCorto"]');
        ctrlBase.sinEtiqueta.apply(this, [control, rowNewDiv, title]);

        var paneldinamico = $(control).find('atributo[nombre="Panel"]');
        if (paneldinamico.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('PanelDinamico', paneldinamico.attr('valor') || '');
        }

        ctrlBase.ordenTabulador.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.sinTitulo.apply(this, [control, rowNewDiv]);

        var helpString = ctrlBase.helpString.apply(this, [titleLarge, helpText]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('help-text', helpString);
        rowNewDiv.find(CONTROL_LAYOUT).attr('data-bind', 'checked: {0}'.format(db_id));
        rowNewDiv.find(CONTROL_LAYOUT).attr('view-model', db_id);
        return rowNewDiv.html();
    }
})();