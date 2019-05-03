import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'GuardarLogEjecucionTrader':function ( MENSAJE ) {
		Nfecha = moment(new Date())
        var nuevo_id_ejecucion = Meteor.call('CalculaId', 1);
        LogEjecucionTrader.insert({fecha: Nfecha._d , id : nuevo_id_ejecucion ,descripcion : MENSAJE});
        console.log( MENSAJE);
        console.log(' ');
    },
	
});