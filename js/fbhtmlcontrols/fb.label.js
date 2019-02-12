/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una etiqueta
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", Etiqueta);

    function Etiqueta(control) {
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var rowNewDiv = $('<div><div class="sat-height-field sat-padding-label"></div><div class="sat-height-field sat-padding-label"></div></div>');

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));

        var title = atributo.find('atributo[nombre="TituloCorto"]');

        var negrita = $(control).find('atributo[nombre="Negritas"]');
        if (negrita.length > 0) {
            rowNewDiv.find('div:last').html("<b>{0}</b>".format(title.attr('valor')));
        } else {
            rowNewDiv.find('div:last').html(title.attr('valor'));
        }

        var centrarTitulo = $(control).find('atributo[nombre="CentrarTitulo"]');
        if (centrarTitulo.length > 0) {
            rowNewDiv.find('div:last').css("text-align", "center");
        }

        var sinTitulo = $(control).find('atributo[nombre="SinTitulo"]');
        if (sinTitulo.length > 0) {
            var valor = sinTitulo.attr('valor');
            if (valor === '2') {
                rowNewDiv.find('div:first').css('min-height', '20px');
            } else {
                rowNewDiv.find('div:first').remove();
            }
        }

        rowNewDiv.find('div:last').attr('view-model', db_id);
        return rowNewDiv.html();
    }
})();