import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

	'ActualizaTiposDeCambios':function( TMA, TC, EST, VA, CTCP, CTCA, IDM, FM, PM, TOM, TM ){
		if ( TMA == 1 ) {
			TiposDeCambios.update(	{ tipo_cambio : TC },
			                        { $set:{ 	estado: EST,
			                        			activo : VA,
			                                    c_estado_p: CTCP,
			                                    c_estado_a: CTCA,
			                                    "periodo1.Base.id_hitbtc": IDM,
			                                    "periodo1.Base.fecha": FM,
			                                    "periodo1.Base.precio" : PM,
			                                    "periodo1.Base.tipo_operacion": TOM,
			                                    "periodo1.Base.tendencia" : parseFloat(TM.toFixed(4)), }
			                        });
		}
		else {
			TiposDeCambios.update(	{ tipo_cambio : TC },
			                        { $set:{ 	estado: EST,
			                        			activo : VA,
			                                    c_estado_p: CTCP,
			                                    c_estado_a: CTCA,
			                                    "periodo1.Cotizacion.id_hitbtc": IDM,
			                                    "periodo1.Cotizacion.fecha": FM,
			                                    "periodo1.Cotizacion.precio" : PM,
			                                    "periodo1.Cotizacion.tipo_operacion": TOM,
			                                    "periodo1.Cotizacion.tendencia" : parseFloat(TM.toFixed(4)) }
			                        });
		}
	},

	'ActualizaTempTiposCambioXMoneda':function( TMA, TC, MB, MC, ACT, HAB, CHBT, CM, MACM, VI, EST, CEP, CEA, MINC, MCE, IDM, FM, PM, TOM, TM ){
		if ( TMA == 1 ) {
			TempTiposCambioXMoneda.update(	{ tipo_cambio : TC },
			                                { $set:{"moneda_base" : MB ,
			                                		"moneda_cotizacion" : MC,
			                                    	"activo" : ACT,
			                                    	"habilitado" : HAB,
			                                    	"comision_hitbtc" : CHBT,
			                                    	"comision_mercado" : CM,
			                                    	"moneda_apli_comision" : MACM,
			                                    	"valor_incremento" : VI,
			                                    	"estado" : EST,
			                                    	"c_estado_p" : CEP,
			                                    	"c_estado_a" : CEA,
			                                    	"min_compra" : MINC,
			                                    	"min_compra_equivalente" : MCE,
			                                    	"periodo1.Base.id_hitbtc": IDM,
			                                    	"periodo1.Base.fecha": FM,
			                                    	"periodo1.Base.precio" : PM,
			                                    	"periodo1.Base.tipo_operacion": TOM,
			                                     	"periodo1.Base.tendencia" : parseFloat(TM.toFixed(4))}},
			                                { "multi" : true,"upsert" : true });
		}
		else {
			TempTiposCambioXMoneda.update(	{ tipo_cambio : TC },
			                                { $set:{"moneda_base" : MB ,
			                                		"moneda_cotizacion" : MC,
			                                    	"activo" : ACT,
			                                    	"habilitado" : HAB,
			                                    	"comision_hitbtc" : CHBT,
			                                    	"comision_mercado" : CM,
			                                    	"moneda_apli_comision" : MACM,
			                                    	"valor_incremento" : VI,
			                                    	"estado" : EST,
			                                    	"c_estado_p" : CEP,
			                                    	"c_estado_a" : CEA,
			                                    	"min_compra" : MINC,
			                                    	"min_compra_equivalente" : MCE,                                    										
			                                    	"periodo1.Cotizacion.id_hitbtc": IDM,
			                                    	"periodo1.Cotizacion.fecha": FM,
			                                    	"periodo1.Cotizacion.precio" : PM,
			                                    	"periodo1.Cotizacion.tipo_operacion": TOM,
			                                     	"periodo1.Cotizacion.tendencia" : parseFloat(TM.toFixed(4))}},
			                                { "multi" : true,"upsert" : true });
		}
	}

});