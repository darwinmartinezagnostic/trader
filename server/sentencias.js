import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

	'ActualizaTiposDeCambios':function(TC, VE, VA, CTCP, CTCA, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
		TiposDeCambios.update(	{ tipo_cambio : TIPOCAMBIO },
		                        { $set:{ 	estado: ValorEstadoTipoCambio,
		                        			activo : ValorActivo,
		                                    c_estado_p: ContEstadoTipoCambioPrinc,
		                                    c_estado_a: ContEstadoTipoCambioAux,
		                                    "periodo1.Base.id_hitbtc": PeriodoId_hitbtcAct,
		                                    "periodo1.Base.fecha": PeriodoFechaAct,
		                                    "periodo1.Base.precio" : PeriodoPrecioAct,
		                                    "periodo1.Base.tipo_operacion": PeriodoTipoOperacionAct,
		                                    "periodo1.Base.tendencia" : parseFloat(TendenciaMonedaBase.toFixed(4)),
		                                    "periodo1.Cotizacion.id_hitbtc": PeriodoId_hitbtcAntMC,
		                                    "periodo1.Cotizacion.fecha": PeriodoFechaAntMC,
		                                    "periodo1.Cotizacion.precio" : PeriodoPrecioAntMC,
		                                    "periodo1.Cotizacion.tipo_operacion": PeriodoTipoOperacionAntMC,
		                                    "periodo1.Cotizacion.tendencia" : parseFloat(TendenciaMonedaCotizacion.toFixed(4)) }
		                        });
	},

	'ActualizaTempTiposCambioXMoneda':function( TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDMB, FMB, PMB, TOMB, TMB, IDMC, FMC, PMC, TOMC, TMC ){
		TempTiposCambioXMoneda.update(	{ tipo_cambio : TIPOCAMBIO },
		                                { $set:{"moneda_base" : VTPCBM.moneda_base ,
		                                		"moneda_cotizacion" : VTPCBM.moneda_cotizacion,
		                                    	"activo" : VTPCBM.activo,
		                                    	"habilitado" : VTPCBM.habilitado,
		                                    	"comision_hitbtc" : VTPCBM.comision_hitbtc,
		                                    	"comision_mercado" : VTPCBM.comision_mercado,
		                                    	"moneda_apli_comision" : VTPCBM.moneda_apli_comision,
		                                    	"valor_incremento" : VTPCBM.valor_incremento,
		                                    	"estado" : ValorEstadoTipoCambio,
		                                    	"c_estado_p" : VTPCBM.c_estado_p,
		                                    	"c_estado_a" : VTPCBM.c_estado_a,
		                                    	"min_compra" : VTPCBM.min_compra,
		                                    	"min_compra_equivalente" : VTPCBM.min_compra_equivalente,
		                                    	"periodo1.Base.id_hitbtc": PeriodoId_hitbtcAct,
		                                    	"periodo1.Base.fecha": PeriodoFechaAct,
		                                    	"periodo1.Base.precio" : PeriodoPrecioAct,
		                                    	"periodo1.Base.tipo_operacion": PeriodoTipoOperacionAct,
		                                     	"periodo1.Base.tendencia" : parseFloat(TendenciaMonedaBase.toFixed(4)),                                    										
		                                    	"periodo1.Cotizacion.id_hitbtc": PeriodoId_hitbtcAntMC,
		                                    	"periodo1.Cotizacion.fecha": PeriodoFechaAntMC,
		                                    	"periodo1.Cotizacion.precio" : PeriodoPrecioAntMC,
		                                    	"periodo1.Cotizacion.tipo_operacion": PeriodoTipoOperacionAntMC,
		                                     	"periodo1.Cotizacion.tendencia" : parseFloat(TendenciaMonedaCotizacion.toFixed(4))}},
		                                { "multi" : true,"upsert" : true });
	}

});