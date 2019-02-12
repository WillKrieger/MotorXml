"use strict";

(function () {
    namespace("FormsBuilder.Parser", parse, groupsParse, columnsParse, controlsParse, getDataProp, getSeccionesUI);

    // Constants
    var GROUP_LAYOUT = 'control[tipoControl="Grupo"]';
    var COLUMN_LAYOUT = 'control[tipoControl="Columna"]';
    var CONTROLS_LAYOUT = 'control';

    var LABEL_GROUP = 'etiqueta';
    var FORM_LAYOUT = 'formulario > controles';
    var FORM_ROOT_LAYOUT = 'formulario';

    var PANEL_LAYOUT = 'panel-default';
    var PANEL_HEADING_LAYOUT = 'panel-heading';

    var LIST_SECTIONS_LAYOUT = 'lt-sections';

    // Variables
    var idPanel = 1; //Initial number for panels
    var data_prop = [];
    var seccionesUI = {};

    function getDataProp() {
        return data_prop;
    }

    function getSeccionesUI(key) {
        return seccionesUI[key];
    }

    function parse(xmlDoc, callback) {
        var domGen = '';

        $('.panel-sections .panel-title').html($(xmlDoc).find('formulario').attr('nombre'));

        FormsBuilder.Catalogs.init(xmlDoc);
        FormsBuilder.XMLForm.init(xmlDoc);

        var groups = $(xmlDoc).find(FORM_LAYOUT).children(GROUP_LAYOUT);
        domGen += groupsParse(groups);

        navigationGroupMenuParse(xmlDoc);

        callback(domGen);
    }

    function navigationGroupMenuParse(xmlDoc) {
        var FORM_LAYOUT_NAV = 'navegacion > agrupador';
        var GROUP_LAYOUT_NAV = 'seccion';
        var groups_nav = $(xmlDoc).find(FORM_LAYOUT_NAV);

        $.each(groups_nav, function (key, group_nav) {
            var title = $(group_nav).attr('titulo');
            var id = $(group_nav).attr('id');
            var idEntidadPropiedad = $(group_nav).attr('idEntidadPropiedad');
            var idPropiedad = $(group_nav).attr('idPropiedad');

            var db_id;
            if (idPropiedad !== null) {
                db_id = "E{0}P{1}".format(idEntidadPropiedad, idPropiedad);
                var cDiv = $('#t_' + id + '').append(' (<span id="span_' + db_id + '"></span>)');
                data_prop.push(db_id);
            }

            var groupSection = $('<div><div id="title_{0}"></div><div>'.format(id));
            groupSection.find('div:last').append('<div class="total-label" field-bind="{0}" id="t_{1}"></div>'.format(db_id, id));
            groupSection.find('div:last').append('<div class="row"> <div class="green"> <label>{0}</label> <label></label> </div>'.format(title));
            groupSection.append('<ul class="lt-sections"></ul>');

            $('#sat-sections').append(groupSection.html());
            var list = $('#sat-sections').find('ul:last');

            var sections = $(group_nav).find(GROUP_LAYOUT_NAV);
            $.each(sections, function (key, section) {
                var isOculto = $(section).attr("ocultar");
                var sectionTitle = $(section).attr('tituloSeccion');
                list.append('<li class="list-group-item {2}"><i class=""></i><a idPanel="{0}" idSeccion="t_{3}" href="#">{1}</a></li>'.format('A' + $(section).attr('idControlFormulario'), sectionTitle || '--- Sin titulo ---', isOculto ? "hidden" : "", id));
            });
        });
    }

    function groupsParse(groups) {
        var domGenerated = '';
        $.each(groups, function (key, group) {
            var classBalanceoColumnas = '';
            if ($(group).children('atributos').children('atributo[nombre="BalancearColumnas"]').length > 0) {
                classBalanceoColumnas = 'balanceoColumnas';
            }

            var panelNewDiv = $('<div><div class="panel {0}"><div class="panel-body {1}"></div></div></div>'.format(PANEL_LAYOUT, classBalanceoColumnas));

            if ($(group).children('atributos').children('atributo[nombre="ocultar"]').attr('valor') === "1") {
                panelNewDiv.find('.' + PANEL_LAYOUT).hide();
            }

            if ($(group).parents().eq(1)[0].nodeName === FORM_ROOT_LAYOUT) {
                panelNewDiv.find('.' + PANEL_LAYOUT).attr("id", "A{0}".format($(group).attr('id')));
                panelNewDiv.find('.' + PANEL_LAYOUT).attr("idEntidadPropiedad", $(group).attr('idEntidadPropiedad'));
                panelNewDiv.find('.' + PANEL_LAYOUT).hide();
                seccionesUI[$(group).attr('idEntidadPropiedad')] = "A{0}".format($(group).attr('id'));

                FormsBuilder.ViewModel.getFlujoSecciones()[$(group).attr('idEntidadPropiedad')] = {};
                FormsBuilder.ViewModel.getFlujoSecciones()[$(group).attr('idEntidadPropiedad')]['EntroSeccion'] = false;
                FormsBuilder.ViewModel.getFlujoSecciones()[$(group).attr('idEntidadPropiedad')]['NoAplica'] = false;
            }

            var paneldinamico = $(group).children('atributos').children('atributo[nombre="Panel"]');
            if (paneldinamico.length > 0) {
                panelNewDiv.find('.' + PANEL_LAYOUT).attr('PanelDinamico', paneldinamico.attr('valor') || '');
            }

            var title = $(group).children('atributos').find('atributo[nombre="TituloLargo"]');
            if (title.length > 0) {
                panelNewDiv.find('.' + PANEL_LAYOUT).prepend('<div class="{0}" style="alignment-baseline:text-before-edge;"></div>'.format(PANEL_HEADING_LAYOUT));
                if ($(group).parents().eq(1)[0].nodeName === FORM_ROOT_LAYOUT) {

                    var puedeSaltar = $(group).children('atributos').find('atributo[nombre="PuedeSaltar"]');
                    var saltoDependiente = $(group).children('atributos').find('atributo[nombre="SaltoDependiente"]');
                    var botonGuardar = '<a style="float: right;" class="guardardeclaracion btn btn-large btn-red" href="#">Guardar</a>';
                    var tempBotones = '';
                    if (puedeSaltar.length > 0) {
                        if (saltoDependiente.length > 0) {
                            tempBotones += '<a style="float: right; margin-right: 10px;" class="saltarseccion btn btn-large btn-red" saltoDependiente="{0}" href="#">No Aplica</a>'.format(saltoDependiente.attr('valor'));
                        } else {
                            tempBotones += '<a style="float: right; margin-right: 10px;" class="saltarseccion btn btn-large btn-red" href="#">No Aplica</a>';
                        }
                    }

                    var botonCalculoInversion = $(group).children('atributos').find('atributo[nombre="CalculoInversion"]');
                    if (botonCalculoInversion.length > 0) {
                        tempBotones += '<a style="float: right; margin-right: 10px;" campos="{0}" class="calculoinversion btn btn-large btn-red" href="#">Deducción de Inversiones</a>'.format(botonCalculoInversion.attr('valor'));
                    }

                    var botonCalculoAmortizacion = $(group).children('atributos').find('atributo[nombre="CalculoAmortizacion"]');
                    if (botonCalculoAmortizacion.length > 0) {
                        var helpText = "<span>Este módulo de Amortización de pérdidas fiscales es de uso optativo. " +
					        "Los resultados que en él se generen, aún cuando hayan sido transferidos, podrán ser modificados en el momento que desee.<span>";
                        tempBotones += '<a help-text="{1}" style="float: right; margin-right: 10px;" campos="{0}" class="calculoAmortizacion btn btn-large btn-red" href="#">Cálculo Amortización de pérdidas fiscales</a>'.format(botonCalculoAmortizacion.attr('valor'), helpText);
                    }

                    var botonCargaMasiva = $(group).children('atributos').find('atributo[nombre="CargaMasivaRetenciones"]');
                    if (botonCargaMasiva.length > 0) {
                        tempBotones += '<a style="float: right; margin-right: 10px;" identificador="{0}" entidad={1} class="cargaMasivaRetenciones carga btn btn-large btn-red" href="#">Carga Masiva</a>'.format(botonCargaMasiva.attr('valor'), $(group).attr('idEntidadPropiedad'));
                        tempBotones += '<a style="float: right; margin-right: 10px;" identificador="{0}" entidad={1} class="cargaMasivaRetenciones borrar btn btn-large btn-red" disabled="disabled" href="#">Borrar</a>'.format(botonCargaMasiva.attr('valor'), $(group).attr('idEntidadPropiedad'));
                    }


                    var botonesExtras = '';
                    if (SAT.Environment.settings('dejarsinefecto') === true) {
                        $(tempBotones).each(function (index, value) {
                            botonesExtras += $(value).attr("disabled", true).prop('outerHTML');
                        });
                    } else {
                        botonesExtras = tempBotones;
                    }
                    botonesExtras += '<div style="clear: both;"></div>';


                    panelNewDiv.find('.' + PANEL_HEADING_LAYOUT).html('<p style="float: left;word-wrap: break-word;white-space: pre-line;max-width: 75%;">{0}</p> {1}'.format(title.attr('valor'), botonGuardar + botonesExtras));
                } else {
                    panelNewDiv.find('.' + PANEL_HEADING_LAYOUT).html(title.attr('valor'));
                }
            }

            var columns = $(group).children('controles').children(COLUMN_LAYOUT);
            panelNewDiv = columnsParse(columns, panelNewDiv);

            domGenerated += panelNewDiv.html();

            if ($(group).parents().eq(1)[0].nodeName === FORM_ROOT_LAYOUT) {
                $('.' + LIST_SECTIONS_LAYOUT).append('<li class="list-group-item"><i class=""></i><a idPanel="{0}" href="#">{1}</a> <i class="icon-chevron-right"></i></li>'.format('A' + idPanel++, title.attr('valor') || '--- Sin titulo ---'));
            }
        });

        return domGenerated;
    }

    function columnsParse(columns, panelNewDiv) {
        $.each(columns, function (key, column) {
            var childGroups = $(column).children('controles').children(GROUP_LAYOUT);

            var containerDiv = $('<div><div class="title-column"></div><div class="bd"></div></div>');
            if ($(column).attr('width') !== undefined) {
                containerDiv.find('.bd').css({ 'width': $(column).attr('width') });
            } else {
                if (columns.length === 1) {
                    containerDiv.find('.bd').css({ 'width': '100%' });
                } else {
                    containerDiv.find('.bd').css({ 'width': ((98 / columns.length)) + '%' });
                }
            }

            if (childGroups.length <= 0) {
                var controlHtml = controlsParse(column);

                containerDiv.find('.bd:first').append(controlHtml);
            } else {
                var childRecursiveNodes = groupsParse(childGroups);
                containerDiv.find('.bd:first').append(childRecursiveNodes);
            }
            panelNewDiv.find('.panel-body:first').append(containerDiv.html());
        });

        return panelNewDiv;
    }

    function controlsParse(column) {
        var controls = $(column).children('controles').children(CONTROLS_LAYOUT);
        var controlHtml = '';
        $.each(controls, function (key, control) {
            controlHtml += FormsBuilder.HTMLBuilder.generate(control);
        });

        return controlHtml;
    }
})();
