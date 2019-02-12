/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que crea una caja de texto
*
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", CuadroDetalle, loadedUI);

    var CONTROL_LAYOUT = 'input';
    var LABEL_LAYOUT = 'etiqueta';

    function CuadroDetalle(control) {
        var ctrlBase = FormsBuilder.Modules.ControlBase();
        var db_id = FormsBuilder.Utils.getDbId2(control);

        var rowNewDiv = $('<div><div class="sat-height-field"></div><input type="text" onpaste="return false;" class="form-control sat-height-dlg sat-textbox-dialog sat-detalle sat-height-field" placeholder=""><a data-toggle="modal" href="cuadroDialogoModal" class="btn btn-primary btn-red sat-button-dialog">Detalle</a></div>');

        rowNewDiv.find(CONTROL_LAYOUT).attr('id', $(control).attr('id'));

        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));
        var title = atributo.find('atributo[nombre="TituloCorto"]');
        var titleLarge = atributo.find('atributo[nombre="TituloLargo"]');

        //Roo
        //var helpText = atributo.find('atributo[nombre="AyudaEnLinea"]');
        var helpText = ctrlBase.getHelpText.apply(this, [control]);

        var tituloDialogo = $(control).find('atributo[nombre="TituloDialogo"]').attr('valor');
        rowNewDiv.find('a').attr('titulo-dialogo', tituloDialogo);

        rowNewDiv.find('div').html(title.attr('valor'));

        ctrlBase.formatCurrency.apply(this, [atributo, rowNewDiv, CONTROL_LAYOUT]);
        ctrlBase.validaLongitud.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('cuadrodialogo', '');
        rowNewDiv.find(CONTROL_LAYOUT).attr('onkeydown', 'TabCuadroDetalle(event)');

        var attrMaximoElementos = $(control).find('atributo[nombre="MaximoElementos"]');
        if (attrMaximoElementos.length > 0) {
            rowNewDiv.find('a').attr('MaximoElementos', attrMaximoElementos.attr('valor') || '');
        }

        var attrPropSumAct = $(control).find('atributo[nombre="PropSumAct"]');
        if (attrPropSumAct.length > 0) {
            rowNewDiv.find('a').attr('propSumAct', attrPropSumAct.attr('valor') || '');
        }

        var attrPropSumRec = $(control).find('atributo[nombre="PropSumRec"]');
        if (attrPropSumRec.length > 0) {
            rowNewDiv.find('a').attr('propSumRec', attrPropSumRec.attr('valor') || '');
        }

        ctrlBase.ordenTabulador.apply(this, [control, rowNewDiv, CONTROL_LAYOUT]);

        var helpString = ctrlBase.helpString.apply(this, [titleLarge, helpText]);

        rowNewDiv.find(CONTROL_LAYOUT).attr('help-text', helpString);
        rowNewDiv.find(CONTROL_LAYOUT).attr('data-bind', 'valueUpdate: "blur", value: {0}'.format(db_id));
        rowNewDiv.find(CONTROL_LAYOUT).attr('view-model', db_id);

        rowNewDiv.find('a').attr('view-model', db_id);

        return rowNewDiv.html();
    }

    function loadedUI() {
        $('#htmlOutput a[data-toggle="{0}"]'.format('modal')).on('click', function () {
            var idEntidadPropiedad;
            var maximoElementos = $(this).attr('MaximoElementos');

            var ctrlBase = FormsBuilder.Modules.ControlBase();

            var db_id = $(this).attr('view-model');
            var propSumAct = $(this).attr('propsumact');
            var propSumRec = $(this).attr('propsumrec');

            var dlg = $('[sat-dlg-dbid="{0}"] div:first'.format(db_id));

            if (dlg.length <= 0) {
                $(document.body).append($('<div><div sat-dlg-dbid="{0}"></div></div>'.format(db_id)).find('[sat-dlg-dbid]').html($('#templateCuadroDialogoModal').html()));
                dlg = $('[sat-dlg-dbid="{0}"] div:first'.format(db_id));
                dlg.find('.sat-view-model-row-id').val($(this).attr('view-model'));

                dlg.find('#lblTituloCuadroDialogo').text($(this).attr('titulo-dialogo'));

                var controlDlg = FormsBuilder.XMLForm.getCopy().find('control[idEntidadPropiedad="{0}"][idPropiedad="{1}"]'.format((db_id.split('P')[0]).replace('E', ''), db_id.substring(db_id.indexOf('P') + 1, db_id.length)));
                var tableRows = $(controlDlg).children('controles').children('control[tipoControl]');
                dlg.find('.sat-table').addClass('align-texts');
                dlg.find('.sat-table').html('<tr class="active sat-table-titles"></tr>');
                dlg.find('.sat-table-titles').html('');

                $.each(tableRows, function (k, control) {
                    idEntidadPropiedad = $(control).attr('idEntidadPropiedad');

                    if ($(control).attr('tipoControl') !== "ControlConsecutivo") {

                        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format($(control).attr('idEntidadPropiedad')));
                        var atributo = entidad.find('propiedad[id="{0}"]'.format($(control).attr('idPropiedad')));

                        var titleTh = atributo.find('atributo[nombre="TituloCorto"]');

                        dlg.find('.sat-table-titles').append('<td><span id="{0}" class="help-label icon-info-sign"/>{1}</td>'.format($(control).attr('idPropiedad'), titleTh.attr('valor') || '')).on('click',
                            '#{0}'.format($(control).attr('idPropiedad')),
                            function () {
                                var tituloLargo = atributo.find('atributo[nombre="TituloLargo"]');
                                var that = this;
                                var helpText = ctrlBase.getHelpText.apply(this, [control]);
                                var helpString = IsNullOrEmptyWhite(helpText.attr('Valor')) ? tituloLargo.attr('valor') : helpText.attr('Valor');

                                setTimeout(function () {
                                    $(that).popover('hide');
                                }, 1000 * 3
                                );

                                $(that).popover('destroy');

                                $(that).popover({
                                    trigger: 'manual',
                                    content: helpString,
                                    placement: "auto"
                                }).popover('show');

                                return;
                            });
                        //dlg.find('.sat-table-titles').append('<td><span class="help-label icon-info-sign"/>{0}</td>'.format(titleTh.attr('valor') || ''));

                    }
                });
                dlg.find('.sat-table-titles').append('<td></td>');

                var htmlFileOnce = '';
                $.each(tableRows, function (k, control) {
                    if ($(control).attr('tipoControl') !== "ControlConsecutivo") {
                        var htmlDlg = FormsBuilder.HTMLBuilder.generate(control);
                        htmlFileOnce += '<th style="text-align: center;">{0}</th>'.format(htmlDlg);
                    }
                });
                htmlFileOnce += '<th style="text-align: center;"><a href="#" class="btn btn-sm btn-primary btn-red delete">Eliminar</a></th>';
                dlg.find('.sat-tmpl-row').val('<tr item="">{0}</tr>'.format(htmlFileOnce));

                dlg.find('#nuevaFila').off();
                dlg.find('#nuevaFila').on('click', function () {
                    if (maximoElementos !== undefined) {
                        if (dlg.find('table tr[item]').length >= parseInt(maximoElementos)) {
                            var that = this;
                            console.log('has llegado al numero maximoElementos', maximoElementos, dlg.find('table tr[item]').length);
                            setTimeout(function () {
                                $(that).popover('hide');
                            }, 1000 * 3);

                            $(that).popover('destroy');
                            $(that).popover({
                                trigger: 'manual',
                                content: 'No se permiten mas de {0} elementos.'.format(maximoElementos),
                                placement: 'bottom'
                            }).popover('show');

                            return;
                        }
                    }
                    var newRow = dlg.find('.sat-tmpl-row').val();

                    dlg.find('.sat-table').append(newRow);

                    dlg.find('input[type="text"]').css('text-align', 'right');

                    dlg.find('input[class*="currency"]:last').blur(formatCurrency).focus(toNumber);

                    dlg.find('.delete:last').on('click', function () {
                        $(this).parents().eq(1).remove();
                        setMontoEstimulo(dlg);
                    });
                });

                dlg.find('#acceptTable').off();
                dlg.find('#acceptTable').on('click', function () {
                    var that = this;
                    var noDuplicados = dlg.find('table select[sinduplicidad]');

                    var duplicate = false;
                    var seleccionarValor = false;
                    var indexDuplicado;
                    if (noDuplicados.length > 0) {
                        var valsSelects = [];
                        var valsSelectsMsgVal = [];
                        $.each(noDuplicados, function (k, select) {
                            if ($(select).val() === '0') {
                                seleccionarValor = true;
                            }
                            if ($.inArray($(select).val(), valsSelects) < 0) {
                                valsSelects.push($(select).val());
                                valsSelectsMsgVal.push({ mensajeError: $(select).attr("MensajeValidacion") });
                            } else {
                                indexDuplicado = $(select).parent().index();
                                duplicate = true;
                            }
                        });
                    }

                    if (seleccionarValor) {

                        setTimeout(function () {
                            $(that).popover('hide');
                        }, 1000 * 3
                        );

                        var errMsg = IsNullOrEmptyWhite(valsSelectsMsgVal[0].mensajeError)
                            ? "El estímulo es obligatorio."
                            : valsSelectsMsgVal[0].mensajeError;

                        $(that).popover('destroy');

                        $(that).popover({
                            trigger: 'manual',
                            content: errMsg,
                            placement: "bottom"
                        }).popover('show');

                        return;
                    }

                    if (duplicate) {
                        setTimeout(function () {
                            $(that).popover('hide');
                        }, 1000 * 3);

                        var tituloCampo = dlg.find('table tr:first > td').eq(indexDuplicado).text();

                        $(that).popover('destroy');
                        $(that).popover({
                            trigger: 'manual',
                            content: 'Seleccionó un {0} más de una vez. Favor de verificar'.format(tituloCampo.toLowerCase()),
                            placement: "bottom"
                        }).popover('show');

                        return;
                    }

                    var inputs = dlg.find('table input[type="text"]');
                    var valorVacio = [];
                    $.each(inputs, function (key, input) {
                        var valueInput = $(input).val();

                        if (IsNullOrEmptyWhite(valueInput)) {
                            valorVacio.push({ mensajeError: $(input).attr("MensajeValidacion") });
                            return false;
                        }
                        var valueParsed = parseInt(valueInput);
                        if (valueParsed == 0) {
                            valorVacio.push({ mensajeError: "El monto debe ser mayor a cero" });
                            return false;
                        }
                    });

                    if (valorVacio.length > 0) {
                        setTimeout(function () {
                            $(that).popover('hide');
                        }, 1000 * 3);

                        $(that).popover('destroy');
                        $(that).popover({
                            trigger: 'manual',
                            content: valorVacio[0].mensajeError,
                            placement: "bottom"
                        }).popover('show');

                        return;
                    }

                    var suma = 0;
                    var inputsAcumular = dlg.find('table input[type="text"][acumular]');
                    $.each(inputsAcumular, function (key, input) {
                        $(input).toNumber();
                        var value = $(input).val();
                        if (!IsNullOrEmptyWhite(value)) {
                            suma += parseInt(value);
                        }
                    });

                    sumaDetalleAtributo(dlg, 'Actualizacion', propSumAct);
                    sumaDetalleAtributo(dlg, 'Recargo', propSumRec);

                    var viewModelDetalle = FormsBuilder.ViewModel.getDetalle();
                    viewModelDetalle[idEntidadPropiedad] = [];

                    var items = dlg.find('table tr[item]');
                    $.each(items, function (key, item) {
                        var objItem = [];
                        $.each($(item).find('.form-control'), function (k, control) {
                            objItem.push({ propiedad: $(control).attr('view-model').substring($(control).attr('view-model').indexOf('P') + 1, $(control).attr('view-model').length), valor: $(control).val(), etiqueta: $(control).find(':selected').text() });
                        });
                        viewModelDetalle[idEntidadPropiedad].push(objItem);
                    });

                    var db_id = dlg.find('.sat-view-model-row-id').val();
                    FormsBuilder.ViewModel.getDetalleFK()[db_id] = idEntidadPropiedad;
                    var viewModelId = (db_id.split('P')[0]).replace('E', '');
                    if (suma > 0) {
                        FormsBuilder.ViewModel.get()[viewModelId][db_id](suma);
                    } else {
                        FormsBuilder.ViewModel.get()[viewModelId][db_id]('');
                    }

                    $("input[view-model={0}]".format(db_id)).trigger("blur");
                    $.each(inputsAcumular, function (key, input) {
                        var format = FormsBuilder.Utils.getFormatCurrency();
                        $(this).formatCurrency(format);
                    });

                    dlg.modal('hide');
                });

                dlg.find('#cancelTable').off();
                dlg.find('#cancelTable').on('click', function () {
                    var inputs = dlg.find('table input[type="text"][acumular]');
                    if (inputs.length > 0) {
                        $("#modalYesNo").find('.si').off();
                        $("#modalYesNo").find('.si').on("click", function (e) {
                            dlg.find('table tr[item]').remove();

                            var db_id = dlg.find('.sat-view-model-row-id').val();
                            var entidad = (db_id.split('P')[0]).replace('E', '');
                            var actualValue = FormsBuilder.ViewModel.get()[entidad][db_id]();

                            if (!IsNullOrEmptyWhite(actualValue)) {
                                FormsBuilder.ViewModel.get()[entidad][db_id]('');
                            }

                            sumaDetalleAtributo(dlg, 'Actualizacion', propSumAct);
                            sumaDetalleAtributo(dlg, 'Recargo', propSumRec);

                            $("#modalYesNo").modal('hide');
                            dlg.modal('hide');
                        });
                        $("#modalYesNo").find('.no').off();
                        $("#modalYesNo").find('.no').on("click", function (e) {
                            $("#modalYesNo").modal('hide');
                        });

                        $("#modalYesNo").modal({
                            show: true,
                            backdrop: "static"
                        });
                    } else {
                        dlg.modal('hide');
                        var db_id = dlg.find('.sat-view-model-row-id').val();
                        var actualValue = FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]();
                        if (!IsNullOrEmptyWhite(actualValue)) {
                            FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]('');
                        }
                    }
                });

                dlg.find('table input[type="text"][acumular]').live('change', function () {
                    setMontoEstimulo(dlg);
                });

            }

            if (SAT.Environment.settings('showdialogs')) {
                dlg.modal({
                    show: true,
                    backdrop: "static"
                });
                setMontoEstimulo(dlg);
            }
        });
    }

    function setMontoEstimulo(selector) {
        var montoEstimulo = 0;
        var formato = FormsBuilder.Utils.getFormatCurrency();
        var inputs = selector.find('table input[type="text"][acumular]');

        $.each(inputs, function (key, input) {
            $(input).toNumber();
            var value = $(input).val();
            if (!IsNullOrEmptyWhite(value)) {
                montoEstimulo += parseInt(value);
            }
            $(input).formatCurrency(formato);
        });


        selector.find('#lblMontoEstimulo').html(montoEstimulo);
        selector.find('#lblMontoEstimulo').formatCurrency(formato);
    }

    function sumaDetalleAtributo(selector, atributo, toProp) {

        var dbId = selector.find('.sat-view-model-row-id').val();
        var viewModelId = (dbId.split('P')[0]).replace('E', '');
        var newDbId = 'E{0}P{1}'.format(viewModelId, toProp);

        var inputs = selector.find('table input[type="text"][sumaDetalle="{0}"]'.format(atributo));

        if (inputs.length > 0) {
            var total = 0;
            $.each(inputs, function (key, input) {
                $(input).toNumber();
                var value = $(input).val();
                if (!IsNullOrEmptyWhite(value)) {
                    total += parseInt(value);
                }
            });

            if (total > 0) {
                FormsBuilder.ViewModel.get()[viewModelId][newDbId](total);
            } else {
                FormsBuilder.ViewModel.get()[viewModelId][newDbId]('');
            }
        }
    }

    function formatCurrency() {
        $(this).formatCurrency(FormsBuilder.Utils.getFormatCurrency());
    }

    function toNumber() {
        $(this).toNumber();
    }
})();