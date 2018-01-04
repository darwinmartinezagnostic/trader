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


if (Ejecucion_Trader.find().count() === 0){
	Ejecucion_Trader.insert({ fecha_ejecucion_inicial : new Date() , muestreo : { periodo_inicial : true } });
};


if (PeriodoMuestreo.find().count() === 0){
	PeriodoMuestreo.insert({fecha_ingreso: new Date(), periodo1 :'5 minutos', periodo2 : 'Hora', periodo3 : 'Diario', periodo4 : 'Semanal', periodo5 : 'Mensual', periodo6 : 'Anual'});
};
/*
if (Parametros.find().count() === 0){
	Parametros.insert({fecha_ingreso: new Date(), dominio : 'jobs', estado : true, descripcion : 'Estado de activación de los Job de ejecución en segúndo plano' });
};

*/