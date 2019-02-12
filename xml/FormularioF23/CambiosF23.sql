USE DecAnualesPM
BEGIN TRANSACTION [TranF24]
BEGIN TRY

	--CAMBIOS PARA DOCUMENTO Directorio DA Morales F 23_30052018.docx
	--CAMBIO A PROPIEDAD 219150 -- PAGINA 3
	UPDATE [dbo].[Propiedad]
	SET Nombre = '¿Indica si optas por dictaminar tus estados financieros?'
	WHERE IdPropiedad = '219150'
	AND IdEntidad = 704

	UPDATE[dbo].[AtributoPropiedad]
	SET Valor = '¿Indica si optas por dictaminar tus estados financieros?'
	WHERE IdPropiedad = '219150'
	AND IdEntidad = 704
	AND IdAtributo IN (40882, 40883)

	--------------CAMBIOS REALIZADOS--------------
	--CAMBIOS PARA DOCUMENTO Directorio DA Morales F 23_30052018.docx
	--CAMBIO A PROPIEDAD 219907 -- PAGINA 3
	UPDATE [dbo].[Propiedad]
	SET Nombre = 'Indica si se dedica exclusivamente a la generación de energía proveniente de fuentes renovables o de sistemas de cogeneración de electricidad eficiente'
	WHERE IdPropiedad = '219907'
	AND IdEntidad = 704

	UPDATE[dbo].[AtributoPropiedad]
	SET Valor = 'Indica si se dedica exclusivamente a la generación de energía proveniente de fuentes renovables o de sistemas de cogeneración de electricidad eficiente'
	WHERE IdPropiedad = '219907'
	AND IdEntidad = 704
	AND IdAtributo IN (48929, 48930)

	--CAMBIOS A REGLA DE PROPIEDAD 219394 --PAGINA 104
	INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
				,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],[ValidaSeccionAlEntrar]
				,[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion]
				,[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
		 VALUES
			   (700,7,2
				,'$219394=SI(Y($219357==0,$219429==0,$219395>0),'''',SI(Y(O(NO(ESNULO($219357)),NO(ESNULO($219429))),$219395>0),($219357+$219429),SI(($219379+$219392+$219357+$219429)>=($219385+$219387+$219389+$219390+$219391+$219393),($219379+$219392+$219357+$219429)-($219385+$219387+$219389+$219390+$219391+$219393),'''')))'
				,NULL,NULL,NULL,1,NULL,NULL,219394,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,NULL,2018,2100,1,NULL,1,5,1000,NULL,NULL,NULL,NULL,NULL
				)

	UPDATE [dbo].[Regla]
	SET EjercicioMenor = 2017, EjercicioMayor = 2018, ReformaMenor = 4, ReformaMayor = 4
	WHERE IdRegla = 586011 AND IdFormulario = 7
	AND IdEntidad = 700 AND IdPropiedadAsociada = 219394

	--CAMBIOS A REGLA DE PROPIEDAD 219395 --PAGINA 105
	INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
				,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],[ValidaSeccionAlEntrar]
				,[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion]
				,[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
		 VALUES
			   (700,7,2
				,'$219395=SI(($219379+$219392)<($219385+$219387+$219389+$219390+$219391+$219393),($219385+$219387+$219389+$219390+$219391+$219393)-($219379+$219392),'''')'
				,NULL,NULL,NULL,1,NULL,NULL,219395,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,NULL,2018,2100,1,NULL,1,5,1000,NULL,NULL,NULL,NULL,NULL
				)

	UPDATE [dbo].[Regla]
	SET EjercicioMenor = 2017, EjercicioMayor = 2018, ReformaMenor = 4, ReformaMayor = 4
	WHERE IdRegla = 586014 AND IdFormulario = 7
	AND IdEntidad = 700 AND IdPropiedadAsociada = 219395

	--CAMBIOS A REGLA DE PROPIEDAD 219906 --PAGINA 111
	--APLICAR NUEVAMENTE
	UPDATE [dbo].[Regla]
	SET IdTipoFlujo = '0,2'
	WHERE IdEntidad = 700
	AND IdFormulario = 7
	AND IdRegla = 587201
	-- INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
	-- 	,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],[ValidaSeccionAlEntrar]
	-- 	,[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion]
	-- 	,[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
	-- VALUES
	-- 	(700,7,3
	-- 	,'SI(ESNULO($219339),OCULTAR($219906),MOSTRAR($219906))'
	-- 	,NULL,NULL,NULL,1,NULL,NULL,219906,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,NULL,2018,2100,1,NULL,1,5,1000,NULL,NULL,NULL,NULL,'2'
	-- 	)

	-- UPDATE [dbo].[Regla]
	-- SET EjercicioMenor = 2017, EjercicioMayor = 2018, ReformaMenor = 4, ReformaMayor = 4
	-- WHERE IdRegla = 587201 AND IdFormulario = 7
	-- AND IdEntidad = 700 AND IdPropiedadAsociada = 219906

	--CAMBIOS A REGLA DE PROPIEDAD 219948 --PAGINA 112
	--APLICAR NUEVAMENTE
	UPDATE [dbo].[Regla]
	SET IdTipoFlujo = '0,2'
	WHERE IdEntidad = 700
	AND IdFormulario = 7
	AND IdRegla = 584559
	-- INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
	-- 	,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],[ValidaSeccionAlEntrar]
	-- 	,[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion]
	-- 	,[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
	-- VALUES
	-- 	(700,7,3
	-- 	,'SI(ESNULO($219918),OCULTAR($219948),MOSTRAR($219948))'
	-- 	,NULL,NULL,NULL,1,NULL,NULL,219948,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,NULL,2018,2100,1,NULL,1,5,1000,NULL,NULL,NULL,NULL,'2'
	-- 	)

	-- UPDATE [dbo].[Regla]
	-- SET EjercicioMenor = 2017, EjercicioMayor = 2018, ReformaMenor = 4, ReformaMayor = 4
	-- WHERE IdRegla = 584559 AND IdFormulario = 7
	-- AND IdEntidad = 700 AND IdPropiedadAsociada = 219948

	--APLICAR NUEVAMENTE
	--CAMBIOS A FLUJO DE SECCIONES
	UPDATE [dbo].[Seccion]
	SET IdTipoFlujo = NULL
	WHERE IdEntidad = 700
	AND IdFormulario = 7
	AND IdSeccion = 319

	UPDATE [dbo].[Seccion]
	SET IdTipoFlujo = NULL
	WHERE IdEntidad = 700
	AND IdFormulario = 7
	AND IdSeccion = 320

	UPDATE [dbo].[Seccion]
	SET IdTipoFlujo = NULL
	WHERE IdEntidad = 700
	AND IdFormulario = 7
	AND IdSeccion = 321

	--CAMBIOS A SECCION 4 INVERSIONES
	--INSERT INTO [dbo].[Seccion]([IdEntidad],[IdFormulario],[IdControlFormulario],[IdTipoSeccion],[IdAgrupadorSeccion],[OrdenGrupo],[EjercicioMenor],[EjercicioMayor],[OcultarNavegacion],[ReformaMenor],[ReformaMayor],[InhabilitarEnSelector],[IdTipoFlujo])
	--VALUES (700,7,718001,3,2227,4,2018,2100,NULL,5,100,NULL,'0')
	

	--UPDATE [dbo].[Seccion]
	--SET [EjercicioMayor] = 2018, [ReformaMayor] = 4
	--WHERE IdFormulario = 7
	--AND IdSeccion = 332
	

	----CAMBIOS A SECCION 6 CONCILIACION ENTRE EL RESULTADO CONTABLE Y EL FISCAL
	--INSERT INTO [dbo].[Seccion]([IdEntidad],[IdFormulario],[IdControlFormulario],[IdTipoSeccion],[IdAgrupadorSeccion],[OrdenGrupo],[EjercicioMenor],[EjercicioMayor],[OcultarNavegacion],[ReformaMenor],[ReformaMayor],[InhabilitarEnSelector],[IdTipoFlujo])
	--VALUES (700,7,708000,3,2227,6,2018,2100,NULL,5,100,NULL,'0')
	

	--UPDATE [dbo].[Seccion]
	--SET [EjercicioMayor] = 2018, [ReformaMayor] = 4
	--WHERE IdFormulario = 7
	--AND IdSeccion = 322
	

	----CAMBIOS A SECCION 7 DATOS DE ALGUNAS DEDUCCIONES AUTORIZADAS
	--INSERT INTO [dbo].[Seccion]([IdEntidad],[IdFormulario],[IdControlFormulario],[IdTipoSeccion],[IdAgrupadorSeccion],[OrdenGrupo],[EjercicioMenor],[EjercicioMayor],[OcultarNavegacion],[ReformaMenor],[ReformaMayor],[InhabilitarEnSelector],[IdTipoFlujo])
	--VALUES (700,7,709000,3,2227,7,2018,2100,NULL,5,100,NULL,'0')
	

	--UPDATE [dbo].[Seccion]
	--SET [EjercicioMayor] = 2018, [ReformaMayor] = 4
	--WHERE IdFormulario = 7
	--AND IdSeccion = 323
	

	--CAMBIO A CAMPO 219365 - SOLO SE DEBE MOSTRAR CON ISSIF COMPLETA
	INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
				,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],[ValidaSeccionAlEntrar]
				,[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion]
				,[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
		 VALUES
			   (700,7,4
				,'$219365=SI($219345>$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318,0,$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318-$219345)'
				,NULL,NULL,NULL,1,NULL,NULL,219365,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,NULL,2018,2100,1,NULL,1,5,1000,NULL,NULL,NULL,NULL,'1'
				)

	UPDATE [dbo].[Regla]
	SET EjercicioMayor = 2018, ReformaMayor = 4, IdTipoFlujo = NULL
	WHERE IdRegla = 568231 AND IdFormulario = 7
	AND IdEntidad = 700 AND IdPropiedadAsociada = 219365

	INSERT INTO dbo.AtributoControl VALUES(700, 7, 719005, 'LlaveUrlConsulta', 'urlConsultaEstado', 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(700, 7, 719005, 'MensajeValidacion', 'Validando', 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(700, 7, 719005, 'MensajeExito', 'Correcto', 5, 1000)
	INSERT INTO dbo.AtributoControl VALUES(700, 7, 719005, 'MensajeFallo', 'Fallido', 5, 1000)

	 INSERT INTO [dbo].[Regla]([IdEntidad],[IdFormulario],[IdTipoRegla],[DefinicionRegla],[MensajeError],[MensajeAyuda],[Orden],[EjecutarAlInicio],[IdEjecutarRegla],[ValidaSeccion]
	,[IdPropiedadAsociada],[LimpiarCampoNoValido],[MensajeErrorEnDialogo],[EjecutaServer],[MensajeAdvertencia],[EjecutarEnGridVacio],[ParticipaEnGrid],[EjecutarEnSubRegimenes],[ValidaSeccionAlEntrar]
	,[EjecutarSiempre],[ExcluirEnGrid],[EjercicioMenor],[EjercicioMayor],[OmitirEnSinCalculo],[IdPropiedadesDisparador],[Editable],[ReformaMenor],[ReformaMayor],[EjecutarEnDejarSinEfecto],[EjecutarEnGridEdicion]
	,[EjecutarEnSelector],[MensajeEnDialogoConfirmacion],[IdTipoFlujo])
VALUES(700,7,2,'$219365=SI($219345>$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318,0,$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318-$219345)'
	,NULL,NULL,NULL,1,NULL,NULL,219365,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,NULL,2018,2100,1,NULL,1,5,1000,NULL,NULL,NULL,NULL,'0,2')

-----bug 2439----
UPDATE dbo.AtributoControl
SET Valor = 13
WHERE IdControlFormulario = 711096 and IdEntidad= '700' and IdFormulario = 7 and IdAtributo = 72447
--bug 2438-----
INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor, IdTipoFlujo)
VALUES(700, 7, 4, '$219365=SI($219345>$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318,0,$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318-$219345)',NULL, 1, 219365, 0, 2018, 2100, 5, 1000, '1')

INSERT INTO dbo.Regla (IdEntidad, IdFormulario, IdTipoRegla, DefinicionRegla, MensajeError, EjecutarAlInicio, IdPropiedadAsociada, ParticipaEnGrid, EjercicioMenor, EjercicioMayor, ReformaMenor, ReformaMayor, IdTipoFlujo) 
VALUES(700, 7, 2, '$219365=SI($219345>$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318,0,$219153+$219156+$219194+$219197+$219200+$219203+$219206+MAX($219234,0)+$219241+$219242+$219248+$219318-$219345)',NULL, 1, 219365, 0, 2018, 2100, 5, 1000, '0,2')

UPDATE dbo.Regla
SET ReformaMayor = 4, EjercicioMayor = 1000
WHERE IdRegla = '568231' and IdEntidad= 700 and IdFormulario=7

-----bug 2441----
UPDATE dbo.Regla
SET DefinicionRegla = 'SI(ESNULO($219918),OCULTAR($219948),MOSTRAR($219948))', IdTipoFlujo='0,2'
WHERE IdRegla = '584559' and IdEntidad= 700 and IdFormulario=7

---bug 2382----
UPDATE dbo.Control
SET ReformaMayor = 2017
WHERE idControlformulario=704004 and IdEntidad= 700 and IdFormulario=7

-----bug 2439----
UPDATE dbo.AtributoControl
SET Valor = 13
WHERE IdControlFormulario = 711094 and IdEntidad= '700' and IdFormulario = 7 and IdAtributo = 71209

---bug 2426----
INSERT INTO dbo.AtributoPropiedad VALUES(708, '219339', 'AyudaEnLinea','Respecto al est�mulo fiscal por contratar  personas con discapacidad y/o adultos mayores, se deber� anotar el monto equivalente al 100% del Impuesto Sobre la Renta retenido y enterado de estos trabajadores; de conformidad con lo se�alado en la LISR vigente.</BR>Por lo que hace al est�mulo fiscal por contratar  personas con discapacidad y/o adultos mayores, a que se refieren el decreto de 26 de dic de 2013, se deber� anotar un monto equivalente al 25% del salario efectivamente pagado a dichas personas. este est�mulo no podr� aplicarse en el mismo ejercicio junto con el  establecido en la LISR vigente respecto de las mismas personas.</BR>Para 2016, esta disposici�n se establece en la LIF del el mismo ejercicio.</BR>El est�mulo fiscal por contratar  personas con discapacidad y/o adultos mayores consiste en el equivalente al 25 % del salario efectivamente pagado a las personas de 65 a�os y m�s (LISR vigente).', 2018, 2100, 5, 1000, null)

UPDATE dbo.AtributoPropiedad
SET ReformaMayor = 4
WHERE IdAtributo=54475 and IdPropiedad=219339 and IdEntidad=708

----2427----
INSERT INTO dbo.AtributoControl VALUES(700, 7, 708049, 'SoloNumerosPositivos', null, 5, 1000)
INSERT INTO dbo.AtributoControl VALUES(700, 7, 708049, 'ValidaLongitud', 13, 5, 1000)




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
