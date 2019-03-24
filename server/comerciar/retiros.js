import { Meteor } from 'meteor/meteor';
//import { Constantes } from '../herramientas/Global.js';
moment().tz('America/Caracas').format();

Meteor.methods({

    'Transferirfondos':function(MONEDA, MONTO, TIPO_TRANSF){  //Transfer amount to trading
        var CONSTANTES = Meteor.call("Constantes");
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '         TRANSFERENCIA DE FONDOS');
        console.log('############################################');
        console.log(' ');
        //console.log("Valores recibidos, MONEDA:", MONEDA, " MONTO: ", MONTO, " TIPO_TRANSF:", TIPO_TRANSF);

        //HAY 2 TIPOS DE TRANSFERENCIAS
        // "bankToExchange" Del Saldo de la cuenta a el Saldo de Trader
        // "exchangeToBank" Del Saldo de Trader a el Saldo de la cuenta

        var datos = new Object();
        datos.currency= MONEDA;
        datos.amount = MONTO;
        datos.type = TIPO_TRANSF;

        var url_orden = CONSTANTES.transferencia;

        //try{
            var NuevaTransferencia = Meteor.call("ConexionPost", url_orden, datos);
            //console.log("Valore de NuevaTransferencia", NuevaTransferencia);
        //}
        /*catch (error){
            Meteor.call("ValidaError", error, 1)
        };*/
        if ( NuevaTransferencia === undefined ) {
            var StatusEjecucion = 1;
        }else{
            var StatusEjecucion = NuevaTransferencia.statusCode;
            var IdTransferencia = NuevaTransferencia.data.id;
            //console.log("Valore de StatusEjecucion", StatusEjecucion);
            //console.log("Valore de IdTransferencia", IdTransferencia);
        };

        switch ( TIPO_TRANSF ) {
            case 'bankToExchange':
                TipoTransferencia = 'Cuenta - Trader';
            break;
            case 'exchangeToBank':
                TipoTransferencia = 'Trader - Cuenta';
            break;
        }

        var FECHA = new Date()

        if ( StatusEjecucion === 200 ) {

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


            var VEstatus = Meteor.call( 'VerificarTransferencias', IdTransferencia);

            var sal = new Set();
            sal.add( 0 );
            sal.add( IdTransferencia );
            sal.add( VEstatus );
            var salida = Array.from(sal);
            return salida;
        }
        else{
            //HistoralTransferencias.insert({ fecha : FECHA, id : "IdTransferencia" ,tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : "Fallido" })

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
            var sal = new Set();
            sal.add( 1 );
            var salida = Array.from(sal);
            return salida;
        }        
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