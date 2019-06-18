import { Meteor } from 'meteor/meteor';
//import { Constantes } from '../herramientas/Global.js';
moment().tz('America/Caracas').format();

Meteor.methods({

    'EvaluarTendencias':function( TIPOCAMBIO, MONEDASALDO ){
    	var CONSTANTES = Meteor.call("Constantes");
        // Formula de deprecación
        // TENDENCIA = ((valor actual - valor anterior) / valor anterior) * 100
        // Si es positivo la moneda base se está depreciando y la moneda en cotizacion se está apreciando
        // Si es negativa la moneda base de está apreciando y la moneda en cotizacion se está depreciando
        // Cuando se está evaluando la moneda a comprar si el resultado es + esa moneda esta en alza sino está a la baja
        // Cuando se está evaluando la moneda invertida si el resultado es + esa moneda esta en baja sino está a la alza
        
        try{
        	var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
            var V_Saldo_Moneda = Monedas.aggregate([
                        { $match : {"moneda" : MONEDASALDO}},
                        { $project : { _id : 0, "saldo.tradeo.activo": 1, "saldo.tradeo.equivalencia": 1 } }
                    ]);
        }
        catch (error){    
        	Meteor.call("ValidaError", error, 2);
        };
	    
                    
        try{
        	var TransProcesar = OperacionesCompraVenta.aggregate([{ $match: { tipo_cambio : TIPOCAMBIO }}]);
            var LCEA = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContEstadoActivo", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
            var LCEAA = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContAuxiliarEstadoActivo", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
            var LCEV = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContEstadoVerificando", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
            var LCEAV = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "LimiteContAuxiliarEstadoVerificando", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
            var LApDep = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "MaxApDep", estado : true  } }, { $project: {_id : 0, valor : 1}}]);
            var VTPCBM = TiposDeCambios.find({ tipo_cambio : TIPOCAMBIO }).fetch();
        }
        catch (error){    
        	Meteor.call("ValidaError", error, 2);
        };
        var RegAnt = TradAnt;
        //console.log(" Valor de RegAnt: ", RegAnt)
        var RegAct = TransProcesar[0];
        //console.log(" Valor de RegAct: ", RegAct)
        var MonBase =  RegAnt.moneda_base;
        var MonCoti =  RegAnt.moneda_cotizacion;

        var LimtContEdoAct = LCEA[0].valor;
        var LimtContAuxEdoAct = LCEAA[0].valor;
        var LimtContEdoVer = LCEV[0].valor;
        var LimtContAuxEdoVer = LCEAV[0].valor;
        var LimtAprecDeprec = LApDep[0].valor;
	    //console.log("Valor de LimtAprecDeprec: ", LimtAprecDeprec)

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

        var ValPrecAntMB = PeriodoPrecioAntMB;
        var ValPrecAntMC = PeriodoPrecioAntMC;
        var ValPrecAct = PeriodoPrecioAct;

        var ProcenApDpMB = ((( ValPrecAct - ValPrecAntMB ) / ValPrecAntMB ) * 100 ) ;
        var ProcenApDpMC = ((( ValPrecAct - ValPrecAntMC ) / ValPrecAntMC ) * 100 ) ;

        try{
            if ( MONEDASALDO === MonBase ){
                var TMA = 1;
                if ( ValPrecAct > ValPrecAntMB) {                           
                    var TendenciaMonedaBase = ( parseFloat(ProcenApDpMB.toFixed(4)) * -1 )
                    /*
                    console.log(" Valor de TendenciaMonedaBase: ", TendenciaMonedaBase)
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonBase");
                    Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    console.log('--------------------------------------------');
                    */
                    switch( EstadoTipoCambio ){
                        case 'V':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonB : 'ValPrecAct > ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'V'");
                            if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                var ValorEstadoTipoCambio = "V";
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);


                            }
                            else if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);

                            }
                            else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "I"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);

                            }
                            else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);

							}
                        break;
                        case 'I':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonB : 'ValPrecAct > ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'I'");
                            var ContEstadoTipoCambioPrinc = 0;
                            var ContEstadoTipoCambioAux = 0;
                            var ValorEstadoTipoCambio = "V"
                            var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);

                        break;
                        case 'A':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonB : 'ValPrecAct > ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'A'");
                            var ContEstadoTipoCambioPrinc = 0;
                            var ContEstadoTipoCambioAux = 0;
                            var ValorEstadoTipoCambio = "A"
                            var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaBase);

                        break;
                    };
                    
                    //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                }
                else if ( ValPrecAct <= ValPrecAntMB ){
                    
                    var TendenciaMonedaBase = ( parseFloat(ProcenApDpMB.toFixed(4)) * -1 )
                    /*
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonBase");
                    Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    console.log('--------------------------------------------');
                    */
                    
                    switch( EstadoTipoCambio ){
                        case 'V':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonB : 'ValPrecAct <= ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'V'");
                            if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "I"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            };
                        break;
                        case 'I':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonB : 'ValPrecAct <= ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'I'");
                            if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct ){
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "I"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }
                        break;
                        case 'A':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonB : 'ValPrecAct <= ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'A'");
                            if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoAct ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else if ( PeriodoId_hitbtcAntMB === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoAct ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            }else if ( PeriodoId_hitbtcAntMB !== PeriodoId_hitbtcAct ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMB, PeriodoFechaAntMB, PeriodoPrecioAntMB, PeriodoTipoOperacionAntMB, TendenciaMonedaBase);
                                
                            };
                        break;
                    };

                    //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                }
            }
            else if ( MONEDASALDO === MonCoti ) {
                var TMA = 2;
                if ( ValPrecAct > ValPrecAntMC ) {
                    var TendenciaMonedaCotizacion = parseFloat(ProcenApDpMC.toFixed(4))
                	//console.log('Valor de MonCoti:', [MonCoti]);
                    /*
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonCoti");
                    Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    console.log('--------------------------------------------');
                    /**/
                    switch( EstadoTipoCambio ){
                        case 'V':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonC : 'ValPrecAct > ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'V'");
                            if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                var ValorEstadoTipoCambio = "V";
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                            }else if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                            }else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "I"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                            }else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                            };
                        break;
                        case 'I':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonC : 'ValPrecAct > ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'I'");
                            var ContEstadoTipoCambioPrinc = 0;
                            var ContEstadoTipoCambioAux = 0;
                            var ValorEstadoTipoCambio = "V"
                            var ValorActivo = "S";

                            //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                            Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);
                            Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                        break;
                        case 'A':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonC : 'ValPrecAct > ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'A'");
                            var ContEstadoTipoCambioPrinc = 0;
                            var ContEstadoTipoCambioAux = 0;
                            var ValorEstadoTipoCambio = "A"
                            var ValorActivo = "S";

                            //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                            Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);
                            Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                        break;
                    };
                    
                    //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                }
                else if ( ValPrecAct <= ValPrecAntMC ){

                    var TendenciaMonedaCotizacion = parseFloat(ProcenApDpMC.toFixed(4))
                    /*
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonCoti");
                    Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    console.log('--------------------------------------------');
                    /**/
                    switch( EstadoTipoCambio ){
                        case 'V':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonC : 'ValPrecAct <= ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'V'");
                            if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "I"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            };
                        break;
                        case 'I':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonC : 'ValPrecAct <= ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'I'");
                            if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct ){
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "I"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }
                        break;
                        case 'A':
                            //Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonC : 'ValPrecAct <= ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'A'");
                            if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoAct ) {
                                var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoAct ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "V"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct ) {
                                var ContEstadoTipoCambioPrinc = 0;
                                var ContEstadoTipoCambioAux = 0;
                                var ValorEstadoTipoCambio = "A"
                                var ValorActivo = "S";

                                //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
                                Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, TendenciaMonedaCotizacion);
                                Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.valor_incremento, VTPCBM.valor_incremento_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, TendenciaMonedaCotizacion);

                            };
                        break;
                    };

                    //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                }
            }
        }
        catch(error){
        	Meteor.call("ValidaError", error, 2);
        }

        var ValorGuardado = TiposDeCambios.aggregate([  { $match : { tipo_cambio : TIPOCAMBIO }} ]);

        console.log('############################################');

        Vtipo_cambio = ValorGuardado[0].tipo_cambio;
        Vmoneda_base = ValorGuardado[0].moneda_base;
        Vmoneda_cotizacion = ValorGuardado[0].moneda_cotizacion;
        VMONEDASALDO = MONEDASALDO;
        SALDO_ACTUAL = V_Saldo_Moneda[0].saldo.tradeo.activo
        SALDO_EQUIV = V_Saldo_Moneda[0].saldo.tradeo.equivalencia
        VBfecha = ValorGuardado[0].periodo1.Base.fecha;
        VEstado = ValorGuardado[0].estado
        Vid_hitbtc = ValorGuardado[0].periodo1.Base.id_hitbtc;
        VBprecio = ValorGuardado[0].periodo1.Base.precio.toString().replace("." , ",");
        VBtendencia = ValorGuardado[0].periodo1.Base.tendencia;
        VCfecha = ValorGuardado[0].periodo1.Cotizacion.fecha;
        VCid_hitbtc = ValorGuardado[0].periodo1.Cotizacion.id_hitbtc;
        VCprecio = ValorGuardado[0].periodo1.Cotizacion.precio.toString().replace("." , ",");
        VCtendencia = ValorGuardado[0].periodo1.Cotizacion.tendencia;


        console.log('-------------------------------------------');
        console.log(" ");
        console.log("           MONEDA: ", MONEDASALDO);
        console.log("            SALDO: ", SALDO_ACTUAL.toString());
        console.log("                $: ", SALDO_EQUIV.toString());
        console.log("   || TIPO CAMBIO: ", Vtipo_cambio, "||");
        console.log("           ESTADO: ", VEstado);
        console.log("    PRECIO ACTUAL: ", PeriodoPrecioAct.toString().replace(".", ",") );
        console.log(" ");
        console.log('-------------------------------------------');
        if ( MONEDASALDO === MonBase ){
            console.log("             BASE: ".green, Vmoneda_base);
            console.log("            FECHA: ".green, VBfecha);
        	console.log("  PRECIO ANTERIOR: ".green, "= ".green, ValPrecAntMB," =".green);
        	console.log("    PRECIO ACTUAL: ".green, "= ".green, ValPrecAct," =".green);
        	console.log("        TENDENCIA: ".green, "[[*** ".green, parseFloat(TendenciaMonedaBase.toFixed(4)) ," ***]]".green );
    	}else{
            console.log("             BASE: ".grey, Vmoneda_base);
            console.log("            FECHA: ".grey, VBfecha)
    		console.log("  PRECIO ANTERIOR: ".grey, ValPrecAntMB);
    		console.log("    PRECIO ACTUAL: ".grey, ValPrecAct);
            if ( TendenciaMonedaBase === undefined) {
    		  console.log("        TENDENCIA: ".grey, 0);
            }else{
              console.log("        TENDENCIA: ".grey, TendenciaMonedaBase);
            }
    	}
        console.log('-------------------------------------------');
        if ( MONEDASALDO === MonCoti ){
            console.log("       COTIZACION: ".green, Vmoneda_cotizacion);
            console.log("            FECHA: ".green, VCfecha);
        	console.log("  PRECIO ANTERIOR: ".green, "= ".green ,ValPrecAntMC," =".green);
        	console.log("    PRECIO ACTUAL: ".green, "= ".green ,ValPrecAct," =".green);
        	console.log("        TENDENCIA: ".green, "[[*** ".green, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) ," ***]]".green );
        }else{
            console.log("       COTIZACION: ".grey, Vmoneda_cotizacion);
            console.log("            FECHA: ".grey, VCfecha);
        	console.log("  PRECIO ANTERIOR: ".grey, ValPrecAntMC);
        	console.log("    PRECIO ACTUAL: ".grey, ValPrecAct);
            if ( TendenciaMonedaCotizacion === undefined) {
              console.log("        TENDENCIA: ".grey, 0);
            }else{
              console.log("        TENDENCIA: ".grey, TendenciaMonedaCotizacion);
            }
        }
        console.log(" ");
    },

    'ValidarRanking': function(MONEDA){
        try{
            var TmpTCMB = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_base" : MONEDA, "estado" : 'A' }}, { $sort: { "periodo1.Base.tendencia" : -1 }}, { $limit: 3 } ]);
            var TmpTCMC = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_cotizacion" : MONEDA, "estado" : 'A' }}, { $sort: { "periodo1.Cotizacion.tendencia" : -1 }}, { $limit: 3 } ]);
            for (CTMCB = 0, T_TmpTCMB = TmpTCMB.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMB = TmpTCMB[CTMCB];
                TmpTipCambioXMonedaReord.insert({ "tipo_cambio": V_TmpTCMB.tipo_cambio,
                                                    "moneda_base": V_TmpTCMB.moneda_base,
                                                    "moneda_cotizacion" : V_TmpTCMB.moneda_cotizacion, 
                                                    "saldo_moneda_tradear" : V_TmpTCMB.saldo_moneda_tradear,
                                                    "moneda_saldo" : V_TmpTCMB.moneda_saldo,
                                                    "activo" : V_TmpTCMB.activo,
                                                    "comision_hitbtc" : V_TmpTCMB.comision_hitbtc,
                                                    "comision_mercado" : V_TmpTCMB.comision_mercado,
                                                    "valor_incremento" : V_TmpTCMB.valor_incremento,
                                                    "moneda_apli_comision": V_TmpTCMB.moneda_apli_comision,
                                                    "valor_incremento" : V_TmpTCMB.valor_incremento,
                                                    "estado" : V_TmpTCMB.estado,
                                                    "tendencia" : V_TmpTCMB.periodo1.Base.tendencia });
           
            };

            
            for (CTMCB = 0, T_TmpTCMB = TmpTCMC.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMC = TmpTCMC[CTMCB];
                TmpTipCambioXMonedaReord.insert({ "tipo_cambio": V_TmpTCMC.tipo_cambio,
                                                    "moneda_base": V_TmpTCMC.moneda_base,
                                                    "moneda_cotizacion" : V_TmpTCMC.moneda_cotizacion, 
                                                    "saldo_moneda_tradear" : V_TmpTCMC.saldo_moneda_tradear,
                                                    "moneda_saldo" : V_TmpTCMC.moneda_saldo,
                                                    "activo" : V_TmpTCMC.activo,
                                                    "comision_hitbtc" : V_TmpTCMC.comision_hitbtc,
                                                    "comision_mercado" : V_TmpTCMC.comision_mercado,
                                                    "valor_incremento" : V_TmpTCMC.valor_incremento,
                                                    "moneda_apli_comision": V_TmpTCMC.moneda_apli_comision,
                                                    "valor_incremento" : V_TmpTCMC.valor_incremento,
                                                    "estado" : V_TmpTCMC.estado,
                                                    "tendencia" : V_TmpTCMC.periodo1.Cotizacion.tendencia });
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

        var CPTC = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA,"tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: 1 }, { $count: "CantidadDeTiposDeCambios" } ]);
        var RTDC = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA,"tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: 1 } ]);
        

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
                        for (CRTC11 = 0, TRTC11 = RTDC.length; CRTC11 < TRTC11; CRTC11++) {
                            TCR = RTDC[CRTC11];

                            var SaldoVerificar = TCR.saldo_moneda_tradear
                            var MinimoInversion = TCR.valor_incremento;
                            var ValorComisionHBTC = TCR.comision_hitbtc;
                            var ValorComisionMerc = TCR.comision_mercado;
                            var ValorMonedaSaldo = TCR.moneda_saldo;
                            var ValorMonedaApCom = TCR.moneda_apli_comision;
                            var TIPO_CAMBIO = TCR.tipo_cambio;
                            var MonCBas = TCR.moneda_base
                            var MonCoti = TCR.moneda_cotizacion
                            var VInversion = TCR.saldo_moneda_tradear*PTDC.valor.p11;
                            var RecalcIverPrec = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA, VInversion);
                            var Inversion = RecalcIverPrec.MontIversionCal;

                            if ( parseFloat(Inversion) >= parseFloat(MinimoInversion) ) {
                                CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                            }
                        }
                    break;
                    case 2:                              
                        for (CRTC12 = 0, TRTC12 = RTDC.length; CRTC12 < TRTC12; CRTC12++) {
                            var TCR = RTDC[CRTC12];
                            var MinimoInversion = TCR.valor_incremento;
                            var ValorComisionHBTC = TCR.comision_hitbtc;
                            var ValorComisionMerc = TCR.comision_mercado;
                            var ValorMonedaSaldo = TCR.moneda_saldo;
                            var ValorMonedaApCom = TCR.moneda_apli_comision;
                            var MonCBas = TCR.moneda_base
                            var MonCoti = TCR.moneda_cotizacion
                            var TIPO_CAMBIO = TCR.tipo_cambio;

                            switch (CRTC12){
                                case 0:
                                    var SaldoVerificar = RTDC[CRTC12].saldo_moneda_tradear
                                    var VInversion = TCR.saldo_moneda_tradear*PTDC.valor.p12;
                                    var RecalcIverPrec = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA, VInversion);
                                    var Inversion = RecalcIverPrec.MontIversionCal;
                                    if ( parseFloat(Inversion) >= parseFloat(MinimoInversion) ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                        NuevoSaldoCalculado = SaldoVerificar - Inversion
                                    }
                                break;
                                case 1:
                                    var VInversion = NuevoSaldoCalculado.toFixed(9)*PTDC.valor.p22;
                                    var Inversion = RecalcIverPrec.MontIversionCal;
                                    if ( parseFloat(Inversion) >= parseFloat(MinimoInversion) ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                break;
                            }
                        }
                    break;
                    case 3:
                        for (CRTC13 = 0, TRTC13 = RTDC.length; CRTC13 < TRTC13; CRTC13++) {
                            TCR = RTDC[CRTC13];
                            switch (CRTC13){
                                case 0:
                                    var SaldoVerificar = TCR.saldo_moneda_tradear
                                    var MinimoInversion = TCR.valor_incremento;
                                    var ValorComisionHBTC = TCR.comision_hitbtc;
                                    var ValorComisionMerc = TCR.comision_mercado;
                                    var ValorMonedaSaldo = TCR.moneda_saldo;
                                    var ValorMonedaApCom = TCR.moneda_apli_comision;
                                    var MonCBas = TCR.moneda_base
                                    var MonCoti = TCR.moneda_cotizacion
                                    var TIPO_CAMBIO = TCR.tipo_cambio;

                                    var VInversion = SaldoVerificar*PTDC.valor.p13;
                                    var RecalcIverPrec = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA, VInversion);
                                    var Inversion = RecalcIverPrec.MontIversionCal;
                                    if ( parseFloat(Inversion) >= parseFloat(MinimoInversion) ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                        NuevoSaldoCalculado = SaldoVerificar - Inversion
                                    }
                                break;
                                case 1:
                                    var MinimoInversion = TCR.valor_incremento;
                                    var ValorComisionHBTC = TCR.comision_hitbtc;
                                    var ValorComisionMerc = TCR.comision_mercado;
                                    var ValorMonedaSaldo = TCR.moneda_saldo;
                                    var ValorMonedaApCom = TCR.moneda_apli_comision;
                                    var MonCBas = TCR.moneda_base
                                    var MonCoti = TCR.moneda_cotizacion
                                    var TIPO_CAMBIO = TCR.tipo_cambio;

                                    var VInversion = NuevoSaldoCalculado.toFixed(9)*PTDC.valor.p23;
                                    var RecalcIverPrec = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA, VInversion);
                                    var Inversion = RecalcIverPrec.MontIversionCal;
                                    if ( parseFloat(Inversion) >= parseFloat(MinimoInversion) ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                        NuevoSaldoCalculado = NuevoSaldoCalculado - Inversion
                                    }
                                break;
                                case 2:
                                    var MinimoInversion = TCR.valor_incremento;
                                    var ValorComisionHBTC = TCR.comision_hitbtc;
                                    var ValorComisionMerc = TCR.comision_mercado;
                                    var ValorMonedaSaldo = TCR.moneda_saldo;
                                    var ValorMonedaApCom = TCR.moneda_apli_comision;                                    
                                    var MonCBas = TCR.moneda_base
                                    var MonCoti = TCR.moneda_cotizacion
                                    var TIPO_CAMBIO = TCR.tipo_cambio;

                                    var VInversion = NuevoSaldoCalculado.toFixed(9)*PTDC.valor.p33;
                                    var RecalcIverPrec = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA, VInversion);
                                    var Inversion = RecalcIverPrec.MontIversionCal;
                                    if ( parseFloat(Inversion) >= parseFloat(MinimoInversion) ) {
                                        CantPropTipoCambiosValidados = CantPropTipoCambiosValidados+1
                                    }
                                break;
                            }
                        }
                    break;
                }
                Meteor.call("GuardarLogEjecucionTrader", ["  Cantidad Tipo de Cambios Validados: "]+[CantPropTipoCambiosValidados]);
                console.log('--------------------------------------------');

        Meteor.call('Invertir', MONEDA, LIMITE_AP_DEP, CantPropTipoCambiosValidados );
    },

    'Invertir': function( MONEDA, LIMITE_AP_DEP, CANT_TIP_CAMBIOS_VALIDADOS ){
    	var idTrans = 0;
        fecha = moment (new Date());
        var CRTC2=1;

        console.log("Valores recibidos: ", " MONEDA: ", MONEDA, " LIMITE_AP_DEP:", LIMITE_AP_DEP, " CANT_TIP_CAMBIOS_VALIDADOS: " ,CANT_TIP_CAMBIOS_VALIDADOS)

        try{ 
            var RankingTiposDeCambios = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA, estado : "A", "tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: CANT_TIP_CAMBIOS_VALIDADOS } ]);
            var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
            var ProporcionTipoCambios = PTC[0];
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };

        console.log("--------------------------------------------")
        Meteor.call("GuardarLogEjecucionTrader", ["  Tipos de cambios que pueden invertirse: "]+[CANT_TIP_CAMBIOS_VALIDADOS]);
        console.log("--------------------------------------------")

        if ( CANT_TIP_CAMBIOS_VALIDADOS === 0 ) {
            console.log('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", ["            **** EN ESPERA **** "]);
            Meteor.call("GuardarLogEjecucionTrader", ["   | Tendencias Analizadas no superan |"]);
            Meteor.call("GuardarLogEjecucionTrader", ["   |   limites Mínimos configurados   |"]);
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", ["   Valor Mínimo Actual Configurado: "]+[LIMITE_AP_DEP]);

            if ( MONEDA !== 'BTC') {
                var DatosMoneda = Monedas.findOne( { "moneda" : MONEDA })
                var ContMonedaEstable = DatosMoneda.c_estable
                var MonedaEstable = DatosMoneda.MonedaEstable
                if ( MonedaEstable === "S") {
                    var TipoCambioVerEstab = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : 'BTC',"tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: 3 }, { $count: "CantidadDeTiposDeCambios" } ]);
                    if ( TipoCambioVerEstab > 0 ) {
                        Meteor.call("InvertirEnMonedaInestable", MONEDA );
                        Monedas.update( { moneda : MONEDA },
                                    {$set:{ c_estable : 0 , 
                                            MonedaEstable : 'N' }});
                    }
                }

                if ( ContMonedaEstable === undefined || parseFloat(ContMonedaEstable) === 0 ) {
                    Monedas.update( { moneda : MONEDA },
                                    {$set:{ c_estable : 1 , 
                                            MonedaEstable : 'N' }});
                }else if (parseFloat(ContMonedaEstable) > 0 && parseFloat(ContMonedaEstable) < 20 ){
                    var NuevValor = parseFloat(ContMonedaEstable) +1
                    Monedas.update( { moneda : MONEDA },
                                    {$set:{ c_estable : NuevValor,
                                            MonedaEstable : 'N' }});
                }else if ( parseFloat(ContMonedaEstable) === 20 ){
                    Monedas.update( { moneda : MONEDA },
                                    {$set:{ MonedaEstable : 'S' }});
                }
            }
            
            console.log('--------------------------------------------');
        }else{
            for ( CTCV = 0, TTCV = RankingTiposDeCambios.length; CTCV <= TTCV; CTCV++ ) {
                console.log('--------------------------------------------');
                var Tendencia = RankingTiposDeCambios[0].tendencia;
                Meteor.call("GuardarLogEjecucionTrader", '             **** INVERTIR **** ');
                Meteor.call("GuardarLogEjecucionTrader", '   | Realizando Calculos de inversión |');
                Meteor.call("GuardarLogEjecucionTrader", ['         TENDENCIA: ']+[Tendencia]);
                console.log("   |   ............................   |")
                console.log(' ');

                while ( CRTC2 <= CANT_TIP_CAMBIOS_VALIDADOS ) {
                    TipoCambioRanking = RankingTiposDeCambios[CTCV];
                    var TipoCambio = TipoCambioRanking.tipo_cambio
                    var Tendencia = TipoCambioRanking.tendencia;
                    var PorcInv=[CRTC2]+[CANT_TIP_CAMBIOS_VALIDADOS]
                    switch ( parseFloat(PorcInv)){
                        case 11:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p11
                        break;
                        case 12:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p12
                        break;
                        case 22:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p22
                        break;
                        case 13:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p13
                        break;
                        case 23:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p23
                        break;
                        case 33:
                            var PorcentajeInversion = ProporcionTipoCambios.valor.p33
                        break;
                    }

                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                    var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                    var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                    var MonCBas = TipoCambioRanking.moneda_base;
                    var MonCoti = TipoCambioRanking.moneda_cotizacion;
                    var SaldoInverCalculado = parseFloat(SaldoActualMoneda)*parseFloat(PorcentajeInversion)
                    
                    console.log('--------------------------------------------');
                    Meteor.call("GuardarLogEjecucionTrader", ['                  POSICIÓN:']+[CRTC2]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ******** ']+[' TIPO CAMBIO: ']+[TipoCambio]+[' ********']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[MonCBas]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA COTIZACION: ']+[MonCoti]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[Tendencia]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);

                    var DatosMoneda = Monedas.findOne( { "moneda" : MONEDA })
                    var ContMonedaEstable = DatosMoneda.c_estable
                    if (parseFloat(ContMonedaEstable) > 0 ) {
                        Monedas.update( { moneda : MONEDA },
                                        {$set:{ c_estable : 0 , 
                                                MonedaEstable : 'N' }}, 
                                        {"multi" : true,"upsert" : true});
                    }
                    
                    //var IdTransaccionLoteActual = Meteor.call('CalculaId', 3);

                    var IdTransaccionLoteActual = Meteor.call("SecuenciasGBL", 'IdGanPerdLote')
                    var Robot = Parametros.findOne( { dominio : "Prueba", nombre : "robot" } );
                    if ( Robot.valor === 0 ) {
                        Meteor.call('CrearNuevaOrder',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                    }else if ( Robot.valor === 1 ) {
                        Meteor.call('CrearNuevaOrderRobot',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                    }
                    CRTC2 = CRTC2+1;
                }
            }

        }
        console.log('--------------------------------------------');
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '--------------   FINALIZADO   --------------');
        Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        console.log('############################################');
    },
    
    'CrearNuevaOrder':function(TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){
        //console.log("Valores recibidos CrearNuevaOrder", " TIPO_CAMBIO: ", TIPO_CAMBIO, " CANT_INVER: ", CANT_INVER, " MON_B: ", MON_B, " MON_C: ", MON_C, " MONEDA_SALDO: ", MONEDA_SALDO, " MONEDA_COMISION: ", MONEDA_COMISION), " ID_LOTE: ", ID_LOTE;
        var CONSTANTES = Meteor.call("Constantes");
        var IdTran = Meteor.call("SecuenciasGBL", 'IdGanPerdLocal');
        //console.log('Valor de Robot', Robot
        var IdTransaccionActual = Meteor.call("CompletaConCero", IdTran, 32);
        //console.log('Valor de Robot', Robot
        GananciaPerdida.insert({
                                Operacion : {   
                                                ID_LocalAct : IdTransaccionActual,
                                                Id_Lote: ID_LOTE}
                            });
    	console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", 'Creando una nueva orden');

        var fecha = new Date();
        console.log("Valor de fecha:", fecha)

        if ( MON_B === MONEDA_SALDO ) {
            var TP = 'sell'
            var V_TipoOperaciont = 'VENTA';
        } else if ( MON_C === MONEDA_SALDO ) {
            var TP = 'buy'
            var V_TipoOperaciont = 'COMPRA';
        }


        var RecalcIverPrec = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
        
        console.log("Valore de MON_B: ", MON_B)
        console.log("Valore de MON_C: ", MON_C)
        console.log("Valore de V_TipoOperaciont: ", V_TipoOperaciont)
        console.log("Valore de MONEDA_SALDO: ", MONEDA_SALDO)
        console.log("Valore de CANT_INVER: ", CANT_INVER)
        console.log("Valore de RecalcIverPrec: ", RecalcIverPrec)
        /**/
        var TC = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO })
        var MinimoInversion = TC.valor_incremento
        if ( parseFloat(RecalcIverPrec.MontIversionCal) >= parseFloat(MinimoInversion) ) {
            datos='clientOrderId='+IdTransaccionActual+'&symbol='+TIPO_CAMBIO+'&side='+TP+'&timeInForce='+'GTC'+'&type=limit'+"&quantity="+RecalcIverPrec.MontIversionCal+'&price='+RecalcIverPrec.MejorPrecCal;
            console.log("Datos a Enviar: ", datos)


            //datos='clientOrderId='+IdTransaccionActual+'&symbol='+TIPO_CAMBIO+'&side='+TP+'&timeInForce='+'GTC'+'&type=limit'+"&quantity="+'100000000'+'&price='+'0.000001';
            //datos='clientOrderId='+IdTransaccionActual+'&symbol='+TIPO_CAMBIO+'&side='+TP+'&timeInForce='+'GTC'+'&type=market'+"&quantity="+RecalcIverPrec.MontIversionCal;


            var url_orden = CONSTANTES.ordenes;

            do {            
                var Orden = Meteor.call('ConexionPost', url_orden, datos);
                Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrder: recibi Orden: ']+[Orden]); 
                if ( Orden === undefined ) {
                    Meteor.call('sleep', 4);
                }
            }while( Orden === undefined );

        }else{
            var Orden = {  status: 'Quantity too low' }
        }



        var Estado_Orden = Orden.status
        Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrder: recibi estado: ']+[Estado_Orden]); 
        ContpartiallyFilled = 0;

        console.log(' Valor de Orden 1: ', Orden)

        while( Estado_Orden !== "filled" ){
            console.log('Estoy en el while')
            console.log(' Valor de Orden 2: ', Orden)
            console.log(' Valor de Estado_Orden: ', Estado_Orden)
            fecha = moment (new Date());
            if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" ) {
                var V_IdHitBTC = Orden.id
                console.log(' Estoy en  if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" )')
                console.log(' Valor de Orden 3: ', Orden)
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

                //const Resultado = Meteor.call("ValidarEstadoOrden", IdTransaccionActual, V_IdHitBTC, TIPO_CAMBIO, Orden)
                const Resultado = Meteor.call("ValidarEstadoOrden", Orden)
                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO FINAL CULMINACION: ']+[fecha._d]);
                console.log(' Valor de Orden 4: ', Orden)
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Resultado: ']+[Resultado[0]]);

                var Orden = Resultado
                var Estado_Orden = Resultado.status;
                console.log(' Valor de Orden 5: ', Orden)
                //var Estado_Orden = Resultado;                  
            }

            if ( Estado_Orden === "DuplicateclientOrderId" || Estado_Orden === "suspended" || Estado_Orden === "Estado_Orden" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" || Estado_Orden === "Quantity too low" ) {
                console.log(' Estoy en if ( Estado_Orden === "DuplicateclientOrderId" || Estado_Orden === "suspended" || Estado_Orden === "Estado_Orden" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" )')
                var V_IdHitBTC = Orden.id
                console.log(' Valor de Orden 6: ', Orden)

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
                    console.log(' Estoy en if if ( Estado_Orden === "DuplicateclientOrderId")')
                    Meteor.call("GuardarLogEjecucionTrader", [' CrearNuevaOrder: Orden Fallida, Status Recibido: "']+[Estado_Orden]+['", Reintentando ejecución de Orden ..., con los siguientes datos: TIPO_CAMBIO :']+[TIPO_CAMBIO]+[',CANT_INVER : ']+[CANT_INVER][', MON_B :']+[MON_B][', MON_C :']+[, MON_C]);
                    Meteor.call('CrearNuevaOrder', TIPO_CAMBIO,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE)
                }else{
                    TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
                }
                console.log(' Valor de Orden 7: ', Orden)
                break
            }

            if ( Estado_Orden === "errorisnotdefined" ) {
                console.log(' Valor de Orden 8: ', Orden)
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
                console.log(' Valor de Orden 9: ', Orden)
                TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
                break
            }

            if ( Estado_Orden === "Insufficientfunds" ) {
                console.log(" Insufficientfunds: Valor de Orden 10: ", Orden)
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



                //const VerifOrdenAbierta = Meteor.call("ValidarEstadoOrden", V_IdHitBTC, TIPO_CAMBIO, Orden)
                const Resultado = Meteor.call("ValidarEstadoOrden", Orden)
                var Orden = Resultado
                console.log(' Valor de Orden 11: ', Orden)
                var Estado_Orden = Resultado.status;
                console.log(" Insufficientfunds: Valor de Estado_Orden: ", Estado_Orden)
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Resultado: ']+[Resultado[0]]);
                TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO})
            } 
        }

        console.log(' Valor de Orden 12: ', Orden)

        if ( Estado_Orden === "filled" ) {
            console.log(" if ( Estado_Orden === filled ) : Voy a Guardar")
            console.log(' Valor de Orden 13: ', Orden)
            console.log(" if ( Estado_Orden === filled ) : Enviando ", TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );
            Meteor.call('GuardarOrden', TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );
            console.log(" if ( Estado_Orden === filled ) : Ya guardé")
        }
        /**/
    },

});