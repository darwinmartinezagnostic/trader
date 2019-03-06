import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'GuardarLogEjecucionTrader':function (MENSAJE) {
        var nuevo_id_ejecucion = Meteor.call('CalculaId', 1);
        LogEjecucionTrader.insert({fecha: new Date(), id : nuevo_id_ejecucion ,descripcion : MENSAJE});
        console.log( MENSAJE);
        console.log(' ');
    },
	
});