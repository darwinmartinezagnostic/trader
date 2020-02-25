import { Jobs } from 'meteor/msavin:sjobs';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
import { Email } from 'meteor/email';

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

const Job_activo = 1;
/*
Jobs.configure({
    timer: 5
});
*/
Jobs.register({
	
	"JobTipoEjecucion": function (){
		try{
			var AMBITO = 'JobTipoEjecucion' 
	    	fecha = moment (new Date());
	    	log.info('        ',fecha._d);
			Meteor.call("Encabezado");

		    var TE = Parametros.findOne( { dominio : "Ejecucion", nombre : "TipoEjecucion" } );
		    var TipoEjecucion = TE.valor;
            var ModoEjecucion = Parametros.findOne( { dominio : "Ejecucion", nombre : "ModoEjecucion" } );
            var ValorModoEjecucion = ModoEjecucion.valor
            var ResetAnalisis = Parametros.findOne( { dominio : "Prueba", nombre : "ResetResultadoAnalisis" } )
            var ModificarParametros = Parametros.findOne( { dominio : "Prueba", nombre : "ModificaParametros" } )
            var ValorModificarParametros = ModificarParametros.valor
		    switch ( TipoEjecucion ){
                case 0:
                	if ( ResetAnalisis.valor === 1 ) {
                		Meteor.call('ReinicioDatResultAnalisis');
				        Meteor.call('ReinicioDeSecuenciasGBL', 'IdAnalisis');
				    }
                    if ( ValorModoEjecucion === 0 ) {
		            	Meteor.call("PruebasUnitarias");
		            }else{				            	
		            	Meteor.call('EjecucionInicial');
		            }
                break;
                case 1:
                	if ( ValorModoEjecucion === 0 ) {
		            	Meteor.call("PruebasUnitarias");
		            }else{	
	                	var LotesActuales = ParametrosAnalisis.aggregate([	{ $match : { "LoteActivo" : true }},
	                														{ $group: {
																				        "_id" : '$IdLote'
																				    	}
																			},
																		    { $sort : { "_id" : 1 } }
																		]);

	                	
	                	log.info('Valor de LotesActuales: ', LotesActuales);
	                	if ( ParametrosAnalisis.find( { "LoteActivo" : true } ).count() > 0 ) {	                		
		                	for (CLA = 0, T_LotesActuales = LotesActuales.length; CLA < T_LotesActuales; CLA++) {
		                		log.info('Valor de LotesActuales[CLA]: ', LotesActuales[CLA]);
		                		var LA= LotesActuales[CLA];
		                		var V_IdLote = LA._id
		                		log.info('Valor de V_IdLote: ', V_IdLote);
		                		/**/
			                	var ParametrosEditar = ParametrosAnalisis.aggregate( [{$match: {  "IdLote" : V_IdLote, "activo" : true }} ]);
			                	//log.info('Valor de ParametrosEditar: ', ParametrosEditar); 
			                    if ( ValorModoEjecucion === 0 ) {
						            Meteor.call("PruebasUnitarias");
						        }else{

								    if ( ResetAnalisis.valor === 1 ) {
								        Meteor.call('ReinicioDatResultAnalisis');
								        Meteor.call('ReinicioDeSecuenciasGBL', 'IdAnalisis');
								    }
						            //log.info(' ------------------------- ACA ESTOY -------------------------');
					                var LimiteMaximoDeCompras = Parametros.findOne({ "dominio": "limites", "nombre": "CantMaximaDeCompras"});
					                var V_LimiteMaximoDeCompras = LimiteMaximoDeCompras.valor
									for (CPE = 0, T_ParametrosEditar = ParametrosEditar.length; CPE < T_ParametrosEditar; CPE++) {
										var PE= ParametrosEditar[CPE];
							            var V_ID = PE._id
							            var V_dominio = PE.ParametrosModificar.dominio;
							            var V_nombre = PE.ParametrosModificar.nombre;
							            var V_estado = PE.ParametrosModificar.estado;
							            var V_valor = PE.ParametrosModificar.valor;
							            var V_Ejecucion = PE.Ejecucion;

							            Meteor.call("GuardarLogEjecucionTrader", [' LOTE ACTUAL: '] + [V_IdLote] + [', ID PARÁMETRO ACTUAL: '] + [V_ID]);

							            if ( ValorModificarParametros = 1 ) {

								            if ( V_Ejecucion === 'N' ) {

									            for (CI = 0, TI = V_dominio.length; CI < TI; CI++) {
									            	var dominio = V_dominio[CI]
									            	var nombre = V_nombre[CI]
									            	var estado = V_estado[CI]
									            	var valor = V_valor[CI]
										            Meteor.call('ModificaParametrosGenerales', dominio, nombre, estado, valor);
									            }       
									            var ResetDatosIniciales = Parametros.findOne( { dominio : "Prueba", nombre : "ResetDatosIniciales" } );
									            if ( ResetDatosIniciales.valor === 1 ) {
									            	Meteor.call('LimpiarBD');
									            	
									            	if ( ValorModoEjecucion > 1 ) {
									            		Meteor.call("ModificaParametrosGenerales", 'Ejecucion', 'ModoEjecucion', true, 1 )
									            	}
									            }
									            ParametrosAnalisis.update({ _id: V_ID }, { $set : { "Ejecucion" : "S" } })
								            }
								        }
							            			            	
						            	Meteor.call('EjecucionInicial', V_ID , V_IdLote); 
						            	Meteor.call('GuardarSaldoTotal', 2, V_ID , V_IdLote);
						            	
						            	Meteor.call('GuardarDatosAnalisis', V_ID, V_IdLote );
							            ParametrosAnalisis.update( { "_id" : V_ID }, { $set : { "activo" : false } } );
						            	Meteor.call('sleep', 60);
							        }
							        Meteor.call('GuardarResultadosAnalisis' , V_IdLote );
							        ParametrosAnalisis.update( { "IdLote" : V_IdLote }, { $set : { "LoteActivo" : false } }, { "multi" : true } );

							    }
							/**/
		                	
							}

						}else{
							log.error(' SE CONFIGURÓ PARA REALIZAR ANALISIS DE DATOS PERO NO SE ENCUENTRAN LAS CONFIGURACIONES A SEGUIR, VERIFICAR COLECCION "ParametrosDeAnalisis"',AMBITO);
							Meteor.call('FinEjecucion')
						}
					}
                break;
                default:
                	log.info('Opción de Tipo de Ejecucion: ', TipoEjecucion + ' , No es valida.'); 
                break;
            }

		    var ejecucionJobSecuenciaInicial = 0;
		}
		catch(error){
			var ejecucionJobSecuenciaInicial = 1;
		}

		if ( ejecucionJobSecuenciaInicial === 0) {
	        Jobs.run("JobTipoEjecucion", {
	            in: {
	                minute: 10
	            }
	        })
                		//log.info(' ------------------------- ACA ESTOY -------------------------');
    		return this.success(ejecucionJobSecuenciaInicial);

		    if ( JobsInternal.Utilities.collection.find({ name : "JobTipoEjecucion", state : "pending" }).count() === 0 ){
		    }
    	}
    	else {
    		Meteor.call('sendEmail', 'jarruizjesus@gmail.com', ['Falla en Job: '] + [AMBITO], ['El Job '] + [AMBITO] + [' ha terminado con estado fallido y ha detenido toda la ejecución, se procede a reiniciar el proceso según la última configuración de la collección "parametros"']);
    		log.info(' ERROR EN ', AMBITO +[', SE REINICIA EL PROCESO'])
    		
    		this.replicate({
		                in: {
		                    minutes: 10
		                }
		            });

    		this.failure(ejecucionJobSecuenciaInicial);
    	}
    },
	/*
    "JobSecuencia": function (){
    	try{
	    		fecha = moment (new Date());
	    		log.info('        ',fecha._d);
		        Meteor.call("GuardarLogEjecucionTrader", '----------  SOY EL JOB GENERAL  -----------');
		        log.info(' ');

		        if ( JobsInternal.Utilities.collection.find({ name : "JobSecuenciaPeriodo1", state : "pending" }).count() === 0 ){

			        Jobs.run("JobSecuenciaPeriodo1", 0, { 
				    	in: {
				        	second: 5
				    	}
				    })
				}

			    var ejecucionJobSecuencia = 0
			}
			catch(error){
				var ejecucionJobSecuencia = 1
			}

			if ( ejecucionJobSecuencia === 0) {
	    		return this.success(ejecucionJobSecuencia);

		        if ( V_LimiteMaximoEjecucion === 9999999999 ) {
								
					log.info(' ');
					Jobs.run("JobSecuencia", { 
						in: {
						       	second: 5
						   	}
					})

				}else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {

				 	log.info(' ');
					Jobs.run("JobSecuencia", { 
				    	in: {
					        	second: 5
					    	}
					})

					V_LimiteMaximoEjecucion = V_LimiteMaximoEjecucion - 1
						
					Parametros.update({ "dominio": "limites", "nombre": "CantMaximaEjecucion" }, {
					   				$set: {
						        				"estado": true,
								        		"valor": V_LimiteMaximoEjecucion
								    			}
									})
				}
	    	}
	    	else {
	    		this.failure(ejecucionJobSecuencia);
				var ejecucionJobSecuencia = 1
	    	}
    	},

    "JobReinicioSecuencia": function (){  
    	try{
	    	fecha = moment (new Date());
	    	log.info('        ',fecha._d);
			log.info('');
			Meteor.call("GuardarLogEjecucionTrader", '---------  REINICIANDO PROCESOS  ----------');
		    log.info(' ');



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
		    var ejecucionJobReinicioSecuencia = 0
		}
		catch(error){
			var ejecucionJobReinicioSecuencia = 1
		}

		if ( ejecucionJobReinicioSecuencia === 0) {
    		return this.success(ejecucionJobReinicioSecuencia);
    	}
    	else {
    		this.failure(ejecucionJobReinicioSecuencia);
    	}
    },

   	"JobSecuenciaPeriodo1" : function (){

   		try{
	   		var TM = 1;
	   		V_EJEC = 2;
	   		fecha = moment (new Date());
	   		log.info('        ',fecha._d);
	   		log.info('----------    SOY EL SUB JOB    -----------');
	        log.info(' ');
			Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el Job JobSecuenciaPeriodo1');




			try {
                var Monedas_Saldo = Monedas.aggregate([
                        { $match : {"saldo.tradeo.equivalencia" : { $gt : 0 }}},
                        { $sort : {"saldo.tradeo.equivalencia":-1} }
                    ]);
            }
	        catch (error){
	            Meteor.call("ValidaError", error, 2);
	        };        
	        
	        if ( Monedas_Saldo[0] === undefined ) {
	            Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ninguna moneda con saldo disponible para invertir ']);
	        }
	        else{

	            for (CMS = 0, TMS = Monedas_Saldo.length; CMS < TMS; CMS++){
	                var moneda_saldo =  Monedas_Saldo[CMS];

	                if (TiposDeCambios.find().count() === 0){
	                    Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Parece no Haber ningún tipo de Cambio Guardado en la Base de Datos Local, Solucionando ... ']);
	                    //Monedas.remove({});
	                    Meteor.call("ListaTiposDeCambios", V_EJEC);
	                    Meteor.call("ListaMonedas");
	                    Meteor.call("ActualizaSaldoTodasMonedas",2);
	                    if (TiposDeCambios.find().count() !== 0){
	                        Meteor.call("GuardarLogEjecucionTrader", [' Moneda con Saldo: ¡ Listo ! ']);
	                    }
	                };
	                Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra: Consultando Tipos de Cambio para Moneda: ']+[moneda_saldo.moneda]+[' SALDO_MONEDA: ']+[moneda_saldo.saldo.tradeo.activo]);



	                //LIMPIANDO LA COLECCION TEMPORAL "TempTiposCambioXMoneda"
	                TempTiposCambioXMoneda.remove({ moneda_saldo : Monedas_Saldo[0].moneda, });

			   		var TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', moneda_saldo.moneda, moneda_saldo.saldo.tradeo.equivalencia);
					//Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar[0]]);

					if ( TiposDeCambioVerificar === undefined ) {
						Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible para moneda: ']+[moneda_saldo.moneda]);
						Meteor.call('EjecucionInicial');
					}
					else {
			   			if ( JobsInternal.Utilities.collection.find({ name : "JobValidaInversion", state : "pending" }).count() === 0 && JobsInternal.Utilities.collection.find({ name : "JobValidaTendenciaTipoCambio" , state : "pending" }).count() === 0 ) {
				            
							for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
								var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];

								Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar.tipo_cambio]+[' Moneda: ']+[moneda_saldo.moneda]);
								
								Jobs.run("JobValidaTendenciaTipoCambio", tipo_cambio_verificar.tipo_cambio, TM, tipo_cambio_verificar.accion, { 
							    	in: {
							        	second: 1
							    	}
								});
							}

							Meteor.call("GuardarLogEjecucionTrader", 'JobSecuenciaPeriodo1: Ejecutando ValidarRanking ');
							Meteor.call('ValidarRanking', moneda_saldo.moneda);

							// VALIDA LA MÍNIMA CANTIDAD DE VECES QUE VA HACER LA CONSULTA DE TRANSACCIONES A HITBTC ANTES DE INICIAR LA INVERSION
						    var LimiteMuestreo = Parametros.find({ "dominio": "limites", "nombre": "CantidadMinimaMuestreo"}).fetch()
						    var V_LimiteMuestreo = LimiteMuestreo[0].valor

						    if ( V_LimiteMuestreo === 0 ) {

						    	var MonedasVerificar = TempTiposCambioXMoneda.aggregate([ { $group: { _id : "$moneda_saldo" } },
		                                     { $project: { _id : 1 } }
		                                    ]);

							    for (CMV = 0, TMV = MonedasVerificar.length; CMV < TMV; CMV++) {
									var V_moneda_verificar = MonedasVerificar[CMV];
									log.info("     Moneda con Saldo a Verificar: ", V_moneda_verificar._id)
									
									//Jobs.run("JobValidaInversion", V_moneda_verificar._id, {
									Jobs.run("JobValidaInversion", V_moneda_verificar._id, tipo_cambio_verificar.accion, {
											in: {
										    	minute: 3
										    }
										})
								}
							}else{
								V_LimiteMuestreo = V_LimiteMuestreo - 1
								
								Parametros.update({ "dominio": "limites", "nombre": "CantidadMinimaMuestreo" }, {
								    $set: {
								        "estado": true,
								        "valor": V_LimiteMuestreo
								    }
								});
							}


							// VALIDA EL LIMITE TOTAL DE EJECUCIÓN DE LA APLICACION SI ESTE ES IGUAL '9999999999' ENTONCES SE EJECUTARÁ DE FORMA INFINITA
							// SINO ENTONCES ESTE VALOR SERÁ ACTUALIZADO RESTANDO 1 SE EJECUTARA HASTA QUE EL CONTADOR LLEGUE A 0
							var LimiteMaximoEjecucion = Parametros.find({ "dominio": "limites", "nombre": "CantMaximaEjecucion"}).fetch()
						    var V_LimiteMaximoEjecucion = LimiteMaximoEjecucion[0].valor

						    log.info("Valor de V_LimiteMaximoEjecucion", V_LimiteMaximoEjecucion)



						    ///HAY QUE SACAR ESTO DE ACÁ
						    /*
						    if ( V_LimiteMaximoEjecucion === 9999999999 ) {
								
								log.info(' ');
								Jobs.run("JobSecuenciaPeriodo1", { 
							    	in: {
							        	minute: 5
							    	}
							    })

						    }else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {

						    	log.info(' ');
								Jobs.run("JobSecuenciaPeriodo1", { 
							    	in: {
							        	minute: 5
							    	}
							    })

								V_LimiteMaximoEjecucion = V_LimiteMaximoEjecucion - 1
								
								Parametros.update({ "dominio": "limites", "nombre": "CantMaximaEjecucion" }, {
								    $set: {
								        "estado": true,
								        "valor": V_LimiteMaximoEjecucion
								    }
								})
							}
							*//*
				        }
				        else{
				        	var LimiteMaximoEjecucion = Parametros.find({ "dominio": "limites", "nombre": "CantMaximaEjecucion"}).fetch()
						    var V_LimiteMaximoEjecucion = LimiteMaximoEjecucion[0].valor

						    log.info("Valor de V_LimiteMaximoEjecucion", V_LimiteMaximoEjecucion);
						    

						    if ( V_LimiteMaximoEjecucion === 9999999999 ) {
								
								log.info(' ');
								Jobs.run("JobSecuenciaPeriodo1", { 
							    	in: {
							        	minute: 1
							    	}
							    })

								
						    }else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {
								
								log.info(' ');
								Jobs.run("JobSecuenciaPeriodo1", { 
							    	in: {
							        	minute: 1
							    	}
							    })

						    }else if ( V_LimiteMaximoEjecucion === 0 ) {
						    	Meteor.call("GuardarLogEjecucionTrader", ['LIMITE DE EJECUCION ALCANZADO']);
						    	Meteor.call("FinEjecucion");
						    };
						}
					}
					var ejecucionSecuenciaPeriodo1 = 0
				}
			}
		}
		catch(error){
			var ejecucionSecuenciaPeriodo1 = 1
		}


		if ( ejecucionSecuenciaPeriodo1 === 0) {

			
    		return this.success(ejecucionSecuenciaPeriodo1);
    	}
    	else {
    		this.failure(ejecucionSecuenciaPeriodo1);
    	}

    },

    "JobValidaTendenciaTipoCambio": function ( TIPO_CAMBIO, TIPO_MUESTREO ){
    	try{
	    	log.info(' Estoy en JobValidaTendenciaTipoCambio');
	    	if ( Job_activo === 1 ) {
		        var V_EJEC = 2
		        fecha = moment (new Date());

	    		log.info('############################################');
	    		log.info('--------------------------------------------');
		        log.info('---------- SOY EL JOB TRABAJANDO -----------');
		        log.info('--------------------------------------------');
		        log.info(' ');
		        log.info("Estoy en el Job JobValidaTendenciaTipoCambio");
		        //log.info(' Tipo de Cambio Recibido', TIPO_CAMBIO, " Muestreo: ", TIPO_MUESTREO, " ACCION: ", TIPO_MONEDA_SALDO)
		        //Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, TIPO_MUESTREO);
		        Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC);
	            //Meteor.call('EvaluarTendencias', TIPO_CAMBIO, TIPO_MUESTREO, TIPO_MONEDA_SALDO );
	            Meteor.call('EvaluarTendencias', TIPO_CAMBIO );
		        
		        log.info('--------------------------------------------');
		        log.info('############################################');
		        log.info('-------------- JOB FINALIZADO --------------');
	   			log.info('        ',fecha._d);
		        log.info('############################################');


	    	}
	    	var ejecucionJobValidaTendenciaTipoCambio = 0
	    }
		catch(error){
			var ejecucionJobValidaTendenciaTipoCambio = 1
		}

		if ( ejecucionJobValidaTendenciaTipoCambio === 0) {
    		return this.success(ejecucionJobValidaTendenciaTipoCambio);
    	}
    	else {
    		this.failure(ejecucionJobValidaTendenciaTipoCambio);
    	}
    },


	*/
    "JobValidaInversion": function( MONEDA_VERIFICAR ){
    	try{
    		log.info("Moneda con Saldo a Verificar: ", MONEDA_VERIFICAR,'Jobs');

	    	Meteor.call("GuardarLogEjecucionTrader", [' JobValidaInversion: Moneda con Saldo a Verificar: ']+[MONEDA_VERIFICAR]);

	        var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
	        var V_LimiteApDep = LimiteApDep[0].valor;
	            
	        Meteor.call("GuardarLogEjecucionTrader", [' JobValidaInversion: Se ejecuta Meteor.call("ValidaPropTipoCambiosValidados": ']+[MONEDA_VERIFICAR]+[' ']+[V_LimiteApDep]);
	        Meteor.call('ValidaPropTipoCambiosValidados', MONEDA_VERIFICAR, V_LimiteApDep );

	        
			var ejecucionJobValidaInversion = 0
		}
		catch(error){
			var ejecucionJobValidaInversion = 1
		}

		if ( ejecucionJobValidaInversion === 0) {

    		return this.success(ejecucionJobValidaInversion);
    	}
    	else {
    		this.failure(ejecucionJobValidaInversion);
    	}
    },

	
    
    // JOB DE MANTENIMIENTO U OTROS DE EJECUCION
    
    "JobsFrecuenciaDiaria": function(){
    	try{
	    	log.info(' Estoy en JobsFrecuenciaDiaria','','Jobs');
	    	// Mantenieminto de la coleccion JObs_data
	    	JobsInternal.Utilities.collection.remove({ state : 'successful' });

	    	// Validaciones de Data base
	    	Meteor.call("ListaMonedas");
	    	Meteor.call("validaMonedasActivas");
	    	Meteor.call("ListaTiposDeCambios",2);
	    	Meteor.call("validaTiposDeCambiosActivos");
	    	//Meteor.call("EquivalenteDolarMinCompra");


	    	Jobs.run("JobsFrecuenciaDiaria", { 
			   	in: {
			       	days: 1
			   	}, 
			    on: {
			    	hour : 0,
			        minute: 0
			    },
    			priority: 9999999999
			})
			var ejecucionJobsFrecuenciaDiaria = 0
		}
		catch(error){
			var ejecucionJobsFrecuenciaDiaria = 1
		}

		if ( ejecucionJobsFrecuenciaDiaria === 0) {
    		return this.success(ejecucionJobsFrecuenciaDiaria);
    	}
    	else {
    		this.failure(ejecucionJobsFrecuenciaDiaria);
    	}
    },

    "JobsValidarEstadoOrden": function(TIPO_CAMBIO , CANT_INVER, InversionRealCalc, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, ID_LOTE, clientOrderId){
    	var instance = this;
    	var AMBITO = "JobsValidarEstadoOrden";
    	try{
    		Meteor.call("GuardarLogEjecucionTrader", [ " JobsValidarEstadoOrden - Valores recibidos"]+ [" TIPO_CAMBIO: "]+[TIPO_CAMBIO]+[', CANT_INVER :']+[CANT_INVER]+[', InversionRealCalc : ']+[InversionRealCalc]+[', MON_B :']+[MON_B]+[', MON_C :']+[, MON_C] + [', MONEDA_SALDO :']+[MONEDA_SALDO]+[', MONEDA_COMISION :']+[, MONEDA_COMISION] + [', ORDEN :']+[ORDEN]+[', ID_LOTE :']+[, ID_LOTE] + [', clientOrderId :']+[clientOrderId]);
	    	// Mantenieminto de la coleccion JObs_data
	    	JobsInternal.Utilities.collection.remove({ state : 'success' });
	    	var Robot = Parametros.findOne( { dominio : "Prueba", nombre : "robot" } );
	    	if ( Robot.valor === 0 ) {
                var Resultado = Meteor.call("ValidarEstadoOrden", ORDEN)
            }else if ( Robot.valor === 1 ) {
                var Resultado = Meteor.call("ValidarEstadoOrdenRobot", ORDEN)
            }

            //Meteor.call("GuardarLogEjecucionTrader", [' Valor de Resultado: ']+[Resultado]);

            
            var ORDEN = Resultado
            var Estado_Orden = Resultado.status;



	        if ( Estado_Orden === "new" ) {
	        	var ValorContador = Meteor.call("SecuenciasTMP", clientOrderId);
	        	log.info(' Valor de ValorContador: ', ValorContador, AMBITO);
	        	if ( parseFloat(ValorContador) < 20 ) {
		        	instance.replicate({
		                in: {
		                    minutes: 1
		                }
		            });
	        	}else{
	        		Meteor.call("CancelarOrden", clientOrderId , MONEDA_SALDO);
	        		var Resultado = Meteor.call("ValidarEstadoOrden", ORDEN)
	        		var Estado_Orden = Resultado.status;
	        		if ( Estado_Orden === "new" || Estado_Orden === "partiallyFilled" ) {
			        	var ValorContador = Meteor.call("SecuenciasTMP", clientOrderId);
			        	instance.replicate({
			                in: {
			                    minutes: 1
			                }
			            });
			        }
	        	}
	        }

	        if ( Estado_Orden === "partiallyFilled" ) {
	        	instance.replicate({
	                in: {
	                    minutes: 1
	                }
	            });
	        }

	        if ( Estado_Orden === "suspended" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" || Estado_Orden === "Insufficientfunds" ) {
	        	log.info(' Estado_Orden === "suspended" || Estado_Orden === "expired" || Estado_Orden === "Fallido" || Estado_Orden === "canceled" || Estado_Orden === "Insufficientfunds"');
	        	Meteor.call('EstadoOrdenFallida', ORDEN, ID_LOTE, MONEDA_SALDO, Estado_Orden );
	        	SecuenciasTemporales.remove({ _id : clientOrderId});
	        	
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

            if ( Estado_Orden === "filled" ) {
	            Meteor.call('EstadoOrdenCompletada', TIPO_CAMBIO , CANT_INVER, InversionRealCalc, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, ID_LOTE );
	            SecuenciasTemporales.remove({ _id : clientOrderId});
	        }			
	        var ejecucionJobsValidarEstadoOrden = 0;
		}
		catch(error){
			var ejecucionJobsValidarEstadoOrden = 1
		}

		if ( ejecucionJobsValidarEstadoOrden === 0) {
    		return this.success(ejecucionJobsValidarEstadoOrden);
    	}
    	else {
    		instance.replicate({
		                in: {
		                    minutes: 1
		                }
		            });

    		this.failure(ejecucionJobsValidarEstadoOrden);
    	}
    },

});


