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
            Parametros.update({ dominio : "ejecucion", nombre : "ModoEjecucion", "valor" : 1 },{$set :{ "valor" : 2 , fecha_ejecucion : new Date() }});
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        }
        Meteor.call("FinEjecucion");
        
        return 0;
    },
});

Meteor.startup(function (){
    // code to run on server at startup
    JobsInternal.Utilities.collection.remove({  });
    LogEjecucionTrader.remove({  });
    
    try {
        // Verificamos si la aplicación es su ejecución Inicial o no
        //var EjecucionInicial = Parametros.find({ dominio : 'Ejecucion', nombre : 'ModoEjecucion', estado : true, valor: { muestreo : { periodo_inicial : true } }},{}).count()
        var EjecucionInicial = Parametros.aggregate([   { $match : { dominio : "Ejecucion", nombre : "ModoEjecucion" } },
                                                        { $project : { _id : 0, valor : 1 } }]);
        /*
        if ( EjecucionInicial === 1 ){
            
            Meteor.call('SecuenciaInicial');
        }
        else if ( EjecucionInicial === 0 ) {

            Meteor.call('SecuenciasSecundarias');
        };*/


        switch ( EjecucionInicial ){
            case 0:
                Meteor.call("Prueba");
            break;
            case 1:
                Meteor.call('SecuenciaInicial');
            break;
            case 2:
                Meteor.call('SecuenciasSecundarias');
            break;                
            }



    }
    catch (error){
        Meteor.call("ValidaError", error, 2);
    };
    //Meteor.call("EjecucionGlobal");
});
