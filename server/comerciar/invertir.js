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
        //console.log("Estoy en EvaluarTendencias 1");
        
        try{
        	var TradAnt = TiposDeCambios.findOne({ tipo_cambio : TIPOCAMBIO });
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
        var RegAct = TransProcesar[0];

        //console.log("Valores Conseguidos de RegAnt: ", RegAnt);
        //console.log("Valores Conseguidos de RegAct: ", RegAct);

        var MonBase =  RegAnt.moneda_base;
        var MonCoti =  RegAnt.moneda_cotizacion;

        var LimtContEdoAct = LCEA[0].valor;
        var LimtContAuxEdoAct = LCEAA[0].valor;
        var LimtContEdoVer = LCEV[0].valor;
        var LimtContAuxEdoVer = LCEAV[0].valor;
        var LimtAprecDeprec = LApDep[0].valor;
	    console.log("Valor de LimtAprecDeprec: ", LimtAprecDeprec)

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

                    
        /*

        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", ['          TIPO DE CAMBIO: ']+[TIPOCAMBIO]);
        console.log('--------------------------------------------');
        console.log(' ');
        Meteor.call("GuardarLogEjecucionTrader", '-------- TRANSACCION ANTERIOR MB  ---------');
        console.log(' ');
        Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAntMB]);
        Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAntMB]);
        Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[ PeriodoPrecioAntMB.toString().replace(".", ",") ]);
        Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAntMB]);
        //Meteor.call("GuardarLogEjecucionTrader", [' COMISION: ']+[PeriodoTipoOperacionAntMB]);
        console.log('--------------------------------------------');
        console.log(' ');
        Meteor.call("GuardarLogEjecucionTrader", '-------- TRANSACCION ANTERIOR MC  ---------');
        console.log(' ');
        Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAntMC]);
        Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAntMC]);
        Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[ PeriodoPrecioAntMC.toString().replace(".", ",") ]);
        Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAntMC]);
        //Meteor.call("GuardarLogEjecucionTrader", [' COMISION: ']+[PeriodoTipoOperacionAntMB]);
        console.log('--------------------------------------------');
        console.log(' ');
        Meteor.call("GuardarLogEjecucionTrader", '------------ ULTIMA TRANSACCION ------------');
        console.log(' ');
        Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAct]);
        Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAct]);
        Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[ PeriodoPrecioAct.toString().replace(".", ",") ]);
        Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAct]);
        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '          CALCULANDO TENDENCIA ');
        console.log('--------------------------------------------');
        console.log(' ');
        */

        var ValPrecAntMB = PeriodoPrecioAntMB;
        var ValPrecAntMC = PeriodoPrecioAntMC;
        var ValPrecAct = PeriodoPrecioAct;

        var ProcenApDpMB = ((( ValPrecAct - ValPrecAntMB ) / ValPrecAntMB ) * 100 ) ;
        var ProcenApDpMC = ((( ValPrecAct - ValPrecAntMC ) / ValPrecAntMC ) * 100 ) ;

        /*
        console.log('Valor de MONEDASALDO:', [MONEDASALDO]);
        console.log('Valor de MonBase:', [MonBase]);
        console.log('Valor de MonCoti:', [MonCoti]);
        console.log(' ');
		*/
        try{
                    if ( MONEDASALDO === MonBase ){
                        var TMA = 1;
                        if ( ValPrecAct > ValPrecAntMB) {
                           
                            //var TendenciaMonedaBase = ProcenApDpMB
                            var TendenciaMonedaBase = ( ProcenApDpMB * -1 )

                            Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonBase");
                            Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                            console.log('--------------------------------------------');
                            
                            switch( EstadoTipoCambio ){
                                case 'V':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonBase : ESTOY EN 'ValPrecAct > ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'V'");
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

									}
                                break;
                                case 'I':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonBase : ESTOY EN 'ValPrecAct > ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'I'");
                                    var ContEstadoTipoCambioPrinc = 0;
                                    var ContEstadoTipoCambioAux = 0;
                                    var ValorEstadoTipoCambio = "V"
                                    var ValorActivo = "S";

	                                    //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  )
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaBase.toFixed(4)));

                                break;
                                case 'A':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonBase : ESTOY EN 'ValPrecAct > ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'A'");
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
                            
                            //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                        }
                        else if ( ValPrecAct <= ValPrecAntMB ){
                            
                            var TendenciaMonedaBase = ( ProcenApDpMB * -1 )

                            Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonBase");
                            Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA BASE: ']+[MonBase]+[' = ']+[TendenciaMonedaBase.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                            
                            console.log('--------------------------------------------');
                            
                            switch( EstadoTipoCambio ){
                                case 'V':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonBase : ESTOY EN 'ValPrecAct <= ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'V'");
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
                                case 'I':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonBase : ESTOY EN 'ValPrecAct <= ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'I'");
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
                                case 'A':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonBase : ESTOY EN 'ValPrecAct <= ValPrecAntMB' SWITCH EstadoTipoCambio CASE 'A'");
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

                            //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                        }
                    }
                    else if ( MONEDASALDO === MonCoti ) {
                        var TMA = 2;
                        if ( ValPrecAct > ValPrecAntMC ) {


                            var TendenciaMonedaCotizacion = ProcenApDpMC
                            //var TendenciaMonedaCotizacion = ( ProcenApDpMC * -1 )
                        	console.log('Valor de MonCoti:', [MonCoti]);

                            Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonCoti");
                            Meteor.call("GuardarLogEjecucionTrader", " VALOR ACTUAL ES MAYOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                            console.log('--------------------------------------------');
                            
                            switch( EstadoTipoCambio ){
                                case 'V':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonCoti : ESTOY EN 'ValPrecAct > ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'V'");
                                    if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                        var ValorEstadoTipoCambio = "V";
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    }else if ( ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    }else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    }else if ( ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";

                                        //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                        //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                        Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                        //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                        Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );

                                    };
                                break;
                                case 'I':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonCoti : ESTOY EN 'ValPrecAct > ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'I'");
                                    var ContEstadoTipoCambioPrinc = 0;
                                    var ContEstadoTipoCambioAux = 0;
                                    var ValorEstadoTipoCambio = "V"
                                    var ValorActivo = "S";

                                    //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                                break;
                                case 'A':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonCoti : ESTOY EN 'ValPrecAct > ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'A'");
                                    var ContEstadoTipoCambioPrinc = 0;
                                    var ContEstadoTipoCambioAux = 0;
                                    var ValorEstadoTipoCambio = "A"
                                    var ValorActivo = "S";

                                    //'ActualizaTiposDeCambios':function(TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM  ){
                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM )
                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base , VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)) );
                                break;
                            };
                            
                            //OperacionesCompraVenta.update({ tipo_cambio : TIPOCAMBIO, "muestreo.periodo1" : false },{$set:{ "muestreo.periodo1" : true }}, {"multi" : true,"upsert" : true});
                        }
                        else if ( ValPrecAct <= ValPrecAntMC ){
                            //var TendenciaMonedaCotizacion = ( ProcenApDpMC * -1 )
                            var TendenciaMonedaCotizacion = ( ProcenApDpMC )

                            Meteor.call("GuardarLogEjecucionTrader", "  MONEDASALDO == MonCoti");
                            Meteor.call("GuardarLogEjecucionTrader", "  VALOR ACTUAL ES MENOR QUE VALOR ANTERIOR");
                            Meteor.call("GuardarLogEjecucionTrader", [' TENDENCIA MONEDA COTIZACION: ']+[MonCoti]+[' = ']+[TendenciaMonedaCotizacion.toFixed(4)]);
                            Meteor.call("GuardarLogEjecucionTrader", [' ESTADO TIPO CAMBIO: ']+[EstadoTipoCambio]);
                            console.log('--------------------------------------------');

                            switch( EstadoTipoCambio ){
                                case 'V':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonCoti : ESTOY EN 'ValPrecAct <= ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'V'");
                                    if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux < LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ContEstadoTipoCambioAux = ContEstadoTipoCambioAux + 1;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoVer && ContEstadoTipoCambioAux === LimtContAuxEdoVer  ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    };
                                break;
                                case 'I':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonCoti : ESTOY EN 'ValPrecAct <= ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'I'");
                                    if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct ){
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "I"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }
                                break;
                                case 'A':
                                    Meteor.call("GuardarLogEjecucionTrader", " MONEDASALDO = MonCoti : ESTOY EN 'ValPrecAct <= ValPrecAntMC' SWITCH EstadoTipoCambio CASE 'A'");
                                    if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc < LimtContEdoAct ) {
                                        var ContEstadoTipoCambioPrinc = ContEstadoTipoCambioPrinc + 1;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else if ( PeriodoId_hitbtcAntMC === PeriodoId_hitbtcAct && ContEstadoTipoCambioPrinc === LimtContEdoAct ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "V"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

                                    }else if ( PeriodoId_hitbtcAntMC !== PeriodoId_hitbtcAct ) {
                                        var ContEstadoTipoCambioPrinc = 0;
                                        var ContEstadoTipoCambioAux = 0;
                                        var ValorEstadoTipoCambio = "A"
                                        var ValorActivo = "S";



                                        //'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
	                                    //Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));
	                                    Meteor.call('ActualizaTiposDeCambios',TMA, TIPOCAMBIO, ValorEstadoTipoCambio, ValorActivo, ContEstadoTipoCambioPrinc, ContEstadoTipoCambioAux, PeriodoId_hitbtcAct, PeriodoFechaAct, PeriodoPrecioAct, PeriodoTipoOperacionAct, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

	                                    //'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
	                                    Meteor.call('ActualizaTempTiposCambioXMoneda', TMA, TIPOCAMBIO, VTPCBM.moneda_base, VTPCBM.moneda_cotizacion, VTPCBM.activo, VTPCBM.habilitado, VTPCBM.comision_hitbtc, VTPCBM.comision_mercado, VTPCBM.moneda_apli_comision, VTPCBM.valor_incremento, ValorEstadoTipoCambio, VTPCBM.c_estado_p, VTPCBM.c_estado_a, VTPCBM.min_compra, VTPCBM.min_compra_equivalente, PeriodoId_hitbtcAntMC, PeriodoFechaAntMC, PeriodoPrecioAntMC, PeriodoTipoOperacionAntMC, parseFloat(TendenciaMonedaCotizacion.toFixed(4)));

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

        Meteor.call("GuardarLogEjecucionTrader", '-------- TRANSACCION GUARDADA  ---------');
        //console.log("Valor de ValorGuardado: ", ValorGuardado);

        Vtipo_cambio = ValorGuardado[0].tipo_cambio;
        Vmoneda_base = ValorGuardado[0].moneda_base;
        Vmoneda_cotizacion = ValorGuardado[0].moneda_cotizacion;
        VMONEDASALDO = MONEDASALDO;
        VBfecha = ValorGuardado[0].periodo1.Base.fecha;
        Vid_hitbtc = ValorGuardado[0].periodo1.Base.id_hitbtc;
        VBprecio = ValorGuardado[0].periodo1.Base.precio.toString().replace("." , ",");
        VBtendencia = ValorGuardado[0].periodo1.Base.tendencia;
        VCfecha = ValorGuardado[0].periodo1.Cotizacion.fecha;
        VCid_hitbtc = ValorGuardado[0].periodo1.Cotizacion.id_hitbtc;
        VCprecio = ValorGuardado[0].periodo1.Cotizacion.precio.toString().replace("." , ",");
        VCtendencia = ValorGuardado[0].periodo1.Cotizacion.tendencia;



        console.log(" TIPO CAMBIO: ", Vtipo_cambio);
        console.log(" MONEDA BASE: ", Vmoneda_base);
        console.log(" MONEDA COTIZACION: ", Vmoneda_cotizacion);
        console.log(" MONEDA SALDO: ", MONEDASALDO);
        console.log(" PRECIO ACTUAL: ", PeriodoPrecioAct.toString().replace(".", ",") );
        console.log(" PERIODO BASE FECHA: ", VBfecha);
        console.log(" PERIODO BASE ID: ", Vid_hitbtc);
        if ( MONEDASALDO === MonBase ){
        	console.log(" PERIODO BASE PRECIO ANTERIOR: ", "== ",ValPrecAntMB," =");
        	console.log(" PERIODO BASE PRECIO ACTUAL: ", "= ",VBprecio," =");
        	console.log(" PERIODO BASE TENDENCIA: ", "[*** ", VBtendencia ," ***]" );
    	}else{
    		console.log(" PERIODO BASE PRECIO ANTERIOR: ", ValPrecAntMB);
    		console.log(" PERIODO BASE PRECIO ACTUAL: ", VBprecio);
    		console.log(" PERIODO BASE TENDENCIA: ", VBtendencia);
    	}
        console.log(" PERIODO COTIZACION FECHA: ", VCfecha);
        console.log(" PERIODO COTIZACION ID: ", VCid_hitbtc);
        if ( MONEDASALDO === MonCoti ){
        	console.log(" PERIODO COTIZACION PRECIO ANTERIOR: ", "= ",ValPrecAntMC," =");
        	console.log(" PERIODO COTIZACION PRECIO ACTUAL: ", "= ",VCprecio," =");
        	console.log(" PERIODO COTIZACION TENDENCIA: ", "[*** ", VCtendencia ," ***]" );
        }else{
        	console.log(" PERIODO COTIZACION PRECIO ANTERIOR: ", ValPrecAntMC);
        	console.log(" PERIODO COTIZACION PRECIO ACTUAL: ", VCprecio);
    		console.log(" PERIODO COTIZACION TENDENCIA: ", VCtendencia);
        }
    },

    'ValidarRanking': function(MONEDA){
        TmpTipCambioXMonedaReord.remove({ moneda_saldo : MONEDA });
        try{
            var TmpTCMB = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_base" : MONEDA }}, { $sort: { "periodo1.Base.tendencia" : -1 }}, { $limit: 3 } ]);
            for (CTMCB = 0, T_TmpTCMB = TmpTCMB.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMB = TmpTCMB[CTMCB];
                //console.log("Valor de V_TmpTCMB", V_TmpTCMB)
                TmpTipCambioXMonedaReord.insert({ "tipo_cambio": V_TmpTCMB.tipo_cambio,
                                                    "moneda_base": V_TmpTCMB.moneda_base,
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
                                                    "tendencia" : V_TmpTCMB.periodo1.Base.tendencia });
           
            };

            var TmpTCMC = TempTiposCambioXMoneda.aggregate([ { $match: { "moneda_saldo" : MONEDA, "moneda_base" : MONEDA }}, { $sort: { "periodo1.Cotizacion.tendencia" : -1 }}, { $limit: 3 } ]);
            for (CTMCB = 0, T_TmpTCMB = TmpTCMC.length; CTMCB < T_TmpTCMB; CTMCB++) {
                var V_TmpTCMC = TmpTCMC[CTMCB];
                //console.log("Valor de V_TmpTCMC", V_TmpTCMC)
                TmpTipCambioXMonedaReord.insert({ "tipo_cambio": V_TmpTCMC.tipo_cambio,
                                                    "moneda_base": V_TmpTCMC.moneda_base,
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
    	var idTrans = 0;
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
                    var Tendencia = TipoCambioRanking.tendencia;
                    var PorcentajeInversion = ProporcionTipoCambios.valor.p11
                    var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                    var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                    var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                    var MonCBas = TipoCambioRanking.moneda_base;
                    var MonCoti = TipoCambioRanking.moneda_cotizacion;


                    var SaldoInverCalculado = SaldoActualMoneda*ProporcionTipoCambios.valor.p11;
                            
                    console.log('--------------------------------------------');
                    Meteor.call("GuardarLogEjecucionTrader", ['                  POSICIÓN:']+[CRTC1+1]);
                    Meteor.call("GuardarLogEjecucionTrader", [' ******** ']+[' TIPO CAMBIO: ']+[TipoCambio]+[' ********']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[MonCBas]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA COTIZACION: ']+[MonCoti]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[Tendencia]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                    Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);

                    Meteor.call('CrearNuevaOrder',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);

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
                                var Tendencia = TipoCambioRanking.tendencia;
                                var PorcentajeInversion = ProporcionTipoCambios.valor.p12
                                var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                                var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                                var MonCBas = TipoCambioRanking.moneda_base;
                                var MonCoti = TipoCambioRanking.moneda_cotizacion;                                
                                var SaldoInverCalculado = SaldoActualMoneda*PorcentajeInversion;                                

                                Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                                Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);

                                Meteor.call('CrearNuevaOrder',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);

                            break;
                            case 1:                                    
                                Meteor.call("GuardarLogEjecucionTrader", [' ActualizaSaldoActual']+[TipoCambioRanking.moneda_saldo]);
                                var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                                var TipoCambio = TipoCambioRanking.tipo_cambio
                                var Tendencia = TipoCambioRanking.tendencia;
                                var PorcentajeInversion = ProporcionTipoCambios.valor.p22
                                var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                                var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                                var MonCBas = TipoCambioRanking.moneda_base;
                                var MonCoti = TipoCambioRanking.moneda_cotizacion;    
                                var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2                                

                                Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                                Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);

                                Meteor.call('CrearNuevaOrder',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                
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
                        var TipoCambioRanking = RankingTiposDeCambios[CRTC3];
                            
                        console.log('--------------------------------------------');
                        Meteor.call("GuardarLogEjecucionTrader", ['                  POSICIÓN:']+[CRTC3+1]);
                        Meteor.call("GuardarLogEjecucionTrader", [' ******** ']+[' TIPO CAMBIO: ']+[TipoCambioRanking.tipo_cambio]+['********']);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[TipoCambioRanking.moneda_base]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA COTIZACION: ']+[TipoCambioRanking.moneda_cotizacion]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     TENDENCIA: ']+[TipoCambioRanking.periodo1.Base.tendencia_moneda_base]);
                        switch (CRTC3){
                            case 0:
                                var TipoCambio = TipoCambioRanking.tipo_cambio
                                var Tendencia = TipoCambioRanking.tendencia;
                                var PorcentajeInversion = ProporcionTipoCambios.valor.p12
                                var SaldoActualMoneda = TipoCambioRanking.saldo_moneda_tradear
                                var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                                var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                                var MonCBas = TipoCambioRanking.moneda_base;
                                var MonCoti = TipoCambioRanking.moneda_cotizacion;                                
                                var SaldoInverCalculado = SaldoActualMoneda*PorcentajeInversion;                                

                                Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                                Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);

                                Meteor.call('CrearNuevaOrder',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);

                            break;
                            case 1:                                    
                                Meteor.call("GuardarLogEjecucionTrader", [' ActualizaSaldoActual']+[TipoCambioRanking.moneda_saldo]);
                                var SAM = Monedas.find({ moneda : TipoCambioRanking.moneda_saldo }).fetch()
                                var SaldoActualMoneda = SAM[0].saldo.tradeo.activo
                                var TipoCambio = TipoCambioRanking.tipo_cambio
                                var Tendencia = TipoCambioRanking.tendencia;
                                var PorcentajeInversion = ProporcionTipoCambios.valor.p22
                                var MonedaSaldo = TipoCambioRanking.moneda_saldo;
                                var MonedaApCom = TipoCambioRanking.moneda_apli_comision;
                                var MonCBas = TipoCambioRanking.moneda_base;
                                var MonCoti = TipoCambioRanking.moneda_cotizacion;    
                                var SaldoInverCalculado =  SaldoInvertir - comision1 - comision2                                

                                Meteor.call("GuardarLogEjecucionTrader", ['     PORCENTAJE A INVERTIR: ']+[PorcentajeInversion*100]+['%']);
                                Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TOTAL ACTUAL: ']+[SaldoActualMoneda]);
                                Meteor.call("GuardarLogEjecucionTrader", ['     MONTO A INVERTIR: ']+[SaldoInverCalculado]);

                                Meteor.call('CrearNuevaOrder',TipoCambio, SaldoInverCalculado, MonCBas, MonCoti, MonedaSaldo, MonedaApCom, IdTransaccionLoteActual);
                                
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
    
    'CrearNuevaOrder':function(TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE){

    	var CONSTANTES = Meteor.call("Constantes");
        var IdTran = Meteor.call('CalculaId', 2);
        //var IdTran = 113
        var IdTransaccionActual = Meteor.call("CompletaConCero", IdTran, 32);
    	console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", 'Creando una nueva orden');
        console.log("Valores recibidos CrearNuevaOrder", " TIPO_CAMBIO: ", TIPO_CAMBIO, " CANT_INVER: ", CANT_INVER, " MON_B: ", MON_B, " MON_C: ", MON_C, " MONEDA_SALDO: ", MONEDA_SALDO, " MONEDA_COMISION: ", MONEDA_COMISION);


        var fecha = new Date();
        console.log("Valor de fecha:", fecha)

        if ( MON_B === MONEDA_SALDO ) {
            var TP = 'sell'
            var V_TipoOperaciont = 'VENTA';
        } else if ( MON_C === MONEDA_SALDO ) {
            var TP = 'buy'
            var V_TipoOperaciont = 'COMPRA';
        }

        console.log("Valore de MON_B: ", MON_B)
        console.log("Valore de MON_C: ", MON_C)
        console.log("Valore de MONEDA_SALDO: ", MONEDA_SALDO)
        console.log("Valore de V_TipoOperaciont: ", V_TipoOperaciont)

        var RecalcIverPrec = Meteor.call("CalcularIversion", TIPO_CAMBIO, MONEDA_SALDO, CANT_INVER);
        console.log("Valor de RecalcIverPrec: ", RecalcIverPrec);

        datos='clientOrderId='+IdTransaccionActual+'&symbol='+TIPO_CAMBIO+'&side='+TP+'&timeInForce='+'GTC'+'&type=limit'+"&quantity="+RecalcIverPrec.MontIversionCal+'&price='+RecalcIverPrec.MejorPrecCal;


        console.log("Valor de datos:",  datos)
        var url_orden = CONSTANTES.ordenes;        
        
        var Orden = Meteor.call('ConexionPost', url_orden, datos);
        var Estado_Orden = Orden.status


        Meteor.call('GuardarLogEjecucionTrader', [' CrearNuevaOrder: recibi estado: ']+[Estado_Orden]); 


        while( Estado_Orden !== "filled" ){
            console.log('Estoy en el while')
            fecha = moment (new Date());
            if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" || Estado_Orden === "errorisnotdefined" ) {
                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO INICIAL: ']+[fecha._d]);                
                Meteor.call('sleep', 4);
                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO FIN ESPERA: ']+[fecha._d]);

                const Resultado = Meteor.call("ValidarEstadoOrden", ORDEN)
                console.log('Valor de Resultado', Resultado)

                Meteor.call("GuardarLogEjecucionTrader", [' TIEMPO FINAL CULMINACION: ']+[fecha._d]);
                Estado_Orden = Resultado;                        
            }

            if ( Estado_Orden === "suspended" || Estado_Orden === "Estado_Orden" || Estado_Orden === "expired" ) {
                //console.log('Dedo Guardar el fallo y salir')
                GananciaPerdida.insert({    
                                            Operacion : {   ID_LocalAct : IdTransaccionActual,
                                                            Id_Lote: ID_LOTE,
                                                            Tipo : TP,
                                                            TipoCambio : TIPO_CAMBIO,
                                                            Precio : RecalcIverPrec.MejorPrecCal,
                                                            Status : Estado_Orden,
                                                            FechaCreacion : fecha._d,
                                                            FechaActualizacion : fecha._d}
                                        });
                break
            }
            if ( Estado_Orden === "canceled" ) {
                //console.log('Dedo Guardar el estado de la cancelacion y salir')
                GananciaPerdida.insert({    
                                            Operacion : {   ID_LocalAct : IdTransaccionActual,
                                                            Id_Lote: ID_LOTE,
                                                            Tipo : TP,
                                                            TipoCambio : TIPO_CAMBIO,
                                                            Precio : RecalcIverPrec.MejorPrecCal,
                                                            Status : Estado_Orden,
                                                            FechaCreacion : fecha._d,
                                                            FechaActualizacion : fecha._d}
                                        });
                Meteor.call("GuardarLogEjecucionTrader", [' CrearNuevaOrder: Orden Fallida, Status Recibido: "']+[Estado_Orden]+['", Reintentando ejecución de Orden ..., con los siguientes datos: TIPO_CAMBIO :']+[TIPO_CAMBIO]+[',CANT_INVER : ']+[CANT_INVER][', MON_B :']+[MON_B][', MON_C :']+[, MON_C]);
                break
            }
            if ( Estado_Orden === "DuplicateclientOrderId" ) {
                //console.log('Dedo Guardar el fallo y reiniciar la ejecucion')
                
                GananciaPerdida.insert({    
                                            Operacion : {   ID_LocalAct : IdTransaccionActual,
                                                            Id_Lote: ID_LOTE,
                                                            Tipo : TP,
                                                            TipoCambio : TIPO_CAMBIO,
                                                            Precio : RecalcIverPrec.MejorPrecCal,
                                                            Status : 'Fallido',
                                                            Razon : Estado_Orden,
                                                            FechaCreacion : fecha._d,
                                                            FechaActualizacion : fecha._d}
                                        });

                Meteor.call('CrearNuevaOrder', TIPO_CAMBIO,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE)

                break
            }
            if ( Estado_Orden === "Insufficientfunds" ) {
                //console.log('Dedo Guardar el fallo y salgo')
                
                GananciaPerdida.insert({    
                                            Operacion : {   ID_LocalAct : IdTransaccionActual,
                                                            Id_Lote: ID_LOTE,
                                                            Tipo : TP,
                                                            TipoCambio : TIPO_CAMBIO,
                                                            Precio : RecalcIverPrec.MejorPrecCal,
                                                            Status : 'Fallido',
                                                            Razon : Estado_Orden,
                                                            FechaCreacion : fecha._d,
                                                            FechaActualizacion : fecha._d}
                                        });

                //Meteor.call('CrearNuevaOrder', TIPO_CAMBIO,CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ID_LOTE)

                break
            } 
        }
        //console.log('Estoy fuera del while')

        if ( Estado_Orden === "filled" ) {
            console.log('Voy a guardar mis datos de transacción')

            Meteor.call('GuardarOrden', TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, Orden, ID_LOTE );

            Meteor.call('ListaTradeoActual',TIPO_CAMBIO, 3 ); 
        }

        HistoralTransacciones.insert({ fecha : fecha, id : N_ID__ORDEN_CLIENT, tipo_cambio : TIPO_CAMBIO, tipo_transaccion : V_TipoOperaciont, moneda_base : MON_B, moneda_cotizacion : MON_C, monto : CANT_INVER, numero_orden : Orden, precio_operacion : PRECIO, estado : "Exitoso" });
    },

});