"use strict";

(function () {
    namespace("AppDeclaracionesSAT", initUIStepThree, initUIStepFour, initStateForm, initGrids, resetCursorInputCurrency,
        showHelpDialog, setOperationStepFour, balanceoColumnas, validaTodasSecciones, errorSecciones);

    //  Crea un nuevo registros en los grids sin valores
    function initGrids() {
        FormsBuilder.Modules.loadedUI();
        FormsBuilder.Modules.loadedUICompensaciones();
        FormsBuilder.Modules.loadedUIControlesGrid();
        FormsBuilder.Modules.loadedUIControlesGridRetenciones();
        FormsBuilder.Modules.loadedUIPanelDinamico();
        FormsBuilder.Modules.loadedUIFormularioGrid();        


        if (AppDeclaracionesSAT.getConfig('forma') !== 'tmp') {
            // $('.panel').find('button.btnAddCtrlGridRow:first').click();
        }
        $('#helptext').html('');
    }

    ko.observable.fn.withPausing = function () {
        this.notifySubscribers = function () {
            if (!this.pauseNotifications) {
                ko.subscribable.fn.notifySubscribers.apply(this, arguments);
            }
        };

        this.sneakyUpdate = function (newValue) {
            this.pauseNotifications = true;
            this(newValue);
            this.pauseNotifications = false;
        };

        return this;
    };

    ko.bindingHandlers.radio = {
        init: function (element, valueAccessor, allBindings, data, context) {
            var $buttons, $element, elementBindings, observable;
            observable = valueAccessor();
            if (!ko.isWriteableObservable(observable)) {
                throw "You must pass an observable or writeable computed";
            }
            $element = $(element);
            if ($element.hasClass("btn")) {
                $buttons = $element;
            } else {
                $buttons = $(".btn", $element);
            }
            elementBindings = allBindings();
            $buttons.each(function () {
                var $btn, btn, radioValue;
                btn = this;
                $btn = $(btn);
                radioValue = elementBindings.radioValue || $btn.attr("data-value") || $btn.attr("value") || $btn.text();
                $btn.on("click", function () {
                    if (!$(this).hasClass("active")) {
                        observable(ko.utils.unwrapObservable(radioValue));
                    } else {
                        $(this).removeClass("active");
                        observable("");
                    }
                });
                return ko.computed({
                    disposeWhenNodeIsRemoved: btn,
                    read: function () {
                        $btn.toggleClass("active", observable() === ko.utils.unwrapObservable(radioValue));
                    }
                });
            });
        }
    };

    function initUIStepThree(callback) {
        FormsBuilder.Modules.loadedUIUploader();
        
        $('#home').focus(function () {
            setTimeout(function () {
                FBUtils.setDecimalsElement();
            }, FBUtils.getMs());
        });
        $(window).click(function () {
            setTimeout(function () {
                FBUtils.setDecimalsElement();
                window.lastElement = $('#htmlOutput').find('[view-model]:first');
            }, FBUtils.getMs());
        });

        FormsBuilder.Calculo.Amortizacion.loadedUI();

        $('.subregimenes').live('change', function () {
            // AE = 2, AE Simplificado = 3, AE Profesional Simplificado = 4, Régimen Intermedio = 5
            var regimenesexcluyentes = ['2', '3', '4', '5'];

            var idsubregimen = this.attributes["idSubRegimen"].value;
            var seleccionado = this.checked;

            if ($.inArray(idsubregimen, regimenesexcluyentes) > -1) {
                // Removemos la marca
                $('#subregimenes :input[type="checkbox"]').each(function () {
                    var valor = this.attributes["idSubRegimen"].value;
                    if ($.inArray(valor, regimenesexcluyentes) > -1) {
                        this.checked = false;
                    }
                });
                this.checked = seleccionado;
            }
        });

        $('#btnAceptarSubregimenes').on('click', function () {
            if (SAT.Environment.settings('dejarsinefecto') === true) {
                setTimeout(function () {
                    $('#sat-sections .lt-sections:visible:first').find('a:first').click();
                    $('#modalSubregimenes').modal('hide');
                }, 250);
                return;
            }

            var subregimenesInputs = $('#subregimenes input:checked');
            var areasgeograficasInputs = $('#areasgeograficas input:checked');

            if (subregimenesInputs.length > 0 && areasgeograficasInputs.length > 0) {
                $('#modalSubregimenes').modal('hide');
                $('#myModal').modal('show');
                AppDeclaracionesSAT.cargandoPaso(80);

                setTimeout(function () {
                    var subregimenes = [];
                    var xmlTemp;
                    if (AppDeclaracionesSAT.getConfig('forma') === 'tmp') {
                        xmlTemp = FormsBuilder.XMLForm.getCopyDeclaracion();
                    } else {
                        xmlTemp = FormsBuilder.XMLForm.getCopyPrecarga();
                    }
                    var subRegimenesNode = $('<SubRegimenes />', xmlTemp);
                    $.each(subregimenesInputs, function (key, subregimen) {
                        subregimenes.push($(subregimen).attr('idsubregimen'));

                        if (xmlTemp !== undefined) {
                            var CatalogoNode = $('<Catalogo />', xmlTemp);

                            var IdCatalogoNode = $('<IdCatalogo />', xmlTemp);
                            var DescripcionNode = $('<Descripcion />', xmlTemp);

                            IdCatalogoNode.text($(subregimen).attr('idsubregimen'));
                            DescripcionNode.text($(subregimen).attr('titulo'));

                            CatalogoNode.append(IdCatalogoNode);
                            CatalogoNode.append(DescripcionNode);

                            subRegimenesNode.append(CatalogoNode);
                        }
                    });
                    if (xmlTemp !== undefined) {
                        if (AppDeclaracionesSAT.getConfig('forma') === 'tmp') {
                            xmlTemp.find('modeloDatos').find('SubRegimenes').remove();
                            xmlTemp.find('modeloDatos').append(subRegimenesNode);
                        } else {
                            xmlTemp.find('DatosContribuyente').find('SubRegimenes').remove();
                            xmlTemp.find('DatosContribuyente').append(subRegimenesNode);
                        }
                    }

                    SAT.Environment.setSetting('isHydrate', false);
                    FormsBuilder.Runtime.runSubregimenesRules();
                    $('#sat-sections div, #sat-sections ul').show();

                    var xmlCopy = FormsBuilder.XMLForm.getCopy();
                    var navegacion = xmlCopy.find('diagramacion > navegacion > agrupador');
                    var viewmodel = FormsBuilder.ViewModel.get();
                    var viewmodelGrid = FormsBuilder.ViewModel.getDetalleGrid();

                    $.each(navegacion, function (key, agrupador) {
                        var idSubRegimen = $(agrupador).attr('idSubRegimen');
                        if (idSubRegimen !== undefined) {
                            if ($.inArray(idSubRegimen, subregimenes) < 0) {
                                var tituloAgrupador = $('#sat-sections div[id="t_{0}"]'.format($(agrupador).attr('id')));
                                tituloAgrupador.hide();
                                tituloAgrupador.parent().next().hide();

                                $(agrupador).find('seccion').each(function (key, seccion) {
                                    var idEntidad = xmlCopy.find('diagramacion formulario controles').children('control[id="{0}"]'.format($(seccion).attr('idControlFormulario'))).attr('idEntidadPropiedad');

                                    FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['NoVisible'] = true;
                                    var $panelEntity = $("#htmlOutput > [identidadpropiedad='{0}']".format(idEntidad));

                                    var isControlGrid = false;
                                    if (viewmodelGrid[idEntidad] !== undefined) {
                                        $.each(viewmodelGrid[idEntidad], function (index) {
                                            try {
                                                var $botonEliminar = $panelEntity.find(".btnDelFormularioGridRow[entidad='{0}']".format(idEntidad));
                                                if ($botonEliminar && $botonEliminar.length <= 0) {
                                                    isControlGrid = true;
                                                    $botonEliminar = $panelEntity.find(".btnDelCtrlGridRow:first");
                                                }

                                                if ($botonEliminar) {
                                                    $botonEliminar.click();
                                                }
                                            } catch (err) {
                                                console.log(err);
                                            }
                                        });
                                        if (isControlGrid) {
                                            $panelEntity.find(".btnAddCtrlGridRow:first").click();
                                        }
                                    } else {
                                        for (var propiedad in viewmodel[idEntidad]) {
                                            viewmodel[idEntidad][propiedad]('');
                                        }
                                    }

                                    var idNavSection = FormsBuilder.Parser.getSeccionesUI('{0}'.format(idEntidad));
                                    var $panelNavegacion = $(".sat-container-main .list-sections").find('a[idpanel="{0}"]'.format(idNavSection));
                                    $panelNavegacion.parents('ul.lt-sections').find('i').removeAttr("class").removeAttr("style");
                                    $panelNavegacion.parents('ul.lt-sections').find('a').removeAttr('style');
                                });
                            } else {
                                $(agrupador).find('seccion').each(function (key, seccion) {
                                    var idEntidad = xmlCopy.find('diagramacion formulario controles').children('control[id="{0}"]'.format($(seccion).attr('idControlFormulario'))).attr('idEntidadPropiedad');
                                    FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['NoVisible'] = false;
                                });
                            }
                        }
                    });

                    var areaGeografica = $('#areasgeograficas input:checked').attr("idareageografica");
                    var descAreaGeografica = $('#areasgeograficas input:checked').attr("descAreaGeografica");
                    var rl = FormsBuilder.ViewModel.getFieldsForExprs()['$51']; // TODO
                    if (rl !== undefined) {
                        FormsBuilder.ViewModel.get()[rl.entidad]['E{0}P{1}'.format(rl.entidad, rl.propiedad)](areaGeografica);
                    }
                    rl = FormsBuilder.ViewModel.getFieldsForExprs()['$52']; // TODO
                    if (rl !== undefined) {
                        FormsBuilder.ViewModel.get()[rl.entidad]['E{0}P{1}'.format(rl.entidad, rl.propiedad)](descAreaGeografica);
                    }

                    AppDeclaracionesSAT.precargaAnexoPersonaFisica(function () {
                        setTimeout(function () {
                            $('#sat-sections .lt-sections:visible:first').find('a:first').click()
                            setTimeout(function () {
                                $('#myModal').modal('hide');
                            }, 100);
                        }, 250);
                    });
                }, 100);
            } else {
                $('#modalValidacion').modal('show');
            }
        });

        $('#configuracionRegimenes').on('click', function () {
            setTimeout(function () {
                if (FormsBuilder.Utils.hasAllQueueRules() === true ||
                    SAT.Environment.settings('isHydrate') === true) {
                    console.log('Aun existe reglas en ejecución');
                    return;
                }
                $('#modalSubregimenes').modal('show');
            }, 500);
        });

        $('.informacion-declaracion label').html("Versión {0}".format(SAT.Environment.settings('appversion')));

        $('[ayudaEnDialogo]').focus(showHelpDialog);

        $('#htmlOutput').find('[view-model]').focus(function () {
            var that = this;
            FBUtils.setDecimalsElement();
            setTimeout(function () {
                if ($(that).hasClass('currency')) {
                    if (window.lastElement) {
                        if (window.lastElement.attr('view-model') !== $(document.activeElement).attr('view-model')) {
                            $(that).toNumber();
                        }
                    }
                }
            }, FBUtils.getMs());
        });

        $('.currency').blur(function () {
            window.lastElement = $(this);
        });

        resetCursorInputCurrency();

        if ($(window).height() > 710) {
            $('.sat-container-main .row-form').css("height", "{0}px".format($(window).height() - 285));
            $('.sat-container-main .panel-sections').css("height", "{0}px".format($(window).height() - 285));
        }
        $('.sat-container-main').width(parseInt($(window).width()) - 85);
        $(window).resize(function () {
            $('.sat-container-main').width(parseInt($(window).width()) - 85);
        });

        $('.row-form').scroll(function () {
            $('#htmlOutput').find('i').popover('hide');
            $('#htmlOutput').find('.popover').remove();
        });

        $('#htmlOutput span.help-label').on('click', function () {
            var that = $(this);
            $('.panel-info').fadeOut('fast', function () {
                var sibling = that.parent().next();
                var helpText = sibling.attr('help-text');
                if (helpText === undefined) {
                    helpText = that.parent().parent().next().attr('help-text');
                }
                $('#helptext').html(helpText);
            }).fadeIn('fast');
        });

        $('#htmlOutput input[help-text]').on('focus', function () {
            $('#helptext').html($(this).attr('help-text'));
        });

        $('#htmlOutput select[help-text]').on('focus', function () {
            $('#helptext').html($(this).attr('help-text'));
        });

        $("#htmlOutput a[help-text]").on("hover", function () {
            $("#helptext").html($(this).attr('help-text'));
        });

        $('#htmlOutput input[help-text]').blur(function () {
            $('#helptext').html('');
        });

        $('#htmlOutput select[help-text]').blur(function () {
            $('#helptext').html('');
        });

        $('#btnEnviarDeclaracion, #btnEnviarDeclaracionSinRevision').on('click', function () {
            var muestraRevision = $(this).data('muestra-revision');
            setTimeout(function () {
                if (FormsBuilder.Utils.hasAllQueueRules() === true ||
                    SAT.Environment.settings('isHydrate') === true) {
                    console.log('Aun existe reglas en ejecución');
                    return;
                }

                var pastIdPanel = $('#sat-sections a[class*="current"]').attr("idPanel");

                if (!($('#htmlOutput .panel[id="{0}"]'.format(pastIdPanel)).attr("saltado"))) {
                    $('#sat-sections a[class*="current"]').click();
                }

                setTimeout(function () {

                    var tipopersona = AppDeclaracionesSAT.getConfig('tipopersona');

                    var todasSecciones = validaTodasSecciones();

                    if (todasSecciones && tipopersona == 'M') {
                        $('#modalFaltanSeccionesPorEntrar').modal('show');
                        return;
                    }

                    var errorEnSecciones = errorSecciones();

                    if (errorEnSecciones === true) {
                        $('#modalErroresEnSecciones').modal('show');
                        return;
                    }

                    var xml = FormsBuilder.ViewModel.createXml();
                    var encodeXmlResult = Base64.encode(xml);
                    $('#DVDECLARACION').html(encodeXmlResult);

                    var operacion = {
                        operacion: "OPENVIADOSF",
                        parametros: {
                            monto: $('.sat-totalpay span').html().substring(1, $('.sat-totalpay span').html().length),
                            muestraRevision: muestraRevision
                        }
                    };
                    $('#DVOPER').html(JSON.stringify(operacion));
                }, 800);
            }, 800);
        });

        $('#cerrarSesion').on('click', function () {
            setTimeout(function () {
                if (FormsBuilder.Utils.hasAllQueueRules() === true ||
                    SAT.Environment.settings('isHydrate') === true) {
                    console.log('Aun existe reglas en ejecución');
                    return;
                }

                setTimeout(function () {
                    var operacion = {
                        operacion: "OPCERRARS",
                        parametros: {}
                    };
                    $('#DVOPER').html(JSON.stringify(operacion));
                }, 800);
            }, 800);
        });

        $('#home').on('click', function () {
            setTimeout(function () {
                if (FormsBuilder.Utils.hasAllQueueRules() === true ||
                    SAT.Environment.settings('isHydrate') === true) {
                    console.log('Aun existe reglas en ejecución');
                    return;
                } else {
                    guardarDeclaracion();
                }

                setTimeout(function () {
                    var operacion = {
                        operacion: "OPHOME",
                        parametros: {}
                    };
                    $('#DVOPER').html(JSON.stringify(operacion));
                }, 800);
            }, 800);
        });

        $.each($("input[mascara]"), function () {
            $(this).mask($(this).attr('mascara'));
        });

        $('.saltarseccion').on('click', function () {
            $('#modalYesNoSeccion').modal('show');
            $('#modalYesNoSeccion input[type="hidden"]').val($(this).parents().eq(1).attr("id"));
        });

        $('#modalYesNoSeccion .si').on('click', function () {
            var db_id = '';
            SAT.Environment.setSetting('applyrulesvalidation', false);

            var idSeccion = $('#modalYesNoSeccion input[type="hidden"]').val();

            var ancla = $('#sat-sections a[idPanel="{0}"]'.format(idSeccion));
            ancla.parent().find('i:first').removeClass();
            ancla.parent().find('i:first').addClass('icon-ban-circle');

            var seccion = $('#htmlOutput .panel[id="{0}"]'.format(idSeccion));

            var btnsEliminar = seccion.find('button.btnDelCtrlGridRow');
            var btnsBorrar = seccion.find('.cargaMasivaRetenciones.borrar');

            if (btnsEliminar.length > 0) {
                btnsEliminar.each(function (k, v) {
                    $(v).click();
                });
            }
            else if (btnsBorrar.length > 0) {
                if (btnsBorrar.attr('disabled') != "disabled") {
                    btnsBorrar.each(function (k, v) {
                        $('#idRetencion').val('{0}|{1}'.format($(v).attr('identificador'), $(v).attr('entidad')));
                        $('#modalBorrarCargaMasiva .si').click();
                    });
                }
            }
            else {
                var xmlCopy = FormsBuilder.XMLForm.getCopy();
                var inputs = seccion.find('input[type="text"]');
                var inputspago;
                $.each(inputs, function (k, input) {
                    db_id = $(input).attr("view-model");
                    inputspago = $(xmlCopy).find('Propiedad[id="{0}"]'.format(db_id.split('P')[0])).attr('claveInformativa');
                    switch (inputspago) {
                        case 'C5':
                        case 'C20':
                        case 'UC26':
                            break;
                        default:
                            FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]("");
                            break;
                    }
                });
            }

            var seccionDependiente = seccion.find('a.saltarseccion').attr('saltodependiente');
            if (seccionDependiente !== undefined) {
                OCULTARMENUSECCION(seccionDependiente)();
            }

            var combos = seccion.find('select');
            $.each(combos, function (k, combo) {
                db_id = $(combo).attr("view-model");
                FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]("");
            });

            seccion.attr("saltado", "true");
            seccion.hide();

            var icons = $('#htmlOutput .panel[identidadpropiedad="{0}"] i[vm]'.format(seccion.attr("identidadpropiedad")));

            var menuItem = $('#sat-sections a[idPanel="{0}"]'.format(FormsBuilder.Parser.getSeccionesUI(seccion.attr("identidadpropiedad"))));

            menuItem.parent().find('i').removeClass('icon-warning-sign');
            if (!menuItem.parent().find('i').hasClass('icon-ok-circle')) {
                var idEntidadPropiedad = $('#htmlOutput .panel[id="{0}"]'.format(FormsBuilder.Parser.getSeccionesUI(seccion.attr("identidadpropiedad")))).attr('identidadpropiedad');
                if (String(FormsBuilder.ViewModel.getFlujoSecciones()[idEntidadPropiedad]['EntroSeccion']) === "true") {
                    menuItem.parent().find('i').addClass('icon-ok-circle');
                }
            }
            menuItem.parent().find('i').css({ "color": "#4D4D4D" });
            menuItem.parent().find('a').css({ "color": "#4D4D4D" });

            FormsBuilder.ViewModel.getFlujoSecciones()[seccion.attr("identidadpropiedad")]['NoAplica'] = true;

            $('#modalYesNoSeccion').modal('hide');
        });

        $('.guardardeclaracion').on('click', function () {
            var that = this;
            if (FormsBuilder.Utils.hasAllQueueRules() === true) {
                console.log('Aun existe reglas en ejecución');
                setTimeout(function () {
                    $(that).popover('destroy');
                    $(that).popover({
                        trigger: 'manual',
                        content: "Existen reglas ejecutándose, inténtelo nuevamente.",
                        placement: "bottom",
                    }).popover('show');
                    setTimeout(function () {
                        $(that).popover('hide');
                    }, 1000 * 6);
                }, 1000);

                return;
            }
            guardarDeclaracion();
        });

        // Agrega funcionalidad a los elementos de la lista de secciones
        $('#sat-sections a').on("click", function () {
            $('#htmlOutput').find('.popover').remove();
            var isDejarSinEfecto = AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaDejarSinEfecto');

            var pastIdPanel = $(this).attr('idPanel');
            //Funcionalidad para el atributo de control "ayudaEnDialogo"
            $("#{0}".format(pastIdPanel)).find('[messageShowed]').removeAttr('messageShowed')

            var saltado = $('#htmlOutput .panel[id="{0}"]'.format(pastIdPanel)).attr("saltado");
            if (saltado === "true") {
                if (!isDejarSinEfecto) {
                    $('#modalSeccionSaltada input[type="hidden"]').val(pastIdPanel);
                    $("#modalSeccionSaltada").modal('show');
                }
            } else {
                cambiarSeccion(pastIdPanel);
            }
            $('#helptext').html('');
        });

        $("#modalSeccionSaltada").find('.si').on("click", function (e) {
            var idPanel = $('#modalSeccionSaltada input[type="hidden"]').val();

            $('#htmlOutput .panel[id="{0}"]'.format(idPanel)).attr("saltado", '');

            FormsBuilder.ViewModel.getFlujoSecciones()[$('#htmlOutput .panel[id="{0}"]'.format(idPanel)).attr("identidadpropiedad")]['NoAplica'] = false;

            var currentPanel = $('#sat-sections a[idPanel="{0}"]'.format(idPanel));
            currentPanel.parent().find('i:first').removeClass('icon-ban-circle');

            var seccionDependiente = $('#htmlOutput .panel[id="{0}"]'.format(idPanel)).find('a.saltarseccion').attr('saltodependiente');

            if (seccionDependiente !== undefined) {
                MOSTRARMENUSECCION(seccionDependiente)();
            }

            cambiarSeccion(idPanel);

            var xmlCopy = FormsBuilder.XMLForm.getCopy();
            var propiedades = $(xmlCopy).find('entidad[id="{0}"]'.format($('#htmlOutput .panel[id="{0}"]'.format(idPanel)).attr("identidadpropiedad")));
            $.each(propiedades.find('propiedad'), function (key, propiedad) {
                var reglas = $(xmlCopy).find('definicionReglas regla[idPropiedadAsociada="{0}"]'.format($(propiedad).attr('id')));
                $.each(reglas, function (key, regla) {
                    if ($(regla).attr('tipoRegla') === 'Calculo') {
                        FormsBuilder.ViewModel.Calculo($(regla));
                    }
                });
            });

            $("#modalSeccionSaltada").modal('hide');
        });

        $(".calculoinversion").on("click", function (e) {
            var fieldsToTransfer = $(this).attr("campos");
            FormsBuilder.Modules.loadedCuadroDeduccionInversion(function () {
                FormsBuilder.Modules.showCuadroDeduccionInversion(fieldsToTransfer);
            });
            if (!FormsBuilder.Modules.isVisibleCuadroDeduccionInversion()) {
                FormsBuilder.Modules.showCuadroDeduccionInversion(fieldsToTransfer);
            }
        });

        $('#modalAvisoPreCarga .si').on('click', function () {
            $('#modalSubregimenes').modal('show');
        });

        $("#modalSeccion .si").on('click', function () {
            $("#modalSeccion .modal-body").empty();
        });

        $('#modalSeccion').on('hidden.bs.modal', function (e) {
            $("#modalSeccion .modal-body").empty();
        })

        //-----ROO
        $('#fileDialog').on("change", function (e) {
            if (!IsNullOrEmpty($(this).val())) {
                var ruta = $(this).val();
                var fileExtencion = ruta.substring(ruta.lastIndexOf('.') + 1, ruta.length);
                if (fileExtencion == "txt") {
                    var rfc;
                    var ejercicio;

                    var infoProp = FormsBuilder.ViewModel.getFieldsForExprs()['$10'];
                    if (infoProp !== undefined) {
                        rfc = FormsBuilder.ViewModel.get()[infoProp.entidad]['E{0}P{1}'.format(infoProp.entidad, infoProp.propiedad)]();
                    }

                    infoProp = FormsBuilder.ViewModel.getFieldsForExprs()['$30'];
                    if (infoProp !== undefined) {
                        ejercicio = FormsBuilder.ViewModel.get()[infoProp.entidad]['E{0}P{1}'.format(infoProp.entidad, infoProp.propiedad)]();
                    }
                    var confRetencion = {
                        tipo: 0,
                        ruta: $(this).val(),
                        id: $('#idRetencion').val().split('|')[0],
                        entidad: $('#idRetencion').val().split('|')[1],
                        rfc: rfc,
                        ejercicio: ejercicio,
                        numoperacion: AppDeclaracionesSAT.getConfig('readonlynumerooperacion')
                    };

                    var operacion = {
                        operacion: "OPEMASIVA",
                        parametros: confRetencion
                    };
                    $('#DVOPER').html(JSON.stringify(operacion));

                    $('#DVINITRETENCIONES').html(JSON.stringify(confRetencion));

                    Service.Test.uploadCargaMasiva();

                    // Aqui finaliza el codigo que debe hacer el backend
                } else {
                    $('#erroresMasivas').html('Para poder realizar la carga masiva es necesario crear un archivo de texto (.txt) con la información requerida.');
                    $('#modalErroresMasivas').modal('show');
                }
                $(this).val('');
                $('#idRetencion').val('');
            }
        });

        $(".cargaMasivaRetenciones.carga").each(function (k, v) {
            var that = $(v);
            var ruta;

            if (typeof obtieneUrlAyudaMasivaIntegrantes !== 'undefined')
                ruta = obtieneUrlAyudaMasivaIntegrantes();

            that.before('<span class="ic-help CargaMasiva" style="margin-right:2% !important;" ruta="{0}"></span>'.format(ruta));

            var help = that.parent().find('span');

            help.popover({
                trigger: 'click',
                template: '<div class="popover pophelp" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                placement: "left",
                content: '<div><div style="clear: both"></div>Descargue las instrucciones para la generación del archivo de carga masiva <a href="{0}" target="_blank" class="ayudaMasiva" download>aqui.</a></div>'.format(ruta),
                html: "true"
            });

        });

        $(".cargaMasivaRetenciones.carga").on("click", function (e) {
            var that = this;
            if (SAT.Environment.settings('isModified')) {
                if (FormsBuilder.Utils.hasAllQueueRules() === true) {
                    console.log('Aun existe reglas en ejecución');
                    setTimeout(function () {
                        $(that).popover('destroy');
                        $(that).popover({
                            trigger: 'manual',
                            content: "Existen reglas ejecutándose, inténtelo nuevamente.",
                            placement: "bottom",
                        }).popover('show');
                        setTimeout(function () {
                            $(that).popover('hide');
                        }, 1000 * 6);
                    }, 1000);

                    return;
                }
                guardarDeclaracion();
                $('#idRetencion').val('{0}|{1}'.format($(this).attr('identificador'), $(this).attr('entidad')));
                var chooser = document.querySelector('#fileDialog');
                chooser.click();
            } else {
                $('#idRetencion').val('{0}|{1}'.format($(this).attr('identificador'), $(this).attr('entidad')));
                var chooser = document.querySelector('#fileDialog');

                chooser.click();
            }
        });
        $(".cargaMasivaRetenciones.borrar").on("click", function (e) {
            $('#idRetencion').val('{0}|{1}'.format($(this).attr('identificador'), $(this).attr('entidad')));
            $('#modalBorrarCargaMasiva').modal('show');
        });

        $('#modalBorrarCargaMasiva .si').on('click', function (e) {
            $('#modalBorrarCargaMasiva').modal('hide');
            var rfc;
            var ejercicio

            var infoProp = FormsBuilder.ViewModel.getFieldsForExprs()['$10'];
            if (infoProp !== undefined) {
                rfc = FormsBuilder.ViewModel.get()[infoProp.entidad]['E{0}P{1}'.format(infoProp.entidad, infoProp.propiedad)]();
            }

            infoProp = FormsBuilder.ViewModel.getFieldsForExprs()['$30'];
            if (infoProp !== undefined) {
                ejercicio = FormsBuilder.ViewModel.get()[infoProp.entidad]['E{0}P{1}'.format(infoProp.entidad, infoProp.propiedad)]();
            }

            var confRetencion = {
                tipo: 2,
                rfc: rfc,
                id: $('#idRetencion').val().split('|')[0],
                entidad: $('#idRetencion').val().split('|')[1],
                ejercicio: ejercicio,
                numoperacion: AppDeclaracionesSAT.getConfig('readonlynumerooperacion')
            };

            var operacion = {
                operacion: "OPEMASIVA",
                parametros: confRetencion
            };

            $('#DVOPER').html(JSON.stringify(operacion));

            $('#DVINITRETENCIONES').html(JSON.stringify(confRetencion));

            Service.Test.operacionCargaMasiva();
        });

        //END Roo

        callback();
    }

    function initUIStepFour() {
        if ($(window).height() > 710) {
            $('.sat-container-main .row-form').css("height", "{0}px".format($(window).height() - 285));
        }

        setOperationStepFour();
    }

    function setOperationStepFour() {
        $('#enviarDeclaracion').on('click', function () {
            if ($('.sat-totalpay span').html() !== '-') {
                $('#modalCantidadDeclaracion .modal-body label').html($('.sat-totalpay span').html());
            } else {
                $('#modalCantidadDeclaracion .modal-body label').html(Base64.decode($('#DVMONTO').html()));
            }
            $('#modalCantidadDeclaracion').modal('show');

            $('#htmlOutput').attr('style', 'width:0px;height:0px');
            $('#htmlOutput').hide();
        });

        $('#modalCantidadDeclaracion .si').on('click', function () {
            $('#modalCantidadDeclaracion').modal('hide');
            if (AppDeclaracionesSAT.getConfig('firmalinea')) {
                $('#modalYesNoFirmarDeclaracion').modal('show');
            } else {
                var parametros = { respuesta: 'NO' };

                var operacion = {
                    operacion: "OPENVIADOSF",
                    parametros: parametros
                };
                $('#DVOPER').html(JSON.stringify(operacion));
            }
        });

        $('#modalCantidadDeclaracion .no').on('click', function () {
            $('#htmlOutput').attr('style', 'width:100%;height:100%');
            $('#htmlOutput').show();
        });

        $('#modalYesNoFirmarDeclaracion .close').on('click', function () {
            $('#htmlOutput').attr('style', 'width:100%;height:100%');
            $('#htmlOutput').show();
        });

        $('#modalYesNoFirmarDeclaracion .si').on('click', function () {
            $('#modalYesNoFirmarDeclaracion').modal('hide');

            var parametros = { respuesta: 'SI' };

            $('#modalCantidadDeclaracion').find('input:radio').each(function () {
                if ($(this).is(':checked') === true) {
                    parametros['tipoforma'] = $(this).attr('valor');
                }
            });

            var operacion = {
                operacion: "OPENVIADOSF",
                parametros: parametros
            };
            $('#DVOPER').html(JSON.stringify(operacion));
        });

        $('#modalYesNoFirmarDeclaracion .no').on('click', function () {
            $('#modalYesNoFirmarDeclaracion').modal('hide');

            var parametros = { respuesta: 'NO' };

            $('#modalCantidadDeclaracion').find('input:radio').each(function () {
                if ($(this).is(':checked') === true) {
                    parametros['tipoforma'] = $(this).attr('valor');
                }
            });

            var operacion = {
                operacion: "OPENVIADOSF",
                parametros: parametros
            };
            $('#DVOPER').html(JSON.stringify(operacion));
            $('#modalEnvioDeclaracion').modal('show');
        });

        $('#cerrarSesion').on('click', function () {
            var operacion = {
                operacion: "OPCERRARS",
                parametros: {}
            };
            $('#DVOPER').html(JSON.stringify(operacion));
        });

        $('#editarDeclaracion').on('click', function () {
            var operacion = {
                operacion: "OPEDITARS",
                parametros: {}
            };
            $('#DVOPER').html(JSON.stringify(operacion));
        });

        $('#home').on('click', function () {
            var operacion = {
                operacion: "OPHOME",
                parametros: {}
            };
            $('#DVOPER').html(JSON.stringify(operacion));
        });

        $("label.form-control").formatCurrency({ region: 'es-MX' });
    }

    function initStateForm() {
        AppDeclaracionesSAT.setConfig("deshabilitarDialogos", true);
        SAT.Environment.setSetting('isHydrate', true);

        var xmlCopy = FormsBuilder.XMLForm.getCopy();
        var xmlCopyDeclaracion = FormsBuilder.XMLForm.getCopyDeclaracion();

        var panel, noAplica, entroSeccion, ocultarMenuSeccion;
        for (var seccion in FormsBuilder.ViewModel.getFlujoSecciones()) {
            noAplica = FormsBuilder.ViewModel.getFlujoSecciones()[seccion]['NoAplica'];
            entroSeccion = FormsBuilder.ViewModel.getFlujoSecciones()[seccion]['EntroSeccion'];
            ocultarMenuSeccion = FormsBuilder.ViewModel.getFlujoSecciones()[seccion]['OcultarMenuSeccion'];

            if (String(ocultarMenuSeccion) === "true") {
                console.log("Esta seccion esta oculta", seccion);
            }

            if (entroSeccion === "true") {
                panel = $('#htmlOutput .panel[identidadpropiedad="{0}"]'.format(seccion));
                var currentPanel = $('#sat-sections a[idpanel="{0}"]'.format(panel.attr('id')));
                currentPanel.parent().find('i:first').addClass('icon-ok-circle');

                if (String(noAplica) !== "true") {
                    var seccionObligatorios = $('#htmlOutput .panel[id="{0}"]'.format(panel.attr('id')));
                    var obligatorios = seccionObligatorios.find('.sat-obligatorio');

                    $.each(obligatorios, function (key, obligatorio) {
                        if (SAT.Environment.settings('applyrulesvalidation') === true) {
                            var db_id = $(obligatorio).attr('view-model');

                            var reglas = $(xmlCopy).find('definicionReglas regla[idPropiedadAsociada="{0}"]'.format(db_id.substring(db_id.indexOf('P') + 1, db_id.length)));
                            $.each(reglas, function (key, regla) {
                                if ($(regla).attr('tipoRegla') === 'Validacion') {
                                    var definicion = $(regla).attr('definicion');

                                    if (definicion.match(/ESNULO[(][$](\w+|[0-9^_]+)[)]/igm) !== null) {
                                        FormsBuilder.ViewModel.Validacion('', $(regla));
                                    }

                                    if (definicion.match(/\!=0,VERDADERO,FALSO/igm) !== null) {
                                        FormsBuilder.ViewModel.Validacion('', $(regla));
                                    }
                                }
                            });
                        }
                    });
                }
            }

            if (String(ocultarMenuSeccion) !== "true") {
                if (String(noAplica) === "true") {
                    var ancla = $('#sat-sections a[idPanel="{0}"]'.format(panel.attr("id")));
                    ancla.parent().find('i:first').addClass('icon-ban-circle');
                    panel.attr("saltado", "true");
                }
            }
        }

        var navegacion = xmlCopy.find('diagramacion > navegacion > agrupador');
        var catalogos = xmlCopyDeclaracion.find('SubRegimenes > Catalogo');
        var subregimenes = [];
        $.each(catalogos, function (kCatalogo, catalogo) {
            subregimenes.push($(catalogo).find('IdCatalogo').text());
        });

        $.each(navegacion, function (key, agrupador) {
            if ($(agrupador).attr('idSubRegimen') !== undefined) {
                if ($.inArray($(agrupador).attr('idSubRegimen'), subregimenes) < 0) {
                    var tituloAgrupador = $('#sat-sections div[id="t_{0}"]'.format($(agrupador).attr('id')));
                    tituloAgrupador.hide();
                    tituloAgrupador.parent().next().hide();

                    $(agrupador).find('seccion').each(function (key, seccion) {
                        var idEntidad = xmlCopy.find('diagramacion formulario controles').children('control[id="{0}"]'.format($(seccion).attr('idControlFormulario'))).attr('idEntidadPropiedad');
                        FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['NoVisible'] = true;
                    });
                } else {
                    $(agrupador).find('seccion').each(function (key, seccion) {
                        var idEntidad = xmlCopy.find('diagramacion formulario controles').children('control[id="{0}"]'.format($(seccion).attr('idControlFormulario'))).attr('idEntidadPropiedad');
                        FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['NoVisible'] = false;
                    });
                }
            }
        });

        var ctrlsGrid = $('.ctrlsGrid');
        $.each(ctrlsGrid, function (k, ctrlGrid) {

            var search = true;
            var objCtrl = $(ctrlGrid).parent();
            while (search) {
                if (objCtrl.attr('identidadpropiedad') !== undefined) {
                    search = false;
                } else {
                    objCtrl = objCtrl.parent();
                }
            }

            var idEntidad = objCtrl.attr('identidadpropiedad');
            var dataGrid = xmlCopyDeclaracion.find('entidad[id="{0}"]'.format(idEntidad));
            var dataGridFilas = dataGrid.find('fila');
            var numFilas = dataGridFilas.length;

            var buttonAddGrid = objCtrl.find('button.btnAddCtrlGridRow:first');
            while (numFilas > 0) {
                buttonAddGrid.click();
                numFilas--;
            }

            setTimeout(function () {
                var detalleDataGrid = FormsBuilder.ViewModel.getDetalleGrid()[idEntidad];
                var $entidadXml = xmlCopy.find("modeloDatos entidad[id='{0}']".format(idEntidad));
                $.each(dataGridFilas, function (key, fila) {
                    if (detalleDataGrid !== undefined) {
                        var filaDataBinding = detalleDataGrid[key];
                        if (filaDataBinding !== undefined) {
                            for (var filaData in filaDataBinding) {
                                var id = filaData.substring(filaData.indexOf('P') + 1, filaData.length);
                                var propiedad = $(fila).find('propiedad[id="{0}"]'.format(id.split('_')[0]));
                                if (id.split('_')[0] === propiedad.attr('id')) {
                                    var value = propiedad.text();
                                    var dataType = $entidadXml.find("propiedad[id='{0}']".format(propiedad.attr('id'))).attr("tipoDatos");
                                    value = FBUtils.convertValue(value, dataType);
                                    filaDataBinding[filaData](value);

                                    if ($('input[view-model="{0}"]'.format(filaData)).hasClass('currency')) {
                                        FBUtils.applyFormatCurrencyOnElement($('input[view-model="{0}"]'.format(filaData)), true);
                                    }
                                }
                            }
                        }
                    }
                });
            }, 100);
        });

        setTimeout(function () {
            var panelsChecks = $('input[paneldinamico]');
            $.each(panelsChecks, function (key, panelCheck) {
                var control = $(panelCheck).parents().eq(3).find('.panel-group[paneldinamico="{0}"]'.format($(panelCheck).attr('paneldinamico')));
                this.checked ? control.show() : control.hide();
            });
            if (SAT.Environment.settings('dejarsinefecto') === true) {
                $('#htmlOutput .sat-obligatorio').removeClass('sat-obligatorio');
            }
        }, 200);

        var formsGrid = $('[formulariogrid]');
        $.each(formsGrid, function (k, formGrid) {
            var idEntidad = $(formGrid).attr('formulariogrid');
            var $entidadXml = xmlCopy.find("modeloDatos entidad[id='{0}']".format(idEntidad));
            var divPadre = $(formGrid).parents().eq(1);

            var divPadreH;

            var xmlCopyDeclaracion = FormsBuilder.XMLForm.getCopyDeclaracion();
            var dataGrid = xmlCopyDeclaracion.find('entidad[id="{0}"]'.format(idEntidad));
            var dataGridFilas = dataGrid.find('fila');
            var numFilas = dataGridFilas.length;

            var buttonAddGrid = divPadre.find('button.btnAddFormularioGridRow:first');
            for (var i = 0; i < numFilas; i++) {

                $.when(buttonAddGrid.click()).done(function () {
                    var indice = dataGridFilas.eq(i).attr('indice');
                    if (dataGridFilas.eq(i).attr('error') == true) {
                        $("#htmlOutput table tr[tr-entidad=" + idEntidad + "][index=" + indice + "] td:last").html('<i class="icon-warning-sign sat-icon"></i>');
                    }
                });

                var detalleDataGrid = FormsBuilder.ViewModel.getDetalleGrid()[idEntidad];
                var filaDataBinding = detalleDataGrid[i];
                if (filaDataBinding !== undefined) {
                    for (var filaData in filaDataBinding) {
                        var id = filaData.substring(filaData.indexOf('P') + 1, filaData.length);
                        var propiedad = dataGridFilas.eq(i).find('propiedad[id="{0}"]'.format(id.split('_')[0]));
                        if (id.split('_')[0] === propiedad.attr('id')) {
                            var value = propiedad.text();
                            var dataType = $entidadXml.find("propiedad[id='{0}']".format(propiedad.attr('id'))).attr("tipoDatos");
                            value = FBUtils.convertValue(value, dataType);
                            filaDataBinding[filaData](value);

                        }
                    }
                }

                var indicePadre = dataGridFilas.eq(i).attr('indice');

                var idEntidadHijo = $(formGrid).attr('entidadHijo');
                var $entidadChildXml = xmlCopy.find("modeloDatos entidad[id='{0}']".format(idEntidadHijo));
                if (idEntidadHijo !== undefined) {
                    var relacion = $(xmlCopyDeclaracion).find('relacionesGrid relacion[entidadHijo="{0}"]'.format(idEntidadHijo));
                    if (relacion.length > 0) {
                        var relaciones = FormsBuilder.Modules.getRelacionesGrid()[idEntidad][idEntidadHijo];
                        var padreHijo = relacion.find('hijo[padre="{0}"]'.format(indicePadre));

                        var dataGridHijo = xmlCopyDeclaracion.find('entidad[id="{0}"]'.format(idEntidadHijo));

                        var divPadreHijo = $('#htmlOutput').find('.panel-body [entidadPadre="{0}"]'.format(idEntidad));
                        divPadreH = divPadreHijo;

                        var buttonAddGridHijo = divPadreHijo.parents().eq(1).find('button.btnAddFormularioGridRow:first');

                        if (!IsNullOrEmpty(padreHijo.attr('hijos'))) {
                            var hijos = padreHijo.attr('hijos').split(',');
                            if (hijos.length > 0) {
                                var hijosLen = hijos.length;
                                for (var j = 0; j < hijosLen; j++) {
                                    buttonAddGridHijo.click();
                                    var dataGridFilaHijo = dataGridHijo.find('fila[indice="{0}"]'.format(hijos[j]));

                                    var detalleDataGridHijo = FormsBuilder.ViewModel.getDetalleGrid()[idEntidadHijo];

                                    var filaDataBindingHijo = detalleDataGridHijo[detalleDataGridHijo.length - 1];
                                    if (filaDataBindingHijo !== undefined) {
                                        for (var filaData in filaDataBindingHijo) {
                                            var id = filaData.substring(filaData.indexOf('P') + 1, filaData.length);
                                            var propiedad = dataGridFilaHijo.find('propiedad[id="{0}"]'.format(id.split('_')[0]));
                                            if (id.split('_')[0] === propiedad.attr('id')) {
                                                var valueChild = propiedad.text();
                                                var dataTypeChild = $entidadChildXml.find("propiedad[id='{0}']".format(propiedad.attr('id'))).attr("tipoDatos");
                                                valueChild = FBUtils.convertValue(valueChild, dataTypeChild);
                                                filaDataBindingHijo[filaData](valueChild);

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        var viewModelDetalle = FormsBuilder.ViewModel.getDetalle();

        var detalleDlg = $('.sat-detalle');
        $.each(detalleDlg, function (index, detalle) {
            var db_id = $(detalle).attr('view-model');
            var controlDlg = FormsBuilder.XMLForm.getCopy().find('control[idEntidadPropiedad="{0}"][idPropiedad="{1}"]'.format((db_id.split('P')[0]).replace('E', ''), db_id.substring(db_id.indexOf('P') + 1, db_id.length)));
            var idEntidadPropiedad = controlDlg.find('control').attr('idEntidadPropiedad');
            if (viewModelDetalle[idEntidadPropiedad] !== undefined) {
                SAT.Environment.setSetting('showdialogs', false);
                $(detalle).parent().find('a').click();
                SAT.Environment.setSetting('showdialogs', true);

                var dlg = $('[sat-dlg-dbid="{0}"] div:first'.format(db_id));
                $.each(viewModelDetalle[idEntidadPropiedad], function (index, dtl) {
                    dlg.find('#nuevaFila').click();
                    var fila = dlg.find('tr:last');
                    $.each(dtl, function (index, dtlItem) {
                        fila.find('[view-model="{0}"]'.format("E{0}P{1}".format(idEntidadPropiedad, dtlItem.propiedad))).val(dtlItem.valor);
                    });
                });
                FormsBuilder.ViewModel.getDetalleFK()[db_id] = idEntidadPropiedad;
            }
        });

        var detalleCompensacionesDlg = $('.sat-comp');
        $.each(detalleCompensacionesDlg, function (index, detalleCompensacion) {
            var db_id = $(detalleCompensacion).attr('view-model');
            var controlDlg = FormsBuilder.XMLForm.getCopy().find('control[idEntidadPropiedad="{0}"][idPropiedad="{1}"]'.format((db_id.split('P')[0]).replace('E', ''), FBUtils.getPropiedad(db_id)));
            var idEntidadPropiedad = controlDlg.find('control').attr('idEntidadPropiedad');
            if (viewModelDetalle[idEntidadPropiedad] !== undefined) {
                SAT.Environment.setSetting('showdialogs', false);
                $(detalleCompensacion).parent().find('a').click();
                SAT.Environment.setSetting('showdialogs', true);

                var dlg = $('[sat-dlg-compensaciones-dbid="{0}"] div:first'.format(db_id));
                $.each(viewModelDetalle[idEntidadPropiedad], function (index, dtl) {
                    dlg.find('#addItem').click();
                    var fila = dlg.find('.sat-row-compensaciones:last');

                    $.each(dtl, function (index, dtlItem) {
                        var control = $(fila).find(':input[claveInformativa="{0}"]'.format(dtlItem.claveinformativa));

                        switch (control.attr("id")) {
                            case "txtSaldoAplicar":
                                {
                                    $(fila).find('#btnValidar').prop("disabled", false);
                                    $(fila).find('#btnValidar').click();
                                    control.val(dtlItem.valor);
                                    break;
                                }
                            case "txtFechaCausacion":
                                {
                                    if (!IsNullOrEmpty(dtlItem.valor)) {
                                        var fecha = FECHA(dtlItem.valor);
                                        if (fecha) {
                                            dtlItem.valor = fecha.toString("dd/MM/yyyy");
                                            control.parent('.date').datepicker("setDate", dtlItem.valor);
                                            control.val(dtlItem.valor);
                                        }
                                    }
                                    break;
                                }
                            case "txtFechaDeclaracion":
                                {
                                    if (!IsNullOrEmpty(dtlItem.valor)) {
                                        var fecha = FECHA(dtlItem.valor);
                                        if (fecha) {
                                            dtlItem.valor = fecha.toString("dd/MM/yyyy");
                                            control.parent('.date').datepicker("setDate", dtlItem.valor);
                                            control.val(dtlItem.valor);
                                        }
                                    }
                                    break;
                                }
                            default:
                                {
                                    control.val(dtlItem.valor);
                                    break;
                                }
                        }

                        if (control.get(0) && control.get(0).tagName == 'SELECT')
                            control.change();
                        if ($.inArray(control.attr("id"), ["txtNumeroOperacion", "txtFechaCausacion"]) >= 0) {
                            control.blur();
                        }
                    });
                });
                var numeroCompensaciones = dlg.find('.sat-row-compensaciones').find('#txtSaldoAplicar');
                var MontoCompensaciones = 0;
                $.each(numeroCompensaciones, function (index, numCompen) {
                    MontoCompensaciones += parseInt($(this).val());
                });
                dlg.find('#lblMonto').html(MontoCompensaciones);
                FormsBuilder.ViewModel.getDetalleFK()[db_id] = idEntidadPropiedad;
            }
        });

        var propiedad = $(".calculoAmortizacion:first")[0];
        var elementWithData = FormsBuilder.XMLForm.getCopyDeclaracion().find('calculos calculoamortizacion');
        var base64String;
        var camposTransferencia;
        if (elementWithData && propiedad) {
            camposTransferencia = $(propiedad).attr("campos");
            base64String = elementWithData.text();
        }
        if (!IsNullOrEmpty(base64String)) {
            FormsBuilder.Calculo.Amortizacion.fillViewModel(base64String, camposTransferencia);
        }

        var jsonBase64CalculoDeduccionInversion = FormsBuilder.XMLForm.getCopyDeclaracion().find('calculos calculodeduccioninversion').text();
        if (!IsNullOrEmpty(jsonBase64CalculoDeduccionInversion)) {
            FormsBuilder.Modules.fillViewModelCuadroDeduccionInversion(jsonBase64CalculoDeduccionInversion);
        }

        setTimeout(function () {
            if (SAT.Environment.settings('dejarsinefecto') === true) {
                var detalleGrid = FormsBuilder.ViewModel.getDetalleGrid();
                var enumerable = function (element, index, array) {
                    for (var key in element) {
                        if (element[key]() !== '') {
                            var entidad = FormsBuilder.Utils.getEntidad(key);
                            var propiedad = FormsBuilder.Utils.getPropiedad(key);

                            var infoPropiedad = xmlCopy.find('modeloDatos > entidades > entidad[id="{0}"]'.format(entidad)).find('propiedad[id="{0}"]'.format(propiedad));
                            switch (infoPropiedad.attr('tipoDatos')) {
                                case 'Alfanumerico':
                                    var controlVisual = xmlCopy.find('diagramacion > formulario > controles').find('control[idPropiedad="{0}"]'.format(propiedad));
                                    if (controlVisual.attr('tipoControl') !== 'CuadroVerificacion') {
                                        element[key]('');
                                    }
                                    break;

                                case 'Numerico':
                                    element[key](0);
                                    break;

                                case 'Fecha':
                                    element[key]('');
                                    break;
                            }
                        }
                    }
                };

                for (var key in detalleGrid) {
                    detalleGrid[key].forEach(enumerable);
                }
            }

            $("#helptext").html('');
            AppDeclaracionesSAT.setConfig("deshabilitarDialogos", false);
        }, 500);
    }

    function cambiarSeccion(pastIdPanel) {
        $('#htmlOutput').find('i').popover('hide');
        var currentPanel = $('#sat-sections a[class*="current"]');
        var xmlCopy = FormsBuilder.XMLForm.getCopy();
        var idPanel = $(currentPanel).attr("idPanel");
        if (idPanel !== undefined && SAT.Environment.settings('dejarsinefecto') === false) {
            var seccionObligatorios = $('#htmlOutput .panel[id="{0}"]'.format(idPanel));
            var obligatorios = seccionObligatorios.find('.sat-obligatorio');

            $.each(obligatorios, function (key, obligatorio) {
                if (SAT.Environment.settings('applyrulesvalidation') === true) {
                    var db_id = $(obligatorio).attr('view-model');

                    var reglas;

                    if (db_id.indexOf('_') > 0) {
                        var tmpdb_id = db_id.substring(0, db_id.indexOf('_'));
                        reglas = xmlCopy.find('definicionReglas regla[idPropiedadAsociada="{0}"]'.format(tmpdb_id.substring(tmpdb_id.indexOf('P') + 1, tmpdb_id.length)));
                        $.each(reglas, function (key, regla) {
                            if ($(regla).attr('tipoRegla') === 'Validacion') {
                                var definicion = $(regla).attr('definicion');

                                if (definicion.match(/ESNULOGRID[(][$](\w+|[0-9^_]+)[)]/igm) !== null) {
                                    FormsBuilder.ViewModel.ValidacionGrid(db_id, $(regla));
                                }

                                if (definicion.match(/\!=0,VERDADERO,FALSO/igm) !== null) {
                                    FormsBuilder.ViewModel.ValidacionGrid(db_id, $(regla));
                                }

                                if (definicion.match(/\==0,FALSO,VERDADERO/igm) !== null) {
                                    FormsBuilder.ViewModel.ValidacionGrid(db_id, $(regla));
                                }

                                if (definicion.match(/\==0\),FALSO,VERDADERO/igm) !== null) {
                                    FormsBuilder.ViewModel.ValidacionGrid(db_id, $(regla));
                                }
                            }
                        });
                    } else {
                        reglas = xmlCopy.find('definicionReglas regla[idPropiedadAsociada="{0}"]'.format(db_id.substring(db_id.indexOf('P') + 1, db_id.length)));
                        $.each(reglas, function (key, regla) {
                            if ($(regla).attr('tipoRegla') === 'Validacion') {
                                var definicion = $(regla).attr('definicion');

                                if (definicion.match(/ESNULO[(][$](\w+|[0-9^_]+)[)]/igm) !== null) {
                                    FormsBuilder.ViewModel.Validacion('', $(regla));
                                }

                                if (definicion.match(/\!=0,VERDADERO,FALSO/igm) !== null) {
                                    FormsBuilder.ViewModel.Validacion('', $(regla));
                                }

                                if (definicion.match(/\==0,FALSO,VERDADERO/igm) !== null) {
                                    FormsBuilder.ViewModel.Validacion('', $(regla));
                                }

                                if (definicion.match(/\==0\),FALSO,VERDADERO/igm) !== null) {
                                    FormsBuilder.ViewModel.Validacion('', $(regla));
                                }
                            }
                        });
                    }
                }
            });

            var seccion = $('#htmlOutput .panel[id="{0}"][reglasSeccion]'.format(idPanel));
            var idEntidad = $(seccion).attr("identidadpropiedad");
            var infoSeccion = FormsBuilder.ViewModel.getFlujoSecciones()['{0}'.format(idEntidad)];
            var isVisible = true;
            if (infoSeccion) {
                isVisible = infoSeccion['NoVisible'] == undefined || infoSeccion['NoVisible'] === false;
            }
            if (seccion.length > 0 && isVisible) {
                var regla = xmlCopy.find('definicionReglas').find('regla[id={0}]'.format($(seccion[0]).attr("reglasSeccion")));
                if (regla.length > 0) {
                    var mensajeError = FormsBuilder.ViewModel.procesarMensajeError($(regla).attr('mensajeError'));
                    var resultado = FormsBuilder.ViewModel.Validacion('', regla);
                    if (resultado === undefined) {
                        mensajeError = FormsBuilder.ViewModel.procesarMensajeErrorGrid($(regla).attr('mensajeError'));
                        resultado = FormsBuilder.ViewModel.ValidacionGrid('', regla);
                    }

                    if (resultado === false) {
                        $("#modalSeccion .modal-body").html(mensajeError);
                        var fieldCurrency = $("#modalSeccion .modal-body").find('.currency');
                        if (fieldCurrency.length > 0) {
                            FBUtils.applyFormatCurrencyOnElement(fieldCurrency, true);
                        }
                        $("#modalSeccion").modal('show');
                    }
                }
            }
        }

        if (!currentPanel.parent().find('i:first').hasClass('icon-ban-circle')) {
            currentPanel.parent().find('i:first').removeClass();

            if (currentPanel.parent().find('i:first').css('color') === 'rgb(207, 57, 40)') {
                currentPanel.parent().find('i:first').addClass('icon-warning-sign');
            } else {
                currentPanel.parent().find('i:first').addClass('icon-ok-circle');
            }
        }
        currentPanel.removeClass('current');

        var selectionPanel = $('#sat-sections a[idPanel="{0}"]'.format(pastIdPanel));
        selectionPanel.addClass('current');
        selectionPanel.parent().find('i:first').removeClass();
        selectionPanel.parent().find('i:first').addClass('icon-signout');

        $('#htmlOutput .panel[class*="current"]').hide().removeClass('current');
        $('#htmlOutput .panel[id="{0}"]'.format(pastIdPanel)).addClass('current').fadeIn('slow');
        var idEntidadPropiedad = $('#htmlOutput .panel[id="{0}"]'.format(pastIdPanel)).attr('identidadpropiedad');
        
        if(FormsBuilder.ViewModel.getFlujoSecciones()[idEntidadPropiedad]){
            FormsBuilder.ViewModel.getFlujoSecciones()[idEntidadPropiedad]['EntroSeccion'] = true;
        }
        
        if (SAT.Environment.settings('isModified') === true) {
            if (FormsBuilder.Utils.hasAllQueueRules() === true) {
                console.log('Aun existe reglas en ejecución');
            }
            else {
                guardarDeclaracion();
            }
        }

        currentPanel = $('#sat-sections a[class*="current"]');
        idPanel = $(currentPanel).attr("idPanel");
        if (idPanel !== undefined && SAT.Environment.settings('dejarsinefecto') === false) {
            var seccion = $('#htmlOutput .panel[id="{0}"][reglasSeccionAlEntrar]'.format(idPanel));
            var idEntidad = $('#htmlOutput .panel[id="{0}"]'.format(idPanel)).attr("identidadpropiedad");
            if (FormsBuilder.XMLForm.getCopy().find('diagramacion > formulario > controles').children('[idEntidadPropiedad="{0}"]'.format(idEntidad)).children('atributos').find('atributo[nombre="CargaMasivaRetenciones"]').length > 0) {
                $('.panel-info').hide();
            } else {
                $('.panel-info').show();
            }
            var isVisible = true;
            if (infoSeccion) {
                isVisible = infoSeccion['NoVisible'] == undefined || infoSeccion['NoVisible'] === false;
            }
            if (seccion.length > 0 && isVisible) {
                var regla = xmlCopy.find('definicionReglas').find('regla[id={0}]'.format($(seccion[0]).attr("reglasSeccionAlEntrar")));
                if (regla.length > 0) {
                    var mensajeError = FormsBuilder.ViewModel.procesarMensajeError($(regla).attr('mensajeError'));
                    var resultado = FormsBuilder.ViewModel.Validacion('', regla);
                    if (resultado === undefined) {
                        mensajeError = FormsBuilder.ViewModel.procesarMensajeErrorGrid($(regla).attr('mensajeError'));
                        resultado = FormsBuilder.ViewModel.ValidacionGrid('', regla);
                    }

                    if (resultado === false) {
                        $("#modalSeccion .modal-body").html(mensajeError);
                        var fieldCurrency = $("#modalSeccion .modal-body").find('.currency');
                        if (fieldCurrency.length > 0) {
                            FBUtils.applyFormatCurrencyOnElement(fieldCurrency, true);
                        }
                        $("#modalSeccion").modal('show');
                    }
                }
            }
        }

        if (SAT.Environment.settings('dejarsinefecto') === false) {
            SAT.Environment.setSetting('applyrulesvalidation', true);
        }

        SAT.Environment.setSetting('isHydrate', false);

        if (SAT.Environment.settings('isRowClicked') === false) {
            FormsBuilder.Modules.formularioGridOnClickLastRow("table.tabla-formulariogrid tr.danger");
            SAT.Environment.setSetting('isRowClicked', true);
        }

        var balanceoCols = $('#htmlOutput .panel[id="{0}"]'.format(idPanel)).find('div.balanceoColumnas');
        if (balanceoCols.length > 0) {
            if (balanceoCols.first().attr('balanceo') === undefined) {
                console.log('Entro', idPanel);
                balanceoColumnas(balanceoCols[0]);
                balanceoCols.first().attr('balanceo', true);
            }
        }

        setTimeout(function () {
            $('#btnEnviarDeclaracion').attr('disabled', false);
        }, 250);
    }

    function guardarDeclaracion() {
        var xml = FormsBuilder.ViewModel.createXml();
        var encodeXmlResult = Base64.encode(xml);

        FormsBuilder.Modules.actualizarEstado();

        $('#DVDECLARACION').html(encodeXmlResult);

        var operacion = {
            operacion: "OPGUARDATEMP",
            parametros: {}
        };
        $('#DVOPER').html(JSON.stringify(operacion));

        SAT.Environment.setSetting('isModified', false);
    }

    function showHelpDialog(event) {
        event = event || window.event;
        var $target = $(event.target);
        if (!IsNullOrEmpty($target.val())) {
            preventDefaultEvent(event);
            return;
        }
        var isShowing = $target.attr('messageShowed');
        var focusOnInput = function () {
            $('#divDynamicModals > *:first').off('hide.bs.modal');
            $target.focus();
        };

        if (!isShowing) {
            var putOnNode = $("#divDynamicModals");
            var helpText = $(this).attr("ayudaEnDialogo");
            var newModal = $("#modalSeccion").clone();
            $(".modal-body", newModal).html(helpText);
            $target.attr('messageShowed', true);
            $("*:first", putOnNode).remove();
            putOnNode.html(newModal);
            newModal = $("*:first", putOnNode);
            $(newModal).on('hide.bs.modal', focusOnInput);
            $(newModal).modal('show');
        }
    };

    function resetCursorInputCurrency(elementOnApply) {
        var old_val = '';
        var reset = function (e) {

            var val = this.value, len = val.length;

            this.setSelectionRange(len, len);

            if (e.type === 'keyup' || e.type === 'keydown') {
                var short, long;
                if (old_val.length < val.length) {
                    short = old_val;
                    long = val;
                }
                else {
                    short = val;
                    long = old_val;
                }

                if (long.indexOf(short) !== 0) {
                    val = old_val;
                    this.value = val;
                    this.setSelectionRange(old_val.length, old_val.length);

                    e.preventDefault();
                    // Just exit from the function now
                    return false;
                }
            }

            old_val = val;
        };

        if (elementOnApply) {
            $(elementOnApply).find(".currency").each(function (i, e) {
                e.addEventListener('focus', reset, false);
            });
        } else {

            $('.currency').each(function (i, e) {
                e.addEventListener('focus', reset, false);
            });
        }
    }

    function balanceoColumnas(contenedor) {
        // console.log('----- Agrupador -----');
        var columnas = $(contenedor).find('.bd');

        // columnas.each(function(k, c) {
        //     console.log($(c).find('[view-model]:visible').length);
        // });

        // console.log('----- Ordenamiento -----');
        columnas.sort(function (a, b) {
            var a1 = parseInt($(a).find('[view-model]:visible').length);
            var b1 = parseInt($(b).find('[view-model]:visible').length);

            if (a1 === b1) return 0;
            return a1 > b1 ? 1 : -1;
        });

        // columnas.each(function(k, c) {
        //     console.log($(c).find('[view-model]:visible').length);
        // });

        var columnMin = columnas.first();
        var valueMin = columnMin.find('[view-model]:visible').length;
        var columnMax = columnas.last();
        var valueMax = columnMax.find('[view-model]:visible').length;

        var total = valueMin + valueMax;
        var med = Math.round(total / 2) - valueMin;
        // console.log('Media: | Total: | Rest:', med, total, total-med);

        for (var i = 0; i < med; i++) {
            var title = columnMax.find('[view-model]:visible:last').prev();
            var control = columnMax.find('[view-model]:visible:last');
            columnMin.prepend(control);
            columnMin.prepend(title);
        }

        // console.log('----------- End ----------');
    }

    function validaTodasSecciones() {
        var flujoSecciones = FormsBuilder.ViewModel.getFlujoSecciones();
        var todasSecciones = false;
        var entidadesNoVisibles = [];

        $('.lt-sections .list-group-item').each(function (k, v) {
            if ($(v).is(':visible') === false) {
                var idEntidadPropiedad = $('#htmlOutput').children('.panel[id={0}]'.format($(v).find('a').attr('idpanel'))).attr('identidadpropiedad');
                entidadesNoVisibles.push(idEntidadPropiedad);
            }
        });

        for (var llave in flujoSecciones) {
            if (typeof (flujoSecciones[llave]['EntroSeccion']) != "undefined") {
                if (flujoSecciones[llave]['EntroSeccion'].toString() === "false" &&
                $.inArray(llave, entidadesNoVisibles) <= -1) {
                    todasSecciones = true;
                    break;
                }
            }
        }

        return todasSecciones
    }

    function errorSecciones() {
        var errorEnSecciones = false;

        $('#sat-sections .lt-sections:visible:').find('i').each(function (k, v) {
            if ($(v).css('color') === 'rgb(207, 57, 40)') {
                errorEnSecciones = true;
                return;
            }
        });

        return errorEnSecciones;
    }
})();
