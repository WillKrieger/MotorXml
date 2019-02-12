/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una lista desplegable
*
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", CuadroCombinado);

    var CONTROL_LAYOUT = 'select';
    var LABEL_LAYOUT = 'texto';

    function CuadroCombinado(control) {
        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var rowNewDiv = $('<div><div class="sat-height-field"></div><select class="form-control sat-height-field"></select></div>');

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));

        var catalogo = atributo.find('atributo[nombre="Catalogo"]');
        var catalogoValorInicial = atributo.find('atributo[nombre="ValorInicial"]');

        var titleLarge = atributo.find('atributo[nombre="TituloLargo"]');
        //Roo
        //var helpText = atributo.find('atributo[nombre="AyudaEnLinea"]');
        var helpText = ctrlBase.getHelpText.apply(this, [control]);

        var elementAdding = '';
        var ejercicioDeclaracion = 2016;

        if (catalogo.attr("valor") == SAT.Environment.settings("catalogoOtrosEstimulos")
            && ejercicioDeclaracion >= SAT.Environment.settings("ejercicioFiltroOtrosEstimulos")) {

            var regimen = "5";

            if (!IsNullOrEmptyWhite(regimen)) {
                $.each(FormsBuilder.Catalogs.getAll().find('[id="{0}"]'.format(SAT.Environment.settings("catalogoFiltroOtrosEstimulos")))
                    .find("elemento[regimen='{0}']".format(regimen)), function (key, filtro) {
                        var catalogoOtrosEstimulos = FormsBuilder.Catalogs.getAll().find('[id="{0}"]'.format(catalogo.attr("valor")));
                        var valorFiltro = $(filtro).attr("valor");
                        var texto = catalogoOtrosEstimulos.find("elemento[valor='{0}']".format(valorFiltro)).attr("texto");

                        elementAdding += '<option value="{0}">{1}</option>'.format(valorFiltro, texto);
                    });
            }
        } else {
            $.each(FormsBuilder.Catalogs.getAll().find('[id="{0}"]'.format(catalogo.attr('valor'))).find("elemento"), function (k, v) {
                elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("valor"), $(v).attr(LABEL_LAYOUT));
            });
        }

        rowNewDiv.find(CONTROL_LAYOUT).append(elementAdding);
        rowNewDiv.find(CONTROL_LAYOUT).attr('id', $(control).attr('id'));

        var title = atributo.find('atributo[nombre="TituloCorto"]');

        ctrlBase.muestraEnGrid.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.sinEtiqueta.apply(this, [control, rowNewDiv, title]);

        ctrlBase.ordenTabulador.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.sinTitulo.apply(this, [control, rowNewDiv]);

        ctrlBase.obligatorio.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.forzarModoEdicion.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.sinDuplicidad.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        ctrlBase.mensajeValidacion.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        var helpString = ctrlBase.helpString.apply(this, [titleLarge, helpText]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('help-text', helpString);
        rowNewDiv.find(CONTROL_LAYOUT).attr('data-bind', 'value: {0}'.format(db_id));
        rowNewDiv.find(CONTROL_LAYOUT).attr('view-model', db_id);

        return rowNewDiv.html();
    }
})();