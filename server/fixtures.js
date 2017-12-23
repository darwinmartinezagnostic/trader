if (Usuarios.find().count() === 0){
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Carmen Teresa', apellidos:'Aparicio Aldana', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Jarruiz Jesús', apellidos:'Ruiz Silvera', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Darwin Joel', apellidos:'Martinez Lugo', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
};


if (Ejecucion_Trader.find().count() === 0){
	Ejecucion_Trader.insert({fecha: new Date(), id:1 ,descipcion:'Trader iniciado'});
}
else {
	var max_id_ejecucion = Ejecucion_Trader.aggregate([{ $group: {_id: "MAX_ID", max_id : { $max: "$id"}}}]);
	var v_val_ejecucion = max_id_ejecucion;
	for (C = 0, tamanio_val_ejecucion = max_id_ejecucion.length; C < tamanio_val_ejecucion; C++) {
		var obj_id_act = max_id_ejecucion[C];
		var id_act = obj_id_act.max_id;
		var nuevo_id = id_act+1;
		Ejecucion_Trader.insert({fecha: new Date(), id:nuevo_id ,descripcion:'Trader Reiniciado'});
	};
};


if (PeriodoMuestreo.find().count() === 0){
	PeriodoMuestreo.insert({fecha_ingreso: new Date(), periodo1 : 'Inicial', periodo2 :'5 minutos', periodo3 : 'Hora', periodo4 : 'Diario', periodo5 : 'Semanal', periodo6 : 'Mensual', periodo7 : 'Anual'});
};