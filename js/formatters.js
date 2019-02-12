"use strict";

(function(){
    namespace("FormsBuilder.Formatters", consecutiveFormatter, deleteFileFormatter);

    function consecutiveFormatter(value, row, index){
        return index + 1;
    }

    function deleteFileFormatter(value, row, index){
        return "<a class='deleteFile' href='#' data-iduploader='{0}' data-index='{1}' data-entidad-propiedad='{2}'><i class='icon icon-trash'></i></button>".format(row.idUploader, index, row.idEntidadPropiedad);
    }
})()