/** @module FormsBuilder.Runtime */
/**
* Modulo que realiza las evaluaciones de expresiones
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Runtime", init, runInitRules, runSubregimenesRules, initFormulario, getRules, evaluate, evaluateGrid);
    var rules = {};

    var LAUNCHER_RULE = 'propiedad';
    var RULES_RULE = 'regla';

    var resultado = [];

    function getRules() {
        return rules;
    }

    function init(xmlDoc, cb) {
        var launchers = $(xmlDoc).find('definicionReglas').find(LAUNCHER_RULE);
        var db_id;

        $.each(launchers, function (key, value) {
            db_id = FormsBuilder.Utils.getDbId2(value);

            if (rules[db_id] === undefined) {
                rules[db_id] = [];
            }
            rules[db_id].push({
                idRegla: $(value).attr("idRegla")
            });
        });

        cb();
    }

    function runInitRules() {
        var xmlDoc = FormsBuilder.XMLForm.getCopy();
        var reglas = xmlDoc.find('definicionReglas').find(RULES_RULE);

        var fieldExpr;
        var regla;

        $.each(reglas, function (key, reglaItem) {
            try {
                regla = $(reglaItem);
                var isInitRule = regla.attr('ejecutarAlInicio') === "1" || regla.attr('ejecutarEnSubregimenes') == "1";
                switch (regla.attr('tipoRegla')) {
                    case "Validacion":
                        if (AppDeclaracionesSAT.getConfig('forma') === 'tmp' &&
                            regla.attr('ejecutarSiempre') === '1') {
                            FormsBuilder.ViewModel.Validacion('', regla);
                        }
                        break;

                    case "Visual":
                        if (isInitRule &&
                            SAT.Environment.settings('dejarsinefecto') === false) {
                            FormsBuilder.ViewModel.Visual(regla);
                        }
                        break;
                        
                    case "Visual Menu":
                        if (isInitRule) {
                            FormsBuilder.ViewModel.Visual(regla);
                        }
                        break;

                    case "Calculo":
                        var exprs = regla.attr('definicion').trimAll().split("=");
                        if (exprs.length > 0) {
                            if (exprs[0] !== "") {
                                fieldExpr = FormsBuilder.ViewModel.getFieldsForExprs()[exprs[0]];
                                var db_id = "E{0}P{1}".format(fieldExpr.entidad, fieldExpr.propiedad);

                                $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', true);
                            }
                        }

                        if (AppDeclaracionesSAT.getConfig('forma') !== 'tmp') {
                            if (isInitRule) {
                                FormsBuilder.ViewModel.Calculo(regla);
                            }
                        }
                        break;

                    case 'Condicional Excluyente':
                        if (AppDeclaracionesSAT.getConfig('forma') !== 'tmp') {
                            if (isInitRule) {
                                FormsBuilder.ViewModel.Calculo(regla);
                            }
                        }
                        break;
                }

                if (regla.attr('validaSeccionAlEntrar') === "1") {
                    var propiedad = xmlDoc.find('definicionReglas').find('propiedad[idRegla={0}]'.format(regla.attr('id')));

                    if (propiedad.length > 0) {
                        var entidad = $(propiedad[0]).attr("idEntidadPropiedad");
                        $('.panel[identidadpropiedad={0}]'.format(entidad)).attr('reglasSeccionAlEntrar', regla.attr('id'));
                    }
                }

                if (regla.attr('validaSeccion') === "1") {
                    var propiedad = xmlDoc.find('definicionReglas').find('propiedad[idRegla={0}]'.format(regla.attr('id')));

                    if (propiedad.length > 0) {
                        var entidad = $(propiedad[0]).attr("idEntidadPropiedad");
                        $('.panel[identidadpropiedad={0}]'.format(entidad)).attr('reglasSeccion', regla.attr('id'));
                    }
                }
            } catch (err) {
                // console.error("Error: {0} -:- Regla: {1}".format(err.message, $(regla).attr('definicion').trimAll()));
            }
        });
    }

    function runSubregimenesRules() {
        var reglas = FormsBuilder.XMLForm.getCopy().find('definicionReglas').find('regla[ejecutarEnSubregimenes]');
        var fieldExpr;
        var regla;

        $.each(reglas, function (key, reglaItem) {
            try {
                regla = $(reglaItem);

                switch (regla.attr('tipoRegla')) {
                    case "Validacion":
                        FormsBuilder.ViewModel.Validacion('', regla);
                        break;

                    case "Visual":
                    case "Visual Menu":
                        FormsBuilder.ViewModel.Visual(regla);
                        break;

                    case "Calculo":
                        var exprs = regla.attr('definicion').trimAll().split("=");
                        if (exprs.length > 0) {
                            if (exprs[0] !== "") {
                                fieldExpr = FormsBuilder.ViewModel.getFieldsForExprs()[exprs[0]];
                                var db_id = "E{0}P{1}".format(fieldExpr.entidad, fieldExpr.propiedad);

                                $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', true);
                            }
                        }

                        FormsBuilder.ViewModel.Calculo(regla);
                        break;

                    case 'Condicional Excluyente':
                        FormsBuilder.ViewModel.Calculo(regla);
                        break;
                }
            } catch (err) {
                // console.error("Error: {0} -:- Regla: {1}".format(err.message, $(regla).attr('definicion').trimAll()));
            }
        });
    }

    function initFormulario() {
        var xmlCopy = FormsBuilder.XMLForm.getCopy();
        var reglas = xmlCopy.find('definicionReglas').find(RULES_RULE);
        var regla;

        $.each(reglas, function (key, reglaItem) {
            try {
                regla = $(reglaItem);

                switch (regla.attr('tipoRegla')) {
                    case "Formulario":
                        if (regla.attr('ejecutarAlInicio') === "1") {
                            FormsBuilder.ViewModel.Visual(regla);
                        }
                        break;
                }
            } catch (err) {
                // console.error("Error: {0} -:- Regla: {1}".format(err.message, $(regla).attr('definicion').trimAll()));
            }
        });
    }

    function evaluate(expression) {
        var $expression = expression.replace(/<>/ig, "!=").replace("=>", ">=").replace("> =", ">=");
        symToVal($expression);
        return new Function("return " + $expression).call();
    }

    function evaluateGrid(expression) {
        var $expression = expression.replace(/<>/ig, "!=").replace("=>", ">=").replace("> =", ">=");
        symToValGrid($expression);
        return new Function("return " + $expression).call();
    }
})();

/** 
module:FormsBuilder.Runtime~VALIDARLONGITUD
Permite validar la longitud de una cadena
*/
function VALIDARLONGITUD() {
    var len = arguments[0].toString().length;

    if (len > arguments[2] || len < arguments[1]) {
        return false;
    }

    return true;
}

function VALORANTERIOR(campo) {
    var valor = '';

    var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[campo];
    if (rl !== undefined) {
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        var getValueByProperty = function (obj, property) {
            var indexFinded;
            var objProps = Object.getOwnPropertyNames(obj);
            objProps.some(function (prop, index, array) {
                if (prop.split('_')[0] === property.split('_')[0]) {
                    indexFinded = prop;
                    return true;
                }
                return false;
            });

            if (indexFinded !== undefined)
                return obj[indexFinded]();
        };

        var verifyIndex = function (obj, value) {
            var objProps = Object.getOwnPropertyNames(obj);
            return objProps[0].split('_')[1] === value.split('_')[1];
        };

        var getIndex = function (prop, index, array) {
            if (verifyIndex(prop, db_id) && index > 0) {
                var filaDetalle = detalleGrid[index - 1];
                valor = getValueByProperty(filaDetalle, db_id);

                return true;
            }

            return false;
        };

        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid()[rl.entidad];
        if (detalleGrid.length > 1) {
            detalleGrid.some(getIndex);
        }
    }

    return valor;
}

function BLOQUEARSECCION(accion, entidad) {

    var that = function () {
        switch (accion) {
            case 1:
                var seccion = $('.panel-default[idEntidadPropiedad="{0}"]'.format(entidad));

                seccion.find('.btnAddCtrlGridRow:first').attr('disabled', true);
                seccion.find('.btnAddFormularioGridRow:first').attr('disabled', true);

                if (SAT.Environment.settings('isHydrate') === true &&
                    AppDeclaracionesSAT.getConfig('forma') === 'new') {

                    var btnsEliminar = seccion.find('.btnDelCtrlGridRow');
                    $.each(btnsEliminar, function (key, btnEliminar) {
                        setTimeout(function () {
                            btnEliminar.click();
                        }, 250);
                    });
                    var btnsFormEliminar = seccion.find('.btnDelFormularioGridRow');
                    $.each(btnsFormEliminar, function (key, btnEliminar) {
                        setTimeout(function () {
                            btnEliminar.click();
                        }, 250);
                    });

                    return;
                } else if (SAT.Environment.settings('isHydrate') === true) {
                    return;
                }

                var btnsEliminar = seccion.find('.btnDelCtrlGridRow');
                $.each(btnsEliminar, function (key, btnEliminar) {
                    setTimeout(function () {
                        btnEliminar.click();
                    }, 250);
                });
                var btnsFormEliminar = seccion.find('.btnDelFormularioGridRow');
                $.each(btnsFormEliminar, function (key, btnEliminar) {
                    setTimeout(function () {
                        btnEliminar.click();
                    }, 250);
                });
                break;

            case 2:
                if (SAT.Environment.settings('isHydrate') === true) return;

                var seccion = $('.panel-default[idEntidadPropiedad="{0}"]'.format(entidad));
                var btnAgregar = seccion.find('.btnAddCtrlGridRow:first');
                btnAgregar.attr('disabled', false);
                btnAgregar.click();
                var btnFormAgregar = seccion.find('.btnAddFormularioGridRow:first');
                btnFormAgregar.attr('disabled', false);
                break;
        }
    }

    return that;
}

function blanktext(element) {
    element.clearData();
}

function SUMAGRID() {
    var exprs = arguments[0].split(',');

    if (exprs.length == 2) {
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        var symbol = exprs[1];
        var fila = exprs[1].split('_')[1];
        var suma = 0;

        var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        if (exprs[0].split('_').length === 2) {
            exprs[0] = exprs[0].replace(/\_[0-9]+/igm, '');
        }

        var encontroHijo = false;
        var hermanos = [];

        var relaciones = FormsBuilder.Modules.getRelacionesGrid();
        for (var keyRelacionPadre in relaciones) {
            for (var keyRelacion in relaciones[keyRelacionPadre]) {
                if (keyRelacion == rl.entidad) {
                    var nodoEncontrado = relaciones[keyRelacionPadre][keyRelacion];
                    for (var padre in nodoEncontrado) {
                        if (encontroHijo === false) {
                            for (var hijo in nodoEncontrado[padre].hijos) {
                                if (parseInt(fila) === parseInt(nodoEncontrado[padre].hijos[hijo].hijo)) {
                                    encontroHijo = true;
                                }
                            }

                            if (encontroHijo === true) {
                                for (var hijo in nodoEncontrado[padre].hijos) {
                                    hermanos.push(parseInt(nodoEncontrado[padre].hijos[hijo].hijo));
                                }
                            }
                        }
                    }
                }
            }
        }

        var symbol2 = exprs[0].split('=')[0] + '_' + symbol.split('_')[1];
        var rl2 = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol2];
        var db_id2 = "E{0}P{1}".format(rl.entidad, rl.propiedad);
        var dbIdNoIndice=db_id.split('_')[0];
        if (detalleGrid[rl.entidad] !== undefined) {
            for (var detalleFila in detalleGrid[rl.entidad]) {                
                var idDetalleFila="{0}_{1}".format(dbIdNoIndice,detalleFila);
                if (detalleGrid[rl.entidad][detalleFila][idDetalleFila]!==undefined){
                
                
                        var definicion = exprs[0];
                        var matches = exprs[0].match(/[$](\w+|[0-9^_]+)/igm);
                        if (matches !== null) {
                            $.each(matches, function (k, match) {
                                definicion = definicion.replace(match, match + '_' + idDetalleFila.split('_')[1]);
                            });
                        }
                        var resultEval = FormsBuilder.Runtime.evaluateGrid(definicion);
                        if (resultEval === true) {
                            if ($.inArray(parseInt(idDetalleFila.split('_')[1]), hermanos) > -1) {
                                var value = parseFloat(detalleGrid[rl.entidad][detalleFila][idDetalleFila]());
                                if (!isNaN(value)) {
                                    suma += value;
                                }
                            }
                        }
                }
                
            }
        }

        return suma;
    } else {
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        var symbol = arguments[0].split('_')[0];
        var fila = arguments[0].split('_')[1];
        var suma = 0;

        var encontroHijo = false;
        var hermanos = [];

        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        var relaciones = FormsBuilder.Modules.getRelacionesGrid();
        for (var keyRelacionPadre in relaciones) {
            for (var keyRelacion in relaciones[keyRelacionPadre]) {
                if (keyRelacion == rl.entidad) {
                    var nodoEncontrado = relaciones[keyRelacionPadre][keyRelacion];
                    for (var padre in nodoEncontrado) {
                        if (encontroHijo === false) {
                            for (var hijo in nodoEncontrado[padre].hijos) {
                                if (parseInt(fila) === parseInt(nodoEncontrado[padre].hijos[hijo].hijo)) {
                                    encontroHijo = true;
                                }
                            }

                            if (encontroHijo === true) {
                                for (var hijo in nodoEncontrado[padre].hijos) {
                                    hermanos.push(parseInt(nodoEncontrado[padre].hijos[hijo].hijo));
                                }
                            }
                        }
                    }
                }
            }
        }

        if (detalleGrid[rl.entidad] !== undefined) {
            for (var detalleFila in detalleGrid[rl.entidad]) {
                for (var detalle in detalleGrid[rl.entidad][detalleFila]) {
                    if (db_id === detalle.split('_')[0]) {
                        if ($.inArray(parseInt(detalle.split('_')[1]), hermanos) > -1) {
                            var value = parseFloat(detalleGrid[rl.entidad][detalleFila][detalle]());
                            if (!isNaN(value)) {
                                suma += value;
                            }
                        }
                    }
                }
            }
        }

        return suma;
    }

    return 0;
}


function SUMA() {
    var exprs = arguments[0].split(',');

    if (exprs.length == 2) {
        try {
            var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
            var symbol = exprs[1];
            var suma = 0;

            var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol];
            var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);
            var dbIdNoIndice=db_id.split('_')[0];
            if (exprs[0].split('_').length === 2) {
                exprs[0] = exprs[0].replace(/\_[0-9]+/igm, '');
            }

            var symbol2 = exprs[0].split('=')[0] + '_' + symbol.split('_')[1];
            var rl2 = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol2];
            var db_id2 = "E{0}P{1}".format(rl.entidad, rl.propiedad);

            if (detalleGrid[rl.entidad] !== undefined) {
                for (var detalleFila in detalleGrid[rl.entidad]) {
                    var idDetalleFila="{0}_{1}".format(dbIdNoIndice,detalleFila);
                    if (detalleGrid[rl.entidad][detalleFila][idDetalleFila]!==undefined){
                        
                            var definicion = exprs[0];
                            var matches = exprs[0].match(/[$](\w+|[0-9^_]+)/igm);
                            if (matches !== null) {
                                $.each(matches, function (k, match) {
                                    definicion = definicion.replace(match, match + '_' + idDetalleFila.split('_')[1]);
                                });
                            }
                            var resultEval = FormsBuilder.Runtime.evaluateGrid(definicion);
                            if (resultEval === true) {
                                var value = parseFloat(detalleGrid[rl.entidad][detalleFila][idDetalleFila]());
                                if (!isNaN(value)) {
                                    suma += value;
                                }
                            }
                        
                    }
                }
            }
        } catch (err) {

        } finally {
            return suma;
        }
    } else {
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        var symbol = arguments[0];
        var suma = 0;

        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        if (detalleGrid[rl.entidad] !== undefined) {
            for (var detalleFila in detalleGrid[rl.entidad]) {
                for (var detalle in detalleGrid[rl.entidad][detalleFila]) {
                    if (db_id === detalle.split('_')[0]) {
                        var value = parseFloat(detalleGrid[rl.entidad][detalleFila][detalle]());
                        if (!isNaN(value)) {
                            suma += value;
                        }
                    }
                }
            }
        }

        return suma;
    }

    return 0;
}

function DECIMALES(value, decimals) {
    try {
        return parseFloat(value).toFixed(decimals);
    } catch (err) {
        console.log(err.message);
    }
}

function DUPLICADO() {
   
    var duplicates = [];
    var listDbid = [];
    var duplicado=false;
    for (var key in arguments) {
        var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[arguments[key]];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        listDbid.push({ rl: rl, db_id: db_id });
    }

    listDbid.forEach(function (element, index, array) {
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid()[element.rl.entidad]; 
        var indice = element.db_id.split('_')[1];
        var propiedad=element.db_id.split('_')[0];
        var valorElemento = detalleGrid[indice][element.db_id]();
        for (var i = 0; i < parseInt(indice); i++) {
            if (valorElemento === detalleGrid[i]["{0}_{1}".format(propiedad, i)]()) {
                duplicado = true;
                break;
            }
        }
        if (duplicado==false){
            for(var i=parseInt(indice)+1;i<detalleGrid.length;i++){
                if (valorElemento === detalleGrid[i]["{0}_{1}".format(propiedad, i)]()) {
                    duplicado = true;
                    break;
                }
            }
        }
    });
    return duplicado;
}


function CONTARDIAS() {
    var fecha1 = arguments[0];
    var fecha2 = arguments[1];
    var days = NaN;
    if ((!fecha1) ||
        (!fecha2)) {
        return false;
    }
    try {
        var timeFecha1 = FECHA(fecha1).getTime();
        var timeFecha2 = FECHA(fecha2).getTime();

        var maximus = Math.max(timeFecha1, timeFecha2);
        var minimus = Math.min(timeFecha1, timeFecha2);

        var timeElapsed = maximus - minimus;

        var seconds = Math.floor(timeElapsed / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        days = Math.floor(hours / 24);
    } catch (err) {
        console.error(err);
    }
    return days + 1;

}

function OBTENERANIOSFECHAS() {

    var fecha1 = arguments[0];
    var fecha2 = arguments[1];

    if ((!fecha1) ||
        (!fecha2)) {
        // console.error("Una de las fechas es invalida");
        return false;
    }
    var years = 0;
    try {
        var timeFecha1 = FECHA(fecha1).getTime();
        var timeFecha2 = FECHA(fecha2).getTime();

        var maximus = Math.max(timeFecha1, timeFecha2);
        var minimus = Math.min(timeFecha1, timeFecha2);

        var timeElapsed = maximus - minimus;

        var seconds = Math.floor(timeElapsed / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);
        years = Math.floor(days / 365);
    } catch (err) {
        // console.log("Ocurrio un problema al manejar las fechas Error:{0}".format(err));
    }

    return years;
}

function DIFERENCIAANIOSFECHAS() {
    var fecha1 = arguments[0];
    var fecha2 = arguments[1];
    var diferencia = arguments[2];

    if ((!fecha1) ||
    (!fecha2)) {
        // console.error("Una de las fechas es invalida, diferencia no efectuada");
        return false;
    }

    var yearsElapsed = OBTENERANIOSFECHAS(fecha1, fecha2);

    return yearsElapsed >= diferencia ? true : false;

}

function CONTADORCONDICIONAL() {
    var condicion = arguments[0];

    var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
    var suma = 0;

    var exprs = condicion.match(/[$](\w+|[0-9^_]+)/igm);

    if (exprs !== null) {
        var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[exprs[0]];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        if (condicion.split('_').length === 2) {
            condicion = condicion.replace(/\_[0-9]+/igm, '');
        }

        if (detalleGrid[rl.entidad] !== undefined) {
            for (var detalleFila in detalleGrid[rl.entidad]) {
                for (var detalle in detalleGrid[rl.entidad][detalleFila]) {
                    var propiedad = detalle.split('_')[0].substring(detalle.split('_')[0].indexOf('P') + 1, detalle.split('_')[0].length);

                    if (exprs[0].split('_')[0].replace('$', '') === propiedad) {

                        var definicion = condicion;
                        var matches = condicion.match(/[$](\w+|[0-9^_]+)/igm);
                        if (matches !== null) {
                            $.each(matches, function (k, match) {
                                definicion = definicion.replace(match, match + '_' + detalle.split('_')[1]);
                            });
                        }
                        var resultEval = FormsBuilder.Runtime.evaluateGrid(definicion);
                        if (resultEval === true) {
                            suma++;
                        }
                    }
                }
            }
        }
    }

    return suma;
}

function REDONDEARMENOS() {
    var val = arguments[0];
    return Math.floor(val);
}

function REDONDEARMENOR() {
    var val = arguments[0];
    return Math.floor(val);
}

function REDONDEARMAS() {
    var val = arguments[0];
    return Math.ceil(val);
}

function ABS() {
    var val = arguments[0];
    return Math.abs(val);
}

function REDONDEARSAT() {
    var value = arguments[0].toString();

    if (value.match(/[.]/igm) !== null) {
        var decimales = value.substring(value.indexOf('.'), value.length);
        if (parseFloat(decimales) >= parseFloat(0.51)) {
            value = Math.ceil(value);
        } else {
            value = Math.floor(value);
        }
    }
    return parseFloat(value);
}

function PaddingZerosRight(value, numberZeros) {
    var result = value;
    var areValidArguments = (!IsNullOrEmpty(value) && !isNaN(value)) && (typeof (numberZeros) == "number" && numberZeros > 0);
    if (areValidArguments) {
        var stringValue = value.toString();
        var pointIndex = stringValue.indexOf(".");
        var zeros = [];
        for (var index = 0; index < numberZeros; index++) {
            zeros.push("0");
        }
        zeros = zeros.join("");

        var existPointIndex = pointIndex != -1;

        if (existPointIndex) {
            var decimal = stringValue.substr(pointIndex + 1);
            var integer = stringValue.substr(0, pointIndex);
            var zerosToAdd = zeros.slice(decimal.length);
            decimal = decimal + zerosToAdd;
            result = "{0}.{1}".format(integer, decimal);
        }
    }
    return result;
}

function TRUNCAR() {
    var value = arguments[0];   
    var truncateString = arguments[1].toString();
    
     if (value && !IsNullOrEmpty(truncateString)) {
        var truncatePositions = parseInt(truncateString);

        var stringValue = value.toString();
        var pointIndex = stringValue.indexOf(".");
        
        if (stringValue.indexOf("e-") != -1) {
            var power = parseInt(stringValue.toString().split('e-')[1]);            
            if (power) {
                stringValue *= Math.pow(10, power - 1);                
                stringValue = '0.' + (new Array(power)).join('0') + stringValue.toString().substring(2);                
            }
        }

        if (pointIndex != -1) {
            var decimals = stringValue.substr(pointIndex + 1, truncatePositions);

            var integer = stringValue.substr(0, pointIndex);

            var truncateValue = integer.concat(".{0}".format(decimals));
            result = parseFloat(truncateValue);
        }
    }

    return result;
}

function SI() {
    if (arguments[0]) {
        if (typeof arguments[1] === "function") {
            arguments[1]();
        }
        return arguments[1];
    } else {
        if (arguments.length > 2) {
            if (typeof arguments[2] === "function") {
                arguments[2]();
            }
            return arguments[2];
        }
    }
}

function NO() {
    return !arguments[0];
}

function EXPRESIONREGULAR() {
    var pattern = new RegExp(arguments[1]);
    return pattern.test(arguments[0].toString());
}

function MOSTRAR(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput i[vm="{0}"]'.format(db_id)).show();
        var ctl = $('#htmlOutput [view-model="{0}"]'.format(db_id));
        ctl.prev().show();
        // ctl.show();
        ctl.removeClass('hide');

        var elementos = ctl.parents().eq(2).find('[view-model]');
        var todosInvibles = true;
        $.each(elementos, function (key, elemento) {
            if ($(elemento).css('display') !== 'none') {
                todosInvibles = false;
            }
        });
        if (ctl.parents().eq(2).attr('identidadpropiedad') === undefined) {
            if (todosInvibles === true) {
                ctl.parents().eq(2).hide();
            } else {
                ctl.parents().eq(2).show();
            }
        }
    };

    return that;
}

function OCULTAR(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput i[vm^="{0}"]'.format(db_id)).hide();
        var ctl = $('#htmlOutput [view-model^="{0}"]'.format(db_id));

        ctl.prev().hide();
        // ctl.hide();
        ctl.addClass('hide');

        var elementos = ctl.parents().eq(2).find('[view-model]');
        var todosInvibles = true;
        $.each(elementos, function (key, elemento) {
            if ($(elemento).css('display') !== 'none') {
                todosInvibles = false;
            }
        });
        if (ctl.parents().eq(2).attr('identidadpropiedad') === undefined) {
            if (todosInvibles === true) {
                ctl.parents().eq(2).hide();
            } else {
                ctl.parents().eq(2).show();
            }
        }
    };

    return that;
}

function MOSTRARGRID(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput i[vm="{0}"]'.format(db_id)).show();
        var ctl = $('#htmlOutput [view-model="{0}"]'.format(db_id));
        ctl.prev().show();
        ctl.show();
    };

    return that;
}

function OCULTARGRID(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput i[vm="{0}"]'.format(db_id)).hide();
        var ctl = $('#htmlOutput [view-model="{0}"]'.format(db_id));

        ctl.prev().hide();
        ctl.hide();

        var elementos = ctl.parents().eq(2).find('[view-model]');
        var todosInvibles = true;
        $.each(elementos, function (key, elemento) {
            if ($(elemento).css('display') !== 'none') {
                todosInvibles = false;
            }
        });
        if (ctl.parents().eq(2).attr('identidadpropiedad') === undefined) {
            if (todosInvibles === true) {
                ctl.parents().eq(2).hide();
            } else {
                ctl.parents().eq(2).show();
            }
        }
    };

    return that;
}

function HABILITAR(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', false);
    };

    return that;
}

function LIMPIARCHECK(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('checked', false);
    };

    return that;
}

function HABILITADO(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', false);
    };

    return that;
}

function DESHABILITAR(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', true);
    };

    return that;
}

function INHABILITAR(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', true);
    };

    return that;
}

function HABILITARGRID(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', false);
    };

    return that;
}

function INHABILITARGRID(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).attr('disabled', true);
    };

    return that;
}

function SECCIONNOAPLICA(entidad){
   return String(FormsBuilder.ViewModel.getFlujoSecciones()[entidad]['NoAplica']) === "true" ? true : false ;
}

function MOSTRARMENUSECCION(entidad) {
    var symbol = entidad;
    var that = function () {
        var idPanel = $('#htmlOutput .panel-default[identidadpropiedad="{0}"]'.format(symbol)).attr('id');
        var ancla = $('.panel-sections').find('a[idpanel="{0}"]'.format(idPanel));
        var seccion = $('#htmlOutput .panel[id="{0}"]'.format(idPanel));
        var seccionPadre = ancla.attr('idSeccion');
        ancla.parent().show();

        $('div[id="{0}"]'.format(seccionPadre)).show();

        if (FormsBuilder.ViewModel.getFlujoSecciones()[entidad] !== undefined) {
            FormsBuilder.ViewModel.getFlujoSecciones()[entidad].OcultarMenuSeccion = false;
            FormsBuilder.ViewModel.getFlujoSecciones()[entidad]['NoAplica']= false;
        }
        seccion.attr("saltado", "");
    }

    return that;
}

function OCULTARMENUSECCION(entidad) {
    var symbol = entidad;
    var that = function () {
        var idPanel = $('#htmlOutput .panel-default[identidadpropiedad="{0}"]'.format(symbol)).attr('id');
        var ancla = $('.panel-sections').find('a[idpanel="{0}"]'.format(idPanel));
        var seccionPadre = ancla.attr('idSeccion');
        ancla.parent().hide();

        var secciones = $('.panel-sections').find('a[idSeccion="{0}"]'.format(seccionPadre)).map(function(cv, i) { if ($(i).parent().is(':visible')){return i;}});
        if(secciones.length==0)
        {
            $('div[id="{0}"]'.format(seccionPadre)).hide();
        }

        if (FormsBuilder.ViewModel.getFlujoSecciones()[entidad] !== undefined) {
            FormsBuilder.ViewModel.getFlujoSecciones()[entidad].OcultarMenuSeccion = true;
             FormsBuilder.ViewModel.getFlujoSecciones()[entidad]['NoAplica']= true;
        }

        var seccion = $('#htmlOutput .panel[id="{0}"]'.format(idPanel));
        if (SAT.Environment.settings('isHydrate') === false){
            var btnsEliminar = seccion.find('button.btnDelCtrlGridRow');
            if (btnsEliminar.length > 0) {
                btnsEliminar.each(function (k, v) {
                    $(v).click();
                });
            } else {
                var xmlCopy = FormsBuilder.XMLForm.getCopy();
                var inputspago;
                var inputs = seccion.find('input[type="text"]');
                $.each(inputs, function (k, input) {
                    var db_id = $(input).attr("view-model");
                    inputspago = $(xmlCopy).find('Propiedad[id="{0}"]'.format(db_id.split('P')[0])).attr('claveInformativa');
                        switch(inputspago){
                            case 'C5':
                            case 'C20':
                            case 'UC26':
                                  break;
                            default:
                                FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]("");
                                break;
                        }
                });

                var combos = seccion.find('select');
                $.each(combos, function (k, combo) {
                    var db_id = $(combo).attr("view-model");
                    FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]("");
                });
            }
        }

        seccion.attr("saltado", "true");
    }

    return that;
}

function OBLIGATORIO(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).addClass('sat-obligatorio');
    };

    return that;
}

function NOOBLIGATORIO(id) {
    var symbol = id;
    var that = function () {
        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbol];
        var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

        $('#htmlOutput [view-model="{0}"]'.format(db_id)).removeClass('sat-obligatorio');
    };

    return that;
}

function LONGITUG() {
    if (arguments[0] !== undefined) {
        return arguments[0].toString().length;
    }

    return 0;
}

var DERECHA = '';

function ESBLANCO() {
    return IsNullOrEmpty(arguments[0]);
}

function ESNUMERO() {
    var value = arguments[0];
    return !isNaN(parseInt(value, 10)) && (parseFloat(value, 10) == parseInt(value, 10));
}

function Y() {
    for (var i = 0; i < arguments.length; i++) {
        if (!arguments[i]) {
            return false;
        }
    }
    return true;
}

function O() {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i]) {
            return true;
        }
    }
    return false;
}


function ESENTEROPOSITIVO() {
    var rule = FormsBuilder.ViewModel.getFieldsForExprs()[arguments[0]];
    if (rule !== undefined) {
        var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
        var value = FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]();

        return /^(0|[0-9]\d*(\.\d+)?|\d*(\.\d+)?)$/.test(value);
    }
    return true;
}

function ESENTEROPOSITIVOGRID() {

    var result = true;
    var rule = FormsBuilder.ViewModel.getFieldsForExprsGrid()[arguments[0]];
    if (rule !== undefined) {
        var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
        var value;
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid()[(db_id.split('P')[0]).replace('E', '')];
        for (var indexDetalle in detalleGrid) {
            if (detalleGrid[indexDetalle][db_id] !== undefined) {
                value = detalleGrid[indexDetalle][db_id]();
            }
        }
        result = /^(0|[0-9]\d*(\.\d+)?|\d*(\.\d+)?)$/.test(value);
    }
    return result;
}


function ESENTERONEGATIVO() {
    if (ESNULO(arguments[1])) {
        return true;
    }

    var value = parseFloat(arguments[0]);
    if (!isNaN(value)) {
        if (value < 0) {
            return true;
        }
    }

    return false;
}

function VALIDARRANGO() {
    if (!IsNullOrEmptyOrZero(arguments[0])) {
        var value = parseFloat(arguments[0]);
        if (!isNaN(value)) {
            if (value >= arguments[1] && value <= arguments[2]) {
                return true;
            } else {
                return false;
            }
        }
    }

    return true;
}

function ESENTERO() {
    var value = parseFloat(arguments[0]);
    if (!isNaN(value)) {
        return true;
    }

    return false;
}

function ELEMENTOSGRID() {
    var numeroElementos = -1;
    var field = arguments[0];
    var index;

    var rule = FormsBuilder.ViewModel.getFieldsForExprsGrid()[field];
    if (rule !== undefined) {
        var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid()[(db_id.split('P')[0]).replace('E', '')];
        numeroElementos = detalleGrid.length;
    } else {
        Object.getOwnPropertyNames(FormsBuilder.ViewModel.getFieldsForExprsGrid()).forEach(function (element) {
            if (element.split('_')[0] === field) {
                index = element.split('_')[1];
                rule = FormsBuilder.ViewModel.getFieldsForExprsGrid()[field + "_" + index];
                if (rule !== undefined) {
                    var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
                    var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid()[(db_id.split('P')[0]).replace('E', '')];
                    numeroElementos = detalleGrid.length;
                }
            }
        });
    }

    return numeroElementos;
}

function BUSCARRANGO(id, columnasBusqueda, valor, columnaRegreso) {
    var tasa = 0;
    var elementos = FormsBuilder.Catalogs.getAll().find('catalogo[id="{0}"]'.format(id)).find('elemento');
    $.each(elementos, function (key, elemento) {
        var minimo = $(elemento).attr(columnasBusqueda[0]);
        var maximo = $(elemento).attr(columnasBusqueda[1]);

        if (!IsNullOrEmptyOrZero(valor)) {
            var value = parseFloat(valor);
            if (!isNaN(value)) {
                if (value >= minimo && value <= maximo) {
                    tasa = parseFloat($(elemento).attr(columnaRegreso));
                    return false;
                }
            }
        }
    });

    return tasa;
}

function groupBy(items, column) {
    var result = {};
    if ($(items).length < 0 || IsNullOrEmpty(column)) {
        return null;
    }
    items.map(function (index) {
        var item = $.isArray(items) ? index : items[index];
        var val = $(item).attr(column);
        if (!$.isArray(result[val])) {
            result[val] = [];
        }
        result[val].push(item);
    });
    return result;
}

function addExtensionMethods(array) {
    array.getNext = function () {
        var result;
        for (var index in this) {
            if (!this[index].checked && typeof (this[index]) != "function") {
                result = this[index];
                break;
            }
        }
        return result;
    };
    array.hasNext = function () {
        var result = false;
        for (var index in this) {
            if (this[index].hasOwnProperty("checked") && !this[index].checked) {
                result = true;
                break;
            }
        }
        return result;
    };
}

function groupByRecursive(items, columns, inCycle) {
    var result = {};
    var column = columns.getNext();
    if (!column) {
        return result;
    }
    var isGroup = items.length === undefined;
    if (!isGroup) {
        result = groupBy(items, column.nameColumn);
        if (inCycle) {
            return result;
        }
    } else {
        for (var index in items) {
            var nextLevel = items[index];
            items[index] = groupByRecursive(nextLevel, columns, true);
        }
        result = items;
    }
    if (columns.hasNext() && !inCycle) {
        column.checked = true;
        groupByRecursive(result, columns);
    }
    return result;
}

function getArray(items) {
    var result = [];
    var isGroup = items.length === undefined;
    if (isGroup) {
        for (var index in items) {
            result = result.concat(getArray(items[index]));
        }
    } else {
        for (var index in items) {
            var item = items[index];
            if (typeof item != "function")
                result.push(item);
        }
    }
    return result;
}

function groupByMany(items, columns) {
    for (var level in columns) {
        columns[level] = {
            nameColumn: columns[level],
            checked: false
        };
    }
    addExtensionMethods(columns);
    var result = groupByRecursive(items, columns);
    result.getLastItem = function () {
        var array = getArray(this);
        var lastIndex = array.length - 1;
        return array[lastIndex];
    };
    return result;
}

function BUSCAR(id, columnPosition, value2return, columnValues, orderColumns) {
    var value = null;
    var cumpleCondicion = false;

    var elementos = FormsBuilder.Catalogs.getAll().find('catalogo[id="{0}"]'.format(id)).find('elemento');

    if (!($.isArray(columnPosition)) && !($.isArray(columnValues))) {
        $.each(elementos, function (index, element) {
            if ($(element).attr(columnPosition) == columnValues)
                cumpleCondicion = true;
            else {
                cumpleCondicion = false;
                return;
            }

            if (cumpleCondicion) {
                value = $(element).attr(value2return);
                return;
            }
        });
    }
    else {
        $.each(elementos, function (eIndex, eElement) {
            $.each(columnPosition, function (cIndex, cValue) {
                if ($(eElement).attr(cValue) == columnValues[cIndex]) {
                    cumpleCondicion = true;
                }
                else {
                    cumpleCondicion = false;
                    return false;
                }
            });
            if (cumpleCondicion) {
                value = $(eElement).attr(value2return);
                return false;
            }
        });
    }

    if (IsNullOrEmpty(value) && $.isArray(orderColumns) && orderColumns.length > 0) {
        var itemsOrdered = groupByMany(elementos, orderColumns);
        var lastItem = itemsOrdered.getLastItem();
        value = $(lastItem).attr(value2return) || null;
    }
    return value;
}

function TabCuadroDetalle(event) {
    if ($.inArray(event.keyCode, [9, 13]) !== -1) {
        return;
    }
    event.preventDefault();
}

var DERECHA = 'derecha';
var IZQUIERDA = 'izquierda';

function AUTOCOMPLETAR(event, lenEnteros, lenDecimales) {
    RemoveZeros(event, false);
    var result = event.target.value;

    if (result.trim().length > 0) {
        var guiones = event.target.value.match(/[.]\d+/igm);
        if (guiones !== null) {
            if ((guiones[0].length - 1) < lenDecimales) {
                var diff = lenDecimales - (guiones[0].length - 1);
                var cadena = '';
                for (var i = 0; i < diff; i++) {
                    cadena += '0';
                }

                result += cadena;
            } else if ((guiones[0].length - 1) > lenDecimales) {
                var diff = (guiones[0].length - 1) - lenDecimales;
                for (var i = 0; i < diff; i++) {
                    result = result.slice(0, result.length - 1);
                }
            }

            if (new RegExp(/^[.]\d+/igm).test(result) === true) {
                result = '0' + result;
            }
        } else {
            var cadena = '';
            if (event.target.value.match(/[.]/igm) === null) {
                cadena = '.{0}'.format(result.slice(lenEnteros, lenEnteros + lenDecimales));
                for (var i = cadena.trim().length - 1; i < lenDecimales; i++) {
                    cadena += '0';
                }
            }
            else {
                for (var i = cadena.trim().length; i < lenDecimales; i++) {
                    cadena += '0';
                }
            }

            result += cadena;
        }

        guiones = result.match(/\d+[.]/igm);
        if (guiones !== null) {
            if ((guiones[0].length - 1) < lenEnteros) {
            }
            else if ((guiones[0].length - 1) > lenEnteros) {
                var diff = (guiones[0].length - 1) - lenEnteros;
                var temp = guiones[0];

                for (var i = 0; i <= diff; i++) {
                    temp = temp.slice(0, temp.length - 1);
                }

                result = temp + result.match(/[.]\d+/igm)[0];
            }
        }
    }
    event.target.value = result;
}

function AUTOCOMPLETARVALOR(valor, lenDecimales) {
    var result = valor;
    var guiones = valor.toString().match(/[.]\d+/igm);
    if (guiones !== null) {
        if ((guiones[0].length - 1) < lenDecimales) {
            var diff = lenDecimales - (guiones[0].length - 1);
            var cadena = '';
            for (var i = 0; i < diff; i++) {
                cadena += '0';
            }

            result += cadena;
        } else if ((guiones[0].length - 1) > lenDecimales) {
            var diff = (guiones[0].length - 1) - lenDecimales;
            for (var i = 0; i < diff; i++) {
                result = result.slice(0, result.length - 1);
            }
        }
    } else {
        var cadena = '';
        if (valor.toString().match(/[.]/igm) === null) {
            cadena = '.';
        }
        for (var i = 0; i < lenDecimales; i++) {
            cadena += '0';
        }

        result += cadena;
    }

    return result;
}

var regexDate = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g;
var regexDateFlat = /^((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229)$/g;

function VALIDARFECHA() {
    var stringDate = arguments[0];
    var pattern = new RegExp(regexDate);
    if (!pattern.test(stringDate) && !IsNullOrEmpty(stringDate)) {
        return false;
    }
    return true;
}

function Is_RfcDate() {
    var stringDate = arguments[0];
    var pattern = new RegExp(regexDateFlat);
    if (!pattern.test(stringDate) && !IsNullOrEmpty(stringDate)) {
        return false;
    }
    return true;
}

function ValidarFecha(event) {
    var cadena = event.target.value;

    var pattern = new RegExp(regexDate);
    if (!pattern.test(cadena) && !IsNullOrEmpty(cadena)) {
        $(event.target).addClass('sat-val-error');

        setTimeout(function () {
            $(event.target).popover('hide');
        }, 1000 * 6);

        $(event.target).popover({
            trigger: 'manual',
            content: "La fecha no es válida",
            placement: "bottom"
        }).popover('show');
    } else {
        $(event.target).removeClass('sat-val-error');
    }
}

function ValidarRFC(event) {
    var cadena = event.target.value;

    var pattern = new RegExp('^(([A-ZÑ&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$');
    if (!pattern.test(cadena)) {
    }
}

function CURP(cadena) {
    var pattern = new RegExp("^(([A-Z][A,E,I,O,U,X][A-Z]{2})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([M,H][A-Z]{2}[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[0-9,A-Z][0-9]))|(([A-Z][A,E,I,O,U,X][A-Z]{2})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([M,H][A-Z]{2}[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[0-9,A-Z][0-9]))|(([A-Z][A,E,I,O,U,X][A-Z]{2})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([M,H][A-Z]{2}[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[0-9,A-Z][0-9]))|(([A-Z][A,E,I,O,U,X][A-Z]{2})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([M,H][A-Z]{2}[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[0-9,A-Z][0-9]))$");
    if (!pattern.test(cadena)) {
        return false;
    }
    else {
        return true;
    }
}

function SoloMayusculas2(event) {
    event = event || window.event;
    event.target.value = event.target.value.toUpperCase();

    var cadena = event.target.value;

    var pattern = new RegExp('^(([A-ZÑ&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$');
    if (!pattern.test(cadena)) {
        $(event.target).addClass('sat-obligatorio');

        setTimeout(function () {
            $(event.target).popover('hide');
        }, 1000 * 6);

        $(event.target).popover({
            trigger: 'manual',
            content: "No es un RFC válido",
            placement: "bottom"
        }).popover('show');

        event.target.value = '';
    } else {
        $(event.target).removeClass('sat-obligatorio');
    }

    event.target.value = event.target.value.replace(/^0+/g, '');
}

function SoloMayusculas(event) {
    event = event || window.event;
    event.target.value = event.target.value.toUpperCase();
    event.target.value = event.target.value.replace(/^0+/g, '');
}

function SoloMayusculasCompensaciones(event) {
    event = event || window.event;
    event.target.value = event.target.value.toUpperCase();
}

//Encargada de convertir una cadena desde diversos formatos a tipo Date.
//Siempre retorna una fecha, en caso de ser invalida la cadena de entrada regresa la fecha minima
function FECHA(fecha) {
    if (IsNullOrEmptyWhite(fecha)) {
        return FBUtils.getDateMin();
    }
    var date;
    try {
        var formatISO = "yyyy-MM-ddTHH:mm:ssZ";
        var formatISOWithouTimeZone = "yyyy-MM-ddTHH:mm:ss";
        var formatDateOnly = "d/M/yyyy";
        date = Date.parseExact(fecha, [formatISO, formatDateOnly, formatISOWithouTimeZone]);
        if (fecha.split('.')[1] !== undefined && date === null) {
            fecha = fecha.split('.')[0];
            date = Date.parseExact(fecha, [formatISOWithouTimeZone]);
        }

    } catch (err) {
        return FBUtils.getDateMin();
    } finally {
        if (date === null) {
            return FBUtils.getDateMin();
        }
        if (isNaN(date.getDate())) {
            return FBUtils.getDateMin();
        } else {
            return date;
        }
    }
}

function RFCMORALES(rfc) {
    var pattern = new RegExp('^(([A-ZÑ&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|(([A-ZÑ&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$');
    if (!pattern.test(rfc)) {
        return false;
    } else {
        return true;
    }
}

function RFCFISICASCOMPLETO(rfc) {
    var pattern = new RegExp('^(([A-ZÑ&]{4})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|(([A-ZÑ&]{4})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|(([A-ZÑ&]{4})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|(([A-ZÑ&]{4})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$');
    if (!pattern.test(rfc)) {
        return false;
    } else {
        return true;
    }
}

function RFCFISICASSINHOMOCLAVE(rfc) {
    var pattern = new RegExp('^[A-Za-z]{4}[0-9]{6}');
    if (!pattern.test(rfc)) {
        return false;
    } else {
        return true;
    }
}

function RFCVALIDOACLAVEUSUARIOINICIA(rfc) {
    var rfClaveUsuarioInicia = "";

    symToVal("$39");
    rfClaveUsuarioInicia = $39;

    if (rfc !== rfClaveUsuarioInicia) {
        return true;
    } else {
        return false
    }
}

function RemoveZeros(event, numerosNegativos) {
    if ($(event.target).attr('capturaDecimales') === undefined) {
        if (event.target.value.length > 1) {
            var zerosSearch = event.target.value.match(/^0+/g);
            if (zerosSearch !== null) {
                if (event.target.value.length === zerosSearch[0].length) {
                    event.target.value = "0";
                } else {
                    // Modificacion para Morales
                    event.target.value = event.target.value.replace(/^0+/g, '0');
                }
            }
        }

        var numerosNegativosSearch = event.target.value.match(/[-]/);
        if (numerosNegativosSearch !== null) {
            if (numerosNegativosSearch.length > 0) {
                if (event.target.value.indexOf('-') !== 0) {
                    event.target.value = event.target.value.replace(/[-]/, '');
                }
            }
        }
    } else {
        var numerosNegativosSearch = event.target.value.match(/[-]/);
        if (numerosNegativosSearch !== null) {
            if (numerosNegativosSearch.length > 0) {
                if (event.target.value.indexOf('-') !== 0) {
                    event.target.value = event.target.value.replace(/[-]/, '');
                }
            }
        }

        if (event.target.value.length > 1) {
            var zerosSearch = event.target.value.match(/^0+/g);
            if (zerosSearch !== null) {
                if (event.target.value.length === zerosSearch[0].length) {
                    event.target.value = "0";
                } else {
                    // Modificacion para Morales
                    event.target.value = event.target.value.replace(/^0+/g, '0');
                }
            }
        }
        if (event.target.value.match(/[.]/igm) !== null) {
            var decimales = event.target.value.substring(event.target.value.indexOf('.') + 1, event.target.value.length);
            var comparador = decimales.length === 2 ? 51 : 6;

            if (parseInt(decimales) >= comparador) {
                event.target.value = Math.ceil(event.target.value);
            } else {
                event.target.value = Math.floor(event.target.value);
            }
        }

        if (isNaN(event.target.value)) {
            event.target.value = '';
        }
    }
}
var isDeleteOrEscOrTabOrBackspaceOrEnterKey = function (event) {
    return $.inArray(event.keyCode, [46, 8, 9, 27, 13]) !== -1;
};
var isFunctionOrDirectionKey = function (event) {
    return (event.keyCode >= 35 && event.keyCode <= 39);
};
var isNotNumberKey = function (event) {
    return (event.keyCode < 48 || event.keyCode > 57);
};
var isNotNumericPadKey = function (event) {
    return (event.keyCode < 96 || event.keyCode > 105);
};
var isDecimalPointKey = function (event) {
    return (event.keyCode == 110);
};
var isPointKey = function (event) {
    return (event.keyCode == 190);
};
var isSuprKey = function (event) {
    return event.keyCode === 46;
}
var isMinusKey = function (event) {
    return (event.keyCode == 109);
};
var isDashKey = function (event) {
    return (event.keyCode == 189);
};
var isSemiColonKey = function (event) {
    return event.keyCode == 186;
};
var isCtrl_ACombinationKeys = function (event) {
    return (event.keyCode == 65 && event.ctrlKey === true);
};

var isEnterKey = function (event) {
    return event.keyCode == 45;
};
var MaxDecimales = 2;

function SoloNumerosDecimales(event) {
    var cadena = (event.target.value || "") + (isPointKey(event) || isDecimalPointKey(event) ? "." : isSuprKey(event) ? "" : String.fromCharCode(event.keyCode));
    var points = cadena.match(/[.]/igm);
    if (points !== null) {
        if (points.length > 1) {
            preventDefaultEvent(event);
        }
    }

    if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) ||
    isDecimalPointKey(event) ||
    isPointKey(event) ||
    isCtrl_ACombinationKeys(event) ||
    isFunctionOrDirectionKey(event)) {
        return;
    }
    else {
        if (event.shiftKey || isNotNumberKey(event) && isNotNumericPadKey(event)) {
            preventDefaultEvent(event);
        }
    }
}

function DeshabilitarCero(event) {
    event = event || window.event;
    var character = (event.target.value || "") + (String.fromCharCode(event.keyCode));
    var value = parseFloat(character);
    if (value == 0) {
        event.target.value = "";
        $(event.target).change();
    }
}

function SoloNumerosPositivos(event) {
    event = event || window.event;
    var noCapturaDecimales = $(event.target).attr('capturaDecimales') === undefined;

    if (noCapturaDecimales) {
        if (isSemiColonKey(event)) {
            preventDefaultEvent(event);
        }

        if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) || // Delete, Backspace, Tab, Esc, Enter
            isCtrl_ACombinationKeys(event) || // Ctrl - a combination Keys
            isFunctionOrDirectionKey(event)//Function Keys, Directions Keys
                ) {
            return;
        } else {
            if (event.shiftKey ||
                isNotNumberKey(event) && // Is 0-9
                isNotNumericPadKey(event)) // Is 0-9 Numeric Pad
            {
                preventDefaultEvent(event);
            }
        }
    } else {
        var character = (event.target.value || "") + (isPointKey(event) || isDecimalPointKey(event) ? "." : String.fromCharCode(event.keyCode));
        var guiones = character.match(/[.]/igm);
        if (guiones !== null) {
            if (guiones.length > 1) {
                preventDefaultEvent(event);
            }

            var decimales = character.substring(character.indexOf('.') + 1, character.length);
            if (decimales.toString().length > MaxDecimales) {
                if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) || // Delete, Backspace, Tab, Esc, Enter keys
				    isDecimalPointKey(event) || // Decimal Point Key
				    isPointKey(event) || // Point Key
				    isCtrl_ACombinationKeys(event) || // Ctrl - a combination keys
				    isFunctionOrDirectionKey(event)) { //Function Keys, Directions Keys
                    return;
                }
                preventDefaultEvent(event);
            }
        }

        if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) ||
		    isDecimalPointKey(event) ||
		    isPointKey(event) ||
		    isCtrl_ACombinationKeys(event) ||
		    isFunctionOrDirectionKey(event)) {
            return;
        }
        else {
            if (event.shiftKey || isNotNumberKey(event) && isNotNumericPadKey(event)) {
                preventDefaultEvent(event);
            }
        }
    }
}

function SoloNumerosNegativos(event) {
    event = event || window.event;
    var noCapturaDecimales = $(event.target).attr('capturaDecimales') === undefined;
    var character, guiones, points;
    if (noCapturaDecimales) {
        character = (event.target.value || "") + (isDashKey(event) || isMinusKey(event) ? "-" : String.fromCharCode(event.keyCode));
        guiones = character.match(/[-]/igm);
        if (guiones !== null) {
            if (guiones.length === 1 && character.indexOf("-") !== 0) {
                preventDefaultEvent(event);
            }
            if (guiones.length > 1) {
                if (!character.match(/^-\d+$/)) {
                    preventDefaultEvent(event);
                }
            }
        }
        if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) || // Delete, Backspace, Tab, Esc, Enter Keys
            isMinusKey(event) || // Minus Key
            isDashKey(event) || // Dash Key
            isCtrl_ACombinationKeys(event) ||
            isFunctionOrDirectionKey(event)) // Function Keys and Direction
        {
            return;
        } else {
            if (event.shiftKey ||
                isNotNumberKey(event) && // 0-9
                    isNotNumericPadKey(event)) // 0-9 Numeric Pad
            {
                preventDefaultEvent(event);
            }
        }
    } else {
        character = (event.target.value || "");
        if (isPointKey(event) || isDecimalPointKey(event)) {
            character += ".";
        }
        if (isMinusKey(event) || isDashKey(event)) {
            character += "-";
        } else {
            character += String.fromCharCode(event.keyCode);
        }
        points = character.match(/[.]/igm);
        guiones = character.match(/[-]/igm);
        if (guiones !== null) {
            if (guiones.length > 1) {
                if (!character.match(/^-\d+$/)) {
                    preventDefaultEvent(event);
                }
            }
        }
        if (points !== null) {
            if (points.length > 1) {
                preventDefaultEvent(event);
            }

            var decimales = character.substring(character.indexOf('.') + 1, character.length);
            if (decimales.toString().length > MaxDecimales) {

                if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) || // Delete, Backspace, Tab, Esc, Enter keys
                    isDecimalPointKey(event) || // Decimal Point Key
                    isPointKey(event) || // Point Key
                    isMinusKey(event) || // Minus Key
                    isDashKey(event) || // Dash Key
                    isCtrl_ACombinationKeys(event) || // Ctrl - a combination keys
                    isFunctionOrDirectionKey(event)) { //Function Keys, Directions Keys
                    return;
                }
                preventDefaultEvent(event);
            }
        }
        if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) ||
            isDecimalPointKey(event) ||
            isPointKey(event) ||
            isMinusKey(event) ||
            isDashKey(event) ||
            isCtrl_ACombinationKeys(event) ||
            isFunctionOrDirectionKey(event)) {
            return;
        } else {
            if (event.shiftKey ||
                isNotNumberKey(event) &&
                    isNotNumericPadKey(event)) {
                preventDefaultEvent(event);
            }
        }
    }
}

function isDateEmpty(value) {
    if ("__/__/____" === value) {
        return true;
    }
    return false;
}

function OmitirSimulateKeys(event) {
    event = event || window.event;
    if (event.keyCode == 186) {
        preventDefaultEvent(event);
    }

    if (isDeleteOrEscOrTabOrBackspaceOrEnterKey(event) || // Delete, Backspace, Tab, Esc, Enter
        isCtrl_ACombinationKeys(event) ||
        isEnterKey(event) ||
        (isFunctionOrDirectionKey(event) && // Function Keys, Directions Keys
         !IsNullOrEmpty(event.keyIdentifier))
        ) {
        return;
    }
    else {
        if (event.shiftKey ||
            isNotNumberKey(event) && // Is 0-9
           (isNotNumericPadKey(event) || IsNullOrEmpty(event.keyIdentifier)) // Is 0-9 Numeric Pad
            ) {
            preventDefaultEvent(event);
        }
    }
}

var VERDADERO = true;
var FALSO = false;

function MAX() {
    return Math.max.apply(null, arguments);
}

function MIN() {
    return Math.min.apply(null, arguments);
}

function OBTENERANIO() {
    var value = arguments[0];
    try {
        var date = FECHA(value);
        if (date) {
            return date.getFullYear();
        } else {
            return undefined;
        }
    } catch (err) {
    }
}

function OBTENERMES() {
    var value = arguments[0];
    try {
        var date = FECHA(value);
        if (date) {

            return date.getMonth() + 1;
        } else {
            return undefined;
        }
    } catch (err) {
        // console.log("No se pudo recuperar el mes");
    }
}

function OBTENERDIA() {
    var value = arguments[0];
    try {
        var date = FECHA(value);
        if (date) {

            return date.getDay() + 1;
        } else {
            return undefined;
        }
    } catch (err) {
    }
}

function ESNULO() {
    var rule = FormsBuilder.ViewModel.getFieldsForExprs()[arguments[0]];

    if (rule !== undefined) {
        var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
        var value = FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]();

        if (isDateEmpty(value)) {
            return true;
        }

        return IsNullOrEmpty(value);
    }

    return true;
}

function ESNULOGRID() {
    var rule = FormsBuilder.ViewModel.getFieldsForExprsGrid()[arguments[0]];
    if (rule !== undefined) {
        var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
        var value;
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid()[(db_id.split('P')[0]).replace('E', '')];
        for (var indexDetalle in detalleGrid) {
            if (detalleGrid[indexDetalle][db_id] !== undefined) {
                value = detalleGrid[indexDetalle][db_id]();
            }
        }
        return IsNullOrEmpty(value);
    }

    return true;
}

function PARTEACTUALIZADA(lanzadorRegla) {
    if (lanzadorRegla <= 0) return 0;

    var rule = FormsBuilder.ViewModel.getFieldsForExprs()["$28"];
    var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);

    var fo = FECHA(FormsBuilder.ViewModel.get()[FBUtils.getEntidad(db_id)][db_id]().trim());

    rule = FormsBuilder.ViewModel.getFieldsForExprs()["$38"];
    db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);

    var fc = FECHA(FormsBuilder.ViewModel.get()[FBUtils.getEntidad(db_id)][db_id]().trim());

    if (fo > fc) {
        return 0;
    }

    var inpco = ObtenerINPC(fo);
    var inpcc = ObtenerINPC(fc);
    var ic = lanzadorRegla;

    var fa = 0;
    if (!((inpcc / inpco) < 1)) {
        fa = (inpcc / inpco) - 1;
    }

    var faStr = String(fa);
    if (faStr.indexOf('.') !== -1) {
        if (faStr.substring(faStr.indexOf('.') + 1, faStr.length).length > 4) {
            fa = parseFloat(faStr.substring(0, faStr.indexOf('.')) + '.' + faStr.substring(faStr.indexOf('.') + 1, faStr.length).substring(0, 4));
        }
    }

    var ia = ic * fa;
    ia = REDONDEARSAT(ia);

    return ia;
}

function RECARGOS(lanzadorRegla) {
    if (lanzadorRegla <= 0) return 0;

    var rule = FormsBuilder.ViewModel.getFieldsForExprs()["$28"];
    var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);

    var fo = FECHA(FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]().trim());

    rule = FormsBuilder.ViewModel.getFieldsForExprs()["$38"];
    db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);

    var fc = FECHA(FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]().trim());
    //fc = new Date(fc.getFullYear(), fc.getMonth(), fc.getDate()); // se quita ya que se manda sin horas desde el servidor
    if (fo >= fc) {
        return 0;
    }

    var ia = PARTEACTUALIZADA(lanzadorRegla);
    var ic = lanzadorRegla;

    var foAnio = fo.getFullYear();
    var fcAnio = fc.getFullYear();

    var foDia = fo.getDate();
    var fcDia = fc.getDate();
    var tasas = [];

    if (fcDia <= foDia) {
        if (foAnio === fcAnio) {
            var meses = FormsBuilder.Catalogs.getCatalog('TasaRecargos').find('elemento[anio="{0}"]'.format(foAnio)).sort(function (a, b) {
                var a1 = parseInt($(a).attr("mes"));
                var b1 = parseInt($(b).attr("mes"));

                if (a1 === b1) return 0;
                return a1 > b1 ? 1 : -1;
            });

            if (meses.length > 0) {
                var mesInicial = fo.getMonth();
                var mesFinal = fc.getMonth();

                var x = mesFinal;
                while (x-- && x >= mesInicial) {
                    if ($(meses[x]) !== undefined && $(meses[x]).attr('tasa') !== undefined) {
                        tasas.push(parseFloat($(meses[x]).attr('tasa')));
                    }
                }
            }
        } else if (fcAnio > foAnio) {
            var mesInicial = fo.getMonth();
            var mesFinal = fc.getMonth();

            var anio = fcAnio + 1;
            while (anio-- && anio >= foAnio) {
                var meses = FormsBuilder.Catalogs.getCatalog('TasaRecargos').find('elemento[anio="{0}"]'.format(anio)).sort(function (a, b) {
                    var a1 = parseInt($(a).attr("mes"));
                    var b1 = parseInt($(b).attr("mes"));

                    if (a1 === b1) return 0;
                    return a1 > b1 ? 1 : -1;
                });

                var x = meses.length;
                if (x > 0) {
                    while (x--) {
                        if (anio === (fcAnio)) {
                            if (x < mesFinal) {
                                if ($(meses[x]) !== undefined) {
                                    if (tasas.length < 60)
                                        tasas.push(parseFloat($(meses[x]).attr('tasa')));
                                }
                            }
                        } else if (anio === foAnio) {
                            if (x >= mesInicial) {
                                if ($(meses[x]) !== undefined) {
                                    if (tasas.length < 60)
                                        tasas.push(parseFloat($(meses[x]).attr('tasa')));
                                }
                            }
                        } else {
                            if ($(meses[x]) !== undefined) {
                                if (tasas.length < 60)
                                    tasas.push(parseFloat($(meses[x]).attr('tasa')));
                            }
                        }
                    }
                }
            }
        }
    } else if (fcDia > foDia) {
        if (foAnio === fcAnio) {
            var meses = FormsBuilder.Catalogs.getCatalog('TasaRecargos').find('elemento[anio="{0}"]'.format(foAnio)).sort(function (a, b) {
                var a1 = parseInt($(a).attr("mes"));
                var b1 = parseInt($(b).attr("mes"));

                if (a1 === b1) return 0;
                return a1 > b1 ? 1 : -1;
            });

            if (meses.length > 0) {
                var mesInicial = fo.getMonth();
                var mesFinal = fc.getMonth() + 1;

                var x = mesFinal;
                while (x-- && x >= mesInicial) {
                    if ($(meses[x]) !== undefined && $(meses[x]).attr('tasa') !== undefined) {
                        tasas.push(parseFloat($(meses[x]).attr('tasa')));
                    }
                }
            }
        } else if (fcAnio > foAnio) {
            var mesInicial = fo.getMonth();
            var mesFinal = fc.getMonth() + 1;

            var anio = fcAnio + 1;
            while (anio-- && anio >= foAnio) {
                var meses = FormsBuilder.Catalogs.getCatalog('TasaRecargos').find('elemento[anio="{0}"]'.format(anio)).sort(function (a, b) {
                    var a1 = parseInt($(a).attr("mes"));
                    var b1 = parseInt($(b).attr("mes"));

                    if (a1 === b1) return 0;
                    return a1 > b1 ? 1 : -1;
                });

                var x = meses.length;
                if (x > 0) {
                    while (x--) {
                        if (anio === (fcAnio)) {
                            if (x < mesFinal) {
                                if ($(meses[x]) !== undefined) {
                                    if (tasas.length < 60)
                                        tasas.push(parseFloat($(meses[x]).attr('tasa')));
                                }
                            }
                        } else if (anio === foAnio) {
                            if (x >= mesInicial) {
                                if ($(meses[x]) !== undefined) {
                                    if (tasas.length < 60)
                                        tasas.push(parseFloat($(meses[x]).attr('tasa')));
                                }
                            }
                        } else {
                            if ($(meses[x]) !== undefined) {
                                if (tasas.length < 60)
                                    tasas.push(parseFloat($(meses[x]).attr('tasa')));
                            }
                        }
                    }
                }
            }
        }
    }

    var ixs = 0;
    if (tasas.length === 0) {
        var ultimaTasa = FormsBuilder.Catalogs.getCatalog('TasaRecargos').find('elemento:last');
        ixs = parseFloat(ultimaTasa.attr('tasa'));
    }
    $.each(tasas, function (key, tasa) {
        ixs += tasa;
    });

    var ir = (ic + ia) * (ixs);
    ir = REDONDEARSAT(ir);

    return ir;
}

function EXISTESUBREGIMEN(regimenId) {
    var regimen = null, catalogSubRegimenes = null;
    try {
        if (!IsNullOrEmpty(FormsBuilder.XMLForm.getCopyPrecarga())) {
            catalogSubRegimenes = FormsBuilder.XMLForm.getCopyPrecarga();
        }
        else {
            catalogSubRegimenes = FormsBuilder.XMLForm.getCopyDeclaracion();
        }
        regimen = catalogSubRegimenes.find("SubRegimenes Catalogo").filter(function () {
            return $('IdCatalogo', this).text() === regimenId;
        }).find("Descripcion").text();

        return !IsNullOrEmpty(regimen);
    }
    catch (e) {
        console.log("Catalogos de subregimenes not found!!");
    }
}

function EXISTEROLIDC(rolId) {
    var rol = null, listaRoles = null;
    try {
        if (!IsNullOrEmpty(FormsBuilder.XMLForm.getCopyPrecarga())) {
            listaRoles = FormsBuilder.XMLForm.getCopyPrecarga();
        }
        else {
            listaRoles = FormsBuilder.XMLForm.getCopyDeclaracion();
        }

        rol = listaRoles.find("Roles Catalogo").filter(function () {
            return $('IdCatalogo', this).text() === rolId;
        }).find("Descripcion").text();

        return !IsNullOrEmpty(rol);
    }
    catch (e) {
        console.log("Roles not found!!");
    }
}

function EXISTEREGIMENIDC(regimenId) {
    var regimen = null, listRegimenes = null;
    try {
        if (!IsNullOrEmpty(FormsBuilder.XMLForm.getCopyPrecarga())) {
            listRegimenes = FormsBuilder.XMLForm.getCopyPrecarga();
        }
        else {
            listRegimenes = FormsBuilder.XMLForm.getCopyDeclaracion();
        }

        regimen = listRegimenes.find("SubRegimenes Catalogo").filter(function () {
            return $('IdCatalogo', this).text() === regimenId;
        }).find("Descripcion").text();
        
        return !IsNullOrEmpty(regimen);
    }
    catch (e) {
        console.log("Regimen IDC not found!!");
    }
}

function DIGITOVERIFICADOR(RFC) {
    var base = 13;
    var dv = 0;
    for (var index = 0; index < RFC.length - 1; index++) {
        var numAscii = RFC.charCodeAt(index);

        if (numAscii >= 65 && numAscii <= 78) // De la A a la N
        {
            numAscii = numAscii - 55;
        }
        else if (numAscii >= 79 && numAscii <= 90) //De la O a la Z
        {
            numAscii = numAscii - 54;
        }
        else if (numAscii >= 48 && numAscii <= 57) //Del 0 al 9
        {
            numAscii = numAscii - 48;
        }
        else if (numAscii = 38) //& == Ñ
        {
            numAscii = 24;
        }
        else if (numAscii = 32) //ESPACIO
        {
            numAscii = 37;
        }
        else if (RFC[index] == 'Ñ') {
            numAscii = 38;
        }
        else {
            numAscii = 0;
        }

        dv = dv + (numAscii * (base - index)); //Empieza en 13,12,11,10,9,...,2
    }

    dv = dv % 11;

    if (dv > 0) {
        if (dv == 1) {
            return "A";
        }
        else {
            return String.fromCharCode((11 - dv) + 48);
        }
    }
    else {
        return '0';
    }
}

var Tipo = 'F'; // TODO: Modificar para que sea dinamico F o M
var i_RfcError = -1;
var Val10 = true;
function Verf_rfc_FM (event, tipo) {
    event.target.value = event.target.value.toUpperCase();
    event.target.value = event.target.value.replace(/^0+/g, '');

    Tipo = tipo;

    var s_TrimedRfc = event.target.value;

    // Tipo puede ser F o M
    var msg;
    var Verf_rfc_FM_Result = Verf_rfc_FM0(s_TrimedRfc);
    console.log(i_RfcError);

    if (i_RfcError === 6 || i_RfcError === 13) // se quito la validacion 13 ya que esta nueva version no permite ingresar espacios
        Verf_rfc_FM_Result = true;

    if (Verf_rfc_FM_Result)
        return Verf_rfc_FM_Result;

    switch (i_RfcError) {
        case 1:
            msg = "El RFC está incompleto";
        break;

        case 3:
            msg = "La fecha del RFC no es válida, verificar el formato de fecha. (aammdd)";
        break;
        
        case 5:
            msg = "Homoclave incompleta, verificar";
        break;
        
        case 7:
            msg = "Falta la homoclave del RFC";
        break;
        
        case 10:
            msg = "Los cuatro primeros caracteres deben ser letras";
        break;
        
        case 11:
            msg = "El primer caracter es incorrecto";
        break;
        
        case 12:
            msg = "El primer caracter es incorrecto";
        break;
        
        case 13:
            msg = "El primer caracter debe ser un espacio";
        break;
        
        case 14:
            msg = "Hay un error en la parte alfabética";
        break;
        
        case 15:
            msg = "Hay un error en la parte alfabética";
        break;
    }

    console.log(msg);
    $("#modalSeccion .modal-body").html(msg);
    $("#modalSeccion").modal('show');

    return Verf_rfc_FM_Result;
}

function Verf_rfc_FM0 (s_TrimedRfc) {
    // Tipo puede ser F o M
    var rfc_FechaNac; // Cadena que contiene la fecha de nacimiento
    var s_criterio; // Criterio de busqueda en la tabla tContribuyentes
    var i;
    var Ya;
    // Verf_rfc_FM0 = false;
    i_RfcError = 0;
    Ya = 0;
    // Verifica que se haya introducido el patrón ???######

    if (s_TrimedRfc.trim().length === 0) {
        i_RfcError = 6;
        return;
    }

    if (Tipo === 'A') {
        if (s_TrimedRfc.trim().length < 12) {
            i_RfcError = 1;
            return;
        }

        if (s_TrimedRfc.trim().length === 12) {
            var esFisica = true; 
            for (i = 0; i < 4; i++) {
                if (s_TrimedRfc.substr(i, 1).match(/[A-ZÑ& ]/) === null) {
                    esFisica = false;
                }
            }
            console.log(esFisica);
            if (esFisica) {
                i_RfcError = 1;
                return;
            }
            Tipo = 'M';
        }

        if (s_TrimedRfc.trim().length === 13) {
            Tipo = 'F';
        }
    }

    for (i = 0; i < 4; i++) {
        if (i === 0) {
            if (Tipo === 'A') {
                // Para AMBOS
                if (s_TrimedRfc.substr(i, 1).match(/[A-ZÑ& ]/) === null) {
                    if (s_TrimedRfc.substr(0, 4) === '9999') {
                        i_RfcError = 10;
                        return;
                    }
                    i_RfcError = 11;
                    return;
                }
            } else if (Tipo === 'F') {
                // Para P.Fisicas
                if (s_TrimedRfc.substr(i, 1).match(/[A-ZÑ&]/) === null) {
                    i_RfcError = 12;
                    return;
                }
            } else if (Tipo === 'M') {
                // Para P.Morales
                // if (s_TrimedRfc.substr(i, 1).match(/[ ]/) === null) {
                //     i_RfcError = 13;
                //     return;
                // }
            }
        } else if (i > 0 && i < 4) {
            if (Tipo === 'F' || (Tipo === 'A' && s_TrimedRfc.substr(0, 1) !== ' ')) {
                if (s_TrimedRfc.substr(i, 1).match(/[A-ZÑ&]/) === null) {
                    i_RfcError = 14;
                    return;
                }
            } else if ((Tipo === 'M' || (Tipo === 'A' && s_TrimedRfc.substr(0, 1) !== ' ')) && i < 3) {
                if (s_TrimedRfc.substr(i, 1).match(/[A-ZÑ&]/) === null) {
                    i_RfcError = 15;
                    return;
                }
            }
        }
    }

    // Verifica que se haya introducido un rfc completo
    if (Tipo === 'F' || (Tipo === 'A') && s_TrimedRfc.substr(0, 1) !== ' ') {
        if (s_TrimedRfc.length > 10 && s_TrimedRfc.length < 13) {
            i_RfcError = 5;
            return;
        } else if (Val10 && s_TrimedRfc.length === 10) {
            i_RfcError = 7;
            return;
        } else if (s_TrimedRfc.length < 10) {
            i_RfcError = 1;
            return;
        }
    } else if (Tipo === 'M' || (Tipo === 'A') && s_TrimedRfc.substr(0, 1) !== ' ') {
        // if (s_TrimedRfc.length !== 13) {
        //     i_RfcError = 1;
        //     return;
        // }
    }

    // Verifica que los 6 digitos despúes de los primeros 4 caracteres correspondan a una fecha
    if (Tipo === 'F') {
        rfc_FechaNac = s_TrimedRfc.substr(4, 6);
        if (!Is_RfcDate(rfc_FechaNac)) {
            i_RfcError = 3;
            return;
        }
    } else if (Tipo === 'M') {
        rfc_FechaNac = s_TrimedRfc.substr(3, 6);
        if (!Is_RfcDate(rfc_FechaNac)) {
            i_RfcError = 3;
            return;
        }
    }

    // SARR 21/1/2005 valida el dígito verificador
    if (s_TrimedRfc.length !== 10) {
        var dig;
        var digReal;

        var anteriorRFC;

        dig = DIGITOVERIFICADOR(s_TrimedRfc);
        digReal = s_TrimedRfc.substr(12, 1);

        if (dig !== digReal) {
            if (anteriorRFC !== s_TrimedRfc) {
                var resDialog = true; // Preguntar de donde se inserta anteriorRFC
                // console.log("El verificador (último caracter) del RFC '" + s_TrimedRfc + "' parece erróneo, dice " + digReal + " y debería decir " + dig + "¿Proseguir con ese RFC pese a esta discrepancia?");
                // if (resDialog) {
                //     anteriorRFC = s_TrimedRfc
                // } else {
                //     i_RfcError = 20;
                //     return;
                // }
            }
        }
    }

    return true;
}

function ESCLABE(clabeStr) {
    var rl = FormsBuilder.ViewModel.getFieldsForExprs()[clabeStr];
    var db_id = "E{0}P{1}".format(rl.entidad, rl.propiedad);

    var clabe = FormsBuilder.ViewModel.get()[rl.entidad][db_id]();

    if (IsNullOrEmptyWhite(clabe)) return false;
    if (!EXPRESIONREGULAR(clabe, '^[0-9]{18}$')) return false;

    var codigoVerificador = 0, diez = 10;

    for (var i = 0; i < clabe.length - 1; i = i + 3) {
        var charCode = parseInt(clabe[i]);
        codigoVerificador = codigoVerificador + ((charCode * 3) % 10);

        charCode = parseInt(clabe[i + 1]);
        codigoVerificador = codigoVerificador + ((charCode * 7) % 10);

        if (i < 15) {
            charCode = parseInt(clabe[i + 2]);
            codigoVerificador = codigoVerificador + charCode;
        }
    }

    codigoVerificador = codigoVerificador % 10;
    codigoVerificador = diez - codigoVerificador;
    codigoVerificador = (codigoVerificador === diez) ? 0 : codigoVerificador;

    if (parseInt(clabe[clabe.length - 1]) !== codigoVerificador) return false;

    var plazaId = '{0}{1}{2}'.format(clabe[3], clabe[4], clabe[5]);
    var plaza = FormsBuilder.Catalogs.getCatalog('Plazas bancarias').find('elemento[valor="{0}"]'.format(plazaId));

    return plaza.length > 0;
}

function ESALFANUMERICO(event) {
    event = event || window.event;
    var pattern = /[^a-zA-Z0-9\ñ\Ñ]/g;
    event.target.value = event.target.value.replace(pattern, '');
    event.target.value = event.target.value.toUpperCase();
}

function ObtenerINPC(fecha) {
    if (isNaN(fecha.getDate())) return 0;

    var inpcc = 0;

    var foAnio = fecha.getFullYear();
    var foMes = fecha.getMonth();
    var inpcc1 = FormsBuilder.Catalogs.getCatalog('INPC').find('elemento[anio="{0}"]'.format(foAnio));
    var inpcc2 = inpcc1.find('[mes="{0}"]'.format(foMes));
    if (inpcc2.length > 0) {
        inpcc = inpcc2.attr('indice');
    } else {
        var x = inpcc1.length;
        var encontroEsteAnio = false;

        inpcc1.sort(function (a, b) {
            var a1 = parseInt($(a).attr("mes"));
            var b1 = parseInt($(b).attr("mes"));

            if (a1 === b1) return 0;
            return a1 > b1 ? 1 : -1;
        });
        while (x--) {
            if (parseInt($(inpcc1[x]).attr('mes')) <= foMes) {
                inpcc = $(inpcc1[x]).attr('indice');
                encontroEsteAnio = true;
                break;
            }
        }

        if (!encontroEsteAnio) {
            foAnio -= 1;
            inpcc1 = FormsBuilder.Catalogs.getCatalog('INPC').find('elemento[anio="{0}"]'.format(foAnio));

            inpcc1.sort(function (a, b) {
                var a1 = parseInt($(a).attr("mes"));
                var b1 = parseInt($(b).attr("mes"));

                if (a1 === b1) return 0;
                return a1 > b1 ? 1 : -1;
            });
            x = inpcc1.length;
            while (x--) {
                inpcc = $(inpcc1[x]).attr('indice');
                encontroEsteAnio = true;
                break;
            }
        }
    }

    return inpcc;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function GetTexto(funValue, catalogoId) {
    var xmlCopy = FormsBuilder.XMLForm.getCopy();
    var catalogo = $(xmlCopy).find('catalogos').find('catalogo[id="{0}"]'.format(catalogoId));

    var texto = catalogo.find('elemento[valor="{0}"]'.format(funValue())).attr('texto');

    return texto;
}

function changevalue(sender, value) {
    var detalleCheckbox = FormsBuilder.ViewModel.getDetalleCheckbox();
    detalleCheckbox[$(sender).attr('vmvalue')][value] = sender.checked;
}

var precargaVars = ["$1", "$2", "$3", "$4", "$5", "$6", "$7", "$8", "$9", "$10", "$11", "$12", "$13", "$14", "$15", "$16", "$17", "$18", "$20", "$21", "$22", "$23", "$24", "$25", "$26", "$27", "$28", "$29", "$30", "$31", "$32", "$33", "$34", "$35", "$36", "$37", "$37", "$38", "$39", "$41", "$42", "$43", "$45", "$46", "$47"];
function symToVal(expr) {
    var symbols = expr.match(/[$](\w+|[0-9^_]+)/igm);

    if (IsNullOrEmpty(symbols))
        return;

    $.each(symbols, function (k, v) {
        var precision = 4;
        var isDecimalPattern = /^[-+]?[0-9]+\.[0-9]+$/;
        var rule = FormsBuilder.ViewModel.getFieldsForExprs()[v];

        if (rule !== undefined) {
            var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
            var value = FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]();

            if ($.inArray(v, precargaVars) >= 0) {
                window[v] = value;
                return;
            }

            switch (rule.tipoDatos) {
                case 'FechaHora':
                case 'Fecha':
                    if (isDateEmpty(value)) {
                        value = "";
                    }
                    window[v] = value;
                    break;

                default:
                    if (!IsNullOrEmpty(value)) {
                        if (typeof (value) === "string") {
                            value = value.replace(new RegExp(',', 'g'), '');
                        }
                        var numberValue = parseFloat(value);
                        if (isNaN(numberValue)) {
                            window[v] = value;
                        } else {
                            window[v] = numberValue;
                            if (isDecimalPattern.test(numberValue)) {
                                window[v] = typeof (numberValue) == "number" ? parseFloat(numberValue.toFixed(precision)) : window[v];
                            }
                        }
                    } else {
                        if (rule.tipoDatos === "Numerico") {
                            window[v] = 0;
                        } else {
                            window[v] = "";
                        }
                    }
                    break;
            }
        }
    });
}

function symToValGrid(expr) {
    var symbols = expr.match(/[$](\w+|[0-9^_]+)/igm);
    var precision = 4;
    var isDecimalPattern = /^[-+]?[0-9]+\.[0-9]+$/;

    if (IsNullOrEmpty(symbols))
        return;

    $.each(symbols, function (k, v) {
        var rule = FormsBuilder.ViewModel.getFieldsForExprsGrid()[v];
        if (rule !== undefined) {
            var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);

            var value;
            var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid()[(db_id.split('P')[0]).replace('E', '')];
            for (var indexDetalle in detalleGrid) {
                if (detalleGrid[indexDetalle][db_id] !== undefined) {
                    value = detalleGrid[indexDetalle][db_id]();
                }
            }

            if ($.inArray(v, precargaVars) >= 0) {
                window[v] = value;
                return;
            }

            switch (rule.tipoDatos) {
                case 'FechaHora':
                case 'Fecha':
                    if (isDateEmpty(value)) {
                        value = "";
                    }
                    window[v] = value;
                    break;
                default:
                    if (!IsNullOrEmpty(value)) {
                        if (typeof (value) === "string") {
                            value = value.replace(new RegExp(',', 'g'), '');
                        }
                        var numberValue = parseFloat(value);
                        if (isNaN(numberValue)) {
                            window[v] = value;
                        } else {
                            window[v] = numberValue;
                            if (isDecimalPattern.test(numberValue)) {
                                window[v] = typeof (numberValue) == "number" ? parseFloat(numberValue.toFixed(precision)) : window[v];
                            }
                        }
                    } else {
                        if (rule.tipoDatos === "Numerico") {
                            window[v] = 0;
                        } else {
                            window[v] = "";
                        }
                    }
                    break;
            }
        } else {
            symToVal(v);
        }
    });
}
