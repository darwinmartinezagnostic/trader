import { Jobs } from 'meteor/msavin:sjobs'

const Job_activo = 1;
/*
Jobs.configure({
    timer: 5
});
*/
Jobs.register({
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

		        Jobs.run("JobSecuenciaPeriodo1", { 
			    	in: {
			        	second: 5
			    	}
			    })
	/*
			    Jobs.run("JobSecuenciaPeriodo2", { 
			    	in: {
			        	second: 30
			    	}
			    })

			    Jobs.run("JobSecuenciaPeriodo3", { 
			    	in: {
			        	minute: 1
			    	}
			    })

			    Jobs.run("JobSecuenciaPeriodo4", { 
			    	in: {
			        	second: 90
			    	}
			    })

			    Jobs.run("JobSecuenciaPeriodo5", { 
			    	in: {
			        	minute: 2
			    	}
			    })

			    Jobs.run("JobSecuenciaPeriodo6", { 
			    	in: {
			        	second: 150
			    	}
			    })

			    Jobs.run("JobsFrecuenciaDiaria", { 
			    	in: {
			        	second: 180
			    	}
			    })*/
			    var ejecucionJobSecuencia = 0
			}
			catch(error){
				var ejecucionJobSecuencia = 1
			}

			if ( ejecucionJobSecuencia === 0) {
	    		return this.success(ejecucionJobSecuencia);
	    	}
	    	else {
	    		this.failure(ejecucionJobSecuencia);
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

	   		var TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
			//Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar]);

			var MonedasVerificar = TempTiposCambioXMoneda.aggregate([ { $group: { _id : "$moneda_saldo" } },
                                     { $project: { _id : 1 } }
                                    ]);



			if ( TiposDeCambioVerificar === undefined ) {
				Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TiposDeCambioVerificar]);
			}
			else {
	   			if ( JobsInternal.Utilities.collection.find({ name : "JobSecuenciaPeriodo1" , state : "pending" }).count() === 0  ) {
		            
					for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
						var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];

						//console.log("Valor de tipo_cambio_verificar", tipo_cambio_verificar)

						Jobs.run("JobValidaTendenciaTipoCambio", tipo_cambio_verificar.tipo_cambio, TM, tipo_cambio_verificar.accion, { 
					    	in: {
					        	second: 1
					    	},
	    					priority: 9999999999
						})
					}				
					
					/*
					console.log(' ');
					Jobs.run("JobSecuenciaPeriodo1", { 
				    	in: {
				        	minute: 5
				    	},
	    				priority: 9999999999
				    })*/
		        }
		        else{
			        console.log(' ');
					Jobs.run("JobSecuenciaPeriodo1", { 
						in: {
							minute: 2
						},
	    				priority: 9999999999
					})
				}
			}
			var ejecucionSecuenciaPeriodo1 = 0
		}
		catch(error){
			var ejecucionSecuenciaPeriodo1 = 1
		}


		if ( ejecucionSecuenciaPeriodo1 === 0) {

			for (CMV = 0, TMV = MonedasVerificar.length; CMV < TMV; CMV++) {
				var V_moneda_verificar = MonedasVerificar[CMV];
				console.log("Valor de V_moneda_verificar", V_moneda_verificar)
				
				Jobs.run("JobValidaInversion", V_moneda_verificar._id, V_EJEC, { 
						in: {
					    	minute: 3
					    }
					})
			}
    		return this.success(ejecucionSecuenciaPeriodo1);
    	}
    	else {
    		this.failure(ejecucionSecuenciaPeriodo1);
    	}
    },
/*
    JobSecuenciaPeriodo2 : function (){
   		var TM = 2;
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
	    console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobSecuenciaPeriodo2');

    	TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar]);

		if ( TiposDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TiposDeCambioVerificar]);
		}
		else {

			for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];
				//Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				//var fecha_actual = new Date();
				//var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth(), fecha_actual.getDay(), fecha_actual.getHours() +1, fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				//Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999,	"arguments" : [	tipo_cambio_verificar , 2 ],	"state" : "pending" });
				Jobs.run("JobValidaTendenciaTipoCambio", tipo_cambio_verificar, TM, { 
			    	in: {
			        	second: 1
			    	} 
				})
			}
			console.log(' ');
			Jobs.run("JobSecuenciaPeriodo2", { 
		    	in: {
		        	hour: 1
		    	}
		    })
		}
    },

    JobSecuenciaPeriodo3 : function (){
   		var TM = 3;
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobSecuenciaPeriodo3');

    	TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar]);

		if ( TiposDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TiposDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];
				//Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				//var fecha_actual = new Date();
				//var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth(), fecha_actual.getDay() + 1, fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				//Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999,	"arguments" : [	tipo_cambio_verificar, 3 ],	"state" : "pending" });
				Jobs.run("JobValidaTendenciaTipoCambio", tipo_cambio_verificar, TM, { 
			    	in: {
			        	second: 1
			    	} 
				})
			}
			console.log(' ');
			Jobs.run("JobSecuenciaPeriodo3", { 
		    	in: {
		        	days: 1
		    	}
		    })
		}
    },

    JobSecuenciaPeriodo4 : function (){
   		var TM = 4;
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobSecuenciaPeriodo4');

    	TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar]);

		if ( TiposDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TiposDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];
				//Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				//var fecha_actual = new Date();
				//var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth(), fecha_actual.getDay() + 7, fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				//Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999,	"arguments" : [	tipo_cambio_verificar, 4],	"state" : "pending" });
				Jobs.run("JobValidaTendenciaTipoCambio", tipo_cambio_verificar, TM, { 
			    	in: {
			        	second: 1
			    	} 
				})
			}
			console.log(' ');
				
			Jobs.run("JobSecuenciaPeriodo4", { 
		    	in: {
		        	days: 7
		    	}
		    })
		}
    },

    JobSecuenciaPeriodo5: function (){
   		var TM = 5;
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobSecuenciaPeriodo5');

    	TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1, 5);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar]);

		if ( TiposDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TiposDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];
				//Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				//var fecha_actual = new Date();
				//var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth() + 1, fecha_actual.getDay(), fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				//Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999,	"arguments" : [	tipo_cambio_verificar, 5],	"state" : "pending" });
				Jobs.run("JobValidaTendenciaTipoCambio", tipo_cambio_verificar, TM, { 
			    	in: {
			        	second: 1
			    	} 
				})
			}
			console.log(' ');

			Jobs.run("JobSecuenciaPeriodo5", { 
		    	in: {
		        	month: 1
		    	}
		    })
		}
    },

    JobSecuenciaPeriodo6: function (){
   		var TM = 6;
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobSecuenciaPeriodo6');

    	TiposDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1, 6);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TiposDeCambioVerificar: ']+[TiposDeCambioVerificar]);

		if ( TiposDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TiposDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TiposDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TiposDeCambioVerificar[CTP];
				//Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);;
				//var fecha_actual = new Date();
				//var fecha_ejecucion = new Date ( fecha_actual.getFullYear() + 1, fecha_actual.getMonth(), fecha_actual.getDay(), fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				//Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999,	"arguments" : [	tipo_cambio_verificar, 6],	"state" : "pending" });
				Jobs.run("JobValidaTendenciaTipoCambio", tipo_cambio_verificar, TM, { 
			    	in: {
			        	second: 1
			    	} 
				})
			}
			console.log(' ');

			Jobs.run("JobSecuenciaPeriodo6", { 
		    	in: {
		        	year: 1
		    	}
		    })
		}
   	},
*/
    "JobValidaTendenciaTipoCambio": function ( TIPO_CAMBIO, TIPO_MUESTREO, TIPO_ACCION ){
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
		        console.log(' Tipo de Cambio Recibido', TIPO_CAMBIO, " Muestreo: ", TIPO_MUESTREO, " ACCION: ", TIPO_ACCION)

		        Meteor.call('ListaTradeoActual', TIPO_CAMBIO, V_EJEC, TIPO_MUESTREO);
	            Meteor.call('EvaluarTendencias', TIPO_CAMBIO, TIPO_MUESTREO, TIPO_ACCION );
		        
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



    "JobValidaInversion": function( MONEDA_VERIFICAR, V_EJEC ){
    	try{
	    	if ( JobsInternal.Utilities.collection.find({ name : "JobValidaTendenciaTipoCambio" , state : "pending" }).count() === 0  ) {
	            try{
	                var LimiteApDep = Parametros.aggregate([{ $match:{ dominio : "limites", nombre : "MaxApDep", estado : true }}, { $project: {_id : 0, valor : 1}}]);
	                var V_LimiteApDep = LimiteApDep[0].valor;
	            }
	            catch (error){
	                Meteor.call("ValidaError", error, 2);
	            };

	            Meteor.call('Invertir', MONEDA_VERIFICAR, V_EJEC, LimiteApDep );
	        }
	        else{
		        console.log(' ');
				Jobs.run("JobValidaInversion", MONEDA_VERIFICAR, V_EJEC, { 
					in: {
						minute: 3
					},
    				priority: 9999999999
				})
			}
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
	    	console.log(' Estoy en JobsFrecuenciaDiaria');
	    	// Mantenieminto de la coleccion JObs_data
	    	JobsInternal.Utilities.collection.remove({ state : 'successful' });

	    	// Validaciones de Data base
	    	Meteor.call("ListaMonedas");
	    	Meteor.call("validaMonedasActivas");
	    	Meteor.call("ListaTiposDeCambios",2);
	    	Meteor.call("validaTiposDeCambiosActivos");


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
    }

});


