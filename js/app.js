"use strict";

(function() {
    namespace("AppDeclaracionesSAT", initStepOne, initStepTwo, initStepTwoSub, initStepThree, initStepFour, initProxyDivs, initProxyDivsStepfour, loadCombobox, loadComboboxPeriodo, cargarXmlDisco, precargaInformacion, generarEncabezado, initProxyDivsSign, loadConfiguracionSubregimenes, habilitarCamposC26, precargaAnexoPersonaFisica, cargandoPaso);

    var catalogos = {};
    var numCatalogos = 0;
    var tipoPersona = '';


    var TipoDeclaracion = {
        Normal: '001'
    };

    function initProxyDivs() {
        $('.sat-div-contenedores').bind("DOMSubtreeModified", function() {
            switch ($(this).attr("id")) {
                case "DVPLANFOR":
                    cargandoPaso(20);
                    SAT.Environment.setSetting('loadXMLTemplate', true);
                    if (!SAT.Environment.settings('loadXMLTemplate')) {
                        if ($(this).html() !== "") {
                            var xmlDoc = fbXmlForm.reconstructXml();
                            $(this).remove();
                            loadStepThree(xmlDoc);
                        }
                    }
                    break;

                case "DVCA01":
                    if ($(this).html() !== "") {
                        var xmlDoc = $.parseXML(Base64.decode($(this).html()));
                        $(this).remove();
                        loadCombobox(xmlDoc, 'ejercicio');
                    }
                    break;

                case "DVCA04":
                    if ($(this).html() !== "") {
                        var xmlDoc = $.parseXML(Base64.decode($(this).html()));
                        $(this).remove();
                        loadCombobox(xmlDoc, 'tipodeclaracion');
                    }
                    break;

                case "DVCA05":
                    if ($(this).html() !== "") {
                        var xmlDoc = $.parseXML(Base64.decode($(this).html()));
                        $(this).remove();
                        loadCombobox(xmlDoc, 'tipocomplementaria');
                    }
                    break;

                case "DVCA03":
                    if ($(this).html() !== "") {
                        var xmlDoc = $.parseXML(Base64.decode($(this).html()));
                        $(this).remove();
                        loadComboboxPeriodo(xmlDoc);
                    }
                    break;

                case "DVCA06":
                    if ($(this).html() !== "") {
                        var xmlDoc = $.parseXML(Base64.decode($(this).html()));
                        $(this).remove();
                        loadCombobox(xmlDoc, 'regimenes');
                    }
                    break;
                case "DVCA07":
                    if ($(this).html() !== "") {
                        var xmlDoc = $.parseXML(Base64.decode($(this).html()));
                        loadCombobox(xmlDoc, 'subregimenes', function() {
                            if (tipoPersona === 'F')
                                loadConfiguracionSubregimenes(false, function() {
                                    var operacion = {
                                        operacion: "OPCARGASUBREGIMENES",
                                        parametros: {}
                                    };
                                    $('#DVOPER').html(JSON.stringify(operacion));
                                });
                        });
                    }
                    break;
                case "DVCA08":
                    if ($(this).html() !== "") {
                        var xmlDoc = $.parseXML(Base64.decode($(this).html()));
                        loadCombobox(xmlDoc, 'areasgeograficas', function() {
                            if (tipoPersona === 'F')
                                loadConfiguracionAreaGeografica(function() {
                                    var operacion = {
                                        operacion: "OPCARGAAREASGEOGRAFICAS",
                                        parametros: {}
                                    };
                                    $('#DVOPER').html(JSON.stringify(operacion));
                                });
                        });
                    }
                    break;
                case "DVOFRMGRD":
                    var formularios = JSON.parse($(this).html());
                    $('.sat-list-forms ul li').remove();

                    $.each(formularios, function(k, v) {
                        var forma = $($('.tplformas').html());
                        forma.find('span').html(v.nombre);
                        forma.attr('idForma', v.idForma);

                        if ($('.sat-list-forms ul').hasClass("item-removing")) {
                            forma.find('span').append("<a class='close' idForma='{0}' forma='{1}' href='javascript:void(0);'><i class='icon-trash'></i></a>".format(v.idForma, v.nombre));
                            //forma.find('span').append("<a class='export' idForma='{0}' forma='{1}' href='javascript:void(0);'><i class='icon-arrow-up'></i></a>".format(v.idForma, v.nombre));
                        }

                        var element = $("<li>").append(forma);
                        element.addClass("list-group-item");

                        $('.sat-list-forms ul').append(element);
                    });

                    $('.sat-list-forms ul li a').on('dblclick', function() {
                        var operacion = {
                            operacion: "OPCARGATEMP",
                            parametros: { idForma: $(this).attr("idForma") }
                        };
                        $('#DVOPER').html(JSON.stringify(operacion));
                    });

                    $('.sat-list-forms ul li a span a.close').tooltip({ title: 'Eliminar', trigger: 'hover focus' });
                    $('.sat-list-forms ul li a span a.close').on('click', function() {
                        $("#modal-confirm-delete").modal("show");
                        $("#modal-confirm-delete #mensaje-confirmacion strong").html("{0}");
                        var mensaje = $("#modal-confirm-delete #mensaje-confirmacion").html();

                        $("#modal-confirm-delete #confimar-eleminacion").attr("idForma", $(this).attr("idForma"));
                        $("#modal-confirm-delete #mensaje-confirmacion").html(mensaje.format($(this).attr("forma")));
                    });

                    // $('.sat-list-forms ul li a span a.export').tooltip({title: 'Exportar', trigger: 'hover focus'});
                    // $('.sat-list-forms ul li a span a.export').on('click', function () {
                    //     $("#modal-confirm-export").modal("show");
                    //     $("#modal-confirm-export #mensaje-confirmacion strong").html("{0}");
                    //     var mensaje = $("#modal-confirm-export #mensaje-confirmacion").html();

                    //     $("#modal-confirm-export #confimar-exportacion").attr("idForma", $(this).attr("idForma"));
                    //     $("#modal-confirm-export #mensaje-confirmacion").html(mensaje.format($(this).attr("forma")));
                    // });

                    $('#myModal').modal('hide');
                    break;

                case "DVDECLARACIONDISCO":
                    var declaracion = $.parseXML(Base64.decode($(this).html()));

                    if (declaracion === null) break;

                    if (SAT.Environment.settings('esquemaanterior') === true) {
                        $('#myModal').modal('hide');
                        break;
                    }
                    AppDeclaracionesSAT.initGrids();
                    cargarXmlDisco(declaracion, function(camposC26) {
                        if (SAT.Environment.settings('dejarsinefecto') === true) {
                            FormsBuilder.Runtime.initFormulario();
                            $('#htmlOutput').find('[view-model]').attr("disabled", true);
                            $('.btncollapse').attr("disabled", true);
                            $('.calculoinversion').attr("disabled", true);
                            $('.calculoAmortizacion').attr("disabled", true);
                            $('.panel').find('button.btnAddCtrlGridRow, button.btnDelCtrlGridRow').attr("disabled", true);
                            $('button.btnAddFormularioGridRow, button.btnDelFormularioGridRow, button.btnCancelFormularioGridEdicionRow, button.btnSaveFormularioGridEdicionRow, button.cargaMasivaRetenciones').attr("disabled", true);

                            var declaracion = FormsBuilder.XMLForm.getCopyDeclaracion();
                            var menusOcultos = declaracion.find('entidad[ocultarmenuseccion="true"]');
                            $.each(menusOcultos, function(key, menuOculto) {
                                var panel = $('#htmlOutput .panel[identidadpropiedad="{0}"]'.format($(menuOculto).attr('id')));
                                var ancla = $('#sat-sections a[idpanel="{0}"]'.format(panel.attr('id')));
                                var seccionPadre = ancla.attr('idSeccion');
                                ancla.parent().hide();

                                var secciones = $('.panel-sections').find('a[idSeccion="{0}"]'.format(seccionPadre)).map(function(cv, i) { if ($(i).parent().is(':visible')) { return i; } });
                                if (secciones.length == 0) {
                                    $('div[id="{0}"]'.format(seccionPadre)).hide();
                                }
                            });
                        }

                        if (SAT.Environment.settings('verificarfechapagoanterioridad') === true) {
                            habilitarCamposC26(camposC26);
                        }

                        var operacion = {
                            operacion: "OPCARGADECLARACION",
                            parametros: {}
                        };
                        $('#DVOPER').html(JSON.stringify(operacion));
                    });
                    break;

                case "DVDAPREFOR":
                    var precarga = $.parseXML(Base64.decode($(this).html()));
                    precargaInformacion(precarga, AppDeclaracionesSAT.initGrids);
                    break;

                case "DVDAPREFORCOMP":
                    var precarga = $.parseXML(Base64.decode($(this).html()));
                    AppDeclaracionesSAT.setConfig('complementaria', 'true');
                    precargaInformacionComplementaria(precarga);
                    break;

                case "DVACUSE":
                    var urlAcuse = Base64.decode($(this).html());
                    $('#acuse').attr('src', urlAcuse);
                    break;

                case "DVINFOCON":
                    var info = {
                        rfc: 'ADC010403J89',
                        nombre: ' X',
                        tipodeclaracion: '001',
                        tipocomplementaria: '001',
                        tipodeclaraciontexto: 'texto declaracion',
                        tipocomplementariatexto: 'texto complementaria',
                        periodicidad: 'anual',
                        periodo: 'anual',
                        tipopersona: 'M',
                        origen: 'origen-data',
                        ejercicio: '2018',
                        subregimensugerido: '',
                        forma: 'new',
                        tipodisco: ''
                    };
                    var infoContribuyente = JSON.parse(JSON.stringify(info));
                    for (var prop in infoContribuyente) {
                        AppDeclaracionesSAT.setConfig(prop, infoContribuyente[prop]);
                    }

                    $('#nombreContribuyente').html(infoContribuyente.nombre);
                    $('#rfc').html(infoContribuyente.rfc);
                    tipoPersona = infoContribuyente.tipopersona;

                    SAT.Environment.setSetting('tipopersona', tipoPersona);
                    SAT.Environment.setSetting('forma', infoContribuyente.forma);

                    if (AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaDejarSinEfecto')) {
                        console.log('Dejar sin efecto');

                        SAT.Environment.setSetting('dejarsinefecto', true);
                    }

                    if (AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaEsquemaAnterior') &&
                        AppDeclaracionesSAT.getConfig('tipodeclaracion') === AppDeclaracionesSAT.getConst('TipoDeclaracionComplementaria')) {
                        console.log('Esquema anterior');

                        SAT.Environment.setSetting('esquemaanterior', true);
                    }

                    if (AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaDejarSinEfecto') ||
                        AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaModificacionObligaciones')) {

                        SAT.Environment.setSetting('verificarfechapagoanterioridad', true);
                    }

                    var encabezado = generarEncabezado(infoContribuyente);

                    $('.informacion-declaracion b').text(encabezado);

                    var operacion = {
                        operacion: "OPINFOCONCAR",
                        parametros: {}
                    };
                    $('#DVOPER').html(JSON.stringify(operacion));
                    break;

                case "DVRFCCOMBO":
                    if ($(this).html() !== "") {
                        var formularios = JSON.parse($(this).html());

                        var elementAdding = '';

                        $.each(formularios, function(k, v) {
                            elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("id"), $(v).attr("descripcion"));
                        });

                        $('#rfcCombo').html(elementAdding).change();
                    }
                    break;

                case "DVINFOALERTCLIENT":
                    if (IsNullOrEmpty($(this).html())) return;

                    var alertObject = JSON.parse($(this).html());

                    $("#modalAlertClient div.modal-body").html(alertObject.mensaje);
                    $("#modalAlertClient div.modal-footer button").click(function() {
                        var operacion = {
                            operacion: "OPERALERTERROR",
                            parametros: { origen: alertObject.origen }
                        };
                        $('#DVOPER').html(JSON.stringify(operacion));
                        $("#modalAlertClient").modal('hide');
                    });

                    $("#modalAlertClient").modal('show');
                    break;

                case "DVCONFSOBREESC":
                    if (IsNullOrEmpty($(this).html()) || $(this).html() == '-') return;

                    $("#modal-confirm-delete").modal("show");
                    $("#modal-confirm-delete #confimar-eleminacion").attr("respuesta", "SI");
                    $(this).html('-')
                    break;

                case "DVMAC":
                    if ($(this).html() !== "") {
                        var plataforma = JSON.parse($(this).html());
                        $(this).remove();

                        $('#contenedortipoforma').show();
                        SAT.Environment.setSetting('isMacOSX', true);
                    }
                    break;

                case "DVINITRETENCIONES":
                    if (!IsNullOrEmpty($(this).html())) {
                        var plataforma = JSON.parse($(this).html());
                        if (plataforma.tipo === 1) {
                            Service.Test.recuperaPaginaMasiva();
                        }
                    }
                    break;

                case "DVRETENCIONES":
                    if ($(this).html() !== "" && $(this).html() !== "-") {
                        var retenciones = JSON.parse($(this).html());
                        if (retenciones.tipo === 0) {

                            FormsBuilder.Modules.initMassive(
                                retenciones.paginas,
                                retenciones.numElementos,
                                retenciones.entidad,
                                retenciones.updates);


                        }
                        if (retenciones.tipo === 1) {
                            FormsBuilder.Modules.loadRetenciones(retenciones.elementos, retenciones.entidad);
                        }
                        if (retenciones.tipo === 2) {
                            FormsBuilder.Modules.deleteRetenciones(retenciones.updates, retenciones.entidad);
                        }
                        $(this).html("-");
                    }
                    break;

            }
        });
    }

    function initProxyDivsSign() {
        $('.sat-div-sign').bind("DOMSubtreeModified", function() {
            switch ($(this).attr("id")) {
                case 'DVRFC':
                    var rfc = $(this).html();
                    $("#sign-modal #inputRFC").val(rfc);
                    break;
                case 'DVKEY':
                    var key = $(this).html();
                    $("#sign-modal #inputLlavePrivada").val(key);
                    break;
                case 'DVCER':
                    var cer = $(this).html();
                    $("#sign-modal #inputCert").val(cer);
                    break;
                case "DVINFOALERTCLIENT":
                    if (IsNullOrEmpty($(this).html())) return;

                    var alertObject = JSON.parse($(this).html());

                    $("#modalAlertClient div.modal-body").html(alertObject.mensaje);
                    $("#modalAlertClient div.modal-footer button").click(function() {
                        var operacion = {
                            operacion: "OPERALERTERROR",
                            parametros: { origen: alertObject.origen }
                        };
                        $('#DVOPER').html(JSON.stringify(operacion));
                        $("#modalAlertClient").modal('hide');
                    });

                    $("#modalAlertClient").modal('show');
                    break;
            }
        });

    }

    function generarEncabezado(infoContribuyente) {
        if (infoContribuyente) {
            var encabezado = "Tipo de Declaración: {0} / ".format(infoContribuyente.tipodeclaraciontexto || "N/A");
            if (infoContribuyente.tipocomplementariatexto) {
                encabezado = encabezado.concat("Tipo Complementaria: {0} / ".format(infoContribuyente.tipocomplementariatexto));
            }
            encabezado = encabezado.concat("Ejercicio: {0} / ".format(infoContribuyente.ejercicio || "N/A"));
            encabezado = encabezado.concat("Periodo: {0}".format(infoContribuyente.periodotexto || "N/A"));
            return encabezado;
        } else {
            return "Tipo de Declaración: N/A / Ejercicio: N/A / Periodicidad: N/A";
        }
    }

    function initProxyDivsStepfour() {
        $('.sat-div-contenedores').bind("DOMSubtreeModified", function() {
            switch ($(this).attr("id")) {
                case "DVINFOCON":
                    var infoContribuyente = JSON.parse($(this).html());
                    for (var prop in infoContribuyente) {
                        AppDeclaracionesSAT.setConfig(prop, infoContribuyente[prop]);
                    }

                    $('#nombreContribuyente').html(infoContribuyente.nombre);
                    $('#rfc').html(infoContribuyente.rfc);
                    tipoPersona = infoContribuyente.tipopersona;

                    var encabezado = generarEncabezado(infoContribuyente);

                    $('.informacion-declaracion b').text(encabezado);

                    var operacion = {
                        operacion: "OPINFOCONCAR",
                        parametros: {}
                    };
                    $('#DVOPER').html(JSON.stringify(operacion));
                    break;

                case "DVINFOALERTCLIENT":
                    if (IsNullOrEmpty($(this).html())) return;

                    var alertObject = JSON.parse($(this).html());

                    $("#modalAlertClient div.modal-body").html(alertObject.mensaje);
                    $("#modalAlertClient div.modal-footer button").click(function() {
                        var operacion = {
                            operacion: "OPERALERTERROR",
                            parametros: { origen: alertObject.origen }
                        };
                        $('#DVOPER').html(JSON.stringify(operacion));
                        $("#modalAlertClient").modal('hide');
                    });

                    $("#modalAlertClient").modal('show');
                    break;

                case "DVPDFDECLARACION":
                    var titleAndDeclaracion = JSON.parse(Base64.decode($(this).html()));

                    var iframePDF = '<iframe src="{0}" frameborder="0" height="460" width="100%"></iframe>'.format(titleAndDeclaracion.url);

                    $("#htmlOutput").html(iframePDF);

                    $("div.title-declaracion").html(titleAndDeclaracion.titulo);

                    AppDeclaracionesSAT.setOperationStepFour();
                    break;
            }
        });
    }

    function initStepOne() {
        $('#myModal').modal('show');
    }

    function initStepTwo() {
        $('#myModal').modal('show');
        $('.tipocomplementaria').hide();
    }

    function initStepTwoSub() {
        $('#myModal').modal('show');
    }

    function initStepThree() {
        $('#myModal').modal('show');

        Helper.Test.readXml("formulario", function(data) {
            loadStepThree(data);
        });
    }

    function initStepFour() {
        $('#myModal').modal('show');

        // Helper.Test.readPlantilla(function(data) {
        //     loadStepFour(data);
        // });
    }

    function loadStepThree(data) {
        var reading = function() {
            console.log(">>> reading");

            // Helper.Test.readPrecarga(function (precargaXml) {
            //    Helper.Test.readSubregimenes(function (subregimenes) {
            //        loadCombobox(subregimenes, 'subregimenes', function () {
            //            // loadConfiguracionSubregimenes(false);
            //        });

            //        Helper.Test.readAreaGeografica(function (areasgeograficas) {
            //            loadCombobox(areasgeograficas, 'areasgeograficas', function () {
            //                // loadConfiguracionAreaGeografica();
            //                precargaInformacion(precargaXml, AppDeclaracionesSAT.initGrids);
            //                // precargaInformacionComplementaria(precargaXml, AppDeclaracionesSAT.initGrids);
            //                // AppDeclaracionesSAT.initGrids();
            //            });
            //        });
            //    });
            // });

            // Helper.Test.readDeclaracion(function(dataDeclaracion) {
            //    AppDeclaracionesSAT.initGrids();
            //    cargarXmlDisco(dataDeclaracion, function(camposC26) {

            //        Helper.Test.readSubregimenes(function(subregimenes) {
            //            loadCombobox(subregimenes, 'subregimenes', function() {
            //                loadConfiguracionSubregimenes(false);
            //            });

            //            Helper.Test.readAreaGeografica(function(areasgeograficas) {
            //                loadCombobox(areasgeograficas, 'areasgeograficas', function() {
            //                    loadConfiguracionAreaGeografica();
            //                });
            //            });
            //        });

            //        if (SAT.Environment.settings('dejarsinefecto') === true) {
            //            FormsBuilder.Runtime.initFormulario();

            //            $('#htmlOutput').find('[view-model]').attr("disabled", true);
            //            $('.btncollapse').attr("disabled", true);
            //            $('.panel').find('button.btnAddCtrlGridRow, button.btnDelCtrlGridRow').attr("disabled", true);
            //            $('button.btnAddFormularioGridRow, button.btnDelFormularioGridRow').attr("disabled", true);
            //        }

            //        if (SAT.Environment.settings('verificarfechapagoanterioridad') === true) {
            //            var isTemporal = false;// Establecer para emular dejarsinefecto/modificacionobligaciones nuevas o temporales
            //            habilitarCamposC26(camposC26, isTemporal);
            //        }

            //    });
            // });

            if (SAT.Environment.settings('dejarsinefecto') === false) {
                $('#htmlOutput').find('input[ForzarModoEdicion], select[ForzarModoEdicion]').attr("disabled", false);
            }

            if (SAT.Environment.settings('esquemaanterior') === true) {
                $('#myModal').modal('hide');
            }

            var operacion = {
                operacion: "OPCARGOPLT",
                parametros: {}
            };
            $('#DVOPER').html(JSON.stringify(operacion));

            //ROO:
            if (AppDeclaracionesSAT.getConfig('readonly') === true) {
                console.log('Quitar elementos de navegación.');
                setTimeout(function() {
                    $('.guardardeclaracion, .btnEditFormularioGridEdicionRow, .btnDeleteFormularioGridEdicionRow, .btnDelCtrlGridRow, .btnAddCtrlGridRow, .calculoAmortizacion, .calculoinversion, .btnSaveFormularioGridEdicionRow, .btnCancelFormularioGridEdicionRow, .cargaMasivaRetenciones, .btnAddFormularioGridRow, .btnDelFormularioGridRow, .sat-button-dialog, #btnEnviarDeclara, #btnRevisionDeclara, #btnRegresaPerfil').addClass('hide');
                    $('input, select').attr('disabled', 'disabled');
                }, 4000);
            }

            $('#myModal').modal('hide');
            console.log("all loaded!");
        };

        var initializingRuntime = function() {
            setTimeout(function() {
                console.log(">>> initializingRuntime");

                FormsBuilder.Runtime.init(data, reading);
            }, 250);
        };

        var initializingUI = function() {
            console.log(">>> initializingUI");

            setTimeout(function() {
                cargandoPaso(70);
                AppDeclaracionesSAT.initUIStepThree(initializingRuntime);
            }, 250);
        };

        var binding = function() {
            setTimeout(function() {
                console.log(">>> binding");

                cargandoPaso(50);
                FormsBuilder.ViewModel.applyDataBindings(initializingUI);
            }, 250);
        };

        var rendering = function(domString) {
            console.log(">>> rendering");

            $('#htmlOutput').html(domString);

            if (SAT.Environment.settings('dejarsinefecto') === true) {
                SAT.Environment.setSetting('applyrulesvalidation', false);
                $('#htmlOutput').find('[view-model]').attr("disabled", true);
            }

            setTimeout(function() {
                cargandoPaso(30);
                FormsBuilder.ViewModel.init(data, binding);
            }, 250);
        };

        setTimeout(function() {
            FormsBuilder.Parser.parse(data, rendering);
        }, 250);
    }

    function loadStepFour(data) {
        var operacion = {
            operacion: "OPCARGOPLT",
            parametros: {}
        };
        $('#DVOPER').html(JSON.stringify(operacion));

        if (AppDeclaracionesSAT.getConfig('readonly') === true) {
            console.log('Quitar elementos de navegación.');
            setTimeout(function() {
                $('.guardardeclaracion, .btnEditFormularioGridEdicionRow, .btnDeleteFormularioGridEdicionRow, .btnDelCtrlGridRow, .btnAddCtrlGridRow, .calculoAmortizacion, .calculoinversion, .btnSaveFormularioGridEdicionRow, .btnCancelFormularioGridEdicionRow, .cargaMasivaRetenciones, .btnAddFormularioGridRow, .btnDelFormularioGridRow, .sat-button-dialog, #btnEnviarDeclara, #btnRevisionDeclara, #btnRegresaPerfil').addClass('hide');
                $('input, select').attr('disabled', 'disabled');
            }, 4000);
        }

        console.log("all loaded!");
    }

    function esEntidadGeneral(tipo) {
        return $.inArray(tipo, ['SAT_DATOS_ACUSE', 'SAT_DATOS_CONTRIBUYENTE', 'SAT_DATOS_GENERALES']) >= 0 ? true : false;
    }

    function cargarXmlDisco(data, callback) {
        var xmlCopy = FormsBuilder.XMLForm.getCopy();
        FormsBuilder.XMLForm.copyDeclaracion(data);
        var entidades = $(data).find('entidad');
        var viewModelDetalle = FormsBuilder.ViewModel.getDetalle();
        var idEntidad;
        var tipo;
        var propiedades;
        var camposC26 = {};

        var keyEntidades = [];

        var controles = $(xmlCopy).find('formulario > controles').children('control');
        $.each(controles, function(key, control) {
            keyEntidades.push($(control).attr('idEntidadPropiedad'));
        });

        $.each(entidades, function(k, v) {
            try {
                idEntidad = $(v).attr("id");
                if (FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad] !== undefined) {
                    FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['NoAplica'] = $(v).attr("noaplica");
                    FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['EntroSeccion'] = $(v).attr("entroseccion");
                    FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['Visibilidad'] = $(v).attr("visibilidad");
                    FormsBuilder.ViewModel.getFlujoSecciones()[idEntidad]['OcultarMenuSeccion'] = $(v).attr("ocultarmenuseccion");
                }

                var $entidadXml = xmlCopy.find("modeloDatos entidad[id='{0}']".format(idEntidad));

                if ($(v).find('fila').length > 0 && $(v).attr('grid') === undefined) {
                    //Setting Detalles
                    tipo = $(v).attr("tipo");
                    var esTipoCompensacionOrOtrosEstimulos = $.inArray(tipo, ["SAT_OTROS_ESTIMULOS", "SAT_COMPENSACIONES", "SAT_ANEXOS"]) >= 0;
                    if (SAT.Environment.settings('dejarsinefecto') === true && esTipoCompensacionOrOtrosEstimulos) {
                        return;
                    }
                    var filas = $(v).find('fila');
                    viewModelDetalle[idEntidad] = [];
                    $.each(filas, function(k, fila) {
                        var objItem = [];
                        propiedades = $(fila).find('propiedad');
                        $.each(propiedades, function(k, propiedad) {
                            var idPropiedad = $(propiedad).attr('id');
                            var value = $(propiedad).text();
                            var dataType = $entidadXml.find("propiedad[id='{0}']".format(idPropiedad)).attr("tipoDatos");
                            value = FBUtils.convertValue(value, dataType);
                            objItem.push({
                                claveinformativa: $(propiedad).attr('claveinformativa'),
                                propiedad: idPropiedad,
                                valor: value,
                                etiqueta: $(propiedad).attr('etiqueta')
                            });
                        });
                        viewModelDetalle[idEntidad].push(objItem);
                    });
                } else if ($(v).attr('grid') === undefined) {
                    tipo = $(v).attr('tipo');
                    propiedades = $(v).find('propiedad');
                    $.each(propiedades, function(k, val) {
                        var propiedad = $(val).attr("id");
                        var viewModelId = 'E{0}P{1}'.format(idEntidad, propiedad);
                        var isDejarSinEfecto = SAT.Environment.settings('dejarsinefecto');

                        var infoField = FormsBuilder.ViewModel.getFieldsForExprs()["$24007"];
                        var dbidAPagar = "E{0}P{1}".format(infoField.entidad, infoField.propiedad);

                        var isTotalAPagarId = viewModelId === dbidAPagar;
                        var value = $(val).text();

                        var dataType = $entidadXml.find("propiedad[id='{0}']".format(propiedad)).attr("tipoDatos");
                        var valueConverted = FBUtils.convertValue(value, dataType);
                        var claveInformativa = $(val).attr('claveinformativa');
                        if (isDejarSinEfecto && !esEntidadGeneral(tipo) && dataType !== "Booleano" && propiedad != 'AUX209270') {
                            //Cleaning Values
                            var indexMatch = $.inArray($(v).attr('id'), keyEntidades);
                            if (indexMatch !== -1) {
                                if (value !== '') {
                                    if (dataType !== "Numerico") {
                                        FormsBuilder.ViewModel.get()[idEntidad][viewModelId]('');
                                    } else {
                                        FormsBuilder.ViewModel.get()[idEntidad][viewModelId](0);
                                    }

                                    if (propiedad == 219136) {
                                        FormsBuilder.ViewModel.get()[idEntidad][viewModelId](2);
                                    }
                                }

                                if (claveInformativa === "C26" || claveInformativa === "UC26" || claveInformativa == "C20" || claveInformativa == "C5") {
                                    if (!camposC26[claveInformativa]) {
                                        camposC26[claveInformativa] = {};
                                    }
                                    camposC26[claveInformativa][$(val).attr("id")] = valueConverted;

                                }

                            } else {
                                FormsBuilder.ViewModel.get()[idEntidad][viewModelId](valueConverted);
                            }
                        } else {
                            //Setting Values
                            if (isTotalAPagarId && isDejarSinEfecto && propiedad != 'AUX209270') {
                                FormsBuilder.ViewModel.get()[idEntidad][viewModelId](0);
                            } else {
                                if (isDejarSinEfecto && dataType === "Booleano" && !IsNullOrEmpty(valueConverted)) {
                                    FormsBuilder.ViewModel.get()[idEntidad][viewModelId](false);
                                } else {
                                    FormsBuilder.ViewModel.get()[idEntidad][viewModelId](valueConverted);
                                }
                            }

                            if (isDejarSinEfecto) {
                                if (propiedad == 219136) {
                                    FormsBuilder.ViewModel.get()[idEntidad][viewModelId](2);
                                }
                            }

                            if (claveInformativa === "C26" || claveInformativa === "UC26" || claveInformativa == "C20" || claveInformativa == "C5") {
                                if (!camposC26[claveInformativa]) {
                                    camposC26[claveInformativa] = {};
                                }
                                camposC26[claveInformativa][$(val).attr("id")] = valueConverted;

                            }

                            if (esEntidadGeneral(tipo)) {
                                symToVal("${0}".format(propiedad));
                            }
                        }
                        var $input = $('input[view-model="{0}"]'.format(viewModelId));

                        FBUtils.applyFormatCurrencyOnElement($input);

                    });
                }

                if ($(v).attr('pages') !== undefined && $(v).attr('numElements') !== undefined) {
                    if (SAT.Environment.settings('dejarsinefecto') === false) {
                        FormsBuilder.Modules.initMassive($(v).attr('pages'), $(v).attr('numElements'), idEntidad, {});
                    } else {
                        $(v).removeAttr(pages).removeAttr(numElements);
                    }
                }

            } catch (err) {
                //console.log(err);
            }
        });

        AppDeclaracionesSAT.initStateForm();

        FormsBuilder.Runtime.runInitRules();

        if (SAT.Environment.settings('dejarsinefecto') === false) {
            $('#htmlOutput').find('input[ForzarModoEdicion], select[ForzarModoEdicion]').attr("disabled", false);
        }
        var operacion = {
            operacion: "OPCARGODECLARACION",
            parametros: {}
        };
        $('#DVOPER').html(JSON.stringify(operacion));


        if (AppDeclaracionesSAT.getConfig('forma') === 'tmp') {
            console.log('Entro', AppDeclaracionesSAT.getConfig('tipodisco'));
            var tiempo = (browser != 'chrome' && AppDeclaracionesSAT.getConfig('tipodisco') === 'vigente' ? 20 : 8) * 1000;

            if (AppDeclaracionesSAT.getConfig('tipodisco') === 'temporal') {
                //tiempo = 5 * 1000;
            }
            setTimeout(function() {
                $('#myModal').modal('hide');
                // if (AppDeclaracionesSAT.getConfig('tipodisco') === 'temporal') {
                //     $('#sat-sections .lt-sections:visible:first').find('a:first').click();
                // }
                if ($('#sat-sections a[class*="current"]').length == 0) {
                    $('#sat-sections .lt-sections:visible:first').find('a:first').click();
                }
            }, tiempo);
        }

        // Helper.Test.readPrecarga(function(data) {
        //     precargaInformacion(data, AppDeclaracionesSAT.initGrids);
        // });

        if (callback !== undefined) callback(camposC26);
    }

    var browser = function() {
        if ($.browser.msie) return "ie";
        if (!!navigator.userAgent.match(/Trident\/7\./)) return "ie";
        if (!!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/))) return "ie";
        var ua = navigator.userAgent.toLowerCase();
        if ($.browser.mozilla) return "firefox";
        if (/chrome/.test(ua)) return "chrome";
        return 'unknown';
    }();

    function habilitarCamposC26(campos, isTemporal) {
        var xmlCopy = FormsBuilder.XMLForm.getCopy();
        var UC26 = "UC26";
        var C26 = "C26";
        var C20 = "C20";
        var C5 = "C5";
        var isModificacionObligaciones = AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaModificacionObligaciones');
        var isDejarSinEfecto = AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaDejarSinEfecto');

        var getViewModelId = function(idEntidad, claveInformativa, xmlCopy) {
            var viewModelId = '';
            var $propiedadNode = xmlCopy.find("entidad[id='{0}'] propiedades propiedad[claveInformativa='{1}']".format(idEntidad, claveInformativa)).eq(0);
            if ($propiedadNode) {
                var idPropiedad = $propiedadNode.attr("id");
                viewModelId = "E{0}P{1}".format(idEntidad, idPropiedad);
            }
            return viewModelId;
        };

        if (isDejarSinEfecto) {
            $(".sat-totalpay span").text("$0");
        }

        if (isTemporal) {
            var propiedadesUc26 = xmlCopy.find("propiedades propiedad[claveInformativa='{0}']".format(UC26));
            $.each(propiedadesUc26, function(k, v) {
                var attributoActivarConSaldoFavor = $(v).parent().find("propiedad[claveInformativa='{0}'] atributos atributo[nombre='ActivarConSaldoAFavor']".format(C26)).attr("valor");
                var idPropiedad = $(v).attr("id");
                var valueUc26 = campos[UC26][idPropiedad];
                var dbIdUc26;
                var dbIdC20;
                var dbIdC5;

                if (IsNullOrEmpty(valueUc26)) valueUc26 = 0;
                if (!ESNUMERO(valueUc26)) valueUc26 = 0;

                var infoProp = FormsBuilder.ViewModel.getFieldsForExprs()['${0}'.format(idPropiedad)];

                if (infoProp) {
                    dbIdC20 = getViewModelId(infoProp.entidad, C20, xmlCopy);
                    dbIdC5 = getViewModelId(infoProp.entidad, C5, xmlCopy);

                    var valueC20 = campos[C20][FBUtils.getPropiedad(dbIdC20)];
                    var valueC5 = campos[C5][FBUtils.getPropiedad(dbIdC5)];
                    FormsBuilder.ViewModel.get()[FBUtils.getEntidad(dbIdC20)][dbIdC20](valueC20);
                    FormsBuilder.ViewModel.get()[FBUtils.getEntidad(dbIdC5)][dbIdC5](valueC5);
                    FormsBuilder.ViewModel.applyRulesDejarSinEfecto(dbIdC20);
                    FormsBuilder.ViewModel.applyRulesDejarSinEfecto(dbIdC5);

                    if (valueUc26 > 0) {
                        if (isDejarSinEfecto) {
                            dbIdUc26 = getViewModelId(infoProp.entidad, UC26, xmlCopy);
                            FormsBuilder.ViewModel.get()[FBUtils.getEntidad(dbIdUc26)][dbIdUc26](valueUc26);
                        }

                        $("#htmlOutput input[view-model={0}]".format(attributoActivarConSaldoFavor)).removeAttr("disabled");
                        var valueDate = FECHA(valueC5);
                        var isInvalidDate = valueDate === FBUtils.getDateMin();
                        if (!isInvalidDate) {
                            $("#htmlOutput input[view-model={0}]".format(dbIdC20)).removeAttr("disabled");
                            FBUtils.applyFormatCurrencyOnElement($("#htmlOutput input[view-model={0}]".format(dbIdC20)), true);
                        }
                    }
                }

            });
        } else {
            //Nueva Forma
            var propiedadesC26 = xmlCopy.find("propiedades propiedad[claveInformativa='{0}']".format(C26));
            $.each(propiedadesC26, function(k, v) {

                var attributoActivarConSaldoFavor = $(v).find("atributos atributo[nombre='ActivarConSaldoAFavor']").attr("valor");
                var idPropiedad = $(v).attr("id");
                var valueC26 = campos[C26][idPropiedad];
                var dbIdUc26;
                var dbIdC20;
                var dbIdC5;

                var infoProp = FormsBuilder.ViewModel.getFieldsForExprs()['${0}'.format(idPropiedad)];
                var valueC20 = '';
                var valueC5 = '';

                if (infoProp) {
                    dbIdUc26 = getViewModelId(infoProp.entidad, UC26, xmlCopy);
                    dbIdC5 = getViewModelId(infoProp.entidad, C5, xmlCopy);
                    dbIdC20 = getViewModelId(infoProp.entidad, C20, xmlCopy);
                    FormsBuilder.ViewModel.get()[FBUtils.getEntidad(dbIdUc26)][dbIdUc26](0);

                    if (isModificacionObligaciones || isDejarSinEfecto) {
                        valueC20 = campos[C20][FBUtils.getPropiedad(dbIdC20)];
                        valueC5 = campos[C5][FBUtils.getPropiedad(dbIdC5)];
                        FormsBuilder.ViewModel.get()[FBUtils.getEntidad(dbIdC20)][dbIdC20](valueC20);
                        FormsBuilder.ViewModel.get()[FBUtils.getEntidad(dbIdC5)][dbIdC5](valueC5);
                        FormsBuilder.ViewModel.applyRulesDejarSinEfecto(dbIdC5);
                        FormsBuilder.ViewModel.applyRulesDejarSinEfecto(dbIdC20);
                    }

                    if (IsNullOrEmpty(valueC26)) valueC26 = 0;
                    if (!ESNUMERO(valueC26)) valueC26 = 0;

                    if (valueC26 > 0) {
                        FormsBuilder.ViewModel.get()[FBUtils.getEntidad(dbIdUc26)][dbIdUc26](valueC26);
                        $("#htmlOutput input[view-model={0}]".format(attributoActivarConSaldoFavor)).removeAttr("disabled");

                        var valueDate = FECHA(valueC5);
                        var isInvalidDate = valueDate === FBUtils.getDateMin();
                        if (!isInvalidDate) {
                            $("#htmlOutput input[view-model={0}]".format(dbIdC20)).removeAttr("disabled");
                            FBUtils.applyFormatCurrencyOnElement($("#htmlOutput input[view-model={0}]".format(dbIdC20)), true);

                        }
                    }

                    if (valueC20 > 0) {
                        FBUtils.applyFormatCurrencyOnElement($("#htmlOutput input[view-model={0}]".format(dbIdC20)), true);
                    }
                }
            });
        }
    }

    function aplicarReglasC26() {
        var xmlCopy = FormsBuilder.XMLForm.getCopy();
        var UC26 = "UC26";
        var C20 = "C20";
        var C5 = "C5";

        var getViewModelId = function(idEntidad, claveInformativa, xmlCopy) {
            var viewModelId = '';
            var $propiedadNode = xmlCopy.find("entidad[id='{0}'] propiedades propiedad[claveInformativa='{1}']".format(idEntidad, claveInformativa)).eq(0);
            if ($propiedadNode) {
                var idPropiedad = $propiedadNode.attr("id");
                viewModelId = "E{0}P{1}".format(idEntidad, idPropiedad);
            }
            return viewModelId;
        };

        var propiedadesUc26 = xmlCopy.find("propiedades propiedad[claveInformativa='{0}']".format(UC26));
        $.each(propiedadesUc26, function(k, v) {
            var idPropiedad = $(v).attr("id");

            var dbIdC20;
            var dbIdC5;

            var infoProp = FormsBuilder.ViewModel.getFieldsForExprs()['${0}'.format(idPropiedad)];

            if (infoProp) {
                dbIdC20 = getViewModelId(infoProp.entidad, C20, xmlCopy);
                dbIdC5 = getViewModelId(infoProp.entidad, C5, xmlCopy);

                FormsBuilder.ViewModel.applyRulesDejarSinEfecto(dbIdC20);
                FormsBuilder.ViewModel.applyRulesDejarSinEfecto(dbIdC5);
            }

        });
    }

    function precargaAnexoPersonaFisica(callback) {
        if (SAT.Environment.settings('loadedPrecargarAnexo') === true) { callback(); return };
        if (AppDeclaracionesSAT.getConfig('forma') === 'new' && (
                AppDeclaracionesSAT.getConfig('tipodeclaracion') === AppDeclaracionesSAT.getConst('TipoDeclaracionNormal') ||
                AppDeclaracionesSAT.getConfig('tipodeclaracion') === AppDeclaracionesSAT.getConst('TipoDeclaracionNormalCorrecionFiscal'))) {

            console.log('precargaAnexoPersonaFisica');
            SAT.Environment.setSetting('isHydrate', true);

            var data = $.parseXML(Base64.decode($('#DVDAPREFOR').html()));
            //var data = FormsBuilder.XMLForm.getCopyPrecarga();
            data = preprocesarPrecargaAnexoPersonaFisica($(data));

            var datosAnexoPersonaFisica = $(data).find('DatosAnexoPersonaFisica').find('[idEntidad]');
            var xmlFormulario = FormsBuilder.XMLForm.getCopy();

            $.each(datosAnexoPersonaFisica, function(key, datoFisica) {
                var entidad = $(datoFisica).attr('idEntidad');
                var isVisible = FormsBuilder.ViewModel.getFlujoSecciones()[entidad]['NoVisible']

                if (isVisible === false || isVisible === undefined) {
                    var boton = $('#htmlOutput .panel[identidadpropiedad="{0}"]'.format(entidad)).find('.btnAddFormularioGridRow');
                    boton = (boton.length > 0) ? boton : $('#htmlOutput .panel[identidadpropiedad="{0}"]'.format(entidad)).find('.btnAddCtrlGridRow:first');
                    if (boton.length > 0) {

                        var cantidadentidades = $(data).find('DatosAnexoPersonaFisica').find('[idEntidad="{0}"]'.format(entidad)).length;
                        var renglones = FormsBuilder.ViewModel.getDetalleGrid()[entidad];
                        if (!$.isArray(renglones) || renglones.length === 0) {
                            boton.click();
                        }

                        var clavesInformativas = $(datoFisica).find('[claveInformativa]');
                        $.each(clavesInformativas, function(key, claveInformativa) {
                            var id = xmlFormulario.find('entidad[id="{0}"]'.format(entidad)).find('[claveInformativa="{0}"]'.format($(claveInformativa).attr('claveInformativa'))).attr('id');
                            var db_id = "E{0}P{1}".format(entidad, id);

                            var grid = FormsBuilder.ViewModel.getDetalleGrid()[entidad];
                            var ultimoRenglon = grid[grid.length - 1];
                            for (var columna in ultimoRenglon) {
                                if (columna.split('_')[0] === db_id) {
                                    var valor = $(claveInformativa).text();
                                    if (valor.match(/[.]/igm) !== null) {
                                        valor = REDONDEARSAT(valor);
                                    }
                                    if (valor != 'false') {
                                        grid[grid.length - 1][columna](valor);
                                        if ($('input[view-model="{0}"]'.format(columna)).hasClass('currency')) {
                                            FBUtils.applyFormatCurrencyOnElement($('input[view-model="{0}"]'.format(columna)), true);
                                        }
                                    }
                                }
                            }
                        });
                        renglones = FormsBuilder.ViewModel.getDetalleGrid()[entidad];
                        if (renglones.length < cantidadentidades) {
                            boton.click();
                        }
                    } else {
                        if ($(datoFisica).children().length > 0) {
                            var childs = $(datoFisica).find('[claveInformativa]');
                            $.each(childs, function(key, child) {
                                var db_id = "E{0}P{1}".format(entidad, $(child).attr('claveInformativa'));
                                var valor = $(child).text();
                                if (valor.match(/[.]/igm) !== null) {
                                    valor = REDONDEARSAT(valor);
                                }
                                if (valor != 'false') {
                                    FormsBuilder.ViewModel.get()[entidad][db_id](valor);
                                    if ($('input[view-model="{0}"]'.format(db_id)).hasClass('currency')) {
                                        FBUtils.applyFormatCurrencyOnElement($('input[view-model="{0}"]'.format(db_id)), true);
                                    }
                                }
                            });
                        } else {
                            var childs = $(datoFisica).attr('claveInformativa');
                            if (childs != undefined) {
                                var db_id = "E{0}P{1}".format(entidad, $(datoFisica).attr('claveInformativa'));
                                var valor = $(datoFisica).text();
                                if (valor.match(/[.]/igm) !== null) {
                                    valor = REDONDEARSAT(valor);
                                }
                                if (valor != 'false') {
                                    FormsBuilder.ViewModel.get()[entidad][db_id](valor);
                                    if ($('input[view-model="{0}"]'.format(db_id)).hasClass('currency')) {
                                        FBUtils.applyFormatCurrencyOnElement($('input[view-model="{0}"]'.format(db_id)), true);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        SAT.Environment.setSetting('loadedPrecargarAnexo', true);
        callback();
    }

    function precargaInformacion(data, callback) {
        console.log('precarga normal');
        FormsBuilder.XMLForm.copyPrecarga(data);
        FormsBuilder.Runtime.runInitRules();

        if (SAT.Environment.settings('dejarsinefecto') === false) {
            $('#htmlOutput').find('input[ForzarModoEdicion], select[ForzarModoEdicion]').attr("disabled", false);
        }

        var listValores = [];
        var valores = $(data).find('DatosContribuyente').children('*').not('DatosAnexoPersonaFisica');
        $.each(valores, function(k, v) {
            if ($(v).children().length > 0) {
                var childs = $(v).children('[claveInformativa]');
                $.each(childs, function(key, child) {
                    listValores.push(child);
                });
            } else {
                if ($(v).attr('claveInformativa') !== undefined) {
                    listValores.push(v);
                }
            }
        });

        $.each(listValores, function(key, valor) {
            var rule = FormsBuilder.ViewModel.getFieldsForExprs()["$" + $(valor).attr('claveInformativa')];
            if (rule !== undefined) {
                var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
                FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]($(valor).text());
            }
        });

        if (callback && typeof(callback) == "function") {
            callback();
        }

        var entidadNoVisible = [];
        var subRegimenSugerido = [];

        if (AppDeclaracionesSAT.getConfig('forma') === 'new' && (
                AppDeclaracionesSAT.getConfig('tipodeclaracion') === AppDeclaracionesSAT.getConst('TipoDeclaracionNormal') ||
                AppDeclaracionesSAT.getConfig('tipodeclaracion') === AppDeclaracionesSAT.getConst('TipoDeclaracionNormalCorrecionFiscal'))) {

            var datosAnexoSubRegimenSugerido = $(data).find('DatosGenerales').find('Regimenes');
            $.each(datosAnexoSubRegimenSugerido, function(key, subRegimen) {
                var idSubRegimen = $(subRegimen).find('Regimen').find('ClaveRegimen').text();
                subRegimenSugerido.push(idSubRegimen);
            });

            var datosAnexoPersonaFisica = $(data).find('DatosAnexoPersonaFisica').find('[idEntidad]');
            var xmlFormulario = FormsBuilder.XMLForm.getCopy();

            $.each(datosAnexoPersonaFisica, function(key, datoFisica) {
                var entidad = $(datoFisica).attr('idEntidad');

                var controlEntidad = xmlFormulario.find('formulario').children('controles').children('[idEntidadPropiedad="{0}"]'.format(entidad)).attr('id');

                var idSubregimen = xmlFormulario.find('agrupador').find('[idControlFormulario="{0}"]'.format(controlEntidad)).parent().attr('idSubRegimen');

                if (idSubregimen != undefined) {
                    if (entidadNoVisible.indexOf(idSubregimen) === -1) {
                        entidadNoVisible.push(idSubregimen);
                    }
                }

            });
        }

        if (tipoPersona === 'F') {
            if (entidadNoVisible.length > 0 || subRegimenSugerido.length > 0) {
                for (var i = 0; i < entidadNoVisible.length; i++) {
                    $('#subregimenes').find('input[idSubregimen="{0}"]'.format(entidadNoVisible[i])).attr('checked', true);
                }

                for (var j = 0; j < subRegimenSugerido.length; j++) {
                    $('#subregimenes').find('input[idcSubregimen="{0}"]'.format(subRegimenSugerido[j])).attr('checked', true);
                }

                $('#modalAvisoPreCarga').modal('show');
            } else {
                $('#modalSubregimenes').modal('show');
            }
        } else {
            setTimeout(function() {
                $('#sat-sections .lt-sections:visible:first').find('a:first').click()
                setTimeout(function() {
                    $('#myModal').modal('hide');
                }, 100);
            }, 250);
        }
        FBUtils.applyFormatCurrencyOnElement($("#htmlOutput"), true);

        if (IsNullOrEmptyOrZero(document.referrer) === false) {
            if (document.referrer.split('/')[4].split('?')[0] === 'StepTwo') {
                var xml = FormsBuilder.ViewModel.createXml();
                var encodeXmlResult = Base64.encode(xml);
                $('#DVDECLARACION').html(encodeXmlResult);
                //$('#modalDecideOfflineOnline').modal('show');
            }
        }
    }

    function precargaInformacionComplementaria(data, callback) {
        console.log('precarga complementaria');
        if (SAT.Environment.settings('dejarsinefecto') === false) {
            $('#htmlOutput').find('input[ForzarModoEdicion], select[ForzarModoEdicion]').attr("disabled", false);
        }

        if (callback && typeof(callback) == "function") {
            callback();
        }

        var listValores = [];
        var valores = $(data).find('DatosContribuyente').children('*').not('DatosAnexoPersonaFisica');
        $.each(valores, function(k, v) {
            if ($(v).children().length > 0) {
                var childs = $(v).children('[claveInformativa]');
                $.each(childs, function(key, child) {
                    listValores.push(child);
                });
            } else {
                if ($(v).attr('claveInformativa') !== undefined) {
                    listValores.push(v);
                }
            }
        });

        $.each(listValores, function(key, valor) {
            var rule = FormsBuilder.ViewModel.getFieldsForExprs()["$" + $(valor).attr('claveInformativa')];
            if (rule !== undefined) {
                var db_id = "E{0}P{1}".format(rule.entidad, rule.propiedad);
                FormsBuilder.ViewModel.get()[(db_id.split('P')[0]).replace('E', '')][db_id]($(valor).text());
            }
        });

        if (AppDeclaracionesSAT.getConfig('tipocomplementaria') === AppDeclaracionesSAT.getConst('TipoComplementariaDejarSinEfecto')) {
            aplicarReglasC26();
        }

        if (tipoPersona === 'F') {
            $('#modalSubregimenes').modal('show');
        }

        FBUtils.applyFormatCurrencyOnElement($("#htmlOutput"), true);
        if (document.referrer.split('/')[4].split('?')[0] === 'StepTwo') {
            var xml = FormsBuilder.ViewModel.createXml();
            var encodeXmlResult = Base64.encode(xml);
            $('#DVDECLARACION').html(encodeXmlResult);
            $('#modalDecideOfflineOnline').modal('show');
        }
    }

    function loadConfiguracionSubregimenes(mostrarModal, callback) {
        $('#configuracionRegimenes').show();

        AppDeclaracionesSAT.setConfig('subregimensugerido', '');
        AppDeclaracionesSAT.setConfig('ejercicio', '2013');

        if (mostrarModal) {
            $('#modalSubregimenes').modal('show');
        }

        var xmlCopyDeclaracion = FormsBuilder.XMLForm.getCopyDeclaracion();
        var catalogos = xmlCopyDeclaracion.find('SubRegimenes > Catalogo');
        $.each(catalogos, function(kCatalogo, catalogo) {
            $('#subregimenes').find('input[idSubregimen="{0}"]'.format($(catalogo).find('IdCatalogo').text())).attr('checked', true);
        });

        if (SAT.Environment.settings('dejarsinefecto') === true) {
            $('#subregimenes').find('input[type="checkbox"]').attr('disabled', 'disabled');
        }

        if (callback !== undefined) callback();
    }

    function loadConfiguracionAreaGeografica(callback) {
        var xmlCopyDeclaracion = FormsBuilder.XMLForm.getCopyDeclaracion();
        var areageograficaid = xmlCopyDeclaracion.find('propiedad[id="51"]').text();

        $('#areasgeograficas').find('input[idAreaGeografica="{0}"]'.format(areageograficaid)).attr('checked', true);

        if (SAT.Environment.settings('dejarsinefecto') === true) {
            $('#areasgeograficas').find('input[type="radio"]').attr('disabled', 'disabled');
        }

        if (callback !== undefined) callback();
    }

    function loadComboboxPeriodo(xmlDoc, callback) {
        var elementAdding = '';
        catalogos['Periodo'] = xmlDoc;
        // $.each($(xmlDoc).find('elemento[idPeriodo="0"]'), function (k, v) {
        //     elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("idPeriodo"), $(v).attr("descripcion"));
        // });
        var regimenSeleccionado = $('#regimenes input:checked').attr('idRegimen');

        $.each($(xmlDoc).find('agrupador[idRegimen={0}]'.format(regimenSeleccionado)).find('elemento'), function(k, v) {
            var idTipoPersona = $(v).attr("idTipoPersona");
            if (idTipoPersona == 'M') {
                elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("idPeriodo"), $(v).attr("descripcion"));
            } else {
                if (idTipoPersona == 'A') {
                    elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("idPeriodo"), $(v).attr("descripcion"));
                }
            }
        });
        if (elementAdding == '') {
            elementAdding += '<option value="0">- Seleccione un periodo -</option>';
        }
        $('#periodo').append(elementAdding);

        numCatalogos++;
        if (numCatalogos >= 5) {
            $('#myModal').modal('hide');
        }

        if (callback !== undefined) callback();
    }

    function loadCombobox(xmlDoc, element, callback) {
        catalogos[element] = xmlDoc;

        switch (element) {

            case 'tipodeclaracion':
                $('#' + element).html('');

                $('#tipodeclaracion').on('change', function() {
                    var isComplementaria = $.inArray($(this).val(), [AppDeclaracionesSAT.getConst('TipoDeclaracionComplementaria'),
                        AppDeclaracionesSAT.getConst('TipoDeclaracionComplementariaCorrecionFiscal'),
                        AppDeclaracionesSAT.getConst('TipoDeclaracionComplementariaDesconsolidacion'),
                        AppDeclaracionesSAT.getConst('TipoDeclaracionComplementariaDesincorporacion'),
                        AppDeclaracionesSAT.getConst('TipoDeclaracionComplementariaDictamen')
                    ]) >= 0;
                    if (isComplementaria) {
                        $('.tipocomplementaria').show();
                        var ejercicio = $('#ejercicio').val();
                        var regimen = $('input[name=group1]:checked').attr("idRegimen");
                        var elements = '';
                        $.each($(catalogos['tipocomplementaria']).find('agrupador[idTipoDeclaracion="{0}"]'.format($(this).val())).find('regimen[idRegimen="{0}"]'.format(regimen)).find('elemento'), function(k, v) {

                            if (
                                ($(v).attr("EjercicioInicia") <= ejercicio && ejercicio <= $(v).attr("EjercicioTermina")) ||
                                (
                                    $(v).attr("EjercicioInicia") == 0 && 0 == $(v).attr("EjercicioTermina")
                                )
                            ) {
                                elements += '<option value="{0}">{1}</option>'.format($(v).attr("idTipoComplementaria"), $(v).attr("texto"));
                            }

                        });
                        $('#tipocomplementaria').html(elements);
                    } else {
                        $('.tipocomplementaria').hide();
                        $('#tipocomplementaria').val('0').change();
                    }
                });
                break;

            case 'regimenes':
                break;

            case 'subregimenes':
                $('#subregimenes').empty();
                var subregimensugerido = AppDeclaracionesSAT.getConfig('subregimensugerido').split(',');
                $.each($(catalogos['subregimenes']).find('elemento'), function(k, v) {

                    var subregimen = $($('.tplsubregimenes').html());
                    subregimen.find('.form-control').html($(v).attr("texto"));
                    subregimen.find('input[type="checkbox"]').attr("idSubRegimen", $(v).attr("valor"));
                    subregimen.find('input[type="checkbox"]').attr("idcSubRegimen", $(v).attr("valorIdc"));
                    subregimen.find('input[type="checkbox"]').attr("titulo", $(v).attr("texto"));

                    if ($.inArray($(v).attr("valor"), subregimensugerido) > -1) {
                        subregimen.find('input[type="checkbox"]').attr('checked', 'checked');
                    }

                    $('#subregimenes').append(subregimen);

                });
                break;

            case 'areasgeograficas':
                $('#areasgeograficas').empty();
                var ejercicio = AppDeclaracionesSAT.getConfig('ejercicio');
                $.each($(catalogos['areasgeograficas']).find('agrupador[ejercicio="{0}"]'.format(ejercicio)).find('elemento'), function(k, v) {
                    var areageografica = $($('.tplareasgeograficas').html());

                    areageografica.find('.form-control').html($(v).attr("texto"));
                    areageografica.find('input[type="radio"]').attr("idAreaGeografica", $(v).attr("valor"));
                    areageografica.find('input[type="radio"]').attr("descAreaGeografica", $(v).attr("texto"));

                    $('#areasgeograficas').append(areageografica);
                });

                $('#myModal').modal('hide');

                break;

            case 'ejercicio':
                const _ejercicioMatrizRegimen = 2016;

                var regimenContribuyente;
                var rolContribuyente;

                try {
                    regimenContribuyente = atob($("#regimenContribuyente").val());
                    rolContribuyente = atob($("#rolContribuyente").val());
                } catch (err) {
                    regimenContribuyente = Base64.decode($("#regimenContribuyente").val());
                    rolContribuyente = Base64.decode($("#rolContribuyente").val());
                }

                var clavesRegimenVerificar = [];
                $.each(regimenContribuyente.split(","), function(k, v) {
                    var regimenVerificar = $(catalogos['matrizregimen']).find('elemento[ClaveRegimen="{0}"]'.format(v));

                    if ($(regimenVerificar).length >= 1) {
                        clavesRegimenVerificar.push(v);
                    }
                });

                var clavesRolesVerificar = [];
                $.each(rolContribuyente.split(","), function(k, v) {
                    var rolVerificar = $(catalogos['matrizregimen']).find('elemento[ClaveRol="{0}"]'.format(v));

                    if ($(rolVerificar).length >= 1) {
                        clavesRolesVerificar.push(v);
                    }
                });

                if (clavesRegimenVerificar.length > 0 && clavesRolesVerificar.length == 0) {
                    clavesRolesVerificar.push("0");
                }

                var elementAdding;
                elementAdding = '';

                var ejercicioInicial = AppDeclaracionesSAT.getConfig('ejercicioperfil');

                $.each(
                    $(catalogos['ejercicio']).find('elemento'),
                    function(k, v) {
                        elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("valor"), $(v).attr("texto"));
                    }
                );

                $('#ejercicio').empty().html(elementAdding);

                $('#ejercicio').on(
                    'change',
                    function() {
                        var valorEjercicio = $(this).val();

                        $("#column-dropdowns").hide();
                        $("#regimenes").empty();
                        $('#periodo').empty();
                        $('#tipodeclaracion').empty();

                        if (valorEjercicio !== '' || valorEjercicio !== undefined || valorEjercicio != '-1') {
                            $.each(
                                $(catalogos['regimenes']).find('elemento[idTipoPersona="{0}"]'.format(tipoPersona)),
                                function(k, v) {
                                    var idRegimen = $(v).attr('idRegimen');
                                    var ejercicioInicia = $(v).attr('ejercicioInicia');
                                    var ejercicioTermina = $(v).attr('ejercicioTermina');

                                    var isVisible = [];
                                    var isDefault = [];
                                    var isMatrizRegimen = false;

                                    if (parseInt(valorEjercicio) >= _ejercicioMatrizRegimen) {

                                        if (clavesRegimenVerificar.length > 0) {
                                            $.each(clavesRegimenVerificar, function(idxRegimen, claveRegimen) {

                                                if (clavesRolesVerificar.length > 0) {

                                                    $.each(clavesRolesVerificar, function(idxRol, claveRol) {

                                                        var formularios = $(catalogos['matrizregimen'])
                                                            .find('elemento[ClaveRegimen="{0}"][ClaveRol="{1}"]'.format(claveRegimen, claveRol))
                                                            .find('formulario[IdFormulario="{0}"]'.format(idRegimen));

                                                        if (formularios.length > 0) {
                                                            isVisible.push(1);
                                                            isMatrizRegimen = true;
                                                        }

                                                        var formularioDefault = $(catalogos['matrizregimen'])
                                                            .find('elemento[ClaveRegimen="{0}"][ClaveRol="{1}"]'.format(claveRegimen, claveRol))
                                                            .find('formulario[IdFormulario="{0}"][isDefault="{1}"]'.format(idRegimen, 1));

                                                        if (formularioDefault.length > 0) {
                                                            isDefault.push(1);
                                                        }

                                                    });

                                                }

                                            });
                                        } else {
                                            isVisible.push(1);
                                        }
                                    } else {
                                        isVisible.push(1);
                                    }

                                    var formVisible = false;
                                    var formDefault = false;

                                    if (isVisible.length >= 1) {
                                        formVisible = verificarBanderas(isVisible);
                                    } else {
                                        if (clavesRegimenVerificar.length == 0) {
                                            formVisible = true;
                                        }
                                    }

                                    if (isDefault.length >= 1) {
                                        formDefault = verificarBanderas(isDefault);
                                    }

                                    if ((parseInt(valorEjercicio) >= ejercicioInicia && parseInt(valorEjercicio) <= ejercicioTermina) && formVisible) {
                                        var regimen = $($('.tplregimenes').html());
                                        var idregimenPadre = $(v).attr("idregimenPadre");

                                        if (idregimenPadre == "0") {
                                            regimen.find('.form-control').html($(v).attr("texto"));
                                            regimen.find('input[type="radio"]').attr("idRegimen", $(v).attr("idRegimen"));

                                            regimen.find('input[type="radio"]').attr("hijos", "0");

                                            if (parseInt(valorEjercicio) >= _ejercicioMatrizRegimen && isMatrizRegimen) {
                                                var divRegimen = regimen.find('input[type="radio"]').parent().parent();
                                                divRegimen.attr("regimenDefault", formDefault ? "1" : "0");

                                                if (!formDefault) {
                                                    divRegimen.hide();
                                                }
                                            }

                                            $('#regimenes').append(regimen);
                                        } else {
                                            var regimenPadre = $('input[type="radio"][idRegimen="{0}"]'.format(idregimenPadre));
                                            var regimenhijo = $($('.tplregimeneshijos').html());

                                            $(regimenPadre).attr("hijos", "1");

                                            regimenhijo.attr('idpadre', idregimenPadre);
                                            regimenhijo.find('.form-control').html($(v).attr("texto"));
                                            regimenhijo.find('input[type="radio"]').attr("idpadre", idregimenPadre);
                                            regimenhijo.find('input[type="radio"]').attr("idRegimen", idRegimen);
                                            regimenhijo.find('input[type="radio"]').attr("hijos", "0");
                                            regimenhijo.append('<br>');

                                            $(regimenPadre).parent().parent().after(regimenhijo);
                                        }
                                    }
                                }
                            );
                        }

                        $('#regimenes input').on(
                            'change',
                            function(k, v) {
                                //changeRegimen(valorEjercicio, inputRegimen);

                                var t = $(this).attr("hijos");
                                var r = $(this).attr("idpadre");

                                $("#column-dropdowns").hide();
                                $('#periodo').empty();
                                $('#tipodeclaracion').empty();

                                if (t === "0" || (typeof t == "undefined" && typeof r != "undefined")) {

                                    var idRegimen = $(this).attr('idRegimen');
                                    var elementAdding = '';

                                    if (typeof r == "undefined") {
                                        $('.childregimen').slideUp({
                                                opacity: 1,
                                                height: "toggle"
                                            },
                                            800,
                                            function() {}
                                        );
                                    }

                                    $.each(
                                        $(catalogos['Periodo']).find('agrupador[idRegimen="{0}"]'.format(idRegimen)).find('elemento'),
                                        function(k, v) {
                                            var idTipoPersona = $(v).attr("idTipoPersona");

                                            if (idTipoPersona == 'M' || idTipoPersona == 'A') {
                                                elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("idPeriodo"), $(v).attr("descripcion"));
                                            }
                                        }
                                    );

                                    if (elementAdding == '') {
                                        elementAdding += '<option value="0">- Seleccione un periodo -</option>';
                                    }

                                    $('#periodo').append(elementAdding);

                                    elementAdding = '';
                                    $.each(
                                        $(catalogos['tipodeclaracion']).find('agrupador[idRegimen="{0}"]'.format(idRegimen)).find('elemento'),
                                        function(k, v) {

                                            var ejerDeclaracionInicia = $(v).attr("ejercicioInicia");
                                            var ejerDeclaracionTermina = $(v).attr("ejercicioTermina");

                                            if (parseInt(valorEjercicio) >= ejerDeclaracionInicia && parseInt(valorEjercicio) <= ejerDeclaracionTermina || (ejerDeclaracionTermina == 0 && ejerDeclaracionInicia == 0)) {
                                                elementAdding += '<option value="{0}">{1}</option>'.format($(v).attr("valor"), $(v).attr("texto"));
                                            }
                                        }
                                    );

                                    if (elementAdding === '') { elementAdding += '<option value="0">- Seleccione un tipo de declaración -</option>'; }

                                    $('#tipodeclaracion').append(elementAdding);

                                    $("#column-dropdowns").show();
                                    $('.tipocomplementaria').hide();
                                } else {
                                    var idRegimen = $(this).attr('idRegimen');

                                    $('.childregimen[idpadre="{0}"]'.format(idRegimen)).slideDown({
                                            opacity: 1,
                                            height: "toggle"
                                        },
                                        800,
                                        function() {}
                                    );

                                    $("#column-dropdowns").hide();
                                    $('#periodo').empty();
                                    $('#tipodeclaracion').empty();
                                }
                            }
                        );


                        //Genera de forma dinamica dos botones que mostraran u ocultaran los regimenes
                        //dependiendo el valor default en la matriz (regimen-rol)
                        //solo si aplica dicha matriz para el ejercicio seleccionado y si tiene mas de un regimen opcional (no marcado como default)
                        if (parseInt(valorEjercicio) >= _ejercicioMatrizRegimen) {

                            if ($("div[regimenDefault='0']").length > 0) {
                                const textoMostrar = "¿Desea presentar otro formulario?";
                                const textoOcultar = "Mostrar menos...";

                                var boton = document.createElement("button");
                                boton.type = "button";
                                boton.innerHTML = textoMostrar;
                                boton.id = "displayRegimen";
                                boton.className = "btn btn-primary btn-lg btn-red";

                                var limpiarRegimen = function() {
                                    $("input[type='radio'][idregimen]:checked").prop("checked", false);

                                    $("#column-dropdowns").hide();
                                    $('#periodo').empty();
                                    $('#tipodeclaracion').empty();
                                };

                                boton.onclick = function() {

                                    if ($(displayRegimen).html() == textoMostrar) {
                                        $(displayRegimen).html(textoOcultar);
                                    } else {
                                        $(displayRegimen).html(textoMostrar);
                                    }

                                    $('div[regimenDefault="0"]').toggle();

                                    $("input[type='radio'][idregimen]:checked").prop("checked", false);

                                    $("#column-dropdowns").hide();
                                    $('#periodo').empty();
                                    $('#tipodeclaracion').empty();
                                    $('.childregimen').hide();
                                };

                                $("#regimenes").append(boton);
                            }
                        }
                    }
                );

                $('#ejercicio').val(AppDeclaracionesSAT.getConfig('ejercicioperfil')).change();

                break;

        }

        numCatalogos++;
        if (numCatalogos >= 5) {
            $('#myModal').modal('hide');
            $("#column-button").show();
        }

        if (callback !== undefined) callback();
    }

    function verificarBanderas(banderasArray) {
        var result = false;

        $.each(banderasArray, function(k, v) {
            if (v == 1) {
                result = true;
            }
        });

        return result;
    }

    function cargandoPaso(progreso) {
        $('.progress-bar').attr('aria-valuenow', progreso);
        $('.progress-bar').attr('style', 'width:' + progreso + '%;');
    }

    function preprocesarPrecargaAnexoPersonaFisica(precarga, callback) {

        var CLAVE_ARRENDAMIENTO = "B1";
        var CLAVE_PROFESIONAL = "A1";

        var totalRetencionesIntereses = 0,
            totalIngresosAnexo2 = { valor: 0, "entidad": "1089", "clave": "AEP1" },
            totalExencionesAnexo2 = { valor: 0, "entidad": "1089", "clave": "AEP2" },
            totalIngresosArrendaAnexo2 = { valor: 0, "entidad": "1010", "clave": "ARR2" },
            totalExencionesArrendaAnexo2 = { valor: 0, "entidad": "1010", "clave": "ARR3" };

        var retencionesIntereses = precarga.find("DatosAnexoPersonaFisica DatosRetencionInteres InteresNominalTot");

        retencionesIntereses.each(function(k, v) {
            totalRetencionesIntereses += REDONDEARSAT(parseFloat(IsNullOrEmpty($(v).text()) ? 0 : $(v).text()));
        });

        if (precarga.find("DatosAnexoPersonaFisica Intereses > MontoInteres").length > 0 && totalRetencionesIntereses > 0) {
            $(precarga.find("DatosAnexoPersonaFisica Intereses > MontoInteres")[0]).text(totalRetencionesIntereses);
        }

        var montos = precarga.find("DatosAnexoPersonaFisica Anexo2 DatosAnexo2");

        montos.each(function(k, v) {

            var montoOperacionGravada = REDONDEARSAT(parseFloat(IsNullOrEmpty($(v).find("MontoOperacionGravada").text()) ? 0 : $(v).find("MontoOperacionGravada").text()));
            var montoExentoIsr = REDONDEARSAT(parseFloat(IsNullOrEmpty($(v).find("MontoExentoIsr").text()) ? 0 : $(v).find("MontoExentoIsr").text()));

            var sumaMontos = montoOperacionGravada + montoExentoIsr;
            $(v).find("MontoIngresosPagados").text(sumaMontos);

            var montoIngresosPagados = REDONDEARSAT(parseFloat(IsNullOrEmpty($(v).find("MontoIngresosPagados").text()) ? 0 : $(v).find("MontoIngresosPagados").text()));

            if ($(v).find("ClavePago").text() === CLAVE_ARRENDAMIENTO) {
                totalIngresosArrendaAnexo2.valor += montoOperacionGravada;
                totalExencionesArrendaAnexo2.valor += montoExentoIsr;

                $(precarga).find("DatosAnexoPersonaFisica TotalIngresosArrendaAnexo2").text(totalIngresosArrendaAnexo2.valor > 0 ? totalIngresosArrendaAnexo2.valor : "");
                $(precarga).find("DatosAnexoPersonaFisica TotalExencionesArrendaAnexo2").text(totalExencionesArrendaAnexo2.valor > 0 ? totalExencionesArrendaAnexo2.valor : "");
            } else if ($(v).find("ClavePago").text() === CLAVE_PROFESIONAL) {
                totalIngresosAnexo2.valor += montoIngresosPagados;
                totalExencionesAnexo2.valor += montoExentoIsr;

                $(precarga).find("DatosAnexoPersonaFisica TotalIngresosAnexo2").text(totalIngresosAnexo2.valor > 0 ? totalIngresosAnexo2.valor : "");
                $(precarga).find("DatosAnexoPersonaFisica TotalExencionesAnexo2").text(totalExencionesAnexo2.valor > 0 ? totalExencionesAnexo2.valor : "");
            }
        });

        return precarga;
    }
})();