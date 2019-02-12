USE DecAnualesPMOriginal
BEGIN TRANSACTION [TranF24]
BEGIN TRY
	------------------Gastos realizados en el ejercicio por proyectos en investigaci�n y 
	------------------desarrollo tecnol�gico
	--De obligatorio condicionado a obligatorio 
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100049, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($112997),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 112997, 0, 2018, 2100, 5, 1000)
	--Inserta la regla nueva (ser visible todo el tiempo)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 3, 'SI($111860<0,OCULTAR($112997),MOSTRAR($112997))', 1, 111860, 0, 2018, 2100, 5, 1000)
	--Actualiza la vieja regla
	UPDATE dbo.Regla
	SET EjercicioMayor = 2017
	WHERE IdRegla = '587164'
	--Se inserta la vieja regla para cubrir reformas anteriores en el a�o 2018
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 3, 'SI($111860>0,MOSTRAR($112997),OCULTAR($112997))', 1, 111860, 0, 2018, 2100, 4, 4)

	------------------Cr�dito fiscal autorizado en el ejercicio por proyectos en investigaci�n 
	------------------y desarrollo tecnol�gico pendiente de aplicar
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100050, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($112998),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 112998, 0, 2018, 2100, 5, 1000)


	------------------Cr�dito fiscal autorizado en el ejercicio por la inversi�n en proyectos y 
	------------------programas para el deporte de alto rendimiento pendiente de aplicar
	--Se agrega obligatorio 
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100052, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($113000),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113000, 0, 2018, 2100, 5, 1000)

	-------------------Cr�dito fiscal autorizado en el ejercicio a la producci�n 
	-------------------y distribuci�n cinematogr�fica nacional pendiente de aplicar
	INSERT INTO dbo.Propiedad VALUES(810, 113882, 'Crédito fiscal autorizado en el ejercicio a la producción y distribución cinematográfica nacional pendiente de aplicar', 0, 1, 'SAT_DET_ISR_CRE_FIS_AUT', 113882)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113882', 'SinTitulo', '', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113882', 'TituloLargo', 'Crédito fiscal autorizado en el ejercicio a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113882', 'TituloCorto', 'Crédito fiscal autorizado en el ejercicio a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
	--Se agrga el control
	INSERT INTO dbo.Control VALUES(800, 8, 8100056, 3, 8100013, 810, 113882, 7, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100056, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100056, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100056, 'SoloNumerosPositivos', null, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($113882),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113882, 0, 2018, 2100, 5, 1000)

	----113881--------Saldo del cr�dito fiscal autorizado en ejercicios anteriores  �Por  la inversi�n en proyectos 
	------------------y programas para el deporte de alto rendimiento� pendiente de aplicar
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100053, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($113881),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113881, 0, 2018, 2100, 5, 1000)
	--ocultar control  para ejercicio 2017
	UPDATE dbo.Control
	SET EjercicioMenor = 2018
	WHERE IdControlFormulario = 8100053 and IdEntidad= 800 and IdFormulario = 8


	-----113883-------Saldo del cr�dito fiscal autorizado en ejercicios anteriores por proyectos en investigaci�n 
	------------------y desarrollo tecnol�gico pendiente de aplicar
	INSERT INTO dbo.Propiedad VALUES(810, 113883, 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos en investigación y desarrollo tecnológico pendiente de aplicar', 0, 1, 'SAT_DET_ISR_SAL_CRE_FIS_AUT_ANT', 113883)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113883', 'TituloLargo', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos en investigación y desarrollo tecnológico pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113883', 'TituloCorto', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos en investigación y desarrollo tecnológico pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113883', 'SinTitulo', '', 2018, 2100, 5, 1000, null)

	INSERT INTO dbo.Control VALUES(800, 8, 8100057, 3, 8100014, 810, 113883, 8, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100057, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100057, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100057, 'SoloNumerosPositivos', null, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($113883),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113883, 0, 2018, 2100, 5, 1000)

	--------113884------------Saldo del cr�dito fiscal autorizado en ejercicios anteriores por
	 -------------------proyectos de inversi�n en las artes pendiente de aplicar
	INSERT INTO dbo.Propiedad VALUES(810, 113884, 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos de inversión en las artes pendiente de aplicar', 0, 1, 'SAT_DET_ISR_SAL_CRE_FIS_AUT_ANT', 113884)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113884', 'TituloLargo', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113884', 'TituloCorto', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113884', 'SinTitulo', '', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Control VALUES(800, 8, 8100058, 3, 8100014, 810, 113884, 9, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100058, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100058, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100058, 'SoloNumerosPositivos', null, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($113884),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113884, 0, 2018, 2100, 5, 1000)


	---------113885-----------Saldo del cr�dito fiscal autorizado en ejercicios anteriores a la producci�n 
	---------------------------y distribuci�n cinematogr�fica nacional pendiente de aplicar

	INSERT INTO dbo.Propiedad VALUES(810, 113885, 'Saldo del crédito fiscal autorizado en ejercicios anteriores a la producción y distribución cinematográfica nacional pendiente de aplicar', 0, 1, 'SAT_DET_ISR_SAL_CRE_FIS_AUT_ANT', 113885)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113885', 'TituloLargo', 'Saldo del crédito fiscal autorizado en ejercicios anteriores a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113885', 'TituloCorto', 'Saldo del crédito fiscal autorizado en ejercicios anteriores a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '113885', 'SinTitulo', '', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Control VALUES(800, 8, 8100059, 3, 8100014, 810, 113885, 10, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100059, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100059, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100059, 'SoloNumerosPositivos', null, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($113885),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113885, 0, 2018, 2100, 5, 1000)

	---arreglos de posicion columnas
	UPDATE dbo.Control
	SET IdControlFormularioPadre = 8100013, Orden = 9
	WHERE IdControlFormulario = 8100037 and IdEntidad= '800' and IdFormulario = 8

	UPDATE dbo.Control
	SET IdControlFormularioPadre = 8100013, Orden = 10
	WHERE IdControlFormulario = 8100038 and IdEntidad= '800' and IdFormulario = 8
	--------------------------Datos inciales, preguntas---------------------------------------------------
	---------------------------------------------------------------------------------
	INSERT INTO dbo.Propiedad VALUES(804, 219650, '¿Indica si optas por dictaminar tus estados financieros?', 0, 1, 'SAT_IND_OPT_POR_DIC_SUS_EST_FIN', 219650)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219650', 'TituloLargo', '¿Indica si optas por dictaminar tus estados financieros?', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219650', 'TituloCorto', '¿Indica si optas por dictaminar tus estados financieros?', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219650', 'Catalogo', 1, 2018, 2100, 5, 1000, null)
	UPDATE dbo.Control
	SET EjercicioMayor = 2018, ReformaMayor = 4
	WHERE IdControlFormulario = 8040004 and IdEntidad= '800' and IdFormulario = 8
	
	--------206206-------------
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '206206', 'TituloLargo', '¿Estás obligado únicamente en el supuesto de haber, realizado operaciones llevadas a cabo con residentes en el extranjero inferiores a $100 mdp?', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '206206', 'TituloCorto', '¿Estás obligado únicamente en el supuesto de haber, realizado operaciones llevadas a cabo con residentes en el extranjero inferiores a $100 mdp?', 2018, 2100, 5, 1000, null)
	
	UPDATE dbo.AtributoPropiedad
	SET EjercicioMayor= 2018, ReformaMayor=4
	WHERE IdAtributo IN (53134, 53135) and IdEntidad = 804
	---------------------------------219868--------------------------------------
	INSERT INTO dbo.Propiedad VALUES(804, 219868, 'Indica si se trata de:', 0, 1, 'SAT_IND_SI_SE_TRA_DE', 219868)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219868', 'TituloLargo', 'Indica si se trata de:', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219868', 'TituloCorto', 'Indica si se trata de:', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219868', 'Catalogo', 112, 2018, 2100, 4, 1000, null)
	INSERT INTO dbo.Control VALUES(800, 8, 8040008, 4, 8040002, 804, 219868, 2, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8040008, 'ValorInicial', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8040008, 'Obligatorio', 1, 5, 1000)
	UPDATE dbo.Control
	SET EjercicioMayor = 2017
	WHERE IdControlFormulario = 8040006 and IdEntidad= '800' and IdFormulario = 8
	---arreglo bug 2278
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI($219868=="0",FALSO,VERDADERO)', 'El campo es obligatorio', 1, 219868, 0, 2018, 2100, 5, 1000)
	
	----------------------------219824------------------------------------------
	INSERT INTO dbo.Propiedad VALUES(804, 219824, 'Indica si se trata de la última declaración del ejercicio de liquidación', 0, 1, 'SAT_IND_TRA_ULT_DEC_DEL_EJE_LIQ', 219824)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219824', 'TituloLargo', 'Indica si se trata de la última declaración del ejercicio de liquidación', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219824', 'TituloCorto', 'Indica si se trata de la última declaración del ejercicio de liquidación', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(804, '219824', 'Catalogo', 1, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Control VALUES(800, 8, 8040007, 4, 8040003, 804, 219824, 2, 2018, 2100, 4, 1000, null)
	UPDATE dbo.Control
	SET EjercicioMayor = 2017
	WHERE IdControlFormulario = 8040005 and IdEntidad= '800' and IdFormulario = 8

	----------------112999------------------------------------------------
	UPDATE dbo.Propiedad
	SET Nombre = 'Crédito fiscal autorizado en el ejercicio por proyectos de inversión en las artes pendiente de aplicar.'
	WHERE IdPropiedad = '112999' and IdEntidad=810

	---------reglas relacionadas cn fluejo issif---------------------------------
	-----------------------------------------------------------------------------

	---copia de la existente------------
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
	VALUES(800, 8, 2, '$219534=$219439', null, 1, 219534, 0, 2018, 2100, 0, 1, 4, '0,2')
	------nueva regla------------------
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
	VALUES(800, 8, 4, '$219534=$219439', null, 1, 219534, 0, 2018, 2100, 0, 5, 1000, '2')
	------cambios a la regla existente---------------
	UPDATE dbo.Regla
	SET EjercicioMayor =2017
	WHERE IdRegla = '563496' and IdEntidad= 800 

	------cambios a regla existente------------
	UPDATE dbo.Regla
	SET EjercicioMayor =2017
	WHERE IdRegla = '587202' and IdEntidad= 800 
	-----copia regla existente---------------
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor, IdTipoFlujo) 
	VALUES(800, 8, 3, 'SI(Y($219446==0,$119088==0),OCULTAR($219587),MOSTRAR($219587))', null, 1, 219587, 0, 2018, 2100, 4, 4, null)
	-------regla nueva----------------------
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor, IdTipoFlujo) 
	VALUES(800, 8, 3, 'SI(Y($219446==0,$119088==0),OCULTAR($219587),MOSTRAR($219587))', null, 1, 219587, 0, 2018, 2100, 5, 1000, '0,1')

	-------actualizacion de regla existente-----
	UPDATE dbo.Regla
	SET EjercicioMayor = 2017, ReformaMayor = 1000
	WHERE IdRegla = '579545' and IdEntidad= 800 
	---------copia existente---------
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
	VALUES(800, 8, 3, 'SI(NO(ESNULO($219599)),HABILITAR($219623),INHABILITAR($219623))', null, 1, 219623, 0, 2018, 2100, 0, 1, 4, '0,2')
	--------nueva-------------------------
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
	VALUES(800, 8, 3, 'SI(NO(ESNULO($219599)),HABILITAR($219623),INHABILITAR($219623))', null, 1, 219623, 0, 2018, 2100, 0, 5, 1000, '0,1')

	------------------------------REGLAS VIRI NUEVAS---
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '112999', 'TituloLargo', 'Crédito fiscal autorizado en el ejercicio por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '112999', 'TituloCorto', 'Crédito fiscal autorizado en el ejercicio por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
	
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '112999', 'TituloLargo', 'Crédito fiscal autorizado en el ejercicio por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 4, 4, null)
	INSERT INTO dbo.AtributoPropiedad VALUES(810, '112999', 'TituloCorto', 'Crédito fiscal autorizado en el ejercicio por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 4, 4, null)
	
	UPDATE dbo.AtributoPropiedad
	SET EjercicioMayor = 2017, ReformaMayor= 1000
	WHERE IdAtributo IN (54382, 54383) and IdEntidad = 810 and IdPropiedad = '112999'  

	------cambios relacionados al flujo issif---------------------
	UPDATE dbo.Regla
	SET IdTipoFlujo = '0,2'
	WHERE IdRegla = '587202' and IdEntidad= 800 

	------219623--------------
	UPDATE dbo.Regla
	SET ReformaMayor = 1000
	WHERE IdRegla = '579545' and IdEntidad= 800 

	----bug 2279-----
	-----se añade al a todos los flujos seccion de ingresos acumulables---
	UPDATE dbo.Seccion
	SET IdTipoFlujo = null
	WHERE IdSeccion = 352 AND IdControlFormulario = 8050001 and IdEntidad = 800 

	UPDATE dbo.Control
	SET IdTipoFlujo = null
	WHERE IdControlFormulario =8050001 and IdEntidad= 800 and IdFormulario=8

	----se añade a a todos los flujos la seccion balance
	UPDATE dbo.Seccion
	SET IdTipoFlujo = null
	WHERE IdSeccion = 354 AND IdControlFormulario = 8070001 and IdEntidad = 800

	UPDATE dbo.Control
	SET IdTipoFlujo = null
	WHERE IdControlFormulario =8070001 and IdEntidad= 800 and IdFormulario=8

	----se añade a a todos los flujos la seccion datos iniciales
	UPDATE dbo.Seccion
	SET IdTipoFlujo = null
	WHERE IdSeccion = 351 AND IdControlFormulario = 8040001 and IdEntidad = 800

	UPDATE dbo.Control
	SET IdTipoFlujo = null
	WHERE IdControlFormulario =8040001 and IdEntidad= 800 and IdFormulario=8
	
	-----ejercicio de liquidación, bug 2287  -----
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
					  VALUES(800, 8, 3, 'SI($23=="042",MOSTRAR($219824),OCULTAR($219824))',NULL, 1, 219824, 0, 2018, 2100, 5, 1000)
	
	---cambios al pdf BUG 2295--------------------------------------------
	INSERT INTO dbo.Control VALUES(800, 80, 8100056, 3, 8100013, 810, 113882, 7, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Control VALUES(800, 80, 8100057, 3, 8100014, 810, 113883, 8, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Control VALUES(800, 80, 8100058, 3, 8100014, 810, 113884, 9, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Control VALUES(800, 80, 8100059, 3, 8100014, 810, 113885, 10, 2018, 2100, 5, 1000, null)
	
	UPDATE dbo.Control
	SET IdControlFormularioPadre=8100013, Orden= 8
	WHERE IdControlFormulario =8100054 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET IdControlFormularioPadre=8100013, Orden= 10
	WHERE IdControlFormulario =8100038 and IdEntidad= 800 and IdFormulario=80

	-----BUG 2296
	INSERT INTO dbo.AtributoControl VALUES(800, 80, 8100047, 'Negritas', null, 5, 1000)

	UPDATE dbo.Control
	SET IdPropiedad = 'SUBETIQUETA10', IdTipoControl = 6
	WHERE IdControlFormulario = 8100055 and IdEntidad= 800 and IdFormulario=80

	INSERT INTO dbo.AtributoControl VALUES(800, 80, 8100055, 'Negritas', null, 5, 1000)
	
	UPDATE dbo.Control
	SET IdPropiedad = '113880'
	WHERE IdControlFormulario =8100054 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET Orden=4
	WHERE IdControlFormulario =8100055 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET Orden=5
	WHERE IdControlFormulario =8100036 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET Orden=6
	WHERE IdControlFormulario =8100035 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET IdPropiedad='113881', IdControlFormularioPadre=8100014
	WHERE IdControlFormulario =8100053 and IdEntidad= 800 and IdFormulario=80

	---bug 2297----
	INSERT INTO dbo.Control VALUES(800, 80, 8040008, 4, 8040002, 804, 219868, 2, 2018, 2100, 5, 1000, null)
	
	UPDATE dbo.Control
	SET Orden=9, IdControlFormularioPadre= 8100013
	WHERE IdControlFormulario =8100037 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET EjercicioMayor=2017
	WHERE IdControlFormulario =8040004 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET ReformaMayor=1000, EjercicioMayor=2017
	WHERE IdControlFormulario =8040004 and IdEntidad= 800 and IdFormulario=8

	UPDATE dbo.Control
	SET EjercicioMayor=2017
	WHERE IdControlFormulario =8040006 and IdEntidad= 800 and IdFormulario=80

	UPDATE dbo.Control
	SET EjercicioMayor=2017
	WHERE IdControlFormulario =8040005 and IdEntidad= 800 and IdFormulario=80

	-----bug 2301 -----
	INSERT INTO dbo.Control VALUES(800, 80, 8040007, 4, 8040003, 804, 219824, 2, 2018, 2100, 4, 1000, null)

	-----corrección de bug 2298
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor, IdTipoFlujo) 
					  VALUES(800, 8, 4, '$219534=$219439',NULL, 1, 219534, 0, 2018, 2100, 5, 1000, '1')
	
	UPDATE dbo.Regla
	SET OmitirEnSinCalculo = 0
	WHERE IdRegla = 589246 and IdEntidad=800

	--feature 2302
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor, IdTipoFlujo) 
					  VALUES(800, 8, 3, 'SI($219542>0,MOSTRAR($219555),OCULTAR($219555))',NULL, 1, 219555, 0, 2018, 2100, 5, 1000, null)
	--INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor, IdTipoFlujo) 
	--				  VALUES(800, 8, 3, 'SI($219541>0,MOSTRAR($219554),OCULTAR($219554))',NULL, 1, 219554, 0, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($219554),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 219554, 0, 2018, 2100, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100035, 'Obligatorio', 1, 5, 1000)


	--feature 2303
	INSERT INTO dbo.AtributoPropiedad VALUES(806, '209265', 'AyudaEnLinea', 
	'Dicho concepto no será aplicable tratándose de arrendadoras. Sólo serán deducibles los pagos efectuados por el uso o goce temporal de automóviles hasta por el monto establecido, además de cumplir con lo dispuesto en la LISR.'
	, 2018, 2100, 5, 1000, null)

	---bug 2304
	INSERT INTO dbo.AtributoControl VALUES(800, 8, 8100051, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(800, 8, 1, 'SI(ESNULO($112999),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 112999, 0, 2018, 2100, 5, 1000)

	------para issif---
	INSERT INTO [dbo].[AtributoControl]([IdEntidad],[IdFormulario],[IdControlFormulario],[Nombre],[Valor],[ReformaMenor],[ReformaMayor])
	  VALUES(800,8,823005,'LlaveUrlConsulta','urlConsultaEstado',5,1000)

	  INSERT INTO [dbo].[AtributoControl]([IdEntidad],[IdFormulario],[IdControlFormulario],[Nombre],[Valor],[ReformaMenor],[ReformaMayor])
	  VALUES(800,8,823005,'MensajeValidacion','Validando',5,1000)

	  INSERT INTO [dbo].[AtributoControl]([IdEntidad],[IdFormulario],[IdControlFormulario],[Nombre],[Valor],[ReformaMenor],[ReformaMayor])
	  VALUES(800,8,823005,'MensajeExito','Correcto',5,1000)

	  INSERT INTO [dbo].[AtributoControl]([IdEntidad],[IdFormulario],[IdControlFormulario],[Nombre],[Valor],[ReformaMenor],[ReformaMayor])
	  VALUES(800,8,823005,'MensajeFallo','Fallido',5,1000)

END TRY
BEGIN CATCH
	SELECT   
        ERROR_NUMBER() AS ErrorNumber  
        ,ERROR_SEVERITY() AS ErrorSeverity  
        ,ERROR_STATE() AS ErrorState  
        ,ERROR_PROCEDURE() AS ErrorProcedure  
        ,ERROR_LINE() AS ErrorLine  
        ,ERROR_MESSAGE() AS ErrorMessage;  

	IF @@TRANCOUNT > 0
		ROLLBACK TRANSACTION [TranF24]
END CATCH;

IF @@TRANCOUNT > 0
	COMMIT TRAN [TranF24];

GO
