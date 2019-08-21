import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log, logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();



Meteor.methods({

    'EjecucionInicial':function( IdDatoAnalisis, IdLote ){  
        try {
            // Verificamos si la aplicación es su ejecución Inicial o No

            
            var ModoEjecucion = Parametros.findOne( { dominio : "Ejecucion", nombre : "ModoEjecucion" } );
            var Robot = Parametros.findOne( { dominio : "Prueba", nombre : "robot" } );            
            var ResetSaldos = Parametros.findOne( { dominio : "Prueba", nombre : "saldo" } );

            //var ValorModoEjecucion = ModoEjecucion[0].valor
            var ValorModoEjecucion = ModoEjecucion.valor
            //log.info('Valor de ValorModoEjecucion: ', ValorModoEjecucion);
            switch ( ValorModoEjecucion ){
                case 1:                    
                    Meteor.call('SecuenciaInicial', IdDatoAnalisis, IdLote );
                break;
                case 2:
                    if ( ResetSaldos.valor === 1 ) {
                        Meteor.call("ReinioDeSaldos");
                    }
                    if ( Robot.valor === 0 ) {
                        Meteor.call("ActualizaSaldoTodasMonedas");
                    }
                    Meteor.call("ValidaSaldoEquivalenteActual");
                    Meteor.call("ResetTipoCambioMonSaldo");                    
                    Meteor.call('SecuenciasSecundarias', IdDatoAnalisis, IdLote );
                break;                
            }

            return 0;
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
            return 1;
        };
    },

    'SecuenciaDeCarga':function(){
        var Robot = Parametros.findOne( { dominio : "Prueba", nombre : "robot" } );

        if ( Robot.valor === 0 ) {
            Meteor.call("Encabezado");
            Meteor.call("ListaTiposDeCambios", 2);
            Meteor.call("ListaMonedas");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ValidaMonedasTransfCuentaTRadeo");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("ValidaSaldoEquivalenteActual");
            Meteor.call("ActualizaSaldoTodasMonedas");
            Meteor.call("EquivalenteDolarMinCompra");
            Meteor.call("ConsultarHistoricoOrdenes");
        }else if ( Robot.valor === 1 ) {
            Meteor.call("Encabezado");
            Meteor.call("ListaTiposDeCambios", 2);
            Meteor.call("ListaMonedas");
            Meteor.call("ActualizaSaldoTodasMonedasRobot");
            Meteor.call("ValidaSaldoEquivalenteActual");
            Meteor.call("EquivalenteDolarMinCompra");
            Meteor.call("ConsultarHistoricoOrdenes");
        }

        try {
            Parametros.update({ dominio : "Ejecucion", nombre : "ModoEjecucion", "valor" : 1 },{ $set :{ "valor" : 2 , fecha_ejecucion : new Date() }});
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        }


        Meteor.call("FinEjecucion");
        
        return 0;
    },
});

Meteor.startup(function (){
    // código que se ejecuta al iniciar la aplicación en el servidor

    JobsInternal.Utilities.collection.remove({  });
    TmpTipCambioXMonedaReord.remove({ });
    LogEjecucionTrader.remove({  });
    Meteor.call('ReinicioDeSecuenciasGBL', 'IdLog');
    //log.info(' ------------------------- ACA ESTOY -------------------------');
    
    Jobs.run("JobTipoEjecucion", {
        in: {
            second: 1
        }
    })
});
