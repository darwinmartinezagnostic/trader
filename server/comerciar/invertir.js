import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
//import { Constantes } from '../herramientas/Global.js';
moment().tz('America/Caracas').format();

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

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
        //log.info(" Valor de RegAnt: ", RegAnt)
        var RegAct = TransProcesar[0];
        //log.info(" Valor de RegAct: ", RegAct)
        var MonBase =  RegAnt.moneda_base;
        var MonCoti =  RegAnt.moneda_cotizacion;

        var LimtContEdoAct = LCEA[0].valor;
        var LimtContAuxEdoAct = LCEAA[0].valor;
        var LimtContEdoVer = LCEV[0].valor;
        var LimtContAuxEdoVer = LCEAV[0].valor;
        var LimtAprecDeprec = LApDep[0].valor;
	    //log.info("Valor de LimtAprecDeprec: ", LimtAprecDeprec)

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
                    
                    log.info(" Valor de TendenciaMonedaBase: ", TendenciaMonedaBase)
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonBase");
                    Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    log.info('--------------------------------------------');
                    /**/
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
                    
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonBase");
                    Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    log.info('--------------------------------------------');
                    /**/
                    
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
                	//log.info('Valor de MonCoti:', [MonCoti]);
                    
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonCoti");
                    Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    log.info('--------------------------------------------');
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
                    
                    Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonCoti");
                    Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                    Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                    log.info('--------------------------------------------');
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

        
        log.info('-------------------------------------------');
        log.info(" ");
        log.info("           MONEDA: ", MONEDASALDO, AMBITO);
        log.info("            SALDO: ", SALDO_ACTUAL.toString(), AMBITO);
        log.info("                $: ", SALDO_EQUIV.toString(), AMBITO);
        log.info("      TIPO CAMBIO: ", Vtipo_cambio, AMBITO);
        log.info("           ESTADO: ", VEstado, AMBITO);
        log.info("    PRECIO ACTUAL: ", PeriodoPrecioAct.toString().replace(".", ","),'Invertir' );
        log.info(" ");
        log.info('-------------------------------------------');
        if ( MONEDASALDO === MonBase ){
            log.info("             BASE: ", Vmoneda_base, AMBITO);
            log.info("            FECHA: ", VBfecha, AMBITO);
        	log.info("  PRECIO ANTERIOR: ", "= " + ValPrecAntMB + " =", AMBITO);
        	log.info("    PRECIO ACTUAL: ", "= " + ValPrecAct + " =", AMBITO);
        	log.info("        TENDENCIA: ", "[[*** "+ parseFloat(TendenciaMonedaBase.toFixed(4)) +" ***]]",'Invertir' );
    	}else{
            log.info("             BASE: ", Vmoneda_base, AMBITO);
            log.info("            FECHA: ", VBfecha,'Invertir')
    		log.info("  PRECIO ANTERIOR: ", ValPrecAntMB, AMBITO);
    		log.info("    PRECIO ACTUAL: ", ValPrecAct),'Invertir';
            if ( TendenciaMonedaBase === undefined) {
    		  log.info("        TENDENCIA: ", '0', AMBITO);
            }else{
              log.info("        TENDENCIA: ", TendenciaMonedaBase, AMBITO);
            }
    	}
        log.info('-------------------------------------------');
        if ( MONEDASALDO === MonCoti ){
            log.info("       COTIZACION: ", Vmoneda_cotizacion, AMBITO);
            log.info("            FECHA: ", VCfecha, AMBITO);
        	log.info("  PRECIO ANTERIOR: ", "= " + ValPrecAntMC +" =", AMBITO);
        	log.info("    PRECIO ACTUAL: ", "= " + ValPrecAct +" =", AMBITO);
        	log.info("        TENDENCIA: ", "[[*** "+ parseFloat(TendenciaMonedaCotizacion.toFixed(4)) +" ***]]",'Invertir' );
        }else{
            log.info("       COTIZACION: ", Vmoneda_cotizacion, AMBITO);
            log.info("            FECHA: ", VCfecha, AMBITO);
        	log.info("  PRECIO ANTERIOR: ", ValPrecAntMC, AMBITO);
        	log.info("    PRECIO ACTUAL: ", ValPrecAct, AMBITO);
            if ( TendenciaMonedaCotizacion === undefined) {
              log.info("        TENDENCIA: ", 0, AMBITO);
            }else{
              log.info("        TENDENCIA: ", TendenciaMonedaCotizacion, AMBITO);
            }
        }
        /**/
    },

    'ValidarRanking': function(MONEDA){
        try{
            var LMCM = Parametros.findOne( { dominio : "limites", nombre : "LimiteMaximoCompraMonedas", estado : true  })
            var LIMITE_COMP_MON = LMCM.valor
            var TmpTCMB = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_base" : MONEDA, "estado" : 'A' }}, { $sort: { "periodo1.Base.tendencia" : -1 }}, { $limit: LIMITE_COMP_MON } ]);
            var TmpTCMC = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_cotizacion" : MONEDA, "estado" : 'A' }}, { $sort: { "periodo1.Cotizacion.tendencia" : -1 }}, { $limit: LIMITE_COMP_MON } ]);
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

        Meteor.call("GuardarLogEjecucionTrader", ' *CALCULANDO RANKING DE LOS TIPOS DE CAMBIO*');
        Meteor.call("GuardarLogEjecucionTrader", ['             MONEDA: ']+[MONEDA]);
        var LMCM = Parametros.findOne( { dominio : "limites", nombre : "LimiteMaximoCompraMonedas", estado : true  })
        var LIMITE_COMP_MON = LMCM.valor;

        var CPTC = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA,"tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: LIMITE_COMP_MON }, { $count: "CantidadDeTiposDeCambios" } ]);
        var RTDC = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA,"tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: LIMITE_COMP_MON } ]);
        

        if ( CPTC[0] === undefined ){
            var CantPropTipoCambios = 0
        }else{
            var CantPropTipoCambios = CPTC[0].CantidadDeTiposDeCambios;
        }

        var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
        var PTDC = PTC[0];
        Meteor.call("GuardarLogEjecucionTrader", ["  Total de Tipos de Cambio Detectados: "]+[CantPropTipoCambios]);

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
                            var RecalcIverPrec = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA, VInversion);
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
                                    var RecalcIverPrec = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA, VInversion);
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
                                    var RecalcIverPrec = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA, VInversion);
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
                                    var RecalcIverPrec = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA, VInversion);
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
                                    var RecalcIverPrec = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA, VInversion);
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

        Meteor.call('Invertir', MONEDA, LIMITE_AP_DEP, CantPropTipoCambiosValidados );
    },

    'Invertir': function( MONEDA, LIMITE_AP_DEP, CANT_TIP_CAMBIOS_VALIDADOS ){
    	var idTrans = 0;
        fecha = moment (new Date());
        var CRTC2=1;

        log.info("Valores recibidos: ", " MONEDA: "+ MONEDA+ " LIMITE_AP_DEP: "+ LIMITE_AP_DEP+ " CANT_TIP_CAMBIOS_VALIDADOS: "+CANT_TIP_CAMBIOS_VALIDADOS,'Invertir')

        try{ 
            var RankingTiposDeCambios = TmpTipCambioXMonedaReord.aggregate([ { $match: { "moneda_saldo" : MONEDA, estado : "A", "tendencia" : { $gte : LIMITE_AP_DEP }}}, { $sort: { "tendencia" : -1 }}, { $limit: CANT_TIP_CAMBIOS_VALIDADOS } ]);
            var PTC = Parametros.aggregate([{ $match : { dominio : "limites", nombre : "PropPorcInver", estado : true  } }, { $project: {_id : 0, valor : 1}}])
            var ProporcionTipoCambios = PTC[0];
        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };

        Meteor.call("GuardarLogEjecucionTrader", ["  Tipos de cambios que pueden invertirse: "]+[CANT_TIP_CAMBIOS_VALIDADOS]);

        if ( CANT_TIP_CAMBIOS_VALIDADOS === 0 ) {
            /*
            Meteor.call("GuardarLogEjecucionTrader", ["            **** EN ESPERA **** "]);
            Meteor.call("GuardarLogEjecucionTrader", ["   | Tendencias Analizadas no superan |"]);
            Meteor.call("GuardarLogEjecucionTrader", ["   |   limites Mínimos configurados   |"]);
            Meteor.call("GuardarLogEjecucionTrader", ["   Valor Mínimo Actual Configurado: "]+[LIMITE_AP_DEP]);
            /**/

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
            /*
            Meteor.call("GuardarLogEjecucionTrader", '--------------   FINALIZADO   --------------');
            Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
            /**/
        }else{
            for ( CTCV = 0, TTCV = RankingTiposDeCambios.length; CTCV <= TTCV; CTCV++ ) {
                var Tendencia = RankingTiposDeCambios[0].tendencia;
                Meteor.call("GuardarLogEjecucionTrader", '             **** INVERTIR **** ');
                Meteor.call("GuardarLogEjecucionTrader", '   | Realizando Calculos de inversión |');
                Meteor.call("GuardarLogEjecucionTrader", ['         TENDENCIA: ']+[Tendencia]);

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

            Meteor.call("GuardarLogEjecucionTrader", '--------------   FINALIZADO   --------------');
            Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        }
    },
    
    'CrearNuevaOrder':function(TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){
        var Robot = Parametros.findOne( { dominio : "Prueba", nombre : "robot" } );
        if ( Robot.valor === 0 ) {
            var AMBITO = 'Invertir'
            log.info("Valores recibidos CrearNuevaOrder", " TIPO_CAMBIO: "+ TIPO_CAMBIO+" CANT_INVER: "+ CANT_INVER+ " MON_B: "+ MON_B+ " MON_C: "+MON_C+ " MONEDA_SALDO: "+ MONEDA_SALDO+ " MONEDA_COMISION: "+ MONEDA_COMISION+ " ID_LOTE: "+ ID_LOTE, AMBITO);
        }else if ( Robot.valor === 1 ) {
            var AMBITO = 'Robot'
            log.info("Valores recibidos CrearNuevaOrderRobot", " TIPO_CAMBIO: "+ TIPO_CAMBIO+" CANT_INVER: "+ CANT_INVER+ " MON_B: "+ MON_B+ " MON_C: "+MON_C+ " MONEDA_SALDO: "+ MONEDA_SALDO+ " MONEDA_COMISION: "+ MONEDA_COMISION+ " ID_LOTE: "+ ID_LOTE, AMBITO);
        }

        var ContEspEdoOrd = 0;
        var CONSTANTES = Meteor.call("Constantes");
        var IdTran = Meteor.call("SecuenciasGBL", 'IdGanPerdLocal');
        var IdTransaccionActual = Meteor.call("CompletaConCero", IdTran, 32);
        //log.info('Valor de Robot', Robot, AMBITO);

        GananciaPerdida.insert({
                                Operacion : {   
                                                ID_LocalAct : IdTransaccionActual,
                                                Id_Lote: ID_LOTE}
                            });

        Meteor.call("GuardarLogEjecucionTrader", 'Creando una nueva orden');

        var fecha = new Date();
        log.info("Valor de fecha:", fecha, AMBITO)

        if ( MON_B === MONEDA_SALDO ) {
            var TP = 'sell'
            var V_TipoOperaciont = 'VENTA';
        } else if ( MON_C === MONEDA_SALDO ) {
            var TP = 'buy'
            var V_TipoOperaciont = 'COMPRA';
        }


        var RecalcIverPrec = Meteor.call("CalcularIversionPromedio", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
        var InversionRealCalc = RecalcIverPrec.MontRealIversionCal
        
        log.info("Valore de MON_B: ", MON_B, AMBITO);
        log.info("Valore de MON_C: ", MON_C, AMBITO);
        log.info("Valore de V_TipoOperaciont: ", V_TipoOperaciont, AMBITO);
        log.info("Valore de MONEDA_SALDO: ", MONEDA_SALDO, AMBITO);
        log.info("Valore de CANT_INVER: ", CANT_INVER, AMBITO);
        log.info("Valore de RecalcIverPrec: ", RecalcIverPrec, AMBITO);
        log.info("Valore de InversionRealCalc: ", InversionRealCalc, AMBITO);
        /**/
        var TC = TiposDeCambios.findOne({ tipo_cambio : TIPO_CAMBIO })
        var MinimoInversion = TC.valor_incremento
        if ( parseFloat(RecalcIverPrec.MontIversionCal) >= parseFloat(MinimoInversion) ) {

            
            if ( Robot.valor === 0 ) {
                datos='clientOrderId='+IdTransaccionActual+'&symbol='+TIPO_CAMBIO+'&side='+TP+'&timeInForce='+'GTC'+'&type=limit'+"&quantity="+RecalcIverPrec.MontIversionCal+'&price='+RecalcIverPrec.MejorPrecCal;
                log.info("Datos a Enviar: ", datos, AMBITO);


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
            }else if ( Robot.valor === 1 ) {
                log.info(" Valor de if ( "+ parseFloat(RecalcIverPrec.MontIversionCal)+" >= "+parseFloat(MinimoInversion) +" )",'', AMBITO);
                //var INV_REAL = RecalcIverPrec.MontRealIversionCal;

                log.info("Valor de IdTransaccionActual: ", IdTransaccionActual, AMBITO);
                log.info("Valor de TIPO_CAMBIO: ", TIPO_CAMBIO, AMBITO);
                log.info("Valor de TP: ", TP, AMBITO);
                log.info("Valor de InversionRealCalc: ", InversionRealCalc, AMBITO);
                log.info("Valor de RecalcIverPrec.MontIversionCal: ", RecalcIverPrec.MontIversionCal, AMBITO);
                log.info("Valor de RecalcIverPrec.MejorPrecCal: ", RecalcIverPrec.MejorPrecCal, AMBITO);
                log.info("Valor de RecalcIverPrec.comision_hbtc: ", RecalcIverPrec.comision_hbtc, AMBITO);
                log.info("Valor de RecalcIverPrec.comision_mercado: ", RecalcIverPrec.comision_mercado, AMBITO);

                var DatosRobot = {  clientOrderId : IdTransaccionActual, 
                                    symbol : TIPO_CAMBIO, 
                                    side : TP, 
                                    timeInForce : 'GTC', 
                                    type : 'limit', 
                                    quantity : RecalcIverPrec.MontIversionCal, 
                                    price : RecalcIverPrec.MejorPrecCal, 
                                    comision_m : RecalcIverPrec.comision_hbtc,  
                                    comision_h : RecalcIverPrec.comision_mercado }

                log.info(" Valor de DatosRobot: ", DatosRobot, AMBITO);


                log.info(" Estoy aca 1",'', AMBITO);
                do {            
                    var Orden = Meteor.call('GenerarOrderRobot', DatosRobot);
                    log.info(" Estoy aca 2",'', AMBITO);
                    Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrderRobot: recibi Orden: ']+[Orden]); 
                    if ( Orden === undefined ) {
                        Meteor.call('sleep', 4);
                    }
                }while( Orden === undefined );
            }

        }else{
            var Orden = {  status: 'Quantity too low' }
        }

        var Estado_Orden = Orden.status
        Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrder: recibi estado: ']+[Estado_Orden]); 
        ContpartiallyFilled = 0;

        log.info(' Valor de Orden 1: ', Orden, AMBITO);
        

        while( Estado_Orden !== "filled" ){
            log.info('Estoy en el while','', AMBITO);
            log.info(' Valor de Orden 2: ', Orden, AMBITO);
            log.info(' Valor de Estado_Orden: ', Estado_Orden, AMBITO);
            fecha = moment (new Date());
            if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" ) {
                var V_IdHitBTC = Orden.id
                log.info(' Estoy en  if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" )','', AMBITO);
                log.info(' Valor de Orden 3: ', Orden, AMBITO);
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

                if ( Robot.valor === 0 ) {
                    const Resultado = Meteor.call("ValidarEstadoOrden", Orden)
                }else if ( Robot.valor === 1 ) {
                    const Resultado = Meteor.call("ValidarEstadoOrdenRobot", Orden)
                }
                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO FINAL CULMINACION: ']+[fecha._d]);
                log.info(' Valor de Orden 4: ', Orden, AMBITO);
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Resultado: ']+[Resultado[0]]);

                var Orden = Resultado
                var Estado_Orden = Resultado.status;
                log.info(' Valor de Orden 5: ', Orden, AMBITO);
                //var Estado_Orden = Resultado;        
                ContEspEdoOrd = ContEspEdoOrd + 1;

                if ( ContEspEdoOrd === 20 ) {
                    //var Orden = Meteor.call("CancelarOrden", IdTransaccionActualesta );
                    var Estado_Orden = Orden.status;
                }

            }

            if ( Estado_Orden === "DuplicateclientOrderId" || Estado_Orden === "suspended" || Estado_Orden === "Estado_Orden" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" || Estado_Orden === "Quantity too low" ) {
                log.info(' Estoy en if ( Estado_Orden === "DuplicateclientOrderId" || Estado_Orden === "suspended" || Estado_Orden === "Estado_Orden" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" )','', AMBITO);
                var V_IdHitBTC = Orden.id
                log.info(' Valor de Orden 6: ', Orden, AMBITO);

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
                    log.info(' Estoy en if if ( Estado_Orden === "DuplicateclientOrderId")','', AMBITO);
                    Meteor.call("GuardarLogEjecucionTrader", [' CalcularIversionPromedio: Orden Fallida, Status Recibido: "']+[Estado_Orden]+['", Reintentando ejecución de Orden ..., con los siguientes datos: TIPO_CAMBIO :']+[TIPO_CAMBIO]+[',CANT_INVER : ']+[CANT_INVER][', MON_B :']+[MON_B][', MON_C :']+[, MON_C]);
                    Meteor.call('CrearNuevaOrder', TIPO_CAMBIO,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE)
                }else{
                    TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
                }
                log.info(' Valor de Orden 7: ', Orden, AMBITO);
                break
            }

            if ( Estado_Orden === "errorisnotdefined" ) {
                log.info(' Valor de Orden 8: ', Orden, AMBITO);
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
                log.info(' Valor de Orden 9: ', Orden, AMBITO);
                TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO })
                break
            }

            if ( Estado_Orden === "Insufficientfunds" ) {
                log.info(" Insufficientfunds: Valor de Orden 10: ", Orden, AMBITO);
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



                if ( Robot.valor === 0 ) {
                    const Resultado = Meteor.call("ValidarEstadoOrden", Orden)
                }else if ( Robot.valor === 1 ) {
                    const Resultado = Meteor.call("ValidarEstadoOrdenRobot", Orden)
                }
                var Orden = Resultado
                log.info(' Valor de Orden 11: ', Orden, AMBITO);
                var Estado_Orden = Resultado.status;
                log.info(" Insufficientfunds: Valor de Estado_Orden: ", Estado_Orden, AMBITO);
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Resultado: ']+[Resultado[0]]);
                TmpTipCambioXMonedaReord.remove({ "moneda_saldo" : MONEDA_SALDO})
            } 
        }

        log.info(' Valor de Orden 12: ', Orden, AMBITO);

        if ( Estado_Orden === "filled" ) {
            
            if ( Robot.valor === 0 ) {
                log.info(" if ( Estado_Orden === filled ) : Voy a Guardar", AMBITO);
                log.info(' Valor de Orden 13: ', Orden, AMBITO);
                log.info(" if ( Estado_Orden === filled ) : Enviando ", TIPO_CAMBIO+' '+ CANT_INVER+' '+ InversionRealCalc+' '+MON_B+' '+MON_C+' '+MONEDA_SALDO+' '+MONEDA_COMISION+' '+Orden+' '+ID_LOTE, AMBITO);
                Meteor.call('GuardarOrden', TIPO_CAMBIO, CANT_INVER, parseFloat(InversionRealCalc), MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );
                log.info(" if ( Estado_Orden === filled ) : Ya guardé",'', AMBITO);

            }else if ( Robot.valor === 1 ) {
                log.info(" if ( Estado_Orden === filled ) : Voy a Guardar",'', AMBITO);
                log.info(' Valor de Orden 13: ', Orden, AMBITO);
                log.info(''," if ( Estado_Orden === filled ) : Enviando "+ TIPO_CAMBIO+' '+CANT_INVER+' '+InversionRealCalc+' '+MON_B+' '+MON_C+' '+MONEDA_SALDO+' '+MONEDA_COMISION+' '+Orden+' '+ID_LOTE, AMBITO);
                Meteor.call('GuardarOrdenRobot', TIPO_CAMBIO, CANT_INVER,  parseFloat(InversionRealCalc), MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );
                log.info(" if ( Estado_Orden === filled ) : Ya guardé",'', AMBITO);
            }
        }
        /**/
    },

});