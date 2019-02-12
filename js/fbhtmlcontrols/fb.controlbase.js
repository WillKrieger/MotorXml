/** @module FormsBuilder.Modules */
/**
* Modulo para el render de formularios que contiene metodos reutilizables
* 
* (c) SAT 2013, Iván González
*/
/*global namespace:false, FormsBuilder:false, SAT: false, AppDeclaracionesSAT:false, ko:false, Base64:false */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", ControlBase);

    var ctrlBase = {
        sinEtiqueta: sinEtiqueta,
        forzarModoEdicion: forzarModoEdicion,
        validaLongitud: validaLongitud,
        soloNumerosPositivos: soloNumerosPositivos,
        soloNumerosNegativos: soloNumerosNegativos,
        ordenTabulador: ordenTabulador,
        acumular: acumular,
        sinTitulo: sinTitulo,
        mensajeValidacion: mensajeValidacion,
        enMayusculas: enMayusculas,
        enMayusculas2: enMayusculas2,
        validaRFCFM: validaRFCFM,
        helpString: helpString,
        autoCompletarEnteros: autoCompletarEnteros,
        mascara: mascara,
        sinDuplicidad: sinDuplicidad,
        obligatorio: obligatorio,
        muestraEnGrid: muestraEnGrid,
        formatCurrency: formatCurrency,
        capturaDecimales: capturaDecimales,
        mostrarDecimales: mostrarDecimales,
        ayudaEnDialogo: ayudaEnDialogo,
        deshabilitarCero: deshabilitarCero,
        alineacionTexto: alineacionTexto,
        noRemoverCeros: noRemoverCeros,
        getHelpText: getHelpText,
        sumaDetalle: sumaDetalle,
        propSumAct: propSumAct,
        propSumRec: propSumRec
    };

    function ControlBase() {
        return ctrlBase;
    }

    function ayudaEnDialogo(control, rowNewDiv, controlLayout) {
        var atributoNode = $(control).find('atributo[nombre="AyudaEnDialogo"]');
        if (atributoNode.length > 0) {
            var helpText = atributoNode.attr('valor');
            rowNewDiv.find(controlLayout).attr('ayudaEnDialogo', helpText);
        }
    }
    function obligatorio(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrObligatorio = $(control).find('atributo[nombre="Obligatorio"]');
        if (attrObligatorio.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).addClass('sat-obligatorio');
        }
    }

    function mostrarDecimales(control, rowNewDiv, CONTROL_LAYOUT) {
        var atributoNode = $(control).find("atributo[nombre='AutocompletarDecimales'], atributo[nombre='MostrarDecimales']");
        var existeAtributo = atributoNode.length > 0;
        if (existeAtributo) {
            var numDecimales = IsNullOrEmptyWhite(atributoNode.attr("valor")) ? 0 : atributoNode.attr("valor");
            rowNewDiv.find(CONTROL_LAYOUT).attr("mostrarDecimales", numDecimales);
        }
    }

    function sinEtiqueta(control, rowNewDiv, title) {
        var iconoAyuda = '<span class="help-label icon-info-sign"></span>';
        var attrSinEtiqueta = $(control).find('atributo[nombre="SinEtiqueta"]');
        if (attrSinEtiqueta.length <= 0) {
            var negrita = $(control).find('atributo[nombre="Negritas"]');
            if (negrita.length > 0) {
                rowNewDiv.find('div:first').html("<b>{0}{1}</b>".format(iconoAyuda, title.attr('valor')));
            } else {
                rowNewDiv.find('div:first').html(iconoAyuda + title.attr('valor') || '');
            }
        }
    }

    function forzarModoEdicion(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrForzarModoEdicion = $(control).find('atributo[nombre="ForzarModoEdicion"]');
        if (attrForzarModoEdicion.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('ForzarModoEdicion', attrForzarModoEdicion.attr('valor') || '');
        }
    }

    function validaLongitud(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrValidaLongitud = $(control).find('atributo[nombre="ValidaLongitud"]');
        if (attrValidaLongitud.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('maxlength', attrValidaLongitud.attr('valor') || '');
        }
    }

    function soloNumerosPositivos(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrSoloNumerosPositivos = $(control).find('atributo[nombre="SoloNumerosPositivos"]');
        if (attrSoloNumerosPositivos.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onkeydown', 'SoloNumerosPositivos(event)');
            if (!$.browser.mozilla) {
                rowNewDiv.find(CONTROL_LAYOUT).attr('onkeypress', 'OmitirSimulateKeys(event)');
            }
        }
    }

    function deshabilitarCero(control, rowNewDiv, CONTROL_LAYOUT) {
        var attr = $(control).find('atributo[nombre="DeshabilitarCero"]');
        if (attr.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onkeyup', 'DeshabilitarCero(event)');
        }
    }

    function soloNumerosNegativos(control, rowNewDiv, CONTROL_LAYOUT, numerosNegativos) {
        numerosNegativos = false;
        var attrSoloNumerosNegativos = $(control).find('atributo[nombre="SoloNumerosNegativos"]');
        if (attrSoloNumerosNegativos.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onkeydown', 'SoloNumerosNegativos(event)');
            if (!$.browser.mozilla) {
                rowNewDiv.find(CONTROL_LAYOUT).attr('onkeypress', 'OmitirSimulateKeys(event)');
            }
            numerosNegativos = true;
        }
    }

    function ordenTabulador(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrOrdenTabulador = $(control).find('atributo[nombre="OrdenTabulador"]');
        if (attrOrdenTabulador.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('tabindex', attrOrdenTabulador.attr('valor') || '');
        }
    }

    function acumular(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrAcumular = $(control).find('atributo[nombre="Acumular"]');
        if (attrAcumular.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('acumular', '');
        }
    }

    function sinTitulo(control, rowNewDiv) {
        var attrSinTitulo = $(control).find('atributo[nombre="SinTitulo"]');
        if (attrSinTitulo.length > 0) {
            var valor = attrSinTitulo.attr('valor');
            if (valor === '2') {
                rowNewDiv.find('div:first').css('min-height', '20px');
            } else {
                rowNewDiv.find('div:first').remove();
            }
        }
    }

    function mensajeValidacion(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrMensajeValidacion = $(control).find('atributo[nombre="MensajeValidacion"]');
        if (attrMensajeValidacion.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('mensajevalidacion', attrMensajeValidacion.attr('valor') || '');
        }
    }

    function enMayusculas(control, rowNewDiv, CONTROL_LAYOUT, numerosNegativos) {
        var attrEnMayusculas = $(control).find('atributo[nombre="EnMayusculas"]');
        if (attrEnMayusculas.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onchange', 'SoloMayusculas(event)');
        }
    }

    function enMayusculas2(control, rowNewDiv, CONTROL_LAYOUT, numerosNegativos) {
        var enMayusculas = $(control).find('atributo[nombre="EnMayusculas2"]');
        if (enMayusculas.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onchange', 'SoloMayusculas2(event)');
        } else {
            if (numerosNegativos) {
                rowNewDiv.find(CONTROL_LAYOUT).attr('onchange', 'RemoveZeros(event, true)');
            } else {
                rowNewDiv.find(CONTROL_LAYOUT).attr('onchange', 'RemoveZeros(event, false)');
            }
        }
    }

    function validaRFCFM(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrValidaRFCFM = $(control).find('atributo[nombre="ValidaRFCFM"]');
        if (attrValidaRFCFM.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onchange', 'Verf_rfc_FM(event, "' + attrValidaRFCFM.attr('valor') + '")');
        }
    }

    function noRemoverCeros(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrNoRemoverCeros = $(control).find('atributo[nombre="NoRemoverCeros"]');
        if (attrNoRemoverCeros.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onchange', '');
        }
    }

    function mascara(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrMascara = $(control).find('atributo[nombre="Mascara"]');
        if (attrMascara.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('mascara', attrMascara.attr('valor').replace(/#/g, '9'));
        }
    }

    function autoCompletarEnteros(control, rowNewDiv, CONTROL_LAYOUT) {
        var autocompletarEnteros = $(control).find('atributo[nombre="AutocompletarEnteros"]');
        var autocompletarDecimales = $(control).find('atributo[nombre="AutocompletarDecimales"]');
        if (autocompletarEnteros.length > 0 && autocompletarDecimales.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('onchange', 'AUTOCOMPLETAR(event, {0}, {1})'.format(autocompletarEnteros.attr('valor'), autocompletarDecimales.attr('valor')));
        }
    }

    function sinDuplicidad(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrSinDuplicidad = $(control).find('atributo[nombre="SinDuplicidad"]');
        if (attrSinDuplicidad.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('sinduplicidad', '');
        }
    }

    function helpString(titleLarge, helpText) {
        var helpStr = '<span>{0}</span><br />'.format(titleLarge.attr('valor') || '');
        if (helpText.length == 1) {
            helpStr = '<span>{0}</span><br /><b>Ayuda: </b><span>{1}</b></span><br/>'.format(titleLarge.attr('valor'), helpText.attr('Valor'));
        } else if (helpText.length > 1) {
            $.each(helpText, function (k, v) {
                var helps = $(v).attr('valor').split('|');
                if (helps.length == 2) {
                    var range = helps[0].split(',');

                    if (VALIDARRANGO(AppDeclaracionesSAT.getConfig('ejercicio'), range[0], range[1])) {
                        helpStr = '<span>{0}</span><br /><b>Ayuda: </b><span>{1}</b></span><br/>'.format(titleLarge.attr('valor'), helps[1]);
                    }
                    return true;
                }
            });
        }

        return helpStr;
    }

    function capturaDecimales(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrCapturaDecimales = $(control).find('atributo[nombre="CapturaDecimales"]');
        if (attrCapturaDecimales.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('capturaDecimales', '');
        }
    }

    function muestraEnGrid(control, rowNewDiv, CONTROL_LAYOUT) {
        var obligatorio = $(control).find('atributo[nombre="MuestraEnGrid"]');
        if (obligatorio.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('muestraEnGrid', '');
        }
    }

    function formatCurrency(propiedad, rowNewField, controlLayout) {
        var tipoDato = propiedad.attr('tipoDatos');
        if (tipoDato === 'Numerico') {
            rowNewField.find(controlLayout).addClass("currency");
        }
    }

    function alineacionTexto(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrAlineacionTexto = $(control).find('atributo[nombre="AlineacionTexto"]');
        if (attrAlineacionTexto.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('alineacionTexto', attrAlineacionTexto.attr('valor') || '');
        }
    }

    function getHelpText(control) {
        var idEntidad = $(control).attr('idEntidadPropiedad');
        var idPropiedad = $(control).attr('idPropiedad');
        var helpText = FormsBuilder.XMLForm.getCopy().find('textos > ayudas > entidad[IdEntidad="{0}"] > ayuda[IdPropiedad="{1}"]'.format(idEntidad, idPropiedad));
        return helpText;
    }

    function sumaDetalle(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrSumaDetalle = $(control).find('atributo[nombre="SumaDetalle"]');
        if (attrSumaDetalle.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('sumaDetalle', attrSumaDetalle.attr('valor') || '');
        }
    }

    function propSumAct(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrPropSumAct = $(control).find('atributo[nombre="PropSumAct"]');
        if (attrPropSumAct.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('propSumAct', attrPropSumAct.attr('valor') || '');
        }
    }

    function propSumRec(control, rowNewDiv, CONTROL_LAYOUT) {
        var attrPropSumRec = $(control).find('atributo[nombre="PropSumRec"]');
        if (attrPropSumRec.length > 0) {
            rowNewDiv.find(CONTROL_LAYOUT).attr('propSumRec', attrPropSumRec.attr('valor') || '');
        }
    }

})();