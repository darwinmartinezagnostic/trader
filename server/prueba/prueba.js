import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();
import { Email } from 'meteor/email'

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({
    
	'PruebasUnitarias':function(){
        var AMBITO = 'PruebasUnitarias'

        ///////////          VARIABLES             /////////////


        /*
        
        const MON_B='DIM'
        const MON_C='USD'
        var TIPO_CAMBIO = MON_B+MON_C
        var MONEDA_COMISION = MON_C
        //var MONEDA_SALDO = MON_B
        var MONEDA_SALDO = MON_C
        var MONEDASALDO = MONEDA_SALDO
        var PRECIO = '0.000231058'
        var ID_LOTE = 1373
        if (MONEDA_SALDO === MON_B) {
            var TP = 'sell'
            var MONEDA_S_SALDO = MON_C
            //CANT_INVER = '1.782'
            //CANT_INVER = '0.83'
            var DatosMoneda = Monedas.find( { moneda : MONEDA_SALDO }).fetch()
            var CANT_INVER = DatosMoneda[0].saldo.tradeo.activo 
        }else if (MONEDA_SALDO === MON_C) {
            var TP = 'buy'
            var MONEDA_S_SALDO = MON_B
            //CANT_INVER = '0.01696398' 
            //CANT_INVER = '0.82' 
            var DatosMoneda = Monedas.find( { moneda : MONEDA_SALDO }).fetch()
            var CANT_INVER = DatosMoneda[0].saldo.tradeo.activo
        } 
        /**/


        /*
        Orden = {
          "id": 206599567723,
          "clientOrderId": "00000000000000000000000000003645",
          "symbol": "DIMUSD",
          "side": "buy",
          "status": "new",
          "type": "limit",
          "timeInForce": "GTC",
          "price": "0.000211842",
          "quantity": "32360",
          "postOnly": false,
          "cumQuantity": "0",
          "createdAt": "2020-02-11T22:24:46.873Z",
          "updatedAt": "2020-02-11T22:24:46.873Z"
        }
        /**/
        /*
        var Orden = new Object();
            Orden.id=206643505671;
            Orden.clientOrderId="00000000000000000000000000003648";
            Orden.symbol=TIPO_CAMBIO;
            Orden.side=TP;
            Orden.status="new";
            Orden.type='limit';
            Orden.timeInForce='GTC'
            Orden.price= PRECIO
            Orden.quantity= "31160"
            Orden.postOnly= false
            Orden.cumQuantity= "0"
            Orden.createdAt= "2020-02-12T00:57:41.117Z"
            Orden.updatedAt= "2020-02-12T00:57:41.117Z"


        var InversionRealCalc = Orden.quantity;

        Meteor.call('EstadoOrdenVerificar', TIPO_CAMBIO , CANT_INVER, InversionRealCalc, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE )
        /**/




        //////////  NO OLIDARSE DE ESTO /////////////////
        
        var OperacionesEnSeguimiento = GananciaPerdida.find({ "Operacion.Status" : "En seguimiento" }).count()

        if (OperacionesEnSeguimiento === 0 ) {

                        log.info(' NO HAY OPERACIONES PENDIENTES DE SEGUIMIENTO');

                    }else{
                        var OperacionesEnSeguimiento = GananciaPerdida.find({ "Operacion.Status" : "En seguimiento" }).count()
                        log.info(' Se encontraron', OperacionesEnSeguimiento + ' Operaciones Pendientes de seguimiento, se procede a verificar sus status actuales');
                        OperacionesIncompletas = GananciaPerdida.aggregate({ $match : {"Operacion.Status" : "En seguimiento"}});
                        for (COI = 0, TOI = OperacionesIncompletas.length; COI < TOI; COI++){
                        //for (COI = 0, TOI = OperacionesIncompletas.length; COI < 1; COI++){
                            Meteor.call('sleep', 33);
                            log.info(' OPERACIÓN N°: ', COI + 1 );
                            var OperacionIncompleta = OperacionesIncompletas[COI]
                            var OrdenGuardada = OperacionIncompleta.DatosOrden
                            var TIPO_CAMBIO = OperacionIncompleta.Operacion.TipoCambio; 
                            var CANT_INVER = OperacionIncompleta.Inversion.SaldoInversion; 
                            var InversionRealCalc = OrdenGuardada.quantity; 
                            var MONEDA_SALDO = OperacionIncompleta.Moneda.Emitida.moneda; 
                            var ID_LOTE = OperacionIncompleta.Operacion.Id_Lote;

                            var V_TipoCambio = TiposDeCambios.findOne({ "tipo_cambio" : TIPO_CAMBIO });
                            //log.info(' Valor de V_TipoCambio: ', V_TipoCambio);
                            //var MON_B = V_TipoCambio.moneda_base
                            //var MON_C = V_TipoCambio.moneda_cotizacion 
                            var MONEDA_COMISION = V_TipoCambio.moneda_cotizacion ;

                            //log.info(' Valor de OperacionIncompleta: ', OperacionIncompleta);
                            log.info(' Valor de OrdenGuardada: ', OrdenGuardada);
                            log.info(' Valor de TIPO_CAMBIO: ', TIPO_CAMBIO);
                            log.info(' Valor de CANT_INVER: ', CANT_INVER);
                            log.info(' Valor de InversionRealCalc: ', InversionRealCalc);
                            log.info(' Valor de MONEDA_SALDO: ', MONEDA_SALDO);
                            log.info(' Valor de ID_LOTE: ', ID_LOTE);
                            //log.info(' Valor de MON_B: ', MON_B);
                            //log.info(' Valor de MON_C: ', MON_C);
                            log.info(' Valor de MON_B: ', V_TipoCambio.moneda_base);
                            log.info(' Valor de MON_C: ', V_TipoCambio.moneda_cotizacion);
                            log.info(' Valor de MONEDA_COMISION: ', MONEDA_COMISION);


                            var Orden = Meteor.call('ValidarEstadoOrden', OrdenGuardada)
                            log.info(' Valor de Orden: ', Orden);
                            Meteor.call('EstadoOrdenVerificar', TIPO_CAMBIO , CANT_INVER, InversionRealCalc, V_TipoCambio.moneda_base, V_TipoCambio.moneda_cotizacion, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE )
                            log.info('############################################')

                        }
                    }
        /**/
    /////////////////////////////////////////////















        /*
        var IdTemp = Meteor.call("SecuenciasGBL", 'IdTemporal');
        var IdTemporal = Meteor.call("CompletaConCero", IdTemp, 32);

        var ID = IdTemporal;
        try{

            }
            catch(error){
                log.info("TENGO UN ERROR EN ESTA PARTE")
            }

        /**/
        /* 
        if ( SecuenciasTemporales.find({ _id: ID.toString() }).count() === 0){
            log.info(' SecuenciasTMP - if ( SecuenciasTemporales.find({ _id: ID}).count() === 0) ')

            try{             
                SecuenciasTemporales.insert({ _id: ID.toString(), secuencia: 0 });
                var nuevo_id = SecuenciasTemporales.findAndModify({
                                                                    query: { _id: ID },
                                                                    update: { $inc: { secuencia: 1 } },
                                                                    upsert: true,
                                                                    'new' : true
                                                                });
            }
            catch(error){
                log.info("TENGO UN ERROR EN ESTA PARTE")
            }
        }else{
            var nuevo_id = SecuenciasTemporales.findAndModify({
                                                                query: { _id: ID },
                                                                update: { $inc: { secuencia: 1 } },
                                                                upsert: true,
                                                                'new' : true
                                                            });
        }

        /**/
        /*


        //var ORDEN = '203709643677'
        //log.info('Voy a cancelar la orden: ', ORDEN );
        //Meteor.call("CancelarOrden", ORDEN);
        log.info('Voy a enviar correo');
        Meteor.call('sendEmail', 
                    'jarruizjesus@gmail.com', 
                    'en el texto', 
                    'prueba de correo');
        //Meteor.call('EnviarCorreo', 'jarruizjesus@gmail.com', 'invertminado@gmail.com', 'en el texto', 'prueba de correo');
        //var sal = Meteor.call('CalcularIversion', 'BTXBTC', 'BTC',0.00055);
        //Meteor.call('ActualizaEquivalenciaMonedas');
        //Meteor.call('CarcularGanancia',1);

        


        

        /*
        Orden = new Object();
        Orden.clientOrderId=IdTransaccionActual;
        Orden.symbol=TIPO_CAMBIO;
        Orden.side=TP;
        Orden.type='limit';
        Orden.timeInForce='GTC';
        Orden.quantity=RecalcIverPrec.MontIversionCal;
        Orden.price=RecalcIverPrec.MejorPrecCal;
        /**/

        //Meteor.call( "Transferirfondos", 'BTC', INV_REAL, 'exchangeToBank' );
        //Meteor.call( "Transferirfondos", 'BTC', INV_REAL, 'bankToExchange' );
        //log.info(' Valor de INV_REAL: ', parseFloat(INV_REAL))
        /*
        log.info('Esto es una prueba', 'Ejecutando pruebas', 'Pruebas');
        Meteor.call('ActualizaEquivalenciaMonedas');
        Meteor.call('CarcularGanancia',1);
        /***/

/*
            var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
            var V_LimiteApDep = LimiteApDep[0].valor;
            var CONSTANTES = Meteor.call("Constantes");
         /
        //Meteor.call("ActualizaSaldoTodasMonedas");
        
        Meteor.call("ValidaSaldoEquivalenteActual");
        Meteor.call("ConsultarSaldoTodasMonedas");
        Meteor.call("EquivalenteDolarMinCompra");
        Meteor.call("ActualizaSaldoActual", 'TNT');
        Meteor.call("ActualizaSaldoActual", 'USD');
        /*
            Meteor.call("ListaMonedas");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ValidaSaldoEquivalenteActual");
            //Meteor.call("EjecucionInicial"); 
            Meteor.call("ListaTiposDeCambios", 2);
        /*
            Meteor.call("ValidaMonedasTransfCuentaTRadeo");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ConsultarSaldoTodasMonedas");
            Meteor.call("EquivalenteDolarMinCompra");
            Meteor.call('ListaTradeoActual', TIPO_CAMBIO, 2);
            Meteor.call('EvaluarTendencias', TIPO_CAMBIO, MONEDA_SALDO );
        */   

        //Meteor.call("ActualizaSaldoTodasMonedas");

        
        //Meteor.call("ValidaSaldoEquivalenteActual");
        //Meteor.call("ListaMonedas");
        //Meteor.call("ReinioDeSaldos");  





        
        /*
            //log.info(' Tipo de Cambio T
            IPO_CAMBIO', TIPO_CAMBIO, ' MONEDA_SALDO: ', MONEDA_SALDO);
           
    		for (C = 0, MAXEJC = 5; C < MAXEJC; C++){
    			
            	Meteor.call("ValidaTendenciaTipoCambio", TIPO_CAMBIO, MONEDA_SALDO);
                //Meteor.call("ValidaPropTipoCambiosValidados", MONEDA_SALDO, V_LimiteApDep );
            }
        /* */
        /*
        
        /*
        Monedas.update({
                                        moneda: MON_B
                                    }, 
                                    {
                                        $set:{  "saldo.tradeo.activo": 0.0240,
                                                "saldo.tradeo.reserva": 0
                                        }
                                    },
                                    {"multi" : true }
                    );

        Monedas.update({
                                        moneda: MON_C
                                    }, 
                                    {
                                        $set:{  "saldo.tradeo.activo": 0.00055,
                                                "saldo.tradeo.reserva": 0
                                        }
                                    },
                                    {"multi" : true }
                    );
        Meteor.call("ValidaSaldoEquivalenteActual");

        log.info(' ------------------------- ACA ESTOY -------------------------');
        MAPLICOMIS = MON_C
        var IdTran = Meteor.call("SecuenciasGBL", 'IdGanPerdLocal');
        var IdTransaccionActual = Meteor.call("CompletaConCero", IdTran, 32);
        var IdTransaccionLoteActual = Meteor.call("SecuenciasGBL", 'IdGanPerdLote')    
        /**/
        //Meteor.call("ConsultaCarterasDeposito");
            /*
            //log.info("Datos a enviar: MON_B: ", MON_B, "MON_C: ", MON_C,"TIPO_CAMBIO: ", TIPO_CAMBIO,"MONEDA_SALDO: ", MONEDA_SALDO,"CANT_INVER: ", CANT_INVER,);
            //CrearNuevaOrder':function(TIPO_CAMBIO,T_TRANSACCION,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, IdTransaccionLoteActual){
            //Meteor.call("CrearNuevaOrder", 'ETHBTC', 'sell', '0.0166', 'ETH', 'BTC', 'BTC', 'BTC', IdTransaccionLoteActual);
             MAPLICOMIS = MON_C
            var IdTran = Meteor.call("SecuenciasGBL", 'IdGanPerdLocal');
            var IdTransaccionActual = Meteor.call("CompletaConCero", IdTran, 32);
            var IdTransaccionLoteActual = Meteor.call("SecuenciasGBL", 'IdGanPerdLote') 
            //Meteor.call("CrearNuevaOrder", TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MAPLICOMIS, IdTransaccionLoteActual);

            var datos = new Object();
            datos.clientOrderId=IdTransaccionActual;
            datos.symbol=TIPO_CAMBIO;
            datos.side=TP;
            datos.type='limit';
            datos.timeInForce='GTC';
            datos.quantity=1;
            datos.price=1;
            /**/



            //Meteor.call("CrearNuevaOrderRobot", TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MAPLICOMIS, IdTransaccionLoteActual);
                                        // TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){ 

            /*
            log.info(" Prueba: Valores enviados: ", TIPO_CAMBIO + ' ' + MONEDA_SALDO + ' ' + CANT_INVER );
            log.info('--------------------------------------------');
            log.info('                  PROMEDIO');
            Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //var XPromedio = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //log.info("Calculo X Promedio: ", XPromedio);
            log.info('--------------------------------------------');
            log.info('                  X_ORDEN');
            Meteor.call("CalcularIversionXOrden", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //var XOrden = Meteor.call("CalcularIversionXOrden", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //log.info("Calculo X Orden: ", XOrden);
            log.info('--------------------------------------------');
            log.info('                  X_VOLUMEN');
            Meteor.call("CalcularIversionXVolumen", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //var XVolumen = Meteor.call("CalcularIversionXVolumen", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //log.info("Calculo X Volumen: ", XVolumen);
            log.info('--------------------------------------------');
            /*
            var IdTransaccionActual = "0899750c5384478998adb2818337d627"
            var Orden = Meteor.call("CancelarOrden", IdTransaccionActual );
            log.info("Calculo X Orden: ", Orden);
     
         
        
            //var sal = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
            //log.info("Valor de sal: ", sal);
        /*

            Meteor.call("ConsultarHistoricoOrdenes"); 
        
            /*
                var ORDEN = '00000000000000000000000000000154'

                Meteor.call("ValidaTiempoEspera", ORDEN);
            */

            /*
            var RecalcIverPrec = Meteor.call("CalcularIversionXOrden", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER); 
            var InversionRealCalc = RecalcIverPrec.MontRealIversionCal

            log.info("Valor de IdTransaccionActual: ", IdTransaccionActual, AMBITO);
                log.info("Valor de TIPO_CAMBIO: ", TIPO_CAMBIO, AMBITO);
                log.info("Valor de TP: ", TP, AMBITO);
                log.info("Valor de InversionRealCalc: ", InversionRealCalc, AMBITO);
                log.info("Valor de RecalcIverPrec.MontIversionCal: ", RecalcIverPrec.MontIversionCal, AMBITO);
                log.info("Valor de RecalcIverPrec.MejorPrecCal: ", RecalcIverPrec.MejorPrecCal, AMBITO);
                log.info("Valor de RecalcIverPrec.comision_hbtc: ", RecalcIverPrec.comision_hbtc, AMBITO);
                log.info("Valor de RecalcIverPrec.comision_mercado: ", RecalcIverPrec.comision_mercado, AMBITO);

                var DatosRobot = {  clientOrderId : IdTransaccionActual, 
                                    symbol : TIPO_CAMBIO, 
                                    side : TP, 
                                    timeInForce : 'GTC', 
                                    type : 'limit', 
                                    quantity : RecalcIverPrec.MontIversionCal, 
                                    price : RecalcIverPrec.MejorPrecCal, 
                                    comision_m : RecalcIverPrec.comision_hbtc,  
                                    comision_h : RecalcIverPrec.comision_mercado }

            
            const ORDEN = Meteor.call('GenerarOrderRobot', DatosRobot);

            var IdTransaccionLoteActual = Meteor.call("SecuenciasGBL", 'IdGanPerdLote')
            //(TIPO_CAMBIO, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, DATOS, ID_LOTE){
            Meteor.call("GuardarOrden", TIPO_CAMBIO, CANT_INVER, parseFloat(InversionRealCalc), MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, IdTransaccionLoteActual);
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
            log.info(" Probando".blue,'','Pruebas');
            log.info(" Probando",'','Pruebas');
            log.warn(" Probando",'','Pruebas');
            log.error(" Probando",'','Pruebas');
            console.timeEnd('       TIEMPO TRANSCURRIDO: '+ MON_B);
        /**/
    /*
    log.info(' ');
    log.info(' ');
    log.info('===================================================================================================================================');

    var ResultadoEquvalenciaTipoCambio = Meteor.call("EquivalenteTipoCambio", MONEDA_S_SALDO, CANT_INVER, PRECIO, TIPO_CAMBIO );
    log.info(' ResultadoEquvalenciaTipoCambio: ', ResultadoEquvalenciaTipoCambio);
    /*
    var ResultadoEquivalenteEnDolares = Meteor.call("EquivalenteDolar", MONEDA_S_SALDO, ResultadoEquvalenciaTipoCambio, 2);
    log.info(" ResultadoEquivalenteEnDolares ", ResultadoEquivalenteEnDolares);
    /***/

    //var probando = ParametrosDeAnalisis.find({}).fetch();
    //console.log ('Valor de probando: ', probando)

    // Meteor.call("SecuenciaDeCarga")
 
    /*
    fecha = moment (new Date());
    var SaldoTotal = Meteor.call("ConcultaSaldoTotalMonedas")
    log.info(' Acá estoy ******');
    log.info(" Valor de SaldoTotal ", SaldoTotal);



   





    TempSaldosTotales.update(   { _id : 1, IdLote : 1 }, 
                                                    { $set : {
                                                            'Saldo.Inicial' : SaldoTotal
                                                            }
                                                    },
                                                    { "upsert" : true }); 

    TempSaldosTotales.update(   { _id : 1, IdLote : 1 }, 
                                                    { $set : {
                                                            'Saldo.Final' : 9 
                                                            }
                                                    },
                                                    { "upsert" : true }); 


    TempSaldosTotales.update(   { _id : 2, IdLote : 1 }, 
                                                    { $set : {
                                                            'Saldo.Inicial' :  10 
                                                            }
                                                    },
                                                    { "upsert" : true }); 


    TempSaldosTotales.update(   { _id : 2, IdLote : 1 }, 
                                                    { $set : {
                                                            'Saldo.Final' : 12 
                                                            }
                                                    },
                                                    { "upsert" : true }); 












    /**/

 


    //var nuevo_id = Meteor.call("SecuenciasGBL", 'IdAnalisis')

    /*
    var DatoSaldo = [{ id : nuevo_id , valor : SaldoTotal }]

    var DatoSaldo = [{ id : nuevo_id , valor : SaldoTotal }]

                        ResultadoAnalisis.update({ _id : nuevo_id}, 
                                        { $set : {
                                                    'Fecha' : fecha._d,
                                                    'Saldo.Inicial' : { DatoSaldo }
                                                    'Saldo.Final' : { DatoSaldo }
                                                }
                                        },
                                        { "upsert" : true });

    ResultadoAnalisis.findOne({ nuevo_id })

    DatosSaldos.add ( { id : ResultadoAnalisis.Saldo.Inicial.id , valor : ResultadoAnalisis.Saldo.Inicial.valor } )

    //var DatoSaldo = [{ id : nuevo_id , valor : 10 }]

    DatosSaldos.add ( { id : nuevo_id , valor : 10 } )

    var DatoSaldo = Array.from(DatosSaldos);
    /***/
    /*
    var DatosParametros = Meteor.call("AnalisisConsultarParametros");
    log.info(' Valor de DatosParametros: ', DatosParametros) 
    var DatosSaldosTtl = Meteor.call("AnalisisConsultarSaldosTotales");
    log.info(' Valor de DatosSaldosTtl: ', DatosSaldosTtl) 
    var DatosSaldosMond = Meteor.call("AnalisisConsultarSaldos");        
    log.info(' Valor de DatosSaldosMond: ', DatosSaldosMond)
    var DatosHistGanancPrd = Meteor.call("AnalisisConsultarHistGananPerd");
    log.info(' Valor de DatosHistGanancPrd: ', DatosHistGanancPrd)
    /**/
    //Meteor.call('GuardarDatosAnalisis' , 1 , 1);

    //Meteor.call('GuardarResultadosAnalisis' , 1 );

    //ParametrosAnalisis.update( { "_id" : 1 }, { $set : { "activo" : false } } );

    


    /*

    Jobs.run("JobTipoEjecucion", {
        in: {
            second: 1
        }
    })

    /**/

    Meteor.call('FinEjecucion')
    }
});

