/** @module FormsBuilder.ViewModel */
/**
*
* Modulo que carga el modelo de datos desde el XML
* 
* (c) SAT 2013, Iv�n Gonz�lez
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.ViewModel", get, getDetalleCheckbox, getDetalle, getDetalleGrid, getDetalleFK, init, applyDataBindings, createXml, getFieldsForExprs, getFieldsForExprsGrid, getFlujoSecciones, applyRule, applyRuleGrid, Validacion, Calculo, Visual, ValidacionGrid, CalculoGrid, VisualGrid, DeshabilitarCalculoGrid, procesarMensajeError, procesarMensajeErrorGrid, getConfiguracionFisicas, applyRulesDejarSinEfecto, getLenQueueRules);

    var viewModel = {};
    var viewModelGrid = {};
    var viewModelDetalle = {};

    var viewModelCheckboxList = {};
    var viewModelDetalleForeignKeys = {};

    var configuracionFisicas = {
        subRegimenes: '',
        areaGeografica: ''
    };

    var flujoSecciones = {};
    var fieldsForExprs = {};
    var fieldsForExprsGrid = {};
    var reglas;

    var removeFuncs = [];
    var applyRulesFuncs = [];

    var rulesCache = [];

    var prefixFieldExpr = '$';
    var RULES_RULE = 'reglas';

    function get() {
        return viewModel;
    }

    function getDetalle() {
        return viewModelDetalle;
    }

    function getDetalleGrid() {
        return viewModelGrid;
    }

    function getDetalleCheckbox() {
        return viewModelCheckboxList;
    }

    function getDetalleFK() {
        return viewModelDetalleForeignKeys;
    }

    function getFieldsForExprs() {
        return fieldsForExprs;
    }

    function getFieldsForExprsGrid() {
        return fieldsForExprsGrid;
    }

    function getFlujoSecciones() {
        return flujoSecciones;
    }

    function getConfiguracionFisicas() {
        return configuracionFisicas;
    }

    function getLenQueueRules() {
        return applyRulesFuncs.length;
    }

    function init(xmlDoc, cb) {
        reglas = $(FormsBuilder.XMLForm.getCopy()).find('reglas');
        var entidades = $(xmlDoc).find('entidad');

        $.each(entidades, function (keyEntidad, valueEntidad) {
            var propiedades = $(valueEntidad).children('propiedades').children('propiedad');

            viewModel[$(valueEntidad).attr('id')] = {};
            $.each(propiedades, function (keyPropiedad, valuePropiedad) {
                var idEntidad = $(valuePropiedad).parents().eq(1).attr("id");
                var idPropiedad = $(valuePropiedad).attr("id");
                var claveInformativa = $(valuePropiedad).attr("claveInformativa");

                fieldsForExprs[prefixFieldExpr + idPropiedad] = {
                    entidad: idEntidad,
                    propiedad: idPropiedad,
                    tipoDatos: $(valuePropiedad).attr("tipoDatos")
                };
                window[prefixFieldExpr + idPropiedad] = 0;

                var db_id = "E{0}P{1}".format(idEntidad, idPropiedad);
                if (!viewModel[$(valueEntidad).attr('id')].hasOwnProperty(db_id)) {
                    // Creacion de objetos de modelos de knockout
                    viewModel[$(valueEntidad).attr('id')][db_id] = ko.observable('');

                    viewModel[$(valueEntidad).attr('id')][db_id].subscribe(function (newValue) {
                        SAT.Environment.setSetting('isModified', true);

                        var aplicaRegla = true;
                        if (SAT.Environment.settings('applyrules')) {
                            var indexEntidad = FBUtils.getEntidad(db_id);
                            if (FormsBuilder.ViewModel.getFlujoSecciones()[indexEntidad] !== undefined) {
                                if (FormsBuilder.ViewModel.getFlujoSecciones()[indexEntidad]['NoAplica'] !== undefined) {
                                    if (String(FormsBuilder.ViewModel.getFlujoSecciones()[indexEntidad]['NoAplica']) === "true") {
                                        if (String(FormsBuilder.ViewModel.getFlujoSecciones()[indexEntidad]['OcultarMenuSeccion']) === "false" || FormsBuilder.ViewModel.getFlujoSecciones()[indexEntidad]['OcultarMenuSeccion'] === undefined) {
                                            aplicaRegla = false;
                                        }
                                    }
                                }
                            }

                            if (aplicaRegla) {
                                var applyRuleFunc;
                                if (SAT.Environment.settings('dejarsinefecto') === false) {
                                    applyRuleFunc = function () {
                                        applyRule(db_id, newValue);
                                        applyValueSettingByProp(db_id, newValue);
                                        applyDetailsRules(db_id, newValue);
                                    };
                                } else {
                                    var enableRule = ($.inArray(claveInformativa, ["C5", "C20"]) >= 0);
                                    if (enableRule) {
                                        applyRuleFunc = function () {
                                            applyRulesDejarSinEfecto(db_id, newValue);
                                        };
                                    }
                                }

                                if (applyRuleFunc) {
                                    applyRulesFuncs.push(applyRuleFunc);
                                }

                                setTimeout(function () {
                                    if (applyRulesFuncs.length) {
                                        var func = applyRulesFuncs.shift();
                                        func.call();
                                    }
                                }, 1);
                            }
                        }
                    });
                }
            });
        });

        cb();
    }

    function applyDetailsRules(db_id, newValue) {
        if (viewModelDetalleForeignKeys[db_id] !== undefined) {
            if (newValue === 0 || newValue === '') {
                var dlg = $('[sat-dlg-dbid="{0}"] div:first'.format(db_id));
                var trItem = dlg.find('table tr[item]');
                if (trItem.length > 0) {
                    trItem.remove();
                }

                var rowCompensaciones = $('[sat-dlg-compensaciones-dbid="{0}"] div:first'.format(db_id)).find('.sat-row-compensaciones');
                if (rowCompensaciones.length > 0) {
                    rowCompensaciones.remove();
                }
                viewModelDetalle[viewModelDetalleForeignKeys[db_id]] = [];
            }
        }
    }

    function applyValueSettingByProp(db_id, newValue) {
        var total = 0;

        if (FormsBuilder.Parser.getDataProp() !== undefined) {
            var needsToApplySetting = $.inArray(db_id, FormsBuilder.Parser.getDataProp());
            if (needsToApplySetting >= 0) {
                FormsBuilder.Parser.getDataProp()[db_id] = newValue;

                $.each(FormsBuilder.Parser.getDataProp(), function (k, v) {
                    var val = FormsBuilder.Parser.getDataProp()[v];
                    if (!IsNullOrEmpty(val)) {
                        var value = parseInt(val);

                        if (!isNaN(value)) {
                            total += value;
                        }
                    }
                });

                var control = $('[field-bind="{0}"]'.format(db_id)).find('label:last');
                if (!IsNullOrEmptyWhite(newValue)) {
                    control.html("$" + newValue);
                    FBUtils.applyFormatCurrencyOnElement(control, true);
                    var controlValue = "${0}".format(control.text());
                    control.html(controlValue);
                } else {
                    control.html('');
                }

                var totalPay = $('.sat-totalpay span');
                totalPay.html("${0}".format(total));
                FBUtils.applyFormatCurrencyOnElement(totalPay, true);
                var totalPayValue = "${0}".format(totalPay.text());
                totalPay.html(totalPayValue);

                //TODO: Poner $24007 en un archivo o setting configuracion
                var infoField = FormsBuilder.ViewModel.getFieldsForExprs()["$24007"];
                var db_id2 = "E{0}P{1}".format(infoField.entidad, infoField.propiedad);
                viewModel[infoField.entidad][db_id2](total);
            }
        }
    }

    function containGroupOperation(reglaEntidad) {
        var exprs = reglaEntidad.definicion.match(/SUMA[(](.*?)[)]/igm);
        if ($.isArray(exprs)) {
            return exprs.length > 0;
        }
        return false;
    }

    function getInfoOperations(operations) {
        var result = [];
        if ($.isArray(operations)) {
            $(operations).each(function (index, value) {
                var operationEntidad = {};
                var nombreOperation = value.match(/^(.*?)(?=[(])/igm);
                if (nombreOperation && nombreOperation.length > 0) {
                    operationEntidad.nombre = nombreOperation[0];
                }
                value = value.replace(/(.*?)[(]/igm, "");
                value = value.replace(/[)]$/igm, "");
                var parameters = value.split(",");
                operationEntidad.parametros = [];
                if (parameters && parameters.length > 0) {
                    operationEntidad.parametros = parameters;
                }

                if (operationEntidad.hasOwnProperty("nombre")) {
                    result.push(operationEntidad);
                }
            });
        }
        return result;
    }

    function getGroupOperations(definicion) {
        var groupOperations = definicion.match(/SUMA[(](.*?)[)]/igm);

        return getInfoOperations(groupOperations);
    }

    function getImplicitRules(reglaEntidad, dbId) {
        var result = [];
        var regla = $(reglas).find('regla[id="{0}"]'.format(reglaEntidad.idRegla));
        var operations = getGroupOperations(reglaEntidad.definicion);
        var idPropiedad = FBUtils.getPropiedad(dbId);
        var idEntidad = FBUtils.getEntidad(dbId);
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();

        for (var index in operations) {
            var operation = operations[index];
            var hasParameters = operation.parametros.length > 0;
            if (hasParameters) {
                var lastIndex = operation.parametros.length - 1;
                var lastParameter = operation.parametros[lastIndex];
                //TODO: Para lanzar validaciones de los hermanos en controlesgrid
                // if (lastParameter === "${0}".format(idPropiedad)) {
                var grid = detalleGrid[idEntidad];
                for (var indexRow in grid) {
                    nextRow:
                    for (var viewModelId in grid[indexRow]) {
                        var counter = viewModelId.split('_')[1];
                        var newDbId = "E{0}P{1}_{2}".format(idEntidad, idPropiedad, counter);
                        if (newDbId !== dbId) {
                            result.push({
                                regla: regla,
                                dbId: newDbId
                            });
                        }
                        break nextRow;
                    }

                }
                // }
            }

        }
        return result;
    }

    function applyRuleGrid(db_id, newValue, callback) {
        var idEntidad = FBUtils.getEntidad(db_id);
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        if (detalleGrid[idEntidad] !== undefined) {
            var db_id_grid = db_id.split('_')[0];
            var reglasEntidadGrid = FormsBuilder.Runtime.getRules()[db_id_grid];
            if (reglasEntidadGrid === undefined)
                return;

            $.each(reglasEntidadGrid, function (k, reglaEntidad) {
                var regla;

                if (rulesCache[reglaEntidad.idRegla] === undefined) {
                    regla = $(reglas).find('regla[id="{0}"]'.format(reglaEntidad.idRegla));
                    rulesCache[reglaEntidad.idRegla] = regla;
                } else {
                    regla = rulesCache[reglaEntidad.idRegla];
                }

                reglaEntidad.definicion = regla.attr('definicion').trimAll();
                reglaEntidad.mensajeError = regla.attr('mensajeError');
                reglaEntidad.idPropiedadAsociada = regla.attr('idPropiedadAsociada');

                // console.log(reglaEntidad.definicion);

                var rules = [];
                rules.push({
                    regla: regla,
                    dbId: db_id
                });
                

                $.each(rules, function (index, item) {
                    switch (item.regla.attr('tipoRegla')) {
                        case 'Validacion':
                            if (SAT.Environment.settings('applyrulesvalidation') === true) {
                                ValidacionGrid(item.dbId, item.regla);
                            }
                            break;
                        case 'Calculo':
                        case 'Condicional Excluyente':
                            if ((SAT.Environment.settings('isHydrate') === true &&
                                regla.attr('ejecutarSiempre') !== '1') && AppDeclaracionesSAT.getConfig('forma') !== 'new')
                                break;

                            CalculoGrid(item.dbId, item.regla);
                            break;
                        case 'Visual':
                            VisualGrid(item.dbId, item.regla);
                            break;
                    }

                });
            });
        }

        if (callback !== undefined) {
            callback();
        }
    }

    function VisualGrid(db_id, regla) {
        var idEntidad = FBUtils.getEntidad(db_id);
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        var result;
        var counter;
        var reglaEntidad = {};

        reglaEntidad.definicion = regla.attr('definicion');
        reglaEntidad.definicion = reglaEntidad.definicion.trimAll();
        reglaEntidad.mensajeError = regla.attr('mensajeError');
        reglaEntidad.idPropiedadAsociada = regla.attr('idPropiedadAsociada');
        reglaEntidad.idRegla = regla.attr('id');
        var xmlCopy = FormsBuilder.XMLForm.getCopy();

        var symbolsXml = xmlCopy.find('definicionReglas > propiedades > propiedad[idRegla="{0}"]'.format(regla.attr('id')));
        var symbols = [];
        $.each(symbolsXml, function (k, sym) {
            symbols.push('$' + $(sym).attr('idPropiedad'));
        });
        symbols.push(reglaEntidad.definicion.split("=")[0]);

        for (var symbol in symbols) {
            for (var detalle in detalleGrid[idEntidad]) {
                for (var detalleItem in detalleGrid[idEntidad][detalle]) {
                    var id = detalleItem.substring(detalleItem.indexOf('P') + 1, detalleItem.length);

                    var symbolDetalle = '$' + id;
                    counter = id.split('_')[1];

                    if (counter === db_id.split('_')[1]) {
                        if (symbolDetalle === symbols[symbol] + '_' + counter) {
                            var searchSymbols = reglaEntidad.definicion.match('[$]{0}'.format(id.split('_')[0]));
                            if (searchSymbols !== null) {
                                $.each(searchSymbols, function (k, searchSymbol) {
                                    var matchSymbol = new RegExp("\\" + searchSymbol + "(?!([A-Z\d]|(_[0-9]*))+)|" + "\\" + searchSymbol + "((_[0-9]*)+)", "igm");
                                    reglaEntidad.definicion = reglaEntidad.definicion.replace(matchSymbol, function () {
                                        return searchSymbol + '_' + counter;
                                    });
                                    return false;
                                });
                            }
                        }
                    }
                }
            }
        }

        try {
            var exprs = reglaEntidad.definicion.match(/ESNULO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprsGrid(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/INHABILITAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprsGrid(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/OCULTAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprsGrid(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/MOSTRAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprsGrid(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/[^IN]HABILITAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprsGrid(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/ELEMENTOSGRID[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/ESENTEROPOSITIVO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprsGrid(exprs, reglaEntidad);

            FormsBuilder.Runtime.evaluateGrid(reglaEntidad.definicion);
            if (AppDeclaracionesSAT.getConfig('view-rules')) {
                console.log("Resultado N/A -:- Tipo [VisualGrid] -:- RuleId {0}-:- Regla {1}".format(reglaEntidad.idRegla, reglaEntidad.definicion));

            }
        } catch (err) {
            if (AppDeclaracionesSAT.getConfig('debug')) {
                console.log("Mensaje de error {0} -:- Regla {1}".format(err.message, reglaEntidad.definicion));
            }
        }
    }

    function modifiyExprsGrid(exprs, reglaEntidad) {
        if (exprs !== null) {
            $.each(exprs, function (k, expr) {
                reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace("(", 'GRID("').replace(")", '")'));
            });
        }
    }

    function ValidacionGrid(db_id, regla) {
        var idEntidad = FBUtils.getEntidad(db_id);
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        var result;
        var counter;
        var counterSearch;
        var reglaEntidad = {};
        reglaEntidad.definicion = regla.attr('definicion');
        reglaEntidad.definicion = reglaEntidad.definicion.trimAll();
        reglaEntidad.mensajeError = regla.attr('mensajeError');
        reglaEntidad.idPropiedadAsociada = regla.attr('idPropiedadAsociada');
        reglaEntidad.idRegla = regla.attr('id');
        var xmlCopy = FormsBuilder.XMLForm.getCopy();

        if (SAT.Environment.settings('applyrulesvalidation')) {
            var symbolsXml = xmlCopy.find('definicionReglas > propiedades > propiedad[idRegla="{0}"]'.format(regla.attr('id')));

            var symbols = [];
            $.each(symbolsXml, function (k, sym) {
                symbols.push('$' + $(sym).attr('idPropiedad'));
            });

            for (var symbol in symbols) {
                for (var detalle in detalleGrid[idEntidad]) {
                    for (var detalleItem in detalleGrid[idEntidad][detalle]) {
                        var id = detalleItem.substring(detalleItem.indexOf('P') + 1, detalleItem.length);
                        var symbolDetalle = '$' + id;
                        counter = id.split('_')[1];

                        if (counter === db_id.split('_')[1]) {
                            counterSearch = counter;
                            if (symbolDetalle === symbols[symbol] + '_' + counter) {
                                var searchSymbols = reglaEntidad.definicion.match('[$]{0}'.format(id.split('_')[0]));
                                if (searchSymbols !== null) {
                                    $.each(searchSymbols, function (k, searchSymbol) {
                                        var matchSymbol = new RegExp("\\" + searchSymbol + "(?!([A-Z\d]|(_[0-9]*))+)|" + "\\" + searchSymbol + "((_[0-9]*)+)", "igm");
                                        reglaEntidad.definicion = reglaEntidad.definicion.replace(matchSymbol, function () {
                                            return searchSymbol + '_' + counter;
                                        });
                                        return false;
                                    });
                                }
                            }
                        }
                    }
                }
            }

            try {
                var exprs;
                if (reglaEntidad.definicion.match(/CONTADORCONDICIONAL[(](.*)[)]/igm) === null) {
                    exprs = reglaEntidad.definicion.match(/ESNULOGRID[(][$](\w+|[0-9^_]+)[)]/igm);
                    modifiyExprs(exprs, reglaEntidad);

                    exprs = reglaEntidad.definicion.match(/ELEMENTOSGRID[(][$](\w+|[0-9^_]+)[)]/igm);
                    modifiyExprs(exprs, reglaEntidad);

                    exprs = reglaEntidad.definicion.match(/VALORANTERIOR[(][$](\w+|[0-9^_]+)[)]/igm);
                    modifiyExprs(exprs, reglaEntidad);
                }

                exprs = reglaEntidad.definicion.match(/ESNULO[(][$](\w+|[0-9^_]+)[)]/igm);
                modifiyExprs(exprs, reglaEntidad);

                exprs = reglaEntidad.definicion.match(/DUPLICADO[(][$](\w+|[0-9^_]+)[)]/igm);
                modifiyExprs(exprs, reglaEntidad);

                exprs = reglaEntidad.definicion.match(/ESENTEROPOSITIVO[(][$](\w+|[0-9^_]+)[)]/igm);
                modifiyExprsGrid(exprs, reglaEntidad);

                exprs = reglaEntidad.definicion.match(/SUMA[(](.*?)[)]/igm);
                if (exprs !== null) {
                    $.each(exprs, function (k, expr) {
                        if (expr.indexOf(',') === -1) {
                            var exprsSuma = expr.match(/[_][0-9]+/);
                            if (exprsSuma !== null) {
                                $.each(exprsSuma, function (k, exprSuma) {
                                    reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace(exprSuma, ''));
                                    expr = expr.replace(exprSuma, '');
                                });
                            }
                        }
                        reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace("(", '("').replace(")", '")'));
                    });
                }
                exprs = reglaEntidad.definicion.match(/SUMAGRID[(](.*?)[)]/igm);
                modifiyExprs(exprs, reglaEntidad);

                reglaEntidad.mensajeError = procesarMensajeErrorGrid(reglaEntidad.mensajeError, db_id.split('_')[1]);

                result = FormsBuilder.Runtime.evaluateGrid(reglaEntidad.definicion);
                var resultado = [reglaEntidad.tipo, result];

                if (AppDeclaracionesSAT.getConfig('view-rules')) {
                    console.log("Resultado {0} -:- Tipo [ValidacionGrid] -:- RuleId {1}-:- Regla {2}".format(result, reglaEntidad.idRegla, reglaEntidad.definicion));
                }

                var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()['$' + reglaEntidad.idPropiedadAsociada + '_' + counterSearch];
                var db_id2 = "E{0}P{1}".format(rl.entidad, rl.propiedad);

                var ctl = $('#htmlOutput [view-model="{0}"]'.format(db_id2)).not('a').not('button');
                if (ctl.length <= 0) {
                    ctl = $('#htmlOutput [view-model="{0}"]'.format(db_id)).not('a').not('button');
                }

                var ctlParent = ctl.parent();
                ctl.removeClass('sat-obligatorio');

                modificarUIValidacion(result, regla, reglaEntidad, db_id, db_id2, ctl, ctlParent, rl);
            } catch (err) {
                if (AppDeclaracionesSAT.getConfig('debug')) {
                    console.log("Mensaje de error {0} -:- Regla {1}".format(err.message, reglaEntidad.definicion));
                }
            }
        }

        return result;
    }

    function modifiyExprs(exprs, reglaEntidad) {
        if (exprs !== null) {
            $.each(exprs, function (k, expr) {
                reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace("(", '("').replace(")", '")'));
            });
        }
    }

    function DeshabilitarCalculoGrid(db_id, regla) {
        var idEntidad = FBUtils.getEntidad(db_id);
        var definicion = $(regla).attr('definicion');
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        var xmlCopy = FormsBuilder.XMLForm.getCopy();

        var symbolsXml = xmlCopy.find('definicionReglas > propiedades > propiedad[idRegla="{0}"]'.format($(regla).attr('id')));
        var symbols = [];
        $.each(symbolsXml, function (k, sym) {
            symbols.push('$' + $(sym).attr('idPropiedad'));
        });
        symbols.push(definicion.split("=")[0]);

        for (var symbol in symbols) {
            for (var detalle in detalleGrid[idEntidad]) {
                for (var detalleItem in detalleGrid[idEntidad][detalle]) {
                    var id = detalleItem.substring(detalleItem.indexOf('P') + 1, detalleItem.length);

                    var symbolDetalle = '$' + id;
                    var counter = id.split('_')[1];

                    if (counter === id.split('_')[1]) {
                        if (symbolDetalle === symbols[symbol] + '_' + counter) {
                            var searchSymbols = definicion.match('[$]{0}'.format(id.split('_')[0]));
                            if (searchSymbols !== null) {
                                $.each(searchSymbols, function (k, searchSymbol) {
                                    var matchSymbol = new RegExp("\\" + searchSymbol + "(?!([A-Z\d]|(_[0-9]*))+)|" + "\\" + searchSymbol + "((_[0-9]*)+)", "igm");

                                    definicion = definicion.replace(matchSymbol, function () {
                                        return searchSymbol + '_' + counter;
                                    });
                                    return false;
                                });
                            }
                        }
                    }
                }
            }
        }

        return definicion;
    }

    function CalculoGrid(db_id, regla) {
        var idEntidad = FBUtils.getEntidad(db_id);
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
        var result;
        var counter;
        var reglaEntidad = {};

        reglaEntidad.definicion = regla.attr('definicion').trimAll();
        reglaEntidad.mensajeError = regla.attr('mensajeError');
        reglaEntidad.idPropiedadAsociada = regla.attr('idPropiedadAsociada');
        reglaEntidad.idRegla = regla.attr('id');
        reglaEntidad.tipo = regla.attr('tipoRegla');

        var xmlCopy = FormsBuilder.XMLForm.getCopy();

        var symbolsXml = xmlCopy.find('definicionReglas > propiedades > propiedad[idRegla="{0}"]'.format(regla.attr('id')));
        var symbols = [];
        $.each(symbolsXml, function (k, sym) {
            symbols.push('$' + $(sym).attr('idPropiedad'));
        });
        symbols.push(reglaEntidad.definicion.split("=")[0]);

        for (var symbol in symbols) {
            for (var detalle in detalleGrid[idEntidad]) {
                for (var detalleItem in detalleGrid[idEntidad][detalle]) {
                    var id = detalleItem.substring(detalleItem.indexOf('P') + 1, detalleItem.length);

                    var symbolDetalle = '$' + id;
                    counter = id.split('_')[1];

                    if (counter === db_id.split('_')[1]) {
                        if (symbolDetalle === symbols[symbol] + '_' + counter) {
                            var searchSymbols = reglaEntidad.definicion.match('[$]{0}'.format(id.split('_')[0]));
                            if (searchSymbols !== null) {
                                $.each(searchSymbols, function (k, searchSymbol) {
                                    var matchSymbol = new RegExp("\\" + searchSymbol + "(?!([A-Z\d]|(_[0-9]*))+)|" + "\\" + searchSymbol + "((_[0-9]*)+)", "igm");

                                    reglaEntidad.definicion = reglaEntidad.definicion.replace(matchSymbol, function () {
                                        return searchSymbol + '_' + counter;
                                    });
                                    return false;
                                });
                            }
                        }
                    }
                }
            }
        }

        try {
            var exprs;
            if (reglaEntidad.definicion.match(/CONTADORCONDICIONAL[(](.*)[)]/igm) === null) {
                exprs = reglaEntidad.definicion.match(/ESNULOGRID[(][$](\w+|[0-9^_]+)[)]/igm);
                modifiyExprs(exprs, reglaEntidad);

                exprs = reglaEntidad.definicion.match(/ELEMENTOSGRID[(][$](\w+|[0-9^_]+)[)]/igm);
                modifiyExprs(exprs, reglaEntidad);

                exprs = reglaEntidad.definicion.match(/VALORANTERIOR[(][$](\w+|[0-9^_]+)[)]/igm);
                modifiyExprs(exprs, reglaEntidad);
            }

            exprs = reglaEntidad.definicion.match(/SUMA[(](.*?)[)]/igm);
            if (exprs !== null) {
                $.each(exprs, function (k, expr) {
                    if (expr.indexOf(',') === -1) {
                        var exprsSuma = expr.match(/[_][0-9]+/);
                        if (exprsSuma !== null) {
                            $.each(exprsSuma, function (k, exprSuma) {
                                reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace(exprSuma, ''));
                                expr = expr.replace(exprSuma, '');
                            });
                        }
                    }
                    reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace("(", '("').replace(")", '")'));
                });
            }

            exprs = reglaEntidad.definicion.match(/SUMAGRID[(](.*?)[)]/igm);
            if (exprs !== null) {
                $.each(exprs, function (k, expr) {
                    if (expr.indexOf(',') === -1) {
                        var encontroHijo = false;
                        var hermanos = [];
                        var filaPadre;

                        var symbols = reglaEntidad.definicion.match(/[$](\w+|[0-9^_]+)/igm);

                        var fila = symbols[1].split('_')[1];

                        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbols[1].split('_')[0]];
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
                                                    filaPadre = nodoEncontrado[padre].padre;
                                                    encontroHijo = true;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (filaPadre !== undefined) {
                            var exprsCalculo = reglaEntidad.definicion.split("=");
                            if (exprsCalculo[0].split('_').length <= 1) {
                                reglaEntidad.definicion = reglaEntidad.definicion.replace(exprsCalculo[0], exprsCalculo[0] + '_' + filaPadre);
                            }
                        }
                    } else {
                        var encontroHijo = false;
                        var hermanos = [];
                        var filaPadre;

                        var symbols = reglaEntidad.definicion.match(/[$](\w+|[0-9^_]+)/igm);

                        var fila = symbols[1].split('_')[1];

                        var rl = FormsBuilder.ViewModel.getFieldsForExprs()[symbols[1].split('_')[0]];
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
                                                    filaPadre = nodoEncontrado[padre].padre;
                                                    encontroHijo = true;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (filaPadre !== undefined) {
                            var exprsCalculo = reglaEntidad.definicion.split("=");
                            reglaEntidad.definicion = reglaEntidad.definicion.replace(exprsCalculo[0], exprsCalculo[0] + '_' + filaPadre);
                        }
                    }
                    reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace("(", '("').replace(")", '")'));
                });
            }


            result = FormsBuilder.Runtime.evaluateGrid(reglaEntidad.definicion);

            if (AppDeclaracionesSAT.getConfig('view-rules')) {
                console.log("Resultado {0} -:- Tipo [{3}Grid] -:- RuleId {1}-:- Regla {2}".format(result, reglaEntidad.idRegla, reglaEntidad.definicion, reglaEntidad.tipo));

            }

            if (result !== undefined) {
                exprs = reglaEntidad.definicion.split("=");

                var rl = FormsBuilder.ViewModel.getFieldsForExprsGrid()[exprs[0]];
                if (rl !== undefined) {
                    var db_id2 = "E{0}P{1}".format(rl.entidad, rl.propiedad);

                    var detalleGrid2 = FormsBuilder.ViewModel.getDetalleGrid()[FBUtils.getEntidad(db_id2)];
                    for (var indexDetalle in detalleGrid2) {
                        if (detalleGrid2[indexDetalle][db_id2] !== undefined) {
                            detalleGrid2[indexDetalle][db_id2](result);

                            FBUtils.applyFormatCurrencyOnElement($('input[view-model="{0}"]'.format(db_id2)));

                        }
                    }
                } else {
                    exprs = reglaEntidad.definicion.split("=");

                    var rl = FormsBuilder.ViewModel.getFieldsForExprs()[exprs[0]];

                    var db_id2 = "E{0}P{1}".format(rl.entidad, rl.propiedad);
                    viewModel[FBUtils.getEntidad(db_id2)][db_id2](result);

                    var $input = $('input[view-model="{0}"]'.format(db_id2));
                    FBUtils.applyFormatCurrencyOnElement($input);

                }
            }
        } catch (err) {
            if (AppDeclaracionesSAT.getConfig('debug')) {
                console.log("Mensaje de error {0} -:- Regla {1}".format(err.message, reglaEntidad.definicion));
            }
        } finally {
            return result;
        }
    }

    function getDbIdsPropiedadesGrid(regla) {
        var $xml = FormsBuilder.XMLForm.getCopy();
        var idRegla = $(regla).attr("id");
        var propiedadesInvolved = $xml.find("definicionReglas propiedad[idRegla='{0}']".format(idRegla));
        var propiedadesGrid = {};
        $.each(propiedadesInvolved, function (index, propiedad) {
            var idPropiedad = $(propiedad).attr("idPropiedad");
            var $entidad = $xml.find("propiedad[id='{0}']".format(idPropiedad)).parents("entidad:first");
            var $atributo = $entidad.find('atributo[nombre="multiplicidad"]');
            if ($atributo.attr('valor') == '*') {
                var infoProp = FormsBuilder.ViewModel.getFieldsForExprs()["${0}".format(idPropiedad)];
                var dbId = "E{0}P{1}".format(infoProp.entidad, infoProp.propiedad);
                propiedadesGrid[idPropiedad] = dbId;
            }
        });
        var temp = [];
        for (var index in propiedadesGrid) {
            temp.push(propiedadesGrid[index]);
        }
        propiedadesGrid = temp;
        return propiedadesGrid;
    }

    function applyRuleGridGeneric(regla) {
        var dbIds = getDbIdsPropiedadesGrid(regla);
        var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();

        for (var index in dbIds) {
            var dbId = dbIds[index];
            var idEntidad = FBUtils.getEntidad(dbId);
            var grid = detalleGrid[idEntidad];
            for (var indexRow in grid) {
                for (var viewModelId in grid[indexRow]) {
                    var genericViewModelId = viewModelId.split("_")[0];
                    if (genericViewModelId === dbId) {
                        var tipoRegla = $(regla).attr('tipoRegla');
                        switch (tipoRegla) {
                            case 'Validacion':
                                if (SAT.Environment.settings('applyrulesvalidation') === true) {
                                    ValidacionGrid(viewModelId, regla);
                                }
                                break;

                            case 'Calculo':
                            case 'Condicional Excluyente':
                                if ((SAT.Environment.settings('isHydrate') === true &&
                                    regla.attr('ejecutarSiempre') !== '1') && AppDeclaracionesSAT.getConfig('forma') !== 'new')
                                    break;

                                CalculoGrid(viewModelId, regla);
                                break;
                        }
                    }
                }
            }
        }
    }

    function applyRulesDejarSinEfecto(db_id, newValue) {
        var reglasEntidad = FormsBuilder.Runtime.getRules()[db_id];

        if (reglasEntidad === undefined)
            return;

        $.each(reglasEntidad, function (k, reglaEntidad) {
            var regla = $(reglas).find('regla[id="{0}"]'.format(reglaEntidad.idRegla));
            if (regla.attr('validaSeccion') === '1' || regla.attr('validaSeccionAlEntrar') === '1') {
                return;
            }
            var tipoRegla = regla.attr('tipoRegla');
            switch (tipoRegla) {
                case 'Validacion':
                    Validacion(db_id, regla);
                    break;
                case 'Visual':
                case "Visual Menu":
                    Visual(regla);
                    break;
                case 'Calculo':
                case 'Condicional Excluyente':
                    Calculo(regla);
                    break;
            }

        });
    }

    function applyRule(db_id, newValue) {
        var reglasEntidad = FormsBuilder.Runtime.getRules()[db_id];

        if (reglasEntidad === undefined)
            return;

        $.each(reglasEntidad, function (k, reglaEntidad) {
            var regla = $(reglas).find('regla[id="{0}"]'.format(reglaEntidad.idRegla));
            if (regla.attr('validaSeccion') === '1' || regla.attr('validaSeccionAlEntrar') === '1') {
                return;
            }
            var tipoRegla = regla.attr('tipoRegla');

            var participaEnGrid = regla.attr("participaEnGrid");
            if (participaEnGrid == 1) {
                applyRuleGridGeneric(regla, db_id);
            }

            switch (tipoRegla) {
                case 'Validacion':
                    if (SAT.Environment.settings('applyrulesvalidation') === true) {
                        Validacion(db_id, regla);
                    }
                    break;
                case 'Visual':
                    if (SAT.Environment.settings('dejarsinefecto') === false) {
                        Visual(regla);
                    }
                    break;
                case "Visual Menu":
                    Visual(regla);
                    break;
                case 'Calculo':
                case 'Condicional Excluyente':
                    if ((SAT.Environment.settings('isHydrate') === true &&
                        regla.attr('ejecutarSiempre') !== '1') && AppDeclaracionesSAT.getConfig('forma') !== 'new')
                        break;

                    Calculo(regla);
                    break;
            }
        });
    }

    function Validacion(db_id, regla) {
        var result;
        var reglaEntidad = {};
        reglaEntidad.definicion = regla.attr('definicion').trimAll();
        reglaEntidad.mensajeError = regla.attr('mensajeError');
        reglaEntidad.idPropiedadAsociada = regla.attr('idPropiedadAsociada');
        reglaEntidad.idRegla = regla.attr('id');

        try {
            var exprs = reglaEntidad.definicion.match(/ESNULO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/ESCLABE[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/ESENTEROPOSITIVO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/ESENTERONEGATIVO[(][$](\w+|[0-9^_]+)[)]/igm);
            if (exprs !== null) {
                $.each(exprs, function (index, expr) {
                    var idExpression = "${0}".format(db_id.substring(db_id.indexOf('P') + 1, db_id.length));
                    reglaEntidad.definicion = reglaEntidad.definicion.replace(expr, expr.replace(")", ',"{0}")'.format(idExpression)));
                });
            }

            reglaEntidad.mensajeError = procesarMensajeError(reglaEntidad.mensajeError, db_id.split('_')[1]);

            result = FormsBuilder.Runtime.evaluate(reglaEntidad.definicion);
            var resultado = [reglaEntidad.tipo, result];

            if (AppDeclaracionesSAT.getConfig('view-rules')) {
                console.log("Resultado {0} -:- Tipo [Validacion] -:- RuleId {1}-:- Regla {2}".format(resultado, reglaEntidad.idRegla, reglaEntidad.definicion));
            }

            var rl = FormsBuilder.ViewModel.getFieldsForExprs()['$' + reglaEntidad.idPropiedadAsociada];
            var db_id2 = "E{0}P{1}".format(rl.entidad, rl.propiedad);

            var ctl = $('#htmlOutput [view-model="{0}"]'.format(db_id2)).not('a').not('button');
            var ctlParent = ctl.parent();
            ctl.removeClass('sat-obligatorio');

            modificarUIValidacion(result, regla, reglaEntidad, db_id, db_id2, ctl, ctlParent, rl);
        } catch (err) {
            if (AppDeclaracionesSAT.getConfig('debug')) {
                console.log("Mensaje de error {0} -:- Regla {1}".format(err.message, reglaEntidad.definicion));
            }
        } finally {
            return result;
        }
    }

    function modificarUIValidacion(result, regla, reglaEntidad, db_id, db_id2, ctl, ctlParent, rl) {
        try {
            var entidadActual = $('#htmlOutput .panel[id="{0}"]'.format($('#sat-sections a.current').attr('idPanel'))).attr('idEntidadPropiedad');
            if (!result) {
                var saltarErrores = false;
                if (regla.attr('limpiarCampoNoValido') === '1') {
                    var ctlClean = $('#htmlOutput [view-model="{0}"]'.format(db_id));
                    if (!$(ctlClean).is(":disabled")) {
                        viewModel[FBUtils.getEntidad(db_id)][db_id]('');
                        saltarErrores = true;
                    }
                }

                if (regla.attr('mensajeErrorEnDialogo') === '1') {
                    if (!AppDeclaracionesSAT.getConfig("deshabilitarDialogos")) {
                        var existeMensaje = false;
                        $.each($("#modalSeccion .modal-body > div"), function (k, v) {
                            if (reglaEntidad.mensajeError === $(v).html()) {
                                existeMensaje = true;
                            }
                        });
                        if (existeMensaje === false) {
                            $("#modalSeccion .modal-body").append("<div style='padding-bottom: 15px;'>{0}</div>".format(reglaEntidad.mensajeError));
                        }
                        $("#modalSeccion").modal('show');
                    }
                } else {
                    if (saltarErrores === false) {
                        var idEntidadDiff = ctl.closest('div.panel[identidadpropiedad]').attr('identidadpropiedad');
                        var placement = "left";
                        var idEntidadTemp;
                        if (rl.entidad != idEntidadDiff) {
                            idEntidadTemp = rl.entidad;
                            rl.entidad = idEntidadDiff;
                        }
                        var menuItem = $('#sat-sections a[idPanel="{0}"]'.format(FormsBuilder.Parser.getSeccionesUI(rl.entidad)));
                        var menuItemParent = menuItem.parent();
                        menuItemParent.find('i').removeClass();
                        menuItemParent.find('i').attr('signout', 'signout');
                        if (rl.entidad !== entidadActual) {
                            menuItemParent.find('i').addClass('icon-warning-sign');
                        } else {
                            menuItemParent.find('i').addClass('icon-signout');
                        }
                        menuItemParent.find('i').css({ "color": "#CF3928" });
                        menuItemParent.find('a').css({ "color": "#CF3928" });

                        if (idEntidadTemp !== undefined) {
                            rl.entidad = idEntidadTemp;
                        }

                        if(ctl.hasClass("input-group")){
                            ctl.find("input[type='text']").addClass('sat-val-error');
                            placement = "top";
                        } else {
                            ctl.addClass('sat-val-error');
                        }                        

                        if (ctlParent.find("i[vm={0}]".format(db_id2)).length <= 0) {
                            var iconError = $('<i vm="{0}" class="icon-warning-sign sat-icon"></i>'.format(db_id2));
                            iconError.attr('rules', JSON.stringify([$(regla).attr("id")]));
                            iconError.attr('excluirEnGrid', regla.attr('excluirEnGrid') === "1", "1");

                            if(ctl.hasClass("input-group")){
                                ctl.append("<span class='input-group-btn'></span>");
                                ctl.find("span.input-group-btn:last").append(iconError.css("margin-left", "10px"));
                            }else{
                                ctl.after(iconError);
                            }                            

                            if (ctl.attr('cuadrodialogo') === undefined && !ctl.hasClass("input-group")) {
                                ctl.css('display', 'inline-block');
                                ctl.css('margin-right', '5px');
                            } else if(!ctl.hasClass("input-group")){
                                ctl.css('width', '71%');
                            } else {
                                ctl.css('width', '95%');
                            }

                            ctlParent.find('i[vm="{0}"]'.format(db_id2)).popover('destroy');
                            ctlParent.find('i[vm="{0}"]'.format(db_id2)).popover({
                                trigger: 'click',
                                placement: placement,
                                content: '<div vm="{0}"><div style="clear: both"></div>{1}</div>'.format(db_id2, reglaEntidad.mensajeError),
                                html: "true"
                            });

                            ctlParent.find('i[vm="{0}"]'.format(db_id2)).on('shown.bs.popover', function () {
                                FBUtils.applyFormatCurrencyOnElement(ctlParent.find('div[vm="{0}"] span.currency'.format(db_id2)), true);
                            });

                        } else {
                            var iconError = ctlParent.find('i[vm="{0}"]'.format(db_id2));
                            var rulesIcon = JSON.parse(iconError.attr('rules'));
                            var indexRule = $.inArray($(regla).attr("id"), rulesIcon);

                            if (indexRule === -1) {
                                rulesIcon.push($(regla).attr("id"));
                                iconError.attr('rules', JSON.stringify(rulesIcon));
                            }

                            ctlParent.find('i[vm="{0}"]'.format(db_id2)).popover('destroy');
                            ctlParent.find('i[vm="{0}"]'.format(db_id2)).popover({
                                trigger: 'click',
                                placement: "left",
                                content: '<div vm="{0}"><div style="clear: both"></div>{1}</div>'.format(db_id2, reglaEntidad.mensajeError),
                                html: "true"
                            });

                            ctlParent.find('i[vm="{0}"]'.format(db_id2)).on('shown.bs.popover', function () {
                                FBUtils.applyFormatCurrencyOnElement(ctlParent.find('div[vm="{0}"] span.currency'.format(db_id2)), true);
                            });
                        }
                    }
                }
            } else {
                setTimeout(function () {
                    // console.log(ctlParent.find('i[vm="{0}"]'.format(db_id2)).length, db_id2);
                    if (ctlParent.find('i[vm="{0}"]'.format(db_id2)).length > 0) {
                        var iconError = ctlParent.find('i[vm="{0}"]'.format(db_id2));
                        var rulesIcon = JSON.parse(iconError.attr('rules'));
                        var indexRule = $.inArray($(regla).attr("id"), rulesIcon);

                        if (indexRule >= 0) {
                            rulesIcon.splice(indexRule, 1);
                            iconError.attr('rules', JSON.stringify(rulesIcon));

                            if (rulesIcon.length <= 0) {
                                var iconValidacion = ctlParent.find('i[vm="{0}"]'.format(db_id2));
                                iconValidacion.popover('destroy');
                                iconValidacion.remove();

                                if (ctl.attr('cuadrodialogo') === undefined && !ctl.hasClass("input-group")) {
                                    ctl.css('display', 'block');
                                    ctl.css('margin-right', '0px');
                                } else if(!ctl.hasClass("input-group")){
                                    ctl.css('width', '80%');
                                } else{
                                    ctl.attr("style", "");
                                }

                                ctl.removeClass('sat-val-error');
                                ctl.find("input[type='text']").removeClass('sat-val-error');
                                ctl.removeClass('sat-obligatorio');
                            }
                        }

                        var idEntidadDiff = ctl.closest('div.panel[identidadpropiedad]').attr('identidadpropiedad');
                        var idEntidadTemp;
                        if (rl.entidad != idEntidadDiff) {
                            idEntidadTemp = rl.entidad;
                            rl.entidad = idEntidadDiff;
                        }

                        var menuItem = $('#sat-sections a[idPanel="{0}"]'.format(FormsBuilder.Parser.getSeccionesUI(rl.entidad)));
                        var menuItemParent = menuItem.parent();
                        menuItemParent.find('i').removeClass();
                        var icons = $('#htmlOutput .panel[identidadpropiedad="{0}"] i[vm]'.format(rl.entidad));
                        if (icons.length <= 0) {
                            if (rl.entidad !== entidadActual) {
                                var entroSeccion = FormsBuilder.ViewModel.getFlujoSecciones()[rl.entidad]['EntroSeccion'];
                                if (entroSeccion === true) {
                                    menuItemParent.find('i').addClass('icon-ok-circle');
                                }
                            } else {
                                menuItemParent.find('i').addClass('icon-signout');
                            }
                            menuItemParent.find('i').css({ "color": "#4D4D4D" });
                            menuItemParent.find('a').css({ "color": "#4D4D4D" });
                        } else {
                            if (rl.entidad !== entidadActual) {
                                menuItemParent.find('i').addClass('icon-warning-sign');
                            } else {
                                menuItemParent.find('i').addClass('icon-signout');
                            }
                        }
                        if (idEntidadTemp !== undefined) {
                            rl.entidad = idEntidadTemp;
                        }
                    }
                    $('#htmlOutput').find('.popover').remove();
                }, 10);
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    function Visual(regla) {
        var reglaEntidad = {};
        reglaEntidad.definicion = regla.attr('definicion').trimAll();
        reglaEntidad.mensajeError = regla.attr('mensajeError');
        reglaEntidad.idPropiedadAsociada = regla.attr('idPropiedadAsociada');
        reglaEntidad.idRegla = regla.attr('id');

        try {
            var exprs = reglaEntidad.definicion.match(/ESNULO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/OCULTAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/MOSTRAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/LIMPIARCHECK[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/DESHABILITAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/INHABILITAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/[^IN]HABILITAR[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/OBLIGATORIO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/ESENTEROPOSITIVO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            FormsBuilder.Runtime.evaluate(reglaEntidad.definicion);

            if (AppDeclaracionesSAT.getConfig('view-rules')) {
                console.log("Resultado N/A -:- Tipo [Visual] -:- RuleId {0}-:- Regla {1}".format(reglaEntidad.idRegla, reglaEntidad.definicion));
            }
        } catch (err) {
            if (AppDeclaracionesSAT.getConfig('debug')) {
                console.log("Mensaje de error {0} -:- Regla {1}".format(err.message, reglaEntidad.definicion));
            }
        }
    }

    function Calculo(regla) {
        var result;
        var reglaEntidad = {};
        reglaEntidad.definicion = regla.attr('definicion').trimAll();
        reglaEntidad.mensajeError = regla.attr('mensajeError');
        reglaEntidad.idPropiedadAsociada = regla.attr('idPropiedadAsociada');
        reglaEntidad.idRegla = regla.attr('id');
        reglaEntidad.tipo = regla.attr('tipoRegla');

        try {
            var exprs = reglaEntidad.definicion.match(/ESNULO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/SUMA[(](.*?)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/SUMAGRID[(](.*?)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            exprs = reglaEntidad.definicion.match(/ESENTEROPOSITIVO[(][$](\w+|[0-9^_]+)[)]/igm);
            modifiyExprs(exprs, reglaEntidad);

            result = FormsBuilder.Runtime.evaluate(reglaEntidad.definicion);

            if (AppDeclaracionesSAT.getConfig('view-rules')) {
                console.log("Resultado {0} -:- Tipo [{3}] -:- RuleId {1}-:- Regla {2}".format(result, reglaEntidad.idRegla, reglaEntidad.definicion, reglaEntidad.tipo));
            }

            if (result !== undefined) {
                exprs = reglaEntidad.definicion.split("=");

                var rl = FormsBuilder.ViewModel.getFieldsForExprs()[exprs[0]];

                var db_id2 = "E{0}P{1}".format(rl.entidad, rl.propiedad);
                viewModel[FBUtils.getEntidad(db_id2)][db_id2](result);

                var $input = $('input[view-model="{0}"]'.format(db_id2));
                FBUtils.applyFormatCurrencyOnElement($input);
            }
        } catch (err) {
            if (AppDeclaracionesSAT.getConfig('debug')) {
                console.log("Mensaje de error {0} -:- Regla {1}".format(err.message, reglaEntidad.definicion));
            }
        } finally {
            return result;
        }
    }

    function procesarMensajeErrorGrid(mensaje, counter) {
        var xmlCopy = FormsBuilder.XMLForm.getCopy();

        var exprs = mensaje.match(/\B#\w+[0-9|A-Z^_]+/igm);
        if (exprs !== null) {
            $.each(exprs, function (k, expr) {
                var propiedad = $(xmlCopy).find('modeloDatos propiedad[id="{0}"]'.format(expr.substring(1, expr.length)));
                if (propiedad.length > 0) {
                    var tituloCorto = propiedad.find('atributo[nombre="TituloCorto"]').attr('valor');
                    mensaje = mensaje.replace(expr, "<b>{0}</b>".format(tituloCorto));
                }
            });
        }

        exprs = mensaje.match(/\{([^{}]+)\}/igm);
        var corchetes = false;
        if (exprs === null) {
            exprs = mensaje.match(/\[.*]/igm);
            corchetes = true;
        }

        if (exprs !== null) {
            var exprCalculoTemporal;
            var exprCalculo;

            $.each(exprs, function (k, expr) {
                var objDictionary = {};
                exprCalculoTemporal = expr;
                exprCalculo = (corchetes === true) ? expr : expr.replace(/\[|]/igm, "");

                var searchSymbols = expr.match(/[$](\w+|[0-9^_]+)/igm);
                if (searchSymbols !== null) {
                    $.each(searchSymbols, function (k, searchSymbol) {
                        var matchSymbol = new RegExp("\\" + searchSymbol + "(?![A-Z]|[0-9])", "igm");
                        if (objDictionary[searchSymbol] === undefined) {
                            if (FormsBuilder.ViewModel.getFieldsForExprsGrid()["{0}_{1}".format(searchSymbol, counter)] !== undefined) {
                                exprCalculo = exprCalculo.replace(matchSymbol, function () {
                                    return searchSymbol + '_' + counter;
                                });
                            }
                        }
                        objDictionary[searchSymbol] = searchSymbol;
                    });
                }

                var exprsSymbolSuma = exprCalculo.match(/SUMA[(](.*?)[)]/igm);
                if (exprsSymbolSuma !== null) {
                    $.each(exprsSymbolSuma, function (k, exprSymbol) {
                        if (exprSymbol.indexOf(',') === -1) {
                            var exprsNumero = exprSymbol.match(/[_][0-9]+/);
                            if (exprsNumero !== null) {
                                $.each(exprsNumero, function (k, exprSuma) {
                                    exprCalculo = exprCalculo.replace(exprSymbol, exprSymbol.replace(exprSuma, ''));
                                    exprSymbol = exprSymbol.replace(exprSuma, '');
                                });
                            }
                        }
                        exprCalculo = exprCalculo.replace(exprSymbol, exprSymbol.replace("(", '("').replace(")", '")'));
                    });
                }

                var result = FormsBuilder.Runtime.evaluateGrid(exprCalculo.replace(/\{|\}/igm, ''));

                if (ESNUMERO(result)) {
                    var fieldCurrency = $("<span class='currency' mostrarDecimales='2'>{0}</span>".format(result));
                    FBUtils.applyFormatCurrencyOnElement(fieldCurrency, true);
                    result = fieldCurrency.html();
                }
                mensaje = mensaje.replace(exprCalculoTemporal, result);
            });
        }

        return mensaje;
    }

    function procesarMensajeError(mensaje) {
        var xmlCopy = FormsBuilder.XMLForm.getCopy();

        var exprs = mensaje.match(/\B#\w+[0-9|A-Z^_]+/igm);
        if (exprs !== null) {
            $.each(exprs, function (k, expr) {
                var propiedad = $(xmlCopy).find('modeloDatos propiedad[id="{0}"]'.format(expr.substring(1, expr.length)));
                if (propiedad.length > 0) {
                    var tituloCorto = propiedad.find('atributo[nombre="TituloCorto"]').attr('valor');
                    mensaje = mensaje.replace(expr, "<b>{0}</b>".format(tituloCorto));
                }
            });
        }

        exprs = mensaje.match(/\[.*]/igm);
        if (exprs !== null) {
            var objDictionary = {};
            var exprCalculoTemporal;
            var exprCalculo;
            $.each(exprs, function (k, expr) {
                exprCalculoTemporal = expr;
                exprCalculo = expr.replace(/\[|]/igm, "");

                var searchSymbols = expr.match(/[$](\w+|[0-9^_]+)/igm);
                if (searchSymbols !== null) {
                    $.each(searchSymbols, function (k, searchSymbol) {
                        var matchSymbol = new RegExp("\\" + searchSymbol + "(?![A-Z]|[0-9])", "igm");
                        objDictionary[searchSymbol] = searchSymbol;
                    });
                }
            });

            var result = FormsBuilder.Runtime.evaluate(exprCalculo);
            if (ESNUMERO(result)) {
                var fieldCurrency = $("<span class='currency' mostrarDecimales='2'>{0}</span>".format(result));
                FBUtils.applyFormatCurrencyOnElement(fieldCurrency, true);
                result = fieldCurrency.html();
            }
            mensaje = mensaje.replace(exprCalculoTemporal, result);
        }

        return mensaje;
    }

    function applyDataBindings(cb) {
        var panels = $('.panel[identidadpropiedad]');
        $.each(panels, function (key, panel) {
            try {
                $.each($(panel).find('[view-model]'), function (k, controlViewModel) {
                    var vmAttr = $(controlViewModel).attr('view-model');
                    var idEntidad = vmAttr.substring(1, vmAttr.indexOf('P'));
                    ko.applyBindings(viewModel[parseInt(idEntidad)], controlViewModel);
                });
            } catch (err) {
                console.log(err.message);
            }
        });

        cb();

    }

    function createXml() {
        var CONTROL_UPLOADER = "Uploader";

        var xmlCopy = FormsBuilder.XMLForm.getCopy();
        var xml = $($.parseXML('<?xml version="1.0" encoding="utf-8" ?><modeloDatos><relacionesGrid /><calculos /><SubRegimenes /><Roles /></modeloDatos>'));

        var seccionesVisibles = ['SAT_DATOS_GENERALES', 'SAT_DATOS_ACUSE', 'SAT_DATOS_ACUSE', 'SAT_DATOS_CONTRIBUYENTE', 'SAT_FOR'];
        var seccionesDialogo = ['SAT_OTROS_ESTIMULOS', 'SAT_COMPENSACIONES'];
        var clavesImpuestos = [];

        for (var entityId in viewModel) {
            var entityNode = $('<entidad />', xml);

            var controlEntidad = xmlCopy.find('formulario').children('controles').children('[idEntidadPropiedad="{0}"]'.format(entityId)).attr('id');
            var entidad = $(xmlCopy).find('entidad[id="{0}"]'.format(entityId));

            var atributos = entidad.children('atributos');

            var tipo = atributos.find('atributo[nombre="tipo"]').attr("valor");
            var claveimpuesto = atributos.find('atributo[nombre="ClaveImpuesto"]').attr("valor");

            var visibilidadSeccion = true; // false
            if (flujoSecciones[entityId] !== undefined) {
                if (flujoSecciones[entityId].NoAplica !== undefined) {
                    entityNode.attr('noaplica', flujoSecciones[entityId].NoAplica);
                } else {
                    entityNode.attr('noaplica', false);
                }
                //    if (flujoSecciones[entityId].NoVisible !== undefined) {
                //        visibilidadSeccion = !flujoSecciones[entityId].NoVisible;
                //    } else {
                //        visibilidadSeccion = true;
                //    }

                if (flujoSecciones[entityId]['EntroSeccion'] !== undefined) {
                    entityNode.attr('entroseccion', flujoSecciones[entityId]['EntroSeccion']);
                }

                if (flujoSecciones[entityId].OcultarMenuSeccion !== undefined) {
                    entityNode.attr('ocultarmenuseccion', flujoSecciones[entityId].OcultarMenuSeccion);
                }

                //} else {
                //    if ($.inArray(tipo, seccionesVisibles) > -1) {
                //        visibilidadSeccion = true;
                //    }
            } else {
                entityNode.attr('noaplica', false);
            }

            entityNode.attr('visibilidad', visibilidadSeccion);
            //if (visibilidadSeccion === true) {
            //    if (claveimpuesto !== undefined) {
            //        clavesImpuestos.push(claveimpuesto);
            //    }
            //}

            //if ($.inArray(tipo, seccionesDialogo) > -1) {
            //    if ($.inArray(claveimpuesto, clavesImpuestos) > -1) {
            //        visibilidadSeccion = true;
            //    }
            //}

            if (visibilidadSeccion === true) {
                entityNode.attr('claveimpuesto', atributos.find('atributo[nombre="ClaveImpuesto"]').attr("valor"));
                entityNode.attr('id', entityId);
                entityNode.attr('titulo', atributos.find('atributo[nombre="TituloCorto"]').attr("valor"));
                entityNode.attr('titulolargo', atributos.find('atributo[nombre="TituloLargo"]').attr("valor"));
                entityNode.attr('tipo', atributos.find('atributo[nombre="tipo"]').attr("valor"));
                entityNode.attr('clave', atributos.find('atributo[nombre="llave"]').attr("valor"));

                var visibilidad = atributos.find('atributo[nombre="multiplicidad"]').attr("valor");
                if (visibilidad === '*') {
                    var esCargaMasiva = xmlCopy.find('formulario control[idEntidadPropiedad="{0}"][tipoControl="ControlesGridRetenciones"]'.format(entityId));
                    if (esCargaMasiva.length > 0) {
                        var paginador = $('#htmlOutput .panel[idEntidadPropiedad="{0}"] .paginador'.format(entityId));
                        if (paginador.length > 0) {
                            entityNode.attr('pages', paginador.attr('pages'));
                            entityNode.attr('numElements', paginador.attr('numElements'));
                        }
                    }

                    if (viewModelDetalle[entityId] !== undefined) {
                        entityNode.attr('numeroelementos', viewModelDetalle[entityId].length);
                        var orden = 1;
                        for (var detalleId in viewModelDetalle[entityId]) {
                            var propertyNode = $('<fila />', xml);
                            var detalle = viewModelDetalle[entityId][detalleId];
                            propertyNode.attr('identificador', orden);
                            propertyNode.attr('orden', orden);
                            orden++;

                            for (var det in detalle) {
                                var propertyFile = $('<propiedad />', xml);

                                var propiedad = entidad.find('propiedad[id="{0}"]'.format(detalle[det].propiedad));

                                propertyFile.attr('id', detalle[det].propiedad);
                                propertyFile.attr('claveinformativa', propiedad.attr('claveInformativa') || '');
                                propertyFile.attr('clave', propiedad.find('atributo[nombre="llave"]').attr("valor") || '');
                                // propertyFile.attr('titulo', propiedad.find('atributo[nombre="TituloCorto"]').attr("valor") || '');
                                propertyFile.attr('orden', propiedad.find('atributo[nombre="Orden"]').attr("valor") || '');
                                propertyFile.attr('separamiles', propiedad.find('atributo[nombre="SeparaMiles"]').attr("valor") || '');
                                propertyFile.attr('tieneotrosestimulos', propiedad.find('atributo[nombre="TieneOtrosEstimulos"]').attr("valor") || '');
                                propertyFile.attr('tienecompensaciones', propiedad.find('atributo[nombre="TieneCompensaciones"]').attr("valor") || '');
                                propertyFile.attr('escompensaciontabulada', propiedad.find('atributo[nombre="EsCompensacionTabulada"]').attr("valor") || '');
                                propertyFile.attr('esfechaiso', propiedad.find('atributo[nombre="EsFechaISO"]').attr("valor") || '');
                                propertyFile.attr('etiqueta', detalle[det].etiqueta || '');

                                var valorDetalle = detalle[det].valor;
                                var esFecha = /[0-9_]{2}\/[0-9_]{2}\/[0-9_]{4}/igm.test(valorDetalle);

                                if (esFecha) {
                                    if (!IsNullOrEmpty(valorDetalle) && !isDateEmpty(valorDetalle)) {
                                        var date = FECHA(valorDetalle);
                                        if (date !== FBUtils.getDateMin()) {
                                            var dateISOString = date.toISOString();
                                            propertyFile.text(dateISOString);
                                        }
                                    }
                                } else {
                                    if (typeof (valorDetalle) === "string") {
                                        propertyFile.text(valorDetalle.replace(new RegExp(',', 'g'), ''));
                                    }
                                    else {
                                        propertyFile.text(valorDetalle);
                                    }
                                }

                                propertyNode.append(propertyFile);
                            }

                            entityNode.append(propertyNode);
                        }
                        $('modeloDatos', xml).append(entityNode);
                    } else {
                        entityNode.attr('grid', 1);

                        if (viewModelGrid[entityId] !== undefined) {
                            var relacionesGrid = FormsBuilder.Modules.getRelacionesGrid();
                            if (relacionesGrid[entityId] !== undefined) {
                                var relacionNode = $('<relacion />', xml);
                                for (var keyRelacionPadre in relacionesGrid[entityId]) {
                                    relacionNode.attr('entidadPadre', entityId);
                                    relacionNode.attr('entidadHijo', keyRelacionPadre);
                                    for (var keyRelacion in relacionesGrid[entityId][keyRelacionPadre]) {
                                        var propertyNode = $('<hijo />', xml);

                                        var fila = relacionesGrid[entityId][keyRelacionPadre][keyRelacion];
                                        var hijos = [];
                                        for (var keyHijo in fila.hijos) {
                                            hijos.push(fila.hijos[keyHijo].hijo);
                                        }

                                        propertyNode.attr('padre', fila.padre);
                                        propertyNode.attr('hijos', hijos.toString());

                                        relacionNode.append(propertyNode);
                                    }
                                }
                                $('modeloDatos relacionesGrid', xml).append(relacionNode);
                            }

                            var orden = 1;
                            entityNode.attr('numeroelementos', viewModelGrid[entityId].length);
                            for (var detalleId in viewModelGrid[entityId]) {
                                var propertyNode = $('<fila />', xml);
                                var detalle = viewModelGrid[entityId][detalleId];
                                propertyNode.attr('identificador', orden);
                                propertyNode.attr('orden', orden);
                                orden++;

                                for (var det in detalle) {

                                    var indice = det.split('_')[1];
                                    propertyNode.attr('indice', indice);

                                    var hasErrors = $("#htmlOutput table tr[tr-entidad=" + entityId + "][index=" + indice + "] i").length > 0;
                                    propertyNode.attr('error', hasErrors ? 1 : 0);

                                    var prop = det.substring(det.indexOf('P') + 1, det.length).split('_')[0];
                                    var propertyFile = $('<propiedad />', xml);

                                    var propiedad = entidad.find('propiedad[id="{0}"]'.format(prop));

                                    propertyFile.attr('id', prop);
                                    propertyFile.attr('claveinformativa', propiedad.attr('claveInformativa') || '');
                                    propertyFile.attr('clave', propiedad.find('atributo[nombre="llave"]').attr("valor") || '');
                                    // propertyFile.attr('titulo', propiedad.find('atributo[nombre="TituloCorto"]').attr("valor") || '');
                                    propertyFile.attr('orden', propiedad.find('atributo[nombre="Orden"]').attr("valor") || '');
                                    propertyFile.attr('separamiles', propiedad.find('atributo[nombre="SeparaMiles"]').attr("valor") || '');
                                    propertyFile.attr('tieneotrosestimulos', propiedad.find('atributo[nombre="TieneOtrosEstimulos"]').attr("valor") || '');
                                    propertyFile.attr('tienecompensaciones', propiedad.find('atributo[nombre="TieneCompensaciones"]').attr("valor") || '');
                                    propertyFile.attr('escompensaciontabulada', propiedad.find('atributo[nombre="EsCompensacionTabulada"]').attr("valor") || '');
                                    propertyFile.attr('esfechaiso', propiedad.find('atributo[nombre="EsFechaISO"]').attr("valor") || '');

                                    var valorGrid = detalle[det]();
                                    var esFecha = /[0-9_]{2}\/[0-9_]{2}\/[0-9_]{4}/igm.test(valorGrid);

                                    if (esFecha) {
                                        if (!IsNullOrEmpty(valorGrid) && !isDateEmpty(valorGrid)) {
                                            var date = FECHA(valorGrid);
                                            if (date !== FBUtils.getDateMin()) {
                                                var dateISOString = date.toISOString();
                                                propertyFile.text(dateISOString);
                                            }
                                        }

                                    } else {
                                        if (typeof (valorGrid) === "string") {
                                            propertyFile.text(valorGrid.replace(new RegExp(',', 'g'), ''));
                                        }
                                        else {
                                            propertyFile.text(valorGrid);
                                        }
                                    }

                                    propertyNode.append(propertyFile);
                                }

                                entityNode.append(propertyNode);
                            }
                            $('modeloDatos', xml).append(entityNode);
                        }
                    }
                } else {
                    for (var propertyName in viewModel[entityId]) {
                        var propiedad = entidad.find('propiedad[id="{0}"]'.format(propertyName.substring(propertyName.indexOf('P') + 1, propertyName.length)));
                        var tipoControl = xmlCopy.find("control[idEntidadPropiedad='{0}'][idPropiedad='{1}']".format(entityId, propiedad.attr("id"))).attr("tipoControl");
                        var propertyNode = $('<propiedad />', xml);
                        var atributosHijo = propiedad.children('atributos');

                        propertyNode.attr('id', propertyName.substring(propertyName.indexOf('P') + 1, propertyName.length));
                        propertyNode.attr('claveinformativa', propiedad.attr('claveInformativa') || '');
                        propertyNode.attr('clave', atributosHijo.find('atributo[nombre="llave"]').attr("valor") || '');
                        // propertyNode.attr('titulo', propiedad.find('atributo[nombre="TituloCorto"]').attr("valor") || '');
                        propertyNode.attr('orden', atributosHijo.find('atributo[nombre="Orden"]').attr("valor") || '');
                        propertyNode.attr('separamiles', atributosHijo.find('atributo[nombre="SeparaMiles"]').attr("valor") || '');
                        propertyNode.attr('tieneotrosestimulos', atributosHijo.find('atributo[nombre="TieneOtrosEstimulos"]').attr("valor") || '');
                        propertyNode.attr('tienecompensaciones', atributosHijo.find('atributo[nombre="TieneCompensaciones"]').attr("valor") || '');
                        propertyNode.attr('escompensaciontabulada', atributosHijo.find('atributo[nombre="EsCompensacionTabulada"]').attr("valor") || '');
                        propertyNode.attr('esfechaiso', atributosHijo.find('atributo[nombre="EsFechaISO"]').attr("valor") || '');

                        for (var checkIndex in viewModelCheckboxList) {
                            var valueCheck = '';
                            if (propertyName === checkIndex) {
                                for (var checkval in viewModelCheckboxList[checkIndex]) {
                                    if (viewModelCheckboxList[checkIndex][checkval] === true) {
                                        valueCheck += checkval + ',';
                                    }
                                }
                                viewModel[entityId][propertyName](valueCheck);
                            }
                        }

                        var valorFlat = viewModel[entityId][propertyName]();
                        var esFecha = /[0-9_]{2}\/[0-9_]{2}\/[0-9_]{4}/igm.test(valorFlat);
                        
                        if(tipoControl === CONTROL_UPLOADER){
                            var archivos = FormsBuilder.Modules.obtenerArchivos(propertyName);

                            for(var i = 0; i < archivos.length; i++){
                                var archivo = archivos[i];
                                var nodoArchivo = $("<archivo></archivo>", xml);
                                
                                nodoArchivo.attr("id", archivo.idArchivo);
                                nodoArchivo.attr("nombre", archivo.nombreArchivo);
                                nodoArchivo.attr("tamano", archivo.tamano);

                                propertyNode.append(nodoArchivo);
                            }
                        } else if (esFecha) {
                            if (!IsNullOrEmpty(valorFlat) && !isDateEmpty(valorFlat)) {
                                var date = FECHA(valorFlat);
                                if (date !== FBUtils.getDateMin()) {
                                    var dateISOString = date.toISOString();
                                    propertyNode.text(dateISOString);
                                }
                            }
                        } else {
                            if (typeof (valorFlat) === "string") {
                                propertyNode.text(valorFlat.replace(new RegExp(',', 'g'), ''));
                            }
                            else {
                                propertyNode.text(valorFlat);
                            }
                        }

                        entityNode.append(propertyNode);
                    }
                }

                $('modeloDatos', xml).append(entityNode);
            }
        }

        var calculodeduccioninversion = $('<calculodeduccioninversion />', xml);
        var calculoamortizacion = $('<calculoamortizacion />', xml);

        calculodeduccioninversion.append(FormsBuilder.Modules.getCalculoInversionesJSONBase64());
        calculoamortizacion.append(FormsBuilder.Calculo.Amortizacion.getJsonBase64());

        $('modeloDatos calculos', xml).append(calculodeduccioninversion).append(calculoamortizacion);

        var regimenFromPrecarga = FormsBuilder.XMLForm.getCopyPrecarga();
        if (regimenFromPrecarga !== undefined) {
            var nodesSubRegimen = FormsBuilder.XMLForm.getCopyPrecarga().find('SubRegimenes Catalogo').clone();
            $('modeloDatos SubRegimenes', xml).append(nodesSubRegimen);
        } else {
            var nodesSubRegimen = FormsBuilder.XMLForm.getCopyDeclaracion().find('SubRegimenes Catalogo').clone();
            $('modeloDatos SubRegimenes', xml).append(nodesSubRegimen);
        }

        var rolesFromPrecarga = FormsBuilder.XMLForm.getCopyPrecarga();
        if (rolesFromPrecarga !== undefined) {
            var nodesRoles = FormsBuilder.XMLForm.getCopyPrecarga().find('Roles Catalogo').clone();
            $('modeloDatos Roles', xml).append(nodesRoles);
        } else {
            var nodesRoles = FormsBuilder.XMLForm.getCopyDeclaracion().find('Roles Catalogo').clone();
            $('modeloDatos Roles', xml).append(nodesRoles);
        }

        var xmlResult = new XMLSerializer().serializeToString(xml.context);
        var encodeXmlResult = Base64.encode(xmlResult);
        $('#DVDECLARACION').html(encodeXmlResult);

        return xmlResult;
    }
})();