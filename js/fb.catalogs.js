
"use strict";

(function() {
	namespace("FormsBuilder.Catalogs", init, getAll, getCatalog);
	var catalogs;

	function init(xmlDoc) {
		catalogs = $(xmlDoc).find('catalogos');
	}

	function getAll() {
		return catalogs;
	}

	function getCatalog(catalog) {
		return catalogs.find('[nombre="{0}"]'.format(catalog));
	}

}) ();
