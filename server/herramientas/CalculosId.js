import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();
const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
LogFile.enable();

Meteor.methods({

    'SecuenciasGBL':function(NOMBRE){
        var CONSTANTES = Meteor.call("Constantes");
        var Robot = Parametros.findOne( { dominio : "Prueba", nombre : "robot" } );
        if ( Robot.valor === 0 ) {
            //log.info(' Estoy en if ( Robot.valor === 0 )')
            if ( NOMBRE === 'IdGanPerdLocal' ) {
                //log.info(' Estoy en if ( NOMBRE === IdGanPerdLocal )')
                var ValActSec= SecuenciasGlobales.findOne({ _id: NOMBRE })
                var SecAct = ValActSec.secuencia
                //log.info('Valor de SecAct: ', SecAct)
                if ( SecAct === 0 ){                
                    //log.info(' Estoy en if ( SecAct === 0 )')
                    var url_transaccion_completa=[CONSTANTES.HistTradeo]+['?sort=DESC&by=timestamp&limit=1']
                    var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
                    //log.info('Valor de transaccion: ', transaccion)
                    var UltIdOrden = parseFloat(transaccion[0].clientOrderId) + 1;
                    //log.info('Valor de UltIdOrden: ', UltIdOrden)
                    SecuenciasGlobales.update({ _id: NOMBRE }, {    
                                                            $set: {
                                                                    secuencia: parseFloat(UltIdOrden)
                                                                }
                                                            }, {"upsert" : true});
                    var nuevo_id = UltIdOrden
                }else{
                    var nuevo_id = SecuenciasGlobales.findAndModify({
                                                                        query: { _id: NOMBRE },
                                                                        update: { $inc: { secuencia: 1 } },
                                                                        new: true,
                                                                        upsert: true
                                                                    });
                }
            }else{            
                var nuevo_id = SecuenciasGlobales.findAndModify({
                                                                    query: { _id: NOMBRE },
                                                                    update: { $inc: { secuencia: 1 } },
                                                                    upsert: true,
                                                                    'new' : true
                                                                });
            }
        }else{
            //log.info(' Estoy en el else de if ( Robot.valor === 0 )')
            //log.info(' Valor de NOMBRE: ', NOMBRE)
            var nuevo_id = SecuenciasGlobales.findAndModify({
                                                                    query: { _id: NOMBRE },
                                                                    update: { $inc: { secuencia: 1 } },
                                                                    upsert: true,
                                                                    'new' : true
                                                                });
        }
        //log.info(' Valor de nuevo_id: ', nuevo_id)
        return nuevo_id.secuencia;
    },
	
});