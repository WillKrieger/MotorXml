/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una caja de texto
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", CuadroDetalleCompensaciones, loadedUICompensaciones);

    var CONTROL_LAYOUT = 'input';
    var LABEL_LAYOUT = 'etiqueta';

    function CuadroDetalleCompensaciones(control) {
        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var rowNewDiv = $('<div><div class="sat-height-field"></div><input type="text" onpaste="return false;" class="form-control sat-height-dlg sat-textbox-dialog sat-comp sat-height-field" placeholder=""><a idinput="{0}" data-toggle-compensaciones="modal" class="btn btn-primary btn-red sat-button-dialog">Detalle</a></div>'.format($(control).attr('id')));

        rowNewDiv.find(CONTROL_LAYOUT).attr('id', $(control).attr('id'));

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));
        var title = atributo.find('atributo[nombre="TituloCorto"]');
        var titleLarge = atributo.find('atributo[nombre="TituloLargo"]');
        //Roo
        //var helpText = atributo.find('atributo[nombre="AyudaEnLinea"]');
        var helpText = ctrlBase.getHelpText.apply(this, [control]);

        rowNewDiv.find('div').html(title.attr('valor'));

        if (atributo.attr('tipoDatos') === 'Numerico') {
            rowNewDiv.find(CONTROL_LAYOUT).addClass('currency');
        }

        ctrlBase.validaLongitud.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('cuadrodialogo', '');
        rowNewDiv.find(CONTROL_LAYOUT).attr('onkeydown', 'TabCuadroDetalle(event)');

        ctrlBase.ordenTabulador.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        var claveImpuesto = $(control).find('atributo[nombre="ClaveImpuesto"]');
        if (claveImpuesto.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('claveimpuesto', claveImpuesto.attr('valor') || '');
        }

        var helpString = ctrlBase.helpString.apply(this, [titleLarge, helpText]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('help-text', helpString);
        rowNewDiv.find(CONTROL_LAYOUT).attr('data-bind', 'valueUpdate: "blur", value: {0}'.format(db_id));
        rowNewDiv.find(CONTROL_LAYOUT).attr('view-model', db_id);
        rowNewDiv.find('a').attr('view-model', db_id);

        return rowNewDiv.html();
    }

    function loadedUICompensaciones() {
        $('#htmlOutput a[data-toggle-compensaciones]').on('click', function () {
            var campoCompensacion = $(this).parent().find('input[id="{0}"]'.format($(this).attr('idinput')));
            var rfc = AppDeclaracionesSAT.getConfig("rfc");
            FormsBuilder.CompensacionesSAT.initUIModalCompensaciones(rfc, $(campoCompensacion).attr('claveimpuesto'), $(campoCompensacion).attr('view-model'));
        });
    }
})();