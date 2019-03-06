import { Meteor } from 'meteor/meteor';

//**************************************************

Meteor.methods({

    'EjecucionInicial':function(){

        Meteor.call("Encabezado");
        Meteor.call("ListaTiposDeCambios", 2);
        Meteor.call("ListaMonedas");
        Meteor.call("ActualizaSaldoTodasMonedas", 2);
        Meteor.call("ValidaMonedasTransfCuentaTRadeo");
        Meteor.call("ActualizaSaldoTodasMonedas", 2);
        Meteor.call("ValidaSaldoEquivalenteActual");
        Meteor.call("ActualizaSaldoTodasMonedas", 1);
        Meteor.call("EquivalenteDolarMinCompra");
        try {
            Parametros.update({ dominio : "ejecucion", nombre : "EjecInicial", "valor.muestreo.periodo_inicial" : true },{$set :{ "valor.muestreo.periodo_inicial" : false , fecha_ejecucion : new Date() }});
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        }
        Meteor.call("FinEjecucion");
        
        return 0;
    },

    'EjecucionGlobal':function(){
        //Meteor.call("Encabezado");
        //Meteor.call("ActualizaSaldoTodasMonedas", 2);
        Meteor.call("Prueba");
        //Meteor.call("SecuenciasSecundarias");
        //Meteor.call("CalculoGanancia");
        //var tiposCamb = ["XMRUSD", "XMRETH", "XMRBTC"];
        //Meteor.call("Invertir", tiposCamb, 2, 0);
        /*Meteor.call("ListaMonedas");
        Meteor.call("ValidaMonedasTransfCuentaTRadeo");*/
        //Meteor.call("ListaTiposDeCambios", 1);
        //Meteor.call("TipoCambioDisponibleCompra", 1, 1);

        //console.log("Valor de prueba: ", prueba);

        //Meteor.call("FinEjecucion");
    },

    //#############################################
    //                  PRUEBA
    //#############################################

    'Prueba':function(){
        // PRUEBA DE HILOS
        // 
        // 
        // 
        /*TIPO_CAMBIO =''
        Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, TIPO_MUESTREO);
        Meteor.call('EvaluarTendencias', TIPO_CAMBIO, TIPO_MUESTREO, TIPO_MONEDA_SALDO );


        Concurrent.Thread.create( ListaTradeoActual, TIPO_CAMBIO, 2, 1);*/

        /*
        var Robot = Parametros.find({ dominio : "robot", estado : true, valor : 0 }).fetch();
        var EstadoRobot = Robot[0].valor
        console.log("Valor de prueba", EstadoRobot);*/

        //Meteor.call('TipoCambioDisponibleCompra');
        //
        //Meteor.call('ValidarRanking', 'BTC');
        //
        //
        //
        
        //Meteor.call("ValidaSaldoEquivalenteActual");

        //Meteor.call("ListaTiposDeCambios", 2);
        
        //Meteor.call('EjecucionInicial');
        /*
         var Monedas_Saldo = Monedas.aggregate([
                        { $match : {"saldo.tradeo.equivalencia" : { $gt : 0 }}},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]);


        for (CMS = 0, TMS = Monedas_Saldo.length; CMS < TMS; CMS++){
             var moneda_saldo =  Monedas_Saldo[CMS];
             console.log("Valor de moneda_saldo", moneda_saldo.moneda)
             var TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', moneda_saldo.moneda, moneda_saldo.saldo.tradeo.equivalencia);
             console.log("Valor de TiposDeCambioVerificar: ", TiposDeCambioVerificar)
         }
        */
       

        //#############################################################################################################################################
       
        var Monedas_Saldo = Monedas.aggregate([
                        { $match : {"saldo.tradeo.equivalencia" : { $gt : 0 }, moneda : 'BTC' }},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]);

        //console.log("Valor de Monedas_Saldo", Monedas_Saldo[0]);
        //console.log("Valor de Monedas_Saldo.saldo.tradeo.equivalencia", Monedas_Saldo[0].saldo.tradeo.equivalencia);
        //TempTiposCambioXMoneda.remove({ moneda_saldo : Monedas_Saldo[0].moneda, });
         var TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', Monedas_Saldo[0].moneda, Monedas_Saldo[0].saldo.tradeo.equivalencia);

        for (C = 0, MAXEJC = 5; C < MAXEJC; C++){
             for (CMS = 0, TMS = TiposDeCambioVerificar.length; CMS < TMS; CMS++){
                 var TipoCambio =  TiposDeCambioVerificar[CMS];
                 //console.log("Valor de TipoCambio", TipoCambio)
                 //console.log("Valor de TipoCambio", TipoCambio.tipo_cambio)

                 Meteor.call('ListaTradeoActual', TipoCambio.tipo_cambio, 2);
                 Meteor.call('EvaluarTendencias', TipoCambio.tipo_cambio );             
             }
        }
        Meteor.call('ValidarRanking', Monedas_Saldo[0].moneda);
        


        /*

        var Monedas_Saldo = Monedas.aggregate([
                        { $match : {"saldo.tradeo.equivalencia" : { $gt : 0 }, moneda : 'LTC' }},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]);

        TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', Monedas_Saldo[0].moneda,  Monedas_Saldo[0].saldo.tradeo.activo);

        Meteor.call('ListaTradeoActual', 'LTCBTC', 2, TIPO_MUESTREO);
        Meteor.call('EvaluarTendencias', 'LTCBTC');

        */
         //Meteor.call('EquivalenteDolarMinCompra');
         /*
        var TIPO_CAMBIO = 'ETHUSD';
        valor = EquivalenciasDol.aggregate([ { $match: { tipo_cambio : TIPO_CAMBIO }}, 
                                            { $project: { _id : 0, promedio : 1 } }
                                            ]);

        console.log("Valor de valor", valor[0]);
        */
       
        //#############################################################################################################################################

       //Meteor.call("SecuenciasSecundarias");
    },

});

Meteor.startup(function (){
    // code to run on server at startup
    JobsInternal.Utilities.collection.remove({  });
    LogEjecucionTrader.remove({  });
    
    try {
        // Verificamos si la aplicación es su ejecución Inicial o no
        var EjecucionInicial = Parametros.find({ dominio : 'ejecucion', nombre : 'EjecInicial', estado : true, valor: { muestreo : { periodo_inicial : true } }},{}).count()
        
        if ( EjecucionInicial === 1 ){
            
            Meteor.call('SecuenciaInicial');
        }
        else if ( EjecucionInicial === 0 ) {

            Meteor.call('SecuenciasSecundarias');
        };
    }
    catch (error){
        Meteor.call("ValidaError", error, 2);
    };
    //Meteor.call("EjecucionGlobal");
});
