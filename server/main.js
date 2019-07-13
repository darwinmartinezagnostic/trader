import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log, logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();



Meteor.methods({

    'EjecucionInicial':function(){
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
    
    try {
        // Verificamos si la aplicación es su ejecución Inicial o no
        var ModoEjecucion = Parametros.aggregate([  { $match : { dominio : "Ejecucion", nombre : "ModoEjecucion" } },
                                                    { $project : { _id : 0, valor : 1 } }]);

        var Robot = Parametros.findOne( { dominio : "Prueba", nombre : "robot" } );
        
        var ValorModoEjecucion = ModoEjecucion[0].valor
        //var ValorModoEjecucion = 0
        log.info("Valor de EjecucionInicial:", ValorModoEjecucion.toString(),'Main');

        switch ( ValorModoEjecucion ){
            case 0:
                Meteor.call("PruebasUnitarias");
            break;
            case 1:
                Meteor.call('SecuenciaInicial');
            break;
            case 2:
                if ( Robot.valor === 0 ) {
                    Meteor.call("ActualizaSaldoTodasMonedas");
                }
                Meteor.call("ValidaSaldoEquivalenteActual");
                Meteor.call("ResetTipoCambioMonSaldo");
                Meteor.call('SecuenciasSecundarias');
            break;                
        }
    }
    catch (error){
        Meteor.call("ValidaError", error, 2);
    };
});
