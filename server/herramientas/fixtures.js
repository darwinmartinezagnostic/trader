if (Usuarios.find().count() === 0){
	Usuarios.insert({ _id : '1', fecha_ingreso: new Date(), nombres:'Carmen Teresa', apellidos:'Aparicio Aldana', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({ _id : '2', fecha_ingreso: new Date(), nombres:'Jarruiz Jesús', apellidos:'Ruiz Silvera', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({ _id : '3', fecha_ingreso: new Date(), nombres:'Darwin Joel', apellidos:'Martinez Lugo', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
};

if (PeriodoMuestreo.find().count() === 0){
	PeriodoMuestreo.insert({ _id : '1', fecha_ingreso: new Date(), periodo1 :'5 minutos', periodo2 : 'Hora', periodo3 : 'Diario', periodo4 : 'Semanal', periodo5 : 'Mensual', periodo6 : 'Anual'});
};

if (Parametros.find({ dominio : 'Ejecucion' }).count() === 0){
	Parametros.insert({ fecha : new Date(), dominio : 'Ejecucion', nombre : 'TipoEjecucion', estado : true, valor: 1 ,descripcion : 'Tipo de Ejecucíón del Trader, 0 = Normal, 1 = Analisis; Realiza una serie de ejecuciones modificando automáticamente los parámetros de ejecución según lo indicado en la colección ParametrosDeAnalisis' });
	Parametros.insert({ fecha : new Date(), dominio : 'Ejecucion', nombre : 'ModoEjecucion', estado : true, valor: 1 ,descripcion : 'Modo de Ejecucíón del Trader, 0 = Pruebas, 1 = SecuenciaInicial, 2 = SecuenciasSecundarias' });
	Parametros.insert({ fecha : new Date(), dominio : 'Ejecucion', nombre : 'Depuracion', estado : true, valor: 1 ,descripcion : 'Activar o desactivar las banderas creadas para rasterar errores de ejecución en los diferentes módulos' });
};

if (Parametros.find({ dominio : 'Comercio' }).count() === 0){
	Parametros.insert({ fecha : new Date(), dominio : 'Comercio', nombre : 'TipoCalculoInversion', estado : true, valor: 1 ,descripcion : 'Tipo de Calculo de inversion del Trader, 0 = Promedio, 1 = Orden, 2 = Volumen; cambiar el modo de calculo de inversión en las compras' });
};

if (Parametros.find({ dominio : 'limites' }).count() === 0){
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'MaxApDep', estado : true, valor: 1 ,descripcion : 'Límite de Apreción (Moneda a comprar) o Depreciación (Moneda en Venta)' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'TimeoutEjecucion', estado : true, valor: 3 ,descripcion : 'Límite de Timeout de consultas al API de HitBTC' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'CantidadTraders', estado : true, valor: 1 ,descripcion : 'Máximo de Registros Traders consultados a HitBTC' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'PropPorcInver', estado : true, valor: { p11 : 1, p12 : 0.7, p22 : 1, p13 : 0.7, p23 : 0.6, p33 : 1 }, descripcion : 'Proporción de Procentajes de inversión según cantdad de tipos de cambio disponibles para compra' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'CantidadTransaccionesAtras', estado : true, valor: 300 ,descripcion : 'Cantidad de ID transacciones de traders hacia atrás que consultarán para determinar por primera vez el valor de la transacción Anterior' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'ValorMinimoTransferencia', estado : true, valor: 0.00000000000001 ,descripcion : 'Valor mínimo de para transferir entre los tipos de saldo Cuenta - trader y viceversa' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'CantidadMinimaMuestreo', estado : true, valor : 3 , descripcion : 'Valor de muestreos mínimos de cada moneda antes invertir por defecto = 3' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'CantMaximaEjecucion', estado : true, valor : 9999999999 , descripcion : 'Valor maximo de ejecución de los job de seguimiento, si el valor es = 9999999999 entonces la ejecución será infinita' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'CantMaximaDeCompras', estado : true, valor : 9999999999 , descripcion : 'Valor maximo de ejecución de compras a realizar, si el valor es = 9999999999 entonces la ejecución será infinita' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'LimiteContEstadoActivo', estado : true, valor : 5 , descripcion : 'Valor máximo de Contador de estado Activo' });
    Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'LimiteContAuxiliarEstadoActivo', estado : true, valor : 2 , descripcion : 'Valor máximo de Contador Auxiliar de estado Activo' });
    Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'LimiteContEstadoVerificando', estado : true, valor : 10 , descripcion : 'Valor máximo de Contador de estado Verificando' });
    Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'LimiteContAuxiliarEstadoVerificando', estado : true, valor : 3 , descripcion : 'Valor máximo de Contador Auxiliar de estado Verificando' });
    Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'LimiteMaximoMonedasInvertir', estado : true, valor: 1 ,descripcion : 'Máxima Cantidad de monedas en la cual se puede invertir' });
    Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'TopePerdida', estado : true, valor: 20 ,descripcion : 'Tope Máximo de perdida' });
    Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'TopeCapital', estado : true, valor: 1000 ,descripcion : 'Tope Máximo de Capital en tradeo' });
    Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'TopeGanancia', estado : true, valor: 3000 ,descripcion : 'Tope Máximo de Ganancias alancanzadas antes de enviar a la cartera de los usuario' });
};

if (Parametros.find({ dominio : 'Prueba' }).count() === 0){
	Parametros.insert({ fecha : new Date(), dominio : 'Prueba', nombre : 'robot', estado : true, valor : 1, descripcion : '1 = activo, 0 = Inactivo - Simula la compra de monedas' });
	Parametros.insert({ fecha : new Date(), dominio : 'Prueba', nombre : 'saldo', estado : true, valor : 1, descripcion : ' 1 = activo, 0 = Inactivo - Restaura los valores de Saldo de todas las monedas y asigna Saldo ficticio Inicial' });
	Parametros.insert({ fecha : new Date(), dominio : 'Prueba', nombre : 'ResetDatosIniciales', estado : true, valor : 1, descripcion : ' 1 = activo, 0 = Inactivo - Borrar los datos Iniciales de monedas, tipos de cambio e inicia los valores al estado inicial' });
	Parametros.insert({ fecha : new Date(), dominio : 'Prueba', nombre : 'ResetParametrosAnalisis', estado : true, valor : 1, descripcion : ' 1 = activo, 0 = Inactivo - Reactiva los parámetros de Analisis nuevo estados true' });
	Parametros.insert({ fecha : new Date(), dominio : 'Prueba', nombre : 'ResetResultadoAnalisis', estado : true, valor : 1, descripcion : '1 = activo, 0 = Inactivo - Borra lo datos de analisis para cada nuevo set de pruebas' });
};

if (Parametros.find({ dominio : 'Periodos' }).count() === 0){
	Parametros.insert({ fecha : new Date(), dominio : 'Periodos', nombre : 'PeriodoMuestreo', estado : true, valor: { periodo : { '1' : '5 minutos', '2' : 'Hora', '3' : 'Diario', '4' : 'Semanal', '5' : 'Mensual', '6' : 'Anual'} }, descripcion : 'Periodos de consultas de tendencias' });
};

const NombresSecuenciasRobot = ['IdOrdenHBTC']

for ( CSR = 0, TSR = NombresSecuenciasRobot.length; CSR < TSR; CSR++ ) {
	NombreSecuenciasRobot = NombresSecuenciasRobot[CSR]
	if ( SecuenciasRobot.find({ _id: NombreSecuenciasRobot}).count() === 0){
		SecuenciasRobot.insert({ _id: NombreSecuenciasRobot, secuencia: 0 });
	};
}

const NombresSecuenciasGlobales = ['IdGanPerdLocal', 'IdGanPerdLote', 'IdHistTrans', 'IdLog', 'IdAnalisis', 'IdParamAnalisis', 'IdParamAnalisisLote', 'IdHistTransfer']

for ( CSG = 0, TSG = NombresSecuenciasGlobales.length; CSG < TSG; CSG++ ) {
	NOMBRE = NombresSecuenciasGlobales[CSG]
	if ( SecuenciasGlobales.find({ _id: NOMBRE}).count() === 0){
		SecuenciasGlobales.insert({ _id: NOMBRE, secuencia: 0 });
	};
}

if (LogEjecucionTrader.find().count() === 0){
	LogEjecucionTrader.insert({fecha: new Date(), id:1 ,descripcion:'Trader iniciado'});
}
else {
	var max_id_ejecucion = LogEjecucionTrader.aggregate([{ $group: {_id: 'MAX_ID', max_id : { $max: '$id'}}}]);
	var v_val_ejecucion = max_id_ejecucion;
	for (C = 0, tamanio_val_ejecucion = max_id_ejecucion.length; C < tamanio_val_ejecucion; C++) {
		var obj_id_act = max_id_ejecucion[C];
		var id_act = obj_id_act.max_id;
		var nuevo_id = id_act+1;
		LogEjecucionTrader.insert({fecha: new Date(), id:nuevo_id ,descripcion:'Trader Reiniciado'});
	};
};