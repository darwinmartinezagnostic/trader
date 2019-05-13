import { Meteor } from 'meteor/meteor';
//import { Constantes } from '../herramientas/Global.js';
moment().tz('America/Caracas').format();

Meteor.methods({

    'Transferirfondos':function(MONEDA, MONTO, TIPO_TRANSF){  //Transfer amount to trading
        var fecha = moment (new Date());
        var FECHA = fecha._d
        var CONSTANTES = Meteor.call("Constantes");
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '         TRANSFERENCIA DE FONDOS');
        console.log('############################################');
        console.log(' ');

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
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Solicitud de Transferencia Realizada Exitosamente']);
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Transacción: ']+[ IdTransferencia ]);
            HistoralTransferencias.insert({ fecha : FECHA, id : IdTransferencia ,tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : "Verificando" })

            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    ID: ']+[IdTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+["VERIFICANDO"]);
            console.log('############################################');
            console.log(' ');

            Meteor.call( 'VerificarTransferencias', IdTransferencia);
        }else{
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+["FALLIDO"]);
            console.log('############################################');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Sulicitud de Transferencia Fallida'] );
        };       
    },

    'RetiroFondos':function(){ //Withdraw crypro

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza el retiro de los fondos de las monedas en estado de reserva');
        console.log(' ');
    },

    'ConsultaRetiroFondos':function(){ //Commit withdraw crypro

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza consulta de transacción retiro de los fondos en proceso');
        console.log(' ');
    },

    'CancelaRetiroFondos':function(){   //Rollback withdraw crypro

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza cancelación de transacción retiro de los fondos en proceso');
        console.log(' ');
    },

});