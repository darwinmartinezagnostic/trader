import { Meteor } from 'meteor/meteor';
//import { Constantes } from '../herramientas/Global.js';
moment().tz('America/Caracas').format();

//var CONSTANTES = Meteor.call("Constantes");

Meteor.methods({
    //#############################################
    //                  EJECUCION
    //#############################################

    "SecuenciaInicial": function (){
        
        do{
            fecha = moment (new Date());
            log.info('        ',fecha._d);
            log.info('');
            Meteor.call("GuardarLogEjecucionTrader", '----------  SECUENCIA INICIAL  -----------');
            log.info(' ');

            var EjecucionInicial = Meteor.call('EjecucionInicial');

            log.info("Valor de EjecucionInicial", EjecucionInicial);
        }while( EjecucionInicial !== 0 );

        Meteor.call("GuardarLogEjecucionTrader", 'Iniciando las secuencias Secundarías');
        Meteor.call("SecuenciasSecundarias");
    },

    'SecuenciasSecundarias':function(){
        fecha = moment (new Date());
        log.info('        ',fecha._d);
        Meteor.call("GuardarLogEjecucionTrader", '--------  SECUENCIAS SECUNDARIAS  ---------');
        log.info(' ');


        // VALIDA EL LIMITE TOTAL DE EJECUCIÓN DE LA APLICACION SI ESTE ES IGUAL '9999999999' ENTONCES SE EJECUTARÁ DE FORMA INFINITA
        // SINO ENTONCES ESTE VALOR SERÁ ACTUALIZADO RESTANDO 1 SE EJECUTARA HASTA QUE EL CONTADOR LLEGUE A 0
        var LimiteMaximoEjecucion = Parametros.find({ "dominio": "limites", "nombre": "CantMaximaEjecucion"}).fetch()
        var V_LimiteMaximoEjecucion = LimiteMaximoEjecucion[0].valor


        var contador = 1;
        do{
                

            Meteor.call("GuardarLogEjecucionTrader", [' ESTOY INICIANDO SECUENCIA']+[' CONTADOR ACTUAL: ']+[contador]);

            if ( V_LimiteMaximoEjecucion === 9999999999 ) {
                                    
                log.info(' ');
                var EjecucionSecuencia = Meteor.call('SecuenciaPeriodo1');
                        

            }else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {

                log.info(' ');
                //var EjecucionSecuencia = Meteor.call('SecuenciaPeriodo1');
                Meteor.call('SecuenciaPeriodo1');
                V_LimiteMaximoEjecucion = V_LimiteMaximoEjecucion - 1
                            
                Parametros.update({ "dominio": "limites", "nombre": "CantMaximaEjecucion" }, {
                                        $set: {
                                                    "estado": true,
                                                    "valor": V_LimiteMaximoEjecucion
                                                    }
                                        });
            }
            var LimiteMaximoEjecucion = Parametros.find({ "dominio": "limites", "nombre": "CantMaximaEjecucion"}).fetch()
            var V_LimiteMaximoEjecucion = LimiteMaximoEjecucion[0].valor

            var contador = contador + 1;
            Meteor.call("GuardarLogEjecucionTrader", [' Valor de V_LimiteMaximoEjecucion ']+[V_LimiteMaximoEjecucion]);
            Meteor.call("GuardarLogEjecucionTrader", [' FIN DE SECUENCIA - ']+[fecha._d]);

        }while( V_LimiteMaximoEjecucion !== 0 );
    },    

    'SecuenciaPeriodo1':function(){
        var TM = 1;
        V_EJEC = 2;
        fecha = moment (new Date());
        log.info('        ',fecha._d);
        log.info('---------- SECUENCIA PERIODO 1 ------------');
        log.info(' ');
        try {
            var Monedas_Saldo = Monedas.aggregate([
                        { $match : { $or : [{"saldo.tradeo.activo" : { $gt : 0 }},{ "moneda" : 'BTC' }] , "activo" : "S"}},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]);
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };

        if ( Monedas_Saldo[0] === undefined ) {
            Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ninguna moneda con saldo disponible para invertir ']);
        }
        else{
            for (CMS = 0, TMS = Monedas_Saldo.length; CMS < TMS; CMS++){
                var moneda_saldo =  Monedas_Saldo[CMS];
                var V_LimiteMuestreo = moneda_saldo.CantidadMinimaMuestreo
                if ( V_LimiteMuestreo == undefined ) {
                    var LimiteGeneral= Parametros.find({ "dominio": "limites", "nombre": "CantidadMinimaMuestreo"}).fetch()
                    var V_LimiteGeneral = LimiteGeneral[0].valor
                    Monedas.update({ "moneda": moneda_saldo.moneda }, {
                                                        $set: {
                                                            "CantidadMinimaMuestreo": V_LimiteGeneral,
                                                            "fecha_actualizacion" : fecha._d
                                                        }
                                });
                    var V_LimiteMuestreo = V_LimiteGeneral;
                }

                Meteor.call("GuardarLogEjecucionTrader", ['             MONEDA: ']+[moneda_saldo.moneda]);
                Meteor.call("GuardarLogEjecucionTrader", ['      MONEDA: ']+[moneda_saldo.moneda]+[' HORA INICIO: ']+[fecha._d]);
                console.time('  TIEMPO TRANSCURRIDO: '+ [moneda_saldo.moneda]);

                if (TiposDeCambios.find().count() === 0){
                    Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ningún tipo de Cambio Guardado en la Base de Datos Local, Solucionando ... ']);
                    //Monedas.remove({});
                    Meteor.call("ListaTiposDeCambios", V_EJEC);
                    Meteor.call("ListaMonedas");
                    Meteor.call("ActualizaSaldoTodasMonedas");
                    if (TiposDeCambios.find().count() !== 0){
                        Meteor.call("GuardarLogEjecucionTrader", [' Moneda con Saldo: ¡ Listo ! ']);
                    }
                };
                //do{
                    var TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', moneda_saldo.moneda, moneda_saldo.saldo.tradeo.activo);
                

                    if ( TiposDeCambioVerificar === undefined ) {
                        Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible para moneda: ']+[moneda_saldo.moneda]);
                        //Meteor.call('EjecucionInicial');
                    }else {

                        for ( CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++ ){
                        	fecha = moment (new Date());
                            var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];
                            Meteor.call("GuardarLogEjecucionTrader", ['        TIPO DE CAMBIO: ']+[tipo_cambio_verificar]);
                            Meteor.call("ValidaTendenciaTipoCambio", tipo_cambio_verificar, moneda_saldo.moneda )
                        }

                        log.info('-------------------------------------------');
                        log.info('----- FIN DE VALIDACION DE TENDENCIA ------');
                        log.info('-------------------------------------------');
                        log.info(' ');
                        Meteor.call("GuardarLogEjecucionTrader", 'JobSecuenciaPeriodo1: Ejecutando ValidarRanking ');
                        Meteor.call('ValidarRanking', moneda_saldo.moneda);

                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        // VALIDA LA MÍNIMA CANTIDAD DE VECES QUE VA HACER LA CONSULTA DE TRANSACCIONES A HITBTC ANTES DE INICIAR LA INVERSION                        

                        if ( V_LimiteMuestreo === 0 ) { 
                            Meteor.call("GuardarLogEjecucionTrader", '  VOY A INTENTAR COMPRAR');
                            
                            Meteor.call('ValidaInversion', moneda_saldo.moneda);
                            /*
                            Jobs.run("JobValidaInversion", moneda_saldo.moneda, {
                                            in: {
                                                second: 1
                                            }
                                        })
                            /**/

                        }else if ( V_LimiteMuestreo > 0 ) {
                            V_LimiteMuestreo = V_LimiteMuestreo - 1
                                        
                            fecha = moment (new Date());
                            Monedas.update({ "moneda": moneda_saldo.moneda }, {
                                                        $set: {
                                                            "CantidadMinimaMuestreo": V_LimiteMuestreo,
                                                            "fecha_actualizacion" : fecha._d
                                                        }
                                });
                        }

                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        Meteor.call("GuardarLogEjecucionTrader", ['      MONEDA: ']+[moneda_saldo.moneda]+[' HORA FIN: ']+[fecha._d]);
                        log.info('############################################');
                        console.timeEnd('  TIEMPO TRANSCURRIDO: '+ [moneda_saldo.moneda]);
                        log.info('############################################');
                        log.info('-------------------------------------------');
                        log.info('--- DEBO SEGUIR CON LA SIGUIENTE MONEDA ---');
                        log.info('-------------------------------------------');
                        log.info(' ');
                    }
                //}while(TiposDeCambioVerificar === undefined)
            }
        }
    },

    "ValidaInversion": function( MONEDA_VERIFICAR ){
        
        log.info("Moneda con Saldo a Verificar: ", MONEDA_VERIFICAR);

        Meteor.call("GuardarLogEjecucionTrader", [' JobValidaInversion: Moneda con Saldo a Verificar: ']+[MONEDA_VERIFICAR]);

        var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
        var V_LimiteApDep = LimiteApDep[0].valor;
            
        Meteor.call("GuardarLogEjecucionTrader", [' JobValidaInversion: Se ejecuta Meteor.call("ValidaPropTipoCambiosValidados": ']+[MONEDA_VERIFICAR]+[' ']+[V_LimiteApDep]);
        Meteor.call('ValidaPropTipoCambiosValidados', MONEDA_VERIFICAR, V_LimiteApDep );
    },

    'ValidaTendenciaTipoCambio': function ( TIPO_CAMBIO, MONEDA_SALDO ){
        try{
            //log.info(' Estoy en ValidaTendenciaTipoCambio');
            fecha = moment (new Date());

            try{
                    var ResetTipCamb = TiposDeCambios.aggregate([  { $match : { tipo_cambio : TIPO_CAMBIO }} ]);
                    var MB = ResetTipCamb[0].moneda_base;
                    var MC = ResetTipCamb[0].moneda_cotizacion;
                    var V_ResetTipCambMB = ResetTipCamb[0].periodo1.Base.reset;
                    var V_ResetTipCambMC = ResetTipCamb[0].periodo1.Cotizacion.reset;

            }
            catch (error){
                    Meteor.call("ValidaError", error, 2);
            };

            if ( V_ResetTipCambMB === undefined ) {
                var V_ResetTipCambMB = 0;
            }

            if ( V_ResetTipCambMC === undefined ) {
                var V_ResetTipCambMC = 0;
            }

            log.info('############################################');
            log.info('--------------------------------------------');
            log.info('----------- VALIDANDO TENDENCIA ------------');
            log.info('--------------------------------------------');
            log.info(' ');

            //log.info(' Tipo de Cambio ', TIPO_CAMBIO, " MB: ", MB, " MC: ", MC, " V_ResetTipCambMB: ", V_ResetTipCambMB, " V_ResetTipCambMC: ", V_ResetTipCambMC, " MONEDA_SALDO: ", MONEDA_SALDO);

            if ( MB === MONEDA_SALDO && V_ResetTipCambMB === 0 ) {
                var V_EJEC = 2
                Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, MONEDA_SALDO);
            }
            else if ( MB === MONEDA_SALDO && V_ResetTipCambMB === 1 ) {
                var V_EJEC = 3
                Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, MONEDA_SALDO);
            }
            else if ( MC === MONEDA_SALDO && V_ResetTipCambMC === 0 ) {
                var V_EJEC = 2
                Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, MONEDA_SALDO);
            }
            else if ( MC === MONEDA_SALDO && V_ResetTipCambMC === 1 ) {
                var V_EJEC = 3
                Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, MONEDA_SALDO);
            }

            Meteor.call('EvaluarTendencias', TIPO_CAMBIO, MONEDA_SALDO );
                
            log.info('--------------------------------------------');
            log.info('############################################');
            log.info('---------------- FINALIZADO ----------------');
            log.info('        ',fecha._d);
            log.info('############################################');


            var ejecucionValidaTendenciaTipoCambio = 0
            return ejecucionValidaTendenciaTipoCambio
        }
        catch(error){
            var ejecucionValidaTendenciaTipoCambio = 1
            return ejecucionValidaTendenciaTipoCambio
        }
    },

    'ReinicioSecuencia':function(){
        try{
            fecha = moment (new Date());
            log.info('        ',fecha._d);
            log.info('');
            Meteor.call("GuardarLogEjecucionTrader", '---------  REINICIANDO PROCESOS  ----------');
            log.info(' ');

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