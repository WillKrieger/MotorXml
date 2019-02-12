/**
 * Modulo para el render de formularios que crea un control
 * que permite el envio de archivos.
 * 
 * (c) SAT 2017, Javier Cortés Cruz
 */

"use strict";

(function () {
    namespace("FormsBuilder.Modules", Uploader, loadedUIUploader, obtenerArchivos);

    var MSJ_ERROR_TAMANO_ARCHVO = "El archivo seleccionado supera el tamaño permitido.";
    var MSJ_ERROR_NUMERO_ARCHIVOS = "Solo puede cargar {0} archivo(s). Elimine un archivo de la lista para poder continuar.";
    var MSJ_ERROR_CARGA = "No se pudo cargar el archivo, intentelo nuevamente por favor."
    var MSJ_ELIMINAR_EXITOSO = "Se eliminó el archivo con exito";
    var MSJ_ERROR_ELIMINAR = "Ocurrio un error al intentar eliminar el archivo";
    var MSJ_CONFIRMA_ELIMINAR = "¿Confirma que desea eliminar el archivo?";

    var VER_DETALLE = "Ver detalle";
    var OCULTAR_DETALLE = "Ocultar detalle";
    var SIN_ARCHIVOS = "Ningún archivo agregado";
    var UN_ARCHIVO = "1 archivo agregado";
    var VARIOS_ARCHIVOS = "{0} archivos agregados";

    var archivosControl = {};

    function Uploader(control) {
        var controlBase = FormsBuilder.Modules.ControlBase();
        var idUploader = $(control).attr("id");
        var idEntidad = $(control).attr("idEntidadPropiedad");
        var idPropiedad = $(control).attr("idPropiedad");
        var entidad = FormsBuilder.XMLForm.getCopy().find('entidad[id="{0}"]'.format(idEntidad));
        var propiedad = entidad.find("propiedad[id='{0}']".format(idPropiedad));
        var tituloCorto = $(control).find("atributo[nombre='TituloCorto']");
        var tituloLargo = $(control).find("atributo[nombre='TituloLargo']");
        var tiposPermitidos = $(control).find("atributo[nombre='Extensiones']").attr("valor");
        var numeroArchivos = $(control).find("atributo[nombre='NumeroArchivos']").attr("valor");
        var tamanoArchivos = $(control).find("atributo[nombre='TamanoArchivos']").attr("valor");
        var ocultarDetalle = $(control).find("atributo[nombre='OcultarDetalle']").attr("valor");
        var barraEstado = $(control).find("atributo[nombre='BarraEstado']").attr("valor");
        var textoAyuda = controlBase.getHelpText.apply(this, [control]);
        var templateAyuda;
        var idEntidadPropiedad = "E{0}P{1}".format(idEntidad, idPropiedad);
        var uploaderHtml = $("<div><div class='sat-height-field titulo'></div><div id='uploader-{0}' class='input-group sat-height-field'>".format(idUploader) +
            "<input id='descripcion-{0}' class='form-control' disabled type='text' value='{1}'/><span class='input-group-btn'>".format(idUploader, SIN_ARCHIVOS) +
            "<label class='btn btn-primary'><input id='archivos-{0}' type='file' style='display: none;'/>".format(idUploader) +
            "Examinar</label></span><span class='input-group-btn toggleDetalleArchivos'><a href='#detalle-{0}' style='padding: 0 5px;' data-toggle='collapse'>".format(idUploader) +
            "Ver detalle</a></span></div></div>");
        var grid = $("<div class='row' style='margin-top:1em;'><div id='detalle-{0}' class='col-sm-12 collapse'>".format(idUploader) +
            "<div class='table-responsive'><table id='lista-archivos-{0}'".format(idUploader) +
            "class='table table-striped' data-toggle='table' data-cache='false' data-pagination='true' data-page-size='10' " +
            "data-id-field='id' data-show-footer='false' data-locale='es-MX'>" +
            "<thead><th data-align='center' data-formatter='FormsBuilder.Formatters.consecutiveFormatter'>#</th>" +
            "<th data-field='nombreArchivo'>Nombre archivo</th><th data-field='tamano' data-align='center'>Tamaño</th>" +
            "<th data-align='center' data-formatter='FormsBuilder.Formatters.deleteFileFormatter'>Eliminar</th></thead></table></div></div></div>");

        archivosControl[idEntidadPropiedad] = [];

        if (tituloCorto.length === 0) {
            tituloCorto = propiedad.find("atributo[nombre='TituloCorto']");
        }

        if (tituloLargo.length === 0) {
            tituloLargo = propiedad.find("atributo[nombre='TituloLargo']");
        }

        if (!IsNullOrEmptyWhite(tiposPermitidos)) {
            uploaderHtml.find("input[type='file']").attr("accept", tiposPermitidos);
        }

        if (!IsNullOrEmptyWhite(numeroArchivos)) {
            uploaderHtml.find("input[type='file']").attr("data-archivos", numeroArchivos);
        }

        if (!IsNullOrEmptyWhite(tamanoArchivos)) {
            uploaderHtml.find("input[type='file']").attr("data-tamano", tamanoArchivos);
        }

        if (!IsNullOrEmptyWhite(barraEstado)) {
            uploaderHtml.find("input[type='file']").attr("data-barra-estado", barraEstado);
        }

        if (!IsNullOrEmptyWhite(ocultarDetalle)) {
            if (ocultarDetalle == "0") {
                uploaderHtml.find(".toggleDetalleArchivos").remove();
                grid.find("div.collapse").addClass("in");
            } else if (ocultarDetalle == "1") {
                grid.find("div.collapse").removeClass("in");
            }
        } else {
            uploaderHtml.find(".toggleDetalleArchivos").remove();
            grid.find("div.collapse").addClass("in");
        }

        templateAyuda = controlBase.helpString.apply(this, [tituloLargo, textoAyuda]);

        uploaderHtml.find(".titulo").text(tituloCorto.attr("valor"));
        uploaderHtml.find("div.input-group").attr('help-text', templateAyuda);
        uploaderHtml.find("input[type='file']").attr("data-id-entidad-propiedad", idEntidadPropiedad);
        uploaderHtml.find("div.input-group").attr("view-model", idEntidadPropiedad);
        uploaderHtml.append(grid);

        return uploaderHtml.html();
    }

    function obtenerArchivos(idEntidadPropiedad) {
        var archivos = [];

        if (archivosControl[idEntidadPropiedad] && archivosControl[idEntidadPropiedad].length > 0) {
            archivos = archivosControl[idEntidadPropiedad].concat();
        }

        return archivos;
    }

    function loadedUIUploader() {
        $("body").append("<div id='confirma-eliminar-archivo' class='modal fade' data-backdrop='static' data-keyboard='false'>" +
            "<div class='modal-dialog'><div class='modal-content'><div class='modal-body'>¿Confirma que desea eliminar el archivo?</div>" +
            "<div class='modal-footer'><button id='si-confirma' type='button' data-dismiss='modal' class='btn btn-primary'>Si</button>" +
            "<button id='no-confirma' type='button' data-dismiss='modal' class='btn btn-primary'>No</button></div></div></div></div>");

        $("table[id^='lista-archivos']").bootstrapTable();

        $("a.toggleDetalleArchivos").click(function (event) {
            var texto = $(this).text();

            if (texto === VER_DETALLE) {
                $(this).text(OCULTAR_DETALLE);
            } else if (texto === OCULTAR_DETALLE) {
                $(this).text(VER_DETALLE);
            }
        });

        $("input[type='file'][id^='archivos']").change(function (event) {
            event.preventDefault();

            var uploader = $(this);
            var idUploader = this.id.split("-")[1];
            var idEntidadPropiedad = uploader.data("id-entidad-propiedad");
            var archivo = this.files[0];
            var tamanoLimite = parseInt(uploader.data("tamano"));
            var numeroArchivos = parseInt(uploader.data("archivos"));
            var barraEstado = uploader.data("barra-estado");
            var callbackEnvioArchivo = function (urlArchivo, idArchivo) {
                archivosControl[idEntidadPropiedad].push({
                    "idUploader": idUploader,
                    "idEntidadPropiedad": idEntidadPropiedad,
                    "nombreArchivo": archivo.name,
                    "tamano": (archivo.size / 1048576).toFixed(2) + " MB",
                    "idArchivo": idArchivo,
                    "urlArchivo": urlArchivo
                });

                $("#lista-archivos-{0}".format(idUploader)).bootstrapTable("load", archivosControl[idEntidadPropiedad]);                

                uploader.val(null);

                FormsBuilder.Modules.asignarValorParametro(barraEstado, idArchivo);

                cambiarDescripcion(idUploader, idEntidadPropiedad);
                cambiarViewModel(idEntidadPropiedad);
            };

            if (isNaN(numeroArchivos) || (archivosControl[idEntidadPropiedad].length < numeroArchivos)) {
                if (isNaN(tamanoLimite) || (archivo.size <= tamanoLimite)) {
                    enviarArchivo(archivo, callbackEnvioArchivo);
                } else if (!isNaN(tamanoLimite) && (archivo.size > tamanoLimite)) {
                    $("#modalSeccion .modal-body").append("<div style='padding-bottom: 15px;'>{0}</div>".format(MSJ_ERROR_TAMANO_ARCHVO));
                    $("#modalSeccion").modal("show");
                }
            } else if (!isNaN(numeroArchivos) && (archivosControl[idEntidadPropiedad].length === numeroArchivos)) {
                $("#modalSeccion .modal-body").append("<div style='padding-bottom: 15px;'>{0}</div>".format(MSJ_ERROR_NUMERO_ARCHIVOS.format(numeroArchivos)));
                $("#modalSeccion").modal("show");
            }
        });

        $(document).on("click", "a.deleteFile", function (event) {
            event.preventDefault();

            $("#confirma-eliminar-archivo #si-confirma").attr("data-iduploader", $(this).data("iduploader"))
                .attr("data-entidad-propiedad", $(this).data("entidad-propiedad"))
                .attr("data-index", $(this).data("index"));

            $("#confirma-eliminar-archivo").modal("show");
        });

        $(document).on("click", "#si-confirma", function (event) {
            var btnConfirma = this;
            var indice = $(btnConfirma).data("index");
            var idEntidadPropiedad = $(btnConfirma).data("entidad-propiedad");
            var archivoEliminar = archivosControl[idEntidadPropiedad][indice];

            if (archivoEliminar) {
                eliminarArchivo(archivoEliminar.idArchivo, function () {
                    var idUploader = $(btnConfirma).data("iduploader");
                    var barraEstado = $("#archivos-{0}".format(idUploader)).data("barra-estado");

                    archivosControl[idEntidadPropiedad].splice(indice, 1);

                    $("#lista-archivos-{0}".format(idUploader)).bootstrapTable("load", archivosControl[idEntidadPropiedad]);

                    FormsBuilder.Modules.asignarValorParametro(barraEstado, null);

                    cambiarDescripcion(idUploader, idEntidadPropiedad);
                    cambiarViewModel(idEntidadPropiedad);
                });
            }
        });
    }

    function enviarArchivo(archivo, callback) {
        if (archivo && (callback && typeof callback === "function")) {
            var urlEnvio = SAT.Environment.settings('urlenvio');
            var data = new FormData();

            data.append("archivo", archivo);

            $.ajax({
                "url": urlEnvio,
                "type": "POST",
                "data": data,
                "dataType": "json",
                "processData": false,
                "contentType": false,
            })
                .done(function (result) {
                    if (result && result.EsValido) {
                        callback(result.Url, result.IdArchivo);
                    } else if (result && !result.EsValido) {
                        $("#modalSeccion .modal-body").append("<div style='padding-bottom: 15px;'>{0}</div>".format(MSJ_ERROR_CARGA));
                        $("#modalSeccion").modal("show");
                    }
                });
        }
    }

    function eliminarArchivo(idArchivo, callback) {
        if (!IsNullOrEmptyWhite(idArchivo) && (callback && typeof callback === "function")) {
            var urlEliminar = SAT.Environment.settings('urleliminar');

            // $.post(urlEliminar, { "idArchivo": idArchivo })
            //     .done(function (result) {
            //         if (result.EsValido) {
            $("#modalSeccion .modal-body").append("<div style='padding-bottom: 15px;'>{0}</div>".format(MSJ_ELIMINAR_EXITOSO));
            $("#modalSeccion").modal("show");

            callback();
            //     } else {
            //         $("#modalSeccion .modal-body").append("<div style='padding-bottom: 15px;'>{0}</div>".format(MSJ_ERROR_ELIMINAR));
            //         $("#modalSeccion").modal("show");
            //     }
            // });
        }
    }

    function cambiarDescripcion(idUploader, idEntidadPropiedad) {
        var archivosEnlista = archivosControl[idEntidadPropiedad].length;
        var descripcion;

        if (archivosEnlista === 0) {
            descripcion = SIN_ARCHIVOS;
        } else if (archivosEnlista === 1) {
            descripcion = UN_ARCHIVO;
        } else if (archivosEnlista > 1) {
            descripcion = VARIOS_ARCHIVOS.format(archivosEnlista);
        }

        $("#descripcion-{0}".format(idUploader)).val(descripcion);
    }

    function cambiarViewModel(idEntidadPropiedad) {
        if (!IsNullOrEmptyWhite(idEntidadPropiedad)) {
            var idEntidad = FBUtils.getEntidad(idEntidadPropiedad);
            var nuevoValor = archivosControl[idEntidadPropiedad].length;
            var viewModel = FormsBuilder.ViewModel.get()[idEntidad];

            viewModel[idEntidadPropiedad](nuevoValor === 0 ? null : nuevoValor);
        }
    }
})()