import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'CrearNuevaOrderRobot':function(TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){
        log.info(' ');
        log.info('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", ['Creando una nueva orden en el ROBOT']);
        log.info('--------------------------------------------');
        log.info(' ');

        var CONSTANTES = Meteor.call("Constantes");
        var IdTran = Meteor.call("SecuenciasGBL", 'IdGanPerdLocal');
        var IdTransaccionActual = Meteor.call("CompletaConCero", IdTran, 32);
        GananciaPerdida.insert({
                                Operacion : {   
                                                ID_LocalAct : IdTransaccionActual,
                                                Id_Lote: ID_LOTE}
                            });
        log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", 'Creando una nueva orden');
        log.info("Valores recibidos CrearNuevaOrderRobot", " TIPO_CAMBIO: ", TIPO_CAMBIO, " CANT_INVER: ", CANT_INVER, " MON_B: ", MON_B, " MON_C: ", MON_C, " MONEDA_SALDO: ", MONEDA_SALDO, " MONEDA_COMISION: ", MONEDA_COMISION, " ID_LOTE: ", ID_LOTE);

        var fecha = new Date();
        log.info("Valor de fecha:", fecha)

        if ( MON_B === MONEDA_SALDO ) {
            var TP = 'sell'
            var V_TipoOperaciont = 'VENTA';
        } else if ( MON_C === MONEDA_SALDO ) {
            var TP = 'buy'
            var V_TipoOperaciont = 'COMPRA';
        }

        log.info("Valor de MON_B: ", MON_B)
        log.info("Valor de MON_C: ", MON_C)
        log.info("Valor de MONEDA_SALDO: ", MONEDA_SALDO)
        log.info("Valor de V_TipoOperaciont: ", V_TipoOperaciont)

        var RecalcIverPrec = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
        log.info(" Valor de RecalcIverPrec: ", RecalcIverPrec)
        var TC = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO })
        log.info(" Valor de TC: ", TC)
        var MinimoInversion = TC.valor_incremento
        log.info(" Valor de MinimoInversion: ", MinimoInversion)
        if ( parseFloat(RecalcIverPrec.MontIversionCal) >= parseFloat(MinimoInversion) ) {
            log.info(" Valor de if ( ", parseFloat(RecalcIverPrec.MontIversionCal)," >= ",parseFloat(MinimoInversion), " )")
            var INV_REAL = RecalcIverPrec.MontRealIversionCal

            log.info("Valor de IdTransaccionActual: ", IdTransaccionActual)
            log.info("Valor de TIPO_CAMBIO: ", TIPO_CAMBIO)
            log.info("Valor de TP: ", TP);
            log.info("Valor de INV_REAL: ", INV_REAL);
            log.info("Valor de RecalcIverPrec.MontIversionCal: ", RecalcIverPrec.MontIversionCal)
            log.info("Valor de RecalcIverPrec.MejorPrecCal: ", RecalcIverPrec.MejorPrecCal)
            log.info("Valor de RecalcIverPrec.comision_hbtc: ", RecalcIverPrec.comision_hbtc)
            log.info("Valor de RecalcIverPrec.comision_mercado: ", RecalcIverPrec.comision_mercado)

            var DatosRobot = {  clientOrderId : IdTransaccionActual, 
                                symbol : TIPO_CAMBIO, 
                                side : TP, 
                                timeInForce : 'GTC', 
                                type : 'limit', 
                                quantity : RecalcIverPrec.MontIversionCal, 
                                price : RecalcIverPrec.MejorPrecCal, 
                                comision_m : RecalcIverPrec.comision_hbtc,  
                                comision_h : RecalcIverPrec.comision_mercado }

            log.info(" Valor de DatosRobot: ", DatosRobot)


            log.info(" Estoy aca 1")
            do {            
                var Orden = Meteor.call('GenerarOrderRobot', DatosRobot);
                log.info(" Estoy aca 2")
                Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrderRobot: recibi Orden: ']+[Orden]); 
                if ( Orden === undefined ) {
                    Meteor.call('sleep', 4);
                }
            }while( Orden === undefined );

        }else{
            var Orden = {  status: 'Quantity too low' }
        }



        var Estado_Orden = Orden.status
        Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrderRobot: recibi estado: ']+[Estado_Orden]); 
        ContpartiallyFilled = 0;

        log.info(' Valor de Orden 1: ', Orden)

        while( Estado_Orden !== "filled" ){
            log.info('Estoy en el while')
            log.info(' Valor de Orden 2: ', Orden)
            log.info(' Valor de Estado_Orden: ', Estado_Orden)
            fecha = moment (new Date());
            if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" ) {
                var V_IdHitBTC = Orden.id
                log.info(' Estoy en  if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" )')
                log.info(' Valor de Orden 3: ', Orden)
                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO INICIAL: ']+[fecha._d]);                
                Meteor.call('sleep', 4);
                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO FIN ESPERA: ']+[fecha._d]);
                GananciaPerdida.update( {    "Operacion.ID_LocalAct" : IdTransaccionActual, "Operacion.Id_Lote": ID_LOTE }, 
                                        {
                                            $set: {
                                                    Operacion : {   
                                                                    Id_hitbtc : V_IdHitBTC,
                                                                    ID_LocalAct : IdTransaccionActual,
                                                                    Id_Lote: ID_LOTE,
                                                                    Tipo : TP,
                                                                    TipoCambio : TIPO_CAMBIO,
                                                                    Precio : RecalcIverPrec.MejorPrecCal,
                                                                    Status : 'En seguimiento',
                                                                    Razon : Estado_Orden,
                                                                    FechaCreacion : fecha._d,
                                                                    FechaActualizacion : fecha._d},
                                                    Moneda : {  Emitida : { moneda : MON_C },
                                                                Adquirida : { moneda : MON_B }
                                                             },
                                                    Inversion : { SaldoInversion  : CANT_INVER }
                                                    }
                                        }, 
                                        {"upsert" : true}
                                        );
                                           

                Monedas.update({ "moneda": MONEDA_SALDO }, {    
                            $set: {
                                    "activo": "N"
                                }
                            });

                const Resultado = Meteor.call("ValidarEstadoOrdenRobot", Orden)
                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO FINAL CULMINACION: ']+[fecha._d]);
                log.info(' Valor de Orden 4: ', Orden)
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Resultado: ']+[Resultado[0]]);

                var Orden = Resultado
                var Estado_Orden = Resultado.status;
                log.info(' Valor de Orden 5: ', Orden)
            }

            if ( Estado_Orden === "DuplicateclientOrderId" || Estado_Orden === "suspended" || Estado_Orden === "Estado_Orden" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" || Estado_Orden === "Quantity too low" ) {
                log.info(' Estoy en if ( Estado_Orden === "DuplicateclientOrderId" || Estado_Orden === "suspended" || Estado_Orden === "Estado_Orden" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" )')
                var V_IdHitBTC = Orden.id
                log.info(' Valor de Orden 6: ', Orden)

                GananciaPerdida.update( {    "Operacion.ID_LocalAct" : IdTransaccionActual, "Operacion.Id_Lote": ID_LOTE },
                                        {
                                            $set: {
                                                    Operacion : {   
                                                                    Id_hitbtc : V_IdHitBTC,
                                                                    ID_LocalAct : IdTransaccionActual,
                                                                    Id_Lote: ID_LOTE,
                                                                    Tipo : TP,
                                                                    TipoCambio : TIPO_CAMBIO,
                                                                    Precio : RecalcIverPrec.MejorPrecCal,
                                                                    Status : 'Fallido',
                                                                    Razon : Estado_Orden,
                                                                    FechaCreacion : fecha._d,
                                                                    FechaActualizacion : fecha._d},
                                                    Moneda : {  Emitida : { moneda : MON_C },
                                                                Adquirida : { moneda : MON_B }
                                                             },
                                                    Inversion : { SaldoInversion  : CANT_INVER }
                                                    }
                                        }, 
                                        {"upsert" : true}
                                        );
                
                if ( Estado_Orden === "DuplicateclientOrderId") {   
                    log.info(' Estoy en if if ( Estado_Orden === "DuplicateclientOrderId")')
                    Meteor.call("GuardarLogEjecucionTrader", [' CrearNuevaOrderRobot: Orden Fallida, Status Recibido: "']+[Estado_Orden]+['", Reintentando ejecución de Orden ..., con los siguientes datos: TIPO_CAMBIO :']+[TIPO_CAMBIO]+[',CANT_INVER : ']+[CANT_INVER][', MON_B :']+[MON_B][', MON_C :']+[, MON_C]);
                    Meteor.call('CrearNuevaOrderRobot', TIPO_CAMBIO,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE)
                }else{
                    TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
                }
                log.info(' Valor de Orden 7: ', Orden)
                break
            }

            if ( Estado_Orden === "errorisnotdefined" ) {
                log.info(' Valor de Orden 8: ', Orden)
                GananciaPerdida.update( {    "Operacion.ID_LocalAct" : IdTransaccionActual, "Operacion.Id_Lote": ID_LOTE },
                                        {
                                            $set: {
                                                    Operacion : {   
                                                                    ID_LocalAct : IdTransaccionActual,
                                                                    Id_Lote: ID_LOTE,
                                                                    Tipo : TP,
                                                                    TipoCambio : TIPO_CAMBIO,
                                                                    Precio : RecalcIverPrec.MejorPrecCal,
                                                                    Status : 'Fallido',
                                                                    Razon : Estado_Orden,
                                                                    FechaCreacion : fecha._d,
                                                                    FechaActualizacion : fecha._d},
                                                    Moneda : {  Emitida : { moneda : MON_C },
                                                                Adquirida : { moneda : MON_B }
                                                             },
                                                    Inversion : { SaldoInversion  : CANT_INVER }
                                                    }
                                        }, 
                                        {"upsert" : true}
                                        );
                log.info(' Valor de Orden 9: ', Orden)
                TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
                break
            }

            if ( Estado_Orden === "Insufficientfunds" ) {
                log.info(" Insufficientfunds: Valor de Orden 10: ", Orden)
                //var V_IdHitBTC = Orden.id

                GananciaPerdida.update( {    "Operacion.ID_LocalAct" : IdTransaccionActual, "Operacion.Id_Lote": ID_LOTE },
                                        {
                                            $set: {
                                                    Operacion : {   
                                                                    ID_LocalAct : IdTransaccionActual,
                                                                    Id_Lote: ID_LOTE,
                                                                    Tipo : TP,
                                                                    TipoCambio : TIPO_CAMBIO,
                                                                    Precio : RecalcIverPrec.MejorPrecCal,
                                                                    Status : 'Fallido',
                                                                    Razon : Estado_Orden,
                                                                    FechaCreacion : fecha._d,
                                                                    FechaActualizacion : fecha._d},
                                                    Moneda : {  Emitida : { moneda : MON_C },
                                                                Adquirida : { moneda : MON_B }
                                                             },
                                                    Inversion : { SaldoInversion  : CANT_INVER }
                                                    }
                                        }, 
                                        {"upsert" : true}
                                        );

                const Resultado = Meteor.call("ValidarEstadoOrdenRobot", Orden)
                var Orden = Resultado
                log.info(' Valor de Orden 11: ', Orden)
                var Estado_Orden = Resultado.status;
                log.info(" Insufficientfunds: Valor de Estado_Orden: ", Estado_Orden)
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Resultado: ']+[Resultado[0]]);
                TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
            } 
        }

        log.info(' Valor de Orden 12: ', Orden)

        if ( Estado_Orden === "filled" ) {
            log.info(" if ( Estado_Orden === filled ) : Voy a Guardar")
            log.info(' Valor de Orden 13: ', Orden)
            log.info(" if ( Estado_Orden === filled ) : Enviando ", TIPO_CAMBIO, CANT_INVER,  INV_REAL, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );
            Meteor.call('GuardarOrdenRobot', TIPO_CAMBIO, CANT_INVER,  INV_REAL, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );
            log.info(" if ( Estado_Orden === filled ) : Ya guardé")
        }
    },

    'GenerarOrderRobot':function(DATOS){
        log.info(' GenerarOrderRobot: Valor de DATOS: ', DATOS)
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
        var Estado_Orden = OrdenesRobot.findOne({ _id : T_id })
        log.info('Valor de Estado_Orden', Estado_Orden)
        return Estado_Orden
    },
    ////////////////////////////////////DARWIN/////////////////////////////////393
    'GuardarOrdenRobot': function(TIPO_CAMBIO, CANT_INVER, REAL_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, ID_LOTE){
        log.info(" Valores recibidos: ", TIPO_CAMBIO, CANT_INVER, REAL_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, ID_LOTE)
        var ComisionTtl = 0

        var Negociaciones = ORDEN.tradesReport
        log.info("Valor de ORDEN: ", ORDEN.tradesReport)
        var status = ORDEN.status

        for (CRPT = 0, TRPT = Negociaciones.length; CRPT < TRPT; CRPT++) {
            var Reporte = Negociaciones[CRPT];
            ComisionTtl +=  parseFloat(Reporte.fee)
        }
        log.info('Valor de ComisionTtl', ComisionTtl)

        var Comision = ComisionTtl.toString()
        var precio = parseFloat(ORDEN.price)
        var CantidadNegociada = ORDEN.quantity
        var IdHBTC = ORDEN.id
        var IdTransaccionActual = ORDEN.clientOrderId
        var FormaDeOperacion = ORDEN.side
        var FechaCreacion = ORDEN.createdAt
        var FechaActualizacion = ORDEN.updatedAt
        var V_AnterioresMB = Monedas.aggregate([{ $match: { 'moneda' : MON_B }}]);
        var ValoresAnterioresMB = V_AnterioresMB[0];
        var V_AnterioresMC = Monedas.aggregate([{ $match: { 'moneda' : MON_C }}]);
        var ValoresAnterioresMC = V_AnterioresMC[0];

        log.info(" Valor de Comision: ", Comision)
        log.info(" Valor de precio: ", precio)
        log.info(" Valor de CantidadNegociada: ", CantidadNegociada)
        log.info(" Valor de IdHBTC: ", IdHBTC)
        log.info(" Valor de IdTransaccionActual: ", IdTransaccionActual)
        log.info(" Valor de FormaDeOperacion: ", FormaDeOperacion)
        log.info(" Valor de FechaCreacion: ", FechaCreacion)
        log.info(" Valor de FechaActualizacion: ", FechaActualizacion)
        log.info(" Valor de ValoresAnterioresMB: ", ValoresAnterioresMB)
        log.info(" Valor de ValoresAnterioresMC: ", ValoresAnterioresMC)

        var Transaccion = OrdenesRobot.findOne({ clientOrderId : IdTransaccionActual })
        var V_Id_Transhitbtc = Transaccion._id
        log.info(" Valor de Transaccion: ", Transaccion)

        Meteor.call('GuardarLogEjecucionTrader', ' CrearNuevaOrder: Estoy en: Estado_Orden === "filled"');


        log.info('############################################');
        log.info('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ANTERIORES MB');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_B]);
        log.info('--------------------------------------------');
        

        var FechaTradeoAnteriorMB = ValoresAnterioresMB.saldo.tradeo.fecha;
        var SaldoTradeoAnteriorMB = ValoresAnterioresMB.saldo.tradeo.activo;
        
        log.info(" Valor de FechaTradeoAnteriorMB: ", FechaTradeoAnteriorMB)
        log.info(" Valor de SaldoTradeoAnteriorMB: ", SaldoTradeoAnteriorMB)
        var V_EquivalenciaTradeoAnteriorMB = ValoresAnterioresMB.saldo.tradeo.equivalencia;

        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoAnteriorMB: "]+[FechaTradeoAnteriorMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoAnteriorMB: "]+[SaldoTradeoAnteriorMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoAnteriorMB: "]+[V_EquivalenciaTradeoAnteriorMB]);

        log.info('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ANTERIORES MC');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_C]);
        log.info('--------------------------------------------');
        var FechaTradeoAnteriorMC = ValoresAnterioresMC.saldo.tradeo.fecha;
        var SaldoTradeoAnteriorMC = ValoresAnterioresMC.saldo.tradeo.activo;
        var V_EquivalenciaTradeoAnteriorMC = ValoresAnterioresMC.saldo.tradeo.equivalencia;

        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoAnteriorMC: "]+[FechaTradeoAnteriorMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoAnteriorMC: "]+[SaldoTradeoAnteriorMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoAnteriorMC: "]+[V_EquivalenciaTradeoAnteriorMC]);

        //////////////////////////////////////////////////////////////////////////
        /////////////////////////   ACTUALIZANDO SALDO   /////////////////////////

        if ( MONEDA_SALDO == MON_B ) {
            log.info("Estoy en if ( MONEDA_SALDO == MON_B )")
            var SaldoActualCalcMB =  parseFloat(SaldoTradeoAnteriorMB) - parseFloat(REAL_INVER)
            log.info(" Valor de SaldoActualCalcMB: ", SaldoActualCalcMB," = ", parseFloat(SaldoTradeoAnteriorMB)," - (", parseFloat(REAL_INVER),")")
            var EqvSaldoActualCalcMB = Meteor.call('EquivalenteDolar', MON_B, parseFloat(SaldoActualCalcMB.toFixed(9)), 2)
            log.info(" Valor de EqvSaldoActualCalcMB: ", EqvSaldoActualCalcMB)
            Monedas.update( { moneda : MON_B },
                                { $set:{    "saldo.tradeo.activo": parseFloat(SaldoActualCalcMB.toFixed(9)),
                                            "saldo.tradeo.equivalencia": parseFloat(EqvSaldoActualCalcMB.toFixed(9)) }
                                }
                            );
            var MonAdquirida = Monedas.findOne({ moneda : MON_C })
            log.info(" Valor de MonAdquirida: ", MonAdquirida)
            var SaldoActualMonAd = MonAdquirida.saldo.tradeo.activo
            log.info(" Valor de SaldoActualMonAd: ", SaldoActualMonAd)
            var CantidadRecibida = Meteor.call("EquivalenteTipoCambio", MonAdquirida.moneda, CantidadNegociada, precio, TIPO_CAMBIO );
            var SaldoActualCalcMC =  parseFloat(SaldoActualMonAd) + ( parseFloat(CantidadRecibida))
            log.info(" Valor de SaldoActualCalcMC: ", SaldoActualCalcMC," = ", parseFloat(SaldoActualMonAd)," + (", parseFloat(CantidadRecibida),")")
            var EqvSaldoActualCalcMC =  Meteor.call('EquivalenteDolar', MON_B, parseFloat(SaldoActualCalcMC.toFixed(9)), 2)
            log.info(" Valor de EqvSaldoActualCalcMC: ", EqvSaldoActualCalcMC)
            Monedas.update( { moneda : MON_C },
                                { $set:{    "saldo.tradeo.activo": parseFloat(SaldoActualCalcMC.toFixed(9)),
                                            "saldo.tradeo.equivalencia": parseFloat(EqvSaldoActualCalcMC.toFixed(9)) }
                                }
                            );

        }else if ( MONEDA_SALDO == MON_C ) {
            log.info("Estoy en else if ( MONEDA_SALDO == MON_C )")
            var SaldoActualCalcMC =  parseFloat(SaldoTradeoAnteriorMC) - ( parseFloat(REAL_INVER) - parseFloat(Comision))
            log.info(" Valor de SaldoActualCalcMC: ", SaldoActualCalcMC," = ", parseFloat(SaldoTradeoAnteriorMC)," - (", parseFloat(REAL_INVER)," - ",parseFloat(Comision),")")
            var EqvSaldoActualCalcMC = Meteor.call('EquivalenteDolar', MON_B, parseFloat(SaldoActualCalcMC.toFixed(9)), 2)
            log.info(" Valor de EqvSaldoActualCalcMC: ", EqvSaldoActualCalcMC)
            Monedas.update( { moneda : MON_C },
                                { $set:{    "saldo.tradeo.activo": parseFloat(SaldoActualCalcMC.toFixed(9)),
                                            "saldo.tradeo.equivalencia": parseFloat(EqvSaldoActualCalcMC.toFixed(9)) }
                                }
                            );

            var MonAdquirida = Monedas.findOne({ moneda : MON_B })
            log.info(" Valor de MonAdquirida: ", MonAdquirida)
            var SaldoActualMonAd = MonAdquirida.saldo.tradeo.activo
            log.info(" Valor de SaldoActualMonAd: ", SaldoActualMonAd)
            var CantidadRecibida = Meteor.call("EquivalenteTipoCambio", MonAdquirida.moneda, CantidadNegociada, precio, TIPO_CAMBIO );
            var SaldoActualCalcMB =  parseFloat(SaldoActualMonAd) + ( parseFloat(CantidadRecibida))
            log.info(" Valor de SaldoActualCalcMB: ", SaldoActualCalcMB," = ", parseFloat(SaldoActualMonAd)," + (", parseFloat(CantidadRecibida),")")
            var EqvSaldoActualCalcMB = Meteor.call('EquivalenteDolar', MON_B, parseFloat(SaldoActualCalcMB.toFixed(9)), 2)
            log.info(" Valor de EqvSaldoActualCalcMB: ", EqvSaldoActualCalcMB)
            Monedas.update( { moneda : MON_B },
                                { $set:{    "saldo.tradeo.activo": parseFloat(SaldoActualCalcMB.toFixed(9)),
                                            "saldo.tradeo.equivalencia": parseFloat(EqvSaldoActualCalcMB.toFixed(9)) }
                                }
                            );

        }
        log.info(" Valor de SaldoActualCalcMB: ", parseFloat(SaldoActualCalcMB.toFixed(9)))
        log.info(" Valor de SaldoActualCalcMC: ", parseFloat(SaldoActualCalcMC.toFixed(9)))


        //////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////

        var V_ActualMB = Monedas.aggregate([{ $match: { 'moneda' : MON_B }}]);
        var ValoresActualesMB = V_ActualMB[0];
        var V_ActualMC = Monedas.aggregate([{ $match: { 'moneda' : MON_C }}]);
        var ValoresActualesMC = V_ActualMC[0];



        log.info('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ACTUALES MB');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_B]);
        log.info('--------------------------------------------');
        var FechaTradeoActualMB = ValoresActualesMB.saldo.tradeo.fecha;
        var SaldoTradeoActualMB = ValoresActualesMB.saldo.tradeo.activo;
        log.info(" GuardarOrdenRobot: Enviando 1 ", 'EquivalenteDolar', MON_B, parseFloat(SaldoTradeoActualMB), 2);
        //var V_EquivalenciaTradeoActualMB = Meteor.call('EquivalenteDolar', MON_B, parseFloat(SaldoTradeoActualMB), 2);
        var V_EquivalenciaTradeoActualMB = ValoresActualesMB.saldo.tradeo.equivalencia;
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoActualMB: "]+[FechaTradeoActualMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoActualMB: "]+[SaldoTradeoActualMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoActualMB: "]+[V_EquivalenciaTradeoActualMB]);


        log.info('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ACTUALES MC');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_C]);
        log.info('--------------------------------------------');
        var FechaTradeoActualMC = ValoresActualesMC.saldo.tradeo.fecha;
        var SaldoTradeoActualMC = ValoresActualesMC.saldo.tradeo.activo;
        log.info(" GuardarOrdenRobot: Enviando 2 ", 'EquivalenteDolar', MON_C, parseFloat(SaldoTradeoActualMC), 2);
        //var V_EquivalenciaTradeoActualMC = Meteor.call('EquivalenteDolar', MON_C, parseFloat(SaldoTradeoActualMC), 2);
        var V_EquivalenciaTradeoActualMC = ValoresActualesMC.saldo.tradeo.equivalencia;
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoActualMC: "]+[FechaTradeoActualMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoActualMC: "]+[SaldoTradeoActualMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoActualMC: "]+[V_EquivalenciaTradeoActualMC]);

        log.info('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES INVERSION');
        log.info(" GuardarOrdenRobot: Enviando 3 ", 'EquivalenteDolar', MONEDA_SALDO, parseFloat(REAL_INVER), 2);
        var Eqv_V_InverSaldAct = Meteor.call('EquivalenteDolar', MONEDA_SALDO, parseFloat(REAL_INVER), 2);
        log.info("Valor de Eqv_V_InverSaldAct", Eqv_V_InverSaldAct)
        var V_Comision = Comision;
        log.info(" GuardarOrdenRobot: Enviando 4 ", 'EquivalenteDolar', MONEDA_COMISION, parseFloat(V_Comision), 2);
        var Equiv_V_Comision = Meteor.call('EquivalenteDolar', MONEDA_COMISION, parseFloat(V_Comision), 2);
        var SaldoMonedaAdquirida = CantidadRecibida;
        var V_IdHitBTC = IdHBTC
        var V_FormaOperacion = FormaDeOperacion;

        if ( MONEDA_SALDO == MON_B ) {
            var V_MonedaAdquirida = MON_C
            log.info(" GuardarOrdenRobot: Enviando 5 ", 'EquivalenteDolar, V_MonedaAdquirida(', V_MonedaAdquirida, '), SaldoMonedaAdquirida(', parseFloat(SaldoMonedaAdquirida), '),', 2);
            var V_EquivSaldoMonedaAdquirida =  Meteor.call('EquivalenteDolar', V_MonedaAdquirida, parseFloat(SaldoMonedaAdquirida), 2);
            var Eqv_V_InverSaldAnt = (( parseFloat(REAL_INVER) * parseFloat(V_EquivalenciaTradeoAnteriorMB) ) / parseFloat(SaldoTradeoAnteriorMB));
            log.info( 'Eqv_V_InverSaldAnt (', Eqv_V_InverSaldAnt ,') = REAL_INVER(',REAL_INVER, ') * V_EquivalenciaTradeoAnteriorMB(', V_EquivalenciaTradeoAnteriorMB , ') / SaldoTradeoAnteriorMB(', SaldoTradeoAnteriorMB , ')');
            log.info("Valor de Eqv_V_InverSaldAnt", Eqv_V_InverSaldAnt)
            var V_Ganancia = (parseFloat(Eqv_V_InverSaldAct) - parseFloat(Eqv_V_InverSaldAnt));
            log.info( 'V_Ganancia (', V_Ganancia ,') = Eqv_V_InverSaldAct(', Eqv_V_InverSaldAct ,') - Eqv_V_InverSaldAnt(', Eqv_V_InverSaldAnt, ')' );

            GananciaPerdida.update( {    "Operacion.ID_LocalAct" : IdTransaccionActual, "Operacion.Id_Lote": ID_LOTE },
                                    {
                                        $set: {
                                                Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                Id_Transhitbtc : V_Id_Transhitbtc,
                                                                ID_LocalAnt : IdTransaccionActual,
                                                                ID_LocalAct : IdTransaccionActual,
                                                                Id_Lote: ID_LOTE,
                                                                Tipo : V_FormaOperacion,
                                                                TipoCambio : TIPO_CAMBIO,
                                                                Base : MON_B,
                                                                Cotizacion : MON_C,
                                                                Status : status,
                                                                FechaCreacion : FechaCreacion,
                                                                FechaActualizacion : FechaActualizacion
                                                },
                                                Moneda : {  Emitida : {     moneda : MON_B,
                                                                            Fecha : FechaTradeoAnteriorMB,
                                                                            Saldo_Anterior : SaldoTradeoAnteriorMB,
                                                                            Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMB,
                                                                            Saldo_Actual : SaldoTradeoActualMB,
                                                                            Equivalente_Actual : V_EquivalenciaTradeoActualMB

                                                            },
                                                            Adquirida : {   moneda : MON_C,
                                                                            Fecha : FechaTradeoActualMC,
                                                                            Saldo_Anterior : SaldoTradeoAnteriorMC,
                                                                            Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMC,
                                                                            Saldo_Actual : SaldoTradeoActualMC,
                                                                            Equivalente_Actual : V_EquivalenciaTradeoActualMC
                                                            }
                                                },
                                                Inversion : {   Saldo : parseFloat(REAL_INVER.toFixed(9)),
                                                                Equivalencia : {    Inicial : parseFloat(Eqv_V_InverSaldAnt.toFixed(4)),
                                                                                    Final : Eqv_V_InverSaldAct},
                                                                Precio : precio,
                                                                Comision : {    moneda : MON_C,
                                                                                Valor : V_Comision,
                                                                                Equivalencia : Equiv_V_Comision}
                                                }                                                    
                                        }
                                    }, 
                                    {"upsert" : true}
            );

            Monedas.update({ "moneda": MONEDA_SALDO }, {    
                            $set: {
                                    "activo": "S"
                                }
                            });


            var TiposDeCambiosResetear = TiposDeCambios.aggregate([ { $match : { $or : [    {"moneda_base" : MON_B },
                                                                                            { "moneda_cotizacion" : MON_B }, 
                                                                                            {"moneda_base" : MON_C }, 
                                                                                            { "moneda_cotizacion" : MON_C } ] }  },
                                                                    { $sort : { tipo_cambio : 1 } } ])

            for (CTCR = 0, T_TiposDeCambiosResetear = TiposDeCambiosResetear.length; CTCR < T_TiposDeCambiosResetear; CTCR++) {
                var V_TiposDeCambiosResetear= TiposDeCambiosResetear[CTCR];
                var V_TipoCambio = V_TiposDeCambiosResetear.tipo_cambio

                TiposDeCambios.update(  { tipo_cambio : V_TipoCambio },
                                        { $set:{  "periodo1.Base.reset": 1 }}
                                    );
            }
        }else if ( MONEDA_SALDO == MON_C ){
                var V_MonedaAdquirida = MON_B
                log.info(" GuardarOrdenRobot: Enviando 6 ", 'EquivalenteDolar, V_MonedaAdquirida(', V_MonedaAdquirida, '), SaldoMonedaAdquirida(', parseFloat(SaldoMonedaAdquirida), '),', 2);
                var V_EquivSaldoMonedaAdquirida =  Meteor.call('EquivalenteDolar', V_MonedaAdquirida, parseFloat(SaldoMonedaAdquirida), 2);
                var Eqv_V_InverSaldAnt = (( parseFloat(REAL_INVER) * parseFloat(V_EquivalenciaTradeoAnteriorMC) ) / parseFloat(SaldoTradeoAnteriorMC));
                log.info( 'Eqv_V_InverSaldAnt (', Eqv_V_InverSaldAnt ,') = REAL_INVER(',REAL_INVER, ') * V_EquivalenciaTradeoAnteriorMC(', V_EquivalenciaTradeoAnteriorMC , ') / SaldoTradeoAnteriorMC(', SaldoTradeoAnteriorMC , ')');
                var V_Ganancia = (parseFloat(Eqv_V_InverSaldAct) - parseFloat(Eqv_V_InverSaldAnt));
                log.info( 'V_Ganancia (', V_Ganancia ,') = Eqv_V_InverSaldAct(', Eqv_V_InverSaldAct ,') - Eqv_V_InverSaldAnt(', Eqv_V_InverSaldAnt, ')' );

                GananciaPerdida.update ({    "Operacion.ID_LocalAct" : IdTransaccionActual, "Operacion.Id_Lote": ID_LOTE },
                                        {
                                            $set: {
                                                    Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                    Id_Transhitbtc : V_Id_Transhitbtc,
                                                                    ID_LocalAnt : IdTransaccionActual,
                                                                    ID_LocalAct : IdTransaccionActual,
                                                                    Id_Lote: ID_LOTE,
                                                                    Tipo : V_FormaOperacion,
                                                                    TipoCambio : TIPO_CAMBIO,
                                                                    Base : MON_B,
                                                                    Cotizacion : MON_C,
                                                                    Status : status,
                                                                    FechaCreacion : FechaCreacion,
                                                                    FechaActualizacion : FechaActualizacion},
                                                    Moneda : {  Emitida : { moneda : MON_C,
                                                                            Fecha : FechaTradeoActualMC,
                                                                            Saldo_Anterior : SaldoTradeoAnteriorMC,
                                                                            Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMC,
                                                                            Saldo_Actual : SaldoTradeoActualMC,
                                                                            Equivalente_Actual : V_EquivalenciaTradeoActualMC
                                                                },
                                                                Adquirida : {   moneda : MON_B,
                                                                                Fecha : FechaTradeoAnteriorMB,
                                                                                Saldo_Anterior : SaldoTradeoAnteriorMB,
                                                                                Equivalente_Anterior : V_EquivalenciaTradeoAnteriorMB,
                                                                                Saldo_Actual : SaldoTradeoActualMB,
                                                                                Equivalente_Actual : V_EquivalenciaTradeoActualMB
                                                                }},
                                                    Inversion : {   Saldo : parseFloat(REAL_INVER.toFixed(9)),
                                                                    Equivalencia : {    Inicial : parseFloat(Eqv_V_InverSaldAnt.toFixed(4)),
                                                                                        Final : Eqv_V_InverSaldAct},
                                                                    Precio : precio,
                                                                    Comision : {    moneda : MON_C,
                                                                                    Valor : V_Comision,
                                                                                    Equivalencia : Equiv_V_Comision}
                                                                }
                                                    }
                                        }, 
                                        {"upsert" : true}
                );

                Monedas.update({ "moneda": MONEDA_SALDO }, {    
                            $set: {
                                    "activo": "S"
                                }
                            });

                var TiposDeCambiosResetear = TiposDeCambios.aggregate([ { $match : { $or : [    {"moneda_base" : MON_B },
                                                                                                { "moneda_cotizacion" : MON_B }, 
                                                                                                {"moneda_base" : MON_C }, 
                                                                                                { "moneda_cotizacion" : MON_C } ] }  },
                                                                        { $sort : { tipo_cambio : 1 } } ])

                for (CTCR = 0, T_TiposDeCambiosResetear = TiposDeCambiosResetear.length; CTCR < T_TiposDeCambiosResetear; CTCR++) {
                    var V_TiposDeCambiosResetear= TiposDeCambiosResetear[CTCR];
                    var V_TipoCambio = V_TiposDeCambiosResetear.tipo_cambio

                    TiposDeCambios.update(  { tipo_cambio : V_TipoCambio },
                                            { $set:{  "periodo1.Cotizacion.reset": 1 }}
                                        );
                }
        }

        TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO})

        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_IdHitBTC: "]+[V_IdHitBTC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de IdTransaccionActual: "]+[IdTransaccionActual]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_SaldoInversion: "]+[REAL_INVER]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Comision: "]+[V_Comision]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de Equiv_V_Comision: "]+[Equiv_V_Comision]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_MonedaAdquirida: "]+[V_MonedaAdquirida]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoMonedaAdquirida: "]+[SaldoMonedaAdquirida]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivSaldoMonedaAdquirida: "]+[V_EquivSaldoMonedaAdquirida]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_FormaOperacion: "]+[V_FormaOperacion]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Ganancia: "]+[V_Ganancia]);

        log.info('--------------------------------------------');
        log.info('############################################');

        var LimiteMaximoDeCompras = Parametros.findOne({ "dominio": "limites", "nombre": "CantMaximaDeCompras"});
        var V_LimiteMaximoDeCompras = LimiteMaximoDeCompras.valor
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_LimiteMaximoDeCompras: "]+[V_LimiteMaximoDeCompras]);
        if ( V_LimiteMaximoDeCompras === 0 ) {
                                    
            throw new Error(" ÉJECUCIÓN DETENIDA");

        }else if ( V_LimiteMaximoDeCompras > 0 && V_LimiteMaximoDeCompras !== 9999999999 ) {

            V_LimiteMaximoDeCompras = V_LimiteMaximoDeCompras - 1
                        
            Parametros.update({ "dominio": "limites", "nombre": "CantMaximaDeCompras" }, {
                                    $set: {
                                                "valor": V_LimiteMaximoDeCompras
                                    }
                                });
        }
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
                       log.info(ganancia);
                }
            }
        }
    },

    'ActualizaSaldoTodasMonedasRobot':function(){

        log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '           VERIFICANDO SALDOS');
        log.info('############################################');
        log.info('--------------------------------------------');

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


        log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['      VERIFICANDO SALDO MONEDA: ']+[MONEDA] );
        log.info('############################################');
        log.info('--------------------------------------------');
        for ( cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++ ) {
            var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
            var MonedaSaldoTradear = v_BlcMonedasTradeo.currency;
            if ( MonedaSaldoTradear == MONEDA ) {
                log.info('Valor de MonedaSaldoTradear: ', MonedaSaldoTradear);

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
            log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Saldo disponible');
            log.info('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['  ********* ']+[' MONEDA: ']+[v_BMonedasSaldoActual.moneda]+[' ********* ']);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO: ']+[v_BMonedasSaldoActual.saldo.tradeo.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.tradeo.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO EN CUENTA: ']+[v_BMonedasSaldoActual.saldo.cuenta.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.cuenta.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            log.info('############################################');
            log.info(' ');
        }
    },

    'ReinioDeSaldos' : function () {
        Monedas.update({}, 
                        {
                            $set:{  "saldo.tradeo.activo": Number(0),
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
            log.info(' Valor de NOMBRE_SECUENCIA: ', NOMBRE_SECUENCIA)
            Meteor.call('ReinicioDeSecuenciasGBL', NOMBRE_SECUENCIA);
        }
    },

    



});