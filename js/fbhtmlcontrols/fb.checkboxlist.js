/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una caja de texto
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", CuadroVerificacionLista);

    var CONTROL_LAYOUT = 'div:last';
    var LABEL_LAYOUT = 'texto';

    function CuadroVerificacionLista(control) {
        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var detalleCheckbox = FormsBuilder.ViewModel.getDetalleCheckbox();
        detalleCheckbox[db_id] = {};

        var rowNewDiv = $('<div><div class="sat-height-field"></div><div></div></div>');

        rowNewDiv.find('input').attr('id', $(control).attr("id"));

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));

        var catalogo = atributo.find('atributo[nombre="Catalogo"]');
        var catalogoValorInicial = atributo.find('atributo[nombre="ValorInicial"]');

        var titleLarge = atributo.find('atributo[nombre="TituloLargo"]');
        //Roo
        //var helpText = atributo.find('atributo[nombre="AyudaEnLinea"]');
        var helpText = ctrlBase.getHelpText.apply(this, [control]);
        var elementAdding = '';
        $.each(FormsBuilder.Catalogs.getAll().find('[id="{0}"]'.format(catalogo.attr('valor'))).find("elemento"), function (k, v) {
            elementAdding += '<span class="chlist"><input class="chckbx" onclick="changevalue(this, {0})" vmvalue="{1}" type="checkbox"> <label class="lbl-chckbx">{2}</label></span>'.format(($(v).attr('valor') === '' ? 0 : $(v).attr('valor')), db_id, $(v).attr(LABEL_LAYOUT));
        });

        rowNewDiv.find(CONTROL_LAYOUT).append(elementAdding);
        rowNewDiv.find(CONTROL_LAYOUT).attr('id', $(control).attr('id'));

        var title = atributo.find('atributo[nombre="TituloCorto"]');

        var sinEtiqueta = $(control).find('atributo[nombre="SinEtiqueta"]');
        if (sinEtiqueta.length <= 0) {
            var negrita = $(control).find('atributo[nombre="Negritas"]');
            if (negrita.length > 0) {
                rowNewDiv.find('div:first').html("<b>{0}</b>".format(title.attr('valor') || ''));
            } else {
                rowNewDiv.find('div:first').html(title.attr('valor') || '');
            }
        }

        var paneldinamico = $(control).find('atributo[nombre="Panel"]');
        if (paneldinamico.length > 0) {
            rowNewDiv.find('input').attr('PanelDinamico', paneldinamico.attr('valor') || '');
        }

        ctrlBase.ordenTabulador.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.sinTitulo.apply(this, [control, rowNewDiv]);
        var helpString = ctrlBase.helpString.apply(this, [titleLarge, helpText]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('help-text', helpString);
        rowNewDiv.find('input').attr('view-model', db_id);
        return rowNewDiv.html();
    }
})();