import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();
const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
LogFile.enable();

Meteor.methods({

	'ModificaParametrosGenerales':function ( DOMINIO, NONBRE, ESTADO, VALOR ) {
        var fecha = moment (new Date());
		try{
			Parametros.update(  { dominio : DOMINIO,  nombre : NONBRE },
	                                    { $set:{  "valor": VALOR , "estado" : ESTADO, "fecha_actualizacion" : fecha._d }}
	                                );
			return 0;
		}
		catch(e){
			return 1;
		}
	},

    'GuardarSaldoTotal':function ( TIPO_SALDO, V_ID, V_IdLote ) {
        var SaldoTotal = Meteor.call("ConcultaSaldoTotalMonedas")
        switch ( TIPO_SALDO ){
            case 1:
                // TOTAL INICIAL
                SaldosTotales.update(   { _id : V_ID, IdLote : V_IdLote }, 
                                                    { $set : {
                                                            'Saldo.Inicial' : parseFloat(SaldoTotal.toFixed(6))
                                                            }
                                                    },
                                                    { "upsert" : true });
            break;
            case 2:
                // TOTAL FINAL

                var SaldInic = SaldosTotales.findOne({ _id : V_ID, IdLote : V_IdLote  });
                var V_Inicial = SaldInic.Saldo.Inicial

                var PorcentajeDiferencial = Meteor.call("CalcularPorcentajeDiferencial", V_Inicial, SaldoTotal)

                SaldosTotales.update(   { _id : V_ID, IdLote : V_IdLote }, 
                                                    { $set : {
                                                            'Saldo.Final' : parseFloat(SaldoTotal.toFixed(6)),
                                                            'PorcentajeDiferencial' : parseFloat(PorcentajeDiferencial.toFixed(2))
                                                            }
                                                    },
                                                    { "upsert" : true });


            break;
        }
    },

    'AnalisisConsultarParametros':function ( ) {
        var DatosParametros = new Set();
        var ParametrosDeAnalisis = ParametrosAnalisis.find({ "activo": true }).fetch();

        for (CPA = 0, TPA = ParametrosDeAnalisis.length; CPA < TPA; CPA++) {
            var PA= ParametrosDeAnalisis[CPA];
            //log.info('Valor de PA: ', PA);
            var V_ID = PA._id
            var V_IdLote = PA.IdLote
            var V_dominio = PA.ParametrosModificar.dominio;
            var V_nombre = PA.ParametrosModificar.nombre;
            var V_estado = PA.ParametrosModificar.estado;
            var V_valor = PA.ParametrosModificar.valor;
            for (CI = 0, TI = V_dominio.length; CI < TI; CI++) {
                var dominio = V_dominio[CI]
                var nombre = V_nombre[CI]
                var estado = V_estado[CI]
                var valor = V_valor[CI]
                DatosParametros.add ( { '_id' : V_ID, 'IdLote' : V_IdLote, 'dominio' : dominio , 'nombre' : nombre, 'estado' : estado, 'valor' : valor } )
            }
            var Datos = Array.from(DatosParametros);
        }

        return Datos;
    },

    'AnalisisConsultarSaldosTotales':function ( V_ID, V_IdLote ) {
        var DatosSaldosTotales = new Set();
        var ParametrosDeAnalisis = ParametrosAnalisis.find({ "activo": true }).fetch();

        var SaldTotal = SaldosTotales.findOne({ _id : V_ID, IdLote : V_IdLote });
        DatosSaldosTotales.add ( { '_id' : V_ID, 'IdLote' : V_IdLote, 'Inicial' : SaldTotal.Saldo.Inicial , 'Final' : SaldTotal.Saldo.Final })

        /*
        for (CPA = 0, TPA = ParametrosDeAnalisis.length; CPA < TPA; CPA++) {
            var PA= ParametrosDeAnalisis[CPA];
            var V_ID = PA._id
            var V_IdLote = PA.IdLote

            var SaldTotal = SaldosTotales.findOne({ _id : V_ID, IdLote : V_IdLote });

            //log.info('Valor de SaldTotal: ', SaldTotal);

            if (SaldTotal === undefined ) {
                DatosSaldosTotales.add ( { '_id' : V_ID, 'IdLote' : V_IdLote, 'Inicial' : 'Datos no encontrados' , 'Final' : 'Datos no encontrados' } )
            }else {
                DatosSaldosTotales.add ( { '_id' : V_ID, 'IdLote' : V_IdLote, 'Inicial' : SaldTotal.Saldo.Inicial , 'Final' : SaldTotal.Saldo.Final } )                
            }            
        }
        /**/
        var DatosSaldosTtl = Array.from(DatosSaldosTotales);

        return DatosSaldosTtl;
    },

    'AnalisisConsultarSaldos':function ( ) {
        var DatosSaldosMonedas = new Set();
        var SaldosMonedas = Monedas.find( { $or : [{"saldo.tradeo.activo" : { $gt : 0 }  }] }).fetch();

        for (CSM = 0, TSM = SaldosMonedas.length; CSM < TSM; CSM++) {
            var Moneda = SaldosMonedas[CSM];
            //log.info(' Valor de moneda: ', Moneda)

            DatosSaldosMonedas.add ( { '_id' : Moneda._id, 
                                        'moneda' : Moneda.moneda, 
                                        'nombre_moneda' : Moneda.nombre_moneda, 
                                        'saldo': {
                                                'tradeo': {
                                                            'activo': Moneda.saldo.tradeo.activo ,
                                                            'reserva': Moneda.saldo.tradeo.reserva ,
                                                            'equivalencia': Moneda.saldo.tradeo.equivalencia ,
                                                            'fecha': Moneda.saldo.tradeo.fecha 
                                                        },
                                                'cuenta': {
                                                            'activo': Moneda.saldo.cuenta.activo ,
                                                            'reserva': Moneda.saldo.cuenta.reserva ,
                                                            'equivalencia': Moneda.saldo.cuenta.equivalencia ,
                                                            'fecha': Moneda.saldo.cuenta.fecha  
                                                        }
                                        }
                                    })

        }

        var DatosSaldosMond = Array.from(DatosSaldosMonedas);

        return DatosSaldosMond
    },

    'AnalisisConsultarHistGananPerd':function ( ) {
        var DatosHistGananciaPerdida = new Set();
        var HistGananciaPerdida = GananciaPerdida.find({}).fetch();

        for (CGP = 0, TGP = HistGananciaPerdida.length; CGP < TGP; CGP++) {
            var HistGPerd = HistGananciaPerdida[CGP];

            DatosHistGananciaPerdida.add ({
                                        'Operacion' : { 'Id_hitbtc' : HistGPerd.Operacion.Id_hitbtc,
                                                        'Id_Transhitbtc' : HistGPerd.Operacion.Id_Transhitbtc,
                                                        'ID_LocalAnt' : HistGPerd.Operacion.ID_LocalAnt,
                                                        'ID_LocalAct' : HistGPerd.Operacion.ID_LocalAct,
                                                        'Id_Lote': HistGPerd.Operacion.Id_Lote,
                                                        'Tipo' : HistGPerd.Operacion.Tipo,
                                                        'TipoCambio' : HistGPerd.Operacion.TipoCambio,
                                                        'Base' : HistGPerd.Operacion.Base,
                                                        'Cotizacion' : HistGPerd.Operacion.Cotizacion,
                                                        'Status' : HistGPerd.Operacion.Status,
                                                        'FechaCreacion' : HistGPerd.Operacion.FechaCreacion,
                                                        'FechaActualizacion' : HistGPerd.Operacion.FechaActualizacion
                                        },
                                        'Moneda' : {  'Emitida' : { 'moneda' : HistGPerd.Moneda.Emitida.moneda,
                                                                    'Fecha' : HistGPerd.Moneda.Emitida.Fecha,
                                                                    'Saldo_Anterior' : HistGPerd.Moneda.Emitida.Saldo_Anterior,
                                                                    'Equivalente_Anterior' : HistGPerd.Moneda.Emitida.Equivalente_Anterior,
                                                                    'Saldo_Actual' : HistGPerd.Moneda.Emitida.Saldo_Actual,
                                                                    'Equivalente_Actual' : HistGPerd.Moneda.Emitida.Equivalente_Actual

                                                        },
                                                    'Adquirida' : { 'moneda' : HistGPerd.Moneda.Adquirida.moneda,
                                                                    'Fecha' : HistGPerd.Moneda.Adquirida.Fecha,
                                                                    'Saldo_Anterior' : HistGPerd.Moneda.Adquirida.Saldo_Anterior,
                                                                    'Equivalente_Anterior' : HistGPerd.Moneda.Adquirida.Equivalente_Anterior,
                                                                    'Saldo_Actual' : HistGPerd.Moneda.Adquirida.Saldo_Actual,
                                                                    'Equivalente_Actual' : HistGPerd.Moneda.Adquirida.Equivalente_Actual
                                                    }
                                        },
                                        'Inversion' : { 'Saldo' : HistGPerd.Inversion.Saldo,
                                                        'Equivalencia' : {  'Dolar' : { 'Inicial' : HistGPerd.Inversion.Equivalencia.Dolar.Inicial,
                                                                                          'Final' : HistGPerd.Inversion.Equivalencia.Dolar.Final
                                                                            },
                                                                            'MonedaCambio' : { 'Valor' : HistGPerd.Inversion.Equivalencia.MonedaCambio.Valor 
                                                                            }
                                                         },
                                                        'Precio' : HistGPerd.Inversion.Precio,
                                                        'Comision' : {  'moneda' : HistGPerd.Inversion.Comision.moneda,
                                                                        'Valor' : HistGPerd.Inversion.Comision.Valor,
                                                                        'Equivalencia' : HistGPerd.Inversion.Comision.Equivalencia
                                                         }
                                        }
                                    })
        }
        
        var DatosHistGanancPrd = Array.from(DatosHistGananciaPerdida);

        return DatosHistGanancPrd;
    },

	'GuardarDatosAnalisis':function ( V_ID, V_IdLote ) {
		fecha = moment (new Date());
		
        var DatosParametros = Meteor.call("AnalisisConsultarParametros");
        var DatosSaldosTtl = Meteor.call("AnalisisConsultarSaldosTotales", V_ID, V_IdLote );
        var DatosSaldosMond = Meteor.call("AnalisisConsultarSaldos");        
        var DatosHistGanancPrd = Meteor.call("AnalisisConsultarHistGananPerd");

        /*
        log.info(' Valor de DatosParametros: ', DatosParametros)
        log.info(' Valor de DatosSaldosTtl: ', DatosSaldosTtl)
        log.info(' Valor de DatosSaldosMond: ', DatosSaldosMond)
        log.info(' Valor de DatosHistGanancPrd: ', DatosHistGanancPrd)
        /***/
        
        DatosAnalisis.update(   { _id : V_ID, IdLote: V_IdLote }, 
        						{ $set : {
        									'Fecha' : fecha._d,
        									'ParametrosEjecucion' : DatosParametros,
        									'SaldosMonedas' : DatosSaldosMond,
        									'SaldosTotales' : DatosSaldosTtl,
        									'HistoricoGanaciaPerdida' : DatosHistGanancPrd
        								}
        						},
        						{ "upsert" : true });
	},

    'GuardarResultadosAnalisis':function ( ID_LOTE ) {
        fecha = moment (new Date());
        var nuevo_id = Meteor.call("SecuenciasGBL", 'IdAnalisis');

        var MejorResul =  SaldosTotales.aggregate([ { $match: { IdLote : ID_LOTE }}, { $sort: { "PorcentajeDiferencial" : -1 }}, { $limit: 1 } ]);
        var MejorResultado = MejorResul[0]
        //log.info(' Valor de MejorResultado: ', MejorResultado)

        
        ResultadoAnalisis.update({ _id : nuevo_id}, 
                                    { $set : {
                                                'Fecha' : fecha._d,
                                                'IdLote' : ID_LOTE,
                                                'MejorConfiguracion' : MejorResultado
                                            }
                                    },
                                    { "upsert" : true });

        ParametrosAnalisis.update( { "IdLote" : ID_LOTE }, { $set : { "LoteActivo" : false } } ); 

        Meteor.call('FinEjecucion')
    },

});