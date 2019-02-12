echo 'Iniciando la creacion del paquete'
cd ..
rm ../FormsEngineSAT.nw
zip -r ../${PWD##*/}.nw *
open ../FormsEngineSAT.nw
cd tools
echo 'Paquete finalizado'
