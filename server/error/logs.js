import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'GuardarLogEjecucionTrader':function ( MENSAJE ) {
		Nfecha = moment(new Date())
        var nuevo_id_ejecucion = Meteor.call("SecuenciasGBL", 'IdLog')
        LogEjecucionTrader.insert({  _id : nuevo_id_ejecucion.toString() , fecha: Nfecha._d ,descripcion : MENSAJE});
        console.log( MENSAJE);
        console.log(' ');
    },
	
});