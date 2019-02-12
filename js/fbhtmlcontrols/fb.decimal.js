/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una caja de texto
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", ControlDecimal);

    var CONTROL_LAYOUT = 'input';
    var LABEL_LAYOUT = 'etiqueta';

    function ControlDecimal(control) {
        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var rowNewDiv = $('<div><div class="sat-height-field"></div><input onpaste="return false;" ondragover="allowDrop(event)" ondragstart="blanktext(event.dataTransfer)" type="text" class="form-control sat-height-field" placeholder=""></div>');

        rowNewDiv.find(CONTROL_LAYOUT).attr('id', $(control).attr('id'));

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));
        var title = atributo.find('atributo[nombre="TituloCorto"]');
        var titleLarge = atributo.find('atributo[nombre="TituloLargo"]');
        //Roo
        //var helpText = atributo.find('atributo[nombre="AyudaEnLinea"]');
        var helpText = ctrlBase.getHelpText.apply(this, [control]);

        ctrlBase.muestraEnGrid.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.sinEtiqueta.apply(this, [control, rowNewDiv, title]);

        ctrlBase.ordenTabulador.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.validaLongitud.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.autoCompletarEnteros.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.mostrarDecimales.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('onkeydown', 'SoloNumerosDecimales(event)');

        ctrlBase.obligatorio.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.sinTitulo.apply(this, [control, rowNewDiv]);

        ctrlBase.forzarModoEdicion.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.alineacionTexto.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        var helpString = ctrlBase.helpString.apply(this, [titleLarge, helpText]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('help-text', helpString);
        rowNewDiv.find(CONTROL_LAYOUT).attr('data-bind', 'valueUpdate: "blur", value: {0}'.format(db_id));
        rowNewDiv.find(CONTROL_LAYOUT).attr('view-model', db_id);

        return rowNewDiv.html();
    }
})();