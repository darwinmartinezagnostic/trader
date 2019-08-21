import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({
    
    'GenerarOrderRobot':function(DATOS){
        log.info(' GenerarOrderRobot: Valor de DATOS: ', DATOS,'Robot');
        IdCalcHTB = Meteor.call("SecuenciasRBT", 'IdOrdenHBTC');

        fecha = moment (new Date());
        var T_id = IdCalcHTB.toString()
        var T_clientOrderId = DATOS.clientOrderId;
        var T_symbol = DATOS.symbol;
        var T_side = DATOS.side;
        var T_Estado = 'filled';
        var T_type = DATOS.type;
        var T_timeInForce = DATOS.timeInForce;
        var T_quantity = DATOS.quantity;
        var T_price = DATOS.price;
        var T_cumQuantity = DATOS.quantity;
        var T_createdAt = fecha._d;
        var T_updatedAt = fecha._d;
        var T_postOnly = 'false';
        var T_fee = parseFloat(DATOS.comision_m) + parseFloat(DATOS.comision_h)

        OrdenesRobot.insert({   _id: T_id, 
                                clientOrderId: T_clientOrderId, 
                                symbol: T_symbol, 
                                side: T_side, 
                                status: T_Estado, 
                                type: T_type, 
                                timeInForce : T_timeInForce,
                                quantity: T_quantity, 
                                price: T_price, 
                                cumQuantity: T_cumQuantity, 
                                createdAt: T_createdAt,
                                updatedAt: T_updatedAt, 
                                postOnly: T_postOnly,
                                tradesReport : [{
                                                    fee : T_fee
                                                }]
                            });

        var OrdenGenerada = OrdenesRobot.findOne({ _id : T_id }) 

        return OrdenGenerada;
    },

    'ValidarEstadoOrdenRobot': function( VAL_ORDEN){

        T_id = VAL_ORDEN.id
        var Estado_Orden = OrdenesRobot.findOne({ _id : T_id });
        log.info('Valor de Estado_Orden', Estado_Orden,'Robot');
        return Estado_Orden;
    },

    'ActualizaEquivalenciaMonedas':function () {
        var EquivalenteDolarE = '';
        var EquivalenteDolarB = '';
        var Monedas_Saldo = GananciaPerdida.aggregate([
            { $match : {"Moneda.Adquirida.Saldo" : { $gt : 0 }}},
            { $sort : {"Moneda.Adquirida.Saldo":-1} }
        ]);
        if(Monedas_Saldo.length > 0){
            var MON_B;
            var MON_E;
            var SaldoActualCalcMB;
            var SaldoActualCalcME;
            for (var i = 0; i < Monedas_Saldo.length; i++) {
                MON_B = Monedas_Saldo[i].Moneda.Adquirida.moneda;
                MON_E = Monedas_Saldo[i].Moneda.Emitida.moneda;
                SaldoActualCalcMB = Monedas_Saldo[i].Moneda.Adquirida.Saldo;
                SaldoActualCalcME = Monedas_Saldo[i].Moneda.Emitida.Saldo;
                EquivalenteDolarB = Meteor.call('EquivalenteDolar', MON_B, parseFloat(SaldoActualCalcMB.toFixed(9)), 2);
                EquivalenteDolarE = Meteor.call('EquivalenteDolar', MON_E, parseFloat(SaldoActualCalcME.toFixed(9)), 2);
                GananciaPerdida.update( {"Operacion.ID_LocalAct" : Monedas_Saldo[i].Operacion.IdTransaccionActual, "Operacion.Id_Lote": Monedas_Saldo[i].Operacion.ID_LOTE},
                    {
                        $set: {
                            "Operacion.FechaActualizacion" : new Date(),
                            "Moneda.Emitida.Equivalente_actual" : EquivalenteDolarE,
                             "Moneda.Adquirida.Equivalente_actual" : EquivalenteDolarB}
                        }, {"multi" : true,"upsert" : true}
                );
            }
        }
    },

    'CarcularGanancia':function (TIPO_OP) {
        var Ganancia = GananciaPerdida.aggregate([
            { $match : {"Moneda.Adquirida.Saldo" : { $gt : 0 }}},
            { $sort : {"Moneda.Adquirida.Saldo":-1} }
        ]);

        var error = true;

        if(Ganancia.length > 0){

            for (var i = 0; i < Ganancia.length; i++) {

                if(Ganancia[i].Moneda.Adquirida.Equivalente_actual - Ganancia[i].Moneda.Adquirida.Equivalente < Ganancia[i].Moneda.Emitida.Equivalente_actual - Ganancia[i].Moneda.Emitida.Equivalente ) {
                    error = false;
                }

                GananciasGlobales.upsert({Operacion:Ganancia[i].Moneda.Adquirida.moneda+Ganancia[i].Moneda.Emitida.moneda},
                    {
                        Operacion:Ganancia[i].Moneda.Adquirida.moneda+Ganancia[i].Moneda.Emitida.moneda,
                        Saldo:Ganancia[i].Moneda.Adquirida.Equivalente_actual,
                        Ganancia: Ganancia[i].Moneda.Adquirida.Equivalente_actual - Ganancia[i].Moneda.Adquirida.Equivalente,
                        Fecha:new Date(),
                        BuenaInversion:error
                    });
                if (TIPO_OP != 1) {
                       var ganancia = GananciasGlobales.find();
                       log.info('Ganancia',ganancia.toString(),'Robot');
                }
            }
        }
    },

    'ActualizaSaldoTodasMonedasRobot':function(){

        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '           VERIFICANDO SALDOS');
        //log.info('############################################');
        //log.info('--------------------------------------------');

        var BlcMonedasTradeo= [{ currency : 'BTC', available : '0.00055', reserved : '0' }, { currency : 'ETH', available : '0.019', reserved : '0' }]
        var BlcCuenta = [{ currency : 'BTC', available : '0', reserved : '0' }, { currency : 'ETH', available : '0', reserved : '0' }]


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

            try{
                if ( v_sald_moneda !== undefined ){
                    Monedas.update({
                                        moneda: v_sald_moneda.moneda
                                    }, 
                                    {
                                        $set:{  "saldo.tradeo.activo": Number(v_BlcMonedasTradeo.available),
                                                "saldo.tradeo.reserva": Number(v_BlcMonedasTradeo.reserved)
                                        }
                                    },
                                    {"multi" : true,"upsert" : true}
                    );
                }
            }
            catch (error){
                Meteor.call("ValidaError", error, 2)
            };
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

            try{
                if ( v_sald_moneda !== undefined ){
                    Monedas.update({
                                        _id: v_sald_moneda._id,
                                        moneda: v_sald_moneda.moneda
                                    }, 
                                    {
                                        $set: { "saldo.cuenta.activo": Number(v_BlcCuenta.available),
                                                "saldo.cuenta.reserva": Number(v_BlcCuenta.reserved)
                                        }
                                    }, 
                                    {"multi" : true,"upsert" : true}
                    );
                }
            }
            catch (error){
                Meteor.call("ValidaError", error, 2)
            };                 
        }
    },

    'ActualizaSaldoActualRobot':function(MONEDA){
        var CONSTANTES = Meteor.call("Constantes");
        var BlcMonedasTradeo=Meteor.call("ConexionGet", CONSTANTES.blc_tradeo);
        var BlcCuenta =Meteor.call("ConexionGet", CONSTANTES.blc_cuenta);
        var c_vect_BlcCuent = 0;
        var c_vect_BlcTrad = 0;


        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['      VERIFICANDO SALDO MONEDA: ']+[MONEDA] );
        //log.info('############################################');
        //log.info('--------------------------------------------');
        for ( cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++ ) {
            var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
            var MonedaSaldoTradear = v_BlcMonedasTradeo.currency;
            if ( MonedaSaldoTradear == MONEDA ) {
                log.info('Valor de MonedaSaldoTradear: ', MonedaSaldoTradear,'Robot');

                var SaldoMonedaInvertidoTradear = Number(v_BlcMonedasTradeo.available);

                try{
                    var v_moneda_saldo = Monedas.find({ moneda : MONEDA }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2)
                };
                
                var v_sald_moneda = v_moneda_saldo[0];
                    if ( v_sald_moneda !== undefined ){
                        var V_EquivalenciaST = Meteor.call('EquivalenteDolar', MONEDA, parseFloat(SaldoMonedaInvertidoTradear), 2);
                        
                        Monedas.update({
                                        moneda: v_sald_moneda.moneda
                                        }, {
                                            $set: { "saldo.tradeo.activo": Number(v_BlcMonedasTradeo.available),
                                                    "saldo.tradeo.equivalencia": Number(V_EquivalenciaST),
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
                var SaldoMonedaGuardadoEnMonederoCuenta = Number(v_BlcCuenta.available);

                try{
                    var v_moneda_saldo = Monedas.find({ moneda : MONEDA }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2)
                };

                var v_sald_moneda = v_moneda_saldo[0];
                var V_EquivalenciaSMC = Meteor.call('EquivalenteDolar', MONEDA, parseFloat(SaldoMonedaGuardadoEnMonederoCuenta), 2);
                
                if ( v_sald_moneda !== undefined ){
                    Monedas.update({
                                    moneda: v_sald_moneda.moneda
                                    }, {
                                        $set: { "saldo.cuenta.activo": Number(v_BlcCuenta.available),
                                                "saldo.cuenta.equivalencia": Number(V_EquivalenciaSMC),
                                                "saldo.cuenta.reserva": Number(v_BlcCuenta.reserved)
                                                }
                                    }, {"multi" : true,"upsert" : true});
                    }
            }
        }

        var MonedasSaldoActual = Monedas.find( { moneda : MONEDA }).fetch();


        for ( cmsa = 0, tmsa = MonedasSaldoActual.length; cmsa < tmsa; cmsa++ ) {
            var v_BMonedasSaldoActual = MonedasSaldoActual[cmsa];
            //log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Saldo disponible');
            //log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['  ********* ']+[' MONEDA: ']+[v_BMonedasSaldoActual.moneda]+[' ********* ']);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO: ']+[v_BMonedasSaldoActual.saldo.tradeo.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.tradeo.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO EN CUENTA: ']+[v_BMonedasSaldoActual.saldo.cuenta.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.cuenta.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            //log.info('############################################');
            //log.info(' ');
        }
    },

    'ReinioDeSaldos' : function () {
        Monedas.update({},
                        {
                            $set:{  "saldo.tradeo.activo": Number(0),
                                    "saldo.tradeo.equivalencia": Number(0),
                                    "saldo.tradeo.reserva": Number(0)
                            }
                        },
                        {"multi" : true,"upsert" : true}
        );

        GananciaPerdida.remove({});

        Meteor.call("ActualizaSaldoTodasMonedasRobot");

        var SECUENCIAS = [ 'IdGanPerdLote', 'IdGanPerdLocal']

        for ( CS = 0, TCS = SECUENCIAS.length; CS < TCS; CS++ ) {
            var NOMBRE_SECUENCIA = SECUENCIAS[CS]
            Meteor.call('ReinicioDeSecuenciasGBL', NOMBRE_SECUENCIA);
        }
    },





});