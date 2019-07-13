import { Meteor } from 'meteor/meteor';
//import { Constantes } from '../herramientas/Global.js';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({

    'Transferirfondos':function(MONEDA, MONTO, TIPO_TRANSF){  //Transfer amount to trading
        var fecha = moment (new Date());
        var FECHA = fecha._d
        var CONSTANTES = Meteor.call("Constantes");
        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '         TRANSFERENCIA DE FONDOS');
        //log.info('############################################');
        //log.info(' ');

        //HAY 2 TIPOS DE TRANSFERENCIAS
        // "bankToExchange" Del Saldo de la cuenta a el Saldo de Trader
        // "exchangeToBank" Del Saldo de Trader a el Saldo de la cuenta

        datos=  'currency='+MONEDA+'&amount='+MONTO+'&type='+TIPO_TRANSF;

        var url_orden = CONSTANTES.transferencia;

        var NuevaTransferencia = Meteor.call("ConexionPost", url_orden, datos);

        var StatusEjecucion = parseFloat(NuevaTransferencia.code);

        if (StatusEjecucion > 0) {
            VStatusEjecucion = 1
        }else{
            VStatusEjecucion = 0
        }

        switch ( TIPO_TRANSF ) {
            case 'bankToExchange':
                TipoTransferencia = 'Cuenta - Trader';
            break;
            case 'exchangeToBank':
                TipoTransferencia = 'Trader - Cuenta';
            break;
        }

        
        if ( VStatusEjecucion === 0 ) {
            
            var IdTransferencia = NuevaTransferencia.id;
            //Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Solicitud de Transferencia Realizada Exitosamente']);
            //Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Transacción: ']+[ IdTransferencia ]);
            HistoralTransferencias.insert({ fecha : FECHA, id : IdTransferencia ,tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : "Verificando" })

            //log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            //log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    ID: ']+[IdTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+["VERIFICANDO"]);
            //log.info('############################################');
            //log.info(' ');

            var VEstatus = Meteor.call( 'VerificarTransferencias', IdTransferencia);

            var sal = new Set();
            sal.add( 0 );
            sal.add( IdTransferencia );
            sal.add( VEstatus );
            var salida = Array.from(sal);
            return salida;
        }else{
            //log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+["FALLIDO"]);
            //log.info('############################################');
            //log.info(' ');
            //Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Sulicitud de Transferencia Fallida'] );
            var sal = new Set();
            sal.add( 1 );
            var salida = Array.from(sal);
            return salida;
        };       
    },

    'RetiroFondos':function(){ //Withdraw crypro

        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza el retiro de los fondos de las monedas en estado de reserva');
        //log.info(' ');
    },

    'ConsultaRetiroFondos':function(){ //Commit withdraw crypro

        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza consulta de transacción retiro de los fondos en proceso');
        //log.info(' ');
    },

    'CancelaRetiroFondos':function(){   //Rollback withdraw crypro

        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza cancelación de transacción retiro de los fondos en proceso');
        //log.info(' ');
    },

});