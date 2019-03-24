import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({
	'Constantes':function(){

		const autoriza_conexion = Conexion_api.findOne({ casa_cambio : 'hitbtc'}, {_id:0});
		const key = autoriza_conexion.key;
		const secret = autoriza_conexion.secret;
		const API_HITBTC2 = autoriza_conexion.api.url;
		const publico = API_HITBTC2+"public/";
		const tradeo = API_HITBTC2+"trading/";
		const cuenta = API_HITBTC2+"account/";
		const historial = API_HITBTC2+"history/";
		const ordenes = API_HITBTC2+"order";
		const ZONA_HORARA = "GTC";
		//**************************************************
		//**************************************************
		// API Public
		const monedas = [publico]+"currency";
		const simbolos = [publico]+"symbol";
		// API Trading
		const blc_tradeo = [tradeo]+"balance";
		const comisiones = [tradeo]+"fee";
		// API Account
		const blc_cuenta = [cuenta]+"balance";
		const transacciones = [cuenta]+"transactions";
		const cripto_cuenta= [cuenta]+"crypto/";
		const retiros= [cripto_cuenta]+"withdraw";
		const cart_dep = [cripto_cuenta]+"address";
		const transferencia = [cuenta]+"transfer";
		// API Trading History
		const HistTradeo = [historial]+"trades";
		const HistOrdenes = [historial]+"order";
		// CANTIDADES DE REGISTROS
		const cant_traders = 1;
		const cant_transacciones = 3;
		// CANTIDAD DE REGISTROS ID HACIA ATRÁS
		const CantTransAtras = 300;
		// ACTIVACION DE GUARDADO DEBUG DEL CÓDIGO EN DB
		const debug_activo = Parametros.aggregate([  { $match : { dominio : "Ejecucion", nombre : "Depuracion" } },
                                                    { $project : { _id : 0, valor : 1 } }]);;
		//console.log("Valor de debug_activo: ", debug_activo[0]);
		var idTrans = 0;

		constante = {
		 	apikey : key+':'+secret,
		 	publico : publico,
			tradeo : tradeo,
			cuenta : cuenta,
			historial : historial,
			ordenes : ordenes,
			ZONA_HORARA : ZONA_HORARA,
			monedas : monedas,
			simbolos : simbolos,
			blc_tradeo : blc_tradeo,
			comisiones : comisiones,
			blc_cuenta : blc_cuenta,
			transacciones : transacciones,
			cripto_cuenta : cripto_cuenta,
			retiros : retiros,
			cart_dep : cart_dep,
			transferencia : transferencia,
			HistTradeo : HistTradeo,
			HistOrdenes : HistOrdenes,
			cant_traders : cant_traders,
			cant_transacciones : cant_transacciones,
			CantTransAtras : CantTransAtras,
			debug_activo : debug_activo[0].valor,
			idTrans : idTrans
		}

		
		/*
		const apikey = key+':'+secret;
		const API_HITBTC2 = autoriza_conexion.api.url;

		const publico = API_HITBTC2+"public/";
		const tradeo = API_HITBTC2+"trading/";
		const cuenta = API_HITBTC2+"account/";
		const historial = API_HITBTC2+"history/";
		const ordenes = API_HITBTC2+"order";
		const ZONA_HORARA = "GTC";
		//**************************************************
		//**************************************************
		// API Public
		const monedas = [publico]+"currency";
		const simbolos = [publico]+"symbol";
		// API Trading
		const blc_tradeo = [tradeo]+"balance";
		const comisiones = [tradeo]+"fee";
		// API Account
		const blc_cuenta = [cuenta]+"balance";
		const transacciones = [cuenta]+"transactions";
		const cripto_cuenta= [cuenta]+"crypto/";
		const retiros= [cripto_cuenta]+"withdraw";
		const cart_dep = [cripto_cuenta]+"address";
		const transferencia = [cuenta]+"transfer";
		// API Trading History
		const HistTradeo = [historial]+"trades";
		const HistOrdenes = [historial]+"order";
		// CANTIDADES DE REGISTROS
		const cant_traders = 1;
		const cant_transacciones = 3;
		// CANTIDAD DE REGISTROS ID HACIA ATRÁS
		const CantTransAtras = 300;
		// ACTIVACION DE GUARDADO DEBUG DEL CÓDIGO EN DB
		const debug_activo = 1;

		var idTrans = 0;
		*/
		return constante;
	}

});