/**
 * Modulo para el render de formularios que crea un control
 * que permite la visualización de estados (Validando, Exitoso, Fallido)  
 * (c) SAT 2017, Javier Cortés Cruz
 */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", BarraEstado, actualizarEstado, asignarValorParametro);

    var VALIDANDO = 0;
    var EXITOSO = 1;
    var FALLIDO = 2;

    function BarraEstado(control) {
        var idBarraEstado = $(control).attr("id");
        var idEntidad = $(control).attr("idEntidadPropiedad");
        var idPropiedad = $(control).attr("idPropiedad");
        var idEntidadPropiedad = "E{0}P{1}".format(idEntidad, idPropiedad);
        var llaveUrl = $(control).find("atributo[nombre='LlaveUrlConsulta']").attr("valor");
        var tituloValidando = $(control).find("atributo[nombre='TituloValidando']").attr("valor");
        var tituloExito = $(control).find("atributo[nombre='TituloExito']").attr("valor");
        var tituloFallo = $(control).find("atributo[nombre='TituloFallo']").attr("valor");
        var mensajeValidando = $(control).find("atributo[nombre='MensajeValidando']").attr("valor");
        var mensajeExito = $(control).find("atributo[nombre='MensajeExito']").attr("valor");
        var mensajeFallo = $(control).find("atributo[nombre='MensajeFallo']").attr("valor");
        var barraEstado = $("<div><div class='alert alert-info barra-estado' role='alert' style='display: none; margin-top: 20px;'>" +
            "<input id='parametro-{0}' type='hidden' />".format(idBarraEstado) +
            "<input id='estado-{0}' type='hidden' value='-1' />".format(idBarraEstado) +
            "<strong style='margin-right: 2em;'></strong><span></span></div></div>");

        barraEstado.find("input[id^='parametro']").attr({
            "data-id-entidad-propiedad": idEntidadPropiedad,
            "data-llave-url": llaveUrl
        });

        barraEstado.find("input[id^='estado']").attr({
            "view-model": idEntidadPropiedad,
            "data-bind": "value: {0}".format(idEntidadPropiedad)
        });

        barraEstado.find(".barra-estado").attr({
            "data-titulo-validando": tituloValidando,
            "data-titulo-exito": tituloExito,
            "data-titulo-fallo": tituloFallo,
            "data-mensaje-validando": mensajeValidando,
            "data-mensaje-exito": mensajeExito,
            "data-mensaje-fallo": mensajeFallo
        });

        return barraEstado.html();
    }

    function actualizarEstado() {
        $(".barra-estado").each(function () {
            var barraEstado = $(this);
            var parametro = barraEstado.find("input[id^='parametro']").val();
            var idEntidadPropiedad = barraEstado.find("input[id^='parametro']").data("id-entidad-propiedad");
            var idEntidad = FBUtils.getEntidad(idEntidadPropiedad);
            var viewModel = FormsBuilder.ViewModel.get()[idEntidad];

            if (!IsNullOrEmptyWhite(parametro)) {
                var llaveUrl = barraEstado.find("input[id^='parametro']").data("llave-url");
                var urlConsulta = SAT.Environment.settings(llaveUrl);
                var estadoActual = parseInt(barraEstado.find("input[id^='estado']").val());
                var callbackConsulta = function (nuevoEstado) {
                    if (nuevoEstado !== estadoActual) {
                        var titulo = "";
                        var mensaje = "";                        

                        viewModel[idEntidadPropiedad](nuevoEstado);
                        
                        switch (nuevoEstado) {
                            case VALIDANDO:
                                titulo = barraEstado.data("titulo-validando");
                                mensaje = barraEstado.data("mensaje-validando");
                                barraEstado.removeClass("alert-success alert-danger").addClass("alert-info");
                                break;
                            case EXITOSO:
                                titulo = barraEstado.data("titulo-exito");
                                mensaje = barraEstado.data("mensaje-exito");
                                barraEstado.removeClass("alert-info alert-danger").addClass("alert-success");
                                break;
                            case FALLIDO:
                                titulo = barraEstado.data("titulo-fallo");
                                mensaje = barraEstado.data("mensaje-fallo");
                                barraEstado.removeClass("alert-info alert-success").addClass("alert-danger");
                        }

                        barraEstado.find("strong").text(titulo);
                        barraEstado.find("span").text(mensaje);
                    }
                };

                barraEstado.show();

                consultaEstado(urlConsulta, parametro, callbackConsulta);
            } else {
                barraEstado.hide();
            }
        });
    }

    function consultaEstado(url, parametro, callback) {
        url = "VALOR PRUEBAS"; //<-- QUITAR ASIGNACION
        if (!IsNullOrEmptyWhite(url) && !IsNullOrEmptyWhite(parametro)
            && (callback && typeof callback === "function")) {
            // $.post(url, { "parametro": parametro })
            //     .done(function (result) {
            //         if (result.EsValido) {
            //             callback(result.Estado);
            //         }
            //     });

            callback(Math.floor(Math.random() * 3));
        }
    }

    function asignarValorParametro(idPropiedadBarraEstado, valor) {
        if (!IsNullOrEmptyWhite(idPropiedadBarraEstado)) {
            var datosPropiedad = FormsBuilder.ViewModel.getFieldsForExprs()["${0}".format(idPropiedadBarraEstado)];

            if (datosPropiedad) {
                var idBarraEstado = "E{0}P{1}".format(datosPropiedad.entidad, idPropiedadBarraEstado);
                $("input[id^='parametro'][data-id-entidad-propiedad='{0}']".format(idBarraEstado)).val(valor);
            }
        }
    }
})()