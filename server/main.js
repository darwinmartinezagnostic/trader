import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
import { Email } from 'meteor/email';

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

            var ValorModoEjecucion = ModoEjecucion.valor
            var OperacionesEnSeguimiento = GananciaPerdida.find({ "Operacion.Status" : "En seguimiento" }).count()
            //log.info('Valor de ValorModoEjecucion: ', ValorModoEjecucion);
            
            switch ( ValorModoEjecucion ){
                case 1:                    
                    Meteor.call('SecuenciaInicial', IdDatoAnalisis, IdLote );
                break;
                case 2:
                    if (OperacionesEnSeguimiento === 0 ) {

                        if ( ResetSaldos.valor === 1 && Robot.valor === 1 ) {
                            Meteor.call("ReinioDeSaldos");
                        }

                        if ( Robot.valor === 0 ) {
                            Meteor.call("ActualizaSaldoTodasMonedas");
                        }
                        Meteor.call("ValidaSaldoEquivalenteActual");
                        Meteor.call("ResetTipoCambioMonSaldo");

                    }else{
                        log.info(' Se encontraron', OperacionesEnSeguimiento + ' Operaciones Pendientes de seguimiento, se procede a verificar sus status actuales');
                        OperacionesImcompletas = GananciaPerdida.aggregate({ $match : {"Operacion.Status" : "En seguimiento"}});
                        for (COI = 0, TOI = OperacionesImcompletas.length; COI < TOI; COI++){
                            //Meteor.call('sleep', 33);
                            var OperacionIncompleta = OperacionesImcompletas[COI]
                            var OrdenGuardada = OperacionIncompleta.DatosOrden
                            var TIPO_CAMBIO = OperacionIncompleta.Operacion.TipoCambio; 
                            var CANT_INVER = OperacionIncompleta.Inversion.SaldoInversion; 
                            var InversionRealCalc = OrdenGuardada.quantity; 
                            var MONEDA_SALDO = OperacionIncompleta.Moneda.Emitida.moneda; 
                            var ID_LOTE = OperacionIncompleta.Operacion.Id_Lote;

                            var V_TipoCambio = TiposDeCambios.findOne({ "tipo_cambio" : TIPO_CAMBIO });
                            var MON_B = V_TipoCambio.moneda_base; 
                            var MON_C = V_TipoCambio.moneda_cotizacion; 
                            var MONEDA_COMISION = MON_C ;

                            if ( OrdenGuardada === undefined ) {
                                var Orden = {  status: V_TipoCambio.Operacion.Status }
                            }
                            var Orden = Meteor.call('ValidarEstadoOrden', OrdenGuardada)
                            Meteor.call('EstadoOrdenVerificar', TIPO_CAMBIO , CANT_INVER, InversionRealCalc, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE )

                        }
                    }

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
            //Meteor.call("ConsultarHistoricoOrdenes");
        }else if ( Robot.valor === 1 ) {
            Meteor.call("Encabezado");
            Meteor.call("ListaTiposDeCambios", 2);
            Meteor.call("ListaMonedas");
            Meteor.call("ActualizaSaldoTodasMonedasRobot");
            Meteor.call("ValidaSaldoEquivalenteActual");
            Meteor.call("EquivalenteDolarMinCompra");
            //Meteor.call("ConsultarHistoricoOrdenes");
        }

        try {
            Parametros.update({ dominio : "Ejecucion", nombre : "ModoEjecucion", "valor" : 1 },{ $set :{ "valor" : 2 , fecha_actualizacion : new Date() }});
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
    
    Jobs.run("JobTipoEjecucion", {
        in: {
            second: 1
        }
    })
});
