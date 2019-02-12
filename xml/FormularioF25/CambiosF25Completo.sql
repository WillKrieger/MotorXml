USE DecAnualesPMOriginal
BEGIN TRANSACTION [TranF25]
BEGIN TRY
    ----Cambios finales al formulario 25

    ---------------------------------Datos iniciales------------------------------------
    ------------------------------------------------------------------------------------
    -------219650--------Esta pregunta desaparece en el formulario
    UPDATE dbo.Control
    SET ReformaMayor = 4, EjercicioMayor = 2018
    WHERE IdControlFormulario = 9030004 and IdEntidad= '900' and IdFormulario = 9

    --------219868----------Se cambia el nombre a la propiedad
    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres persona moral dedicada exclusivamente a actividades agrícolas, ganaderas, pesqueras o silvícolas'
    WHERE IdEntidad = 903 and IdAtributo = 52680

    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres persona moral dedicada exclusivamente a actividades agrícolas, ganaderas, pesqueras o silvícolas'
    WHERE IdEntidad = 903 and IdAtributo = 52681

    UPDATE dbo.Propiedad
    SET Nombre = 'Indica si eres persona moral dedicada exclusivamente a actividades agrícolas, ganaderas, pesqueras o silvícolas'
    WHERE IdPropiedad = '219868' and IdEntidad=903

    -----219824-------Se cambió el nombre
    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres ejido o comunidad'
    WHERE IdEntidad = 903 and IdAtributo = 48979

    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres ejido o comunidad'
    WHERE IdEntidad = 903 and IdAtributo = 48980

    UPDATE dbo.Propiedad
    SET Nombre = 'Indica si eres ejido o comunidad'
    WHERE IdPropiedad = '219824' and IdEntidad=903

    ---219820---Se cambia indique por indica
    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si aplicas la facilidad establecida en la RFA'
    WHERE IdEntidad = 903 and IdAtributo = 52693

    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si aplicas la facilidad establecida en la RFA'
    WHERE IdEntidad = 903 and IdAtributo = 52694

    --219869--- indique por indica
    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres sociedad o asociación cooperativa de producción pesquera o silvícola'
    WHERE IdEntidad = 903 and IdAtributo = 52685

    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres sociedad o asociación cooperativa de producción pesquera o silvícola'
    WHERE IdEntidad = 903 and IdAtributo = 52684

    ----219801-------------Se cambió indique por indica
    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres sociedad o asociación de productores exclusivamente con socios o asociados personas físicas'
    WHERE IdEntidad = 903 and IdAtributo = 52695

    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica si eres sociedad o asociación de productores exclusivamente con socios o asociados personas físicas'
    WHERE IdEntidad = 903 and IdAtributo = 52696

    ---- 219816---------------- indique por indica
    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica el número de socios o asociados'
    WHERE IdEntidad = 903 and IdAtributo = 39810

    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Indica el número de socios o asociados'
    WHERE IdEntidad = 903 and IdAtributo = 39811

    -------2062017-----
    Insert into [dbo].[AtributoPropiedad] (IdEntidad,IdPropiedad,Nombre,Valor,EjercicioMenor,EjercicioMayor,ReformaMenor,ReformaMayor) values(903,'206206','TituloCorto','¿Estás obligado únicamente en el supuesto de haber, realizado operaciones llevadas a cabo con residentes en el extranjero inferiores a $100 mdp?',2018,2100,5,1000) 
    Insert into [dbo].[AtributoPropiedad] (IdEntidad,IdPropiedad,Nombre,Valor,EjercicioMenor,EjercicioMayor,ReformaMenor,ReformaMayor) values(903,'206206','TituloLargo','¿Estás obligado únicamente en el supuesto de haber, realizado operaciones llevadas a cabo con residentes en el extranjero inferiores a $100 mdp?',2018,2100,5,1000)
    UPDATE[dbo].[AtributoPropiedad] SET EjercicioMayor=2018,ReformaMayor=4 WHERE IdPropiedad = '206206' AND IdEntidad = 903 AND IdAtributo IN (53300,53301)

    -----219817------------------------------------------------
    UPDATE dbo.AtributoPropiedad
    SET Valor = 'Para efecto de reducción de impuesto indica si tus ingresos'
    WHERE IdEntidad = 903 and IdAtributo IN (39815, 39816)


    ---------------------------------Deducciones Autorizadas------------------------------------
    --------------------------------------------------------------------------------------------

    -------------------Determinación del ISR---------------------------------------------------
    ------------------------------------------------------------------------------------------
    UPDATE dbo.Regla
    SET IdTipoFlujo = '0,2'
    WHERE IdRegla = '562313' and IdEntidad= 900 

    ----112997----------------
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090053, 'Obligatorio', 1, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090054, 'Obligatorio', 1, 5, 1000)

    ----------112999---------------------
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '112999', 'TituloLargo', 'Crédito fiscal autorizado en el ejercicio por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '112999', 'TituloCorto', 'Crédito fiscal autorizado en el ejercicio por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
    UPDATE dbo.AtributoPropiedad
    SET ReformaMayor = 4, EjercicioMayor=2018
    WHERE IdEntidad = 909 and IdAtributo IN (54456, 54457)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090055, 'Obligatorio', 1, 5, 1000)

    -------113000-----------------------------
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090056, 'Obligatorio', 1, 5, 1000)

    -------113881---------------------------
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090057, 'Obligatorio', 1, 5, 1000)
    UPDATE dbo.Control
    SET EjercicioMenor = 2018
    WHERE IdControlFormulario = 9090057 and IdEntidad= '900' and IdFormulario = 9

    -------------------113882---------------------------------------------
    INSERT INTO dbo.Propiedad VALUES(909, 113882, 'Crédito fiscal autorizado en el ejercicio a la producción y distribución cinematográfica nacional pendiente de aplicar', 0, 1, 'SAT_DET_ISR_CRE_FIS_AUT', 113882)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113882', 'SinTitulo', '', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113882', 'TituloLargo', 'Crédito fiscal autorizado en el ejercicio a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113882', 'TituloCorto', 'Crédito fiscal autorizado en el ejercicio a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
    --Se agrga el control
    INSERT INTO dbo.Control VALUES(900, 9, 9090060, 3, 9090033, 909, 113882, 8, 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090060, 'Obligatorio', 1, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090060, 'ValidaLongitud', 13, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090060, 'SoloNumerosPositivos', null, 5, 1000)
    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($113882),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113882, 0, 2018, 2100, 5, 1000)

    -------------------113883---------------------------------------------
    INSERT INTO dbo.Propiedad VALUES(909, 113883, 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos en investigación y desarrollo tecnológico pendiente de aplicar', 0, 1, 'SAT_DET_ISR_SAL_CRE_FIS_AUT', 113883)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113883', 'SinTitulo', '', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113883', 'TituloLargo', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos en investigación y desarrollo tecnológico pendiente de aplicar', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113883', 'TituloCorto', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos en investigación y desarrollo tecnológico pendiente de aplicar', 2018, 2100, 5, 1000, null)
    --Se agrega el control
    INSERT INTO dbo.Control VALUES(900, 9, 9090061, 3, 9090034, 909, 113883, 14, 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090061, 'Obligatorio', 1, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090061, 'ValidaLongitud', 13, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090061, 'SoloNumerosPositivos', null, 5, 1000)
    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($113882),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113883, 0, 2018, 2100, 5, 1000)

    -------------------113884---------------------------------------------
    INSERT INTO dbo.Propiedad VALUES(909, 113884, 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos de inversión en las artes pendiente de aplicar', 0, 1, 'SAT_DET_ISR_SAL_CRE_FIS_AUT', 113884)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113884', 'SinTitulo', '', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113884', 'TituloLargo', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113884', 'TituloCorto', 'Saldo del crédito fiscal autorizado en ejercicios anteriores por proyectos de inversión en las artes pendiente de aplicar', 2018, 2100, 5, 1000, null)
    --Se agrega el control
    INSERT INTO dbo.Control VALUES(900, 9, 9090062, 3, 9090034, 909, 113884, 15, 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090062, 'Obligatorio', 1, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090062, 'ValidaLongitud', 13, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090062, 'SoloNumerosPositivos', null, 5, 1000)
    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($113882),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113884, 0, 2018, 2100, 5, 1000)

    -------------------113885---------------------------------------------
    INSERT INTO dbo.Propiedad VALUES(909, 113885, 'Saldo del crédito fiscal autorizado en ejercicios anteriores a la producción y distribución cinematográfica nacional pendiente de aplicar', 0, 1, 'SAT_DET_ISR_SAL_CRE_FIS_AUT', 113885)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113885', 'SinTitulo', '', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113885', 'TituloLargo', 'Saldo del crédito fiscal autorizado en ejercicios anteriores a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoPropiedad VALUES(909, '113885', 'TituloCorto', 'Saldo del crédito fiscal autorizado en ejercicios anteriores a la producción y distribución cinematográfica nacional pendiente de aplicar', 2018, 2100, 5, 1000, null)
    --Se agrega el control
    INSERT INTO dbo.Control VALUES(900, 9, 9090063, 3, 9090034, 909, 113885, 16, 2018, 2100, 5, 1000, null)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090063, 'Obligatorio', 1, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090063, 'ValidaLongitud', 13, 5, 1000)
    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090063, 'SoloNumerosPositivos', null, 5, 1000)
    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($113882),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113885, 0, 2018, 2100, 5, 1000)

    -----219823------------------
    UPDATE dbo.Regla
    SET IdTipoFlujo = '0,2'
    WHERE IdRegla = '576303' and IdEntidad= 900 

    ----219865---------------
    UPDATE dbo.Regla
    SET IdTipoFlujo = '0,2'
    WHERE IdRegla = '579547' and IdEntidad= 900 

    ------219871----------
    --parte1---
    UPDATE dbo.Regla
    SET EjercicioMayor = 2017
    WHERE IdRegla = '587124' and IdEntidad= 900 

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 2, '$219686=$219660+$219661+$219664+$219665+$219666+$219667+$219668+$219669+$219670+$219671+$219672+$219673+$219674+$219675+$219676+$219677+$219678+$219679+$219680+$219681+$219683+$219802+$219803+$219830+$219870+$219685+$112995+$209088+$119088+$209265+$219423', 
    null, null, 219686, 0, 2018, 2100, 1, 5, 1000, null)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 2, '$219686=$219660+$219661+$219662+$219663+$219664+$219665+$219666+$219667+$219668+$219669+$219670+$219671+$219672+$219673+$219674+$219675+$219676+$219677+$219678+$219679+$219680+$219681+$219683+$219802+$219803+$219830+$219870+$219685+$112995+$209088+$119088+$209265+$219423', 
    null, null, 219686, 0, 2018, 2100, 1, 4, 4, null)
    --parte2----
    UPDATE dbo.Regla
    SET EjercicioMayor = 2017
    WHERE IdRegla = '584169' and IdEntidad= 900 

    UPDATE dbo.Regla
    SET EjercicioMayor = 2017
    WHERE IdRegla = '585898' and IdEntidad= 900 

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219871=SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219827/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4))))', 
    null, null, 219871, 0, 2018, 2100, 1, 4, 4, null)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219871=SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219827/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4)+($219662+$219663))))', 
    null, null, 219871, 0, 2018, 2100, 1, 5, 1000, null)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219871=SI($219871>$219686,SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219827/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4)))))', 
    null, null, 219871, 0, 2018, 2100, 1, 4, 4, null)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219871=SI($219871>$219686,SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219827/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4)+($219662+$219663)))))', 
    null, null, 219871, 0, 2018, 2100, 1, 5, 1000, null)

    ------219829----------
    --parte2----
    UPDATE dbo.Regla
    SET EjercicioMayor = 2017
    WHERE IdRegla = '583867' and IdEntidad= 900 

    UPDATE dbo.Regla
    SET EjercicioMayor = 2017
    WHERE IdRegla = '585899' and IdEntidad= 900 
    --copia existente----
    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219829=SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219828/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4))))', 
    null, null, 219829, 0, 2018, 2100, 1, 4, 4, null)
    --nueva---
    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219829=SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219828/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4)+($219662+$219663))))', 
    null, null, 219829, 0, 2018, 2100, 1, 5, 1000, null)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219829=SI($219829>$219686-$219871,SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219828/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4)))))', 
    null, null, 219829, 0, 2018, 2100, 1, 4, 4, null)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, 
    DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, OmitirEnSinCalculo, ReformaMenor, ReformaMayor, IdTipoFlujo) 
    VALUES(900, 9, 4, '$219829=SI($219829>$219686-$219871,SI($219827+$219828==0,0,MAX(0,REDONDEARSAT(TRUNCAR($219828/($219827+$219828),4)*$219686*TRUNCAR(1-($219658/($219827+$219828)),4)+($219662+$219663)))))', 
    null, null, 219829, 0, 2018, 2100, 1, 5, 1000, null)

	--SECCIONES A MOSTRAR --CAMBIOS GUILLERMO GUERRERO
	UPDATE [dbo].[Seccion]
	SET IdTipoFlujo = NULL
	WHERE IdFormulario = 9
	AND IdControlFormulario IN (9040016,9060001,9040001)

	UPDATE [dbo].[Seccion]
	SET IdTipoFlujo = '0,2'
	WHERE IdFormulario = 9
	AND IdControlFormulario IN (9050001,922001)

	UPDATE [dbo].[Seccion]
	SET IdTipoFlujo = '0,1'
	WHERE IdFormulario = 9
	AND IdControlFormulario IN (9110001)

	INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
		,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],
		[ValidaSeccionAlEntrar],[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],
		[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion],[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
	SELECT IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, MensajeAyuda, Orden, EjecutarAlInicio, IdEjecutarRegla, ValidaSeccion,
		IdPropiedadAsociada, LimpiarCampoNoValido, MensajeErrorEnDialogo, EjecutaServer, MensajeAdvertencia, EjecutarEnGridVacio, ParticipaEnGrid, EjecutarEnSubRegimenes,
		ValidaSeccionAlEntrar, EjecutarSiempre, ExcluirEnGrid, 2018, 2100, OmitirEnSinCalculo, IdPropiedadesDisparador, Editable, 5, 1000,
		EjecutarEnDejarSinEfecto, EjecutarEnGridEdicion, EjecutarEnSelector, MensajeEnDialogoConfirmacion, IdTipoFlujo
	FROM [dbo].[Regla]
	WHERE DefinicionRegla = 'SI(ESNULO($219666),OCULTAR($219823),MOSTRAR($219823))'

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($113000),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113000, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($112999),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 112999, 0, 2018, 2100, 5, 1000)


    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($112998),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 112998, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($112997),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 112997, 0, 2018, 2100, 5, 1000)

    UPDATE dbo.Regla
    SET IdTipoFlujo = '0,2'
    WHERE IdRegla = '587203' and IdEntidad= 900

	--CAMBIOS QUE APLICAN PARA FORMULARIO 90 | PDF DEL F25
	UPDATE dbo.Control
	SET ReformaMayor = 4, EjercicioMayor = 2018
	WHERE IdControlFormulario = 9030004 and IdEntidad= '900' and IdFormulario = 90

	UPDATE dbo.Control
	SET EjercicioMenor = 2018
	WHERE IdControlFormulario = 9090057 and IdEntidad= '900' and IdFormulario = 90

	INSERT INTO dbo.Control VALUES(900, 90, 9090060, 3, 9090033, 909, 113882, 8, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090060, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090060, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090060, 'SoloNumerosPositivos', null, 5, 1000)

	INSERT INTO dbo.Control VALUES(900, 90, 9090061, 3, 9090034, 909, 113883, 14, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090061, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090061, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090061, 'SoloNumerosPositivos', null, 5, 1000)

	INSERT INTO dbo.Control VALUES(900, 90, 9090062, 3, 9090034, 909, 113884, 15, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090062, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090062, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090062, 'SoloNumerosPositivos', null, 5, 1000)

	INSERT INTO dbo.Control VALUES(900, 90, 9090063, 3, 9090034, 909, 113885, 16, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090063, 'Obligatorio', 1, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090063, 'ValidaLongitud', 13, 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 90, 9090063, 'SoloNumerosPositivos', null, 5, 1000)

	INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
    VALUES(900, 9, 1, 'SI(ESNULO($113881),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113881, 0, 2018, 2100, 5, 1000)

    --BUGS RESUELTOS VIRIDIANA------------------------
   
	INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
	,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],[ValidaSeccionAlEntrar]
	,[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion]
	,[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
VALUES
	(900,9,3
	,'SI($219764>0,MOSTRAR($219777),OCULTAR($219777))'
	,NULL,NULL,NULL,1,NULL,NULL,219777,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,NULL,2018,2100,1,NULL,1,5,1000,NULL,NULL,NULL,NULL,NULL
	)

	INSERT INTO dbo.Control VALUES(900, 90, 9090051, 6, 9090033, 909, 'SUBETIQUETA9', 1, 2018, 2100, 5, 1000, null)
	INSERT INTO dbo.Atributocontrol VALUES(900, 90, 9090051,'Negritas', null, 5, 1000)
	INSERT INTO dbo.Control VALUES(900, 90, 9090059, 6, 9090034, 909, 'SUBETIQUETA10', 10, 2018, 2100, 5, 1000, null)

	INSERT INTO dbo.Atributocontrol VALUES(900, 90, 9090059,'Negritas', null, 5, 1000)

	INSERT INTO dbo.Control VALUES(900, 90, 9090057, 3, 9090034, 909, '113881', 13, 2018, 2100, 5, 1000, null)

	INSERT INTO dbo.AtributoPropiedad VALUES(905, '209265', 'AyudaEnLinea', 
	'Dicho concepto no será aplicable tratándose de arrendadoras.</br>Sólo serán deducibles los pagos efectuados por el uso o goce temporal de automóviles hasta por el monto establecido, además de cumplir con lo dispuesto en la LISR.', 2018, 2100, 5, 1000, null)
	
	UPDATE dbo.Regla
	SET DefinicionRegla='SI($219666>0,OCULTAR($119088),MOSTRAR($119088))'
	WHERE IdRegla = '587172' and IdEntidad= 900 and IdFormulario=9

	INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090045, 'Obligatorio', 1, 5, 1000)

	INSERT INTO dbo.AtributoControl VALUES(900, 9, 9070016, 'Obligatorio', 1, 5, 1000)

	INSERT INTO dbo.AtributoPropiedad VALUES(905, '219666', 'AyudaEnLinea','Respecto al estímulo fiscal por contratar  personas con discapacidad y/o adultos mayores, se deberá anotar el monto equivalente al 100% del Impuesto Sobre la Renta retenido y enterado de estos trabajadores; de conformidad con lo señalado en la LISR vigente.</br>Por lo que hace al estímulo fiscal por contratar  personas con discapacidad y/o adultos mayores, a que se refieren el decreto de 26 de dic de 2013, se deberá anotar un monto equivalente al 25% del salario efectivamente pagado a dichas personas. este estímulo no podrá aplicarse en el mismo ejercicio junto con el  establecido en la LISR vigente respecto de las mismas personas.</br>Para 2016, esta disposición se establece en la LIF del mismo ejercicio.</br>El estímulo fiscal por contratar personas con discapacidad y/o adultos mayores consiste en el equivalente al 25 % del salario efectivamente pagado a las personas de 65 años y más (LISR vigente).', 2018, 2100, 5, 1000, null)

	UPDATE dbo.Regla
	SET DefinicionRegla='SI($119088>0,OCULTAR($219666),MOSTRAR($219666))'
	WHERE IdRegla = '587170' and IdEntidad= 900 and IdFormulario=9

	INSERT INTO dbo.AtributoControl VALUES(900, 9, 923005, 'LlaveUrlConsulta', 'urlConsultaEstado', 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(900, 9, 923005, 'MensajeValidacion', 'Validando', 5, 1000)
      INSERT INTO dbo.AtributoControl VALUES(900, 9, 923005, 'MensajeExito', 'Correcto', 5, 1000)
      INSERT INTO dbo.AtributoControl VALUES(900, 9, 923005, 'MensajeFallo', 'Fallido', 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($209088),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 209088, 0, 2018, 2100, 5, 1000)
    
    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($119088),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 119088, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090020, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($219764),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 219764, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090021, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($219765),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 219765, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090052, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($112996),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 112996, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090058, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($113880),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 113880, 0, 2018, 2100, 5, 1000)

     INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090035, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($219776),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 219776, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090035, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($219776),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 219776, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090036, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($219777),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 219777, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090050, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($209089),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 209089, 0, 2018, 2100, 5, 1000)

    INSERT INTO dbo.AtributoControl VALUES(900, 9, 9090048, 'Obligatorio', 1, 5, 1000)

    INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor) 
	VALUES(900, 9, 1, 'SI(ESNULO($111860),FALSO,VERDADERO)', 'El campo es obligatorio', 1, 111860, 0, 2018, 2100, 5, 1000)

    UPDATE dbo.Entidad
    SET Llave='SAT_MAS_INF_INT'
    where IdEntidad = 821 


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
		ROLLBACK TRANSACTION [TranF25]
END CATCH;

IF @@TRANCOUNT > 0
	COMMIT TRAN [TranF25];

GO








