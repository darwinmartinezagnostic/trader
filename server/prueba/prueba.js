import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({
    
	'PruebasUnitarias':function(){


        //var sal = Meteor.call('CalcularIversion', 'BTXBTC', 'BTC',0.00055);
        Meteor.call('ActualizaEquivalenciaMonedas');
        Meteor.call('CarcularGanancia',1);

/*
            var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
            var V_LimiteApDep = LimiteApDep[0].valor;
            var CONSTANTES = Meteor.call("Constantes");
         
        //Meteor.call("ActualizaSaldoTodasMonedas");
        /*
        Meteor.call("ValidaSaldoEquivalenteActual");
        Meteor.call("ConsultarSaldoTodasMonedas");
        Meteor.call("EquivalenteDolarMinCompra");
        Meteor.call("ActualizaSaldoActual", 'TNT');
        Meteor.call("ActualizaSaldoActual", 'USD');
        /**/
        /*
            Meteor.call("ListaMonedas");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ValidaSaldoEquivalenteActual");
            //Meteor.call("EjecucionInicial"); 
            Meteor.call("ListaTiposDeCambios", 2);
            Meteor.call("ValidaMonedasTransfCuentaTRadeo");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ConsultarSaldoTodasMonedas");
            Meteor.call("EquivalenteDolarMinCompra");
            Meteor.call('ListaTradeoActual', TIPO_CAMBIO, 2);
            Meteor.call('EvaluarTendencias', TIPO_CAMBIO, MONEDA_SALDO );
        */   

        //Meteor.call("ActualizaSaldoTodasMonedas");
        //Meteor.call("ValidaSaldoEquivalenteActual");
        
        const MON_B='ETH'
        const MON_C='BTC'
        var TIPO_CAMBIO = MON_B+MON_C
        //var MONEDA_SALDO = MON_B
        var MONEDA_COMISION = MON_C
        var MONEDA_SALDO = MON_B
        var MONEDASALDO = MONEDA_SALDO
        var PRECIO = '0.023502500'
        /* 

            //log.info(' Tipo de Cambio T
            IPO_CAMBIO', TIPO_CAMBIO, ' MONEDA_SALDO: ', MONEDA_SALDO);
           
    		for (C = 0, MAXEJC = 5; C < MAXEJC; C++){
    			
            	Meteor.call("ValidaTendenciaTipoCambio", TIPO_CAMBIO, MONEDA_SALDO);
                //Meteor.call("ValidaPropTipoCambiosValidados", MONEDA_SALDO, V_LimiteApDep );
            }
        */        
        /*
        if (MONEDA_SALDO === MON_B) {
            //CANT_INVER = '1.782'
            CANT_INVER = '0.019'
            //var DatosMoneda = Monedas.find( { moneda : MONEDA_SALDO }).fetch()
            //var CANT_INVER = DatosMoneda[0].saldo.tradeo.activo
        }else if (MONEDA_SALDO === MON_C) {
            //CANT_INVER = '0.01696398'
            //CANT_INVER = '0.00055' 
            var DatosMoneda = Monedas.find( { moneda : MONEDA_SALDO }).fetch()
            var CANT_INVER = DatosMoneda[0].saldo.tradeo.activo
        } 
        
        MAPLICOMIS = MON_C
        //var IdTransaccionLoteActual = Meteor.call("SecuenciasGBL", 'IdGanPerdLote')    

        //Meteor.call("ConsultaCarterasDeposito");
 
            //log.info("Datos a enviar: MON_B: ", MON_B, "MON_C: ", MON_C,"TIPO_CAMBIO: ", TIPO_CAMBIO,"MONEDA_SALDO: ", MONEDA_SALDO,"CANT_INVER: ", CANT_INVER,);
            //CrearNuevaOrder':function(TIPO_CAMBIO,T_TRANSACCION,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, IdTransaccionLoteActual){
            //Meteor.call("CrearNuevaOrder", 'ETHBTC', 'sell', '0.0166', 'ETH', 'BTC', 'BTC', 'BTC', IdTransaccionLoteActual);
            //Meteor.call("CrearNuevaOrder", TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MAPLICOMIS, IdTransaccionLoteActual);
            //Meteor.call("CrearNuevaOrderRobot", TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MAPLICOMIS, IdTransaccionLoteActual);
                                        // TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){ 
<<<<<<< HEAD
            /*
            console.log('--------------------------------------------');
            var XPromedio = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            console.log("Calculo X Promedio: ", XPromedio);
            console.log('--------------------------------------------');
            var XOrden = Meteor.call("CalcularIversionXOrden", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            console.log("Calculo X Orden: ", XOrden);
            console.log('--------------------------------------------');
            var XVolumen = Meteor.call("CalcularIversionXVolumen", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            console.log("Calculo X Volumen: ", XVolumen);
            console.log('--------------------------------------------');
            /*
            var IdTransaccionActual = "0899750c5384478998adb2818337d627"
            var Orden = Meteor.call("CancelarOrden", IdTransaccionActual );
            console.log("Calculo X Orden: ", Orden);

=======
     
         
        
            //var sal = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //log.info("Valor de sal: ", sal);
>>>>>>> 1431713e9f05ec5077165943b7c6ffcd76e6fff1
        /**/

            //Meteor.call("ConsultarHistoricoOrdenes"); 
        
        /*
            var ORDEN = '00000000000000000000000000000154'

            Meteor.call("ValidaTiempoEspera", ORDEN);
        */
        
        /*
        const ORDEN = { id: 134980877254,
                        clientOrderId: '00000000000000000000000000000023',
                        symbol: 'VRABTC',
                        side: 'buy',
                        status: 'filled',
                        type: 'limit',
                        timeInForce: 'GTC',
                        quantity: '19',
                        price: '0.0000001401',
                        cumQuantity: '19',
                        createdAt: '2019-06-21T05:06:42.088Z',
                        updatedAt: '2019-06-21T05:06:42.088Z',
                        tradesReport:
                            [ { id: 588955797,
                                quantity: '19',
                                price: '0.0000001401',
                                fee: '0.000000005324',
                                timestamp: '2019-06-21T05:06:42.088Z' } ] }

        var IdTransaccionLoteActual = Meteor.call("SecuenciasGBL", 'IdGanPerdLote')
        //(TIPO_CAMBIO, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, DATOS, ID_LOTE){
        Meteor.call("GuardarOrden", TIPO_CAMBIO, CANT_INVER, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, IdTransaccionLoteActual);
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
                log.info("     MES:", MES);
                //log.info(" Valor de date:", date);

                var primerDia = new Date(date.getFullYear(), date.getMonth(), 1)
                var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                /*
                log.info(" Valor de primerDia:", primerDia);
                log.info(" Valor de ultimoDia:", ultimoDia);
                *//*
                PD = Meteor.call('CompletaConCero', primerDia.getDate(), 2);
                UD = Meteor.call('CompletaConCero', ultimoDia.getDate(), 2);
                
                //log.info(" Valor de AnioIncial:", AnioInicio);
                var FechaInicial = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ PD ]+['T00%3A00%3A00']
                var UltimoDiaAnio = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ UD ]+['T23%3A59%3A59']
                log.info("Fecha Inicial: ", FechaInicial, " Fecha Final: ", UltimoDiaAnio);

                
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

            log.info("Valor de V_LimiteMuestreo: ", V_LimiteMuestreo)
        */


        //Meteor.call("ValidaPropTipoCambiosValidados", MONEDA_SALDO,1);



        //'Invertir': function( MONEDA, LIMITE_AP_DEP, CANT_TIP_CAMBIOS_VALIDADOS ){
        ///Meteor.call("Invertir",MONEDA_SALDO, 1, 1);
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
        //log.info("Valor de RankingTiposDeCambios: ", RankingTiposDeCambios)
        var CRTC2=1;     

            for ( CTCV = 0, TTCV = RankingTiposDeCambios.length; CTCV <= TTCV; CTCV++ ) {
                log.info('--------------------------------------------');
                var Tendencia = RankingTiposDeCambios[0].tendencia;
                Meteor.call("GuardarLogEjecucionTrader", '             **** INVERTIR **** ');
                Meteor.call("GuardarLogEjecucionTrader", '   | Realizando Calculos de inversión |');
                Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[Tendencia]);
                log.info("   |   ............................   |")
                log.info(' ');

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
                    
                    log.info('--------------------------------------------');
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
            /*
            var MONEDA='BMH'
            var prueba = Meteor.call("EquivalenteDolar", MONEDA, 10, 2);
            log.info("Valor de prueba ", prueba);
            /**/

            //Meteor.call("SecuenciaPeriodo1")
            /*
            var TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', MONEDA_SALDO, CANT_INVER);
            log.info("Valor de TiposDeCambioVerificar ", TiposDeCambioVerificar[0])
            Meteor.call('ValidaTendenciaTipoCambio', TiposDeCambioVerificar[0], MONEDA_SALDO);
            var prueba = Meteor.call("ConsultaOrdenesAbiertas", TIPO_CAMBIO)
            log.info("Valor de prueba: ", prueba)
            var prueba = Meteor.call("CancelarOrden", TIPO_CAMBIO)
            log.info("Valor de prueba: ", prueba)
            */
            //Meteor.call('EquivalenteDolar', 'KRWB', parseFloat(2761.9602096), 2)
            //Meteor.call('EquivalenteDolar', 'KRWB', parseFloat(1397.00), 2)
            //MONEDA = 'KRWB'
            /*
            VALOR = 4.2405e-8
            var prueba = Meteor.call('CombierteNumeroExpStr', VALOR) 
            log.info("Valor de prueba: ", prueba)
            /**/
            /*
            MONEDA = 'BTC'
            var DatosMoneda = Monedas.find( { moneda : MONEDA }).fetch()
            var SaldoMoneda = DatosMoneda[0].saldo.tradeo.activo
            var prueba1 = Meteor.call('EquivalenteDolar', MONEDA, parseFloat(SaldoMoneda), 2) 
            log.info("Valor de prueba1: ", prueba1)
            /**/
            /*            
            MONEDAS = Monedas.aggregate([
                        { $match : {"saldo.tradeo.activo" : { $gt : 0 }, "activo" : "S"}},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]); 



            log.info("Valor de MONEDAS: ", MONEDAS)
            

            for (CMS = 0, TMS = MONEDAS.length; CMS < TMS; CMS++){
                log.info('-------------------------------------------');
                var moneda_saldo =  MONEDAS[CMS];
                log.info("Valor de moneda_saldo: ", moneda_saldo.moneda)
                var MONEDA = moneda_saldo.moneda
                var DatosMoneda = Monedas.find( { moneda : MONEDA }).fetch()
                var SaldoMoneda = DatosMoneda[0].saldo.tradeo.activo
                var prueba = Meteor.call('EquivalenteDolar', MONEDA, parseFloat(SaldoMoneda), 2) 
                log.info("Valor de prueba: ", prueba)
                log.info('-------------------------------------------');
            }
            /**/
            /*
            TC = TiposDeCambios.findOne({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] })
            log.info("Valor de TC: ", TC)
            MinInv=TC.valor_incremento
            tipoCambio = Monedas.find( { tipo_cambio : MONEDA }).fetch()
            log.info("Valor de MinInv: ", MinInv)
            TMinInv = MinInv.toString().trim().length
            log.info("Valor de TMinInv: ", TMinInv)
            NuevValorSaldo= SaldoMoneda.toString().toString().trim().substr(0, TMinInv)
            log.info("Valor de SaldoMoneda: ", SaldoMoneda)
            log.info("Valor de NuevValorSaldo: ", NuevValorSaldo)
            */

            //Meteor.call("InvertirEnMonedaInestable", MONEDASALDO );
            /*
            var ID = "133360067589";
            //var ORDEN= "00000000000000000000000000001280";
            var ORDEN= "00000000000000000000000000000001";

            var prueba = Meteor.call('ValidarEstadoOrden', ORDEN, ID, TIPO_CAMBIO)
            log.info("Valor de prueba: ", prueba)
            */

            //DATOS = [{ id: '134731069733',clientOrderId: '00000000000000000000000000001547', symbol: 'GETBTC', side: 'buy',status: 'partiallyFilled',type: 'limit',timeInForce: 'GTC', quantity: '410', price: '0.00000692800', cumQuantity: '130',createdAt: '2019-06-08T13:45:12.616Z', updatedAt: '2019-06-08T13:45:12.616Z', postOnly: false, tradesReport: [ { id: 576327398, quantity: '130', price: '0.00000692800', fee: '0.000001801280', timestamp: '2019-06-08T13:45:12.616Z' } ] }]
            
            /*
            DATOS = [{ id: '134746692991', clientOrderId: '00000000000000000000000000001562', ymbol: 'GETBTC', side: 'buy', status: 'new', type: 'limit', imeInForce: 'GTC', quantity: '150', price: '0.00000674577', cumQuantity: '0', createdAt: '2019-06-08T15:15:20.441Z', updatedAt: '2019-06-08T15:15:20.441Z', postOnly: false }]

            ORDEN  = DATOS[0]
            //log.info("Valor de ORDEN: ", ORDEN.tradesReport)
            ID = ORDEN.id

            //existe = {ORDEN.tradesReport: exists}

            if ( ORDEN.tradesReport ) {
                var Negociaciones = ORDEN.tradesReport
                var ComisionTtl = 0
                log.info("Valor de ORDEN: ", ORDEN.tradesReport)

            }else {
                log.info(' Estoy acá')
                var Url_TransID=[CONSTANTES.HistOrdenes]+['/']+[ID]+['/trades']
                log.info('Valor de Url_TransID', Url_TransID)
                const TrnsID = Meteor.call("ConexionGet", Url_TransID) 
                var transID = TrnsID[0];
                //log.info('Valor de transID', transID)
                var ComisionTtl = transID.fee
                log.info('Valor de ComisionTtl', ComisionTtl)
            }

            */
            /*
            console.time('       TIEMPO TRANSCURRIDO: '+ MON_B);

            //colors.enabled = true
            //Meteor.call("ConsultarHistoricoOrdenes");
            log.info(" Probando".blue)
            log.info(" Probando")
            log.warn(" Probando")
            Error(" Probando")
            console.timeEnd('       TIEMPO TRANSCURRIDO: '+ MON_B);
            /**/



            var pruebaA = Meteor.call("EquivalenteTipoCambio", MONEDA_SALDO, CANT_INVER, PRECIO, TIPO_CAMBIO );
            console.log('Valor de prueba: ', pruebaA);

            var pruebaB = Meteor.call("EquivalenteDolar", MON_C, pruebaA, 2);
            console.log("Valor de prueba ", pruebaB);

    }
});

