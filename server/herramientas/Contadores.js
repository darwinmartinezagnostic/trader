import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();
const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
LogFile.enable();

Meteor.methods({
	'ContadorMuestreoGeneral':function(){
		var AMBITO = 'ContadorMuestreoGeneral';
		var LMG = Parametros.findOne({ "dominio": "limites", "nombre": "MuestreoGeneral"});
        var V_LMG = LMG.valor
        log.info('Valor de V_AnteriorLimiteMuestreoGeneral: ', V_LMG.toString(),  AMBITO);
        if ( V_LMG > 0 ) {
            V_NuevoLimiteMuestreoGeneral = V_LMG - 1                                    
            fecha = moment (new Date());
            Parametros.update({ dominio: "limites", nombre: "MuestreoGeneral"}, {
                                $set: {
                                    "valor": V_NuevoLimiteMuestreoGeneral,
                                    "fecha_actualizacion" : fecha._d
                                }
            });
        }
	},
});