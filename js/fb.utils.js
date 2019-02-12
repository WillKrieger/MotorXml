"use strict";

(function () {
    namespace("FormsBuilder.Utils", getDbId, getDbId2, getFormatCurrency, getEntidad, getPropiedad, getPropiedadComplete, applyFormatCurrencyOnElement, convertValue, getDateMin, setDecimalsElement, getMs, hasAllQueueRules);
    window.FBUtils = FormsBuilder.Utils;

    var DateMin = new Date(-6847783200000);

    function getFormatCurrency(maxDecimalsBeforeRound) {
        maxDecimalsBeforeRound = maxDecimalsBeforeRound || 0;
        return { roundToDecimalPlace: maxDecimalsBeforeRound, region: 'es-MX' };
    }

    function getDateMin() {
        return DateMin;
    }

    function convertValue(value, dataType) {
        var result = value === "null" || isDateEmpty(value) ? '' : value;
        if (IsNullOrEmpty(dataType)) {
            console.log("No se proporciono un tipo de dato");
        }
        try {
            if (!IsNullOrEmpty(value)) {
                switch (dataType) {
                    case "Booleano":
                        if (typeof value == "string") {
                            result = value.ToBoolean();
                        }
                        break;
                    case "FechaHora":
                        break;
                    case "Fecha":
                        var dateParsed = FECHA(value);
                        var isInvalidDate = dateParsed == getDateMin();
                        if (!isInvalidDate) {
                            result = dateParsed.toString("dd/MM/yyyy");
                        }
                        break;
                    case "Numerico":
                    case "Alfanumerico":
                    default:
                        if (value === "true" || value === "false") {
                            result = value.ToBoolean();
                        }
                        break;
                }
            }


        } catch (err) {
            console.log("Problema al convertir {0} al tipo {1}".format(value, dataType));
        }
        return result;
    }

    function applyFormatCurrencyOnElement(nodeElement, forceApply) {
        if (!nodeElement) {
            return;
        }
        var $nodeElement = $(nodeElement);
        forceApply = forceApply || false;
        var formatSoloNode = function ($input) {
            var numTotalDecimales;
            if (forceApply) {
                numTotalDecimales = $input.attr("mostrarDecimales") || 0;
                $input.formatCurrency(getFormatCurrency(numTotalDecimales));
            } else {
                var infoPropiedad = undefined;
                try {
                    var idPropiedad = getPropiedad($input.attr("view-model"));
                    var searchSymbol = "${0}".format(idPropiedad);
                    infoPropiedad = FormsBuilder.ViewModel.getFieldsForExprs()[searchSymbol];
                } catch (err) {
                    //console.log("Element don't have viewModelId");
                }
                if ((infoPropiedad && infoPropiedad['tipoDatos'] === 'Numerico') || $nodeElement.hasClass('currency')) {
                    if (!$input.is(":focus")) {
                        numTotalDecimales = $input.attr("mostrarDecimales") || 0;
                        $input.formatCurrency(getFormatCurrency(numTotalDecimales));
                    }
                }
            }

        };
        var isSoloNode = $nodeElement.children().length == 0;
        if (isSoloNode) {
            formatSoloNode($nodeElement);
        } else {
            var $inputs = $nodeElement.find(".currency");
            $inputs.each(function (index, node) {
                var $node = $(node);
                formatSoloNode($node, true);
            });
        }
    }

    function getDbId(element) {
        var idEntidad = $(element).attr("idEntidad");
        var idPropiedad = $(element).attr("idPropiedad");

        return "E{0}P{1}".format(idEntidad, idPropiedad);
    }

    function getDbId2(element) {
        var idEntidad = $(element).attr("idEntidadPropiedad");
        var idPropiedad = $(element).attr("idPropiedad");

        return "E{0}P{1}".format(idEntidad, idPropiedad);
    }

    function getEntidad(value) {
        var idEntidad = undefined;
        if (value) {
            idEntidad = (value.split('P')[0]).replace('E', '');
        }
        return idEntidad;
    }

    function getPropiedad(value) {
        var idPropiedad = undefined;
        if (value) {
            var tempString = value.substring(value.indexOf('P') + 1, value.length);
            idPropiedad = (tempString.split('_').length > 1 ? tempString.split('_')[0] : tempString);
        }
        return idPropiedad;
    }

    function getPropiedadComplete(value) {
        var idPropiedad = undefined;
        if (value) {
            var tempString = value.substring(value.indexOf('P') + 1, value.length);
            idPropiedad = tempString;
        }
        return idPropiedad;
    }

    function setDecimalsElement() {
        if (window.lastElement) {
            if (window.lastElement.hasClass('currency') &&
            	window.lastElement.attr('view-model') !== $(document.activeElement).attr('view-model')) {
                if (window.lastElement.val() !== '') {
                    FBUtils.applyFormatCurrencyOnElement(window.lastElement, true);
                }
            }
        }
    }

    function getMs() {
        return $.browser.msie ? 150 : 300;
    }

    function hasAllQueueRules() {
        if (FormsBuilder.ViewModel.getLenQueueRules() > 0 ||
			FormsBuilder.Modules.getFgLenQueueRules() > 0 ||
			FormsBuilder.Modules.getCgLenQueueRules() > 0) {
            return true;
        } else {
            return false;
        }
    }

})();
