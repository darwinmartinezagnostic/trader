if (Usuarios.find().count() === 0){
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Carmen Teresa', apellidos:'Aparicio Aldana', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Jarruiz Jesús', apellidos:'Ruiz Silvera', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Darwin Joel', apellidos:'Martinez Lugo', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
};


if (LogEjecucionTrader.find().count() === 0){
	LogEjecucionTrader.insert({fecha: new Date(), id:1 ,descripcion:'Trader iniciado'});
}
else {
	var max_id_ejecucion = LogEjecucionTrader.aggregate([{ $group: {_id: "MAX_ID", max_id : { $max: "$id"}}}]);
	var v_val_ejecucion = max_id_ejecucion;
	for (C = 0, tamanio_val_ejecucion = max_id_ejecucion.length; C < tamanio_val_ejecucion; C++) {
		var obj_id_act = max_id_ejecucion[C];
		var id_act = obj_id_act.max_id;
		var nuevo_id = id_act+1;
		LogEjecucionTrader.insert({fecha: new Date(), id:nuevo_id ,descripcion:'Trader Reiniciado'});
	};
};

if (PeriodoMuestreo.find().count() === 0){
	PeriodoMuestreo.insert({fecha_ingreso: new Date(), periodo1 :'5 minutos', periodo2 : 'Hora', periodo3 : 'Diario', periodo4 : 'Semanal', periodo5 : 'Mensual', periodo6 : 'Anual'});
};

if (Parametros.find().count() === 0){
	Parametros.insert({ fecha : new Date(), dominio : 'ejecucion', nombre : 'EjecInicial', estado : true, valor: { muestreo : { periodo_inicial : true }},descripcion : 'Ejecucíón Inicial del Trader' });
	Parametros.insert({ fecha : new Date(), dominio : 'ejecucion', nombre : 'Depuracion', estado : true, valor: 1 ,descripcion : 'Activar o desactivar las banderas creadas para rasterar errores de ejecución en los diferentes módulos' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'MaxApDep', estado : true, valor: 3 ,descripcion : 'Límite de Apreción (Moneda a comprar) o Depreciación (Moneda en Venta)' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'CantidadTraders', estado : true, valor: 1 ,descripcion : 'Máximo de Registros Traders consultados a HitBTC' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'PropPorcInver', estado : true, valor: { p11 : 1, p12 : 0.7, p22 : 0.3, p13 : 0.6, p23 : 0.3, p33 : 0.1 }, descripcion : 'Proporción de Procentajes de inversión según cantdad de tipos de cambio disponibles para compra' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'CantidadTransaccionesAtras', estado : true, valor: 300 ,descripcion : 'Cantidad de ID transacciones de traders hacia atrás que consultarán para determinar por primera vez el valor de la transacción Anterior' });
	Parametros.insert({ fecha : new Date(), dominio : 'limites', nombre : 'ValorMinimoTransferencia', estado : true, valor: 0.000000001 ,descripcion : 'Valor mínimo de para transferir entre los tipos de saldo Cuenta - trader y viceversa' });
	Parametros.insert({ fecha : new Date(), dominio : "robot", nombre : "test", estado : true, valor : 1, descripcion : "Simula la compra de monedas" });
	Parametros.insert({ fecha : new Date(), dominio : "prueba", nombre : "saldo", estado : true, valor : 1, descripcion : "Saldo ficticio para ciertas monedas" });
};