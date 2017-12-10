if (Usuarios.find().count() === 0){
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Carmen Teresa', apellidos:'Aparicio Aldana', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Jarruiz Jesús', apellidos:'Ruiz Silvera', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
	Usuarios.insert({fecha_ingreso: new Date(), nombres:'Darwin Joel', apellidos:'Martinez Lugo', ci:12345, tip_usuario:'inversionista', monederos:{ xmr:'ABDC', btc:'AB', bcn:'CDFBGFB'}});
};


/*
if (OperacionesCompraVenta.find().count() === 0){
	OperacionesCompraVenta.insert({fecha: new Date(), id_hitbtc:1 ,simbolo:'XMR', precio:0.0015, tipo_operacion:'COMPRA', tasa_liquidez: 1, proporcion_liquidez:1});
	OperacionesCompraVenta.insert({fecha: new Date(), id_hitbtc:5 ,simbolo:'XMR', precio:0.0015, tipo_operacion:'COMPRA', tasa_liquidez: 1, proporcion_liquidez:1});
	OperacionesCompraVenta.insert({fecha: new Date(), id_hitbtc:10 ,simbolo:'XMR', precio:0.0015, tipo_operacion:'COMPRA', tasa_liquidez: 1, proporcion_liquidez:1});
	OperacionesCompraVenta.insert({fecha: new Date(), id_hitbtc:2 ,simbolo:'BTC', precio:0.0015, tipo_operacion:'VENTA', tasa_liquidez: 1, proporcion_liquidez:1});
	OperacionesCompraVenta.insert({fecha: new Date(), id_hitbtc:3 ,simbolo:'BCN', precio:0.0015, tipo_operacion:'COMPRA', tasa_liquidez: 1, proporcion_liquidez:1});
};

*/

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
		Ejecucion_Trader.insert({fecha: new Date(), id:nuevo_id ,descipcion:'Trader Reiniciado'});
	};
};
