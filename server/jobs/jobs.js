import { Jobs } from 'meteor/msavin:sjobs'

const Job_activo = 1;
/*
Jobs.configure({
    timer: 5
});
*/
Jobs.register({
	/*
	"JobSecuenciaInicial": function (){
		try{
	    	fecha = moment (new Date());
	    	console.log('        ',fecha._d);
			console.log('');
			Meteor.call("GuardarLogEjecucionTrader", '----------  SOY EL JOB INICIAL  -----------');
		    console.log(' ');

		    var EjecucionInicial = Meteor.call('EjecucionInicial'); 

		    console.log("Valor de EjecucionInicial", EjecucionInicial);

		    if ( EjecucionInicial === 0 ) {
		    	Meteor.call("GuardarLogEjecucionTrader", 'Iniciando las secuencias Secundarías');
		    	Jobs.run("JobSecuencia", { 
		            in: {
		                second: 5
		                }
		        });
		    }
		    var ejecucionJobSecuenciaInicial = 0
		}
		catch(error){
			var ejecucionJobSecuenciaInicial = 1
		}

		if ( ejecucionJobSecuenciaInicial === 0) {
    		return this.success(ejecucionJobSecuenciaInicial);
    	}
    	else {
    		this.failure(ejecucionJobSecuenciaInicial);
    	}
    },

    "JobSecuencia": function (){
    	try{
	    		fecha = moment (new Date());
	    		console.log('        ',fecha._d);
		        Meteor.call("GuardarLogEjecucionTrader", '----------  SOY EL JOB GENERAL  -----------');
		        console.log(' ');

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
								
					console.log(' ');
					Jobs.run("JobSecuencia", { 
						in: {
						       	second: 5
						   	}
					})

				}else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {

				 	console.log(' ');
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
	    	console.log('        ',fecha._d);
			console.log('');
			Meteor.call("GuardarLogEjecucionTrader", '---------  REINICIANDO PROCESOS  ----------');
		    console.log(' ');



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
	   		console.log('        ',fecha._d);
	   		console.log('----------    SOY EL SUB JOB    -----------');
	        console.log(' ');
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
									console.log("     Moneda con Saldo a Verificar: ", V_moneda_verificar._id)
									
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

						    console.log("Valor de V_LimiteMaximoEjecucion", V_LimiteMaximoEjecucion)



						    ///HAY QUE SACAR ESTO DE ACÁ
						    /*
						    if ( V_LimiteMaximoEjecucion === 9999999999 ) {
								
								console.log(' ');
								Jobs.run("JobSecuenciaPeriodo1", { 
							    	in: {
							        	minute: 5
							    	}
							    })

						    }else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {

						    	console.log(' ');
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

						    console.log("Valor de V_LimiteMaximoEjecucion", V_LimiteMaximoEjecucion);
						    

						    if ( V_LimiteMaximoEjecucion === 9999999999 ) {
								
								console.log(' ');
								Jobs.run("JobSecuenciaPeriodo1", { 
							    	in: {
							        	minute: 1
							    	}
							    })

								
						    }else if ( V_LimiteMaximoEjecucion > 0 && V_LimiteMaximoEjecucion !== 9999999999 ) {
								
								console.log(' ');
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
	    	console.log(' Estoy en JobValidaTendenciaTipoCambio');
	    	if ( Job_activo === 1 ) {
		        var V_EJEC = 2
		        fecha = moment (new Date());

	    		console.log('############################################');
	    		console.log('--------------------------------------------');
		        console.log('---------- SOY EL JOB TRABAJANDO -----------');
		        console.log('--------------------------------------------');
		        console.log(' ');
		        console.log("Estoy en el Job JobValidaTendenciaTipoCambio");
		        //console.log(' Tipo de Cambio Recibido', TIPO_CAMBIO, " Muestreo: ", TIPO_MUESTREO, " ACCION: ", TIPO_MONEDA_SALDO)
		        //Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, TIPO_MUESTREO);
		        Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC);
	            //Meteor.call('EvaluarTendencias', TIPO_CAMBIO, TIPO_MUESTREO, TIPO_MONEDA_SALDO );
	            Meteor.call('EvaluarTendencias', TIPO_CAMBIO );
		        
		        console.log('--------------------------------------------');
		        console.log('############################################');
		        console.log('-------------- JOB FINALIZADO --------------');
	   			console.log('        ',fecha._d);
		        console.log('############################################');


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
    	
		console.log("Moneda con Saldo a Verificar: ", MONEDA_VERIFICAR);

    	Meteor.call("GuardarLogEjecucionTrader", [' JobValidaInversion: Moneda con Saldo a Verificar: ']+[MONEDA_VERIFICAR]);

        var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
        var V_LimiteApDep = LimiteApDep[0].valor;
            
        Meteor.call("GuardarLogEjecucionTrader", [' JobValidaInversion: Se ejecuta Meteor.call("ValidaPropTipoCambiosValidados": ']+[MONEDA_VERIFICAR]+[' ']+[V_LimiteApDep]);
        Meteor.call('ValidaPropTipoCambiosValidados', MONEDA_VERIFICAR, V_LimiteApDep );

        
		var ejecucionJobValidaInversion = 0
		
		return this.success(ejecucionJobValidaInversion);
    },

	
    
    // JOB DE MANTENIMIENTO U OTROS DE EJECUCION
    
    "JobsFrecuenciaDiaria": function(){
    	try{
	    	console.log(' Estoy en JobsFrecuenciaDiaria');
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

});


