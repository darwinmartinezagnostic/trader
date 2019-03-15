import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({
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
       	/*
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
        */


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
         
        var TIPO_CAMBIO = 'XMRBTC';
        var MONEDA_SALDO = 'BTC'
        /*
        valor = EquivalenciasDol.aggregate([ { $match: { tipo_cambio : TIPO_CAMBIO }}, 
                                            { $project: { _id : 0, promedio : 1 } }
                                            ]);

        console.log("Valor de valor", valor[0]);
		*/
		/*
        var TipoCambioObtenido = TIPO_CAMBIO;


        var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
        console.log("Valor de ValorPromedio", ValorPromedio);
        */
       
		for (C = 0, MAXEJC = 5; C < MAXEJC; C++){
			//Meteor.call('ListaTradeoActual', TIPO_CAMBIO, 2);
        	Meteor.call("ValidaTendenciaTipoCambio", TIPO_CAMBIO, MONEDA_SALDO);
        }


        //#############################################################################################################################################

       //Meteor.call("SecuenciasSecundarias");




       //Meteor.call("SecuenciasSecundarias");






    },
});