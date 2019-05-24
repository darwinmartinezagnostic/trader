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

        
            var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
            var V_LimiteApDep = LimiteApDep[0].valor;
         
        /*
        Meteor.call("ActualizaSaldoTodasMonedas");
        Meteor.call("ValidaSaldoEquivalenteActual");
        Meteor.call("ConsultarSaldoTodasMonedas");
        Meteor.call("EquivalenteDolarMinCompra");
        */
        /*
            //Meteor.call("EjecucionInicial"); 
            Meteor.call("ListaTiposDeCambios", 2);
            Meteor.call("ListaMonedas");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ValidaMonedasTransfCuentaTRadeo");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ValidaSaldoEquivalenteActual");
            Meteor.call("ConsultarSaldoTodasMonedas");
            Meteor.call("EquivalenteDolarMinCompra");
            Meteor.call('ListaTradeoActual', TIPO_CAMBIO, 2);
            Meteor.call('EvaluarTendencias', TIPO_CAMBIO, MONEDA_SALDO );
        */ 

        //Meteor.call("ActualizaSaldoTodasMonedas");
        //Meteor.call("ValidaSaldoEquivalenteActual");
        
        //const MON_B='XMR'
        var MON_B='BTC'
        const MON_C='DAI'
        //var MON_C='BTC'
        var TIPO_CAMBIO = MON_B+MON_C
        //var MONEDA_SALDO = MON_B
        var MONEDA_COMISION = MON_C
        var MONEDA_SALDO = MON_C
        
        /* 

            //console.log(' Tipo de Cambio TIPO_CAMBIO', TIPO_CAMBIO, ' MONEDA_SALDO: ', MONEDA_SALDO);
           
    		for (C = 0, MAXEJC = 5; C < MAXEJC; C++){
    			
            	Meteor.call("ValidaTendenciaTipoCambio", TIPO_CAMBIO, MONEDA_SALDO);
                //Meteor.call("ValidaPropTipoCambiosValidados", MONEDA_SALDO, V_LimiteApDep );
            }
        */        
        
        if (MONEDA_SALDO === MON_B) {
            //CANT_INVER = '1.782'
            CANT_INVER = '0.01691398'
        }else if (MONEDA_SALDO === MON_C) {
            //CANT_INVER = '0.01696398'
            CANT_INVER = '90.0674088854' 
        } 
        /*
        MAPLICOMIS = MON_C
        var IdTransaccionLoteActual = Meteor.call('CalculaId', 3);        

        //Meteor.call("ConsultaCarterasDeposito");
 
            console.log("MON_B: ", MON_B, "MON_C: ", MON_C,"TIPO_CAMBIO: ", TIPO_CAMBIO,"MONEDA_SALDO: ", MONEDA_SALDO,"CANT_INVER: ", CANT_INVER,);
            //CrearNuevaOrder':function(TIPO_CAMBIO,T_TRANSACCION,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, IdTransaccionLoteActual){
            //Meteor.call("CrearNuevaOrder", 'ETHBTC', 'sell', '0.0166', 'ETH', 'BTC', 'BTC', 'BTC', IdTransaccionLoteActual);
            Meteor.call("CrearNuevaOrder", TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MAPLICOMIS, IdTransaccionLoteActual);
                                        // TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){
     
         
        /*
            var sal = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            console.log("Valor de sal: ", sal);
        */

            //Meteor.call("ConsultarHistoricoOrdenes");
        
        /*
            var ORDEN = '00000000000000000000000000000154'

            Meteor.call("ValidaTiempoEspera", ORDEN);
        */
        /*

        const ORDEN = { 
                    id: '125475148146',
                    clientOrderId: '00000000000000000000000000000308',
                    symbol: 'BTCUSD',
                    side: 'sell',
                    status: 'filled',
                    type: 'limit',
                    timeInForce: 'GTC',
                    quantity: '0.01691',
                    price: '5977.37',
                    cumQuantity: '0.01691',
                    createdAt: '2019-05-08T23:19:21.778Z',
                    updatedAt: '2019-05-08T23:19:21.778Z',
                    postOnly: false,
                    tradesReport: [ {   id: 540001701,
                                        quantity: '0.00800',
                                        price: '5977.37',
                                        fee: '0.095637920000',
                                        timestamp: '2019-05-08T23:19:21.778Z' },
                                    {   id: 540001702,
                                        quantity: '0.00891',
                                        price: '5977.37',
                                        fee: '0.106516733400',
                                        timestamp: '2019-05-08T23:19:21.778Z' }
                                    ]
         }


        //(TIPO_CAMBIO, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, DATOS, ID_LOTE){
        Meteor.call("GuardarOrden", TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, 1);
        /**/   

        /*
        var AnioInicio = 2019
        var fechaActual = new Date();
        var AnioAct = fechaActual.getFullYear();


        while ( AnioInicio <=  parseFloat(AnioAct) ){

            var MES = 1;
            while ( MES < 13 ){

                V_MES = Meteor.call('CompletaConCero', MES, 2);
                var date = new Date(AnioInicio,MES);
                console.log("     MES:", MES);
                //console.log(" Valor de date:", date);

                var primerDia = new Date(date.getFullYear(), date.getMonth(), 1)
                var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                /*
                console.log(" Valor de primerDia:", primerDia);
                console.log(" Valor de ultimoDia:", ultimoDia);
                *//*
                PD = Meteor.call('CompletaConCero', primerDia.getDate(), 2);
                UD = Meteor.call('CompletaConCero', ultimoDia.getDate(), 2);
                
                //console.log(" Valor de AnioIncial:", AnioInicio);
                var FechaInicial = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ PD ]+['T00%3A00%3A00']
                var UltimoDiaAnio = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ UD ]+['T23%3A59%3A59']
                console.log("Fecha Inicial: ", FechaInicial, " Fecha Final: ", UltimoDiaAnio);

                
                MES += 1
            }




            AnioInicio += 1
        }
        /**/    
        
        //Meteor.call("ValidaMonedasTransfCuentaTRadeo");

        /**/
        /*
            var LimiteMuestreo = Parametros.find({ "dominio": "limites", "nombre": "CantidadMinimaMuestreo"}).fetch()
            var V_LimiteMuestreo = LimiteMuestreo[0].valor

            console.log("Valor de V_LimiteMuestreo: ", V_LimiteMuestreo)
        */


        //Meteor.call("ValidaPropTipoCambiosValidados", MONEDA_SALDO,1);



        //'Invertir': function( MONEDA, LIMITE_AP_DEP, CANT_TIP_CAMBIOS_VALIDADOS ){
        //Meteor.call("ValidaPropTipoCambiosValidados",MONEDA_SALDO, 1);

        //Meteor.call("TipoCambioDisponibleCompra", MONEDA_SALDO,CANT_INVER);

        //Meteor.call("ValidarRanking", MONEDA_SALDO)

        //Meteor.call(ConsultarHistoricoOrdenes)
        /*
        var LIMITE_AP_DEP= 1

        var CANT_TIP_CAMBIOS_VALIDADOS =1
        var RankingTiposDeCambios = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA_SALDO, estado : "A", "tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: CANT_TIP_CAMBIOS_VALIDADOS } ]);
        var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
        var ProporcionTipoCambios = PTC[0];
        //console.log("Valor de RankingTiposDeCambios: ", RankingTiposDeCambios)
        var CRTC2=1;     

            for ( CTCV = 0, TTCV = RankingTiposDeCambios.length; CTCV <= TTCV; CTCV++ ) {
                console.log('--------------------------------------------');
                var Tendencia = RankingTiposDeCambios[0].tendencia;
                Meteor.call("GuardarLogEjecucionTrader", '             **** INVERTIR **** ');
                Meteor.call("GuardarLogEjecucionTrader", '   | Realizando Calculos de inversión |');
                Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[Tendencia]);
                console.log("   |   ............................   |")
                console.log(' ');

                while ( CRTC2 <= CANT_TIP_CAMBIOS_VALIDADOS ) {
                    TipoCambioRanking = RankingTiposDeCambios[CTCV];
                    var TipoCambio = TipoCambioRanking.tipo_cambio
                    var Tendencia = TipoCambioRanking.tendencia;
                    var PorcInv=[CRTC2]+[CANT_TIP_CAMBIOS_VALIDADOS]
                    switch ( parseFloat(PorcInv)){
                        case 11:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p11
                        break;
                        case 12:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p12
                        break;
                        case 22:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p22
                        break;
                        case 13:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p13
                        break;
                        case 23:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p23
                        break;
                        case 33:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p33
                        break;
                    }

                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                    var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                    var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                    var MonCBas = TipoCambioRanking.moneda_base;
                    var MonCoti = TipoCambioRanking.moneda_cotizacion;


                    var SaldoInverCalculado = parseFloat(SaldoActualMoneda)*parseFloat(PorcentajeInversion)
                    
                    console.log('--------------------------------------------');
                    Meteor.call("GuardarLogEjecucionTrader", ['                  POSICIÓN:']+[CRTC1+1]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ******** ']+[' TIPO CAMBIO: ']+[TipoCambio]+[' ********']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[MonCBas]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA COTIZACION: ']+[MonCoti]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[Tendencia]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);
                    
                    Meteor.call('CrearNuevaOrder',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                    CRTC2 = CRTC2+1;
                }
            }

            */
            //USDEOSDT
            //EURSUSD
            //'EquivalenteDolar':function(MONEDA, S_MOND, TIPO_ACCION){
            var MONEDA='EOSDT'
            var prueba = Meteor.call("EquivalenteDolar", MONEDA, 1, 2);
            console.log("Valor de prueba ", prueba);/**/
    },
});

/*
switch (){
    case 0:
    break;
    case 1 :
    break ;
}
*/

