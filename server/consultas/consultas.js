import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();
//var CONSTANTES = Meteor.call("Constantes");

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({

    'ConsultarTransaciones':function(TRANSACCIONES){
        var CONSTANTES = Meteor.call("Constantes");
        //para verificar las transaccion solo por monedas especifica se realiza la contruccion parcial de la URL anexando la abreviatura de la monedas ejemp "BTC"
        //const url_transaccion_parcial= ['currency=']+['<abreviatura moneda>']+['&sort=ASC&by=timestamp&limit=']+[cant_transacciones];

        //para verificar una transaccion en especifica se anexar al final de la contrccion de la URL ID de la transaccion ejemp "f672d164-6c6d-4bbd-9ba3-401692b3b404"
        // var Url_Transaccion = [transacciones]+'/'+[<varible de entrada = D de la transaccion>];
        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Devuelve los datos Historicos de Transacciones realizadas en la cuenta');
        //log.info(' ');
        var url_transaccion_parcial=['sort=ASC&by=timestamp&limit=']+[TRANSACCIONES];
        var url_transaccion_completa=[CONSTANTES.transacciones]+'?'+[url_transaccion_parcial];
        log.info(' Valor de URL transacciones:', url_transaccion_completa,'Consultas');

        var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
        //var v_transaccion=(transaccion.data); 
        var v_transaccion=transaccion;

        //log.info(v_transaccion);

        for (k = 0, len = v_transaccion.length; k < len; k++) {
            //log.info('############################################');
            transaccion = v_transaccion[k];
            Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[transaccion.id]);
            Meteor.call("GuardarLogEjecucionTrader", [' INDICE: ']+[transaccion.index]);
            Meteor.call("GuardarLogEjecucionTrader", [' TIPO: ']+[transaccion.type]);
            Meteor.call("GuardarLogEjecucionTrader", [' STATUS: ']+[transaccion.status]);
            Meteor.call("GuardarLogEjecucionTrader", [' MONEDA: ']+[transaccion.currency]);
            Meteor.call("GuardarLogEjecucionTrader", [' MONTO: ']+[transaccion.amount]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA CREACION: ']+[transaccion.createdAt]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA DE CAMBIO: ']+[transaccion.updatedAt]);
            Meteor.call("GuardarLogEjecucionTrader", [' HASH: ']+[transaccion.hash]);
            //log.info('############################################');
           // log.info(' ');
        };
    },

    'ConsultaOrdenesAbiertas':function(TIPO_CAMBIO){
        var CONSTANTES = Meteor.call("Constantes");
        var url_orden = [CONSTANTES.ordenes]+['?symbol=']+[TIPO_CAMBIO]
        var OrdeneAbiertas = Meteor.call("ConexionGet",url_orden);
        var OrdAbi = OrdeneAbiertas[0]

        if ( OrdAbi === undefined ) {
            //log.info('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", "     --- No hay ordenes Abiertas ---");
            //log.info('--------------------------------------------');
            var Estado_Orden ='Fallido'
        }
        else{
            log.info("Ordenes Activas: ", OrdeneAbiertas,'Consultas');
            var Estado_Orden = OrdAbi.status
            log.info('Valor de Estado_Orden', Estado_Orden,'Consultas');
        }
        return Estado_Orden
    },

    'ConsultarSaldoTodasMonedas':function(){
        var MonedasSaldoActual = Monedas.find( { $or : [{"saldo.tradeo.activo" : { $gt : 0 }},{ "saldo.cuenta.activo" : { $gt : 0 } }]}).fetch()

        for ( cmsa = 0, tmsa = MonedasSaldoActual.length; cmsa < tmsa; cmsa++ ) {
            var v_BMonedasSaldoActual = MonedasSaldoActual[cmsa];
            //log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Saldo disponible');
            //log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['  ********* ']+[' MONEDA: ']+[v_BMonedasSaldoActual.moneda]+[' ********* ']);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO: ']+[v_BMonedasSaldoActual.saldo.tradeo.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.tradeo.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO EN CUENTA: ']+[v_BMonedasSaldoActual.saldo.cuenta.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.cuenta.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            //log.info('############################################');
            //log.info(' ');
        }
    },

    'ConsultarHistoricoOrdenes':function(){
        var CONSTANTES = Meteor.call("Constantes");
        var url_transaccion_completa=[CONSTANTES.HistTradeo]+['?sort=DESC&by=timestamp&limit=100']
        var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
        if ( transaccion !== undefined) {
        

            for (k = 0, len = transaccion.length; k < len; k++) {
                trans = transaccion[k];
                //var IdTran = Meteor.call('CalculaId', 2);
                //log.info(' Estoy acá')
                var IdTran = Meteor.call("SecuenciasGBL", 'IdGanPerdLocal');
                var IdTransaccionActual = Meteor.call("CompletaConCero", parseFloat(IdTran), 32);            
                var url_trans_orden=[CONSTANTES.HistOrdenes]+['/']+[trans.orderId]+['/trades']
                var ComisionTansacion = Meteor.call("ConexionGet", url_trans_orden);
                var ValorTP = TiposDeCambios.aggregate([  { $match : { tipo_cambio : trans.symbol }} ])
                
                var V_IdHitBTC = trans.id
                var V_Id_Transhitbtc = trans.orderId
                var clientOrderId = trans.clientOrderId
                var LOTE = 0
                var TipoCambio = trans.symbol
                var MON_B = ValorTP[0].moneda_base
                var MON_C = ValorTP[0].moneda_cotizacion
                var status = trans.status
                var V_FormaOperacion = trans.side        
                var V_SaldoInversion = trans.quantity;
                var precio = trans.price
                var V_Comision = trans.fee
                var Equiv_V_Comision = 0
                var FechaCreacion = trans.timestamp
                var FechaActualizacion = trans.timestamp
                

                var FechaTradeoAnteriorMC = trans.timestamp
                var SaldoTradeoAnteriorMC = 0
                var FechaTradeoActualMC = trans.timestamp
                var FechaTradeoActualMB = trans.timestamp
                var FechaTradeoAnteriorMB = trans.timestamp
                var SaldoTradeoActualMB = 0
                var V_EquivalenciaTradeoAnteriorMC = 0
                var V_EquivalenciaTradeoActualMB = 0
                var Eqv_V_InverSaldAnt = 0
                var V_EquivSaldoMonedaAdquirida = 0
                var V_Ganancia = 0
                var SaldoTradeoAnteriorMB = 0
                var V_EquivalenciaTradeoAnteriorMB = 0
                var SaldoTradeoActualMC = 0
                var V_EquivalenciaTradeoActualMC = 0
                var Eqv_V_InverSaldAct = 0
                var SaldoMonedaAdquirida = 0
                var REAL_INVER = 0
                
                if ( V_FormaOperacion == 'sell') {
                    GananciaPerdida.insert({    
                                                Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                Id_Transhitbtc : V_Id_Transhitbtc,
                                                                ID_LocalAnt : clientOrderId,
                                                                ID_LocalAct : IdTransaccionActual,
                                                                Id_Lote: LOTE,
                                                                Tipo : V_FormaOperacion,
                                                                TipoCambio : TipoCambio,
                                                                Base : MON_B,
                                                                Cotizacion : MON_C,
                                                                Status : status,
                                                                FechaCreacion : FechaCreacion,
                                                                FechaActualizacion : FechaActualizacion
                                                },
                                                Moneda : {  Emitida : {     moneda : MON_B,
                                                                            Fecha : FechaTradeoActualMB,
                                                                            Saldo_Anterior : SaldoTradeoAnteriorMB,
                                                                            Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMB,
                                                                            Saldo_Actual : SaldoTradeoActualMB,
                                                                            Equivalente_Actual : V_EquivalenciaTradeoActualMB

                                                            },
                                                            Adquirida : {   moneda : MON_C,
                                                                            Fecha : FechaTradeoActualMC,
                                                                            Saldo_Anterior : SaldoTradeoAnteriorMC,
                                                                            Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMC,
                                                                            Saldo_Actual : SaldoTradeoActualMC,
                                                                            Equivalente_Actual : V_EquivalenciaTradeoActualMC
                                                            }
                                                },
                                                Inversion : {   Saldo : REAL_INVER,
                                                                Equivalencia : {    Dolar : { Inicial : Eqv_V_InverSaldAnt,
                                                                                                    Final : Eqv_V_InverSaldAct},
                                                                                    MonedaCambio : { Valor : SaldoMonedaAdquirida }
                                                                                },
                                                                Precio : precio,
                                                                Comision : {    moneda : MON_C,
                                                                                Valor : V_Comision,
                                                                                Equivalencia : Equiv_V_Comision}
                                                }
                                            });
                }else if ( V_FormaOperacion == 'buy') {

                    GananciaPerdida.insert({    
                                                Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                Id_Transhitbtc : V_Id_Transhitbtc,
                                                                ID_LocalAnt : IdTransaccionActual,
                                                                ID_LocalAct : IdTransaccionActual,
                                                                Id_Lote: LOTE,
                                                                Tipo : V_FormaOperacion,
                                                                TipoCambio : TipoCambio,
                                                                Base : MON_B,
                                                                Cotizacion : MON_C,
                                                                Status : status,
                                                                FechaCreacion : FechaCreacion,
                                                                FechaActualizacion : FechaActualizacion},
                                                Moneda : {  Emitida : { moneda : MON_C,
                                                                        Fecha : FechaTradeoActualMC,
                                                                        Saldo_Anterior : SaldoTradeoAnteriorMC,
                                                                        Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMC,
                                                                        Saldo_Actual : SaldoTradeoActualMC,
                                                                        Equivalente_Actual : V_EquivalenciaTradeoActualMC
                                                            },
                                                            Adquirida : {   moneda : MON_B,
                                                                            Fecha : FechaTradeoAnteriorMB,
                                                                            Saldo_Anterior : SaldoTradeoAnteriorMB,
                                                                            Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMB,
                                                                            Saldo_Actual : SaldoTradeoActualMB,
                                                                            Equivalente_Actual : V_EquivalenciaTradeoActualMB
                                                            }},
                                                Inversion : {   Saldo : REAL_INVER,
                                                                Equivalencia : {    Dolar : { Inicial : Eqv_V_InverSaldAnt,
                                                                                                Final : Eqv_V_InverSaldAct},
                                                                                    MonedaCambio : { Valor : SaldoMonedaAdquirida }
                                                                            },
                                                                Precio : precio,
                                                                Comision : {    moneda : MON_C,
                                                                                Valor : V_Comision,
                                                                                Equivalencia : Equiv_V_Comision}
                                                            }
                                            });
                }
                /**/
            };
        }

        /*
        var fechaActual = new Date();
        var AnioAct = fechaActual.getFullYear();


        var url_transaccion_TrasIni=[CONSTANTES.HistTradeo]+['?sort=ASC&by=id&limit=1']
        var TrasIni = Meteor.call("ConexionGet", url_transaccion_TrasIni);
        var FechaTrasIniRecib = TrasIni[0].timestamp;
        var FTrans = new Date(FechaTrasIniRecib);
        var ANIO_INICIO = FTrans.getFullYear();
        //var AnioInicio = parseFloat(ANIO_INICIO);
        var AnioInicio = parseFloat(2019);

        while ( AnioInicio <=  parseFloat(AnioAct) ){
            log.info('############################################');
            log.info("         Año a Recuperar:", AnioInicio);
            log.info('############################################');
            var MES = 1;
            while ( MES < 13 ){
                V_MES = Meteor.call('CompletaConCero', MES, 2);
                log.info("            MES:", V_MES);

                var date = new Date(AnioInicio,MES);
                var primerDia = new Date(date.getFullYear(), date.getMonth(), 1)
                var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                var PD = Meteor.call('CompletaConCero', primerDia.getDate(), 2);
                var UD = Meteor.call('CompletaConCero', ultimoDia.getDate(), 2);var FechaInicial = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ PD ]+['T00%3A00%3A00']
                var UltimoDiaAnio = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ UD ]+['T23%3A59%3A59']                

                log.info("Fecha Inicial: ", FechaInicial, " Fecha Final: ", UltimoDiaAnio);
                log.info(' ');

                var url_transaccion_completa=[CONSTANTES.HistTradeo]+['?sort=ASC']+['&by=timestamp&from=']+[FechaInicial]+['&by=timestamp&from=']+[UltimoDiaAnio]
                var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
                
                if ( transaccion !== undefined) {

                    for (k = 0, len = transaccion.length; k < len; k++) {
                        trans = transaccion[k];
                        var IdTran = Meteor.call('CalculaId', 2);
                        var IdTransaccionActual = Meteor.call("CompletaConCero", parseFloat(IdTran), 32);            
                        var url_trans_orden=[CONSTANTES.HistOrdenes]+['/']+[trans.orderId]+['/trades']
                        var ComisionTansacion = Meteor.call("ConexionGet", url_trans_orden);
                        
                        var ValorTP = TiposDeCambios.aggregate([  { $match : { tipo_cambio : trans.symbol }} ])
                        
                        var V_IdHitBTC = trans.id
                        var V_Id_Transhitbtc = trans.orderId
                        var clientOrderId = trans.clientOrderId
                        var LOTE = 0
                        var TipoCambio = trans.symbol
                        var MON_B = ValorTP[0].moneda_base
                        var MON_C = ValorTP[0].moneda_cotizacion
                        var status = trans.status
                        var V_FormaOperacion = trans.side        
                        var V_SaldoInversion = trans.quantity;
                        var precio = trans.price
                        var V_SaldoAcumulado = trans.cumQuantity
                        var V_Comision = ComisionTansacion[0].fee
                        var Equiv_V_Comision = 0
                        var FechaCreacion = trans.createdAt
                        var FechaActualizacion = trans.createdAt
                        

                        var FechaTradeoAnteriorMC = trans.updatedAt
                        var SaldoTradeoAnteriorMC = 0
                        var FechaTradeoActualMB = trans.createdAt
                        var SaldoTradeoActualMB = 0
                        var V_EquivalenciaTradeoAnteriorMC = 0
                        var V_EquivalenciaTradeoActualMB = 0
                        var Eqv_V_InverSaldAnt = 0
                        var V_EquivSaldoMonedaAdquirida = 0
                        var V_Ganancia = 0

                        
                        if ( V_FormaOperacion == 'sell') {
                            GananciaPerdida.insert({    
                                                        Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                        Id_Transhitbtc : V_Id_Transhitbtc,
                                                                        ID_LocalAnt : clientOrderId,
                                                                        ID_LocalAct : IdTransaccionActual,
                                                                        Id_Lote: LOTE,
                                                                        Tipo : V_FormaOperacion,
                                                                        TipoCambio : TipoCambio,
                                                                        Precio : precio,
                                                                        Status : status,
                                                                        FechaCreacion : FechaCreacion,
                                                                        FechaActualizacion : FechaActualizacion},
                                                        Comision : {    Valor : V_Comision,
                                                                        Equivalencia : Equiv_V_Comision},
                                                        Moneda : {  Emitida : { moneda : MON_B,
                                                                                Fecha : FechaTradeoActualMB,
                                                                                Saldo : SaldoTradeoActualMB,
                                                                                Equivalente : V_EquivalenciaTradeoActualMB},
                                                                    Adquirida : { moneda : MON_C,
                                                                                Fecha : FechaTradeoAnteriorMC,
                                                                                Saldo : SaldoTradeoAnteriorMC,
                                                                                Equivalente : V_EquivalenciaTradeoAnteriorMC}},
                                                        Inversion : { SaldoInversion  : V_SaldoInversion,
                                                                        Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                                            Final : V_EquivSaldoMonedaAdquirida}},
                                                        Ganancia : { Valor :  V_Ganancia}
                                                    });
                        }else if ( V_FormaOperacion == 'buy') {
                            GananciaPerdida.insert({    
                                                        Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                        Id_Transhitbtc : V_Id_Transhitbtc,
                                                                        ID_LocalAnt : clientOrderId,
                                                                        ID_LocalAct : IdTransaccionActual,
                                                                        Id_Lote: LOTE,
                                                                        Tipo : V_FormaOperacion,
                                                                        TipoCambio : TipoCambio,
                                                                        Precio : precio,
                                                                        Status : status,
                                                                        FechaCreacion : FechaCreacion,
                                                                        FechaActualizacion : FechaActualizacion},
                                                        Comision : {    Valor : V_Comision,
                                                                        Equivalencia : Equiv_V_Comision},
                                                        Moneda : {  Emitida : { moneda : MON_C,
                                                                                Fecha : FechaTradeoAnteriorMC,
                                                                                Saldo : SaldoTradeoAnteriorMC,
                                                                                Equivalente : V_EquivalenciaTradeoAnteriorMC},
                                                                    Adquirida : { moneda : MON_B,
                                                                                Fecha : FechaTradeoActualMB,
                                                                                Saldo : SaldoTradeoActualMB,
                                                                                Equivalente : V_EquivalenciaTradeoActualMB}},
                                                        Inversion : { SaldoInversion  : V_SaldoInversion,
                                                                        Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                                            Final : V_EquivSaldoMonedaAdquirida}},
                                                        Ganancia : { Valor :  V_Ganancia}
                                                    });
                        }
                    };
                }
                MES += 1
            }
            AnioInicio += 1
        }
        /**/
       // log.info('############################################');
    },
    
    'ConcultaTiposCambiosAInvertir':function(){

        var Monedas_Saldo = Monedas.aggregate([
                        { $match : { $or : [{"saldo.tradeo.activo" : { $gt : 0 }},{ "moneda" : 'BTC' }] , "activo" : "S"}},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]);


        for (CMS = 0, TMS = Monedas_Saldo.length; CMS < TMS; CMS++){
            var moneda_saldo =  Monedas_Saldo[CMS];
            var MONEDA = moneda_saldo.moneda 

            var TmpTCMB = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_base" : MONEDA, "estado" : 'A' }}, { $sort: { "periodo1.Base.tendencia" : -1 }}, { $limit: 3 } ]);
            var TmpTCMC = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_cotizacion" : MONEDA, "estado" : 'A' }}, { $sort: { "periodo1.Cotizacion.tendencia" : -1 }}, { $limit: 3 } ]);
            //log.info('-------------------------------------------');
            log.info('      MONEDA :', MONEDA,'Consultas');
            log.info('Valor de TmpTCMB: ', TmpTCMB,'Consultas');
            for (CTMCB = 0, T_TmpTCMB = TmpTCMB.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMB = TmpTCMB[CTMCB];
                log.info('Valor de TmpTCMB: ', TmpTCMB,'Consultas');

            }

            for (CTMCB = 0, T_TmpTCMB = TmpTCMC.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMC = TmpTCMC[CTMCB];
                log.info('Valor de TmpTCMB: ', TmpTCMB,'Consultas');
            }
        }
    },

    'ConcultaSaldoTotalMonedas':function(){
        var SaldoTotal = Monedas.aggregate( { $match : {"saldo.tradeo.equivalencia" : { $ne : 0 }}},
                                            { $group: {
                                                        _id: 0,
                                                        TotalEquivalente: {
                                                            $sum: "$saldo.tradeo.equivalencia"
                                                        }
                                                    }
                                            },
                                            {
                                                $project: {
                                                    _id: 0,
                                                    TotalEquivalente: 1
                                            }});
        
        //log.info(" Valor de SaldoTotal ", SaldoTotal[0]);
        return SaldoTotal[0].TotalEquivalente;
    },
});