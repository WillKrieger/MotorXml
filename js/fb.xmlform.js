"use strict";

(function () {
    namespace("FormsBuilder.XMLForm", init, getCopy, copyPlantillas, reconstructXml, copyDeclaracion, getCopyDeclaracion, copyPrecarga, getCopyPrecarga, getDuplicatesProperties);
    window.fbXmlForm = FormsBuilder.XMLForm;
    var xmlForm;
    var xmlFormDeclaracion;
    var xmlFormPrecarga;
    var xmlPlantilla;

    function init(xmlDoc) {
        xmlForm = xmlDoc;
    }

    function copyDeclaracion(xmlDoc) {
        xmlFormDeclaracion = xmlDoc;
    }

    function copyPlantillas(data) {
        xmlPlantilla = data;
    }

    function reconstructXml() {
        var xml = $($.parseXML('<?xml version="1.0" encoding="utf-8" ?><definicionFormulario></definicionFormulario>')).find('definicionFormulario');
        xml.append($.parseXML(xmlPlantilla.modeloDatos).childNodes);
        xml.append($.parseXML(xmlPlantilla.diagramacion).childNodes);
        xml.append($.parseXML(xmlPlantilla.navegacion).childNodes);
        xml.append($.parseXML(xmlPlantilla.reglas).childNodes);
        xml.append($.parseXML(xmlPlantilla.catalogos).childNodes);
        xml.append($.parseXML(xmlPlantilla.ayudas).childNodes);

        return xml;
    }

    function getCopy() {
        return $(xmlForm);
    }

    function getDuplicatesProperties() {
        console.log("Not use in logic, only for debbuging purposes");
        var result = {};
        var temp = {};
        $(xmlForm).find('modeloDatos propiedad').each(function (index, node) {
            var idProperty = $(node).attr("id");
            var claveInformativa = $(node).attr('claveInformativa');
            var idEntidad = $(node).parents("entidad").attr("id");
            if (!$.isArray(temp[idProperty])) {
                temp[idProperty] = [];
            }

            temp[idProperty].push({
                idEntidad: idEntidad,
                idPropiedad: idProperty,
                claveInformativa: claveInformativa,
                nombre: $(node).attr("nombre"),
                xml: node
            });
        });

        for (var index in temp) {
            if (temp[index].length > 1) {
                result[index] = temp[index];
            }
        }
        result.print = function () {
            $.each(this, function (index, propiedades) {
                $.each(propiedades, function (innerIndex, value) {
                    if (value.idPropiedad == 1) {
                        return false;
                    }
                    if (innerIndex == 0) {
                        console.log("-----{0}------".format(value.idPropiedad));
                    }
                    console.log("IdEntidad: {0}, IdPropiedad: {1}".format(value.idEntidad, value.idPropiedad));
                });

            });
        };
        return result;
    }

    function getCopyDeclaracion() {
        return $(xmlFormDeclaracion);
    }

    function copyPrecarga(xmlDoc) {
        xmlFormPrecarga = xmlDoc;
    }

    function getCopyPrecarga() {
        return (xmlFormPrecarga !== undefined ? $(xmlFormPrecarga) : xmlFormPrecarga);
    }
})();
