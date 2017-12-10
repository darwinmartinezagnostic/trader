import { Meteor } from 'meteor/meteor';

//const API_HITBTC1 = 'https://api.hitbtc.com/api/1/';
const zona_horaria = "GTC";
const API_HITBTC2 = 'https://api.hitbtc.com/api/2/';
const key = '545b348a99d2cbaaa75e8b4725d928e1';
const secret = '373e72e68ffdd95d0ecd42df1efd338a';
const apikey = key+':'+secret;
const public = API_HITBTC2+"public/";
const tradeo = API_HITBTC2+"trading/";
const cuenta = API_HITBTC2+"account/";
const historial = API_HITBTC2+"history/";
const ordenes = API_HITBTC2+"order";
//**************************************************
//**************************************************
// API Public
const monedas = [public]+"currency";
const simbolos = [public]+"symbol";
// API Trading
const blc_tradeo = [tradeo]+"balance";
const comisiones = [tradeo]+"fee";
//const ordenes = [tradeo]+"order";
// API Account
const blc_cuenta = [cuenta]+"balance";
const transacciones = [cuenta]+"transactions";
const cripto_cuenta= [cuenta]+"crypto/";
const reiros= [cripto_cuenta]+"withdraw";
const cart_dep = [cripto_cuenta]+"address";
const nueva_transferencia = [cuenta]+"transfer";
// API Trading History
const HistTradeo = [historial]+"trades";
const HistOrdenes = [historial]+"order";
// CANTIDADES DE REGISTROS
const cant_traders = 10;
const cant_transacciones = 3;
// ACTIVACION DE GUARDADO DEBUG DEL CÓDIGO EN DB
const debug_activo = 1;


//**************************************************
Meteor.startup(() => {
  // code to run on server at startup
});


Meteor.methods({

	'ConexionGet':function(V_URL) {
		var V_OBTENIDO = HTTP.get( V_URL,{auth:apikey});
		return V_OBTENIDO;
	},

	'ConexionPost':function(V_URL,datos) {
		var V_OBTENIDO = HTTP.post( V_URL,{auth:apikey,data:datos});
		return V_OBTENIDO;
	},

	'ConexionPut':function(V_URL,datos) {
		var V_OBTENIDO = HTTP.put( V_URL,{auth:apikey,data:datos});
		return V_OBTENIDO;
	},

	'ConexionDel':function(V_URL,datos) {
		var V_OBTENIDO = HTTP.del( V_URL,{auth:apikey,data:datos});
		return V_OBTENIDO;
	},

	'Conexion':function(V_tipo_conexion, V_URL, datos) {
		var V_OBTENIDO = HTTP.V_tipo_conexion( V_URL,{auth:apikey,data:datos});
		return V_OBTENIDO;
	},
	
	'ListaMonedas':function(){
		
		console.log('*************************************************************************************');
		console.log('############################################');
		console.log(' Monedas que se están tradeando en HITBTC');				

		var moneda = Meteor.call("ConexionGet", monedas);		
		var mons = (moneda.data);

		for ( a = 0, len = mons.length ; a < len; a++) {
			var mon = mons[a];
			console.log('    NOMENCLATURA: ', mon.id);
			console.log('    NOMBRE DE MONEDA: ', mon.fullName);
			console.log(' ');

			Monedas.insert({ moneda : mon.id, nombre_moneda : mon.fullName });
		};

		
		console.log('############################################');
	},

	'SaldoActualMonedas':function(){
		
		if ( debug_activo === 1) {
			nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
			Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : 'Verificando las monedas que tienen saldo para tradear '});

			console.log(' Verificando las monedas que tienen saldo para tradear');
			console.log(' ');
		};
		
		var v_blc_tradeo = Meteor.call("ConexionGet", blc_tradeo);
		var BlcMonedasTradeo=(v_blc_tradeo.data);
		var v_blc_cuenta = Meteor.call("ConexionGet", blc_cuenta);
		var BlcCuenta = (v_blc_cuenta.data);
		var c_vect_BlcTrad = 0
		var c_vect_BlcCuent = 0


		for (cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++) {
			
			for (cbct = 0, tam_bct = BlcCuenta.length; cbct < tam_bct; cbct++) {	
				var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
					var moneda_analizarBT = v_BlcMonedasTradeo.currency;
					var sald_moneda_analizarBT = v_BlcMonedasTradeo.available;
				var v_BlcCuenta = BlcCuenta[cbct];
					var moneda_analizarCT = v_BlcCuenta.currency;
					var sald_moneda_analizarCT = v_BlcCuenta.available;

				if ( sald_moneda_analizarBT > 0 && sald_moneda_analizarCT > 0 && moneda_analizarCT === moneda_analizarBT) {
					console.log('Estoy en el if 1 moneda', moneda_analizarCT);
					var v_moneda_saldo = Monedas.find({ moneda : moneda_analizarCT }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
					var v_sald_moneda = v_moneda_saldo[0];

					//Monedas.save({ moneda : v_sald_moneda.moneda, nombre_moneda : v_sald_moneda.nombre_moneda , saldo : { tradeo : v_BlcMonedasTradeo.available, cuenta : v_BlcCuenta.available  }});
					Monedas.update({ _id : v_sald_moneda._id ,moneda : v_sald_moneda.moneda},{$set:{saldo : { tradeo : { activo: Number(v_BlcMonedasTradeo.available), reserva: Number(v_BlcMonedasTradeo.reserved) },  cuenta : { activo : Number(v_BlcCuenta.available), reserva: Number(v_BlcCuenta.reserved) } }}});


					console.log('############################################');
					console.log('            Saldo disponible');
					console.log('############################################');
					console.log(' ********* ', ' MONEDA: ',v_sald_moneda.moneda, ' ********* ');
					console.log('    SALDO TRADEO: ',v_BlcMonedasTradeo.available);
					console.log('    SALDO TRADEO RESERVA: ',v_BlcMonedasTradeo.reserved);
					console.log('    SALDO EN CUENTA: ',v_BlcCuenta.available);
					console.log('    SALDO CUENTA RESERVA: ',v_BlcCuenta.reserved);
					console.log('############################################');
					console.log(' ');


				}
				else if (sald_moneda_analizarBT > 0 && sald_moneda_analizarCT !== 0 && moneda_analizarCT === moneda_analizarBT) {
					console.log('Estoy en el if 2 moneda', moneda_analizarCT);
					var v_moneda_saldo = Monedas.find({ moneda : moneda_analizarCT }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
					var v_sald_moneda = [0];

					Monedas.update({ _id : v_sald_moneda._id ,moneda : v_sald_moneda.moneda},{$set:{saldo : { tradeo : { activo: v_BlcMonedasTradeo.available, reserva: v_BlcMonedasTradeo.reserved },  cuenta : { activo : v_BlcCuenta.available, reserva: v_BlcCuenta.reserved } }}});

					console.log('############################################');
					console.log('            Saldo disponible');
					console.log('############################################');
					console.log(' ********* ', ' MONEDA: ',v_sald_moneda.moneda, ' ********* ');
					console.log('    SALDO TRADEO: ',v_BlcMonedasTradeo.available);
					console.log('    SALDO TRADEO RESERVA: ',v_BlcMonedasTradeo.reserved);
					console.log('    SALDO EN CUENTA: ',v_BlcCuenta.available);
					console.log('    SALDO CUENTA RESERVA: ',v_BlcCuenta.reserved);
					console.log('############################################');
					console.log(' ');
				}
				else if (sald_moneda_analizarBT !== 0 && sald_moneda_analizarCT > 0 && moneda_analizarCT === moneda_analizarBT) {
					console.log('Estoy en el if 3 moneda', moneda_analizarCT);
					var v_moneda_saldo = Monedas.find({ moneda : moneda_analizarCT }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
					var v_sald_moneda = [0];

					Monedas.update({ _id : v_sald_moneda._id ,moneda : v_sald_moneda.moneda},{$set:{saldo : { tradeo : { activo: v_BlcMonedasTradeo.available, reserva: v_BlcMonedasTradeo.reserved },  cuenta : { activo : v_BlcCuenta.available, reserva: v_BlcCuenta.reserved } }}});

					console.log('############################################');
					console.log('            Saldo disponible');
					console.log('############################################');
					console.log(' ********* ', ' MONEDA: ',v_sald_moneda.moneda, ' ********* ');
					console.log('    SALDO TRADEO: ',v_BlcMonedasTradeo.available);
					console.log('    SALDO TRADEO RESERVA: ',v_BlcMonedasTradeo.reserved);
					console.log('    SALDO EN CUENTA: ',v_BlcCuenta.available);
					console.log('    SALDO CUENTA RESERVA: ',v_BlcCuenta.reserved);
					console.log('############################################');
					console.log(' ');
				}


			};


		};


	},

	'ListaSimbolos':function(VALOR){
		var traders = Meteor.call("ConexionGet", simbolos);
		var mon_camb =(traders.data);
		
		//console.log(mon_camb);


		for (j = 0, tamanio_mon_camb = mon_camb.length; j < tamanio_mon_camb; j++) {

			var mon_c = mon_camb[j];
			

			switch(VALOR){
				case 1:
					// HACE UNA CONSULTA GENREAL DE LOS SIMBOLO EXISTENTES
						console.log('*************************************************************************************');
						console.log('############################################');
						
						console.log(' Símbolos que se están tradeando en HITBTC');
						
						console.log(' ********* ', mon_c.id, ' ********* ');
						console.log('    MONEDA BASE: ', mon_c.baseCurrency);
						console.log('    MONEDA DE COTIZACIÓN: ', mon_c.quoteCurrency);
						console.log(' ');					
					    break;
				case 2:
					// ESTO ES PARA VERIFICAR LA TENDECIA DE LA MONEDAS


					Simbolos.insert({simbolo : mon_c.id, moneda_base :  mon_c.baseCurrency, moneda_cotizacion : mon_c.quoteCurrency});

			
					
					
					break;
				default:
							console.log(' Valor de tipo consulta no definida ');
			}
		};
	},

	'LibroDeOrdenes':function(){

		console.log('*************************************************************************************');
		console.log(' Devuelve los datos reales de los valores compra y venta en negociación - (Libro de Ordenes)');
		var traders = Meteor.call("ConexionGet", simbolos);
		var mon_trads =(traders.data);

		
		for (j = 0, len = mon_trads.length; j < len; j++) {
			var mon_trad = mon_trads[j];

			if ( mon_trad === undefined ) {
				console.log(' No hay Valores en el libro de Ordenes asociados a este Símbolo');
			}
			else {
				var url_compras_ventas = [public]+['ticker']+'/'+[mon_trad.id];
				var compras_ventas = Meteor.call("ConexionGet", url_compras_ventas);
				var v_compras_ventas = (compras_ventas.data);

				
				
				console.log('\n ');
				console.log('############################################');
				console.log('    Verificando Moneda: ',v_compras_ventas.symbol);
				console.log(' Valor de Oferta en Venta: ', v_compras_ventas.ask);
				console.log(' Valor de Oferta de Compra: ', v_compras_ventas.bid);
				console.log(' Marca de tiempo: ', v_compras_ventas.timestamp);
				console.log('############################################');
			}
			
		};
	},
/*
	'ListaTradeoActual':function(){
		
		console.log('*************************************************************************************');
		console.log(' Devuelve los datos Historicos de Tradeo de todas las criptocurrencias negociadas - Esto nos sirve para verificar los valores ascendente. (Order Book)');
		console.log(' ');
		var traders = Meteor.call("ConexionGet", simbolos);
		var mon =(traders.data);
		var mon_trads =  mon;
		
		const url_tradeos_parcial= ['from=0&by=trade_id&sort=desc&start_index=0&limit=']+[cant_traders]+['&format_numbers=number'];


		


		for (j = 0, len = mon_trads.length; j < len; j++) {
		    var mon_trad = mon_trads[j];		    
		    var url_tradeos_completa = [public]+['trades/']+[mon_trad.id]+['?']+[url_tradeos_parcial];
		    var v_tradeos = Meteor.call("ConexionGet", url_tradeos_completa);
		    var v_trad = (v_tradeos.data[0]);
		    var url_comision = [comisiones]+['/']+[mon_trad.id];
		    var comision = Meteor.call("ConexionGet", url_comision);
		    var v_comision = (comision.data)

			console.log('############################################');
			console.log('    Verificando Símbolo tradeo: ',mon_trad.id);
			console.log('############################################');

			if ( v_trad === undefined ) {
				console.log(' No hay Valores asociados a este Símbolo de tradeo');
			}
			else {
				console.log(' LINEA DE TIEMPO: ',v_trad.timestamp);
				console.log(' ID: ',v_trad.id);
				console.log(' PRECIO: ',v_trad.price);
				console.log(' CANTIDAD: ',v_trad.quantity);

				switch (v_trad.side){
					case 'buy':
						console.log(' TIPO OPERACIÓN: ','COMPRA');
						break;
					case 'sell':
						console.log(' TIPO OPERACIÓN: ','VENTA');
						break;
					default:
						console.log(' TIPO OPERACIÓN: ',v_trad.side);
				}

				
				

			}
			
			console.log(' *******    VALORES DE COMISIONES    *******');

			if ( v_comision === undefined ) {
				console.log(' No hay Valores de comisión asociados a este Símbolo de tradeo');
			}
			else {
				console.log(' TASA DE LIQUIDEZ: ', v_comision.takeLiquidityRate);
				console.log(' PROPORCIÓN DE LIQUIDEZ: ', v_comision.takeLiquidityRate);
			}
			
			console.log('############################################');
			console.log(' ');

		};
		console.log('*************************************************************************************');



		console.log('############################################');
		console.log('    ********* FIN DE EJECUCIÓN ********* ');
		console.log('############################################');
	},
*/

	'ConsultarTransaciones':function(){
		
		//para verificar las transaccion solo por monedas especifica se realiza la contruccion parcial de la URL anexando la abreviatura de la monedas ejemp "BTC"
		//const url_transaccion_parcial= ['currency=']+['<abreviatura moneda>']+['&sort=ASC&by=timestamp&limit=']+[cant_transacciones];

		//para verificar una transaccion en especifica se anexar al final de la contrccion de la URL ID de la transaccion ejemp "f672d164-6c6d-4bbd-9ba3-401692b3b404"
		// var Url_Transaccion = [transacciones]+'/'+[<varible de entrada = D de la transaccion>];
		console.log('*************************************************************************************');
		console.log(' Devuelve los datos Historicos de Transacciones realizadas en la cuenta');
		console.log(' ');
		var url_transaccion_parcial=['sort=ASC&by=timestamp&limit=']+[cant_transacciones];
		var url_transaccion_completa=[transacciones]+'?'+[url_transaccion_parcial];
		console.log(' Valor de URL transacciones:', url_transaccion_completa);
		var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
		var v_transaccion=(transaccion.data);

		//console.log(v_transaccion);

		for (k = 0, len = v_transaccion.length; k < len; k++) {
			console.log('############################################');
			transaccion = v_transaccion[k];
			console.log(' ID: ',transaccion.id);
			console.log(' INDICE: ',transaccion.index);
			console.log(' TIPO: ',transaccion.type);
			console.log(' STATUS: ',transaccion.status);
			console.log(' MONEDA: ',transaccion.currency);
			console.log(' MONTO: ',transaccion.amount);
			console.log(' FECHA CREACION: ',transaccion.createdAt);
			console.log(' FECHA DE CAMBIO: ',transaccion.updatedAt);
			console.log(' HASH: ',transaccion.hash);
			console.log('############################################');
			console.log(' ');
		};
	},

	'ConsultaOrdenesAbiertas':function(){
		
		console.log('*************************************************************************************');
		console.log(' Realiza consulta de Ordenes activas actualmente');
		console.log(' ');

		var url_orden = [ordenes];

		try
			{
				var ordenes = Meteor.call('ConexionGet',url_orden);
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
			}
	},

	'RetiroFondos':function(){ //Withdraw crypro
		
		console.log('*************************************************************************************');
		console.log(' Realiza el retiro de los fondos de las monedas en estado de reserva');
		console.log(' ');
	},

	'ConsultaRetiroFondos':function(){ //Commit withdraw crypro
		
		console.log('*************************************************************************************');
		console.log(' Realiza consulta de transacción retiro de los fondos en proceso');
		console.log(' ');
		
	},

	'CancelaRetiroFondos':function(){   //Rollback withdraw crypro
		
		console.log('*************************************************************************************');
		console.log(' Realiza cancelación de transacción retiro de los fondos en proceso');
		console.log(' ');
	},

	'ConsultaCarterasDeposito':function(){
		
		console.log('*************************************************************************************');
		console.log(' Consulta las carteras Activas a la cual se le puede asignar saldo');
		console.log(' ');
		
		var moneda = Meteor.call("ConexionGet", monedas);		
		//var mons_body = (moneda.body);
		var mons = (moneda.data);

		

		

		for ( a = 0, len = mons.length ; a < len; a++) {
			console.log('############################################');
			var mon = mons[a];

			console.log( 'Valor de mon', mon);

			console.log('    MONEDA: ', mon.id, '/', mon.fullName);

			var url_cartera_depositos = [cart_dep]+'/'+[mon.id];
			var v_cartera = Meteor.call("ConexionGet", url_cartera_depositos);	
			var cartera = (v_cartera.data);

			console.log('    DIRECCIÓN DE CARTERA: ', cartera.address);
			console.log(' ');
			console.log('############################################');
		};
	},

	'CrearCarterasDeposito':function(MONEDA){ //Create new deposit crypro address
		
		console.log('*************************************************************************************');
		console.log(' Crea las carteras Activas a la cual se le puede asignar saldo');
		console.log(' ');
		var url_NuevaCartera = [cart_dep]+'/'+[MONEDA]
		var NuevaCartera = Meteor.call("ConexionPost", url_NuevaCartera);
		var V_NuevaCartera = (NuevaCartera.data);
		console.log(' Nueva cartera: ', V_NuevaCartera.address);
	},

	'TransferirfondosReservaTradeo':function(MONEDA){  //Transfer amount to trading
		
		console.log('*************************************************************************************');
		console.log(' Realiza trasnferencia de fondos desde la reserva a tradeo y viseversa');
		console.log(' ');

		var NuevaCartera = Meteor.call("ConexionPost", transferencia);
	},

/////////////////////////////////TEST DARWIN///////////////////////////////////////////////////
/*
	'nuevaOrden':function(){  //POST
		
		console.log('*************************************************************************************');
		console.log('Creando una nueva orden');

		var datos = new Object();
		datos.symbol = 'SKINBTC';
		datos.side = 'buy';
		datos.quantity = '1000';
		datos.price = '122';

		var url = 'https://api.hitbtc.com/api/2/order';

		try
			{
				Meteor.call('ConexionPost',url,datos);
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
			}
		

		console.log('############################################');
		console.log('    ********* FIN DE EJECUCIÓN ********* ');
		console.log('############################################');

	},

*/
	'nuevaOrden':function(SIMBOLO,T_TRANSACCION,CANT_MONEDA,PRECIO){  //POST
		
		console.log('*************************************************************************************');
		console.log('Creando una nueva orden');

		var datos = new Object();
		datos.symbol = SIMBOLO;
		datos.side = T_TRANSACCION;
		datos.quantity = CANT_MONEDA;
		datos.timeInForce=zona_horaria;
		datos.price = PRECIO;

		var url_orden = [ordenes];

		try
			{
				var orden = Meteor.call('ConexionPost',url_orden,datos);
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
			}
	},
/*
	'putOrden':function(){  //PUT
		
		console.log('*************************************************************************************');
		console.log('Colocando una orden');

		var datos = new Object();
		datos.clientOrderId='12345678';
		datos.symbol='SKINBTC';
		datos.side='sell';
		datos.timeInForce='GTC';
		datos.quantity='100';
		datos.price='100';
		
		console.log(datos);
		
		var url = 'https://api.hitbtc.com/api/2/order/'+datos.clientOrderId;

		try
			{
				Meteor.call('ConexionPut',url,datos);
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
			}
		

		console.log('############################################');
		console.log('    ********* FIN DE EJECUCIÓN ********* ');
		console.log('############################################');
	},
*/
	'putOrden':function(N_ID__ORDEN_CLIENT,SIMBOLO,T_TRANSACCION,CANT_MONEDA,PRECIO){  //POST
		
		console.log('*************************************************************************************');
		console.log('Creando una nueva orden');

		var datos = new Object();
		datos.clientOrderId= N_ID__ORDEN_CLIENT;
		datos.symbol = SIMBOLO;
		datos.side = T_TRANSACCION;
		datos.timeInForce=zona_horaria;
		datos.quantity = CANT_MONEDA;
		datos.price = PRECIO;

		var url_orden = [ordenes];

		try
			{
				var orden = Meteor.call('ConexionPost',url_orden,datos);
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
			}
	},

	'borrarOrden':function(SIMBOLO){  //DELETE
		
		console.log('*************************************************************************************');
		console.log('Borrando una nueva orden');

		var datos = new Object();
		datos.symbol=SIMBOLO;

		var url = 'https://api.hitbtc.com/api/2/order';

		try
			{
				console.log(Meteor.call('ConexionDel',url,datos));
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
			}
	},
/*
	'borrarOrden':function(){  //DELETE
		
		console.log('*************************************************************************************');
		console.log('Borrando una nueva orden');

		var datos = new Object();
		datos.symbol='SKINBTC';

		var url = 'https://api.hitbtc.com/api/2/order';

		try
			{
				console.log(Meteor.call('ConexionDel',url,datos));
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
			}
		

		console.log('############################################');
		console.log('    ********* FIN DE EJECUCIÓN ********* ');
		console.log('############################################');
	},
*/
	
	'ConsultaTraderGuardados':function(SIMBOLO){

		if ( debug_activo === 1) {
			nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
			Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : [' ConsultaTraderGuardados consultando el último ID de Transaccion guarado del simbolo: ']+[SIMBOLO]});
			console.log(' Estoy en ConsultaTraderGuardados consultando el último ID de Transaccion guarado del simbolo: ', SIMBOLO);
		};
		


		if (OperacionesCompraVenta.find({simbolo:SIMBOLO}, {}).count() === 0){
			if ( debug_activo === 1) {
				nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
				Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['No hay datos en base de datos local de este simbolo: ']+[SIMBOLO]});
				console.log('No hay datos en base de datos local de este simbolo: ', SIMBOLO);
			};
		}
		else {
			if ( debug_activo === 1) {
				nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
				Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['Se encontraron datos guardados para este simbolo: ']+[SIMBOLO]+[' Verificando...']});
			};
			var VAL_SIMBOLO = OperacionesCompraVenta.aggregate( [{$match: {simbolo:SIMBOLO}}, {$group: {_id: "$simbolo", max_id : { $max: "$id_hitbtc"}} }]);

			var v_VAL_SIMBOLO = VAL_SIMBOLO;


			for (CTD = 0, tamanio_val_simbolo = v_VAL_SIMBOLO.length; CTD < tamanio_val_simbolo; CTD++) {
				nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
				var v_INT_VAL_SIMBOLO = v_VAL_SIMBOLO[CTD];

				console.log('Valor del ID: ', v_INT_VAL_SIMBOLO._id);
				console.log('Valor del ID: ', v_INT_VAL_SIMBOLO.max_id);


				if ( v_INT_VAL_SIMBOLO._id === undefined ) {
					Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['ID de Transaccion No pudo ser recuperado: ']+[v_INT_VAL_SIMBOLO.max_id]});
					if ( debug_activo === 1) {
						console.log(' ID de Transaccion No pudo ser recuperado: ', v_INT_VAL_SIMBOLO.max_id );
					};
					return v_INT_VAL_SIMBOLO.max_id;
				}
				else {
					if ( debug_activo === 1) {
					Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['ID de Transaccion recuperado con exito: ']+[v_INT_VAL_SIMBOLO.max_id]});
					};
					return v_INT_VAL_SIMBOLO.max_id;
				};

			};
		};

	},


	'Prueba':function(){
		
		


		try
			{
				var Monedas_Saldo = Monedas.find({ "saldo.cuenta.activo" : { $gt : 0 }},{} ).fetch();
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
				nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
				Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['Error: Se registró Error consultando el saldo de la base de datos local: "']});
				Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['Error: ']+[err.code]+[', Mensaje: ']+[err.message]+[', Descrición: ']+[err.description]});
			}



		for (CMS = 0, TMS = Monedas_Saldo.length; CMS < TMS; CMS++){
			var moneda_saldo =  Monedas_Saldo[CMS];

			console.log(" Valor de moneda_saldo: ", moneda_saldo);
			console.log(" ID: ": moneda_saldo._id);
			console.log(" moneda: ": moneda_saldo.moneda);
			console.log(" nombre_moneda: ": moneda_saldo.nombre_moneda);
			console.log(" saldo.tradeo.activo: ": moneda_saldo.saldo.tradeo.activo);
			console.log(" saldo.tradeo.reserva: ": moneda_saldo.saldo.tradeo.reserva);
			console.log(" saldo.cuenta.activo: ": moneda_saldo.saldo.cuenta.activo);
			console.log(" saldo.cuenta.reserva: ": moneda_saldo.saldo.cuenta.reserva);
		};
	},



	'ListaTradeoActual':function(SIMBOLO, VALOR_EJEC){
		
		console.log('*************************************************************************************');
		
		console.log(' ');
		var mon_trad =  SIMBOLO;

		//var mon_trad =  'XMR';

		//consultamos el último id_transaccion de este Símbolo
		if ( debug_activo === 1) {
			nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
			Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['"ListaTradeoActual" consultando último id_transaccio del simbolo: ']+[SIMBOLO]});

			console.log('"ListaTradeoActual" consultando último id_transaccio del simbolo: ', SIMBOLO);
		};


		

		var Val_trad = (Meteor.call('ConsultaTraderGuardados', mon_trad));
		var Val_trad_simbolo = (Val_trad);


		if (Val_trad_simbolo === undefined){
			if ( debug_activo === 1) {
				console.log('Estoy en el if de Val_trad_simbolo');
			};
			var url_tradeos_parcial= ['from=0&by=trade_id&sort=DESC&start_index=0&limit=']+[cant_traders]+['&format_numbers=number'];
		}
		else{
			if ( debug_activo === 1) {
				console.log('Estoy en el else de Val_trad_simbolo');
			};
			Val_trad_simbolo= Val_trad_simbolo+1;
			console.log('valor de Val_trad_simbolo: ', Val_trad_simbolo);
			var url_tradeos_parcial= ['from=0&by=trade_id&sort=DESC&by=id&from=']+[Val_trad_simbolo]+['&format_numbers=number'];
		};


		
		

				    
		var url_tradeos_completa = [public]+['trades/']+[mon_trad]+['?']+[url_tradeos_parcial];		

		
		try
			{
				var v_tradeos = Meteor.call("ConexionGet", url_tradeos_completa);
			}
		catch(err)
			{
				console.log("fallo la vaina "+err.message);
				nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
				Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['Error: Se registró Error ejecutando la siguiente URL del API de HitBTC: "']+[url_tradeos_completa]+['"']});
				Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ['Error: ']+[err.code]+[', Mensaje: ']+[err.message]+[', Descrición: ']+[err.description]});
			}

		var trad_mon = (v_tradeos.data);


		for (i = 0, tamanio_trad_mon = trad_mon.length; i < tamanio_trad_mon; i++) {

			var v_trad = trad_mon[i];
			var url_comision = [comisiones]+['/']+[mon_trad];
			var comision = Meteor.call("ConexionGet", url_comision);
			var v_comision = (comision.data);



			switch(VALOR_EJEC){
				case 1:
					console.log(' Devuelve los datos Historicos de Tradeo de todas las criptocurrencias negociadas - Esto nos sirve para verificar los valores ascendente. (Order Book)');
					console.log('############################################');
					console.log('    Verificando Símbolo tradeo: ',mon_trad);
					console.log('############################################');



					if ( v_trad === undefined ) {
						console.log(' No hay Valores asociados a este Símbolo de tradeo');
						Ejecucion_Trader.insert({fecha: new Date(), id : nuevo_id_ejecucion, descripcion : ' '});
					}
					else {
						console.log(' LINEA DE TIEMPO: ',v_trad.timestamp);
						console.log(' ID: ',v_trad.id);
						console.log(' PRECIO: ',v_trad.price);
						console.log(' CANTIDAD: ',v_trad.quantity);

						switch (v_trad.side){
							case 'buy':
								console.log(' TIPO OPERACIÓN: ','COMPRA');
								break;
							case 'sell':
								console.log(' TIPO OPERACIÓN: ','VENTA');
								break;
							default:
								console.log(' TIPO OPERACIÓN: ',v_trad.side);
						}
					}
						
					console.log(' *******    VALORES DE COMISIONES    *******');

					if ( v_comision === undefined ) {
						console.log(' No hay Valores de comisión asociados a este Símbolo de tradeo');
					}
					else {
						console.log(' TASA DE LIQUIDEZ: ', v_comision.takeLiquidityRate);
						console.log(' PROPORCIÓN DE LIQUIDEZ: ', v_comision.provideLiquidityRate);
					}
						
					console.log('############################################');
					console.log(' ');
					break;
				case 2:
					if ( v_trad === undefined ) {
						console.log('############################################');
						console.log(' No hay Valores asociados a este Símbolo de tradeo ',mon_trad);
						console.log('############################################');
					}
					else {
						console.log(' SIMBOLO: ',mon_trad);
						console.log(' LINEA DE TIEMPO: ',v_trad.timestamp);
						console.log(' ID: ',v_trad.id);
						console.log(' PRECIO: ',v_trad.price);

						switch (v_trad.side){
							case 'buy':
								console.log(' TIPO OPERACIÓN: ','COMPRA');
								var v_tipo_operacion = 'COMPRA';
								break;
							case 'sell':
								console.log(' TIPO OPERACIÓN: ','VENTA');
								var v_tipo_operacion = 'VENTA';
								break;
							default:
								console.log(' TIPO OPERACIÓN: ',v_trad.side);
						}

						OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, simbolo : mon_trad, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate });


					}						
					console.log('############################################');
					console.log(' ');
					break;
				default:
							console.log(' Valor de tipo consulta no definida ');
			}


		}; 
		
	},


	'Encabezado':function(){
		var fecha = new Date();
		nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
		Ejecucion_Trader.insert({fecha: new Date(), id:nuevo_id_ejecucion ,descripcion:'INICIANDO EJECUCIÓN'});
		console.log('############################################');
		console.log('  ********* INICIANDO EJECUCIÓN ********* ');
		console.log('############################################');
		console.log('        ',fecha);
		console.log('############################################');
		console.log(' ');
	},




	'FinEjecucion':function(){
		var fecha = new Date();
		nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
		Ejecucion_Trader.insert({fecha: new Date(), id:nuevo_id_ejecucion ,descripcion:'FIN DE EJECUCIÓN'});
		console.log(' ');
		console.log('############################################');
		console.log('    ********* FIN DE EJECUCIÓN ********* ');
		console.log('############################################');
		console.log('        ',fecha);
		console.log('############################################');
	},



	'CalculaTendencia':function(SIMBOLO, LINEA_TIEMPO, ID, PRECIO){

	},

	'CalculaIdEjecucion':function(){

		if (Ejecucion_Trader.find().count() === 0){
			Ejecucion_Trader.insert({fecha: new Date(), id:1 ,descripcion:'Trader iniciado'});
		}
		else {
			var max_id_ejecucion = Ejecucion_Trader.aggregate([{ $group: {_id: "MAX_ID", max_id : { $max: "$id"}}}]);
			var v_val_ejecucion = max_id_ejecucion;
			for (C = 0, tamanio_val_ejecucion = max_id_ejecucion.length; C < tamanio_val_ejecucion; C++) {
				var obj_id_act = max_id_ejecucion[C];
				var id_act = obj_id_act.max_id;
				var nuevo_id = id_act+1;
			};
		};
		return nuevo_id;
	},

/*
	'Tradear':function(){
		console.log(' Verificando tendencia de los Símbolos: ');
		Meteor.call("ListaSimbolos");
		Meteor.call("ListaMonedas");
		Meteor.call("SaldoActualMonedas");
		Meteor.call("ListaSimbolos");
		Meteor.call("LibroDeOrdenes");
		Meteor.call("ListaTradeoActual");
		Meteor.call("nuevaOrden");
		Meteor.call("putOrden");
		Meteor.call("borrarOrden");
	},
*/






	'EjecucionGlobal':function(){
		Meteor.call("Encabezado");
		/*
		if ( debug_activo === 1) {
			nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
			Ejecucion_Trader.insert({fecha: new Date(), id:nuevo_id_ejecucion ,descripcion:'Verificando tendencia de los Símbolos'});
			console.log(' Verificando tendencia de los Símbolos ');
		};

		Meteor.call("ListaMonedas");
		Meteor.call("SaldoActualMonedas");
		Meteor.call("ListaSimbolos", 2);
		*/
		//Meteor.call("ListaTradeoActual",VALOR);

		Meteor.call("Prueba");		


		//Meteor.call("ListaTradeoActual","BTCUSD");
		//Meteor.call("ListaMonedas");
		//Meteor.call("SaldoActualMonedas");
		//Meteor.call("ListaSimbolos");
		//Meteor.call("LibroDeOrdenes");
		//Meteor.call("nuevaOrden");
		//Meteor.call("putOrden");
		//Meteor.call("borrarOrden");
		Meteor.call("FinEjecucion");
	}
	
});

