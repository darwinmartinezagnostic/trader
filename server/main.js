import { Meteor } from 'meteor/meteor';
//var moment = require('moment-timezone');
moment().tz('America/Caracas').format();

const autoriza_conexion = Conexion_api.findOne({ casa_cambio : 'hitbtc'}, {_id:0});
const API_HITBTC2 = autoriza_conexion.api.url;
const key = autoriza_conexion.key;
const secret = autoriza_conexion.secret;
const apikey = key+':'+secret;
const publico = API_HITBTC2+"public/";
const tradeo = API_HITBTC2+"trading/";
const cuenta = API_HITBTC2+"account/";
const historial = API_HITBTC2+"history/";
const ordenes = API_HITBTC2+"order";
const ZONA_HORARA = "GTC";
//**************************************************
//**************************************************
// API Public
const monedas = [publico]+"currency";
const simbolos = [publico]+"symbol";
// API Trading
const blc_tradeo = [tradeo]+"balance";
const comisiones = [tradeo]+"fee";
// API Account
const blc_cuenta = [cuenta]+"balance";
const transacciones = [cuenta]+"transactions";
const cripto_cuenta= [cuenta]+"crypto/";
const retiros= [cripto_cuenta]+"withdraw";
const cart_dep = [cripto_cuenta]+"address";
const transferencia = [cuenta]+"transfer";
// API Trading History
const HistTradeo = [historial]+"trades";
const HistOrdenes = [historial]+"order";
// CANTIDADES DE REGISTROS
const cant_traders = 1;
const cant_transacciones = 3;
// CANTIDAD DE REGISTROS ID HACIA ATRÁS
const CantTransAtras = 300;
// ACTIVACION DE GUARDADO DEBUG DEL CÓDIGO EN DB
const debug_activo = 1;

var idTrans = 0;

//**************************************************

Meteor.methods({

    'CalculaIdEjecucion':function(){

        if (LogEjecucionTrader.find().count() === 0){
            LogEjecucionTrader.insert({fecha: new Date(), id:1 ,descripcion:'Trader iniciado'});
        }
        else {
            var max_id_ejecucion = LogEjecucionTrader.aggregate([{ $group: {_id: "MAX_ID", max_id : { $max: "$id"}}}]);
            var v_val_ejecucion = max_id_ejecucion;
            for (C = 0, tamanio_val_ejecucion = max_id_ejecucion.length; C < tamanio_val_ejecucion; C++) {
                var obj_id_act = max_id_ejecucion[C];
                var id_act = obj_id_act.max_id;
                var nuevo_id = id_act+1;
            };
        };
        return nuevo_id;
    },

    'GuardarLogEjecucionTrader':function (MENSAJE) {
        var nuevo_id_ejecucion = Meteor.call('CalculaIdEjecucion');
        LogEjecucionTrader.insert({fecha: new Date(), id : nuevo_id_ejecucion ,descripcion : MENSAJE});
        console.log( MENSAJE);
        console.log(' ');
    },

    'Encabezado':function(){
        fecha = moment (new Date());
        Meteor.call("GuardarLogEjecucionTrader", 'INICIANDO EJECUCIÓN');
        console.log('############################################');
        console.log('         ********* INICIANDO EJECUCIÓN        ********* ');
        console.log('############################################');
        console.log('        ',fecha._d);
        console.log('############################################');
        console.log(' ');
    },

    'FinEjecucion':function(){
        fecha = moment (new Date());
        Meteor.call("GuardarLogEjecucionTrader", 'FIN DE EJECUCIÓN');
        console.log(' ');
        console.log('############################################');
        console.log('           ********* FIN DE EJECUCIÓN        ********* ');
        console.log('############################################');
        console.log('        ',fecha._d);
        console.log('############################################');
    },

    'ConexionGet':function(V_URL) {
        try {
            var V_OBTENIDO = HTTP.get( V_URL,{auth:apikey});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call("ValidaError",'Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error, 1);
            }
        }
    },

    'ConexionPost':function(V_URL,datos) {
        try {
            var V_OBTENIDO = HTTP.post( V_URL,{auth:apikey,data:datos});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call('ValidaError','Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error.fetch(), 1);
            }
        }
    },

    'ConexionPut':function(V_URL,datos) {
        try {
            var V_OBTENIDO = HTTP.put( V_URL,{auth:apikey,data:datos});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call('ValidaError','Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error.fetch(), 1);
            }
        }
    },

    'ConexionDel':function(V_URL,datos) {
        try {
            var V_OBTENIDO = HTTP.del( V_URL,{auth:apikey,data:datos});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call('ValidaError','Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error.fetch(), 1);
            }
        }
    },

    'ValidaError':function (ERROR, F_ERROR) {
        
       //console.log('Valor de ERROR: ', ERROR);

        if ( F_ERROR === 1 ) {
            if ( ERROR === "Conexion_api_fallida" ) {
                Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: Conexion_api_fallida']);
                Meteor.call('GuardarLogEjecucionTrader', 'URL enviada a HitBTC no se puede resolver por http:// o https://');
            }
            else {
                switch (ERROR.response.data.error.code) {
                    case 400:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Error Consulta no encontrada'] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        break;
                    case 500:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Error Interno del servidor'] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        Meteor.call('RecuperacionAutonoma');
                        break;
                    case 504:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Tiempo de espera sobrepasado'] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        Meteor.call('RecuperacionAutonoma');
                        break;
                    case 503:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Servicio Inhabilitado'] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        Meteor.call('RecuperacionAutonoma');
                        break;
                    case 2001:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Tipo de cambio no encontrado'] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        break;
                    case 1001:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Autorizacion requerida'] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        break;
                    case 1002:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Autorizacion fallida'] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        break;
                    case 2001:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Error de validacion '] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        break;
                    case 10001:
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: Se registró Error consultando el API: '] + [ERROR.response.statusCode]);
                        Meteor.call('GuardarLogEjecucionTrader', ['ERROR: '] + [ERROR.response.data.error.code] + [', Mensaje: '] + [ERROR.response.data.error.message] + [' Fondos Insuficientes '] + [', Descripción: '] + [ERROR.response.data.error.description]);
                        break;
                };
            };
        }
        else if (F_ERROR === 2) {
            return ERROR;
        }
    },

    'RecuperacionAutonoma':function(){

        console.log('############################################');
        Meteor.call('GuardarLogEjecucionTrader', ['Intentando Recuperación automática']);
        Meteor.call('GuardarLogEjecucionTrader', ['Borrando Trabajos no culminados']);

        try {
            JobsInternal.Utilities.collection.remove({});
        }
        catch (error){
            Meteor.call('GuardarLogEjecucionTrader', ['No se ha podido relaizar Borrando de Trabajos no culminados']);
            Meteor.call('GuardarLogEjecucionTrader', ['Se debe verificar manualmente']);
        }

        Jobs.run("JobReinicioSecuencia", { 
            in: {
                second: 1
                }
        });



        console.log('############################################');
    },

    'ListaMonedas':function(){

        console.log('############################################');
        try{
            var moneda = Meteor.call("ConexionGet", monedas);
            var mons = (moneda.data);
        }
        catch(error){
            console.log('Error: No se puedo consultar el api de hitbtc');
            Meteor.call('RecuperacionAutonoma');
            Meteor.call('ValidaError', error, 1);
        }

        for ( a = 0, len = mons.length ; a < len; a++) {
            var mon = mons[a];

            if (Monedas.find({ moneda : mon.id }).count() !== 0) {
                try{
                    Monedas.update({ moneda : mon.id },{$set:{ nombre_moneda : mon.fullName, activo : "S" }});
                }
                catch(error){
                    console.log('Error: los datos no pudieron ser actualizados');
                    Meteor.call('ValidaError', error, 1);
                }
            }
            else {
                Monedas.insert({ moneda : mon.id, nombre_moneda : mon.fullName, activo : "S" });
                console.log('--------------------------------------------');
                console.log(' **** Detectada Nueva Moneda en HITBTC ****');
                console.log('--------------------------------------------');
                console.log(' ');
                console.log('    NOMENCLATURA: ', mon.id);
                console.log('    NOMBRE DE MONEDA: ', mon.fullName);
                console.log(' ');
                console.log('           Datos Insertados');
                console.log(' ');
            }
        };


        console.log('############################################');
    },

    'SaldoActualMonedas':function(VALOR_EJEC){

        if ( debug_activo === 1) {            
            
            console.log('############################################');
            console.log(' ');
        };

        var v_blc_tradeo = Meteor.call("ConexionGet", blc_tradeo);
        var BlcMonedasTradeo=(v_blc_tradeo.data);
        var v_blc_cuenta = Meteor.call("ConexionGet", blc_cuenta);
        var BlcCuenta = (v_blc_cuenta.data);
        var c_vect_BlcTrad = 0
        var c_vect_BlcCuent = 0

        var VMT = Parametros.findOne({ dominio : "limites", nombre : "ValorMinimoTransferencia", estado : true }, {_id : 0, valor : 1 });
        var ValMinTranf = VMT.valor;
        console.log("Valor de ValMinTranf", ValMinTranf)


        var robot = Parametros.findOne({ dominio : "robot", nombre : "test" }, {_id : 0, valor : 0, estado: 1 });






        for ( cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++ ) {

            for ( cbct = 0, tam_bct = BlcCuenta.length; cbct < tam_bct; cbct++ ) {
                var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
                var MonedaSaldoTradear = v_BlcMonedasTradeo.currency;
                var SaldoMonedaInvertidoTradear = Number(v_BlcMonedasTradeo.available);
                var v_BlcCuenta = BlcCuenta[cbct];
                var MonedaSaldoCuenta = v_BlcCuenta.currency;
                var SaldoMonedaGuardadoEnMonederoCuenta = Number(v_BlcCuenta.available);


                switch(VALOR_EJEC){
                    case 1:
                        if ( SaldoMonedaInvertidoTradear > ValMinTranf && SaldoMonedaGuardadoEnMonederoCuenta > ValMinTranf && MonedaSaldoCuenta === MonedaSaldoTradear ) {
                            Meteor.call("GuardarLogEjecucionTrader", ' Verificando las monedas que tienen saldo');
                            try{
                                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                            }
                            catch (error){
                                    Meteor.call("ValidaError", error, 2)
                            };

                            var v_sald_moneda = v_moneda_saldo[0];

                            if ( v_sald_moneda === undefined ){
                                console.log('No se ha detectado saldo en ninguna de las monedas activas');
                            }
                            else {
                                Monedas.update({
                                    _id: v_sald_moneda._id,
                                    moneda: v_sald_moneda.moneda
                                }, {
                                    $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: Number(v_BlcMonedasTradeo.available),
                                                reserva: Number(v_BlcMonedasTradeo.reserved)
                                            },
                                            cuenta: {
                                                activo: Number(v_BlcCuenta.available),
                                                reserva: Number(v_BlcCuenta.reserved)
                                            }
                                        }
                                    }
                                });

                                console.log('############################################');
                                console.log('            Saldo disponible');
                                console.log('############################################');
                                console.log('        ********* ', ' MONEDA: ', v_sald_moneda.moneda, '        ********* ');
                                console.log('     SALDO TRADEO: ', v_BlcMonedasTradeo.available);
                                console.log('     SALDO TRADEO RESERVA: ', v_BlcMonedasTradeo.reserved);
                                console.log('     SALDO EN CUENTA: ', v_BlcCuenta.available);
                                console.log('     SALDO CUENTA RESERVA: ', v_BlcCuenta.reserved);
                                console.log('############################################');
                                console.log(' ');
                            }
                        }
                        else if ( SaldoMonedaInvertidoTradear > ValMinTranf && SaldoMonedaGuardadoEnMonederoCuenta !== ValMinTranf && MonedaSaldoCuenta === MonedaSaldoTradear ) {
                            Meteor.call("GuardarLogEjecucionTrader", ' Verificando las monedas que tienen saldo');
                            console.log('Estoy en el if 2 moneda', MonedaSaldoCuenta);
                            try{
                                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                            }
                            catch (error){
                                    Meteor.call("ValidaError", error, 2)
                            };

                            var v_sald_moneda = v_moneda_saldo[0];

                            if ( v_sald_moneda === undefined ){
                                console.log('No se ha detectado saldo en ninguna de las monedas activas');
                            }
                            else {
                                Monedas.update({
                                    _id: v_sald_moneda._id,
                                    moneda: v_sald_moneda.moneda
                                }, {
                                    $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: Number(v_BlcMonedasTradeo.available),
                                                reserva: Number(v_BlcMonedasTradeo.reserved)
                                            },
                                            cuenta: {
                                                activo: Number(v_BlcCuenta.available),
                                                reserva: Number(v_BlcCuenta.reserved)
                                            }
                                        }
                                    }
                                });

                                console.log('############################################');
                                console.log('            Saldo disponible');
                                console.log('############################################');
                                console.log('        ********* ', ' MONEDA: ', v_sald_moneda.moneda, '        ********* ');
                                console.log('     SALDO TRADEO: ', v_BlcMonedasTradeo.available);
                                console.log('     SALDO TRADEO RESERVA: ', v_BlcMonedasTradeo.reserved);
                                console.log('     SALDO EN CUENTA: ', v_BlcCuenta.available);
                                console.log('     SALDO CUENTA RESERVA: ', v_BlcCuenta.reserved);
                                console.log('############################################');
                                console.log(' ');
                            }
                        }
                        else if  (SaldoMonedaInvertidoTradear !== ValMinTranf && SaldoMonedaGuardadoEnMonederoCuenta > ValMinTranf && MonedaSaldoCuenta === MonedaSaldoTradear ) {
                            Meteor.call("GuardarLogEjecucionTrader", ' Verificando las monedas que tienen saldo');
                            console.log('Estoy en el if 3 moneda', MonedaSaldoCuenta);
                            try{
                                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                            }
                            catch (error){
                                    Meteor.call("ValidaError", error, 2)
                            };

                            var v_sald_moneda = v_moneda_saldo[0];

                            if ( v_sald_moneda === undefined ){
                                console.log('No se ha detectado saldo en ninguna de las monedas activas');
                            }
                            else {
                                Monedas.update({
                                    _id: v_sald_moneda._id,
                                    moneda: v_sald_moneda.moneda
                                }, {
                                    $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: Number(v_BlcMonedasTradeo.available),
                                                reserva: Number(v_BlcMonedasTradeo.reserved)
                                            },
                                            cuenta: {
                                                activo: Number(v_BlcCuenta.available),
                                                reserva: Number(v_BlcCuenta.reserved)
                                            }
                                        }
                                    }
                                });

                                console.log('############################################');
                                console.log('            Saldo disponible');
                                console.log('############################################');
                                console.log('        ********* ', ' MONEDA: ', v_sald_moneda.moneda, '        ********* ');
                                console.log('     SALDO TRADEO: ', v_BlcMonedasTradeo.available);
                                console.log('     SALDO TRADEO RESERVA: ', v_BlcMonedasTradeo.reserved);
                                console.log('     SALDO EN CUENTA: ', v_BlcCuenta.available);
                                console.log('     SALDO CUENTA RESERVA: ', v_BlcCuenta.reserved);
                                console.log('############################################');
                                console.log(' ');
                            }
                        }
                        break;
                    case 2:
                        if ( SaldoMonedaInvertidoTradear > ValMinTranf && SaldoMonedaGuardadoEnMonederoCuenta > ValMinTranf && MonedaSaldoCuenta === MonedaSaldoTradear ) {
                            Meteor.call("GuardarLogEjecucionTrader", ' Verificando las monedas que tienen saldo');
                            try{
                                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                            }
                            catch (error){
                                    Meteor.call("ValidaError", error, 2)
                            };

                            var v_sald_moneda = v_moneda_saldo[0];

                            if ( v_sald_moneda === undefined ){
                                console.log('No se ha detectado saldo en ninguna de las monedas activas');
                            }
                            else {
                                Monedas.update({
                                    _id: v_sald_moneda._id,
                                    moneda: v_sald_moneda.moneda
                                }, {
                                    $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: Number(v_BlcMonedasTradeo.available),
                                                reserva: Number(v_BlcMonedasTradeo.reserved)
                                            },
                                            cuenta: {
                                                activo: Number(v_BlcCuenta.available),
                                                reserva: Number(v_BlcCuenta.reserved)
                                            }
                                        }
                                    }
                                });

                                console.log('############################################');
                                console.log('            Saldo disponible');
                                console.log('############################################');
                                console.log('        ********* ', ' MONEDA: ', v_sald_moneda.moneda, '        ********* ');
                                console.log('     SALDO TRADEO: ', v_BlcMonedasTradeo.available);
                                console.log('     SALDO TRADEO RESERVA: ', v_BlcMonedasTradeo.reserved);
                                console.log('     SALDO EN CUENTA: ', v_BlcCuenta.available);
                                console.log('     SALDO CUENTA RESERVA: ', v_BlcCuenta.reserved);
                                console.log('############################################');
                                console.log(' ');

                                if ( debug_activo === 1) {
                                    Meteor.call("GuardarLogEjecucionTrader", [' SaldoActualMonedas: Se detectó Saldo en cuenta para invertir" : ']+[v_BlcCuenta.available]);
                                    Meteor.call("GuardarLogEjecucionTrader", [' SaldoActualMonedas: Se Procede a transferir fondos al Saldo de trader" : ']+[v_BlcCuenta.available]);
                                };

                                var EstadoTransferencia = Meteor.call( 'Transferirfondos', v_sald_moneda.moneda, v_BlcCuenta.available,'bankToExchange');

                                if ( EstadoTransferencia === 0 ) {
                                    Meteor.call("GuardarLogEjecucionTrader", ' Verificando saldo nuevamente');
                                    Meteor.call( 'SaldoActualMonedas', 1);
                                }
                            }
                        }
                        else if ( SaldoMonedaInvertidoTradear > ValMinTranf && SaldoMonedaGuardadoEnMonederoCuenta !== ValMinTranf && MonedaSaldoCuenta === MonedaSaldoTradear ) {
                            Meteor.call("GuardarLogEjecucionTrader", ' Verificando las monedas que tienen saldo');
                            console.log('Estoy en el if 2 moneda', MonedaSaldoCuenta);
                            try{
                                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                            }
                            catch (error){
                                    Meteor.call("ValidaError", error, 2)
                            };

                            var v_sald_moneda = v_moneda_saldo[0];

                            if ( v_sald_moneda === undefined ){
                                console.log('No se ha detectado saldo en ninguna de las monedas activas');
                            }
                            else {
                                Monedas.update({
                                    _id: v_sald_moneda._id,
                                    moneda: v_sald_moneda.moneda
                                }, {
                                    $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: Number(v_BlcMonedasTradeo.available),
                                                reserva: Number(v_BlcMonedasTradeo.reserved)
                                            },
                                            cuenta: {
                                                activo: Number(v_BlcCuenta.available),
                                                reserva: Number(v_BlcCuenta.reserved)
                                            }
                                        }
                                    }
                                });

                                console.log('############################################');
                                console.log('            Saldo disponible');
                                console.log('############################################');
                                console.log('        ********* ', ' MONEDA: ', v_sald_moneda.moneda, '        ********* ');
                                console.log('     SALDO TRADEO: ', v_BlcMonedasTradeo.available);
                                console.log('     SALDO TRADEO RESERVA: ', v_BlcMonedasTradeo.reserved);
                                console.log('     SALDO EN CUENTA: ', v_BlcCuenta.available);
                                console.log('     SALDO CUENTA RESERVA: ', v_BlcCuenta.reserved);
                                console.log('############################################');
                                console.log(' ');
                            }
                        }
                        else if ( SaldoMonedaInvertidoTradear !== ValMinTranf && SaldoMonedaGuardadoEnMonederoCuenta > ValMinTranf && MonedaSaldoCuenta === MonedaSaldoTradear ) {
                            Meteor.call("GuardarLogEjecucionTrader", ' Verificando las monedas que tienen saldo');
                            console.log('Estoy en el if 3 moneda', MonedaSaldoCuenta);
                            try{
                                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                            }
                            catch (error){
                                    Meteor.call("ValidaError", error, 2)
                            };

                            var v_sald_moneda = v_moneda_saldo[0];

                            if ( v_sald_moneda === undefined ){
                                console.log('No se ha detectado saldo en ninguna de las monedas activas');
                            }
                            else {
                                Monedas.update({
                                    _id: v_sald_moneda._id,
                                    moneda: v_sald_moneda.moneda
                                }, {
                                    $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: Number(v_BlcMonedasTradeo.available),
                                                reserva: Number(v_BlcMonedasTradeo.reserved)
                                            },
                                            cuenta: {
                                                activo: Number(v_BlcCuenta.available),
                                                reserva: Number(v_BlcCuenta.reserved)
                                            }
                                        }
                                    }
                                });

                                console.log('############################################');
                                console.log('            Saldo disponible');
                                console.log('############################################');
                                console.log('        ********* ', ' MONEDA: ', v_sald_moneda.moneda, '        ********* ');
                                console.log('     SALDO TRADEO: ', v_BlcMonedasTradeo.available);
                                console.log('     SALDO TRADEO RESERVA: ', v_BlcMonedasTradeo.reserved);
                                console.log('     SALDO EN CUENTA: ', v_BlcCuenta.available);
                                console.log('     SALDO CUENTA RESERVA: ', v_BlcCuenta.reserved);
                                console.log('############################################');
                                console.log(' ');
                            }

                            if ( debug_activo === 1) {
                                Meteor.call("GuardarLogEjecucionTrader", [' SaldoActualMonedas: Se detectó Saldo en cuenta para invertir" : ']+[v_BlcCuenta.available]);
                                Meteor.call("GuardarLogEjecucionTrader", [' SaldoActualMonedas: Se Procede a transferir fondos al Saldo de trader" : ']+[v_BlcCuenta.available]);
                            };

                            var EstadoTransferencia = Meteor.call( 'Transferirfondos', v_sald_moneda.moneda, v_BlcCuenta.available,'bankToExchange');

                            if ( EstadoTransferencia === 0 ) {
                                Meteor.call("GuardarLogEjecucionTrader", ' Verificando saldo nuevamente');
                                Meteor.call( 'SaldoActualMonedas', 1);
                            }
                        }
                    break;
                }
            };
        };

        if(robot.estado) {
            Monedas.update({
                                moneda: "BTC"
                            },
                            {
                                $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: 1,
                                                reserva: 0
                                            },
                                            cuenta: {
                                                activo: 0,
                                                reserva: 0
                                            }
                                        }
                                    }
                            });

            Monedas.update({
                                moneda: "BCN"
                            },
                            {
                                $set: {
                                        saldo: {
                                            tradeo: {
                                                activo: 0.00000001,
                                                reserva: 0
                                            },
                                            cuenta: {
                                                activo: 0,
                                                reserva: 0
                                            }
                                        }
                                    }
                            });
        } 

    },

    'ListaTiposDeCambios':function(VALOR){

        try{
            var traders = Meteor.call("ConexionGet", simbolos);
            var mon_camb =(traders.data);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };

        for (j = 0, tamanio_mon_camb = mon_camb.length; j < tamanio_mon_camb; j++) {

            var mon_c = mon_camb[j];

            var LTCTipoCambio = mon_c.id;
            var LTCMonedaBase = mon_c.baseCurrency;
            var LTCMonedaCotizacion = mon_c.quoteCurrency;
            var LTCMontoMinCompra = Number( mon_c.tickSize );
            var LTCValorIncremento = Number( mon_c.quantityIncrement );
            var LTCComisionCasaCambio = Number( mon_c.takeLiquidityRate );
            var LTCComisionMercado = Number( mon_c.provideLiquidityRate );
            var LTCMonedaAplicacionComision = mon_c.feeCurrency;


            switch(VALOR){
                case 1:
                    // HACE UNA CONSULTA GENERAL DE LOS TIPO_CAMBIO EXISTENTES
                    console.log('############################################');

                    console.log(' Tipos de Cambio que se están tradeando en HITBTC');
                    console.log(' ');
                    console.log('        ********* ', LTCTipoCambio, '        ********* ');
                    console.log('    MONEDA BASE: ', LTCMonedaBase);
                    console.log('    MONEDA DE COTIZACIÓN: ', LTCMonedaCotizacion);
                    console.log('    MONTO MIN DE COMPRA: ', LTCMontoMinCompra);
                    console.log('    VALOR DE INCREMENTO: ', LTCValorIncremento);
                    console.log(' ');
                    console.log(' *******    VALORES DE COMISIONES    *******');
                    console.log('    COMISION HITBTC: ', LTCComisionCasaCambio);
                    console.log('    COMISION DE MERCADO: ', LTCComisionMercado);
                    console.log('    APLICACION DE COMISION A MONEDA: ', LTCMonedaAplicacionComision);
                    //}
                    break;
                case 2:
                    // ESTO ES PARA VERIFICAR LA TENDENCIA DE LOS TIPOS DE CAMBIO

                    if (TiposDeCambios.find({ tipo_cambio : mon_c.id }).count() !== 0) {
                        try{
                            //TiposDeCambios.update({ tipo_cambio : mon_c.id },{$set:{ tipo_cambio : mon_c.id, moneda_base :  mon_c.baseCurrency, moneda_cotizacion : mon_c.quoteCurrency, activo : "S", comision_hitbtc : v_comision.takeLiquidityRate, comision_mercado : v_comision.provideLiquidityRate, min_compra : v_comision.tickSize, moneda_apli_comision : v_comision.feeCurrency, valor_incremento : v_comision.quantityIncrement  }});
                            TiposDeCambios.update({ tipo_cambio : LTCTipoCambio },{$set:{ tipo_cambio : LTCTipoCambio, moneda_base :  LTCMonedaBase, moneda_cotizacion : LTCMonedaCotizacion, activo : "S", comision_hitbtc : LTCComisionCasaCambio, comision_mercado : LTCComisionMercado, min_compra : LTCMontoMinCompra, moneda_apli_comision : LTCMonedaAplicacionComision, valor_incremento : LTCValorIncremento  }});
                        }
                        catch(error){
                            console.log('Error: los datos no pudieron ser actualizados');
                            Meteor.call('ValidaError', error, 1);
                        }
                    }
                    else {
                        //TiposDeCambios.insert({tipo_cambio : mon_c.id, moneda_base :  mon_c.baseCurrency, moneda_cotizacion : mon_c.quoteCurrency, activo : "S", comision_hitbtc : v_comision.takeLiquidityRate, comision_mercado : v_comision.provideLiquidityRate });
                        TiposDeCambios.insert({tipo_cambio : LTCTipoCambio, moneda_base :  LTCMonedaBase, moneda_cotizacion : LTCMonedaCotizacion, activo : "S", comision_hitbtc : LTCComisionCasaCambio, comision_mercado : LTCComisionMercado, min_compra : LTCMontoMinCompra, moneda_apli_comision : LTCMonedaAplicacionComision, valor_incremento : LTCValorIncremento });
                        console.log('--------------------------------------------');
                        console.log(' ** Detectado nuevo Tipo de Cambio en HITBTC **');
                        console.log('--------------------------------------------');
                        console.log(' ');
                        console.log('        ********* ', LTCTipoCambio, '        ********* ');
                        console.log('    MONEDA BASE: ', LTCMonedaBase);
                        console.log('    MONEDA DE COTIZACIÓN: ', LTCMonedaCotizacion);
                        console.log('    MONTO MIN DE COMPRA: ', LTCMontoMinCompra);
                        console.log('    VALOR DE INCREMENTO: ', LTCValorIncremento);
                        console.log(' ');
                        console.log(' *******    VALORES DE COMISIONES    *******');
                        console.log('    COMISION HITBTC: ', LTCComisionCasaCambio);
                        console.log('    COMISION DE MERCADO: ', LTCComisionMercado);
                        console.log('    APLICACION DE COMISION A MONEDA: ', LTCMonedaAplicacionComision);
                    }



                    break;
                default:
                    console.log(' Valor de tipo consulta no definida ');
            }
        };
    },

    'LibroDeOrdenes':function(){

        console.log('############################################');
        console.log(' Devuelve los datos reales de los valores compra y venta en negociación - (Libro de Ordenes)');

        try {
            var traders = Meteor.call("ConexionGet", simbolos);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };
        var mon_trads =(traders.data);


        for (j = 0, len = mon_trads.length; j < len; j++) {
            var mon_trad = mon_trads[j];

            if ( mon_trad === undefined ) {
                console.log(' No hay Valores en el libro de Ordenes asociados a este Símbolo');
            }
            else {
                var url_compras_ventas = [publico]+['ticker']+'/'+[mon_trad.id];
                try{
                    var compras_ventas = Meteor.call("ConexionGet", url_compras_ventas);
                    var v_compras_ventas = (compras_ventas.data);
                }
            catch (error){
                    Meteor.call("ValidaError", error, 1)
                };

                console.log('\n ');
                console.log('############################################');
                console.log('    Verificando Moneda: ',v_compras_ventas.symbol);
                console.log(' Valor de Oferta en Venta: ', v_compras_ventas.ask);
                console.log(' Valor de Oferta de Compra: ', v_compras_ventas.bid);
                console.log(' Marca de tiempo: ', v_compras_ventas.timestamp);
                console.log('############################################');
            }

        };
    },

    'validaMonedasActivas':function(){
        //traerme las monedas y ver cuales estan activas?

        Meteor.call("ListaMonedas",function(err, result){
            if (err) {
                Meteor.call('ValidaError', err, 1);
            }else {
                var moneda = Meteor.call("ConexionGet", monedas);
                var mons = (moneda.data);
                var monedasBD = Monedas.find({}).fetch();
                var aux1 = [];
                var x;
                var esta;

                for ( a = 0; a < monedasBD.length; a++) {
                    esta = false;
                    x = monedasBD[a].moneda;
                    for ( b = 0; b < mons.length; b++) {
                        if(x === mons[b].id)
                        {
                            esta = true;
                            break;
                        }
                    }
                    if(!esta){
                        aux1.push(monedasBD[a]);
                    }
                }

                for(aux in aux1)
                {
                    try{
                        Monedas.update({ moneda : aux1[aux].moneda },{$set:{ nombre_moneda : aux1[aux].nombre_moneda, activo : "N" }});
                    }
                    catch(error){
                        console.log('Error: los datos no pudieron ser actualizados');
                        Meteor.call('ValidaError', error, 1);
                    }
                }
            }
        });
    },

    'validaTiposDeCambiosActivos':function(){
        //traerme los tipos de cambio y ver cuales estan activos?
        Meteor.call("ListaTiposDeCambios", 2,function(err, result){
            if (err) {
                Meteor.call('ValidaError', err, 1);
            }else {
                var traders = Meteor.call("ConexionGet", simbolos);
                var mon_camb =(traders.data);
                var tradersBD = TiposDeCambios.find({}).fetch();
                var aux1 = [];
                var x;
                var esta;

                for ( a = 0; a < tradersBD.length; a++) {
                    esta = false;
                    x = tradersBD[a].moneda;
                    for ( b = 0; b < mon_camb.length; b++) {
                        if(x === mon_camb[b].id)
                        {
                            esta = true;
                            break;
                        }
                    }
                    if(!esta){
                        aux1.push(tradersBD[a]);
                    }
                }

                console.log(mon_camb[0]);
                console.log(aux1[0]);

                for(aux in aux1)
                {
                    try{
                        TiposDeCambios.update({ tipo_cambio : aux1[aux].tipo_cambio },{$set:{ tipo_cambio : aux1[aux].tipo_cambio, moneda_base :  aux1[aux].moneda_base, moneda_cotizacion : aux1[aux].moneda_cotizacion, activo : "N" }});
                    }
                    catch(error){
                        console.log('Error: los datos no pudieron ser actualizados');
                        Meteor.call('ValidaError', error, 1);
                    }
                }
            }
        });
    },

    'ConsultarTransaciones':function(){

        //para verificar las transaccion solo por monedas especifica se realiza la contruccion parcial de la URL anexando la abreviatura de la monedas ejemp "BTC"
        //const url_transaccion_parcial= ['currency=']+['<abreviatura moneda>']+['&sort=ASC&by=timestamp&limit=']+[cant_transacciones];

        //para verificar una transaccion en especifica se anexar al final de la contrccion de la URL ID de la transaccion ejemp "f672d164-6c6d-4bbd-9ba3-401692b3b404"
        // var Url_Transaccion = [transacciones]+'/'+[<varible de entrada = D de la transaccion>];
        console.log('############################################');
        console.log(' Devuelve los datos Historicos de Transacciones realizadas en la cuenta');
        console.log(' ');
        var url_transaccion_parcial=['sort=ASC&by=timestamp&limit=']+[cant_transacciones];
        var url_transaccion_completa=[transacciones]+'?'+[url_transaccion_parcial];
        console.log(' Valor de URL transacciones:', url_transaccion_completa);

        var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
        var v_transaccion=(transaccion.data);      

        //console.log(v_transaccion);

        for (k = 0, len = v_transaccion.length; k < len; k++) {
            console.log('############################################');
            transaccion = v_transaccion[k];
            console.log(' ID: ',transaccion.id);
            console.log(' INDICE: ',transaccion.index);
            console.log(' TIPO: ',transaccion.type);
            console.log(' STATUS: ',transaccion.status);
            console.log(' MONEDA: ',transaccion.currency);
            console.log(' MONTO: ',transaccion.amount);
            console.log(' FECHA CREACION: ',transaccion.createdAt);
            console.log(' FECHA DE CAMBIO: ',transaccion.updatedAt);
            console.log(' HASH: ',transaccion.hash);
            console.log('############################################');
            console.log(' ');
        };
    },

    'ConsultaOrdenesAbiertas':function(TIPO_CAMBIO){

        var url_orden = [ordenes];
        var OrdeneAbiertas = Meteor.call("ConexionGet",url_orden);

        if ( OrdeneAbiertas === undefined ) {
            console.log('--------------------------------------------');
            console.log("     --- No hay ordenes Abiertas ---");
            console.log('--------------------------------------------');
        }
        else{
            console.log("Ordenes Activas: ", OrdeneAbiertas)
        }
    },

    'RetiroFondos':function(){ //Withdraw crypro

        console.log('############################################');
        console.log(' Realiza el retiro de los fondos de las monedas en estado de reserva');
        console.log(' ');
    },

    'ConsultaRetiroFondos':function(){ //Commit withdraw crypro

        console.log('############################################');
        console.log(' Realiza consulta de transacción retiro de los fondos en proceso');
        console.log(' ');
    },

    'CancelaRetiroFondos':function(){   //Rollback withdraw crypro

        console.log('############################################');
        console.log(' Realiza cancelación de transacción retiro de los fondos en proceso');
        console.log(' ');
    },

    'ConsultaCarterasDeposito':function(){

        console.log('############################################');
        console.log(' Consulta las carteras Activas a la cual se le puede asignar saldo');
        console.log(' ');

        try{
            var moneda = Meteor.call("ConexionGet", monedas);
            //var mons_body = (moneda.body);
            var mons = (moneda.data);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };




        for ( a = 0, len = mons.length ; a < len; a++) {
            console.log('############################################');
            var mon = mons[a];

            console.log( 'Valor de mon', mon);

            console.log('    MONEDA: ', mon.id, '/', mon.fullName);

            var url_cartera_depositos = [cart_dep]+'/'+[mon.id];
            try {
                var v_cartera = Meteor.call("ConexionGet", url_cartera_depositos);
                var cartera = (v_cartera.data);
            }
        catch (error){
                Meteor.call("ValidaError", error, 1)
            };

            console.log('    DIRECCIÓN DE CARTERA: ', cartera.address);
            console.log(' ');
            console.log('############################################');
        };
    },

    'CrearCarterasDeposito':function(MONEDA){ //Create new deposit crypro address

        console.log('############################################');
        console.log(' Crea las carteras Activas a la cual se le puede asignar saldo');
        console.log(' ');
        try{
            var url_NuevaCartera = [cart_dep]+'/'+[MONEDA]
            var NuevaCartera = Meteor.call("ConexionPost", url_NuevaCartera);
            var V_NuevaCartera = (NuevaCartera.data);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };
        console.log(' Nueva cartera: ', V_NuevaCartera.address);
    },

    'Transferirfondos':function(MONEDA, MONTO, TIPO_TRANSF){  //Transfer amount to trading

        console.log('############################################');
        console.log(' Realiza trasnferencia de fondos desde el saldo de la Cuenta al Saldo de tradeo y viseversa');
        console.log(' ');

        //HAY 2 TIPOS DE TRANSFERENCIAS
        // "bankToExchange" Del Saldo de la cuenta a el Saldo de Trader
        // "exchangeToBank" Del Saldo de Trader a el Saldo de la cuenta

        var datos = new Object();
        datos.currency= MONEDA;
        datos.amount = MONTO;
        datos.type = TIPO_TRANSF;

        var url_orden = transferencia;

        try{
            var NuevaTransferencia = Meteor.call("ConexionPost", url_orden, datos);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };

        var StatusEjecucion = NuevaTransferencia.statusCode;
        var IdTransferencia = NuevaTransferencia.data.id;

        switch ( TIPO_TRANSF ) {
            case 'bankToExchange':
                TipoTransferencia = 'Cuenta - Trader';
            break;
            case 'exchangeToBank':
                TipoTransferencia = 'Trader - Cuenta';
            break;
        }

        var FECHA = new Date()

        if ( StatusEjecucion === 200 ) {
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Transferencia Realizada Exitosamente']);
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Transacción: ']+[ IdTransferencia ]);
            HistoralTransferencias.insert({ fecha : FECHA, id : IdTransferencia ,tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : "Exitoso" })

            console.log('############################################');
            console.log('            Status Tranferencia');
            console.log('############################################');
            console.log('        ********* ', ' MONEDA: ',MONEDA, '        ********* ');
            console.log('    FECHA: ', FECHA );
            console.log('    ID: ',IdTransferencia );
            console.log('    TIPO TRANSFERENCIA: ',TipoTransferencia );
            console.log('     MONTO: ', MONTO);
            console.log('    STATUS: ',"EXITOSO" );
            console.log('############################################');
            console.log(' ');

            return 0;
        }
        else{
            HistoralTransferencias.insert({ fecha : FECHA, id : IdTransferencia ,tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : "Fallido" })

            console.log('############################################');
            console.log('            Status Tranferencia');
            console.log('############################################');
            console.log('        ********* ', ' MONEDA: ',MONEDA, '        ********* ');
            console.log('    FECHA: ', FECHA);
            console.log('    TIPO TRANSFERENCIA: ',TipoTransferencia);
            console.log('     MONTO: ', MONTO);
            console.log('    STATUS: ',"FALLIDO");
            console.log('############################################');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos:  Transferencia Fallida'] );
        }        
    },
    
    'CrearNuevaOrder':function(N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO){  //POST

        console.log('############################################');
        console.log('Creando una nueva orden');

        var datos = new Object();
        datos.clientOrderId= N_ID__ORDEN_CLIENT;
        datos.symbol = TIPO_CAMBIO;
        datos.side = T_TRANSACCION;
        datos.timeInForce=ZONA_HORARA;
        datos.quantity = CANT_MONEDA;
        datos.price = PRECIO;

        var url_orden = ordenes;

        var orden = Meteor.call('ConexionPost', url_orden, datos);
    },

    'CrearNuevaOrderRobot':function(SALDO_ACTUAL,N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA, MON_B, MON_C){  //POST

        console.log('############################################');
        console.log('Creando una nueva orden en el ROBOT');

        var datos = new Object();
        datos.clientOrderId= N_ID__ORDEN_CLIENT;
        datos.symbol = TIPO_CAMBIO;
        datos.side = T_TRANSACCION;
        datos.timeInForce=ZONA_HORARA;
        datos.quantity = CANT_MONEDA;

        var fecha = new Date();
        var base = TIPO_CAMBIO.substr(0,3);
        var cambio = TIPO_CAMBIO.substr(3,3);

        switch (T_TRANSACCION){
            case 'buy':
                var V_TipoOperaciont = 'COMPRA';
                break;
            case 'sell':
                var V_TipoOperaciont = 'VENTA';
                break;
            }

        var moneda = OperacionesCompraVenta.findOne({ tipo_cambio : TIPO_CAMBIO, tipo_operacion : V_TipoOperaciont },{ id : 0, precio : 1, fecha : 1 },{ $sort: { fecha : -1 }});
        var comisiones = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO },{ _id : 0, comision_hitbtc : 1 , comision_mercado : 1 },{ $sort: { fecha : -1 }});

        console.log("Valor de comisiones", comisiones);

        //var cantidad = moneda.precio * CANT_MONEDA;
        //
        var cantidad = ((moneda.precio * CANT_MONEDA) - comisiones.comision_hitbtc) - comisiones.comision_mercado;

        var saldo = SALDO_ACTUAL - CANT_MONEDA;

        Monedas.update({moneda : cambio},{$inc:{"saldo.tradeo.activo" : cantidad}})


         switch (T_TRANSACCION){
            case 'buy':
                Monedas.update({ moneda : MON_C},{$set:{"saldo.tradeo.activo" : saldo}});
                break;
            case 'sell':
                Monedas.update({ moneda : MON_B},{$set:{"saldo.tradeo.activo" : saldo}});
                break;
            }

        HistoralTransacciones.insert({ fecha : fecha, id : N_ID__ORDEN_CLIENT ,tipo_transferencia : T_TRANSACCION, moneda_base : MON_B, moneda_cambio : MON_C, monto : cantidad, estado : "Exitoso" });

        console.log("Inversion realizada");
    },

    'borrarOrden':function(TIPO_CAMBIO){  //DELETE

        console.log('############################################');
        console.log('Borrando una nueva orden');

        var datos = new Object();
        datos.symbol=TIPO_CAMBIO;

        var url = [ordenes];

        OrdenBorrada = Meteor.call('ConexionDel',url, datos);

        console.log("Valor de OrdenBorrada", OrdenBorrada);
    },

    'ConsultaTraderGuardados':function(TIPO_CAMBIO){

        if ( debug_activo === 1) {
            //Meteor.call("GuardarLogEjecucionTrader", [' ConsultaTraderGuardados: Consultando el último ID de Transaccion guardado del tipo_cambio: ']+[TIPO_CAMBIO]);
        };

        if ( OperacionesCompraVenta.find({ tipo_cambio:TIPO_CAMBIO }, {}).count() === 0 ){
            if ( debug_activo === 1) {
                console.log('--------------------------------------------');
                console.log('          TIPO DE CAMBIO: ',TIPO_CAMBIO);
                console.log('--------------------------------------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", [' Sin datos en BD local de este tipo_cambio: ']+[TIPO_CAMBIO]);
                console.log(' ');
                console.log('--------------------------------------------');
            };
        }
        else {
            if ( debug_activo === 1) {
                console.log('--------------------------------------------');
                console.log('          TIPO DE CAMBIO: ',TIPO_CAMBIO);
                console.log('--------------------------------------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", [' Datos encontrados para este tipo_cambio: ']+[TIPO_CAMBIO]);
                console.log('                    Verificando... ');
                console.log(' ');
                console.log('--------------------------------------------');
            };
            var VAL_TIPO_CAMBIO = OperacionesCompraVenta.aggregate( [{$match: {tipo_cambio:TIPO_CAMBIO}}, {$group: {_id: "$tipo_cambio", max_id : { $max: "$id_hitbtc"}} }]);

            var v_VAL_TIPO_CAMBIO = VAL_TIPO_CAMBIO;

            for (CTD = 0, tamanio_val_tipo_cambio = v_VAL_TIPO_CAMBIO.length; CTD < tamanio_val_tipo_cambio; CTD++) {
                var v_INT_VAL_TIPO_CAMBIO = v_VAL_TIPO_CAMBIO[CTD];

                console.log('Tipo Cambio: ', v_INT_VAL_TIPO_CAMBIO._id);
                console.log('Valor del ID: ', v_INT_VAL_TIPO_CAMBIO.max_id);
            };

            if ( v_INT_VAL_TIPO_CAMBIO._id === undefined ) {
                Meteor.call("GuardarLogEjecucionTrader", [' ConsultaTraderGuardados: ID de Transaccion No pudo ser recuperado para el tipo de Cambio: ']+[v_INT_VAL_TIPO_CAMBIO._id]);
                return v_INT_VAL_TIPO_CAMBIO.max_id;
            }
            else {
                if ( debug_activo === 1) {
                    Meteor.call("GuardarLogEjecucionTrader", [' ConsultaTraderGuardados: ID de Transaccion recuperado con exito: ']+[v_INT_VAL_TIPO_CAMBIO.max_id]);
                };
            };

            return v_INT_VAL_TIPO_CAMBIO.max_id;
        };
    },

    //'TipoCambioDisponibleCompra':function(VALOR_EJEC, TIPO_MUESTREO){
    'TipoCambioDisponibleCompra':function(){
        var V_EJEC = 2
        //console.log ("Estoy en TipoCambioDisponibleCompra");
        var Vset = new Set();

        TempTiposCambioXMoneda.remove({});
        

        try
            {
                var Monedas_Saldo = Monedas.find({ "saldo.tradeo.activo" : { $gt : 0 }},{} ).fetch();
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

                if (TiposDeCambios.find().count() === 0){
                    Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ningún tipo de Cambio Guardado en la Base de Datos Local, Solucionando ... ']);
                    //Monedas.remove({});
                    Meteor.call("ListaMonedas");
                    Meteor.call("ListaTiposDeCambios", V_EJEC);
                    Meteor.call("SaldoActualMonedas");
                    if (TiposDeCambios.find().count() !== 0){
                        Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: ¡ Listo ! ']);
                    }
                };

                try
                {
                    var monedasCambiablesB = TiposDeCambios.aggregate([ { $match: { "moneda_base": moneda_saldo.moneda, "min_compra" : { $lt : moneda_saldo.saldo.tradeo.activo }}}, { $project: { "tipo_cambio" : 1, "accion" : { $literal: 1 }, "moneda_base" : 1, "moneda_cotizacion" : 1, "saldo_moneda_tradear" : { $literal: moneda_saldo.saldo.tradeo.activo }, "moneda_saldo" : { $literal: moneda_saldo.moneda }, "activo" : 1, "comision_hitbtc" : 1, "comision_mercado" : 1, "min_compra" : 1, "moneda_apli_comision" : 1, "valor_incremento" : 1 } } ]);
                    var monedasCambiablesC = TiposDeCambios.aggregate([ { $match: { "moneda_cotizacion": moneda_saldo.moneda, "min_compra" : { $lt : moneda_saldo.saldo.tradeo.activo }}}, { $project: { "tipo_cambio" : 1, "accion" : { $literal: 2 }, "moneda_base" : 1, "moneda_cotizacion" : 1, "saldo_moneda_tradear" : { $literal: moneda_saldo.saldo.tradeo.activo }, "moneda_saldo" : { $literal: moneda_saldo.moneda }, "activo" : 1, "comision_hitbtc" : 1, "comision_mercado" : 1, "min_compra" : 1, "moneda_apli_comision" : 1, "valor_incremento" : 1 } } ]);

                }
                catch (error){
                    Meteor.call("ValidaError", error, 2);
                };

                var set = new Set();
                for(mc in monedasCambiablesB){
                    set.add( monedasCambiablesB[mc] );
                }

                for(mc in monedasCambiablesC){
                    set.add( monedasCambiablesC[mc]);
                } 
                var TiposDeCambiosRankear = Array.from(set);
                
                for (CTDC = 0, tamanio_TiposDeCambiosRankear = TiposDeCambiosRankear.length; CTDC < tamanio_TiposDeCambiosRankear; CTDC++) {
                    var V_TiposDeCambiosRankear = TiposDeCambiosRankear[CTDC];

                    Vset.add( V_TiposDeCambiosRankear);
                };
            };



            var Valores_TiposDeCambiosRankear = Array.from(Vset);

            //console.log("Valore de Valores_TiposDeCambiosRankear", Valores_TiposDeCambiosRankear)

            for (CTMCB = 0, tamanio_Valores_TiposDeCambiosRankear = Valores_TiposDeCambiosRankear.length; CTMCB < tamanio_Valores_TiposDeCambiosRankear; CTMCB++) {
                    var V_Valores_TiposDeCambiosRankear = Valores_TiposDeCambiosRankear[CTMCB];
                    //console.log("Valor de V_Valores_TiposDeCambiosRankear", V_Valores_TiposDeCambiosRankear)
                    TempTiposCambioXMoneda.insert({ "tipo_cambio": V_Valores_TiposDeCambiosRankear.tipo_cambio ,"moneda_base": V_Valores_TiposDeCambiosRankear.moneda_base , "accion": V_Valores_TiposDeCambiosRankear.accion ,"moneda_cotizacion" : V_Valores_TiposDeCambiosRankear.moneda_cotizacion, "saldo_moneda_tradear" : V_Valores_TiposDeCambiosRankear.saldo_moneda_tradear, "moneda_saldo" : V_Valores_TiposDeCambiosRankear.moneda_saldo, "activo" : V_Valores_TiposDeCambiosRankear.activo , "comision_hitbtc" : V_Valores_TiposDeCambiosRankear.comision_hitbtc  , "comision_mercado" : V_Valores_TiposDeCambiosRankear.comision_mercado  , "min_compra" : V_Valores_TiposDeCambiosRankear.min_compra , "moneda_apli_comision": V_Valores_TiposDeCambiosRankear.moneda_apli_comision , "valor_incremento" : V_Valores_TiposDeCambiosRankear.valor_incremento });
       
                };

            return Valores_TiposDeCambiosRankear;
        }
    },

    'ListaTradeoActual':function( TIPO_CAMBIO, VALOR_EJEC, TIPO_MUESTREO ){

        console.log('############################################');
        console.log(' ');

        //consultamos el último id_transaccion de este Símbolo
        if ( debug_activo === 1) {
            //Meteor.call("GuardarLogEjecucionTrader", ['"ListaTradeoActual" consultando último id_transaccion del tipo_cambio: ']+[TIPO_CAMBIO]);
        };

        var Val_trad = (Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO));
        var Val_trad_tipo_cambio = (Val_trad);

        console.log("Valor de Val_trad_tipo_cambio", Val_trad_tipo_cambio)

        if ( debug_activo === 1) {
            Meteor.call("GuardarLogEjecucionTrader", [' ListaTradeoActual: Valor recuperado de la funcion "ConsultaTraderGuardados" : ']+[Val_trad_tipo_cambio]);
        };

        if ( Val_trad_tipo_cambio === undefined ){
            if ( debug_activo === 1) {
                console.log('Estoy en el if de Val_trad_tipo_cambio');
            };
            var url_tradeos_parcial= ['from=0&by=trade_id&sort=DESC&start_index=0&limit=']+[cant_traders]+['&format_numbers=number'];
        }
        else{
            Val_trad_tipo_cambio= Val_trad_tipo_cambio+1;
            var url_tradeos_parcial= ['&sort=ASC&by=id&from=']+[Val_trad_tipo_cambio]+['&limit=1&format_numbers=number'];
        };

        var url_tradeos_completa = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeos_parcial];        
        var v_tradeos = Meteor.call("ConexionGet", url_tradeos_completa);
        var trad_mon = (v_tradeos.data);




        for (i = 0, tamanio_trad_mon = trad_mon.length; i < tamanio_trad_mon; i++) {

            var v_TradActDat = trad_mon[i];

            switch (v_TradActDat.side){
                case 'buy':
                    var v_tipo_operacion_act = 'COMPRA';
                    break;
                case 'sell':
                    var v_tipo_operacion_act = 'VENTA';
                    break;
                default:
                    Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradActDat.side]);
                    var PeriodoTipoOperacionAct = v_TradActDat.side
            }

            switch(VALOR_EJEC){
                case 1:
                    console.log(' Devuelve los datos Historicos de Tradeo de todas las criptocurrencias negociadas - Esto nos sirve para verificar los valores ascendente. (Order Book)');
                    console.log('############################################');
                    console.log('    Verificando Símbolo tradeo: ',TIPO_CAMBIO);
                    console.log('############################################');

                    if ( v_TradActDat === undefined ) {
                        console.log('############################################');
                        console.log(' No hay Valores asociados a este Tipo de Cambio ',TIPO_CAMBIO);
                        console.log('############################################');

                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                    }
                    else {
                        console.log(' LINEA DE TIEMPO: ',v_TradActDat.timestamp);
                        console.log(' ID: ',v_TradActDat.id);
                        console.log(' PRECIO: ',v_TradActDat.price);
                        console.log(' CANTIDAD: ',v_TradActDat.quantity);
                        console.log(' TIPO OPERACIÓN: ',v_tipo_operacion_act);
                    }

                    console.log('############################################');
                    console.log(' ');
                    break;
                case 2:
                    if ( v_TradActDat === undefined ) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 1 ');
                        console.log('############################################');
                        console.log(' No hay Valores asociados a este Tipo de Cambio ',TIPO_CAMBIO);
                        console.log('############################################');

                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                    }
                    else {
                        switch(TIPO_MUESTREO){
                            case 1:
                                if ( TiposDeCambios.find( {tipo_cambio : TIPO_CAMBIO, "periodo1.precio" : { $exists: true } }).count() === 0 ){
                                    if ( debug_activo === 1) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 - case 1');
                                    }
                                    // Calcula la transaccion anterior utilizando el último Id obtenido restandoles la cantidad 
                                    // de transacciones hacia atrás cant_t_min_atras
                                    
                                    var IdTransAnt = v_TradActDat.id - CantTransAtras
                                    var url_tradeosParcialAnt= ['&sort=ASC&by=id&from=']+[IdTransAnt]+['&limit=1&format_numbers=number'];
                                    var url_tradeosCompletaTransAnt = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeosParcialAnt];
                                    var v_TradAnt = Meteor.call("ConexionGet", url_tradeosCompletaTransAnt);
                                    var TradAnt = (v_TradAnt.data);

                                    var v_TradAntDat = TradAnt[0];
                                    /*
                                    console.log("Valor de IdTransAnt", IdTransAnt);
                                    console.log("Valor de url_tradeosParcialAnt", url_tradeosParcialAnt);
                                    console.log("Valor de v_TradActDat", v_TradActDat);
                                    console.log("Valor de v_TradAnt", v_TradAnt);*/

                                    var PeriodoFechaAnt = v_TradAntDat.timestamp;
                                    var PeriodoId_hitbtcAnt = v_TradAntDat.id;
                                    var PeriodoPrecioAnt = Number(v_TradAntDat.price);
                                    switch (v_TradAntDat.side){
                                        case 'buy':
                                            var PeriodoTipoOperacionAnt = 'COMPRA';
                                            break;
                                        case 'sell':
                                            var PeriodoTipoOperacionAnt = 'VENTA';
                                            break;
                                        default:
                                            Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                            console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_TradAntDat.side);
                                            var PeriodoTipoOperacionAnt = v_TradAntDat.side;
                                    }


                                    var PeriodoFechaAct = v_TradActDat.timestamp;
                                    var PeriodoId_hitbtcAct = v_TradActDat.id;
                                    var PeriodoPrecioAct = Number(v_TradActDat.price);
                                    var PeriodoTipoOperacionAct = v_tipo_operacion_act;


                                    OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAnt, fecha : PeriodoFechaAnt, tipo_cambio : TIPO_CAMBIO, precio : PeriodoPrecioAnt, tipo_operacion : PeriodoTipoOperacionAnt, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": PeriodoId_hitbtcAnt, "periodo1.fecha": PeriodoFechaAnt,"periodo1.precio" : PeriodoPrecioAnt, "periodo1.tipo_operacion": PeriodoTipoOperacionAnt }});
                                }


                                break;
                            case 2:
                                if ( TiposDeCambios.find( {tipo_cambio : TIPO_CAMBIO, "periodo2.precio" : { $exists: true } }).count() === 0 ){
                                    if ( debug_activo === 1) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 - case 2');
                                    }
                                    // Calcula la transaccion anterior utilizando el último Id obtenido restandoles la cantidad 
                                    // de transacciones hacia atrás cant_t_min_atras
                                    // 
                                    var IdTransAnt = v_TradActDat.id - CantTransAtras
                                    var url_tradeosParcialAnt= ['&sort=ASC&by=id&from=']+[IdTransAnt]+['&limit=1&format_numbers=number'];
                                    var url_tradeosCompletaTransAnt = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeosParcialAnt];
                                    var v_TradAnt = Meteor.call("ConexionGet", url_tradeosCompletaTransAnt);
                                    var TradAnt = (v_TradAnt.data);

                                    var v_TradAntDat = TradAnt[0];

                                    var PeriodoFechaAnt = v_TradAntDat.timestamp;
                                    var PeriodoId_hitbtcAnt = v_TradAntDat.id;
                                    var PeriodoPrecioAnt = Number(v_TradAntDat.price);
                                    switch (v_TradAntDat.side){
                                        case 'buy':
                                            var PeriodoTipoOperacionAnt = 'COMPRA';
                                            break;
                                        case 'sell':
                                            var PeriodoTipoOperacionAnt = 'VENTA';
                                            break;
                                        default:
                                            Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                            console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_TradAntDat.side);
                                            var PeriodoTipoOperacionAnt = v_TradAntDat.side;
                                    }


                                    var PeriodoFechaAct = v_TradActDat.timestamp;
                                    var PeriodoId_hitbtcAct = v_TradActDat.id;
                                    var PeriodoPrecioAct = Number(v_TradActDat.price);
                                    var PeriodoTipoOperacionAct = v_tipo_operacion_act;


                                    OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAnt, fecha : PeriodoFechaAnt, tipo_cambio : TIPO_CAMBIO, precio : PeriodoPrecioAnt, tipo_operacion : PeriodoTipoOperacionAnt, muestreo : { periodo2 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo2.id_hitbtc": PeriodoId_hitbtcAnt, "periodo2.fecha": PeriodoFechaAnt,"periodo2.precio" : PeriodoPrecioAnt, "periodo2.tipo_operacion": PeriodoTipoOperacionAnt }});
                                }
                                break;
                            case 3:
                                if ( TiposDeCambios.find( {tipo_cambio : TIPO_CAMBIO, "periodo3.precio" : { $exists: true } }).count() === 0 ){
                                    if ( debug_activo === 1) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 - case 3');
                                    }
                                    // Calcula la transaccion anterior utilizando el último Id obtenido restandoles la cantidad 
                                    // de transacciones hacia atrás cant_t_min_atras
                                    // 
                                    var IdTransAnt = v_TradActDat.id - CantTransAtras
                                    var url_tradeosParcialAnt= ['&sort=ASC&by=id&from=']+[IdTransAnt]+['&limit=1&format_numbers=number'];
                                    var url_tradeosCompletaTransAnt = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeosParcialAnt];
                                    var v_TradAnt = Meteor.call("ConexionGet", url_tradeosCompletaTransAnt);
                                    var TradAnt = (v_TradAnt.data);

                                    var v_TradAntDat = TradAnt[0];

                                    var PeriodoFechaAnt = v_TradAntDat.timestamp;
                                    var PeriodoId_hitbtcAnt = v_TradAntDat.id;
                                    var PeriodoPrecioAnt = Number(v_TradAntDat.price);
                                    switch (v_TradAntDat.side){
                                        case 'buy':
                                            var PeriodoTipoOperacionAnt = 'COMPRA';
                                            break;
                                        case 'sell':
                                            var PeriodoTipoOperacionAnt = 'VENTA';
                                            break;
                                        default:
                                            Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                            console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_TradAntDat.side);
                                            var PeriodoTipoOperacionAnt = v_TradAntDat.side;
                                    }


                                    var PeriodoFechaAct = v_TradActDat.timestamp;
                                    var PeriodoId_hitbtcAct = v_TradActDat.id;
                                    var PeriodoPrecioAct = Number(v_TradActDat.price);
                                    var PeriodoTipoOperacionAct = v_tipo_operacion_act;


                                    OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAnt, fecha : PeriodoFechaAnt, tipo_cambio : TIPO_CAMBIO, precio : PeriodoPrecioAnt, tipo_operacion : PeriodoTipoOperacionAnt, muestreo : { periodo3 : false, periodo3 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo3.id_hitbtc": PeriodoId_hitbtcAnt, "periodo3.fecha": PeriodoFechaAnt,"periodo3.precio" : PeriodoPrecioAnt, "periodo3.tipo_operacion": PeriodoTipoOperacionAnt }});
                                }
                                break;
                            case 4:
                                if ( TiposDeCambios.find( {tipo_cambio : TIPO_CAMBIO, "periodo4.precio" : { $exists: true } }).count() === 0 ){
                                    if ( debug_activo === 1) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 - case 4');
                                    }
                                    // Calcula la transaccion anterior utilizando el último Id obtenido restandoles la cantidad 
                                    // de transacciones hacia atrás cant_t_min_atras
                                    // 
                                    var IdTransAnt = v_TradActDat.id - CantTransAtras
                                    var url_tradeosParcialAnt= ['&sort=ASC&by=id&from=']+[IdTransAnt]+['&limit=1&format_numbers=number'];
                                    var url_tradeosCompletaTransAnt = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeosParcialAnt];
                                    var v_TradAnt = Meteor.call("ConexionGet", url_tradeosCompletaTransAnt);
                                    var TradAnt = (v_TradAnt.data);

                                    var v_TradAntDat = TradAnt[0];

                                    var PeriodoFechaAnt = v_TradAntDat.timestamp;
                                    var PeriodoId_hitbtcAnt = v_TradAntDat.id;
                                    var PeriodoPrecioAnt = Number(v_TradAntDat.price);
                                    switch (v_TradAntDat.side){
                                        case 'buy':
                                            var PeriodoTipoOperacionAnt = 'COMPRA';
                                            break;
                                        case 'sell':
                                            var PeriodoTipoOperacionAnt = 'VENTA';
                                            break;
                                        default:
                                            Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                            console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_TradAntDat.side);
                                            var PeriodoTipoOperacionAnt = v_TradAntDat.side;
                                    }


                                    var PeriodoFechaAct = v_TradActDat.timestamp;
                                    var PeriodoId_hitbtcAct = v_TradActDat.id;
                                    var PeriodoPrecioAct = Number(v_TradActDat.price);
                                    var PeriodoTipoOperacionAct = v_tipo_operacion_act;


                                    OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAnt, fecha : PeriodoFechaAnt, tipo_cambio : TIPO_CAMBIO, precio : PeriodoPrecioAnt, tipo_operacion : PeriodoTipoOperacionAnt, muestreo : { periodo4 : false, periodo4 : false, periodo4 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo4.id_hitbtc": PeriodoId_hitbtcAnt, "periodo4.fecha": PeriodoFechaAnt,"periodo4.precio" : PeriodoPrecioAnt, "periodo4.tipo_operacion": PeriodoTipoOperacionAnt }});
                                }
                                break;
                            case 5:
                                if ( TiposDeCambios.find( {tipo_cambio : TIPO_CAMBIO, "periodo5.precio" : { $exists: true } }).count() === 0 ){
                                    if ( debug_activo === 1) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 - case 5');
                                    }
                                    // Calcula la transaccion anterior utilizando el último Id obtenido restandoles la cantidad 
                                    // de transacciones hacia atrás cant_t_min_atras
                                    // 
                                    var IdTransAnt = v_TradActDat.id - CantTransAtras
                                    var url_tradeosParcialAnt= ['&sort=ASC&by=id&from=']+[IdTransAnt]+['&limit=1&format_numbers=number'];
                                    var url_tradeosCompletaTransAnt = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeosParcialAnt];
                                    var v_TradAnt = Meteor.call("ConexionGet", url_tradeosCompletaTransAnt);
                                    var TradAnt = (v_TradAnt.data);

                                    var v_TradAntDat = TradAnt[0];

                                    var PeriodoFechaAnt = v_TradAntDat.timestamp;
                                    var PeriodoId_hitbtcAnt = v_TradAntDat.id;
                                    var PeriodoPrecioAnt = Number(v_TradAntDat.price);
                                    switch (v_TradAntDat.side){
                                        case 'buy':
                                            var PeriodoTipoOperacionAnt = 'COMPRA';
                                            break;
                                        case 'sell':
                                            var PeriodoTipoOperacionAnt = 'VENTA';
                                            break;
                                        default:
                                            Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                            console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_TradAntDat.side);
                                            var PeriodoTipoOperacionAnt = v_TradAntDat.side;
                                    }


                                    var PeriodoFechaAct = v_TradActDat.timestamp;
                                    var PeriodoId_hitbtcAct = v_TradActDat.id;
                                    var PeriodoPrecioAct = Number(v_TradActDat.price);
                                    var PeriodoTipoOperacionAct = v_tipo_operacion_act;


                                    OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAnt, fecha : PeriodoFechaAnt, tipo_cambio : TIPO_CAMBIO, precio : PeriodoPrecioAnt, tipo_operacion : PeriodoTipoOperacionAnt, muestreo : { periodo5 : false, periodo5 : false, periodo5 : false, periodo5 : false, periodo5 : false, periodo6 : false } });
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo5.id_hitbtc": PeriodoId_hitbtcAnt, "periodo5.fecha": PeriodoFechaAnt,"periodo5.precio" : PeriodoPrecioAnt, "periodo5.tipo_operacion": PeriodoTipoOperacionAnt }});
                                }
                                break;
                            case 6:
                                if ( TiposDeCambios.find( {tipo_cambio : TIPO_CAMBIO, "periodo6.precio" : { $exists: true } }).count() === 0 ){
                                    if ( debug_activo === 1) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 - case 6');
                                    }
                                    // Calcula la transaccion anterior utilizando el último Id obtenido restandoles la cantidad 
                                    // de transacciones hacia atrás cant_t_min_atras
                                    // 
                                    var IdTransAnt = v_TradActDat.id - CantTransAtras
                                    var url_tradeosParcialAnt= ['&sort=ASC&by=id&from=']+[IdTransAnt]+['&limit=1&format_numbers=number'];
                                    var url_tradeosCompletaTransAnt = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeosParcialAnt];
                                    var v_TradAnt = Meteor.call("ConexionGet", url_tradeosCompletaTransAnt);
                                    var TradAnt = (v_TradAnt.data);

                                    var v_TradAntDat = TradAnt[0];

                                    var PeriodoFechaAnt = v_TradAntDat.timestamp;
                                    var PeriodoId_hitbtcAnt = v_TradAntDat.id;
                                    var PeriodoPrecioAnt = Number(v_TradAntDat.price);
                                    switch (v_TradAntDat.side){
                                        case 'buy':
                                            var PeriodoTipoOperacionAnt = 'COMPRA';
                                            break;
                                        case 'sell':
                                            var PeriodoTipoOperacionAnt = 'VENTA';
                                            break;
                                        default:
                                            Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                            console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_TradAntDat.side);
                                            var PeriodoTipoOperacionAnt = v_TradAntDat.side;
                                    }


                                    var PeriodoFechaAct = v_TradActDat.timestamp;
                                    var PeriodoId_hitbtcAct = v_TradActDat.id;
                                    var PeriodoPrecioAct = Number(v_TradActDat.price);
                                    var PeriodoTipoOperacionAct = v_tipo_operacion_act;


                                    OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAnt, fecha : PeriodoFechaAnt, tipo_cambio : TIPO_CAMBIO, precio : PeriodoPrecioAnt, tipo_operacion : PeriodoTipoOperacionAnt, muestreo : { periodo6 : false, periodo6 : false, periodo6 : false, periodo6 : false, periodo6 : false, periodo6 : false } });
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo6.id_hitbtc": PeriodoId_hitbtcAnt, "periodo6.fecha": PeriodoFechaAnt,"periodo6.precio" : PeriodoPrecioAnt, "periodo6.tipo_operacion": PeriodoTipoOperacionAnt }});
                                }
                                break;
                        }


                        var PeriodoFechaAct = v_TradActDat.timestamp;
                        var PeriodoId_hitbtcAct = v_TradActDat.id;
                        var PeriodoPrecioAct = Number(v_TradActDat.price);
                        var PeriodoTipoOperacionAct = v_tipo_operacion_act;
                        OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAct, fecha : PeriodoFechaAct, tipo_cambio : TIPO_CAMBIO, precio : PeriodoPrecioAct, tipo_operacion : PeriodoTipoOperacionAct, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });

                    }
                    break;
                default:
                    console.log(' Valor de tipo consulta no definida ');
            }
        };
    },

    'EvaluarTendencias':function( TIPOCAMBIO, TIPO_MUESTREO, T_ACCION){


        // Formula de deprecación
        // TENDENCIA = ((valor actual - valor anterior) / valor anterior) * 100
        // Si es positivo la moneda base se está depreciando y la moneda en cotizacion se está apreciando
        // Si es negativa la moneda base de está apreciando y la moneda en cotizacion se está apreciando
        // Cuando se está evaluando la moneda a comprar si el resultado es + esa moneda esta en alza sino está a la baja
        // Cuando se está evaluando la moneda invertida si el resultado es + esa moneda esta en baja sino está a la alza
        if ( debug_activo === 1) {
            Meteor.call("GuardarLogEjecucionTrader", ' EvaluarTendencias: Paso 5 ');
            //console.log("Tipo de Cambio recibido", TIPOCAMBIO, " TIPO_ACCION: ", T_ACCION)
        }


        switch (TIPO_MUESTREO){
            case 1:
                if ( debug_activo === 1) {
                    Meteor.call("GuardarLogEjecucionTrader", ' EvaluarTendencias: Paso 5 - switch Inicial - Case 1');
                }
                try{
                    var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
                }
                catch (error){    
                Meteor.call("ValidaError", error, 2);
                };        

                //console.log("Valor de TradAnt", TradAnt, "Tipode cambio a verificar: ", TIPOCAMBIO, "Valor de TIPO_MUESTREO: ", TIPO_MUESTREO);
                    
                try{
                    //var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                }
                catch (error){    
                    Meteor.call("ValidaError", error, 2);
                };
                var RegAnt = TradAnt
                var RegAct = TransProcesar[0]

                //console.log("Valores Conseguidos de RegAnt: ", RegAnt)
                //console.log("Valores Conseguidos de RegAct: ", RegAct)


                var PeriodoFechaAnt = RegAnt.periodo1.fecha;
                var PeriodoId_hitbtcAnt = RegAnt.periodo1.id_hitbtc;
                var PeriodoPrecioAnt = Number(RegAnt.periodo1.precio);
                var PeriodoTipoOperacionAnt = RegAnt.periodo1.tipo_operacion;
                                    
                var PeriodoFechaAct = RegAct.fecha;
                var PeriodoId_hitbtcAct = RegAct.id_hitbtc;
                var PeriodoPrecioAct = Number(RegAct.precio);
                var PeriodoTipoOperacionAct = RegAct.tipo_operacion;

                    


                console.log('--------------------------------------------');
                console.log('          TIPO DE CAMBIO: ',TIPOCAMBIO);
                console.log('--------------------------------------------');
                console.log(' ');
                console.log('----------- TRANSACCION ANTERIOR -----------');
                console.log(' ');
                console.log(' LINEA DE TIEMPO: ', PeriodoFechaAnt);
                console.log(' ID: ',PeriodoId_hitbtcAnt);
                console.log(' PRECIO: ',PeriodoPrecioAnt);
                console.log(' TIPO OPERACIÓN: ',PeriodoTipoOperacionAnt);
                console.log(' COMISION: ',PeriodoTipoOperacionAnt);
                console.log('--------------------------------------------');
                console.log(' ');
                console.log('------------ ULTIMA TRANSACCION ------------');
                console.log(' ');
                console.log(' LINEA DE TIEMPO: ',PeriodoFechaAct);
                console.log(' ID: ',PeriodoId_hitbtcAct);
                console.log(' PRECIO: ',PeriodoPrecioAct);
                console.log(' TIPO OPERACIÓN: ',PeriodoTipoOperacionAct);
                console.log('--------------------------------------------');
                console.log('          CALCULANDO TENDENCIA ');
                console.log('--------------------------------------------');
                console.log(' ');


                var ValPrecAnt = PeriodoPrecioAnt;
                var ValPrecAct = PeriodoPrecioAct;

                var ProcenApDp = (((ValPrecAct - ValPrecAnt ) / ValPrecAnt ) * 100 ) ;

                console.log(' TENDENCIA: ',ProcenApDp);
                //console.log('--------------------------------------------');

                try{
                    if (ValPrecAct > ValPrecAnt ) {
                        TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo1.tendencia" : ProcenApDp, activo : "S", "periodo1.id_hitbtc": PeriodoId_hitbtcAct, "periodo1.fecha": PeriodoFechaAct,"periodo1.precio" : PeriodoPrecioAct, "periodo1.tipo_operacion": PeriodoTipoOperacionAct }}, {"multi" : true,"upsert" : true});
                        
                        switch (T_ACCION){
                            case 1: 
                                    var CambioSignoTendencia = ( ProcenApDp * 1 )
                                    console.log(' TENDENCIA RECALCULADA: ',CambioSignoTendencia);
                                    console.log(" TIPO_ACCION ", T_ACCION)
                                    console.log('--------------------------------------------');
                                    TempTiposCambioXMoneda.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo1.tendencia_real" : ProcenApDp, "periodo1.tendencia_recalculada" : CambioSignoTendencia, activo : "S", "periodo1.id_hitbtc": PeriodoId_hitbtcAct, "periodo1.fecha": PeriodoFechaAct,"periodo1.precio" : PeriodoPrecioAct, "periodo1.tipo_operacion": PeriodoTipoOperacionAct }}, {"multi" : true,"upsert" : true});
                            break;
                            case 2: 
                                    var CambioSignoTendencia = ( ProcenApDp * -1 )
                                    console.log(' TENDENCIA RECALCULADA: ',CambioSignoTendencia);
                                    console.log(" TIPO_ACCION ", T_ACCION)
                                    console.log('--------------------------------------------');

                                    TempTiposCambioXMoneda.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo1.tendencia_real" : ProcenApDp, "periodo1.tendencia_recalculada" : CambioSignoTendencia, activo : "S", "periodo1.id_hitbtc": PeriodoId_hitbtcAct, "periodo1.fecha": PeriodoFechaAct,"periodo1.precio" : PeriodoPrecioAct, "periodo1.tipo_operacion": PeriodoTipoOperacionAct }}, {"multi" : true,"upsert" : true});   
                            break;                            
                        }

                    }
                    else{
                        TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo1.tendencia" : ProcenApDp }}, {"multi" : true,"upsert" : true});
                        switch (T_ACCION){
                            case 1: 
                                    var CambioSignoTendencia = ( ProcenApDp * 1 )
                                    console.log(' TENDENCIA RECALCULADA: ',CambioSignoTendencia);
                                    console.log(" TIPO_ACCION ", T_ACCION)
                                    console.log('--------------------------------------------');
                                    TempTiposCambioXMoneda.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo1.tendencia_real" : ProcenApDp, "periodo1.tendencia_recalculada" : CambioSignoTendencia }}, {"multi" : true,"upsert" : true});
                            break;
                            case 2: 
                                    var CambioSignoTendencia = ( ProcenApDp * -1 )
                                    console.log(' TENDENCIA RECALCULADA: ',CambioSignoTendencia);
                                    console.log(" TIPO_ACCION ", T_ACCION)
                                    console.log('--------------------------------------------');
                                    TempTiposCambioXMoneda.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo1.tendencia_real" : ProcenApDp, "periodo1.tendencia_recalculada" : CambioSignoTendencia }}, {"multi" : true,"upsert" : true});
                            break;                            
                        }


                    }
                    OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                }
                catch(error){
                    Meteor.call("ValidaError", error, 2);
                }
            break;
        }
    },

    'Invertir': function( MONEDA, VALOR_EJEC, LIMITE_AP_DEP ){

        fecha = moment (new Date());

        console.log('############################################');
        console.log(' *CALCULANDO RANKING DE LOS TIPOS DE CAMBIO*');
        console.log('############################################');
        console.log(' *           MONEDA: ',  MONEDA);
        console.log('############################################');
        console.log(' ');


        
        var robot = Parametros.findOne({ dominio : "robot", nombre : "test" }, {_id : 0, valor : 0, estado: 1 });

        var CantPropTipoCambios;



        if ( debug_activo === 1) {
            Meteor.call("GuardarLogEjecucionTrader", " 'Invertir' - Paso 6 ");
        }

        switch(VALOR_EJEC){
            case 1:
                if ( debug_activo === 1) {
                    Meteor.call("GuardarLogEjecucionTrader", " 'Invertir' - Paso 6 - case 2 ");
                }

                

                try{
                    var CPTC = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA,"periodo1.tendencia_recalculada" : { $gt : LIMITE_AP_DEP }}}, { $sort: { "periodo1.tendencia_recalculada" : -1 }}, { $limit: 3 }, { $count: "CantidadDeTiposDeCambios" } ]);
                    var CantPropTipoCambios = CPTC[0].CantidadDeTiposDeCambios;
                    var RankingTiposDeCambios = TempTiposCambioXMoneda.aggregate([{ $match: {  "moneda_saldo" : MONEDA, "periodo1.tendencia_recalculada" : { $gt : LIMITE_AP_DEP }}}, { $sort: { "periodo1.tendencia_recalculada" : -1 }}, { $limit: 3 } ]);
                    var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
                    var ProporcionTipoCambios = PTC[0];
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2);
                };


                //console.log("Valor de CantPropTipoCambios", CantPropTipoCambios)

                //console.log("Valor de RankingTiposDeCambios", RankingTiposDeCambios)



                CantPropTipoCambiosValidados = 0
                switch (CantPropTipoCambios){
                    case undefined:
                        CantPropTipoCambiosValidados = 0;
                    break;
                    case 1:
                        var VMC = RankingTiposDeCambios[0];
                        ValorMinimoCompra = TipoCambioRanking.min_compra;
                        console.log(' Valor de V_MonedaBase: ', V_MonedaBase);
                        console.log(" Valor de ValorMinimoCompra", ValorMinimoCompra)
                        var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p11;
                        if ( SaldoInvertir >= ValorMinimoCompra ) {
                            CantPropTipoCambiosValidados = CantPropTipoCambios
                        }
                        console.log("Valor de SaldoInvertir", SaldoInvertir)
                    break;
                    case 2:
                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            switch (CRTC){
                                case 0:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p13;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                                case 1:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p23;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                            }
                        }
                    break;
                    case 3:
                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            switch (CRTC){
                                case 0:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p13;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                                case 1:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p23;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                                case 2:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p33;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                            }
                            console.log('--------------------------------------------');
                        }
                    break;
                }
                

                switch (CantPropTipoCambiosValidados){
                    case 0:
                        console.log('--------------------------------------------');
                        console.log("            **** EN ESPERA **** ")
                        console.log("   | Tendencias Analizadas no superan |")
                        console.log("   |   limites Mínimos configurados   |")
                        console.log(' ');
                        console.log("   Valor Mínimo Actual Configurado: ", LIMITE_AP_DEP)
                        console.log('--------------------------------------------');
                    break;
                    case 1:

                        console.log('--------------------------------------------');
                        console.log("             **** INVERTIR **** ")
                        console.log("   | Realizando Calculos de inversión |")
                        console.log("   |   ............................   |")
                        console.log(' ');

                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            
                            var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p11;
                            
                            console.log('--------------------------------------------');
                            console.log('                  POSICIÓN:', CRTC+1);
                            console.log('        ********* ', ' TIPO CAMBIO: ', TipoCambioRanking.tipo_cambio, '        ********* ');
                            console.log('    MONEDA BASE: ', TipoCambioRanking.moneda_base);
                            console.log('    MONEDA COTIZACION: ', TipoCambioRanking.moneda_cotizacion);
                            console.log('     TENDENCIA: ', TipoCambioRanking.periodo1.tendencia);
                            console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p11*100,'%');
                            console.log('     SALDO TOTAL ACTUAL: ', TipoCambioRanking.saldo_moneda_tradear );
                            console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                            console.log('--------------------------------------------');
                        };
                    break;
                    case 2:
                        console.log('--------------------------------------------');
                        console.log("             **** INVERTIR **** ")
                        console.log("   | Realizando Calculos de inversión |")
                        console.log("   |   ............................   |")
                        console.log(' ');

                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            
                            console.log('--------------------------------------------');
                            console.log('                  POSICIÓN:', CRTC+1);
                            console.log('        ********* ', ' TIPO CAMBIO: ', TipoCambioRanking.tipo_cambio, '        ********* ');
                            console.log('    MONEDA BASE: ', TipoCambioRanking.moneda_base);
                            console.log('    MONEDA COTIZACION: ', TipoCambioRanking.moneda_cotizacion);
                            console.log('    TENDENCIA: ', TipoCambioRanking.periodo1.tendencia);
                            switch (CRTC){
                                case 0:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p12;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p12*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                break;
                                case 1:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p22;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p22*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                break;
                            }
                        }
                    break;
                    case 3:

                        console.log('--------------------------------------------');
                        console.log("             **** INVERTIR **** ")
                        console.log("   | Realizando Calculos de inversión |")
                        console.log("   |   ............................   |")
                        console.log(' ');

                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            
                            console.log('--------------------------------------------');
                            console.log('                  POSICIÓN:', CRTC+1);
                            console.log('        ********* ', ' TIPO CAMBIO: ', TipoCambioRanking.tipo_cambio, '        ********* ');
                            console.log('    MONEDA BASE: ', TipoCambioRanking.moneda_base);
                            console.log('    MONEDA COTIZACION: ', TipoCambioRanking.moneda_cotizacion);
                            console.log('    TENDENCIA: ', TipoCambioRanking.periodo1.tendencia_recalculada);
                            switch (CRTC){
                                case 0:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p13;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p13*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                break;
                                case 1:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p23;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p23*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                break;
                                case 2:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p33;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p33*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                break;
                            }
                        }
                    break;
                    default:
                }
            break;
            case 2:
                if ( debug_activo === 1) {
                    Meteor.call("GuardarLogEjecucionTrader", " 'Invertir' - Paso 6 - case 2 ");
                }

                

                try{
                    var CPTC = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA,"periodo1.tendencia_recalculada" : { $gt : LIMITE_AP_DEP }}}, { $sort: { "periodo1.tendencia_recalculada" : -1 }}, { $limit: 3 }, { $count: "CantidadDeTiposDeCambios" } ]);
                    var CantPropTipoCambios = CPTC[0].CantidadDeTiposDeCambios;
                    var RankingTiposDeCambios = TempTiposCambioXMoneda.aggregate([{ $match: {  "moneda_saldo" : MONEDA, "periodo1.tendencia_recalculada" : { $gt : LIMITE_AP_DEP }}}, { $sort: { "periodo1.tendencia_recalculada" : -1 }}, { $limit: 3 } ]);
                    var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
                    var ProporcionTipoCambios = PTC[0];
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2);
                };


                //console.log("Valor de CantPropTipoCambios", CantPropTipoCambios)

                //console.log("Valor de RankingTiposDeCambios", RankingTiposDeCambios)



                CantPropTipoCambiosValidados = 0
                switch (CantPropTipoCambios){
                    case undefined:
                        CantPropTipoCambiosValidados = 0;
                    break;
                    case 1:
                        var VMC = RankingTiposDeCambios[0];
                        ValorMinimoCompra = TipoCambioRanking.min_compra;
                        console.log(' Valor de V_MonedaBase: ', V_MonedaBase);
                        console.log(" Valor de ValorMinimoCompra", ValorMinimoCompra)
                        var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p11;
                        if ( SaldoInvertir >= ValorMinimoCompra ) {
                            CantPropTipoCambiosValidados = CantPropTipoCambios
                        }
                        console.log("Valor de SaldoInvertir", SaldoInvertir)
                    break;
                    case 2:
                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            switch (CRTC){
                                case 0:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p13;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                                case 1:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p23;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                            }
                        }
                    break;
                    case 3:
                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            switch (CRTC){
                                case 0:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p13;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                                case 1:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p23;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                                case 2:
                                    var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p33;
                                    var ValorMinimoCompra = TipoCambioRanking.min_compra;
                                    if ( SaldoInvertir >= ValorMinimoCompra ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                    console.log("Valor de SaldoActualMoneda", TipoCambioRanking.saldo_moneda_tradear)
                                    console.log("Valor de SaldoInvertir", SaldoInvertir)
                                    console.log("Valor de ValorMinimoCompra", ValorMinimoCompra)
                                    console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados)
                                break;
                            }
                            console.log('--------------------------------------------');
                        }
                    break;
                }
                

                switch (CantPropTipoCambiosValidados){
                    case 0:
                        console.log('--------------------------------------------');
                        console.log("            **** EN ESPERA **** ")
                        console.log("   | Tendencias Analizadas no superan |")
                        console.log("   |   limites Mínimos configurados   |")
                        console.log(' ');
                        console.log("   Valor Mínimo Actual Configurado: ", LIMITE_AP_DEP)
                        console.log('--------------------------------------------');
                    break;
                    case 1:

                        console.log('--------------------------------------------');
                        console.log("             **** INVERTIR **** ")
                        console.log("   | Realizando Calculos de inversión |")
                        console.log("   |   ............................   |")
                        console.log(' ');

                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            
                            var SaldoInvertir = TipoCambioRanking.saldo_moneda_tradear*ProporcionTipoCambios.valor.p11;
                            
                            console.log('--------------------------------------------');
                            console.log('                  POSICIÓN:', CRTC+1);
                            console.log('        ********* ', ' TIPO CAMBIO: ', TipoCambioRanking.tipo_cambio, '        ********* ');
                            console.log('     MONEDA BASE: ', TipoCambioRanking.moneda_base);
                            console.log('     MONEDA COTIZACION: ', TipoCambioRanking.moneda_cotizacion);
                            console.log('     TENDENCIA: ', TipoCambioRanking.periodo1.tendencia);
                            console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p11*100,'%');
                            console.log('     SALDO TOTAL ACTUAL: ', TipoCambioRanking.saldo_moneda_tradear );
                            console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                            console.log('     ACCION: ', TipoCambioRanking.accion );
                            console.log('--------------------------------------------');
                            
                            switch (TipoCambioRanking.accion){
                                case 1:
                                    if(robot.estado) {
                                        console.log('Entre  En el robot simulador 1' );
                                        idTrans = idTrans+1;
                                        console.log('OPERACION A REALIZAR: VENDER' );
                                        //--Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'sell',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                    } else {
                                     //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                    }
                                break;
                                case 2:
                                    if(robot.estado) {
                                        console.log('Entre  En el robot simulador 1' );
                                        idTrans = idTrans+1;
                                        console.log('OPERACION A REALIZAR: COMPRAR' );
                                        //--Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'buy',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                    } else {
                                     //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                        
                                    }
                                break;
                            }
                        };


                    break;
                    case 2:

                        console.log('--------------------------------------------');
                        console.log("             **** INVERTIR **** ")
                        console.log("   | Realizando Calculos de inversión |")
                        console.log("   |   ............................   |")
                        console.log(' ');

                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            
                            console.log('--------------------------------------------');
                            console.log('                  POSICIÓN:', CRTC+1);
                            console.log('        ********* ', ' TIPO CAMBIO: ', TipoCambioRanking.tipo_cambio, '        ********* ');
                            console.log('    MONEDA BASE: ', TipoCambioRanking.moneda_base);
                            console.log('    MONEDA COTIZACION: ', TipoCambioRanking.moneda_cotizacion);
                            console.log('    TENDENCIA: ', TipoCambioRanking.periodo1.tendencia);
                            switch (CRTC){
                                case 0:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p12;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p12*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                    console.log('     ACCION: ', TipoCambioRanking.accion );
                                    switch (TipoCambioRanking.accion){
                                        case 1:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 2' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: VENDER' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'sell',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                            }
                                        break;
                                        case 2:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 1' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: COMPRAR' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'buy',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                                
                                            }
                                        break;
                                    }
                                break;
                                case 1:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p22;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p22*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                    console.log('     ACCION: ', TipoCambioRanking.accion );
                                    switch (TipoCambioRanking.accion){
                                        case 1:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 2' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: VENDER' );
                                                //--Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'sell',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                            }
                                        break;
                                        case 2:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 1' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: COMPRAR' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'buy',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                                
                                            }
                                        break;
                                    }
                                break;
                            }
                        }
                    break;
                    case 3:

                        console.log('--------------------------------------------');
                        console.log("             **** INVERTIR **** ")
                        console.log("   | Realizando Calculos de inversión |")
                        console.log("   |   ............................   |")
                        console.log(' ');

                        for (CRTC = 0, TRTC = RankingTiposDeCambios.length; CRTC < TRTC; CRTC++) {
                            TipoCambioRanking = RankingTiposDeCambios[CRTC];
                            
                            console.log('--------------------------------------------');
                            console.log('                  POSICIÓN:', CRTC+1);
                            console.log('        ********* ', ' TIPO CAMBIO: ', TipoCambioRanking.tipo_cambio, '        ********* ');
                            console.log('    MONEDA BASE: ', TipoCambioRanking.moneda_base);
                            console.log('    MONEDA COTIZACION: ', TipoCambioRanking.moneda_cotizacion);
                            console.log('    TENDENCIA: ', TipoCambioRanking.periodo1.tendencia_recalculada);
                            switch (CRTC){
                                case 0:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p13;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p13*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                    console.log('     ACCION: ', TipoCambioRanking.accion );
                                    switch (TipoCambioRanking.accion){
                                        case 1:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 3' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: VENDER' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'sell',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                            }
                                        break;
                                        case 2:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 1' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: COMPRAR' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'buy',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                                
                                            }
                                        break;
                                    }
                                break;
                                case 1:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p23;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p23*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                    console.log('     ACCION: ', TipoCambioRanking.accion );
                                    switch (TipoCambioRanking.accion){
                                        case 1:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 3' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: VENDER' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'sell',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                            }
                                        break;
                                        case 2:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 1' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: COMPRAR' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'buy',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                                
                                            }
                                        break;
                                    }
                                break;
                                case 2:
                                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                    var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p33;
                                    console.log('     PORCENTAJE A INVERTIR: ', ProporcionTipoCambios.valor.p33*100,'%');
                                    console.log('     SALDO TOTAL ACTUAL: ', SaldoActualMoneda );
                                    console.log('     MONTO A INVERTIR: ', SaldoInvertir );
                                    console.log('     ACCION: ', TipoCambioRanking.accion );
                                    switch (TipoCambioRanking.accion){
                                        case 1:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 3' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: VENDER' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'sell',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                            }
                                        break;
                                        case 2:
                                            if(robot.estado) {
                                                console.log('Entre  En el robot simulador 1' );
                                                idTrans = idTrans+1;
                                                console.log('OPERACION A REALIZAR: COMPRAR' );
                                                Meteor.call('CrearNuevaOrderRobot',SaldoActualMoneda,idTrans,TipoCambioRanking.tipo_cambio,'buy',SaldoInvertir, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion);
                                            } else {
                                             //   Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO);
                                                
                                            }
                                        break;
                                    }
                                break;
                            }
                        }
                    break;
                    default:
                }
            break;
        }
        
        console.log('--------------------------------------------');
        console.log('############################################');
        console.log('--------------   FINALIZADO   --------------');
        console.log('        ',fecha._d);
        console.log('############################################');
    },

    'Prueba':function(){ 
        TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra');

        for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
                    var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];

                    //console.log("Valor de tipo_cambio_verificar", tipo_cambio_verificar)

                    Meteor.call('EvaluarTendencias', tipo_cambio_verificar.tipo_cambio, 1, tipo_cambio_verificar.accion );
                }               
                

        //console.log("Valor de TiposDeCambioVerificar", TiposDeCambioVerificar)

        //console.log ("Estoy en Prueba");
/*
        for (CTCV = 0, tamanio_TiposDeCambioVerificar = TiposDeCambioVerificar.length; CTCV < tamanio_TiposDeCambioVerificar; CTCV++) {
            var V_TiposDeCambioVerificar = TiposDeCambioVerificar[CTCV];

            console.log('Valor de TiposDeCambioVerificar -- : ', V_TiposDeCambioVerificar);
            //console.log('Valor de TiposDeCambioVerificar -- : ', V_TiposDeCambioVerificar._id);
            Meteor.call('ListaTradeoActual', V_TiposDeCambioVerificar._id, 2, 1);
            Meteor.call('EvaluarTendencias', V_TiposDeCambioVerificar._id, 1 );

        };
*/
        var MonedasVerificar = TempTiposCambioXMoneda.aggregate([ { $group: { _id : "$moneda_saldo" } },
                                     { $project: { _id : 1 } }
                                    ]);

        for (CMV = 0, TMV = MonedasVerificar.length; CMV < TMV; CMV++) {
            var V_moneda_verificar = MonedasVerificar[CMV];
            //console.log("Valor de V_moneda_verificar", V_moneda_verificar)
            Meteor.call("Invertir", V_moneda_verificar._id ,2, 2 );
        }

        /*
        try {
            var EjecucionInicial = Parametros.find({ dominio : 'ejecucion', nombre : 'EjecInicial', estado : true, valor: { muestreo : { periodo_inicial : true } }},{}).count()



            if ( EjecucionInicial === 1 ){
                Jobs.run("JobSecuenciaInicial", {
                    in: {
                        second: 5
                        }
                });
            }
            else if ( EjecucionInicial === 0 ) {
                Jobs.run("JobSecuencia", {
                    in: {
                        second: 5
                        }
                });
            };
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        }*/
        //Meteor.call("TipoCambioDisponibleCompra");
        
        //Meteor.call("Prueba");

        //Meteor.call("ListaTradeoActual",VALOR);
        //Meteor.call("ConsultaOrdenesAbiertas");
        //Meteor.call("ListaTradeoActual","BTCUSD");
        //Meteor.call("EvaluarTendencias");
        //Meteor.call("LibroDeOrdenes");
        //Meteor.call("CrearNuevaOrder");
        //Meteor.call("borrarOrden");
    },

    'EjecucionInicial':function(){

        Meteor.call("Encabezado");
        Meteor.call("ListaMonedas");
        Meteor.call("ListaTiposDeCambios", 2);
        Meteor.call("SaldoActualMonedas", 2);
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
        //Meteor.call("Prueba");
        //var tiposCamb = ["XMRUSD", "XMRETH", "XMRBTC"];
        //Meteor.call("Invertir", tiposCamb, 2, 0);
        //Meteor.call("SaldoActualMonedas", 1);
        //Meteor.call("ListaTiposDeCambios", 1);
        //Meteor.call("TipoCambioDisponibleCompra", 1, 1);

        //console.log("Valor de prueba: ", prueba);

        //Meteor.call("FinEjecucion");
    }

});

Meteor.startup(function (){
    // code to run on server at startup
    // Verificamos si la aplicación es su ejecución Inicial o no
    
    try {
        var EjecucionInicial = Parametros.find({ dominio : 'ejecucion', nombre : 'EjecInicial', estado : true, valor: { muestreo : { periodo_inicial : true } }},{}).count()

        if ( EjecucionInicial === 1 ){
            Jobs.run("JobSecuenciaInicial", {
                in: {
                    second: 5
                    }
            });
        }
        else if ( EjecucionInicial === 0 ) {
            Jobs.run("JobSecuencia", {
                in: {
                    second: 5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                    }
            });
        };
    }
    catch (error){
        Meteor.call("ValidaError", error, 2);
    }
    
});