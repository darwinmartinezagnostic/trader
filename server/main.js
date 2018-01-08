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
const nueva_transferencia = [cuenta]+"transfer";
// API Trading History
const HistTradeo = [historial]+"trades";
const HistOrdenes = [historial]+"order";
// CANTIDADES DE REGISTROS
const cant_traders = 1;
const cant_transacciones = 3;
// TIEMPO HACIA ATRÁS
const cant_t_min_atras = 300;
// ACTIVACION DE GUARDADO DEBUG DEL CÓDIGO EN DB
const debug_activo = 1;
const Job_activo = 0;


//**************************************************

Meteor.methods({

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
        console.log('  ********* INICIANDO EJECUCIÓN ********* ');
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
        console.log('    ********* FIN DE EJECUCIÓN ********* ');
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
            Jobs.private.collection.remove({});
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
        var moneda = Meteor.call("ConexionGet", monedas);
        var mons = (moneda.data);

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

    'SaldoActualMonedas':function(){

        if ( debug_activo === 1) {
            
            Meteor.call("GuardarLogEjecucionTrader", 'Verificando las monedas que tienen saldo para tradear');
            console.log('############################################');
            console.log(' ');
            console.log(' Verificando las monedas que tienen saldo');
            console.log(' ');
        };

        var v_blc_tradeo = Meteor.call("ConexionGet", blc_tradeo);
        var BlcMonedasTradeo=(v_blc_tradeo.data);
        var v_blc_cuenta = Meteor.call("ConexionGet", blc_cuenta);
        var BlcCuenta = (v_blc_cuenta.data);
        var c_vect_BlcTrad = 0
        var c_vect_BlcCuent = 0


        for (cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++) {

            for (cbct = 0, tam_bct = BlcCuenta.length; cbct < tam_bct; cbct++) {
                var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
                var moneda_analizarBT = v_BlcMonedasTradeo.currency;
                var sald_moneda_analizarBT = v_BlcMonedasTradeo.available;
                var v_BlcCuenta = BlcCuenta[cbct];
                var moneda_analizarCT = v_BlcCuenta.currency;
                var sald_moneda_analizarCT = v_BlcCuenta.available;

                if ( sald_moneda_analizarBT > 0 && sald_moneda_analizarCT > 0 && moneda_analizarCT === moneda_analizarBT) {
                    try{
                        var v_moneda_saldo = Monedas.find({ moneda : moneda_analizarCT }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
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
                        console.log(' ********* ', ' MONEDA: ', v_sald_moneda.moneda, ' ********* ');
                        console.log('    SALDO TRADEO: ', v_BlcMonedasTradeo.available);
                        console.log('    SALDO TRADEO RESERVA: ', v_BlcMonedasTradeo.reserved);
                        console.log('    SALDO EN CUENTA: ', v_BlcCuenta.available);
                        console.log('    SALDO CUENTA RESERVA: ', v_BlcCuenta.reserved);
                        console.log('############################################');
                        console.log(' ');
                    }

                }
                else if (sald_moneda_analizarBT > 0 && sald_moneda_analizarCT !== 0 && moneda_analizarCT === moneda_analizarBT) {
                    console.log('Estoy en el if 2 moneda', moneda_analizarCT);
                    try {
                        var v_moneda_saldo = Monedas.find({ moneda : moneda_analizarCT }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                    }
                    catch (error){
                        Meteor.call("ValidaError", error, 2)
                    };
                    var v_sald_moneda = [0];

                    Monedas.update({ _id : v_sald_moneda._id ,moneda : v_sald_moneda.moneda},{$set:{saldo : { tradeo : { activo: v_BlcMonedasTradeo.available, reserva: v_BlcMonedasTradeo.reserved },  cuenta : { activo : v_BlcCuenta.available, reserva: v_BlcCuenta.reserved } }}});

                    console.log('############################################');
                    console.log('            Saldo disponible');
                    console.log('############################################');
                    console.log(' ********* ', ' MONEDA: ',v_sald_moneda.moneda, ' ********* ');
                    console.log('    SALDO TRADEO: ',v_BlcMonedasTradeo.available);
                    console.log('    SALDO TRADEO RESERVA: ',v_BlcMonedasTradeo.reserved);
                    console.log('    SALDO EN CUENTA: ',v_BlcCuenta.available);
                    console.log('    SALDO CUENTA RESERVA: ',v_BlcCuenta.reserved);
                    console.log('############################################');
                    console.log(' ');
                }
                else if (sald_moneda_analizarBT !== 0 && sald_moneda_analizarCT > 0 && moneda_analizarCT === moneda_analizarBT) {
                    console.log('Estoy en el if 3 moneda', moneda_analizarCT);
                    try {
                        var v_moneda_saldo = Monedas.find({ moneda : moneda_analizarCT }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                        var v_sald_moneda = [0];
                    }
                    catch (error){
                            Meteor.call("ValidaError", error, 2)
                    };

                    Monedas.update({ _id : v_sald_moneda._id ,moneda : v_sald_moneda.moneda},{$set:{saldo : { tradeo : { activo: v_BlcMonedasTradeo.available, reserva: v_BlcMonedasTradeo.reserved },  cuenta : { activo : v_BlcCuenta.available, reserva: v_BlcCuenta.reserved } }}});

                    console.log('############################################');
                    console.log('            Saldo disponible');
                    console.log('############################################');
                    console.log(' ********* ', ' MONEDA: ',v_sald_moneda.moneda, ' ********* ');
                    console.log('    SALDO TRADEO: ',v_BlcMonedasTradeo.available);
                    console.log('    SALDO TRADEO RESERVA: ',v_BlcMonedasTradeo.reserved);
                    console.log('    SALDO EN CUENTA: ',v_BlcCuenta.available);
                    console.log('    SALDO CUENTA RESERVA: ',v_BlcCuenta.reserved);
                    console.log('############################################');
                    console.log(' ');
                }


            };


        };
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


            switch(VALOR){
                case 1:
                    // HACE UNA CONSULTA GENREAL DE LOS TIPO_CAMBIO EXISTENTES
                    console.log('############################################');

                    console.log(' Tipos de Cambio que se están tradeando en HITBTC');
                    console.log(' ');
                    console.log(' ********* ', mon_c.id, ' ********* ');
                    console.log('     MONEDA BASE: ', mon_c.baseCurrency);
                    console.log('     MONEDA DE COTIZACIÓN: ', mon_c.quoteCurrency);
                    console.log(' ');
                    break;
                case 2:
                    // ESTO ES PARA VERIFICAR LA TENDENCIA DE LOS TIPOS DE CAMBIO

                    if (TiposDeCambios.find({ tipo_cambio : mon_c.id }).count() !== 0) {
                        try{
                            TiposDeCambios.update({ tipo_cambio : mon_c.id },{$set:{ tipo_cambio : mon_c.id, moneda_base :  mon_c.baseCurrency, moneda_cotizacion : mon_c.quoteCurrency, activo : "S" }});
                        }
                        catch(error){
                            console.log('Error: los datos no pudieron ser actualizados');
                            Meteor.call('ValidaError', error, 1);
                        }
                    }
                    else {
                        TiposDeCambios.insert({tipo_cambio : mon_c.id, moneda_base :  mon_c.baseCurrency, moneda_cotizacion : mon_c.quoteCurrency, activo : "S" });
                        console.log('--------------------------------------------');
                        console.log(' ** Detectado nuevo Tipo de Cambio en HITBTC **');
                        console.log('--------------------------------------------');
                        console.log(' ');
                        console.log('    ********* ', mon_c.id, ' ********* ');
                        console.log('    MONEDA BASE: ', mon_c.baseCurrency);
                        console.log('    MONEDA DE COTIZACIÓN: ', mon_c.quoteCurrency);
                        console.log(' ');
                        console.log('         Datos Insertados');
                        console.log(' ');
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

    'TransferirfondosReservaTradeo':function(MONEDA){  //Transfer amount to trading

        console.log('############################################');
        console.log(' Realiza trasnferencia de fondos desde la reserva a tradeo y viseversa');
        console.log(' ');

        try{
            var NuevaCartera = Meteor.call("ConexionPost", transferencia);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };
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

        var url_orden = [ordenes];

        var orden = Meteor.call('ConexionPost', url_orden, datos);

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
            Meteor.call("GuardarLogEjecucionTrader", [' ConsultaTraderGuardados: Consultando el último ID de Transaccion guardado del tipo_cambio: ']+[TIPO_CAMBIO]);
        };

        if (OperacionesCompraVenta.find({ tipo_cambio:TIPO_CAMBIO }, {}).count() === 0){
            if ( debug_activo === 1) {
                Meteor.call("GuardarLogEjecucionTrader", ['No hay datos en base de datos local de este tipo_cambio: ']+[TIPO_CAMBIO]);
                console.log('No hay datos en base de datos local de este tipo_cambio: ', TIPO_CAMBIO);
            };
        }
        else {
            if ( debug_activo === 1) {
                Meteor.call("GuardarLogEjecucionTrader", ['Se encontraron datos guardados para este tipo_cambio: ']+[TIPO_CAMBIO]+[' Verificando...']);
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

    'TipoCambioDisponibleCompra':function(VALOR, TIPO_MUESTREO){

        try
            {
                var Monedas_Saldo = Monedas.find({ "saldo.cuenta.activo" : { $gt : 0 }},{} ).fetch();
            }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };
        

        for (CMS = 0, TMS = Monedas_Saldo.length; CMS < TMS; CMS++){
            var moneda_saldo =  Monedas_Saldo[CMS];


            if (TiposDeCambios.find().count() === 0){
                Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ningún tipo de Cambio Guardado en la Base de Datos Local, Solucionando ... ']);
                Monedas.remove({});
                Meteor.call("ListaMonedas");
                Meteor.call("ListaTiposDeCambios", 2);
                Meteor.call("SaldoActualMonedas");
                if (TiposDeCambios.find().count() !== 0){
                    Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: ¡ Listo ! ']);
                }
            };


            try
            {
                var monedasCambiables = TiposDeCambios.aggregate([{ $match: { tipo_cambio: { $regex: moneda_saldo.moneda }} },{$group: { _id: "$tipo_cambio" }}]);
            }
            catch (error){
                Meteor.call("ValidaError", error, 2);
            };

            //var TiposDeCambios = new Set()

            switch(VALOR){
                case 1:
                    // HACE UNA CONSULTA GENERAL DE LOS TIPO_CAMBIO EXISTENTES CON SALDO PARA INVERTIR
                    var set = new Set();
                    for(mc in monedasCambiables){
                        set.add(monedasCambiables[mc]._id);
                    }
                    return Array.from(set);
                    break;
                case 2:
                    for(mc in monedasCambiables){

                       Meteor.call('ListaTradeoActual', monedasCambiables[mc]._id, 2, TIPO_MUESTREO);

                       Meteor.call('EvaluarTendencias',monedasCambiables[mc]._id, TIPO_MUESTREO);

                    }
                    break;
            }
        };
    },

    'ListaTradeoActual':function(TIPO_CAMBIO, VALOR_EJEC, TIPO_MUESTREO){

        console.log('############################################');

        console.log(' ');

        //consultamos el último id_transaccion de este Símbolo
        if ( debug_activo === 1) {
            Meteor.call("GuardarLogEjecucionTrader", ['"ListaTradeoActual" consultando último id_transaccion del tipo_cambio: ']+[TIPO_CAMBIO]);
        };

        var Val_trad = (Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO));
        var Val_trad_tipo_cambio = (Val_trad);

        if ( debug_activo === 1) {
            Meteor.call("GuardarLogEjecucionTrader", [' ListaTradeoActual: Valor recupearado de la funcion "ConsultaTraderGuardados" : ']+[Val_trad_tipo_cambio]);
        };


        if ( Val_trad_tipo_cambio === undefined ){
            if ( debug_activo === 1) {
                console.log('Estoy en el if de Val_trad_tipo_cambio');
            };
            var url_tradeos_parcial= ['from=0&by=trade_id&sort=DESC&start_index=0&limit=']+[cant_traders]+['&format_numbers=number'];
        }
        else{
            if ( debug_activo === 1 ) {
                console.log('Estoy en el else de Val_trad_tipo_cambio');
            };
            Val_trad_tipo_cambio= Val_trad_tipo_cambio+1;
            console.log('valor de Val_trad_tipo_cambio: ', Val_trad_tipo_cambio);
            var url_tradeos_parcial= ['&sort=ASC&by=id&from=']+[Val_trad_tipo_cambio]+['&limit=1&format_numbers=number'];
        };

        var url_tradeos_completa = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeos_parcial];        
        var v_tradeos = Meteor.call("ConexionGet", url_tradeos_completa);
        var trad_mon = (v_tradeos.data);


        for (i = 0, tamanio_trad_mon = trad_mon.length; i < tamanio_trad_mon; i++) {

            var v_trad = trad_mon[i];
            var url_comision = [comisiones]+['/']+[TIPO_CAMBIO];

            
            var comision = Meteor.call("ConexionGet", url_comision);
            var v_comision = (comision.data);



            switch(VALOR_EJEC){
                case 1:
                    console.log(' Devuelve los datos Historicos de Tradeo de todas las criptocurrencias negociadas - Esto nos sirve para verificar los valores ascendente. (Order Book)');
                    console.log('############################################');
                    console.log('    Verificando Símbolo tradeo: ',TIPO_CAMBIO);
                    console.log('############################################');

                    if ( v_trad === undefined ) {
                        console.log('############################################');
                        console.log(' No hay Valores asociados a este Tipo de Cambio ',TIPO_CAMBIO);
                        console.log('############################################');

                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                    }
                    else {
                        console.log(' LINEA DE TIEMPO: ',v_trad.timestamp);
                        console.log(' ID: ',v_trad.id);
                        console.log(' PRECIO: ',v_trad.price);
                        console.log(' CANTIDAD: ',v_trad.quantity);

                        switch (v_trad.side){
                            case 'buy':
                                console.log(' TIPO OPERACIÓN: ','COMPRA');
                                break;
                            case 'sell':
                                console.log(' TIPO OPERACIÓN: ','VENTA');
                                break;
                            default:
                                console.log(' TIPO OPERACIÓN: ',v_trad.side);
                        }
                    }

                    console.log(' *******    VALORES DE COMISIONES    *******');

                    if ( v_comision === undefined ) {
                        console.log(' No hay Valores de comisión asociados a este Símbolo de tradeo');
                    }
                    else {
                        console.log(' TASA DE LIQUIDEZ: ', v_comision.takeLiquidityRate);
                        console.log(' PROPORCIÓN DE LIQUIDEZ: ', v_comision.provideLiquidityRate);
                    }

                    console.log('############################################');
                    console.log(' ');
                    break;
                case 2:
                    if ( v_trad === undefined ) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 1 ');
                        console.log('############################################');
                        console.log(' No hay Valores asociados a este Tipo de Cambio ',TIPO_CAMBIO);
                        console.log('############################################');

                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                    }
                    else {

                        if (OperacionesCompraVenta.find( {tipo_cambio : TIPO_CAMBIO} ).count() === 0){

                            if ( debug_activo === 1) {
                                Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 ');
                            }

                            var IdTransAnt = v_trad.id - cant_t_min_atras
                            var url_tradeosParcialAnt= ['&sort=ASC&by=id&from=']+[IdTransAnt]+['&limit=1&format_numbers=number'];
                            var url_tradeosCompletaTransAnt = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeosParcialAnt];
                            var v_TradAnt = Meteor.call("ConexionGet", url_tradeosCompletaTransAnt);
                            var TradAnt = (v_TradAnt.data);

                            var v_TradAntDat = TradAnt[0];
                            console.log('--------------------------------------------');
                            console.log(' TIPO_CAMBIO: ',TIPO_CAMBIO);
                            console.log('--------------------------------------------');
                            console.log(' ');
                            console.log('----------- TRANSACCION ANTERIOR -----------');
                            console.log(' ');
                            console.log(' LINEA DE TIEMPO: ',v_TradAntDat.timestamp);
                            console.log(' ID: ',v_TradAntDat.id);
                            console.log(' PRECIO: ',v_TradAntDat.price);

                            switch (v_TradAntDat.side){
                                case 'buy':
                                    console.log(' TIPO OPERACIÓN: ','COMPRA');
                                    var v_tipo_operacion_ant = 'COMPRA';
                                    break;
                                case 'sell':
                                    console.log(' TIPO OPERACIÓN: ','VENTA');
                                    var v_tipo_operacion_ant = 'VENTA';
                                    break;
                                default:
                                    Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                    console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_TradAntDat.side);
                            }
                            console.log(' ');
                            console.log('--------------------------------------------');
                            console.log(' ');
                            console.log('------------ ULTIMA TRANSACCION ------------');
                            console.log(' ');
                            console.log(' LINEA DE TIEMPO: ',v_trad.timestamp);
                            console.log(' ID: ',v_trad.id);
                            console.log(' PRECIO: ',v_trad.price);

                            switch (v_trad.side){
                                case 'buy':
                                    console.log(' TIPO OPERACIÓN: ','COMPRA');
                                    var v_tipo_operacion = 'COMPRA';
                                    break;
                                case 'sell':
                                    console.log(' TIPO OPERACIÓN: ','VENTA');
                                    var v_tipo_operacion = 'VENTA';
                                    break;
                                default:
                                    Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_trad.side]);
                                    console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_trad.side);
                            }

                            OperacionesCompraVenta.insert({ id_hitbtc: v_TradAntDat.id, fecha : v_TradAntDat.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_TradAntDat.price, tipo_operacion : v_tipo_operacion_ant, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                            OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                            
                            switch (TIPO_MUESTREO){
                                case 1:
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": v_TradAntDat.id, "periodo1.fecha": v_TradAntDat.timestamp,"periodo1.precio" : v_TradAntDat.price , "periodo1.tipo_operacion": v_tipo_operacion_ant }});
                                    break;
                                case 2:
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": v_TradAntDat.id, "periodo1.fecha": v_TradAntDat.timestamp,"periodo2.precio" : v_TradAntDat.price , "periodo1.tipo_operacion": v_tipo_operacion_ant }});
                                    break;
                                case 3:
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": v_TradAntDat.id, "periodo1.fecha": v_TradAntDat.timestamp,"periodo3.precio" : v_TradAntDat.price , "periodo1.tipo_operacion": v_tipo_operacion_ant }});
                                    break;
                                case 4:
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": v_TradAntDat.id, "periodo1.fecha": v_TradAntDat.timestamp,"periodo4.precio" : v_TradAntDat.price , "periodo1.tipo_operacion": v_tipo_operacion_ant }});
                                    break;
                                case 5:
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": v_TradAntDat.id, "periodo1.fecha": v_TradAntDat.timestamp,"periodo5.precio" : v_TradAntDat.price , "periodo1.tipo_operacion": v_tipo_operacion_ant }});
                                    break;
                                case 6:
                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": v_TradAntDat.id, "periodo1.fecha": v_TradAntDat.timestamp,"periodo6.precio" : v_TradAntDat.price , "periodo1.tipo_operacion": v_tipo_operacion_ant }});
                                    break;               
                            }
                        }
                        else {
                            if ( debug_activo === 1) {
                                Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 ');
                            }
                            // ESTA ES LA PARTE QUE HAY QUE ARREGLAR
                            
                            switch (TIPO_MUESTREO){
                                case 1:
                                    if ( TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "periodo1.id_hitbtc" :{ $exists : false }},{}).count() === 0 || TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "periodo1.precio" : null },{}).count() === 1 ){
                                        var ValUltIdTransaccion = Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO);

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 1 - if');
                                            Meteor.call("GuardarLogEjecucionTrader", [' Valor de ValUltIdTransaccion: ']+[ValUltIdTransaccion]);
                                        }

                                        try{
                                            var TradAnt = OperacionesCompraVenta.findOne({ id_hitbtc : ValUltIdTransaccion });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        var PeriodoFecha = TradAnt.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.precio;
                                        var PeriodoTipoOperacion = TradAnt.tipo_operacion;

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]);

                                        TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": PeriodoOd_hitbtc, "periodo1.fecha": PeriodoFecha,"periodo1.precio" : PeriodoPrecio, "periodo1.tipo_operacion": PeriodoTipoOperacion }});
                                    }
                                    else{
                                        try{
                                            var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 1 - else');
                                        }

                                        var PeriodoFecha = TradAnt.periodo1.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.periodo1.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.periodo1.precio;
                                        
                                        switch (v_trad.side){
                                            case 'buy':
                                                var v_tipo_operacion = 'COMPRA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            case 'sell':
                                                var v_tipo_operacion = 'VENTA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            default:
                                                Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_trad.side]);
                                                console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_trad.side);
                                        }
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 
                                    }

                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "periodo1.id_hitbtc": PeriodoOd_hitbtc, "periodo1.fecha": PeriodoFecha,"periodo1.precio" : PeriodoPrecio, "periodo1.tipo_operacion": PeriodoTipoOperacion }});
                                    //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : PeriodoTipoOperacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    break;
                                case 2:
                                    
                                    if ( TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo2.id_hitbtc" :{ $exists : false }},{}).count() === 0 || TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo2.precio" : null },{}).count() === 1 ){
                                        var ValUltIdTransaccion = Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO);

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 2 - if');
                                            Meteor.call("GuardarLogEjecucionTrader", [' Valor de ValUltIdTransaccion: ']+[ValUltIdTransaccion]);
                                        }

                                        try{
                                            var TradAnt = OperacionesCompraVenta.findOne({ id_hitbtc : ValUltIdTransaccion });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        var PeriodoFecha = TradAnt.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.precio;
                                        var PeriodoTipoOperacion = TradAnt.tipo_operacion;

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]);

                                        TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo2.id_hitbtc": PeriodoOd_hitbtc, "Periodo2.fecha": PeriodoFecha,"Periodo2.precio" : PeriodoPrecio, "Periodo2.tipo_operacion": PeriodoTipoOperacion }}); 
                                    }
                                    else{
                                        try{
                                            var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 2 - else');
                                        }

                                        var PeriodoFecha = TradAnt.Periodo2.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.Periodo2.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.Periodo2.precio;
                                        
                                        switch (v_trad.side){
                                            case 'buy':
                                                var v_tipo_operacion = 'COMPRA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            case 'sell':
                                                var v_tipo_operacion = 'VENTA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            default:
                                                Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_trad.side]);
                                                console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_trad.side);
                                        }

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 
                                    }

                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo2.id_hitbtc": PeriodoOd_hitbtc, "Periodo2.fecha": PeriodoFecha,"Periodo2.precio" : PeriodoPrecio, "Periodo2.tipo_operacion": PeriodoTipoOperacion }});
                                    //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    break;
                                case 3:
                                    if ( TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo3.id_hitbtc" :{ $exists : false }},{}).count() === 0 || TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo3.precio" : null },{}).count() === 1 ){
                                        var ValUltIdTransaccion = Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO);

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 3 - if');
                                            Meteor.call("GuardarLogEjecucionTrader", [' Valor de ValUltIdTransaccion: ']+[ValUltIdTransaccion]);
                                        }

                                        try{
                                            var TradAnt = OperacionesCompraVenta.findOne({ id_hitbtc : ValUltIdTransaccion });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        var PeriodoFecha = TradAnt.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.precio;
                                        var PeriodoTipoOperacion = TradAnt.tipo_operacion;

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]);

                                        TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo3.id_hitbtc": PeriodoOd_hitbtc, "Periodo3.fecha": PeriodoFecha,"Periodo3.precio" : PeriodoPrecio, "Periodo3.tipo_operacion": PeriodoTipoOperacion }});
                                    }
                                    else{
                                        try{
                                            var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 3 - else');
                                        }

                                        var PeriodoFecha = TradAnt.Periodo3.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.Periodo3.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.Periodo3.precio;
                                        
                                        switch (v_trad.side){
                                            case 'buy':
                                                var v_tipo_operacion = 'COMPRA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            case 'sell':
                                                var v_tipo_operacion = 'VENTA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            default:
                                                Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_trad.side]);
                                                console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_trad.side);
                                        }

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 

                                    }

                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo3.id_hitbtc": PeriodoOd_hitbtc, "Periodo3.fecha": PeriodoFecha,"Periodo3.precio" : PeriodoPrecio, "Periodo3.tipo_operacion": PeriodoTipoOperacion }});
                                    //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    break;
                                case 4:
                                    if ( TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo4.id_hitbtc" :{ $exists : false }},{}).count() === 0 || TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo4.precio" : null },{}).count() === 1 ){
                                        var ValUltIdTransaccion = Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO);

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 4 - if');
                                            Meteor.call("GuardarLogEjecucionTrader", [' Valor de ValUltIdTransaccion: ']+[ValUltIdTransaccion]);
                                        }

                                        try{
                                            var TradAnt = OperacionesCompraVenta.findOne({ id_hitbtc : ValUltIdTransaccion });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        var PeriodoFecha = TradAnt.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.precio;
                                        var PeriodoTipoOperacion = TradAnt.tipo_operacion;

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 

                                        TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo4.id_hitbtc": PeriodoOd_hitbtc, "Periodo4.fecha": PeriodoFecha,"Periodo4.precio" : PeriodoPrecio, "Periodo4.tipo_operacion": PeriodoTipoOperacion }});
                                        //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    }
                                    else{
                                        try{
                                            var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 4 - else');
                                        }

                                        var PeriodoFecha = TradAnt.Periodo4.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.Periodo4.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.Periodo4.precio;
                                        
                                        switch (v_trad.side){
                                            case 'buy':
                                                var v_tipo_operacion = 'COMPRA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            case 'sell':
                                                var v_tipo_operacion = 'VENTA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            default:
                                                Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_trad.side]);
                                                console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_trad.side);
                                        }

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 
                                    }

                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo4.id_hitbtc": PeriodoOd_hitbtc, "Periodo4.fecha": PeriodoFecha,"Periodo4.precio" : PeriodoPrecio, "Periodo4.tipo_operacion": PeriodoTipoOperacion }});
                                    //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    break;
                                case 5:
                                    if ( TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo5.id_hitbtc" :{ $exists : false }},{}).count() === 0 || TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo5.precio" : null },{}).count() === 1 ){
                                        var ValUltIdTransaccion = Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO);

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 5 - if');
                                            Meteor.call("GuardarLogEjecucionTrader", [' Valor de ValUltIdTransaccion: ']+[ValUltIdTransaccion]);
                                        }

                                        try{
                                            var TradAnt = OperacionesCompraVenta.findOne({ id_hitbtc : ValUltIdTransaccion });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        var PeriodoFecha = TradAnt.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.precio;
                                        var PeriodoTipoOperacion = TradAnt.tipo_operacion;

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 

                                        TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo5.id_hitbtc": PeriodoOd_hitbtc, "Periodo5.fecha": PeriodoFecha,"Periodo5.precio" : PeriodoPrecio, "Periodo5.tipo_operacion": PeriodoTipoOperacion }});
                                        //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    }
                                    else{
                                        try{
                                            var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 5 - else');
                                        }

                                        var PeriodoFecha = TradAnt.Periodo5.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.Periodo5.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.Periodo5.precio;
                                        
                                        switch (v_trad.side){
                                            case 'buy':
                                                var v_tipo_operacion = 'COMPRA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            case 'sell':
                                                var v_tipo_operacion = 'VENTA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            default:
                                                Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_trad.side]);
                                                console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_trad.side);
                                        }

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 
                                    }

                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo5.id_hitbtc": PeriodoOd_hitbtc, "Periodo5.fecha": PeriodoFecha,"Periodo5.precio" : PeriodoPrecio, "Periodo5.tipo_operacion": PeriodoTipoOperacion }});
                                    //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    break;
                                case 6:
                                    if ( TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo6.id_hitbtc" :{ $exists : false }},{}).count() === 0 || TiposDeCambios.find({ tipo_cambio : TIPO_CAMBIO, "Periodo6.precio" : null },{}).count() === 1 ){
                                        var ValUltIdTransaccion = Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO);

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 6 - if');
                                            Meteor.call("GuardarLogEjecucionTrader", [' Valor de ValUltIdTransaccion: ']+[ValUltIdTransaccion]);
                                        }

                                        try{
                                            var TradAnt = OperacionesCompraVenta.findOne({ id_hitbtc : ValUltIdTransaccion });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        var PeriodoFecha = TradAnt.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.precio;
                                        var PeriodoTipoOperacion = TradAnt.tipo_operacion;

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]);

                                        TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo6.id_hitbtc": PeriodoOd_hitbtc, "Periodo6.fecha": PeriodoFecha,"Periodo6.precio" : PeriodoPrecio, "Periodo6.tipo_operacion": PeriodoTipoOperacion }});
                                    }
                                    else{
                                        try{
                                            var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO });
                                        }
                                        catch (error){
                                            Meteor.call("ValidaError", error, 2);
                                        };

                                        if ( debug_activo === 1) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 3 switch - case 6 - else');
                                        }

                                        var PeriodoFecha = TradAnt.Periodo6.fecha;
                                        var PeriodoOd_hitbtc = TradAnt.Periodo6.id_hitbtc;
                                        var PeriodoPrecio = TradAnt.Periodo6.precio;
                                        
                                        switch (v_trad.side){
                                            case 'buy':
                                                var v_tipo_operacion = 'COMPRA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            case 'sell':
                                                var v_tipo_operacion = 'VENTA';
                                                var PeriodoTipoOperacion = v_tipo_operacion;
                                                break;
                                            default:
                                                Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_trad.side]);
                                                console.log(' NUEVO TIPO OPERACIÓN DETECTADO: ',v_trad.side);
                                        }

                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoFecha: ']+[PeriodoFecha]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoOd_hitbtc: ']+[PeriodoOd_hitbtc]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoPrecio: ']+[PeriodoPrecio]);
                                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de PeriodoTipoOperacion: ']+[PeriodoTipoOperacion]); 
                                    }

                                    TiposDeCambios.update({ tipo_cambio : TIPO_CAMBIO },{$set:{ "Periodo6.id_hitbtc": PeriodoOd_hitbtc, "Periodo6.fecha": PeriodoFecha,"Periodo6.precio" : PeriodoPrecio, "Periodo6.tipo_operacion": PeriodoTipoOperacion }});
                                    //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                                    break;               
                            }
                            

                            
                            //OperacionesCompraVenta.insert({ id_hitbtc: v_trad.id, fecha : v_trad.timestamp, tipo_cambio : TIPO_CAMBIO, precio : v_trad.price, tipo_operacion : v_tipo_operacion, tasa_liquidez : v_comision.takeLiquidityRate, proporcion_liquidez : v_comision.provideLiquidityRate, muestreo : { periodo1 : false, periodo2 : false, periodo3 : false, periodo4 : false, periodo5 : false, periodo6 : false } });
                            
                            console.log('--------------------------------------------');
                            console.log(' TIPO_CAMBIO: ',TIPO_CAMBIO);
                            console.log('--------------------------------------------');
                            console.log(' ');
                            console.log('----------- TRANSACCION ANTERIOR -----------');
                            console.log(' ');
                            console.log(' LINEA DE TIEMPO: ', PeriodoFecha);
                            console.log(' ID: ',PeriodoOd_hitbtc);
                            console.log(' PRECIO: ',PeriodoPrecio);
                            console.log(' TIPO OPERACIÓN: ',PeriodoTipoOperacion);
                            console.log('--------------------------------------------');
                            console.log(' ');
                            console.log('------------ ULTIMA TRANSACCION ------------');
                            console.log(' ');
                            console.log(' LINEA DE TIEMPO: ',v_trad.timestamp);
                            console.log(' ID: ',v_trad.id);
                            console.log(' PRECIO: ',PeriodoPrecio);
                            console.log(' TIPO OPERACIÓN: ',PeriodoTipoOperacion);
                        }
                    }
                    console.log('############################################');
                    console.log(' ');
                    break;
                default:
                    console.log(' Valor de tipo consulta no definida ');
            }


        };

    },

    'EvaluarTendencias':function(TIPOCAMBIO, TIPO_MUESTREO){


        // Formula de deprecación
        // TENDENCIA = ((valor actual - valor anterior) / valor anterior) * 100
        // Si es positivo la moneda base se está depreciando y la moneda en cotizacion se está apreciando
        // Si es negativa la moneda base de está apreciando y la moneda en cotizacion se está apreciando
        // Cuando se está evaluando la moneda a comprar si el resultado es + esa moneda esta en alza sino está a la baja
        // Cuando se está evaluando la moneda invertida si el resultado es + esa moneda esta en baja sino está a la alza
        if ( debug_activo === 1) {
            Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 5 ');
        }

        try{
            
            switch (TIPO_MUESTREO){
                case 1:
                    if ( debug_activo === 1) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 5 - switch Inicial - Case 1');
                    }
                    try{
                        var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
                    }
                    catch (error){    
                        Meteor.call("ValidaError", error, 2);
                    };                           
                    
                    try{
                        var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    }
                    catch (error){    
                        Meteor.call("ValidaError", error, 2);
                    };
                    var RegAnt = TradAnt
                    var RegAct = TransProcesar[0]
                    Meteor.call("GuardarLogEjecucionTrader", [' ListaTradeoActual: Valor de RegAnt: ']+[RegAnt.periodo1.precio]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ListaTradeoActual: Valor de RegAct: ']+[RegAct.precio]);
                    break;
                case 2:
                    if ( debug_activo === 1) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 5 - switch Inicial - Case 2');
                    }
                    try{
                        var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
                    }
                    catch (error){    
                        Meteor.call("ValidaError", error, 2);
                    };                   

                    var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO, "muestreo.periodo2" : false }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    var RegAnt = TradAnt
                    var RegAct = TransProcesar[0]
                    break;
                case 3:
                    if ( debug_activo === 1) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 5 - switch Inicial - Case 3');
                    }
                    try{
                        var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
                    }
                    catch (error){    
                        Meteor.call("ValidaError", error, 2);
                    };

                    var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO, "muestreo.periodo3" : false }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    var RegAnt = TradAnt
                    var RegAct = TransProcesar[1]
                    break;
                case 4:
                    if ( debug_activo === 1) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 5 - switch Inicial - Case 4');
                    }
                    try{
                        var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
                    }
                    catch (error){    
                        Meteor.call("ValidaError", error, 2);
                    };                    
                    
                    var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO, "muestreo.periodo4" : false }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    var RegAnt = TradAnt
                    var RegAct = TransProcesar[1]
                    break;
                case 5:                
                    if ( debug_activo === 1) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 5 - switch Inicial - Case 5');
                    }
                    try{
                        var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
                    }
                    catch (error){    
                        Meteor.call("ValidaError", error, 2);
                    };                    
                    
                    var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO, "muestreo.periodo5" : false }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    var RegAnt = TradAnt
                    var RegAct = TransProcesar[1]
                    break;
                case 6:
                    if ( debug_activo === 1) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 5 - switch Inicial - Case 6');
                    }
                    try{
                        var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
                    }
                    catch (error){    
                        Meteor.call("ValidaError", error, 2);
                    };                    
                    
                    var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO, "muestreo.periodo6" : false }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    var RegAnt = TradAnt
                    var RegAct = TransProcesar[1]
                    break;
            }
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };

        var ValPrecAnt = RegAnt.periodo1.precio
        var ValPrecAct = RegAct.precio

        console.log("Valor de ValPrecAnt", ValPrecAnt);
        console.log("Valor de ValPrecAct", ValPrecAct);

        ProcenApDp = (((ValPrecAct - ValPrecAnt ) / ValPrecAnt ) * 100 ) ;

        console.log("Valor de ProcenApDp", ProcenApDp);
        
        switch (TIPO_MUESTREO){
            case 1:
                TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo1.tendencia" : ProcenApDp, activo : "S" }}, {"multi" : true,"upsert" : true});
                OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                break;
            case 2:
                TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo2.tendencia" : ProcenApDp, activo : "S" }}, {"multi" : true,"upsert" : true});
                OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo2" : false },{$set:{ "muestreo.periodo2" : true }}, {"multi" : true,"upsert" : true});
                break;
            case 3:
                TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo3.tendencia" : ProcenApDp, activo : "S" }}, {"multi" : true,"upsert" : true});
                OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo3" : false },{$set:{ "muestreo.periodo3" : true }}, {"multi" : true,"upsert" : true});
                break;
            case 4:
                TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo4.tendencia" : ProcenApDp, activo : "S" }}, {"multi" : true,"upsert" : true});
                OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo4" : false },{$set:{ "muestreo.periodo4" : true }}, {"multi" : true,"upsert" : true});
                 break;
            case 5:
                TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo5.tendencia" : ProcenApDp, activo : "S" }}, {"multi" : true,"upsert" : true});
                OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo5" : false },{$set:{ "muestreo.periodo5" : true }}, {"multi" : true,"upsert" : true});
                break;
            case 6:
                TiposDeCambios.update({ tipo_cambio : TIPOCAMBIO },{$set:{ "periodo6.tendencia" : ProcenApDp, activo : "S" }}, {"multi" : true,"upsert" : true});
                OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo6" : false },{$set:{ "muestreo.periodo6" : true }}, {"multi" : true,"upsert" : true});
                break;               
        }
    },

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

    'Prueba':function(){
        
            /*Jobs.run("ConsultarTransaccionTrad", "XMRBTC", { 
                in: {
                    second: 15
                }
            })

            Jobs.run("ConsultarTransaccionTrad", "XMRUSD", { 
                in: {
                    second: 5
                }
            })

            Jobs.run("ConsultarTransaccionTrad", "XMRETH", { 
                in: {
                    second: 10
                }
            })*/
    },

    'EjecucionGlobal':function(){

        Meteor.call("Encabezado");
        Meteor.call("ListaMonedas");
        Meteor.call("ListaTiposDeCambios", 2);
        Meteor.call("SaldoActualMonedas");
        Ejecucion_Trader.update({ "muestreo.periodo_inicial" : true },{$set :{ "muestreo.periodo_inicial" : false , fecha_ejecucion : new Date() }});
        Meteor.call("FinEjecucion");
        
        return 0;

        //Meteor.call("TipoCambioDisponibleCompra");
        
        //Meteor.call("Prueba");

        //Meteor.call("ListaTradeoActual",VALOR);
        //Meteor.call("ConsultaOrdenesAbiertas");
        //Meteor.call("ListaTradeoActual","BTCUSD");
        //Meteor.call("EvaluarTendencias");
        //Meteor.call("LibroDeOrdenes");
        //Meteor.call("CrearNuevaOrder");
        //Meteor.call("borrarOrden");
    }

});

Meteor.startup(() => {
    // code to run on server at startup
    // Verificamos si la aplicación es su ejecución Inicial o no
    
    try {
        var EjecucionInicial = Ejecucion_Trader.find({ muestreo : { periodo_inicial : true } },{}).count()
    }
    catch (error){
        Meteor.call("ValidaError", error, 2);
    };

   
    
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
                second: 15
                }
        });
    };
    
   //Meteor.call("EjecucionGlobal");
   //Meteor.call("TipoCambioDisponibleCompra", 2, 1);
    
});