import { Meteor } from 'meteor/meteor';
import { Jobs } from 'meteor/msavin:sjobs';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();


Meteor.methods({

    'VerificarHistoricoEstadoOrden':function(ORDEN){
        var CONSTANTES = Meteor.call("Constantes");
        Meteor.call('sleep',1);
        //Maximo TiempoEspera = 6000
        TiempoEspera = 6000;
        // AGREGAR A URL LIMITE DE ORDENES A OBTENER
        Url_VerificarHistOrden = [CONSTANTES.HistOrdenes]+['?clientOrderId=']+[ORDEN];
        v_Estado_Orden = Meteor.call('ConexionGet', Url_VerificarHistOrden );
        //var EstadoOrden=(v_Estado_Orden.data[0]);
        var EstadoOrden=(v_Estado_Orden[0]);
        Url_HistOrdenIdTrdades = [CONSTANTES.HistOrdenes]+['/']+[EstadoOrden.id]+['/trades'];
        V_Desc_Orden = Meteor.call('ConexionGet', Url_HistOrdenIdTrdades );
        //DescOrden = V_Desc_Orden.data[0];
        DescOrden = V_Desc_Orden[0];
        
        Estado = { 'Id': EstadoOrden.id, 'IdOrdenCliente': EstadoOrden.clientOrderId, 'TipoCambio': EstadoOrden.symbol, 'TipoOperacion': EstadoOrden.side, 'Estado':EstadoOrden.status, 'FormaDeOperacion': EstadoOrden.type,'CantidadRecibida': DescOrden.quantity, 'Precio': DescOrden.price, 'Comision': DescOrden.fee, 'Fecha': DescOrden.timestamp }

        return Estado;
    },

	'ValidarEstadoOrden': function( VAL_ORDEN){
        var CONSTANTES = Meteor.call("Constantes");
        /////////////////////////////////////////////////////
        log.info(' "ValidarEstadoOrden" - Recibiendo valores: VAL_ORDEN', VAL_ORDEN);

        T_id = VAL_ORDEN.id
        T_clientOrderId = VAL_ORDEN.clientOrderId
        T_symbol = VAL_ORDEN.symbol
        T_side = VAL_ORDEN.side
        T_status = VAL_ORDEN.status
        T_type = VAL_ORDEN.type
        T_timeInForce = VAL_ORDEN.timeInForce
        T_quantity = VAL_ORDEN.quantity
        T_price = VAL_ORDEN.price
        T_cumQuantity = VAL_ORDEN.cumQuantity
        T_createdAt = VAL_ORDEN.createdAt
        T_updatedAt = VAL_ORDEN.updatedAt
        T_postOnly = VAL_ORDEN.postOnly

        try{
            var url_tranOA=[CONSTANTES.ordenes]+['?clientOrderId=']+[T_clientOrderId]+['?wait=300']
            //var Url_TransTP=[CONSTANTES.HistOrdenes]+['?symbol=']+[T_symbol]+['&limit=50']
            var Url_TransTP=[CONSTANTES.HistOrdenes]+['?clientOrderId=']+[T_clientOrderId]
            //var Url_TransID=[CONSTANTES.HistOrdenes]+['/']+[T_id]+['/trades']
        }catch(error){
            log.info('Error consultando HITBTC');
        }
        /*
        log.info('Valor de url_tranOA', url_tranOA)
        log.info('Valor de Url_TransTP', Url_TransTP)
        //log.info('Valor de Url_TransID', Url_TransID)
        /**/

        const TrnsOA = Meteor.call("ConexionGet", url_tranOA)   
        var transOA = TrnsOA[0];
        const TrnsTP = Meteor.call("ConexionGet", Url_TransTP)
        var transTP = TrnsTP[0];
        /*
        log.info('Valor de transOA', transOA)
        log.info('Valor de transTP', transTP)
        /**/
        if (transOA === undefined && transTP === undefined) {
            var StatusOrden = T_status;
            var Estado_Orden = { id: T_id, clientOrderId: T_clientOrderId, symbol: T_symbol, side: T_side, status: StatusOrden, type: T_type, timeInForce: T_timeInForce, quantity: T_quantity, price: T_price, cumQuantity: T_cumQuantity, createdAt: T_createdAt,updatedAt: T_updatedAt, postOnly: T_postOnly }
        }else{
            if ( transOA === undefined ) {
                if ( transTP.clientOrderId === T_clientOrderId ) {
                        var StatusOrden = transTP.status;
                        var Estado_Orden = { id: T_id, T_clientOrderId: T_clientOrderId, symbol: T_symbol, side: T_side, status: StatusOrden, type: T_type, timeInForce: T_timeInForce, quantity: T_quantity, price: T_price, cumQuantity: T_cumQuantity, createdAt: T_createdAt,updatedAt: T_updatedAt, postOnly: T_postOnly }
                    } 

            }else{
                var IdOdenClient = transOA.clientOrderId
                if ( IdOdenClient !== T_clientOrderId ) {
                    if ( transTP.clientOrderId === T_clientOrderId ) {
                        var StatusOrden = transTP.status;
                        var Estado_Orden = { id: T_id, clientOrderId: T_clientOrderId, symbol: T_symbol, side: T_side, status: StatusOrden, type: T_type, timeInForce: T_timeInForce, quantity: T_quantity, price: T_price, cumQuantity: T_cumQuantity, createdAt: T_createdAt,updatedAt: T_updatedAt, postOnly: T_postOnly }
                    }           
                }else{
                    var Estado_Orden = transOA
                }
            }            
        }

        //log.info('Valor de Estado_Orden', Estado_Orden)
        return Estado_Orden
    },

    'EstadoOrdenVerificar':function( TIPO_CAMBIO , CANT_INVER, InversionRealCalc, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, ID_LOTE ) {
    	var AMBITO = 'EstadoOrdenVerificar'; 
        Meteor.call("GuardarLogEjecucionTrader", [' EstadoOrdenVerificar - Valores Recibido: TIPO_CAMBIO"']+[TIPO_CAMBIO]+[' ,CANT_INVER :']+[CANT_INVER]+[', InversionRealCalc : ']+[InversionRealCalc]+[', MON_B :']+[MON_B]+[', MON_C :']+[ MON_C]+[', MONEDA_SALDO :']+[ MONEDA_SALDO]+[', MONEDA_COMISION :']+[MONEDA_COMISION]+[', ORDEN :']+[ORDEN]+[', ID_LOTE :']+[ID_LOTE]);
    	log.info(' Valor de ORDEN: ', ORDEN, AMBITO);
    	fecha = moment (new Date());
        var T_clientOrderId = ORDEN.clientOrderId
        var T_status = ORDEN.status
        var V_IdHitBTC = ORDEN.id


        GananciaPerdida.update( {   "Operacion.ID_LocalAct" : T_clientOrderId, "Operacion.Id_Lote": ID_LOTE }, 
                                {
                                    $set: {
                                            "Operacion.Status" : 'En seguimiento',
                                            "Operacion.FechaActualizacion" : fecha._d
                                            }
                                }
                                );
        
        Monedas.update({ "moneda": MONEDA_SALDO }, {    
                        $set: {
                                "activo": "N"
                            }
                        });

        Jobs.run("JobsValidarEstadoOrden", TIPO_CAMBIO , CANT_INVER, InversionRealCalc, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, ID_LOTE, T_clientOrderId ,{ 
		   	in: {
                minute: 1
            }
		})
    },

    'EstadoOrdenFallida':function( ORDEN, ID_LOTE, MONEDA_SALDO, Estado_Orden ) {
    	fecha = moment (new Date());
    	var AMBITO = 'EstadoOrdenFallida';
        var V_IdHitBTC = ORDEN.id
        var IdTransaccionActual = ORDEN.clientOrderId;

    	log.info(' ORDEN: ', ORDEN);
        log.info(' ID_LOTE: ', ID_LOTE);
        log.info(' MONEDA_SALDO: ', MONEDA_SALDO);
        log.info(' Estado_Orden: ', Estado_Orden);
        log.info(' IdTransaccionActual: ', IdTransaccionActual);
        /**/
        GananciaPerdida.update( {    "Operacion.ID_LocalAct" : IdTransaccionActual, "Operacion.Id_Lote": ID_LOTE },
                                {
                                    $set: {
                                            "Operacion.Status" : 'Fallido',
                                            "Operacion.FechaActualizacion" : fecha._d
                                            }
                                }
                                );


        TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
    },

    'EstadoOrdenCompletada':function( TIPO_CAMBIO , CANT_INVER, InversionRealCalc, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE ) {
    	fecha = moment (new Date());
    	var AMBITO = 'EstadoOrdenCompletada'
    	log.info(" EstadoOrdenCompletada : Voy a Guardar", AMBITO);
        log.info(' Valor de Orden 13: ', Orden, AMBITO);
        log.info(" if ( Estado_Orden === filled ) : Enviando ", TIPO_CAMBIO+' '+ CANT_INVER+' '+ InversionRealCalc+' '+MON_B+' '+MON_C+' '+MONEDA_SALDO+' '+MONEDA_COMISION+' '+Orden+' '+ID_LOTE, AMBITO);
        var LimiteMaximoDeCompras = Parametros.findOne({ "dominio": "limites", "nombre": "CantMaximaDeCompras"});
        var V_LimiteMaximoDeCompras = LimiteMaximoDeCompras.valor

        Meteor.call('GuardarOrden', TIPO_CAMBIO, CANT_INVER, parseFloat(InversionRealCalc), MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );
        
        if ( V_LimiteMaximoDeCompras > 0 && V_LimiteMaximoDeCompras !== 9999999999 ) {

            V_LimiteMaximoDeCompras = V_LimiteMaximoDeCompras - 1
                        
            Parametros.update({ "dominio": "limites", "nombre": "CantMaximaDeCompras" }, {
                                    $set: {
                                                "valor": V_LimiteMaximoDeCompras,
                                                "fecha_actualizacion" : fecha._d
                                    }
                                });
        };
    },


});