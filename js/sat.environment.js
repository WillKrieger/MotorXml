/** @module SAT.Environment */
/**
 * Modulo que inicia una variable de entorno
 *
 * (c) SAT 2013, Iván González
 */
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function() {
    namespace("SAT.Environment", settings, setSetting);

    var ObjSettings = {};
    ObjSettings['isHydrate'] = false;
    ObjSettings['isModified'] = false;
    ObjSettings['applyrulesvalidation'] = true;
    ObjSettings['showdialogs'] = true;
    ObjSettings['dejarsinefecto'] = false;
    ObjSettings['esquemaanterior'] = false;
    ObjSettings['applyrules'] = true;
    ObjSettings['appversion'] = '0.6.1'; // Version mayor, Version menor, Compilacion
    ObjSettings['isRowClicked'] = false;
    ObjSettings['isMacOSX'] = false;
    ObjSettings['loadedPrecargarAnexo'] = false;
    ObjSettings['thisPropertiesNotExecuteRules'] = [];
    ObjSettings['entidadReteneciones'] = ["1098", "1012", "1041"];
    ObjSettings['urlenvio'] = "http://localhost:33850/Home/RecibirArchivo";
    ObjSettings['urlelimina'] = "http://localhost:33850/Home/EliminaArchivo";
    ObjSettings['urlConsultaEstado'] = "";
    ObjSettings['catalogoOtrosEstimulos'] = "27";
    ObjSettings['catalogoFiltroOtrosEstimulos'] = "146";
    ObjSettings['ejercicioFiltroOtrosEstimulos'] = 2017;


    function settings(key) {
        ObjSettings['loadXMLTemplate'] = false;
        ObjSettings['debug'] = true;
        ObjSettings['environment'] = 'dev';
        ObjSettings['typeapp'] = 'web'; //web || desktop

        return ObjSettings[key];
    }

    function setSetting(key, value) {
        ObjSettings[key] = value;
    }

})();