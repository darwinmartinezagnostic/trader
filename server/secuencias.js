import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({
    //#############################################
    //                  EJECUCION
    //#############################################

    "SecuenciaInicial": function (){
        try{
            fecha = moment (new Date());
            console.log('        ',fecha._d);
            console.log('');
            Meteor.call("GuardarLogEjecucionTrader", '----------  SECUENCIA INICIAL  -----------');
            console.log(' ');

            var EjecucionInicial = Meteor.call('EjecucionInicial');

            console.log("Valor de EjecucionInicial", EjecucionInicial);

            if ( EjecucionInicial === 0 ) {
                Meteor.call("GuardarLogEjecucionTrader", 'Iniciando las secuencias Secundarías');
                Meteor.call("SecuenciasSecundarias");
            }
            var EjecucionSecuenciaInicial = 0
            return EjecucionSecuenciaInicial;
        }
        catch(error){
            var EjecucionSecuenciaInicial = 1
            return EjecucionSecuenciaInicial;
        }
    },

    'SecuenciasSecundarias':function(){
        try{
            fecha = moment (new Date());
            console.log('        ',fecha._d);
            Meteor.call("GuardarLogEjecucionTrader", '--------  SECUENCIAS SECUNDARIAS  ---------');
            console.log(' ');


            // VALIDA EL LIMITE TOTAL DE EJECUCIÓN DE LA APLICACION SI ESTE ES IGUAL '9999999999' ENTONCES SE EJECUTARÁ DE FORMA INFINITA
            // SINO ENTONCES ESTE VALOR SERÁ ACTUALIZADO RESTANDO 1 SE EJECUTARA HASTA QUE EL CONTADOR LLEGUE A 0
            var LimiteMaximoEjecucion = Parametros.find({ "dominio": "limites", "nombre": "CantMaximaEjecucion"}).fetch()
            var V_LimiteMaximoEjecucion = LimiteMaximoEjecucion[0].valor


            var contador = 1;
            do{
                

                Meteor.call("GuardarLogEjecucionTrader", [' ESTOY INICIANDO SECUENCIA']+[' CONTADOR ACTUAL: ']+[contador]);

                if ( V_LimiteMaximoEjecucion === 9999999999 ) {
                                    
                    console.log(' ');
                    var EjecucionSecuencia = Meteor.call('SecuenciaPeriodo1');
                        

                }else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {

                    console.log(' ');
                    var EjecucionSecuencia = Meteor.call('SecuenciaPeriodo1');

                    V_LimiteMaximoEjecucion = V_LimiteMaximoEjecucion - 1
                            
                    Parametros.update({ "dominio": "limites", "nombre": "CantMaximaEjecucion" }, {
                                        $set: {
                                                    "estado": true,
                                                    "valor": V_LimiteMaximoEjecucion
                                                    }
                                        });
                }

                if ( EjecucionSecuencia === 0) {
                    Meteor.call("GuardarLogEjecucionTrader", ' SECUENCIA EJECUTADA CORRECTAMENTE ');
                }else{
                    Meteor.call("GuardarLogEjecucionTrader", ' SECUENCIA NO SE ECECUTÓ CORRECTAMENTE ');
                }

                var LimiteMaximoEjecucion = Parametros.find({ "dominio": "limites", "nombre": "CantMaximaEjecucion"}).fetch()
                var V_LimiteMaximoEjecucion = LimiteMaximoEjecucion[0].valor

                var contador = contador + 1;
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de V_LimiteMaximoEjecucion ']+[V_LimiteMaximoEjecucion]);
                Meteor.call("GuardarLogEjecucionTrader", ' FIN DE SECUENCIA');

            }while( V_LimiteMaximoEjecucion !== 0 );
            
        }
        catch(error){
            var EjecucionSecuencia = 1
        }
    },    

    'SecuenciaPeriodo1':function(){
        try{
            var TM = 1;
            V_EJEC = 2;
            fecha = moment (new Date());
            console.log('        ',fecha._d);
            console.log('---------- SECUENCIA PERIODO 1 ------------');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", ' Estoy en SecuenciaPeriodo1');

            try {
                var Monedas_Saldo = Monedas.aggregate([
                        { $match : {"saldo.tradeo.equivalencia" : { $gt : 0 }}},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]);
            }
            catch (error){
                Meteor.call("ValidaError", error, 2);
            };

            //console.log("Valor de Monedas_Saldo", Monedas_Saldo)


            if ( Monedas_Saldo[0] === undefined ) {
                Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ninguna moneda con saldo disponible para invertir ']);
            }
            else{

                for (CMS = 0, TMS = Monedas_Saldo.length; CMS < TMS; CMS++){
                    var moneda_saldo =  Monedas_Saldo[CMS];
                    //console.log("Valor de Monedas_Saldo", moneda_saldo)

                    if (TiposDeCambios.find().count() === 0){
                        Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ningún tipo de Cambio Guardado en la Base de Datos Local, Solucionando ... ']);
                        //Monedas.remove({});
                        Meteor.call("ListaTiposDeCambios", V_EJEC);
                        Meteor.call("ListaMonedas");
                        Meteor.call("ActualizaSaldoTodasMonedas",2);
                        if (TiposDeCambios.find().count() !== 0){
                            Meteor.call("GuardarLogEjecucionTrader", [' Moneda con Saldo: ¡ Listo ! ']);
                        }
                    };

                    Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Consultando Tipos de Cambio para Moneda: ']+[moneda_saldo.moneda]+[' SALDO_MONEDA: ']+[moneda_saldo.saldo.tradeo.activo]);

                    //LIMPIANDO LA COLECCION TEMPORAL "TempTiposCambioXMoneda"
                    TempTiposCambioXMoneda.remove({ moneda_saldo : Monedas_Saldo[0].moneda, });

                    var TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', moneda_saldo.moneda, moneda_saldo.saldo.tradeo.equivalencia);
                    Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar[0]]);

                    if ( TiposDeCambioVerificar === undefined ) {
                        Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible para moneda: ']+[moneda_saldo.moneda]);
                        Meteor.call('EjecucionInicial');
                    }else {
                        for ( CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++ ){
                            var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];

                            console.log("Valor de tipo_cambio_verificar.tipo_cambio", tipo_cambio_verificar.tipo_cambio)

                            Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar.tipo_cambio]+[' Moneda: ']+[moneda_saldo.moneda]);
                                
                            Meteor.call("ValidaTendenciaTipoCambio", tipo_cambio_verificar.tipo_cambio, moneda_saldo.moneda )
                        }

                        Meteor.call("GuardarLogEjecucionTrader", 'JobSecuenciaPeriodo1: Ejecutando ValidarRanking ');
                        Meteor.call('ValidarRanking', moneda_saldo.moneda);


                    }
                }
                
                // VALIDA LA MÍNIMA CANTIDAD DE VECES QUE VA HACER LA CONSULTA DE TRANSACCIONES A HITBTC ANTES DE INICIAR LA INVERSION
                var LimiteMuestreo = Parametros.find({ "dominio": "limites", "nombre": "CantidasMinimaMuestreo"}).fetch()
                var V_LimiteMuestreo = LimiteMuestreo[0].valor

                if ( V_LimiteMuestreo === 0 ) {
                    var MonedasVerificar = TempTiposCambioXMoneda.aggregate([ { $group: { _id : "$moneda_saldo" } },
                                             { $project: { _id : 1 } }
                                            ]);

                    for (CMV = 0, TMV = MonedasVerificar.length; CMV < TMV; CMV++) {
                        var V_moneda_verificar = MonedasVerificar[CMV];
                        console.log("     Moneda con Saldo a Verificar: ", V_moneda_verificar._id);
                                    
                        Meteor.call("ValidaInversion", V_moneda_verificar._id, tipo_cambio_verificar.accion);

                    }
                }else{
                    V_LimiteMuestreo = V_LimiteMuestreo - 1
                    
                    fecha = moment (new Date()); 
                    Parametros.update({ "dominio": "limites", "nombre": "CantidasMinimaMuestreo" }, {
                                    $set: {
                                        "estado": true,
                                        "valor": V_LimiteMuestreo,
                                        "fecha_ejecucion" : fecha._d
                                    }
                                });
                }           
            }
            var EjecucionSecuenciaPeriodo1 = 0
            return EjecucionSecuenciaPeriodo1;
        }
        catch(error){
            var EjecucionSecuenciaPeriodo1 = 1
            return EjecucionSecuenciaPeriodo1
        }
    },

    'ValidaTendenciaTipoCambio': function ( TIPO_CAMBIO, MONEDA_SALDO ){
        try{
            console.log(' Estoy en ValidaTendenciaTipoCambio');
            var V_EJEC = 2
            fecha = moment (new Date());

            console.log('############################################');
            console.log('--------------------------------------------');
            console.log('----------- VALIDANDO TENDENCIA ------------');
            console.log('--------------------------------------------');
            console.log(' ');
            //console.log(' Tipo de Cambio Recibido', TIPO_CAMBIO, " V_EJEC: ", V_EJEC);
                
            Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC);

            Meteor.call('EvaluarTendencias', TIPO_CAMBIO, MONEDA_SALDO );
                
            console.log('--------------------------------------------');
            console.log('############################################');
            console.log('---------------- FINALIZADO ----------------');
            console.log('        ',fecha._d);
            console.log('############################################');


            var ejecucionValidaTendenciaTipoCambio = 0
            return ejecucionValidaTendenciaTipoCambio
        }
        catch(error){
            var ejecucionValidaTendenciaTipoCambio = 1
            return ejecucionValidaTendenciaTipoCambio
        }
    },

    'ValidaInversion': function( MONEDA_VERIFICAR ){
        try{
            console.log("Moneda con Saldo a Verificar: ", MONEDA_VERIFICAR);

            if ( JobsInternal.Utilities.collection.find({ name : "JobValidaTendenciaTipoCambio" , state : "pending" }).count() === 0  ) {
                try{
                    var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
                    var V_LimiteApDep = LimiteApDep[0].valor;
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2);
                };

                Meteor.call('ValidaPropTipoCambiosValidados', MONEDA_VERIFICAR, V_LimiteApDep );
            }
            else{
                console.log(' ');
                Jobs.run("ValidaInversion", MONEDA_VERIFICAR, { 
                    in: {
                        minute: 1
                    }
                })
            }
            var ejecucionValidaInversion = 0
        }
        catch(error){
            var ejecucionValidaInversion = 1
        }

        if ( ejecucionValidaInversion === 0) {

            return this.success(ejecucionValidaInversion);
        }
        else {
            this.failure(ejecucionValidaInversion);
        }
    },

    'ReinicioSecuencia':function(){
        try{
            fecha = moment (new Date());
            console.log('        ',fecha._d);
            console.log('');
            Meteor.call("GuardarLogEjecucionTrader", '---------  REINICIANDO PROCESOS  ----------');
            console.log(' ');

            try {
                var EjecucionInicial = Ejecucion_Trader.find({ muestreo : { periodo_inicial : true } },{}).count()
            }
            catch (error){
                Meteor.call("ValidaError", error, 2);
            };

            
            if ( EjecucionInicial === 1 ){
                Meteor.call('SecuenciaInicial');
            }
            else if ( EjecucionInicial === 0 ) {
                Meteor.call('SecuenciasSecundarias');
            };
            var ejecucionJobReinicioSecuencia = 0
        }
        catch(error){
            var ejecucionJobReinicioSecuencia = 1
        }
    },

});