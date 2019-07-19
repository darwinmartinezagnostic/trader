import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({

    'GuardarLogEjecucionTrader':function ( MENSAJE ) {
		Nfecha = moment(new Date())
        var nuevo_id_ejecucion = Meteor.call("SecuenciasGBL", 'IdLog')
        LogEjecucionTrader.insert({  _id : nuevo_id_ejecucion.toString() , fecha: Nfecha._d ,descripcion : MENSAJE});
        log.info( MENSAJE);
        log.info(' ');
    },
	
});