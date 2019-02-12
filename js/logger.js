"use strict";

(function () {
    namespace("Logger", init, write);

    var connection;

    function init() {
        if (window.WebSocket) {
            connection = new WebSocket("ws://localhost:9090");

            console.log('Estableciendo conexion...');

            try {
                connection.onopen = function () {
                    console.log('Conexion establecida...');
                    connection.send(JSON.stringify({ msg: 'Enviando logs' }));
                };
            } catch (err) {
                console.log(err);
            }
        }
    }

    function write(data) {
        if (connection !== undefined) {
            if (connection.readyState === 1) {
                connection.send(data);
            }
        }
    }
})();
