import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'CrearNuevaOrderRobot':function(N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_INVER, SALDO_ACTUAL, MON_B, MON_C, MON_SALTRAD, COMISION_HITBTC, COMISION_MERCADO, MON_APLIC_COMISION ){  //POST
        console.log(' ');
        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", ['Creando una nueva orden en el ROBOT']);
        console.log('--------------------------------------------');
        console.log(' ');

        var datos = new Object();
        datos.clientOrderId= N_ID__ORDEN_CLIENT;
        datos.symbol = TIPO_CAMBIO;
        datos.side = T_TRANSACCION;
        datos.timeInForce=ZONA_HORARA;
        datos.quantity = CANT_INVER;

        var fecha = new Date();

        switch (T_TRANSACCION){
            case 'buy':
                var V_TipoOperaciont = 'COMPRA';
                break;
            case 'sell':
                var V_TipoOperaciont = 'VENTA';
                break;
        }

        //var moneda = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPO_CAMBIO }}, { $sort: { fecha : -1 } }, { $limit: 1 }]);
        var moneda = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPO_CAMBIO }}]);

        if ( COMISION_HITBTC === undefined ) {
            var coms_hitbc = 0;
        }else{
            coms_hitbc = COMISION_HITBTC;
        }

        if ( COMISION_MERCADO === undefined ) {
            var coms_mercado = 0
        }else{
            coms_mercado = COMISION_MERCADO;
        }
        
        var mon_comision = MON_APLIC_COMISION;
        var precio_moneda = Meteor.call('LibroDeOrdenes', TIPO_CAMBIO);

        //if ( MON_SALTRAD === MON_B ) {
        if ( MON_SALTRAD === MON_C ) {

            Meteor.call("GuardarLogEjecucionTrader", "Estoy Verificando MON_SALTRAD === MON_B");


            if ( Monedas.find({ moneda : MON_B, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_base_act = 0
            }else{
                var moneda_base_act = Monedas.findOne({ moneda : MON_B });
                var saldo_moneda_base_act = SALDO_ACTUAL
            }

            if ( Monedas.find({ moneda : MON_C, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_coti_act = 0
            }else{
                var moneda_coti_act = Monedas.findOne({ moneda : MON_C });
                var saldo_moneda_coti_act = moneda_coti_act.saldo.tradeo.activo
            }



            var InversionTotal = CANT_INVER
            var nuevo_saldo_moneda_base_actual = ( saldo_moneda_base_act - CANT_INVER );
            var nuevo_saldo_moneda_coti_actual = (( CANT_INVER * precio_moneda )- coms_hitbc - coms_mercado + (saldo_moneda_coti_act * CANT_INVER ));


            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_base_act'"]+[saldo_moneda_base_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_coti_act'"]+[saldo_moneda_coti_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'precio_moneda'"]+[precio_moneda]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'CANT_INVER'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'InversionTotal'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_hitbc'"]+[coms_hitbc]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_mercado'"]+[coms_mercado]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_base_actual'"]+[nuevo_saldo_moneda_base_actual]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_coti_actual'"]+[nuevo_saldo_moneda_coti_actual]);
            Monedas.update({
                            moneda: MON_B
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_base_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});
            Monedas.update({
                            moneda: MON_C
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_coti_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});


            TempSaldoMoneda.insert({ moneda : MON_C, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_coti_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: COMISION_HITBTC, comision_mercado_aplicada : COMISION_MERCADO, saldo_final : nuevo_saldo_moneda_coti_actual })
            TempSaldoMoneda.insert({ moneda : MON_B, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_base_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: 0, comision_mercado_aplicada : 0, saldo_final : nuevo_saldo_moneda_base_actual })
            HistoralTransacciones.insert({ fecha : fecha, id : N_ID__ORDEN_CLIENT, tipo_cambio : TIPO_CAMBIO,tipo_transaccion : V_TipoOperaciont, moneda_base : MON_B, moneda_cotizacion : MON_C, monto : InversionTotal, precio_operacion : precio_moneda, estado : "Exitoso" });

        
        
        } else if ( MON_SALTRAD === MON_B ) {
            Meteor.call("GuardarLogEjecucionTrader", "Estoy Verificando MON_SALTRAD === MON_C");
            if ( Monedas.find({ moneda : MON_C, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_coti_act = 0
            }else{
                var moneda_coti_act = Monedas.findOne({ moneda : MON_C });
                var saldo_moneda_coti_act = SALDO_ACTUAL
            }
            if ( Monedas.find({ moneda : MON_B, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_base_act = 0
            }else{
                var moneda_base_act = Monedas.findOne({ moneda : MON_B });
                var saldo_moneda_base_act = moneda_base_act.saldo.tradeo.activo
            }


            var InversionTotal = CANT_INVER + COMISION_HITBTC + COMISION_MERCADO;
            var nuevo_saldo_moneda_coti_actual = ( saldo_moneda_coti_act - InversionTotal);
            var nuevo_saldo_moneda_base_actual = (( CANT_INVER / precio_moneda ) + saldo_moneda_base_act ) ;

            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_base_act'"]+[saldo_moneda_base_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_coti_act'"]+[saldo_moneda_coti_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'precio_moneda'"]+[precio_moneda]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'CANT_INVER'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'InversionTotal'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_hitbc'"]+[coms_hitbc]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_mercado'"]+[coms_mercado]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_base_actual'"]+[nuevo_saldo_moneda_base_actual]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_coti_actual'"]+[nuevo_saldo_moneda_coti_actual]);
            
            Monedas.update({
                            moneda: MON_C
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_coti_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});
            Monedas.update({
                            moneda: MON_B
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_base_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});

            TempSaldoMoneda.insert({ moneda : MON_C, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_coti_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: COMISION_HITBTC, comision_mercado_aplicada : COMISION_MERCADO, saldo_final : nuevo_saldo_moneda_coti_actual })
            TempSaldoMoneda.insert({ moneda : MON_B, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_base_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: 0, comision_mercado_aplicada : 0, saldo_final : nuevo_saldo_moneda_base_actual })
            HistoralTransacciones.insert({ fecha : fecha, id : N_ID__ORDEN_CLIENT, tipo_cambio : TIPO_CAMBIO,tipo_transaccion : V_TipoOperaciont, moneda_base : MON_B, moneda_cotizacion : MON_C, monto : InversionTotal, precio_operacion : precio_moneda, estado : "Exitoso" });
        }
        //Meteor.call('CalculoGanancia');
        console.log("         Inversion realizada");
        console.log(' ');
        console.log(' ');
    },

	'Prueba':function(){
         
        var TIPO_CAMBIO = 'EOSBTC';
        //var MONEDA_SALDO = 'BTC'
        var MONEDA_SALDO = 'EOS'
       
		//for (C = 0, MAXEJC = 5; C < MAXEJC; C++){
			
        	Meteor.call("ValidaTendenciaTipoCambio", TIPO_CAMBIO, MONEDA_SALDO);
        //}

        //Meteor.call("ListaTiposDeCambios", 2);
        //Meteor.call("ListaMonedas");
        //Meteor.call("ActualizaSaldoTodasMonedas");
        //Meteor.call("ValidaMonedasTransfCuentaTRadeo");
        //Meteor.call("ActualizaSaldoTodasMonedas");
        //Meteor.call("ValidaSaldoEquivalenteActual");
        //Meteor.call("ConsultarSaldoTodasMonedas");
        //Meteor.call("EquivalenteDolarMinCompra");
        //Meteor.call('ListaTradeoActual', TIPO_CAMBIO, 2);
        //Meteor.call('EvaluarTendencias', TIPO_CAMBIO, MONEDA_SALDO );

    },
});