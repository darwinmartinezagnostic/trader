import { Meteor } from 'meteor/meteor';
//import '../lib/librerias/Concurrent.Thread.js';
//var moment = require('moment-timezone');
moment().tz('America/Caracas').format();


const autoriza_conexion = Conexion_api.findOne({ casa_cambio : 'hitbtc'}, {_id:0});
const API_HITBTC2 = autoriza_conexion.api.url;

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

    'ListaMonedas':function(){

        console.log('############################################');
        try{
            var moneda = Meteor.call("ConexionGet", monedas);
            var mons = (moneda.data);
        }
        catch(error){
            Meteor.call("GuardarLogEjecucionTrader", ' Error: No se puedo consultar el api de hitbtc');
            Meteor.call('RecuperacionAutonoma');
            Meteor.call('ValidaError', error, 1);
        }

        for ( a = 0, len = mons.length ; a < len; a++) {
            var mon = mons[a];

            if (Monedas.find({ moneda : mon.id }).count() !== 0) {
                try{
                    Monedas.update({ moneda : mon.id },{$set:{ nombre_moneda : mon.fullName, activo : "S" }}, {"multi" : true,"upsert" : true});
                }
                catch(error){
                    Meteor.call("GuardarLogEjecucionTrader", ' Error: los datos no pudieron ser actualizados');
                    Meteor.call('ValidaError', error, 1);
                }
            }
            else {
                Monedas.insert({ moneda : mon.id, nombre_moneda : mon.fullName, activo : "S", min_transferencia : 0.0000000001 });
                console.log('--------------------------------------------');
                Meteor.call("GuardarLogEjecucionTrader", ' **** Detectada Nueva Moneda en HITBTC ****');
                console.log('--------------------------------------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", ['    NOMENCLATURA: ']+[mon.id]);
                Meteor.call("GuardarLogEjecucionTrader", ['    NOMBRE DE MONEDA: ']+[mon.fullName]);
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", ['           Datos Insertados']);
                console.log(' ');
            }
        };


        console.log('############################################');
    },

    'ActualizaSaldoTodasMonedas':function(VALOR_EJEC){

        var fecha = new Date();

        var v_blc_tradeo = Meteor.call("ConexionGet", blc_tradeo);
        var BlcMonedasTradeo=(v_blc_tradeo.data);
        var v_blc_cuenta = Meteor.call("ConexionGet", blc_cuenta);
        var BlcCuenta = (v_blc_cuenta.data);        
        var c_vect_BlcCuent = 0
        var c_vect_BlcTrad = 0


        var robot = Parametros.findOne({ dominio : "robot", nombre : "test" }, {_id : 0, valor : 0, estado: 1 });
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '           VERIFICANDO SALDOS');
        console.log('############################################');
        console.log('--------------------------------------------');

        switch(VALOR_EJEC){
            case 1:
                var MonedasSaldoActual = Monedas.find( { $or : [{"saldo.tradeo.activo" : { $gt : 0 }},{ "saldo.cuenta.activo" : { $gt : 0 } }]}).fetch()

                //console.log("Valor de MonedasSaldoActual", MonedasSaldoActual);


                for ( cmsa = 0, tmsa = MonedasSaldoActual.length; cmsa < tmsa; cmsa++ ) {
                    var v_BMonedasSaldoActual = MonedasSaldoActual[cmsa];
                    console.log('############################################');
                    Meteor.call("GuardarLogEjecucionTrader", '            Saldo disponible');
                    console.log('############################################');
                    Meteor.call("GuardarLogEjecucionTrader", ['  ********* ']+[' MONEDA: ']+[v_BMonedasSaldoActual.moneda]+[' ********* ']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO: ']+[v_BMonedasSaldoActual.saldo.tradeo.activo]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.tradeo.equivalencia]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO EN CUENTA: ']+[v_BMonedasSaldoActual.saldo.cuenta.activo]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.cuenta.equivalencia]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
                    console.log('############################################');
                    console.log(' ');
                }
            break;
            case 2:

                for ( cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++ ) {

                    var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
                    var MonedaSaldoTradear = v_BlcMonedasTradeo.currency;
                    var SaldoMonedaInvertidoTradear = Number(v_BlcMonedasTradeo.available);

                    try{
                        var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoTradear }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                    }
                    catch (error){
                        Meteor.call("ValidaError", error, 2)
                    };

                    var v_sald_moneda = v_moneda_saldo[0];

                    if ( v_sald_moneda !== undefined ){
                        Monedas.update({
                                        _id: v_sald_moneda._id,
                                            moneda: v_sald_moneda.moneda
                                        }, {
                                        $set: { "saldo.tradeo.activo": Number(v_BlcMonedasTradeo.available),
                                                "saldo.tradeo.reserva": Number(v_BlcMonedasTradeo.reserved)
                                    }
                        }, {"multi" : true,"upsert" : true});
                    }
                }

                for ( cbct = 0, tam_bct = BlcCuenta.length; cbct < tam_bct; cbct++ ) {
                    var v_BlcCuenta = BlcCuenta[cbct];
                    var MonedaSaldoCuenta = v_BlcCuenta.currency;
                    var SaldoMonedaGuardadoEnMonederoCuenta = Number(v_BlcCuenta.available);
                    try{
                    var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                    }
                    catch (error){
                        Meteor.call("ValidaError", error, 2)
                    };

                    var v_sald_moneda = v_moneda_saldo[0];

                    if ( v_sald_moneda !== undefined ){
                        Monedas.update({
                                _id: v_sald_moneda._id,
                                    moneda: v_sald_moneda.moneda
                                }, {
                                    $set: { "saldo.cuenta.activo": Number(v_BlcCuenta.available),
                                            "saldo.cuenta.reserva": Number(v_BlcCuenta.reserved)
                                    }
                                }, {"multi" : true,"upsert" : true});
                    }                    
                }
            break;
        }
    },

    'ValidaSaldoEquivalenteActual':function(){
        var fecha = new Date();
        var MonedasSaldoVerificar = Monedas.find( { $or : [{"saldo.tradeo.activo" : { $gt : 0 }},{ "saldo.cuenta.activo" : { $gt : 0 } }]}).fetch();
        //console.log("Valor de MonedasSaldoVerificar", MonedasSaldoVerificar);

        for ( CMONEDAS = 0, T_CMONEDAS = MonedasSaldoVerificar.length; CMONEDAS < T_CMONEDAS; CMONEDAS++ ) {

            V_MonedasSaldoVerificar = MonedasSaldoVerificar[CMONEDAS];
            //console.log("Valor de V_MonedasSaldoVerificar", V_MonedasSaldoVerificar);
            Id = V_MonedasSaldoVerificar._id;
            MonedaSaldo = V_MonedasSaldoVerificar.moneda;
            SaldoTradeoActivo = parseFloat(V_MonedasSaldoVerificar.saldo.tradeo.activo);
            SaldoCuentaActivo = parseFloat(V_MonedasSaldoVerificar.saldo.cuenta.activo);

            if ( SaldoTradeoActivo !== undefined ) {
                var EquivalenciaSaldoTradeo = Meteor.call('EquivalenteDolar', MonedaSaldo, SaldoTradeoActivo, 2 );
                //console.log("Valor de EquivalenciaSaldoTradeo", EquivalenciaSaldoTradeo);
                Monedas.update({
                                _id: Id,
                                moneda: MonedaSaldo
                                }, {
                                    $set: {                                             
                                            "saldo.tradeo.fecha": fecha, 
                                            "saldo.tradeo.equivalencia": Number(EquivalenciaSaldoTradeo),
                                        }
                                }, {"multi" : true,"upsert" : true});
            }

            if ( SaldoCuentaActivo !== undefined ) {
                var EquivalenciaSaldoCuenta = Meteor.call('EquivalenteDolar', MonedaSaldo, SaldoCuentaActivo, 2 );
                //console.log("Valor de EquivalenciaSaldoCuenta", EquivalenciaSaldoCuenta);
                Monedas.update({
                                _id: Id,
                                moneda: MonedaSaldo
                                }, {
                                    $set: { 
                                            "saldo.cuenta.fecha": fecha,
                                            "saldo.cuenta.equivalencia": Number(EquivalenciaSaldoCuenta),
                                        }
                                }, {"multi" : true,"upsert" : true});
            }
        }

        console.log('############################################');
    },

    'ActualizaSaldoActual':function(MONEDA){

        var v_blc_tradeo = Meteor.call("ConexionGet", blc_tradeo);
        var BlcMonedasTradeo=(v_blc_tradeo.data);
        var v_blc_cuenta = Meteor.call("ConexionGet", blc_cuenta);
        var BlcCuenta = (v_blc_cuenta.data);        
        var c_vect_BlcCuent = 0;
        var c_vect_BlcTrad = 0;


        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['      VERIFICANDO SALDO MONEDA: ']+[MONEDA] );
        console.log('############################################');
        console.log('--------------------------------------------');
        for ( cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++ ) {

            var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
            var MonedaSaldoTradear = v_BlcMonedasTradeo.currency;
            if ( MonedaSaldoTradear == MONEDA ) {
                var SaldoMonedaInvertidoTradear = Number(v_BlcMonedasTradeo.available);

                try{
                    var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoTradear }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2)
                };

                var v_sald_moneda = v_moneda_saldo[0];

                    if ( v_sald_moneda !== undefined ){
                        Monedas.update({
                                        _id: v_sald_moneda._id,
                                            moneda: v_sald_moneda.moneda
                                        }, {
                                            $set: { "saldo.tradeo.activo": Number(v_BlcMonedasTradeo.available),
                                                    "saldo.tradeo.reserva": Number(v_BlcMonedasTradeo.reserved)
                                        }
                        }, {"multi" : true,"upsert" : true});
                    }
            }
        }
        
        for ( cbct = 0, tam_bct = BlcCuenta.length; cbct < tam_bct; cbct++ ) {
            var v_BlcCuenta = BlcCuenta[cbct];
            var MonedaSaldoCuenta = v_BlcCuenta.currency;
            if ( MonedaSaldoCuenta == MONEDA ) {
                console.log("Valor de MonedaSaldoCuenta", MonedaSaldoCuenta)
                var SaldoMonedaGuardadoEnMonederoCuenta = Number(v_BlcCuenta.available);

                try{
                    var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2)
                };

                var v_sald_moneda = v_moneda_saldo[0];
                console.log("Valor de v_sald_moneda", v_sald_moneda);
                console.log( "Valor de v_sald_moneda.moneda", v_sald_moneda.moneda);

                    if ( v_sald_moneda !== undefined ){
                        Monedas.update({
                                        _id: v_sald_moneda._id,
                                            moneda: v_sald_moneda.moneda
                                        }, {
                                            $set: { "saldo.cuenta.activo": Number(v_BlcCuenta.available),
                                                    "saldo.cuenta.reserva": Number(v_BlcCuenta.reserved)
                                            }
                        }, {"multi" : true,"upsert" : true});
                    }
            }
        }

        var MonedasSaldoActual = Monedas.find( { moneda : MONEDA }).fetch();


        for ( cmsa = 0, tmsa = MonedasSaldoActual.length; cmsa < tmsa; cmsa++ ) {
            var v_BMonedasSaldoActual = MonedasSaldoActual[cmsa];
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Saldo disponible');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['  ********* ']+[' MONEDA: ']+[v_BMonedasSaldoActual.moneda]+[' ********* ']);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO: ']+[v_BMonedasSaldoActual.saldo.tradeo.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.tradeo.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO EN CUENTA: ']+[v_BMonedasSaldoActual.saldo.cuenta.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.cuenta.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            console.log('############################################');
            console.log(' ');
        }
    },

    'VerificarTransferencias':function(TRANSACCION){
        
        var Url_transaccion = transacciones+"/"+TRANSACCION
        var EstadoTransaccion = Meteor.call("ConexionGet", Url_transaccion);

        var fecha = moment (new Date());

        if ( EstadoTransaccion.statusCode === 200 ) {
            var V_EstadoTransaccion = EstadoTransaccion.data;
            var FECHA = fecha._d
            var IdTransferencia = V_EstadoTransaccion.id;
            var Indice = V_EstadoTransaccion.index;
            var TipoTransferencia = V_EstadoTransaccion.type;
            var Estado = V_EstadoTransaccion.status;
            var MONEDA = V_EstadoTransaccion.currency;
            var MONTO = V_EstadoTransaccion.amount;
            var fechaCreacionSol = V_EstadoTransaccion.createdAt;
            var fechaProcesamientoSol = V_EstadoTransaccion.updatedAt;


            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    ID: ']+[IdTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            switch (Estado){
                case "success":
                    var STATUS = "EXITOSO"
                break;
                case "pending":
                    var STATUS = "PENDIENTE"
                break;
                case "failed":
                    var STATUS = "FALLIDO"
                break;
            }
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+[STATUS]);
            console.log('############################################');
            console.log(' ');


            var TransExist = HistoralTransferencias.find( { id : IdTransferencia }).fetch().length

            if ( TransExist > 0 ) {
                HistoralTransferencias.update({ id : IdTransferencia }, {$set: { estado: STATUS }}, {"multi" : true,"upsert" : true});
            }else{
                HistoralTransferencias.insert({ fecha : FECHA, id : IdTransferencia, indice : Indice, tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : STATUS, fecha_creacion_solicitud : fechaCreacionSol, fecha_ejecucion_solicitud : fechaProcesamientoSol })
            };


        }else{
            Meteor.call('ValidaError', EstadoTransaccion.statusCode, 1);
        }



        //v_EstadoTransaccion = EstadoTransaccion[0].status;



        return STATUS;
    },

    'ValidaMonedasTransfCuentaTRadeo':function(){
        var CantMonedasSaldoATransferir = Monedas.find( { "saldo.cuenta.activo" : { $gt : 0 } }).fetch().length
        var MonedasSaldoATransferir = Monedas.find( { "saldo.cuenta.activo" : { $gt : 0 } }).fetch()
        var ContAtCar = 0

        if ( CantMonedasSaldoATransferir > 0 ) {
            Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el if MonedasSaldoATransferir');
            for ( cmsat = 0, tmsat = CantMonedasSaldoATransferir; cmsat < tmsat; cmsat++ ) {
                //console.log("Estoy en el for");
                var v_MonedasSaldoATransferir = MonedasSaldoATransferir[cmsat];
                var MonedaRev = v_MonedasSaldoATransferir.moneda
                var SaldoActTransf = v_MonedasSaldoATransferir.saldo.cuenta.activo
                var SaldoAntTransf = SaldoActTransf
                var ValMinTranf = v_MonedasSaldoATransferir.min_transferencia

                if ( SaldoActTransf >= ValMinTranf ) {
                    //console.log("Estoy en el if ( SaldoActTransf >= ValMinTranf )");
                    var Repeticiones = 1
                    do {
                        //console.log("Estoy en el while( SaldoAntTransf === SaldoActTransf )");
                        //console.log("Moneda:", MonedaRev)
                        //console.log("Datos a enviar, MonedaRev:", MonedaRev ,"SaldoActTransf", SaldoActTransf, 'bankToExchange');
                        var EstadoTransferencia = Meteor.call( 'Transferirfondos', MonedaRev, SaldoActTransf, 'bankToExchange');
                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de EstadoTransferencia']+[EstadoTransferencia]);
                        if ( EstadoTransferencia[0] === 0 && EstadoTransferencia[2] === "PENDIENTE" ) {

                            while( VEstatus === "PENDIENTE" ){
                                var IdTransVer = EstadoTransferencia[1];
                                var VEstatus = Meteor.call( 'VerificarTransferencias', IdTransVer);
                                Meteor.call('sleep',5000);
                            };

                            Meteor.call( 'ActualizaSaldoActual', MonedaRev);
                            break;

                        }else if ( EstadoTransferencia[0] === 0 && EstadoTransferencia[2] === "EXITOSO" ) {
                            Meteor.call( 'ActualizaSaldoActual', MonedaRev);
                            var RevMoneda = Monedas.find({ moneda : MonedaRev,}).fetch();
                            var SaldoActTransf = RevMoneda[0].saldo.cuenta.activo;
                            //console.log("Valor de RevMoneda", RevMoneda);
                            //console.log("Valor de SaldoActTransf", SaldoActTransf);
                            console.log('############################################');
                            //var ValMinTranf = RevMoneda[0].min_transferencia
                            if ( SaldoActTransf !== SaldoAntTransf) {
                                //console.log("Estoy en el if ( SaldoActTransf !== SaldoAntTransf)");
                                //console.log("Acá estoy 1");
                                /*console.log('############################################');
                                console.log('       Status Tranferencia', MonedaRev);
                                console.log('############################################');
                                console.log('             STATUS: ',"EXITOSO" );
                                console.log('############################################');*/
                                var NuevoValMinTransf = Meteor.call('ReemplazaNumeroACero', SaldoActTransf);
                                Meteor.call("GuardarLogEjecucionTrader", [' Valor de NuevoValMinTransf']+[NuevoValMinTransf]);
                                Monedas.update({ moneda : MonedaRev }, {$set: { min_transferencia: NuevoValMinTransf }}, {"multi" : true,"upsert" : true});
                                var ValMinTranf = NuevoValMinTransf
                                //HistoralTransferencias.update({ id : EstadoTransferencia[1] }, {$set: { estado: "Exitoso" }});
                                break;
                            }else{
                                //console.log("Estoy en el else de - if ( SaldoActTransf !== SaldoAntTransf)");
                                //console.log("Acá estoy 2")
                                /*console.log('############################################');
                                console.log('       Status Tranferencia', MonedaRev);
                                console.log('############################################');
                                console.log('             STATUS: ',"FALLIDO" );
                                console.log('############################################');*/
                                var ContAtCar = ContAtCar + 1
                                var ValorAnalizarSaldoActTransf = Meteor.call("CombierteNumeroExpStr", SaldoActTransf);
                                //console.log("Estoy en el else de - if ( SaldoActTransf !== SaldoAntTransf)");
                                //console.log("Valor de ValorAnalizarSaldoActTransf", ValorAnalizarSaldoActTransf)
                                var CantCaracSaldoActTransf = ValorAnalizarSaldoActTransf.toString().trim().length - ContAtCar;
                                //console.log("Valor de CantCaracSaldoActTransf", CantCaracSaldoActTransf)
                                var ValStrnSaldoActTransf = ValorAnalizarSaldoActTransf.toString().substr(0, CantCaracSaldoActTransf);
                                //console.log("Valor de ValStrnSaldoActTransf", ValStrnSaldoActTransf)
                                var ValFinSaldoActTransf = parseFloat(ValStrnSaldoActTransf);
                                var SaldoActTransf = ValFinSaldoActTransf;
                                //console.log("Valor de ValFinSaldoActTransf", ValFinSaldoActTransf)
                                //console.log("Valor de SaldoActTransf", SaldoActTransf)
                                var NuevoValMinTransf = Meteor.call('ReemplazaNumeroACero', SaldoActTransf);  
                                var ValMinTranf = NuevoValMinTransf
                                //console.log("Valor de NuevoValMinTransf", NuevoValMinTransf)
                                Monedas.update({ moneda : MonedaRev }, {$set: { min_transferencia: NuevoValMinTransf }}, {"multi" : true,"upsert" : true});                            
                                //HistoralTransferencias.update({ id : EstadoTransferencia[1] }, {$set: { estado: "Fallo" }});
                            }
                        }else if ( EstadoTransferencia[0] === 0 && EstadoTransferencia[2] === "FALLIDO" || EstadoTransferencia[0] === 1 ){
                            Meteor.call("GuardarLogEjecucionTrader", [' Estoy en el else de - if ( EstadoTransferencia[0] === 0 )']);
                            console.log('############################################');
                            Meteor.call("GuardarLogEjecucionTrader", ['       Status Tranferencia ']+[MonedaRev]);
                            console.log('############################################');
                            Meteor.call("GuardarLogEjecucionTrader", ['             STATUS: ']+['FALLIDO']);
                            console.log('############################################');
                            var ValorAnalizarSaldoActTransf = Meteor.call("CombierteNumeroExpStr", SaldoActTransf);
                            var CantCaracSaldoActTransf = ValorAnalizarSaldoActTransf.toString().trim().length;
                            var ValStrnSaldoActTransf = ValorAnalizarSaldoActTransf.toString().substr(0, CantCaracSaldoActTransf);
                            var ValFinSaldoActTransf = parseFloat(ValStrnSaldoActTransf);
                            var SaldoActTransf = ValFinSaldoActTransf;
                            var NuevoValMinTransf = Meteor.call('ReemplazaNumeroACero', SaldoActTransf);  
                            var ValMinTranf = NuevoValMinTransf
                            Monedas.update({ moneda : MonedaRev }, {$set: { min_transferencia: NuevoValMinTransf }}, {"multi" : true,"upsert" : true});
                            break
                        }
                    }while( Repeticiones < 1000 );

                }else{
                    console.log('############################################');
                    Meteor.call("GuardarLogEjecucionTrader", '   fondos son insuficientes para transferir');
                    console.log('############################################');
                }


            }

        }else{
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '  NO SE DETECTO SALDO PARA SER TRANSFERIDO ');
            console.log('############################################');
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
            var LTCTamanioTicket = Number( mon_c.tickSize );
            var LTCComisionCasaCambio = Number( mon_c.takeLiquidityRate );
            var LTCComisionMercado = Number( mon_c.provideLiquidityRate );
            var LTCMonedaAplicacionComision = mon_c.feeCurrency;


            switch(VALOR){
                case 1:
                    // HACE UNA CONSULTA GENERAL DE LOS TIPO_CAMBIO EXISTENTES
                    console.log('############################################');
                    Meteor.call("GuardarLogEjecucionTrader", ' Tipos de Cambio que se están tradeando en HITBTC');
                    console.log(' ');
                    Meteor.call("GuardarLogEjecucionTrader", '    ********* ', LTCTipoCambio, '********* ');
                    console.log(' ');
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[LTCMonedaBase]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA DE COTIZACIÓN: ']+[LTCMonedaCotizacion]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONTO MIN DE COMPRA: ']+[LTCMontoMinCompra]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     VALOR DE INCREMENTO: ']+[LTCValorIncremento]);
                    console.log(' ');
                    console.log(' *******    VALORES DE COMISIONES    *******');
                    console.log(' ');
                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[LTCComisionCasaCambio]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[LTCComisionMercado]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     APLICACION DE COMISION A MONEDA: ']+[LTCMonedaAplicacionComision]);
                break;
                case 2:
                    // ESTO ES PARA VERIFICAR LA TENDENCIA DE LOS TIPOS DE CAMBIO

                    if (TiposDeCambios.find({ tipo_cambio : mon_c.id }).count() !== 0) {
                        try{
                            TiposDeCambios.update({ tipo_cambio : LTCTipoCambio },{$set:{ tipo_cambio : LTCTipoCambio, moneda_base :  LTCMonedaBase, moneda_cotizacion : LTCMonedaCotizacion, activo : "S", habilitado : 1 , comision_hitbtc : LTCComisionCasaCambio, comision_mercado : LTCComisionMercado, min_compra : LTCMontoMinCompra, moneda_apli_comision : LTCMonedaAplicacionComision, valor_incremento : LTCValorIncremento, c_estado_p: 0, c_estado_a: 0  }}, {"multi" : true,"upsert" : true});
                        }
                        catch(error){
                            Meteor.call("GuardarLogEjecucionTrader", ' Error: los datos no pudieron ser actualizados');
                            Meteor.call('ValidaError', error, 1);
                        }
                    }
                    else {
                        TiposDeCambios.insert({tipo_cambio : LTCTipoCambio, moneda_base :  LTCMonedaBase, moneda_cotizacion : LTCMonedaCotizacion, activo : "S", habilitado : 1 , comision_hitbtc : LTCComisionCasaCambio, comision_mercado : LTCComisionMercado, min_compra : LTCMontoMinCompra, moneda_apli_comision : LTCMonedaAplicacionComision, valor_incremento : LTCValorIncremento, estado : "V" , c_estado_p: 0, c_estado_a: 0 });
                        console.log('--------------------------------------------');
                        Meteor.call("GuardarLogEjecucionTrader", ' ** Detectado nuevo Tipo de Cambio en HITBTC **');
                        console.log('--------------------------------------------');
                        console.log(' ');
                        Meteor.call("GuardarLogEjecucionTrader", '    ********* ', LTCTipoCambio, '********* ');
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[LTCMonedaBase]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA DE COTIZACIÓN: ']+[LTCMonedaCotizacion]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONTO MIN DE COMPRA: ']+[LTCMontoMinCompra]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     VALOR DE INCREMENTO: ']+[LTCValorIncremento]);
                        console.log(' ');
                        console.log(' *******    VALORES DE COMISIONES    *******');
                        Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[LTCComisionCasaCambio]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[LTCComisionMercado]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     APLICACION DE COMISION A MONEDA: ']+[LTCMonedaAplicacionComision]);
                    }
                break;
                default:
                    Meteor.call("GuardarLogEjecucionTrader", ' Valor de tipo consulta no definida ');
            }
        };
    },

    'LibroDeOrdenes':function(TIPO_CAMBIO){
        fecha = moment (new Date());
        //console.log('############################################');
        //console.log(' Devuelve los datos reales de los valores compra y venta en negociación - (Libro de Ordenes)');
        //console.log(' Tipo de Cambio recibido:, ', TIPO_CAMBIO);
        var url_compras_ventas = [publico]+['ticker']+'/'+[TIPO_CAMBIO];
        //console.log(' url_compras_ventas:, ', url_compras_ventas);


        var compras_ventas = Meteor.call("ConexionGet", url_compras_ventas);
        console.log("Valor de compras_ventas", compras_ventas);


        if ( compras_ventas !== undefined ) {
            var v_compras_ventas = (compras_ventas.data);
            var ValorOferta = v_compras_ventas.ask;
            var ValorDemanda = v_compras_ventas.bid;

            console.log("Valor de ValorOferta", ValorOferta);
            console.log("Valor de ValorDemanda", ValorDemanda);

            if ( ValorOferta === null || ValorDemanda === null ) {
                Meteor.call("GuardarLogEjecucionTrader", "Entre por if ( ValorOferta === null || ValorDemanda === null ");
                var ValFinPromedio = 0;
                var Existencia = 0;
            }else{
                //var sumatoria = parseFloat(v_compras_ventas.ask) + parseFloat(v_compras_ventas.bid);
                var sumatoria = parseFloat(ValorOferta) + parseFloat(ValorDemanda);
                var promedio = sumatoria/2;
                //var CantPromedio = v_compras_ventas.ask.toString().trim().length ;
                var CantPromedio = ValorOferta.toString().trim().length ;
                var ValStrnPromedio = promedio.toString().substr(0, CantPromedio);
                var ValFinPromedio = parseFloat(ValStrnPromedio);
                var Existencia = 1;
                console.log('\n ');
                console.log('############################################');
                Meteor.call("GuardarLogEjecucionTrader", [' Verificando Tipo de Cambio: ']+[v_compras_ventas.symbol]);
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Oferta en Venta: ']+[ValorOferta]);
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Oferta de Compra: ']+[ValorDemanda]);
                Meteor.call("GuardarLogEjecucionTrader", [' Promedio: ']+[ValFinPromedio]);
                Meteor.call("GuardarLogEjecucionTrader", [' Marca de tiempo: ']+[v_compras_ventas.timestamp]);
                console.log('############################################');
                if (EquivalenciasDol.find({ tipo_cambio : TIPO_CAMBIO }).count() === 0) {
                    EquivalenciasDol.insert({ fecha : fecha._d, tipo_cambio : v_compras_ventas.symbol, ValorOfertaVenta : v_compras_ventas.ask, ValorOfertaCompra : v_compras_ventas.bid, Promedio : ValFinPromedio, Existe : Existencia })
                }
                else{
                    EquivalenciasDol.update({ tipo_cambio : v_compras_ventas.symbol },{$set:{ fecha : fecha._d, ValorOfertaVenta : v_compras_ventas.ask, ValorOfertaCompra : v_compras_ventas.bid, Promedio : ValFinPromedio, Existe : Existencia }}, {"multi" : true,"upsert" : true});
                }
            }

        }else{
            Meteor.call("GuardarLogEjecucionTrader", "Entre por compras_ventas === undefined ");
            var ValFinPromedio = 0;
            var Existencia = 0;
        }
        PromedioObtenido = { 'Promedio': ValFinPromedio, 'Existe': Existencia };
        console.log("Valor de PromedioObtenido", PromedioObtenido);
        
        return PromedioObtenido;
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
                        Monedas.update({ moneda : aux1[aux].moneda },{$set:{ nombre_moneda : aux1[aux].nombre_moneda, activo : "N" }}, {"multi" : true,"upsert" : true});
                    }
                    catch(error){
                        Meteor.call("GuardarLogEjecucionTrader", 'Error: los datos no pudieron ser actualizados');
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
                        TiposDeCambios.update({ tipo_cambio : aux1[aux].tipo_cambio },{$set:{ tipo_cambio : aux1[aux].tipo_cambio, moneda_base :  aux1[aux].moneda_base, moneda_cotizacion : aux1[aux].moneda_cotizacion, activo : "N" }}, {"multi" : true,"upsert" : true});
                    }
                    catch(error){
                        Meteor.call("GuardarLogEjecucionTrader", 'Error: los datos no pudieron ser actualizados');
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
        Meteor.call("GuardarLogEjecucionTrader", ' Devuelve los datos Historicos de Transacciones realizadas en la cuenta');
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
            Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[transaccion.id]);
            Meteor.call("GuardarLogEjecucionTrader", [' INDICE: ']+[transaccion.index]);
            Meteor.call("GuardarLogEjecucionTrader", [' TIPO: ']+[transaccion.type]);
            Meteor.call("GuardarLogEjecucionTrader", [' STATUS: ']+[transaccion.status]);
            Meteor.call("GuardarLogEjecucionTrader", [' MONEDA: ']+[transaccion.currency]);
            Meteor.call("GuardarLogEjecucionTrader", [' MONTO: ']+[transaccion.amount]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA CREACION: ']+[transaccion.createdAt]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA DE CAMBIO: ']+[transaccion.updatedAt]);
            Meteor.call("GuardarLogEjecucionTrader", [' HASH: ']+[transaccion.hash]);
            console.log('############################################');
            console.log(' ');
        };
    },

    'ConsultaOrdenesAbiertas':function(TIPO_CAMBIO){

        var url_orden = [ordenes];
        var OrdeneAbiertas = Meteor.call("ConexionGet",url_orden);

        if ( OrdeneAbiertas === undefined ) {
            console.log('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", "     --- No hay ordenes Abiertas ---");
            console.log('--------------------------------------------');
        }
        else{
            console.log("Ordenes Activas: ", OrdeneAbiertas)
        }
    },

    'RetiroFondos':function(){ //Withdraw crypro

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza el retiro de los fondos de las monedas en estado de reserva');
        console.log(' ');
    },

    'ConsultaRetiroFondos':function(){ //Commit withdraw crypro

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza consulta de transacción retiro de los fondos en proceso');
        console.log(' ');
    },

    'CancelaRetiroFondos':function(){   //Rollback withdraw crypro

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Realiza cancelación de transacción retiro de los fondos en proceso');
        console.log(' ');
    },

    'ConsultaCarterasDeposito':function(){

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Consulta las carteras Activas a la cual se le puede asignar saldo');
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

            Meteor.call("GuardarLogEjecucionTrader", [' Valor de mon']+[mon]);
            Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA: ']+[mon.id]+['/']+[mon.fullName]);

            var url_cartera_depositos = [cart_dep]+'/'+[mon.id];
            try {
                var v_cartera = Meteor.call("ConexionGet", url_cartera_depositos);
                var cartera = (v_cartera.data);
            }
        catch (error){
                Meteor.call("ValidaError", error, 1)
            };

            Meteor.call("GuardarLogEjecucionTrader", ['    DIRECCIÓN DE CARTERA: ']+[cartera.address]);
            console.log(' ');
            console.log('############################################');
        };
    },

    'CrearCarterasDeposito':function(MONEDA){ //Create new deposit crypro address

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Crea las carteras Activas a la cual se le puede asignar saldo');
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
        Meteor.call("GuardarLogEjecucionTrader", '         TRANSFERENCIA DE FONDOS');
        console.log('############################################');
        console.log(' ');
        //console.log("Valores recibidos, MONEDA:", MONEDA, " MONTO: ", MONTO, " TIPO_TRANSF:", TIPO_TRANSF);

        //HAY 2 TIPOS DE TRANSFERENCIAS
        // "bankToExchange" Del Saldo de la cuenta a el Saldo de Trader
        // "exchangeToBank" Del Saldo de Trader a el Saldo de la cuenta

        var datos = new Object();
        datos.currency= MONEDA;
        datos.amount = MONTO;
        datos.type = TIPO_TRANSF;

        var url_orden = transferencia;

        //try{
            var NuevaTransferencia = Meteor.call("ConexionPost", url_orden, datos);
            //console.log("Valore de NuevaTransferencia", NuevaTransferencia);
        //}
        /*catch (error){
            Meteor.call("ValidaError", error, 1)
        };*/
        if ( NuevaTransferencia === undefined ) {
            var StatusEjecucion = 1;
        }else{
            var StatusEjecucion = NuevaTransferencia.statusCode;
            var IdTransferencia = NuevaTransferencia.data.id;
            //console.log("Valore de StatusEjecucion", StatusEjecucion);
            //console.log("Valore de IdTransferencia", IdTransferencia);
        };

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

            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Solicitud de Transferencia Realizada Exitosamente']);
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Transacción: ']+[ IdTransferencia ]);
            HistoralTransferencias.insert({ fecha : FECHA, id : IdTransferencia ,tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : "Verificando" })

            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    ID: ']+[IdTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+["VERIFICANDO"]);
            console.log('############################################');
            console.log(' ');


            var VEstatus = Meteor.call( 'VerificarTransferencias', IdTransferencia);

            var sal = new Set();
            sal.add( 0 );
            sal.add( IdTransferencia );
            sal.add( VEstatus );
            var salida = Array.from(sal);
            return salida;
        }
        else{
            //HistoralTransferencias.insert({ fecha : FECHA, id : "IdTransferencia" ,tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : "Fallido" })

            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+["FALLIDO"]);
            console.log('############################################');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", [' Transferirfondos: Sulicitud de Transferencia Fallida'] );
            var sal = new Set();
            sal.add( 1 );
            var salida = Array.from(sal);
            return salida;
        }        
    },
    
    'CrearNuevaOrder':function(TIPO_CAMBIO,T_TRANSACCION,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){  //POST

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", 'Creando una nueva orden');
        //console.log("Valores recibidos, N_ID__ORDEN_CLIENT:" , " TIPO_CAMBIO: ", TIPO_CAMBIO, " T_TRANSACCION: ", T_TRANSACCION, " CANT_INVER: ", CANT_INVER);

        //var PRECIO = Meteor.call('LibroDeOrdenes', TIPO_CAMBIO);
        var fecha = new Date();

        switch (T_TRANSACCION){
            case 'buy':
                var V_TipoOperaciont = 'COMPRA';
                break;
            case 'sell':
                var V_TipoOperaciont = 'VENTA';
                break;
        }

        var datos = new Object();
        //datos.clientOrderId= N_ID__ORDEN_CLIENT;
        datos.symbol = TIPO_CAMBIO;
        datos.side = T_TRANSACCION;
        fatos.type = 'market';
        datos.timeInForce=ZONA_HORARA;
        datos.quantity = CANT_INVER;
        //datos.price = PRECIO; // PRECIO ES REQUERIDO, SE NECESITAN LAS ORDENES DE COMPRA PARA SABER EN CUANTO COMPRAR

        var url_orden = ordenes;

        var Orden = Meteor.call('ConexionPost', url_orden, datos);


        Meteor.call("GuardarLogEjecucionTrader", ["Valor de orden"]+[Orden]);

        var Estado_Orden = Meteor.call('VerificarHistoricoEstadoOrden', Orden );
        var Estado_Orden = ValidaEstadoOrden.Estado

        Meteor.call("GuardarLogEjecucionTrader", ['Valor de ValidaEstadoOrden']+[ValidaEstadoOrden]);
        Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrder: recibi estado: ']+[Estado_Orden]);



        
        var V_Anteriores = Monedas.aggregate([{ $match: { 'moneda' : MONEDA_SALDO }}]);
        var ValoresAnteriores = V_Anteriores[0];






        if (Estado_Orden === "filled") {

            var IdTransaccionActual = Meteor.call('CalculaId', 2);

            Meteor.call('GuardarLogEjecucionTrader', ' CrearNuevaOrder: Estoy en: Estado_Orden === "filled"');

            Meteor.call('ActualizaSaldoActual', MONEDA_SALDO );

            var V_Actual = Monedas.aggregate([{ $match: { 'moneda' : MONEDA_SALDO }}]);
            var ValoresActuales = V_Actual[0];

            //'EquivalenteDolar':function(moneda, saldo)

            
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValoresAnteriores: "]+[ValoresAnteriores]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValoresActuales: "]+[ValoresActuales]);


            var FechaTradeoAnterior = ValoresAnteriores.saldo.tradeo.fecha;
            var SaldoTradeoAnterior = ValoresAnteriores.saldo.tradeo.activo;
            var V_EquivalenciaTradeoAnterior = ValoresAnteriores.saldo.tradeo.equivalencia;
            var SaldoTradeoActual = ValoresActuales.saldo.tradeo.activo;
            var V_EquivalenciaTradeoActual = Meteor.call('EquivalenteDolar', MONEDA_SALDO, parseFloat(SaldoTradeoActual, 2));
            var V_SaldoInversion = ValidaEstadoOrden.Precio;
            var Eqv_V_InverSaldAct = Meteor.call('EquivalenteDolar', MONEDA_SALDO, parseFloat(V_SaldoInversion), 2);
            var Eqv_V_InverSaldAnt = ( Eqv_V_InverSaldAct * V_EquivalenciaTradeoAnterior ) / parseFloat(SaldoTradeoActual);
            var V_Comision = ValidaEstadoOrden.Comision;
            var Equiv_V_Comision = Meteor.call('EquivalenteDolar', MONEDA_COMISION, parseFloat(V_Comision), 2);
            if ( MONEDA_SALDO == MON_C ) {
                var V_MonedaAdquirida = MON_C
            }else{
                var V_MonedaAdquirida = MON_B
            }
            var SaldoMonedaAdquirida = ValidaEstadoOrden.CantidadRecibida;
            var V_EquivSaldoMonedaAdquirida = Meteor.call('EquivalenteDolar', V_MonedaAdquirida, parseFloat(SaldoMonedaAdquirida), 2);
            var V_IdHitBTC = ValidaEstadoOrden.Id;
            var V_IdOrden = ValidaEstadoOrden.IdOrdenCliente;
            var V_FormaOperacion = ValidaEstadoOrden.FormaDeOperacion;
            var V_Ganancia = V_EquivSaldoMonedaAdquirida - V_EquivalenciaTradeoActual;

            Meteor.call("GuardarLogEjecucionTrader", [" Valor de IdTransaccionActual: "]+[IdTransaccionActual]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_IdHitBTC: "]+[V_IdHitBTC]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de ID_LOTE: "]+[ID_LOTE]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_IdOrden: "]+[V_IdOrden]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaSaldoAnteior: "]+[FechaTradeoAnterior]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoAnterior: "]+[SaldoTradeoAnterior]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoAnterior: "]+[V_EquivalenciaTradeoAnterior]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_SaldoInversion: "]+[V_SaldoInversion]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de Eqv_V_InverSaldAnt: "]+[Eqv_V_InverSaldAnt]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de Eqv_V_InverSaldAct: "]+[Eqv_V_InverSaldAct]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Comision: "]+[V_Comision]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de Equiv_V_Comision: "]+[Equiv_V_Comision]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_MonedaAdquirida: "]+[V_MonedaAdquirida]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoMonedaAdquirida: "]+[SaldoMonedaAdquirida]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivSaldoMonedaAdquirida: "]+[V_EquivSaldoMonedaAdquirida]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_FormaOperacion: "]+[V_FormaOperacion]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Ganancia: "]+[V_Ganancia]);

            GananciaPerdida.insert({  id: IdTransaccionActual,
                                    "Operacion.Id_hitbtc" : V_IdHitBTC,
                                    "Operacion.id_lote" : ID_LOTE, 
                                    "Operacion.Id_OrdenHitbtc" : V_IdOrden,
                                    "MonedaSaldo.Fecha" : FechaTradeoAnterior,
                                    "MonedaSaldo.Moneda" : MONEDA_SALDO,
                                    "MonedaSaldo.SaldoTotal" : SaldoTradeoAnterior,
                                    "MonedaSaldo.Equivalencia" : V_EquivalenciaTradeoAnterior,
                                    "Inversion.SaldoInversion " : V_SaldoInversion,
                                    "Inversion.EquivalenciaAnt" : Eqv_V_InverSaldAnt,
                                    "Inversion.EquivalenciaAct" : Eqv_V_InverSaldAct,
                                    "Operacion.TipoCompra" : V_FormaOperacion,
                                    "Comision.Valor" : V_Comision,
                                    "Comision.Equivalencia" : Equiv_V_Comision,
                                    "MonedaAdquirida.Fecha" : fecha,
                                    "MonedaAdquirida.Moneda" : V_MonedaAdquirida,
                                    "MonedaAdquirida.Saldo" : SaldoMonedaAdquirida,
                                    "MonedaAdquirida.Equivalencia" : V_EquivSaldoMonedaAdquirida,
                                    "Ganancia.Valor" :  V_Ganancia});

                                    
        }   
        else {
            while( Estado_Orden !== "filled" ){                
                if ( Estado_Orden === "suspended" || Estado_Orden === "canceled" || Estado_Orden === "expired" ) {
                    //Meteor.call('GuardarLogEjecucionTrader', ' CrearNuevaOrder: Estoy en: Estado_Orden === "suspended" || Estado_Orden === "canceled" || Estado_Orden === "expired"');
                    Meteor.call("GuardarLogEjecucionTrader", [' CrearNuevaOrder: Orden Fallida, Status Recibido: "']+[Estado_Orden]+['", Reintentando ejecución de Orden ..., con los siguientes datos: TIPO_CAMBIO :']+[TIPO_CAMBIO]+[',T_TRANSACCION :']+[T_TRANSACCION]+[',CANT_INVER : ']+[CANT_INVER][', MON_B :']+[MON_B][', MON_C :']+[, MON_C]);
                    //
                    //
                    ///////////////////////////////////////////////////////////////////
                    cont += 1;
                    console.log('contador', cont);
                    Estado_Orden = "filled";
                    

                    ///////////////////////////////////////////////////////////////////
                    ///
                    ///
                    ///

                }
                else if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" ) {
                    Meteor.call('GuardarLogEjecucionTrader', ' CrearNuevaOrder: Estoy en:  else if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled"');
                    //Meteor.call("GuardarLogEjecucionTrader", [' CrearNuevaOrder: Orden Parcialmente Completada, Status Recibido: "']+[Estado_Orden]+['", Reintentando Verificación ...']);
                    //var Estado_Orden = Meteor.call('VerificarHistoricoEstadoOrden', Orden );
                    if (Estado_Orden === "filled") {
                        var IdTransaccionActual = Meteor.call('CalculaId', 2);

                        Meteor.call('GuardarLogEjecucionTrader', ' CrearNuevaOrder: Estoy en: Estado_Orden === "filled"');

                        Meteor.call('ActualizaSaldoActual', MONEDA_SALDO );

                        var V_Actual = Monedas.aggregate([{ $match: { 'moneda' : MONEDA_SALDO }}]);
                        var ValoresActuales = V_Actual[0];

                        //'EquivalenteDolar':function(moneda, saldo)

                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValoresAnteriores: "]+[ValoresAnteriores]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValoresActuales: "]+[ValoresActuales]);


                        var FechaTradeoAnterior = ValoresAnteriores.saldo.tradeo.fecha;
                        var SaldoTradeoAnterior = ValoresAnteriores.saldo.tradeo.activo;
                        var V_EquivalenciaTradeoAnterior = ValoresAnteriores.saldo.tradeo.equivalencia;
                        var SaldoTradeoActual = ValoresActuales.saldo.tradeo.activo;
                        var V_EquivalenciaTradeoActual = Meteor.call('EquivalenteDolar', MONEDA_SALDO, parseFloat(SaldoTradeoActual, 2));
                        var V_SaldoInversion = ValidaEstadoOrden.Precio;
                        var Eqv_V_InverSaldAct = Meteor.call('EquivalenteDolar', MONEDA_SALDO, parseFloat(V_SaldoInversion), 2);
                        var Eqv_V_InverSaldAnt = ( Eqv_V_InverSaldAct * V_EquivalenciaTradeoAnterior ) / parseFloat(SaldoTradeoActual);
                        var V_Comision = ValidaEstadoOrden.Comision;
                        var Equiv_V_Comision = Meteor.call('EquivalenteDolar', MONEDA_COMISION, parseFloat(V_Comision), 2);
                        if ( MONEDA_SALDO == MON_C ) {
                            var V_MonedaAdquirida = MON_C
                        }else{
                            var V_MonedaAdquirida = MON_B
                        }
                        var SaldoMonedaAdquirida = ValidaEstadoOrden.CantidadRecibida;
                        var V_EquivSaldoMonedaAdquirida = Meteor.call('EquivalenteDolar', V_MonedaAdquirida, parseFloat(SaldoMonedaAdquirida), 2);
                        var V_IdHitBTC = ValidaEstadoOrden.Id;
                        var V_IdOrden = ValidaEstadoOrden.IdOrdenCliente;
                        var V_FormaOperacion = ValidaEstadoOrden.FormaDeOperacion;
                        var V_Ganancia = V_EquivSaldoMonedaAdquirida - V_EquivalenciaTradeoActual;

                        
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de IdTransaccionActual: "]+[IdTransaccionActual]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_IdHitBTC: "]+[V_IdHitBTC]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de ID_LOTE: "]+[ID_LOTE]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_IdOrden: "]+[V_IdOrden]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaSaldoAnteior: "]+[FechaTradeoAnterior]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoAnterior: "]+[SaldoTradeoAnterior]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoAnterior: "]+[V_EquivalenciaTradeoAnterior]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_SaldoInversion: "]+[V_SaldoInversion]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de Eqv_V_InverSaldAnt: "]+[Eqv_V_InverSaldAnt]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de Eqv_V_InverSaldAct: "]+[Eqv_V_InverSaldAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Comision: "]+[V_Comision]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de Equiv_V_Comision: "]+[Equiv_V_Comision]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_MonedaAdquirida: "]+[V_MonedaAdquirida]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoMonedaAdquirida: "]+[SaldoMonedaAdquirida]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivSaldoMonedaAdquirida: "]+[V_EquivSaldoMonedaAdquirida]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_FormaOperacion: "]+[V_FormaOperacion]);
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Ganancia: "]+[V_Ganancia]);

                        GananciaPerdida.insert({  id: IdTransaccionActual,
                                                "Operacion.Id_hitbtc" : V_IdHitBTC,
                                                "Operacion.id_lote" : ID_LOTE, 
                                                "Operacion.Id_OrdenHitbtc" : V_IdOrden,
                                                "MonedaSaldo.Fecha" : FechaTradeoAnterior,
                                                "MonedaSaldo.Moneda" : MONEDA_SALDO,
                                                "MonedaSaldo.SaldoTotal" : SaldoTradeoAnterior,
                                                "MonedaSaldo.Equivalencia" : V_EquivalenciaTradeoAnterior,
                                                "Inversion.SaldoInversion " : V_SaldoInversion,
                                                "Inversion.EquivalenciaAnt" : Eqv_V_InverSaldAnt,
                                                "Inversion.EquivalenciaAct" : Eqv_V_InverSaldAct,
                                                "Operacion.TipoCompra" : V_FormaOperacion,
                                                "Comision.Valor" : V_Comision,
                                                "Comision.Equivalencia" : Equiv_V_Comision,
                                                "MonedaAdquirida.Fecha" : fecha,
                                                "MonedaAdquirida.Moneda" : V_MonedaAdquirida,
                                                "MonedaAdquirida.Saldo" : SaldoMonedaAdquirida,
                                                "MonedaAdquirida.Equivalencia" : V_EquivSaldoMonedaAdquirida,
                                                "Ganancia.Valor" :  V_Ganancia});
                    }
                    Meteor.call('sleep',5000);
                    //
                    //
                    ///////////////////////////////////////////////////////////////////
                    cont += 1;
                    console.log('contador', cont)
                    if (cont === 2) {
                        Estado_Orden = "filled"
                    }

                    ///////////////////////////////////////////////////////////////////
                    ///
                    ///
                    ///
                };
            };
        };
        // VOY POR ACÁ
        //Meteor.call('CalculoGanancia');
        //
        //TempSaldoMoneda.insert({ moneda : MON_C, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_coti_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: COMISION_HITBTC, comision_mercado_aplicada : COMISION_MERCADO, saldo_final : nuevo_saldo_moneda_coti_actual })
        //TempSaldoMoneda.insert({ moneda : MON_B, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_base_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: 0, comision_mercado_aplicada : 0, saldo_final : nuevo_saldo_moneda_base_actual })
        HistoralTransacciones.insert({ fecha : fecha, id : N_ID__ORDEN_CLIENT, tipo_cambio : TIPO_CAMBIO, tipo_transaccion : V_TipoOperaciont, moneda_base : MON_B, moneda_cotizacion : MON_C, monto : CANT_INVER, numero_orden : Orden, precio_operacion : PRECIO, estado : "Exitoso" });
    },    

    'EquivalenteDolar':function(MONEDA, S_MOND, TIPO_ACCION){
        Meteor.call('sleep', 100);
        var SALDO = parseFloat(S_MOND);

        if ( SALDO === 0 ) {
            var EquivalenciaActual = 0;
        }else{            
           //console.log("Valores recibidos: MONEDA", [MONEDA]+[' SALDO:']+[SALDO]);

            if ( MONEDA == 'USD' ) {
                var EquivalenciaActual = parseFloat(SALDO);
            }else{
                console.log("EquivalenteDolar: Valores recibidos - MONEDA:", [MONEDA]+[' ,SALDO:']+[SALDO]);

                var ExisteTipoCambio = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{ _id : 0, tipo_cambio : 1}).count();
                console.log("Valor de ExisteTipoCambio", ExisteTipoCambio);

                if ( ExisteTipoCambio !== 0 ) {

                    var DIRECTO = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                    console.log("Valor de DIRECTO", DIRECTO);            

                    if ( DIRECTO !== 0 ) {
                        var precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                        //console.log("Valor de precioAux", precioAux);
                        var TipoCambioObtenido = precioAux[0].tipo_cambio;
                        console.log("Valor de TipoCambio", TipoCambioObtenido);
                        //console.log("Valor de TipoCambio", TipoCambio);
                        //
                        switch (TIPO_ACCION){
                            case 1:
                                console.log("Estoy en el case 1")
                                var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                    { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                ]);
                                var ValorPromedio = ValorObtenido[0]

                                console.log("Valor de ValorPromedio", ValorPromedio);

                                if ( ValorPromedio === undefined ) {
                                    console.log("Estoy en el  if ( ValorPromedio === undefined ) ");
                                    console.log("Valor de TipoCambioObtenido", TipoCambioObtenido);
                                    var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    console.log("Valor de ValorPromedio", ValorPromedio);
                                    /*if ( ValorPromedio === undefined ) {
                                        console.log("Entre en el segundo if ( ValorPromedio === undefined ) {  ");
                                        var ValorPromedio = { 'Promedio' : 0, 'Existe' : 0 };
                                        console.log("Valor de ValorPromedio: ", ValorPromedio);
                                        //var ValorPromedioObtenido = ValorPromedio;
                                        //var ValorPromedioObtenido = { 'Promedio' : 0, 'Existe' : 0 };
                                        //console.log("Valor de ValorPromedioObtenido: ", ValorPromedioObtenido);
                                    }*/
                                }
                            break;
                            case 2:
                                console.log("Estoy en el case 2");
                                var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                console.log("Valor de ValorPromedio", ValorPromedio);
                            break;
                        }


                        var TipoCambioValido = ValorPromedio.Existe

                        if ( TipoCambioValido !== 1 ) {
                            console.log('############################################');
                            Meteor.call("GuardarLogEjecucionTrader", ['   TIPO DE CAMBIO NO SE TOMARÁ EN CUENTA: ']+[TipoCambioObtenido]);
                            console.log('############################################');
                            var EquivalenciaActual = 0;

                                TiposDeCambios.update({ tipo_cambio: TipoCambioObtenido }, {    
                                                        $set: {
                                                                habilitado: 0
                                                            }
                                                        }, {"multi" : true,"upsert" : true});
                        }else{
                            //console.log("Valor de ValorPromedio", ValorPromedio.Promedio);
                            var EquivalenciaActual = (parseFloat(SALDO) * ValorPromedio.Promedio ) / 1;
                            //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                        }
                    }else {
                        console.log("ESTOY EN EL ELSE DE if ( DIRECTO !== 0 ");

                            //precioAux = TiposDeCambios.find({moneda_base:MONEDA,moneda_cotizacion:'BTC'}).fetch();
                        var TiposCambiosMoneda = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{}).fetch();
                        //console.log("Valor de TiposCambiosMoneda", TiposCambiosMoneda);

                        for ( CTCDM = 0, TTCDM = TiposCambiosMoneda.length; CTCDM < TTCDM; CTCDM++ ) {
                            V_TiposCambiosMoneda = TiposCambiosMoneda[CTCDM];
                            //console.log("Valor de V_TiposCambiosMoneda", V_TiposCambiosMoneda);
                            var MBase = V_TiposCambiosMoneda.moneda_base;
                            var MCotizacion = V_TiposCambiosMoneda.moneda_cotizacion;
                            var TipoCambioObtenido = V_TiposCambiosMoneda.tipo_cambio;
                            //console.log("Valor de TipoCambioObtenido", TipoCambioObtenido);
                            /*
                            console.log("Valor de MBase", MBase);
                            console.log("Valor de MCotizacion", MCotizacion);
                            console.log("Valor de MONEDA", MONEDA);
                            */

                            //var ValorPromedioObtenido = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);

                            switch (TIPO_ACCION){
                                case 1:
                                    var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                        { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                    ]);
                                    var ValorPromedioObtenido = ValorObtenido[0]

                                if ( ValorPromedio === undefined ) {
                                    var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    /*if ( ValorPromedio === undefined) {
                                        console.log("Entre en el segundo if ( ValorPromedio === undefined ) { B ");
                                        var ValorPromedio = { 'Promedio' : 0, 'Existe' : 0 };
                                        console.log("Valor de ValorPromedio: ", ValorPromedio);
                                        //var ValorPromedioObtenido = ValorPromedio;
                                        var ValorPromedioObtenido = { 'Promedio' : 0, 'Existe' : 0 };
                                        console.log("Valor de ValorPromedioObtenido: ", ValorPromedioObtenido);
                                    }*/
                                }
                                    break;
                                case 2:
                                    var ValorPromedioObtenido = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    break;
                            }

                            var TipoCambioValido = ValorPromedioObtenido.Existe

                            if ( TipoCambioValido === 0 ) {
                                console.log('############################################');
                                Meteor.call("GuardarLogEjecucionTrader", ['   TIPO DE CAMBIO NO SE TOMARÁ EN CUENTA']+[TipoCambioObtenido]);
                                console.log('############################################');
                                var EquivalenciaActual = 0;

                                TiposDeCambios.update({ tipo_cambio: TipoCambioObtenido }, {    
                                                        $set: {
                                                                habilitado: 0
                                                            }
                                                        }, {"multi" : true,"upsert" : true});
                            }else{
                                //console.log("Valor de ValorPromedioObtenido", ValorPromedioObtenido.Promedio);
                                var EquivalenciaSaldoMonedaAuxi = (parseFloat(SALDO)  * parseFloat(ValorPromedioObtenido.Promedio) ) / 1;
                                //console.log("Valor de ValorPromedioObtenido", ValorPromedioObtenido);
                                //console.log("Valor de EquivalenciaSaldoMonedaAuxi", EquivalenciaSaldoMonedaAuxi);

                                var ExistMBUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                                var ExistMCUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                                var ExistMBBTC = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).count();
                                var ExistMCBTC = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).count();

                                if ( ExistMBUSD !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    //console.log("ESTOY EN 1");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = parseFloat( Meteor.call('LibroDeOrdenes', TipoCambio) );
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                }else if ( ExistMCUSD !== 0 ) {
                                    //console.log("ESTOY EN 2");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion }, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    //console.log("Valor de ValorPromedioFinal", ValorPromedioFinal.Promedio);
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                }else if ( ExistMBBTC !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    //console.log("ESTOY EN 3");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                }else if ( ExistMCBTC !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    //console.log("ESTOY EN 4");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                    
                                }
                            }
                        }
                    }
                }else{
                    var EquivalenciaActual = 0;
                }
            }
        }

        //console.log("Valor de EquivalenciaActual ", EquivalenciaActual);

        return EquivalenciaActual.toFixed(8);
    },

    'EquivalenteDolarMinCompra':function(){

        var T_CAMBIOS = TiposDeCambios.find({ }).fetch();
        //console.log("Valor de T_CAMBIOS", T_CAMBIOS);
        for (CT_CAMBIOS = 0, tamanio_T_CAMBIOS = T_CAMBIOS.length; CT_CAMBIOS < tamanio_T_CAMBIOS; CT_CAMBIOS++) {
            V_T_CAMBIOS = T_CAMBIOS[CT_CAMBIOS];
            //console.log("Valor de T_CAMBIOS", V_T_CAMBIOS);
            var EquivDolarMinComp = Meteor.call('EquivalenteDolar', V_T_CAMBIOS.moneda_apli_comision, V_T_CAMBIOS.min_compra, 1);
            //console.log("Valor de EquivDolarMinComp", EquivDolarMinComp);

            try{
                TiposDeCambios.update({ tipo_cambio : V_T_CAMBIOS.tipo_cambio },{$set:{ min_compra_equivalente : parseFloat(EquivDolarMinComp) }}, {"multi" : true,"upsert" : true});
            }
            catch (error){
                Meteor.call("ValidaError", error, 2);
            }
        }
    },

    'CrearNuevaOrderRobot':function(N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_INVER, SALDO_ACTUAL, MON_B, MON_C, MON_SALTRAD, COMISION_HITBTC, COMISION_MERCADO, MON_APLIC_COMISION ){  //POST
        console.log(' ');
        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", ['Creando una nueva orden en el ROBOT']);
        console.log('--------------------------------------------');
        console.log(' ');

        var datos = new Object();
        datos.clientOrderId= N_ID__ORDEN_CLIENT;
        datos.symbol = TIPO_CAMBIO;
        datos.side = T_TRANSACCION;
        datos.timeInForce=ZONA_HORARA;
        datos.quantity = CANT_INVER;

        var fecha = new Date();

        switch (T_TRANSACCION){
            case 'buy':
                var V_TipoOperaciont = 'COMPRA';
                break;
            case 'sell':
                var V_TipoOperaciont = 'VENTA';
                break;
        }

        var moneda = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPO_CAMBIO }}, { $sort: { fecha : -1 } }, { $limit: 1 }]);

        if ( COMISION_HITBTC === undefined ) {
            var coms_hitbc = 0;
        }else{
            coms_hitbc = COMISION_HITBTC;
        }

        if ( COMISION_MERCADO === undefined ) {
            var coms_mercado = 0
        }else{
            coms_mercado = COMISION_MERCADO;
        }
        
        var mon_comision = MON_APLIC_COMISION;
        var precio_moneda = Meteor.call('LibroDeOrdenes', TIPO_CAMBIO);

        //if ( MON_SALTRAD === MON_B ) {
        if ( MON_SALTRAD === MON_C ) {

            Meteor.call("GuardarLogEjecucionTrader", "Estoy Verificando MON_SALTRAD === MON_B");


            if ( Monedas.find({ moneda : MON_B, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_base_act = 0
            }else{
                var moneda_base_act = Monedas.findOne({ moneda : MON_B });
                var saldo_moneda_base_act = SALDO_ACTUAL
            }

            if ( Monedas.find({ moneda : MON_C, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_coti_act = 0
            }else{
                var moneda_coti_act = Monedas.findOne({ moneda : MON_C });
                var saldo_moneda_coti_act = moneda_coti_act.saldo.tradeo.activo
            }



            var InversionTotal = CANT_INVER
            var nuevo_saldo_moneda_base_actual = ( saldo_moneda_base_act - CANT_INVER );
            var nuevo_saldo_moneda_coti_actual = (( CANT_INVER * precio_moneda )- coms_hitbc - coms_mercado + (saldo_moneda_coti_act * CANT_INVER ));


            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_base_act'"]+[saldo_moneda_base_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_coti_act'"]+[saldo_moneda_coti_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'precio_moneda'"]+[precio_moneda]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'CANT_INVER'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'InversionTotal'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_hitbc'"]+[coms_hitbc]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_mercado'"]+[coms_mercado]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_base_actual'"]+[nuevo_saldo_moneda_base_actual]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_coti_actual'"]+[nuevo_saldo_moneda_coti_actual]);
            Monedas.update({
                            moneda: MON_B
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_base_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});
            Monedas.update({
                            moneda: MON_C
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_coti_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});


            TempSaldoMoneda.insert({ moneda : MON_C, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_coti_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: COMISION_HITBTC, comision_mercado_aplicada : COMISION_MERCADO, saldo_final : nuevo_saldo_moneda_coti_actual })
            TempSaldoMoneda.insert({ moneda : MON_B, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_base_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: 0, comision_mercado_aplicada : 0, saldo_final : nuevo_saldo_moneda_base_actual })
            HistoralTransacciones.insert({ fecha : fecha, id : N_ID__ORDEN_CLIENT, tipo_cambio : TIPO_CAMBIO,tipo_transaccion : V_TipoOperaciont, moneda_base : MON_B, moneda_cotizacion : MON_C, monto : InversionTotal, precio_operacion : precio_moneda, estado : "Exitoso" });

        
        
        } else if ( MON_SALTRAD === MON_B ) {
            Meteor.call("GuardarLogEjecucionTrader", "Estoy Verificando MON_SALTRAD === MON_C");
            if ( Monedas.find({ moneda : MON_C, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_coti_act = 0
            }else{
                var moneda_coti_act = Monedas.findOne({ moneda : MON_C });
                var saldo_moneda_coti_act = SALDO_ACTUAL
            }
            if ( Monedas.find({ moneda : MON_B, "saldo.tradeo.activo" : { $exists: true } }).count() === 0 ) {
                var saldo_moneda_base_act = 0
            }else{
                var moneda_base_act = Monedas.findOne({ moneda : MON_B });
                var saldo_moneda_base_act = moneda_base_act.saldo.tradeo.activo
            }


            var InversionTotal = CANT_INVER + COMISION_HITBTC + COMISION_MERCADO;
            var nuevo_saldo_moneda_coti_actual = ( saldo_moneda_coti_act - InversionTotal);
            var nuevo_saldo_moneda_base_actual = (( CANT_INVER / precio_moneda ) + saldo_moneda_base_act ) ;

            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_base_act'"]+[saldo_moneda_base_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'saldo_moneda_coti_act'"]+[saldo_moneda_coti_act]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'precio_moneda'"]+[precio_moneda]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'CANT_INVER'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'InversionTotal'"]+[CANT_INVER]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_hitbc'"]+[coms_hitbc]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'coms_mercado'"]+[coms_mercado]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_base_actual'"]+[nuevo_saldo_moneda_base_actual]);
            Meteor.call("GuardarLogEjecucionTrader", [" Valor de 'nuevo_saldo_moneda_coti_actual'"]+[nuevo_saldo_moneda_coti_actual]);
            
            Monedas.update({
                            moneda: MON_C
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_coti_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});
            Monedas.update({
                            moneda: MON_B
                                },
                                {
                                    $set: {
                                            saldo: {
                                                tradeo: {
                                                    activo: nuevo_saldo_moneda_base_actual
                                                }
                                            }
                                        }
                                }, {"multi" : true,"upsert" : true});

            TempSaldoMoneda.insert({ moneda : MON_C, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_coti_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: COMISION_HITBTC, comision_mercado_aplicada : COMISION_MERCADO, saldo_final : nuevo_saldo_moneda_coti_actual })
            TempSaldoMoneda.insert({ moneda : MON_B, tipo_operacion : V_TipoOperaciont, saldo_inicial : saldo_moneda_base_act, monto_inversion : CANT_INVER, comision_hibtc_aplicada: 0, comision_mercado_aplicada : 0, saldo_final : nuevo_saldo_moneda_base_actual })
            HistoralTransacciones.insert({ fecha : fecha, id : N_ID__ORDEN_CLIENT, tipo_cambio : TIPO_CAMBIO,tipo_transaccion : V_TipoOperaciont, moneda_base : MON_B, moneda_cotizacion : MON_C, monto : InversionTotal, precio_operacion : precio_moneda, estado : "Exitoso" });
        }
        //Meteor.call('CalculoGanancia');
        console.log("         Inversion realizada");
        console.log(' ');
        console.log(' ');
    },

    'VerificarHistoricoEstadoOrden':function(ORDEN){
        Meteor.call('sleep',5000);
        //Maximo TiempoEspera = 6000
        TiempoEspera = 6000;
        // AGREGAR A URL LIMITE DE ORDENES A OBTENER
        Url_VerificarHistOrden = [HistOrdenes]+['?clientOrderId=']+[ORDEN];
        v_Estado_Orden = Meteor.call('ConexionGet', Url_VerificarHistOrden );
        var EstadoOrden=(v_Estado_Orden.data[0]);
        Url_HistOrdenIdTrdades = [HistOrdenes]+['/']+[EstadoOrden.id]+['/trades'];
        V_Desc_Orden = Meteor.call('ConexionGet', Url_HistOrdenIdTrdades );
        DescOrden = V_Desc_Orden.data[0];


        /*

        console.log('Valor de EstadoOrden', EstadoOrden);
        console.log("Valor de DescOrden", DescOrden);



        console.log('############################################');
        console.log(' ID: ', EstadoOrden.id);
        console.log(' ID ORDEN CLIENTE: ', EstadoOrden.clientOrderId);
        console.log(' TIPO_CAMBIO: ', EstadoOrden.symbol);
        console.log(' TIPO OPERACION: ', EstadoOrden.side);
        console.log(' ESTADO: ', EstadoOrden.status);
        console.log(' FORMA DE OPERACION: ', EstadoOrden.type);
        console.log(' CANTIDAD RECIBIDA: ', DescOrden.quantity);
        console.log(' PRECIO: ', DescOrden.price);
        console.log(' COMISION: ', DescOrden.fee);
        console.log(' ZONE HORARIA: ', EstadoOrden.timeInForce);
        console.log(' CANTIDAD ACUMULADA: ', EstadoOrden.cumQuantity);
        console.log(' FECHA OPERACION: ', DescOrden.timestamp);
        console.log('############################################');
        console.log(' ');

        */
        Estado = { 'Id': EstadoOrden.id, 'IdOrdenCliente': EstadoOrden.clientOrderId, 'TipoCambio': EstadoOrden.symbol, 'TipoOperacion': EstadoOrden.side, 'Estado':EstadoOrden.status, 'FormaDeOperacion': EstadoOrden.type,'CantidadRecibida': DescOrden.quantity, 'Precio': DescOrden.price, 'Comision': DescOrden.fee, 'Fecha': DescOrden.timestamp }

        return Estado;
    },

    'VerificarEstadoOrden':function(ORDEN){
        Meteor.call('sleep',5000);
        //Maximo TiempoEspera = 6000
        TiempoEspera = 6000;
        Url_VerificarOrden = [ordenes]+['?clientOrderId=']+[TiempoEspera];
        console.log('Valor de Url_VerificarOrden', Url_VerificarOrden)
        Estado_Orden = Meteor.call('ConexionGet', Url_VerificarOrden );

        var v_Estado_Orden=(Estado_Orden.data);      

        //console.log(v_transaccion);

        for (k = 0, len = v_Estado_Orden.length; k < len; k++) {
            console.log('############################################');
            Estado_Orden = v_Estado_Orden[k];
            Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[Estado_Orden.id]);
            Meteor.call("GuardarLogEjecucionTrader", [' ID ORDEN CLIENTE: ']+[Estado_Orden.clientOrderId]);
            Meteor.call("GuardarLogEjecucionTrader", [' TIPO_CAMBIO: ']+[Estado_Orden.symbol]);
            Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACION: ']+[Estado_Orden.side]);
            Meteor.call("GuardarLogEjecucionTrader", [' ESTADO: ']+[Estado_Orden.status]);
            Meteor.call("GuardarLogEjecucionTrader", [' TIPO: ']+[Estado_Orden.type]);
            Meteor.call("GuardarLogEjecucionTrader", [' ZONE HORARIA: ']+[Estado_Orden.timeInForce]);
            Meteor.call("GuardarLogEjecucionTrader", [' CANTIDAD: ']+[Estado_Orden.quantity]);
            Meteor.call("GuardarLogEjecucionTrader", [' postOnly: ']+[Estado_Orden.postOnly]);
            Meteor.call("GuardarLogEjecucionTrader", [' CANTIDAD ACUMULADA: ']+[Estado_Orden.cumQuantity]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA CREACION: ']+[Estado_Orden.createdAt]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA ACTUALIZACION: ']+[Estado_Orden.updatedAt]);
            console.log('############################################');
            console.log(' ');
        };

        var Estado = Estado_Orden.status;
        return Estado;
    },

    'borrarOrden':function(TIPO_CAMBIO){  //DELETE

        console.log('############################################');
        console.log('Borrando una nueva orden');

        var datos = new Object();
        datos.symbol=TIPO_CAMBIO;

        var url = [ordenes];

        OrdenBorrada = Meteor.call('ConexionDel',url, datos);


        Meteor.call("GuardarLogEjecucionTrader", ["Valor de OrdenBorrada"]+[OrdenBorrada]);
    },

    'ConsultaTraderGuardados':function(TIPO_CAMBIO){

        if ( OperacionesCompraVenta.find({ tipo_cambio:TIPO_CAMBIO }, {}).count() === 0 ){
            console.log('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", ['          TIPO DE CAMBIO: ']+[TIPO_CAMBIO]);
            console.log('--------------------------------------------');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", [' Sin datos en BD local de este tipo_cambio: ']+[TIPO_CAMBIO]);
            console.log(' ');
            console.log('--------------------------------------------');
        }
        else {
            console.log('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", ['          TIPO DE CAMBIO: ']+[TIPO_CAMBIO]);
            console.log('--------------------------------------------');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", ' Datos encontrados');
            console.log('                    Verificando... ');
            console.log(' ');
            console.log('--------------------------------------------');
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
                /*if ( debug_activo === 1) {
                    Meteor.call("GuardarLogEjecucionTrader", [' ConsultaTraderGuardados: ID de Transaccion recuperado con exito: ']+[v_INT_VAL_TIPO_CAMBIO.max_id]);
                };*/
            };

            return v_INT_VAL_TIPO_CAMBIO.max_id;
        };
    },

    'TipoCambioDisponibleCompra':function(MONEDA, SALDO_MONEDA_EQUIV){
        Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra -- Valores recibidos, MONEDA: ']+[MONEDA] +[' SALDO_MONEDA_EQUIV: ']+[SALDO_MONEDA_EQUIV]);
        var Vset = new Set();

        
        try
        {
            var Valores_TiposDeCambiosRankear = TiposDeCambios.find( { $or : [{"moneda_base" : MONEDA },{ "moneda_cotizacion" : MONEDA }],  "min_compra_equivalente" : { $lt : SALDO_MONEDA_EQUIV }}).fetch();
            //console.log("Valor de Valores_TiposDeCambiosRankear", Valores_TiposDeCambiosRankear);

        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };

        for (CTMCB = 0, tamanio_Valores_TiposDeCambiosRankear = Valores_TiposDeCambiosRankear.length; CTMCB < tamanio_Valores_TiposDeCambiosRankear; CTMCB++) {
            var V_Valores_TiposDeCambiosRankear = Valores_TiposDeCambiosRankear[CTMCB];
            //console.log("Valor de V_Valores_TiposDeCambiosRankear", V_Valores_TiposDeCambiosRankear)
            //Meteor.call("GuardarLogEjecucionTrader", [' Valore de V_Valores_TiposDeCambiosRankear: ']+[V_Valores_TiposDeCambiosRankear]);
                    
            if ( MONEDA == V_Valores_TiposDeCambiosRankear.moneda_base ) {
                var accion = 1
            } else if (MONEDA == V_Valores_TiposDeCambiosRankear.moneda_cotizacion ){
                var accion = 2
            }

            TempTiposCambioXMoneda.update({ "tipo_cambio": V_Valores_TiposDeCambiosRankear.tipo_cambio, 
                                             "accion": accion }, {    
                                            $set: {
                                                    "tipo_cambio": V_Valores_TiposDeCambiosRankear.tipo_cambio,
                                                    "moneda_base": V_Valores_TiposDeCambiosRankear.moneda_base, 
                                                    "accion": accion,
                                                    "moneda_cotizacion" : V_Valores_TiposDeCambiosRankear.moneda_cotizacion, 
                                                    "saldo_moneda_tradear" : SALDO_MONEDA_EQUIV, 
                                                    "moneda_saldo" : MONEDA, 
                                                    "activo" : V_Valores_TiposDeCambiosRankear.activo,
                                                    "comision_hitbtc" : V_Valores_TiposDeCambiosRankear.comision_hitbtc,
                                                    "comision_mercado" : V_Valores_TiposDeCambiosRankear.comision_mercado,
                                                    "min_compra" : V_Valores_TiposDeCambiosRankear.min_compra,
                                                    "moneda_apli_comision": V_Valores_TiposDeCambiosRankear.moneda_apli_comision,
                                                    "valor_incremento" : V_Valores_TiposDeCambiosRankear.valor_incremento,
                                                    estado : V_Valores_TiposDeCambiosRankear.estado
                                                }
                                            }, 
                                            {"multi" : true,"upsert" : true});
        };
        return Valores_TiposDeCambiosRankear;
    },

    'ListaTradeoActual':function( TIPO_CAMBIO, VALOR_EJEC ){

        console.log('############################################');
        console.log(' ');
        /*
        //consultamos el último id_transaccion de este Símbolo
        if ( debug_activo === 1) {
            //Meteor.call("GuardarLogEjecucionTrader", ['"ListaTradeoActual" consultando último id_transaccion del tipo_cambio: ']+[TIPO_CAMBIO]);
        };

        var Val_trad = (Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO));
        var Val_trad_tipo_cambio = (Val_trad);

        //console.log("Valor de Val_trad_tipo_cambio", Val_trad_tipo_cambio)

        if ( debug_activo === 1) {
            //Meteor.call("GuardarLogEjecucionTrader", [' ListaTradeoActual: Valor recuperado de la funcion "ConsultaTraderGuardados" : ']+[Val_trad_tipo_cambio]);
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
        */
        var url_tradeos_parcial= ['from=0&by=trade_id&sort=DESC&start_index=0&limit=']+[cant_traders]+['&format_numbers=number'];
        var url_tradeos_completa = [publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeos_parcial];        
        var v_tradeos = Meteor.call("ConexionGet", url_tradeos_completa);
        var trad_mon = (v_tradeos.data);
        console.log("Valor de trad_mon:", trad_mon);



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
                    Meteor.call("GuardarLogEjecucionTrader", ['    Verificando Símbolo tradeo: ']+[TIPO_CAMBIO]);
                    console.log('############################################');

                    if ( v_TradActDat === undefined ) {
                        console.log('############################################');
                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                        console.log('############################################');
                    }
                    else {
                        Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[v_TradActDat.timestamp]);
                        Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[v_TradActDat.id]);
                        Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[v_TradActDat.price]);
                        Meteor.call("GuardarLogEjecucionTrader", [' CANTIDAD: ',]+[v_TradActDat.quantity]);
                        Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[v_tipo_operacion_act]); 
                    }

                    console.log('############################################');
                    console.log(' ');
                    break;
                case 2:
                    if ( v_TradActDat === undefined ) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 1 ');
                        console.log('############################################');
                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                        console.log('############################################');
                    }
                    else {
                        /*if ( TiposDeCambios.find( {tipo_cambio : TIPO_CAMBIO, "periodo1.Base.precio" : { $exists: true } }).count() === 0 ){
                        	if ( debug_activo === 1) {
                            	Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 2 - case 1');
                            }
                                   
                            var PeriodoFecha = v_TradActDat.timestamp;
                            var PeriodoId_hitbtc = v_TradActDat.id;
                            var PeriodoPrecio = Number(v_TradActDat.price);
                            switch (v_TradActDat.side){
                            	case 'buy':
                                	var PeriodoTipoOperacion = 'COMPRA';
                                break;
                                case 'sell':
                                	var PeriodoTipoOperacion = 'VENTA';
                                break;
                                default:
                                	Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradAntDat.side]);
                                    var PeriodoTipoOperacion = v_TradActDat.side;
                            }
                                   
                            var PeriodoFechaAct = v_TradActDat.timestamp;
                            var PeriodoId_hitbtcAct = v_TradActDat.id;
                            var PeriodoPrecioAct = Number(v_TradActDat.price);
                            var PeriodoTipoOperacionAct = v_tipo_operacion_act;


                            OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtc, 
                                    						fecha : PeriodoFecha, 
                                    						tipo_cambio : TIPO_CAMBIO, 
                                    						precio : PeriodoPrecio, 
                                    						tipo_operacion : PeriodoTipoOperacion, 
                                    						muestreo : {periodo1 : false, 
                                    									periodo2 : false, 
                                    									periodo3 : false, 
                                    									periodo4 : false, 
                                    									periodo5 : false, 
                                    									periodo6 : false } 
                                    								});
                            /*
                            TiposDeCambios.update(	{ tipo_cambio : TIPO_CAMBIO },
                                    				{ $set:{	"periodo1.Base.id_hitbtc": PeriodoId_hitbtc, 
                                    							"periodo1.Base.fecha": PeriodoFecha,
                                    							"periodo1.Base.precio" : PeriodoPrecio, 
                                    							"periodo1.Base.tipo_operacion": PeriodoTipoOperacion,
                                    							"periodo1.Cotizacion.id_hitbtc": PeriodoId_hitbtc, 
                                    							"periodo1.Cotizacion.fecha": PeriodoFecha,
                                    							"periodo1.Cotizacion.precio" : PeriodoPrecio, 
                                    							"periodo1.Cotizacion.tipo_operacion": PeriodoTipoOperacion}}, 
                                    				{ "multi" : true,"upsert" : true });*//*
                        }else{*/






                        //try{
                        /*        var PeriodoFechaAct = v_TradActDat.timestamp;
                                var PeriodoId_hitbtcAct = v_TradActDat.id;
                                var PeriodoPrecioAct = Number(v_TradActDat.price);
                                var PeriodoCantidad = v_TradActDat.quantity;
                                var PeriodoTipoOperacionAct = v_tipo_operacion_act;
                                OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAct, 
                                                                fecha : PeriodoFechaAct, 
                                                                tipo_cambio : TIPO_CAMBIO, 
                                                                precio : PeriodoPrecioAct, 
                                                                tipo_operacion : PeriodoTipoOperacionAct, 
                                                                muestreo : {periodo1 : false, 
                                                                            periodo2 : false, 
                                                                            periodo3 : false, 
                                                                            periodo4 : false, 
                                                                            periodo5 : false, 
                                                                            periodo6 : false } 
                                                                });*/
                        
                        console.log(' 1111111');
                        if ( OperacionesCompraVenta.find( { tipo_cambio : TIPO_CAMBIO }).count() === 0 ){
                            OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAct, 
                                                            tipo_cambio : TIPO_CAMBIO, 
                                                            fecha : PeriodoFechaAct, 
                                                            precio : PeriodoPrecioAct, 
                                                            tipo_operacion : PeriodoTipoOperacionAct, 
                                                            muestreo : {periodo1 : false, 
                                                                        periodo2 : false, 
                                                                        periodo3 : false, 
                                                                        periodo4 : false, 
                                                                        periodo5 : false, 
                                                                        periodo6 : false } 
                                                                    });
                        }else{
                        console.log(' 1111111');
                        OperacionesCompraVenta.update(  { tipo_cambio : TIPO_CAMBIO },
                                                        {$set:{ id_hitbtc: PeriodoId_hitbtcAct, 
                                                                fecha : PeriodoFechaAct,
                                                                precio : PeriodoPrecioAct, 
                                                                tipo_operacion : PeriodoTipoOperacionAct, 
                                                                muestreo : {periodo1 : false, 
                                                                            periodo2 : false, 
                                                                            periodo3 : false, 
                                                                            periodo4 : false, 
                                                                            periodo5 : false, 
                                                                            periodo6 : false  }}
                                                        },
                                                        {"multi" : true,"upsert" : true});
                        }



                        //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});

                        Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[PeriodoPrecioAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [' CANTIDAD: ',]+[PeriodoCantidad]);
                        Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAct]); 

                        console.log('############################################');
                        console.log(' ');
                        /*}*/
                    }
                    break;
                default:
                    Meteor.call("GuardarLogEjecucionTrader", ' Valor de tipo consulta no definida ');
            }
        };
    },

    //'EvaluarTendencias':function( TIPOCAMBIO, TIPO_MUESTREO, TIPO_MONEDA_SALDO){
    'EvaluarTendencias':function( TIPOCAMBIO, MONEDASALDO ){

        // Formula de deprecación
        // TENDENCIA = ((valor actual - valor anterior) / valor anterior) * 100
        // Si es positivo la moneda base se está depreciando y la moneda en cotizacion se está apreciando
        // Si es negativa la moneda base de está apreciando y la moneda en cotizacion se está depreciando
        // Cuando se está evaluando la moneda a comprar si el resultado es + esa moneda esta en alza sino está a la baja
        // Cuando se está evaluando la moneda invertida si el resultado es + esa moneda esta en baja sino está a la alza
        //console.log("Estoy en EvaluarTendencias 1");
        if ( debug_activo === 1) {
            Meteor.call("GuardarLogEjecucionTrader", ' EvaluarTendencias: Paso 5 ');
            Meteor.call("GuardarLogEjecucionTrader", [" Tipo de Cambio recibido"]+[TIPOCAMBIO]+[" MONEDA_SALDO: "]+[MONEDASALDO]);
            Meteor.call("GuardarLogEjecucionTrader", [" Tipo de Cambio recibido: "]+[TIPOCAMBIO]);
        }


	    //console.log("Estoy en EvaluarTendencias 2");
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
                    var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO }}, { $sort: { id_hitbtc : - 1 } }, { $limit: 1 }]);
                    var LCEA = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContEstadoActivo", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
                    var LCEAA = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContAuxiliarEstadoActivo", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
                    var LCEV = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContEstadoVerificando", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
                    var LCEAV = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContAuxiliarEstadoVerificando", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
                    var VTPCBM = TiposDeCambios.find({ tipo_cambio : TIPOCAMBIO }).fetch();
                }
                catch (error){    
                    Meteor.call("ValidaError", error, 2);
                };
                var RegAnt = TradAnt
                var RegAct = TransProcesar[0]

                //console.log("Valores Conseguidos de RegAnt: ", RegAnt);
                //console.log("Valores Conseguidos de RegAct: ", RegAct);

                var MonBase =  RegAnt.moneda_base;
                var MonCoti =  RegAnt.moneda_cotizacion;

                var LimtContEdoAct = LCEA[0].valor;
                var LimtContAuxEdoAct = LCEAA[0].valor;
                var LimtContEdoVer = LCEV[0].valor;
                var LimtContAuxEdoVer = LCEAV[0].valor;

                var PeriodoFechaAntMB = RegAnt.periodo1.Base.fecha;
                var PeriodoId_hitbtcAntMB = RegAnt.periodo1.Base.id_hitbtc;
                var PeriodoPrecioAntMB = Number(RegAnt.periodo1.Base.precio);
                var PeriodoTipoOperacionAntMB = RegAnt.periodo1.Base.tipo_operacion;

                var PeriodoFechaAntMC = RegAnt.periodo1.Cotizacion.fecha;
                var PeriodoId_hitbtcAntMC = RegAnt.periodo1.Cotizacion.id_hitbtc;
                var PeriodoPrecioAntMC = Number(RegAnt.periodo1.Cotizacion.precio);
                var PeriodoTipoOperacionAntMC = RegAnt.periodo1.Cotizacion.tipo_operacion;
                
                var EstadoTipoCambio = RegAnt.estado;
                var ContEstadoTipoCambioPrinc = RegAnt.c_estado_p;
                var ContEstadoTipoCambioAux = RegAnt.c_estado_a;
                                    
                var PeriodoFechaAct = RegAct.fecha;
                var PeriodoId_hitbtcAct = RegAct.id_hitbtc;
                var PeriodoPrecioAct = Number(RegAct.precio);
                var PeriodoTipoOperacionAct = RegAct.tipo_operacion;

                    


                console.log('--------------------------------------------');
                Meteor.call("GuardarLogEjecucionTrader", ['          TIPO DE CAMBIO: ']+[TIPOCAMBIO]);
                console.log('--------------------------------------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", '-------- TRANSACCION ANTERIOR MB  ---------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAntMB]);
                Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAntMB]);
                Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[PeriodoPrecioAntMB.toString()]);
                Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAntMB]);
                //Meteor.call("GuardarLogEjecucionTrader", [' COMISION: ']+[PeriodoTipoOperacionAntMB]);
                console.log('--------------------------------------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", '-------- TRANSACCION ANTERIOR MC  ---------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAntMC]);
                Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAntMC]);
                Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[PeriodoPrecioAntMC.toString()]);
                Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAntMC]);
                //Meteor.call("GuardarLogEjecucionTrader", [' COMISION: ']+[PeriodoTipoOperacionAntMB]);
                console.log('--------------------------------------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", '------------ ULTIMA TRANSACCION ------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAct]);
                Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAct]);
                Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[PeriodoPrecioAct.toString()]);
                Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAct]);
                console.log('--------------------------------------------');
                Meteor.call("GuardarLogEjecucionTrader", '          CALCULANDO TENDENCIA ');
                console.log('--------------------------------------------');
                console.log(' ');


                var ValPrecAntMB = PeriodoPrecioAntMB;
                var ValPrecAntMC = PeriodoPrecioAntMB;
                var ValPrecAct = PeriodoPrecioAct;

                var ProcenApDpMB = ((( ValPrecAct - ValPrecAntMB ) / ValPrecAntMB ) * 100 ) ;
                var ProcenApDpMC = ((( ValPrecAct - ValPrecAntMC ) / ValPrecAntMC ) * 100 ) ;

                //console.log('Valor de MONEDASALDO:', [MONEDASALDO]);
                //console.log('Valor de MonBase:', [MonBase]);
                //console.log('Valor de MonCoti:', [MonCoti]);

                try{
                    if ( MONEDASALDO = MonBase ){
                        var TMA = 1;
                        if ( ValPrecAct > ValPrecAntMB ) {

                           
                            var TendenciaMonedaBase = ProcenApDpMB
                            //var TendenciaMonedaCotizacion = ( ProcenApDpMC * -1 )

                            Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion.toFixed(4)]);
                            console.log('--------------------------------------------');
                            
                            switch( EstadoTipoCambio ){
                                case "V":
                                    Meteor.call("GuardarLogEjecucionTrader", " ESTOY EN EL IF 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'V'");
                                    if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                        var ValorEstadoTipoCambio = "V";
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                    }
                                    else if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }
                                    else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }
                                    else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    };
                                break;
                                case "I":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL IF 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'I'");
                                    var ContEstadoTipoCambioPrinc = 0;
                                    var ContEstadoTipoCambioAux = 0;
                                    var ValorEstadoTipoCambio = "V"
                                    var ValorActivo = "S";

                                    //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                break;
                                case "A":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL IF 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'A'");
                                    var ContEstadoTipoCambioPrinc = 0;
                                    var ContEstadoTipoCambioAux = 0;
                                    var ValorEstadoTipoCambio = "A"
                                    var ValorActivo = "S";

                                    //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                break;
                            };
                            
                            OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                        }
                        else if ( ValPrecAct <= ValPrecAntMB ){
                            //console.log( "Acá estoy 2");
                            /*if ( MONEDASALDO = MonBase ) {
                                //var TendenciaMonedaBase = ( ProcenApDp * -1 )
                                //var TendenciaMonedaCotizacion = ProcenApDp
                                var TendenciaMonedaBase = ( ProcenApDpMB * -1 )
                                var TendenciaMonedaCotizacion = ProcenApDpMC
                            } 
                            else if ( MONEDASALDO = MonCoti ) {
                                //var TendenciaMonedaBase = ProcenApDp
                                //var TendenciaMonedaCotizacion = ( ProcenApDp * -1 )
                                var TendenciaMonedaBase = ProcenApDpMB
                                var TendenciaMonedaCotizacion = ( ProcenApDpMC * -1 )
                            }*/
                            
                            var TendenciaMonedaBase = ( ProcenApDpMB * -1 )
                            var TendenciaMonedaCotizacion = ProcenApDpMC

                            Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion.toFixed(4)]);
                            console.log('--------------------------------------------');
                            
                            switch( EstadoTipoCambio ){
                                case "V":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL ELSE 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'V'");
                                    if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    };
                                break;
                                case "I":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL ELSE 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'I'");
                                    if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct ){
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }
                                break;
                                case "A":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL ELSE 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'A'");
                                    if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoAct ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoAct ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, parseFloat(TendenciaMonedaBase.toFixed(4)));
                                        
                                    };
                                break;
                            };

                            OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                        }
                    }
                    else if ( MONEDASALDO = MonCoti ) {
                        var TMA = 2;
                        if ( ValPrecAct > ValPrecAntMC ) {
                            //console.log( "Acá estoy 3");
                            /*if ( MONEDA_SALDO = MonBase ) {
                                //var TendenciaMonedaBase = ProcenApDp
                                //var TendenciaMonedaCotizacion = ( ProcenApDp * -1 )
                                var TendenciaMonedaBase = ProcenApDpMB
                                var TendenciaMonedaCotizacion = ( ProcenApDpMC * -1 )
                            } 
                            else if ( MONEDA_SALDO = MonCoti ) {
                                //var TendenciaMonedaBase = ( ProcenApDp * -1 )
                                //var TendenciaMonedaCotizacion = ProcenApDp
                                var TendenciaMonedaBase = ( ProcenApDpMB * -1 )
                                var TendenciaMonedaCotizacion = ProcenApDpMC
                            }*/

                            //var TendenciaMonedaBase = ( ProcenApDpMB * -1 )
                            var TendenciaMonedaCotizacion = ProcenApDpMC

                            Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion.toFixed(4)]);
                            console.log('--------------------------------------------');
                            
                            switch( EstadoTipoCambio ){
                                case "V":
                                    Meteor.call("GuardarLogEjecucionTrader", " ESTOY EN EL IF 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'V'");
                                    if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                        var ValorEstadoTipoCambio = "V";
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    }else if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    }else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    }else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    };
                                break;
                                case "I":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL IF 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'I'");
                                    var ContEstadoTipoCambioPrinc = 0;
                                    var ContEstadoTipoCambioAux = 0;
                                    var ValorEstadoTipoCambio = "V"
                                    var ValorActivo = "S";

                                    //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                break;
                                case "A":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL IF 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'A'");
                                    var ContEstadoTipoCambioPrinc = 0;
                                    var ContEstadoTipoCambioAux = 0;
                                    var ValorEstadoTipoCambio = "A"
                                    var ValorActivo = "S";

                                    //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                break;
                            };
                            
                            OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                        }
                        else if ( ValPrecAct <= ValPrecAntMC ){
                            //console.log( "Acá estoy 4");

                            //var TendenciaMonedaBase = ProcenApDpMB
                            var TendenciaMonedaCotizacion = ( ProcenApDpMC * -1 )

                            Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion.toFixed(4)]);
                            console.log('--------------------------------------------');

                            switch( EstadoTipoCambio ){
                                case "V":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL ELSE 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'V'");
                                    if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    };
                                break;
                                case "I":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL ELSE 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'I'");
                                    if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct ){
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }
                                break;
                                case "A":
                                    Meteor.call("GuardarLogEjecucionTrader", "ESTOY EN EL ELSE 'ValPrecAct > ValPrecAnt' SWITCH EstadoTipoCambio CASE 'A'");
                                    if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoAct ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoAct ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        
                                    };
                                break;
                            };

                            OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                        }
                    }
                }
                catch(error){
                    Meteor.call("ValidaError", error, 2);
                }
    },

    'ValidarRanking': function(MONEDA){
        TmpTipCambioXMonedaReord.remove({ moneda_saldo : MONEDA });
        try{
            var TmpTCMB = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, accion : 1 }}, { $sort: { "periodo1.Base.tendencia_moneda_base" : -1 }}, { $limit: 3 } ]);
            for (CTMCB = 0, T_TmpTCMB = TmpTCMB.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMB = TmpTCMB[CTMCB];
                //console.log("Valor de V_TmpTCMB", V_TmpTCMB)
                TmpTipCambioXMonedaReord.insert({ "tipo_cambio": V_TmpTCMB.tipo_cambio,
                                                    "moneda_base": V_TmpTCMB.moneda_base,
                                                    "accion": V_TmpTCMB.accion,
                                                    "moneda_cotizacion" : V_TmpTCMB.moneda_cotizacion, 
                                                    "saldo_moneda_tradear" : V_TmpTCMB.saldo_moneda_tradear,
                                                    "moneda_saldo" : V_TmpTCMB.moneda_saldo,
                                                    "activo" : V_TmpTCMB.activo,
                                                    "comision_hitbtc" : V_TmpTCMB.comision_hitbtc,
                                                    "comision_mercado" : V_TmpTCMB.comision_mercado,
                                                    "min_compra" : V_TmpTCMB.min_compra,
                                                    "moneda_apli_comision": V_TmpTCMB.moneda_apli_comision,
                                                    "valor_incremento" : V_TmpTCMB.valor_incremento,
                                                    "estado" : V_TmpTCMB.estado,
                                                    "tendencia" : V_TmpTCMB.periodo1.Base.tendencia_moneda_base });
           
            };

            var TmpTCMC = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, accion : 2 }}, { $sort: { "periodo1.Base.tendencia_moneda_cotizacion" : -1 }}, { $limit: 3 } ]);
            for (CTMCB = 0, T_TmpTCMB = TmpTCMC.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMC = TmpTCMC[CTMCB];
                //console.log("Valor de V_TmpTCMC", V_TmpTCMC)
                TmpTipCambioXMonedaReord.insert({ "tipo_cambio": V_TmpTCMC.tipo_cambio,
                                                    "moneda_base": V_TmpTCMC.moneda_base,
                                                    "accion": V_TmpTCMC.accion,
                                                    "moneda_cotizacion" : V_TmpTCMC.moneda_cotizacion, 
                                                    "saldo_moneda_tradear" : V_TmpTCMC.saldo_moneda_tradear,
                                                    "moneda_saldo" : V_TmpTCMC.moneda_saldo,
                                                    "activo" : V_TmpTCMC.activo,
                                                    "comision_hitbtc" : V_TmpTCMC.comision_hitbtc,
                                                    "comision_mercado" : V_TmpTCMC.comision_mercado,
                                                    "min_compra" : V_TmpTCMC.min_compra,
                                                    "moneda_apli_comision": V_TmpTCMC.moneda_apli_comision,
                                                    "valor_incremento" : V_TmpTCMC.valor_incremento,
                                                    "estado" : V_TmpTCMC.estado,
                                                    "tendencia" : V_TmpTCMC.periodo1.Base.tendencia_moneda_cotizacion });
            };

        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };
    },

    'ValidaPropTipoCambiosValidados': function ( MONEDA, LIMITE_AP_DEP ){

        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' *CALCULANDO RANKING DE LOS TIPOS DE CAMBIO*');
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['             MONEDA: ']+[MONEDA]);
        console.log('############################################');
        console.log(' ');


        var CPTC = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA,"tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: 3 }, { $count: "CantidadDeTiposDeCambios" } ]);
        var RTDC = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA,"tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: 3 } ]);



        if ( CPTC[0] === undefined ){
            var CantPropTipoCambios = 0
        }else{
            var CantPropTipoCambios = CPTC[0].CantidadDeTiposDeCambios;
        }

        var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
        var PTDC = PTC[0];
        console.log("--------------------------------------------")
        Meteor.call("GuardarLogEjecucionTrader", ["  Total de Tipos de Cambio Detectados: "]+[CantPropTipoCambios]);
        console.log("--------------------------------------------")
        console.log("                Analizando ..... ");

        var NuevoSaldoCalculado = 0
        var CantPropTipoCambiosValidados = 0

                switch (CantPropTipoCambios){
                    case 0:
                        CantPropTipoCambiosValidados = 0;
                    break;
                    case 1:
                        Meteor.call("GuardarLogEjecucionTrader", " ACÁ ESTOY VALIDANDO 1 TIPO DE CAMBIO");

                        //console.log(" VALOR  DE RTDC", RTDC)

                        for (CRTC11 = 0, TRTC11 = RTDC.length; CRTC11 < TRTC11; CRTC11++) {
                            TCR = RTDC[CRTC11];

                            SaldoVerificar = TCR.saldo_moneda_tradear
                            ValorMinimoCompra = TCR.min_compra;
                            ValorComisionHBTC = TCR.comision_hitbtc;
                            ValorComisionMerc = TCR.comision_mercado;
                            ValorMonedaSaldo = TCR.moneda_saldo;
                            ValorMonedaApCom = TCR.moneda_apli_comision;
                            var MonCBas = TCR.moneda_base
                            var MonCoti = TCR.moneda_cotizacion
                            /*
                            console.log(" Valor de ValorMinimoCompra", ValorMinimoCompra)
                            console.log(" Valor de ValorComisionHBTC", ValorComisionHBTC)
                            console.log(" Valor de ValorComisionMerc", ValorComisionMerc)
                            console.log(" Valor de ValorMonedaSaldo", ValorMonedaSaldo)
                            console.log(" Valor de ValorMonedaApCom", ValorMonedaApCom)
                            console.log("Valor de MonCBas", MonCBas);
                            console.log("Valor de MonCoti", MonCoti);
                            console.log("Valor de ValorMonedaSaldo", ValorMonedaSaldo);
                            */
                            if ( MonCBas === ValorMonedaSaldo ) {
                                var SaldoInvertir = TCR.saldo_moneda_tradear*PTDC.valor.p11;
                                if ( SaldoInvertir >= ValorMinimoCompra ) {
                                    CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    saldoInicial1 = SaldoVerificar
                                    saldoInversionFinal1 = SaldoInvertir
                                    NuevoSaldoCalculado1 = NuevoSaldoCalculado
                                }
                                Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoInvertir"]+[SaldoInvertir]);
                            } else if ( MonCoti === ValorMonedaSaldo ) {

                                var SaldoInvertir = TCR.saldo_moneda_tradear*PTDC.valor.p11;
                                Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoInvertir"]+[SaldoInvertir]);
                                var comision1 = ValorComisionHBTC * SaldoInvertir
                                Meteor.call("GuardarLogEjecucionTrader", ["Valor de comision1"]+[comision1]);
                                var comision2 = ValorComisionMerc * SaldoInvertir
                                Meteor.call("GuardarLogEjecucionTrader", ["Valor de comision2"]+[comision2]);
                                var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                                Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoInverCalculado"]+[SaldoInverCalculado]);

                                if ( SaldoInverCalculado >= ValorMinimoCompra ) {
                                    CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    saldoInversionFinal1 = SaldoInverCalculado
                                    NuevoSaldoCalculado1 = NuevoSaldoCalculado
                                    COM11 = comision1
                                    COM21 = comision2
                                }
                                Meteor.call("GuardarLogEjecucionTrader", ["Valor de CantPropTipoCambiosValidados"]+[CantPropTipoCambiosValidados]);
                            }
                        }
                    break;
                    case 2:
                        Meteor.call("GuardarLogEjecucionTrader", ' ACÁ ESTOY VALIDANDO 2 TIPOS DE CAMBIO');
                        //console.log("Valor de CantPropTipoCambiosValidados", CantPropTipoCambiosValidados);
                        //console.log("Valor de RTDC", RTDC);

                                    
                        for (CRTC12 = 0, TRTC12 = RTDC.length; CRTC12 < TRTC12; CRTC12++) {
                            var TCR = RTDC[CRTC12];
                            var ValorMinimoCompra = TCR.min_compra;
                            var ValorComisionHBTC = TCR.comision_hitbtc;
                            var ValorComisionMerc = TCR.comision_mercado;
                            var ValorMonedaSaldo = TCR.moneda_saldo;
                            var ValorMonedaApCom = TCR.moneda_apli_comision;
                            var MonCBas = TCR.moneda_base
                            var MonCoti = TCR.moneda_cotizacion

                            //console.log("Valor de TCR", TCR);
                            console.log("Valor de CRTC12", CRTC12);

                            switch (CRTC12){
                                case 0:
                                    var SaldoVerificar = RTDC[CRTC12].saldo_moneda_tradear
                                    Meteor.call("GuardarLogEjecucionTrader", " ACÁ ESTOY 1");
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorMinimoCompra"]+[ValorMinimoCompra]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorComisionHBTC"]+[ValorComisionHBTC]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorComisionMerc"]+[ValorComisionMerc]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorMonedaSaldo"]+[ValorMonedaSaldo]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorMonedaApCom"]+[ValorMonedaApCom]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de MonCBas"]+[MonCBas]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de MonCoti"]+[MonCoti]);
                                    
                                    if ( MonCBas === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el if');
                                        Meteor.call("GuardarLogEjecucionTrader", ["% configurado"]+[PTDC.valor.p13]);
                                        var SaldoInvertir = TCR.saldo_moneda_tradear*PTDC.valor.p12;

                                        Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        NuevoSaldoCalculado = SaldoVerificar - SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", ["Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);
                                        if ( SaldoInvertir >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInicial1 = TCR.saldo_moneda_tradear
                                            saldoInversionFinal1 = SaldoInvertir
                                            NuevoSaldoCalculado1 = NuevoSaldoCalculado
                                        }
                                    } else if ( MonCoti === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el ifelse');
                                        Meteor.call("GuardarLogEjecucionTrader", ["% configurado"]+[PTDC.valor.p13]);
                                        var SaldoInvertir = TCR.saldo_moneda_tradear*PTDC.valor.p12;
                                        Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        var comision1 = ValorComisionHBTC * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision1"]+[comision1]);
                                        var comision2 = ValorComisionMerc * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", ["Valor de comision2"]+[comision2]);
                                        var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                                        Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoInverCalculado"]+[SaldoInverCalculado]);
                                        NuevoSaldoCalculado = SaldoVerificar - SaldoInverCalculado

                                        if ( SaldoInverCalculado >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInversionFinal1 = SaldoInverCalculado
                                            NuevoSaldoCalculado1 = NuevoSaldoCalculado
                                            COM11 = comision1
                                            COM21 = comision2
                                        }
                                    }
                                    
                                    Meteor.call("GuardarLogEjecucionTrader", ["Valor de CantPropTipoCambiosValidados"]+[CantPropTipoCambiosValidados]);
                                break;
                                case 1:
                                    Meteor.call("GuardarLogEjecucionTrader", ' ACÁ ESTOY 2');
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado Recibido"]+[NuevoSaldoCalculado]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorMinimoCompra"]+[ValorMinimoCompra]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorComisionHBTC"]+[ValorComisionHBTC]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorComisionMerc"]+[ValorComisionMerc]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorMonedaSaldo"]+[ValorMonedaSaldo]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de ValorMonedaApCom"]+[ValorMonedaApCom]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de MonCBas"]+[MonCBas]);
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de MonCoti"]+[MonCoti]);
                                    
                                    if ( MonCBas === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el if');
                                        Meteor.call("GuardarLogEjecucionTrader", ["% configurado"]+[PTDC.valor.p23]);
                                        var SaldoInvertir = NuevoSaldoCalculado*PTDC.valor.p22;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInvertir",]+[SaldoInvertir]);
                                        NuevoSaldoCalculado = NuevoSaldoCalculado - SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);

                                        if ( SaldoInvertir >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInversionFinal2 = SaldoInvertir
                                            NuevoSaldoCalculado2 = NuevoSaldoCalculado
                                        }
                                    } else if ( MonCoti === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el ifelse');
                                        Meteor.call("GuardarLogEjecucionTrader", [" % configurado"]+[PTDC.valor.p23]);
                                        var SaldoInvertir = NuevoSaldoCalculado*PTDC.valor.p22;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        var comision1 = ValorComisionHBTC * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision1"]+[comision1]);
                                        var comision2 = ValorComisionMerc * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision2"]+[comision2]);
                                        var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInverCalculado"]+[SaldoInverCalculado]);
                                        NuevoSaldoCalculado = NuevoSaldoCalculado - SaldoInverCalculado
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);

                                        if ( SaldoInverCalculado >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInicial2 = NuevoSaldoCalculado
                                            saldoInversionFinal2 = SaldoInverCalculado
                                            NuevoSaldoCalculado2 = NuevoSaldoCalculado
                                            COM12 = comision1
                                            COM22 = comision2
                                        }
                                    }
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de CantPropTipoCambiosValidados"]+[CantPropTipoCambiosValidados]);
                                break;
                            }
                        }
                    break;
                    case 3:
                        Meteor.call("GuardarLogEjecucionTrader", ' ACÁ ESTOY VALIDANDO 3 TIPOS DE CAMBIO');
                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de CantPropTipoCambiosValidados"]+[CantPropTipoCambiosValidados]);


                        for (CRTC13 = 0, TRTC13 = RTDC.length; CRTC13 < TRTC13; CRTC13++) {
                            TCR = RTDC[CRTC13];
                            switch (CRTC13){
                                case 0:
                                    Meteor.call("GuardarLogEjecucionTrader", ' ACÁ ESTOY 1');
                                    var SaldoVerificar = TCR.saldo_moneda_tradear
                                    Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoVerificar"]+[SaldoVerificar]);
                                    var ValorMinimoCompra = TCR.min_compra;
                                    var ValorComisionHBTC = TCR.comision_hitbtc;
                                    var ValorComisionMerc = TCR.comision_mercado;
                                    var ValorMonedaSaldo = TCR.moneda_saldo;
                                    var ValorMonedaApCom = TCR.moneda_apli_comision;
                                    var MonCBas = TCR.moneda_base
                                    var MonCoti = TCR.moneda_cotizacion

                                    if ( MonCBas === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el if');
                                        Meteor.call("GuardarLogEjecucionTrader", [" % configurado"]+[PTDC.valor.p13]);
                                        var SaldoInvertir = SaldoVerificar*PTDC.valor.p13;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        NuevoSaldoCalculado = SaldoVerificar - SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);
                                        if ( SaldoInvertir >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInicial1 = TCR.saldo_moneda_tradear
                                            saldoInversionFinal1 = SaldoInvertir
                                            NuevoSaldoCalculado1 = NuevoSaldoCalculado
                                            COM11 = 0
                                            COM21 = 0
                                        }
                                    } else if ( MonCoti === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el ifelse');
                                        Meteor.call("GuardarLogEjecucionTrader", [" % configurado"]+[PTDC.valor.p13]);
                                        var SaldoInvertir = TCR.saldo_moneda_tradear*PTDC.valor.p13;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        var comision1 = ValorComisionHBTC * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision1"]+[comision1]);
                                        var comision2 = ValorComisionMerc * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision2"]+[comision2]);
                                        var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInverCalculado"]+[SaldoInverCalculado]);


                                        NuevoSaldoCalculado = SaldoVerificar - SaldoInverCalculado

                                        if ( SaldoInverCalculado >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInversionFinal1 = SaldoInverCalculado
                                            NuevoSaldoCalculado1 = NuevoSaldoCalculado
                                            COM11 = comision1
                                            COM21 = comision2
                                        }
                                    }
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de CantPropTipoCambiosValidados"]+[CantPropTipoCambiosValidados]);
                                break;
                                case 1:
                                    Meteor.call("GuardarLogEjecucionTrader", ' ACÁ ESTOY 2');
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado Recibido"]+[NuevoSaldoCalculado]);
                                    var ValorMinimoCompra = TCR.min_compra;
                                    ValorComisionHBTC = TCR.comision_hitbtc;
                                    ValorComisionMerc = TCR.comision_mercado;
                                    ValorMonedaSaldo = TCR.moneda_saldo;
                                    ValorMonedaApCom = TCR.moneda_apli_comision;
                                    var MonCBas = TCR.moneda_base
                                    var MonCoti = TCR.moneda_cotizacion

                                    if ( MonCBas === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el if');
                                        Meteor.call("GuardarLogEjecucionTrader", [" % configurado"]+[PTDC.valor.p23]);
                                        var SaldoInvertir = NuevoSaldoCalculado*PTDC.valor.p23;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        NuevoSaldoCalculado = NuevoSaldoCalculado - SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);

                                        if ( SaldoInvertir >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInversionFinal2 = SaldoInvertir
                                            NuevoSaldoCalculado2 = NuevoSaldoCalculado
                                            COM12 = 0
                                            COM22 = 0

                                        }
                                    } else if ( MonCoti === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el ifelse');
                                        Meteor.call("GuardarLogEjecucionTrader", [" % configurado"]+[PTDC.valor.p23]);
                                        var SaldoInvertir = NuevoSaldoCalculado*PTDC.valor.p23;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        var comision1 = ValorComisionHBTC * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision1"]+[comision1]);
                                        var comision2 = ValorComisionMerc * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision2"]+[comision2]);
                                        var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInverCalculado"]+[SaldoInverCalculado]);
                                        NuevoSaldoCalculado = NuevoSaldoCalculado - SaldoInverCalculado
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);

                                        if ( SaldoInverCalculado >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInicial2 = NuevoSaldoCalculado
                                            saldoInversionFinal2 = SaldoInverCalculado
                                            NuevoSaldoCalculado2 = NuevoSaldoCalculado
                                            COM12 = comision1
                                            COM22 = comision2
                                        }
                                    }
                                    Meteor.call("GuardarLogEjecucionTrader", ["Valor de CantPropTipoCambiosValidados"]+[CantPropTipoCambiosValidados]);
                                break;
                                case 2:
                                    Meteor.call("GuardarLogEjecucionTrader", ' ACÁ ESTOY 3');
                                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado Recibido"]+[NuevoSaldoCalculado]);
                                    var ValorMinimoCompra = TCR.min_compra;
                                    ValorComisionHBTC = TCR.comision_hitbtc;
                                    ValorComisionMerc = TCR.comision_mercado;
                                    ValorMonedaSaldo = TCR.moneda_saldo;
                                    ValorMonedaApCom = TCR.moneda_apli_comision;                                    
                                    var MonCBas = TCR.moneda_base
                                    var MonCoti = TCR.moneda_cotizacion

                                    if ( MonCBas === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el if');
                                        Meteor.call("GuardarLogEjecucionTrader", [" % configurado"]+[PTDC.valor.p33]);
                                        var SaldoInvertir = NuevoSaldoCalculado*PTDC.valor.p33;
                                        Meteor.call("GuardarLogEjecucionTrader", ["Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        NuevoSaldoCalculado = NuevoSaldoCalculado - SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);
                                        if ( SaldoInvertir >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInversionFinal3 = SaldoInvertir
                                            NuevoSaldoCalculado3 = NuevoSaldoCalculado
                                        }
                                    } else if ( MonCoti === ValorMonedaSaldo ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el ifelse');
                                        Meteor.call("GuardarLogEjecucionTrader", [" % configurado"]+[PTDC.valor.p33]);
                                        var SaldoInvertir = NuevoSaldoCalculado*PTDC.valor.p33;
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInvertir"]+[SaldoInvertir]);
                                        var comision1 = ValorComisionHBTC * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision1"]+[comision1]);
                                        var comision2 = ValorComisionMerc * SaldoInvertir
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de comision2"]+[comision2]);
                                        var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoInverCalculado"]+[SaldoInverCalculado]);
                                        NuevoSaldoCalculado = NuevoSaldoCalculado - SaldoInverCalculado
                                        Meteor.call("GuardarLogEjecucionTrader", [" Valor de NuevoSaldoCalculado"]+[NuevoSaldoCalculado]);

                                        if ( SaldoInverCalculado >= ValorMinimoCompra ) {
                                            CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                            saldoInversionFinal3 = SaldoInverCalculado
                                            NuevoSaldoCalculado3 = NuevoSaldoCalculado
                                            COM13 = comision1
                                            COM23 = comision2
                                        }
                                    }
                                    
                                    Meteor.call("GuardarLogEjecucionTrader", ["Valor de CantPropTipoCambiosValidados"]+[CantPropTipoCambiosValidados]);
                                break;
                            }
                            console.log('--------------------------------------------');
                        }
                    break;
                }

        Meteor.call('Invertir', MONEDA, LIMITE_AP_DEP, CantPropTipoCambiosValidados );
    },

    'Invertir': function( MONEDA, LIMITE_AP_DEP, CANT_TIP_CAMBIOS_VALIDADOS ){

        fecha = moment (new Date());
        
        var Robot = Parametros.find({ dominio : "robot", estado : true, valor : 0 }).fetch();
        var EstadoRobot = Robot[0].valor

        try{ 
            var RankingTiposDeCambios = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA, estado : "A", habilitado : 1, "tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: CANT_TIP_CAMBIOS_VALIDADOS } ]);
            
            var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
            var ProporcionTipoCambios = PTC[0];
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };

        ///console.log("Valor de RankingTiposDeCambios", RankingTiposDeCambios)
        console.log("--------------------------------------------")
        Meteor.call("GuardarLogEjecucionTrader", ["  Tipos de cambios que pueden invertirse"]+[CANT_TIP_CAMBIOS_VALIDADOS]);
        console.log("--------------------------------------------")
        switch (CANT_TIP_CAMBIOS_VALIDADOS){
            case 0:
                console.log('--------------------------------------------');
                Meteor.call("GuardarLogEjecucionTrader", ["            **** EN ESPERA **** "]);
                Meteor.call("GuardarLogEjecucionTrader", ["   | Tendencias Analizadas no superan |"]);
                Meteor.call("GuardarLogEjecucionTrader", ["   |   limites Mínimos configurados   |"]);
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", ["   Valor Mínimo Actual Configurado: "]+[LIMITE_AP_DEP]);
                console.log('--------------------------------------------');
            break;
            case 1:
                console.log('--------------------------------------------');
                Meteor.call("GuardarLogEjecucionTrader", '             **** INVERTIR **** ');
                Meteor.call("GuardarLogEjecucionTrader", '   | Realizando Calculos de inversión |');
                console.log("   |   ............................   |")
                console.log(' ');

                var IdTransaccionLoteActual = Meteor.call('CalculaId', 3);
                Meteor.call("GuardarLogEjecucionTrader", [" Valor de IdTransaccionLoteActual: "]+[IdTransaccionLoteActual]);

                for (CRTC1 = 0, TRTC1 = RankingTiposDeCambios.length; CRTC1 < TRTC1; CRTC1++) {
                    TipoCambioRanking = RankingTiposDeCambios[CRTC1];

                    var TipoCambio = TipoCambioRanking.tipo_cambio
                    /*
                    switch (TIPO_MONEDA_SALDO){
                        case 1:
                            var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_base;
                        break;
                        case 2:
                            var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_cotizacion;
                        break;
                    }*/
                    var Tendencia = TipoCambioRanking.tendencia;
                    var PorcentajeInversion = ProporcionTipoCambios.valor.p11
                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                    if ( TipoCambioRanking.comision_hitbtc === undefined) {
                        var ValorComisionHBTC = 0                              
                    }else{
                        var ValorComisionHBTC = TipoCambioRanking.comision_hitbtc;
                    }
                    if ( TipoCambioRanking.comision_hitbtc === undefined) {
                        var ValorComisionMerc = 0                              
                    }else{
                        var ValorComisionMerc = TipoCambioRanking.comision_mercado;
                    }
                    var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                    var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                    var MonCBas = TipoCambioRanking.moneda_base;
                    var MonCoti = TipoCambioRanking.moneda_cotizacion;
                    var TipoAccion = TipoCambioRanking.accion;
                                
                    if ( MonCBas === MonedaSaldo ) {
                        var comision1 = 0;
                        var comision2 = 0;
                        var SaldoInverCalculado = SaldoActualMoneda*ProporcionTipoCambios.valor.p11;
                    } else if ( MonCoti === MonedaSaldo ) {
                        var SaldoInvertir = SaldoActualMoneda*ProporcionTipoCambios.valor.p11;
                        var comision1 = ValorComisionHBTC * SaldoInvertir
                        var comision2 = ValorComisionMerc * SaldoInvertir
                        var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                    }

                            
                    console.log('--------------------------------------------');
                    Meteor.call("GuardarLogEjecucionTrader", ['                  POSICIÓN:']+[CRTC1+1]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ******** ']+[' TIPO CAMBIO: ']+[TipoCambio]+[' ********']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[MonCBas]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA COTIZACION: ']+[MonCoti]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[Tendencia]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[comision1]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[comision2]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA APLICACION COMISION: ']+[MonedaApCom]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     ACCION: ']+[TipoAccion]);
                    console.log('--------------------------------------------');
                            
                    switch (TipoCambioRanking.accion){
                        case 1:
                            if( EstadoRobot === 1 ) {
                                Meteor.call("GuardarLogEjecucionTrader", ' Entre  En el robot simulador 1' );
                                idTrans = idTrans+1;
                                Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: VENDER');
                                Meteor.call('CrearNuevaOrderRobot',idTrans, TipoCambio,'sell', SaldoInverCalculado, SaldoActualMoneda, MonCBas, MonCoti, MonedaSaldo, comision1, comision2, MonedaApCom );
                            } else {
                                Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                            }
                        break;
                        case 2:
                            if( EstadoRobot === 0 ) {
                                Meteor.call("GuardarLogEjecucionTrader", ' Entre en modo producción');
                                idTrans = idTrans+1;
                                Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: COMPRAR');
                                Meteor.call('CrearNuevaOrderRobot',idTrans, TipoCambio,'buy', SaldoInverCalculado, SaldoActualMoneda, MonCBas, MonCoti, MonedaSaldo, comision1, comision2, MonedaApCom );
                            } else {
                                Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                            }
                        break;
                    }
                };
            break;
            case 2:
                    console.log('--------------------------------------------');
                    Meteor.call("GuardarLogEjecucionTrader", '             **** INVERTIR **** ');
                    Meteor.call("GuardarLogEjecucionTrader", '   | Realizando Calculos de inversión |');
                    console.log("   |   ............................   |")
                    console.log(' ');

                    var IdTransaccionLoteActual = Meteor.call('CalculaId', 3);
                    Meteor.call("GuardarLogEjecucionTrader", [" Valor de IdTransaccionLoteActual: "]+[IdTransaccionLoteActual]);

                    for (CRTC2 = 0, TRTC2 = RankingTiposDeCambios.length; CRTC2 < TRTC2; CRTC2++) {
                        TipoCambioRanking = RankingTiposDeCambios[CRTC2];
                            
                        console.log('--------------------------------------------');
                        Meteor.call("GuardarLogEjecucionTrader", ['                  POSICIÓN:']+[CRTC2+1]);
                        Meteor.call("GuardarLogEjecucionTrader", [' ******** ']+[' TIPO CAMBIO: ']+[TipoCambioRanking.tipo_cambio]+['********']);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[TipoCambioRanking.moneda_base]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA COTIZACION: ']+[TipoCambioRanking.moneda_cotizacion]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[TipoCambioRanking.periodo1.Base.tendencia_moneda_base]);
                        switch (CRTC2){
                            case 0:
                                var TipoCambio = TipoCambioRanking.tipo_cambio
                                /*
                                switch (TIPO_MONEDA_SALDO){
                                    case 1:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_base
                                    break;
                                    case 2:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_cotizacion
                                    break;
                                }*/
                                var Tendencia = TipoCambioRanking.tendencia;
                                var PorcentajeInversion = ProporcionTipoCambios.valor.p12
                                var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                    var ValorComisionHBTC = 0                              
                                }else{
                                    var ValorComisionHBTC = TipoCambioRanking.comision_hitbtc;
                                }
                                if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                    var ValorComisionMerc = 0                              
                                }else{
                                    var ValorComisionMerc = TipoCambioRanking.comision_mercado;
                                }
                                var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                                var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                                var MonCBas = TipoCambioRanking.moneda_base;
                                var MonCoti = TipoCambioRanking.moneda_cotizacion;
                                var TipoAccion = TipoCambioRanking.accion;
                                    
                                if ( MonCBas === MonedaSaldo ) {
                                    var comision1 = 0;
                                    var comision2 = 0;
                                    var SaldoInverCalculado = SaldoActualMoneda*PorcentajeInversion;
                                } else if ( MonCoti === MonedaSaldo ) {
                                    var SaldoInvertir = SaldoActualMoneda*PorcentajeInversion;
                                    var comision1 = ValorComisionHBTC * SaldoInvertir
                                    var comision2 = ValorComisionMerc * SaldoInvertir
                                    var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                                }


                                Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                                Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[comision1]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[comision2]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA APLICACION COMISION: ']+[MonedaApCom]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     ACCION: ']+[TipoAccion]);
                                switch (TipoCambioRanking.accion){
                                    case 1:
                                        if( EstadoRobot === 1 ) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' Entre  En el robot simulador 1' );
                                            idTrans = idTrans+1;
                                            Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: VENDER');
                                            Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'buy',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                        } else {
                                            Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, 12, MonedaApCom, IdTransaccionLoteActual);
                                        }
                                    break;
                                    case 2:
                                        if( EstadoRobot === 0 ) {
                                            Meteor.call("GuardarLogEjecucionTrader", ' Entre en modo producción');
                                            idTrans = idTrans+1;
                                            Meteor.call("GuardarLogEjecucionTrader", ['     OPERACION A REALIZAR: COMPRAR']);
                                            Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'sell',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                        } else {
                                            Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, 12, MonedaApCom, IdTransaccionLoteActual);    
                                        }
                                    break;
                                    }
                                break;
                                case 1:
                                    if( EstadoRobot === 1 ) {
                                        var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                        var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                                    }else{
                                        Meteor.call("GuardarLogEjecucionTrader", [' ActualizaSaldoActual']+[TipoCambioRanking.moneda_saldo]);
                                        var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                        var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                                    }
                                    var TipoCambio = TipoCambioRanking.tipo_cambio
                                    /*
                                    switch (TIPO_MONEDA_SALDO){
                                        case 1:
                                            var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_base
                                        break;
                                        case 2:
                                            var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_cotizacion
                                        break;
                                    }*/
                                    var Tendencia = TipoCambioRanking.tendencia;
                                    var PorcentajeInversion = ProporcionTipoCambios.valor.p22
                                    if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                        var ValorComisionHBTC = 0                              
                                    }else{
                                        var ValorComisionHBTC = TipoCambioRanking.comision_hitbtc;
                                    }
                                    if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                        var ValorComisionMerc = 0                              
                                    }else{
                                        var ValorComisionMerc = TipoCambioRanking.comision_mercado;
                                    }
                                    var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                                    var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                                    var MonCBas = TipoCambioRanking.moneda_base;
                                    var MonCoti = TipoCambioRanking.moneda_cotizacion;
                                    var TipoAccion = TipoCambioRanking.accion;
    
                                    if ( MonCBas === MonedaSaldo ) {
                                        var comision1 = 0;
                                        var comision2 = 0;
                                        var SaldoInverCalculado = SaldoActualMoneda*PorcentajeInversion;
                                    } else if ( MonCoti === MonedaSaldo ) {
                                        var SaldoInvertir = SaldoActualMoneda*PorcentajeInversion;
                                        var comision1 = ValorComisionHBTC * SaldoInvertir
                                        var comision2 = ValorComisionMerc * SaldoInvertir
                                        var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                                    }

                                    Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                                    Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);
                                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[comision1]);
                                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[comision2]);
                                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA APLICACION COMISION: ']+[MonedaApCom]);
                                    Meteor.call("GuardarLogEjecucionTrader", ['     ACCION: ']+[TipoAccion]);
                                    switch (TipoCambioRanking.accion){
                                        case 1:
                                            if( EstadoRobot === 1 ) {
                                                Meteor.call("GuardarLogEjecucionTrader", ' Entre  En el robot simulador 1' );
                                                idTrans = idTrans+1;
                                                Meteor.call("GuardarLogEjecucionTrader", ['     OPERACION A REALIZAR: VENDER']);
                                                Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'buy',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                            } else {
                                                Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                            }
                                        break;
                                        case 2:
                                            if( EstadoRobot === 0 ) {
                                                Meteor.call("GuardarLogEjecucionTrader", ' Entre en modo producción');
                                                idTrans = idTrans+1;
                                                Meteor.call("GuardarLogEjecucionTrader", ['     OPERACION A REALIZAR: COMPRAR']);
                                                Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'sell',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                            } else {
                                                Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                                
                                            }
                                        break;
                                    }
                                break;
                            }
                        }
            break;
            case 3:

                console.log('--------------------------------------------');
                Meteor.call("GuardarLogEjecucionTrader", '             **** INVERTIR **** ');
                Meteor.call("GuardarLogEjecucionTrader", '   | Realizando Calculos de inversión |');
                console.log("   |   ............................   |")
                console.log(' ');


                var IdTransaccionLoteActual = Meteor.call('CalculaId', 3);
                Meteor.call("GuardarLogEjecucionTrader", [" Valor de IdTransaccionLoteActual: "]+[IdTransaccionLoteActual]);

                for (CRTC3 = 0, TRTC3 = RankingTiposDeCambios.length; CRTC3 < TRTC3; CRTC3++) {
                    TipoCambioRanking = RankingTiposDeCambios[CRTC3];
                            
                    console.log('--------------------------------------------');
                    Meteor.call("GuardarLogEjecucionTrader", ['                  POSICIÓN:']+[CRTC3+1]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ******** ']+[' TIPO CAMBIO: ']+[TipoCambioRanking.tipo_cambio]+['********']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[TipoCambioRanking.moneda_base]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA COTIZACION: ']+[TipoCambioRanking.moneda_cotizacion]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[TipoCambioRanking.periodo1.Base.tendencia_moneda_base]);
                    switch (CRTC3){
                        case 0:
                            var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear;
                            var TipoCambio = TipoCambioRanking.tipo_cambio
                                /*
                                switch (TIPO_MONEDA_SALDO){
                                    case 1:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_base
                                    break;
                                    case 2:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_cotizacion
                                    break;
                                }*/
                            var Tendencia = TipoCambioRanking.tendencia;
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p13
                            if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                var ValorComisionHBTC = 0                              
                            }else{
                                var ValorComisionHBTC = TipoCambioRanking.comision_hitbtc;
                            }
                            if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                var ValorComisionMerc = 0                              
                            }else{
                                var ValorComisionMerc = TipoCambioRanking.comision_mercado;
                            }
                            var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                            var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                            var MonCBas = TipoCambioRanking.moneda_base;
                            var MonCoti = TipoCambioRanking.moneda_cotizacion;
                            var TipoAccion = TipoCambioRanking.accion;
                                    
                            if ( MonCBas === MonedaSaldo ) {
                                var comision1 = 0;
                                var comision2 = 0;
                                var SaldoInverCalculado = SaldoActualMoneda*PorcentajeInversion;
                            } else if ( MonCoti === MonedaSaldo ) {
                                var SaldoInvertir = SaldoActualMoneda*PorcentajeInversion;
                                var comision1 = ValorComisionHBTC * SaldoInvertir
                                var comision2 = ValorComisionMerc * SaldoInvertir
                                var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                            }


                            Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[comision1]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[comision2]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA APLICACION COMISION: ']+[MonedaApCom]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     ACCION: ']+[TipoAccion]);
                            switch (TipoCambioRanking.accion){
                                case 1:
                                    if( EstadoRobot === 1 ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Entre  En el robot simulador 1' );
                                        idTrans = idTrans+1;
                                        Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: VENDER');
                                        Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'buy',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                    } else {
                                       Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                    }
                                break;
                                case 2:
                                    if( EstadoRobot === 0 ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Entre en modo producción');
                                        idTrans = idTrans+1;
                                        Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: COMPRAR');
                                        Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'sell',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                    } else {
                                           Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                    }
                                break;
                            }
                        break;
                        case 1:
                            if( EstadoRobot === 1 ) {
                                var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                            }else{
                                Meteor.call( 'ActualizaSaldoActual', TipoCambioRanking.moneda_saldo);
                                var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                            }
                            var TipoCambio = TipoCambioRanking.tipo_cambio
                                /*
                                switch (TIPO_MONEDA_SALDO){
                                    case 1:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_base
                                    break;
                                    case 2:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_cotizacion
                                    break;
                                }*/
                            var Tendencia = TipoCambioRanking.tendencia;
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p23;
                            if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                var ValorComisionHBTC = 0                              
                            }else{
                                var ValorComisionHBTC = TipoCambioRanking.comision_hitbtc;
                            }
                            if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                var ValorComisionMerc = 0                              
                            }else{
                                var ValorComisionMerc = TipoCambioRanking.comision_mercado;
                            }
                            var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                            var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                            var MonCBas = TipoCambioRanking.moneda_base;
                            var MonCoti = TipoCambioRanking.moneda_cotizacion;
                            var TipoAccion = TipoCambioRanking.accion;
    
                            if ( MonCBas === MonedaSaldo ) {
                                var comision1 = 0;
                                var comision2 = 0;
                                var SaldoInverCalculado = SaldoActualMoneda*PorcentajeInversion;
                            } else if ( MonCoti === MonedaSaldo ) {
                                var SaldoInvertir = SaldoActualMoneda*PorcentajeInversion;
                                var comision1 = ValorComisionHBTC * SaldoInvertir
                                var comision2 = ValorComisionMerc * SaldoInvertir
                                var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                            }


                            Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[comision2]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA APLICACION COMISION: ']+[MonedaApCom]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     ACCION: ']+[TipoAccion]);
                            switch (TipoCambioRanking.accion){
                                case 1:
                                    if( EstadoRobot === 1 ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Entre  En el robot simulador 1' );
                                        idTrans = idTrans+1;
                                        Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: VENDER');
                                        Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'buy',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                    } else {
                                           Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                    }
                                break;
                                case 2:
                                    if( EstadoRobot === 2 ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Entre en modo producción');
                                        idTrans = idTrans+1;
                                        Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: COMPRAR' );
                                        Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'sell',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                    } else {
                                           Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                                
                                    }
                                break;
                            }
                        break;
                        case 2:
                            if( EstadoRobot === 1 ) {
                                var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                            }else{
                                Meteor.call( 'ActualizaSaldoActual', TipoCambioRanking.moneda_saldo);
                                var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                            }
                            var TipoCambio = TipoCambioRanking.tipo_cambio
                                /*
                                switch (TIPO_MONEDA_SALDO){
                                    case 1:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_base
                                    break;
                                    case 2:
                                        var Tendencia = TipoCambioRanking.periodo1.Base.tendencia_moneda_cotizacion
                                    break;
                                }*/
                            var Tendencia = TipoCambioRanking.tendencia;
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p33
                            if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                var ValorComisionHBTC = 0                              
                            }else{
                                var ValorComisionHBTC = TipoCambioRanking.comision_hitbtc;
                            }
                            if ( TipoCambioRanking.comision_hitbtc === undefined) {
                                var ValorComisionMerc = 0                              
                            }else{
                                var ValorComisionMerc = TipoCambioRanking.comision_mercado;
                            }
                            var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                            var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                            var MonCBas = TipoCambioRanking.moneda_base;
                            var MonCoti = TipoCambioRanking.moneda_cotizacion;
                            var TipoAccion = TipoCambioRanking.accion;
    
                            if ( MonCBas === MonedaSaldo ) {
                                var comision1 = 0;
                                var comision2 = 0;
                                var SaldoInverCalculado = SaldoActualMoneda*PorcentajeInversion;
                            }else if ( MonCoti === MonedaSaldo ) {
                                var SaldoInvertir = SaldoActualMoneda*PorcentajeInversion;
                                var comision1 = ValorComisionHBTC * SaldoInvertir
                                var comision2 = ValorComisionMerc * SaldoInvertir
                                var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2
                            }

                            Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[comision1]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[comision2]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA APLICACION COMISION: ']+[MonedaApCom]);
                            Meteor.call("GuardarLogEjecucionTrader", ['     ACCION: ']+[TipoAccion]);
                            switch (TipoCambioRanking.accion){
                                case 1:
                                    if( EstadoRobot === 1 ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Entre  En el robot simulador 1' );
                                        idTrans = idTrans+1;
                                        Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: VENDER');
                                        Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'buy',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                    } else {
                                       Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                    }
                                break;
                                case 2:
                                    if( EstadoRobot === 0 ) {
                                        Meteor.call("GuardarLogEjecucionTrader", ' Entre en modo producción');
                                        idTrans = idTrans+1;
                                        Meteor.call("GuardarLogEjecucionTrader", '     OPERACION A REALIZAR: COMPRAR');
                                        Meteor.call('CrearNuevaOrderRobot',idTrans,TipoCambio,'sell',SaldoInverCalculado, SaldoActualMoneda, TipoCambioRanking.moneda_base, TipoCambioRanking.moneda_cotizacion, TipoCambioRanking.moneda_saldo, COM12, COM22, TipoCambioRanking.moneda_apli_comision);
                                    } else {
                                       Meteor.get('CrearNuevaOrder',N_ID__ORDEN_CLIENT,TIPO_CAMBIO,T_TRANSACCION,CANT_MONEDA,PRECIO, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                    }
                                break;
                            }
                        break;
                    }
                }
            break;
        }       
        
        console.log('--------------------------------------------');
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '--------------   FINALIZADO   --------------');
        Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        console.log('############################################');
    },

});