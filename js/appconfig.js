"use strict";

(function () {
    namespace("AppDeclaracionesSAT", getConfig, setConfig, getConst);

    var constants = {};

    constants['TipoDeclaracionNormal'] = "001";
    constants['TipoDeclaracionNormalCorrecionFiscal'] = "003";
    constants['TipoDeclaracionComplementaria'] = "002";
    constants['TipoDeclaracionComplementariaCorrecionFiscal'] = "004";
    constants['TipoDeclaracionComplementariaDictamen'] = "005";
    constants['TipoDeclaracionComplementariaEsquemaAnterior'] = "006";
    constants['TipoDeclaracionComplementariaDesconsolidacion'] = "009";
    constants['TipoDeclaracionComplementariaDesincorporacion'] = "010";

    constants['TipoComplementariaDejarSinEfecto'] = "002";
    constants['TipoComplementariaModificacionObligaciones'] = "003";
    constants['TipoComplementariaEsquemaAnterior'] = '006';

    constants["TotalAPagarViewModelId"] = "E1024P24007";

    var config = {};
    config['rfc'] = '';
    config['nombre'] = '';
    config['tipodeclaracion'] = '';
    config['tipopersona'] = '';
    config['tipocomplementaria'] = '';
    config['origen'] = '';
    config['ejercicio'] = 0;
    config['ejercicioperfil'] = 2017;
    config['debug'] = false;
    config['firmalinea'] = true;

    function getConfig(key) {
        return config[key];
    }

    function setConfig(key, value) {
        config[key] = value;
    }

    function getConst(key) {
        return constants[key];
    }
})();