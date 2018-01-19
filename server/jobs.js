const Job_activo = 1;

Jobs.register({
	JobSecuenciaInicial: function (){    	
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
		console.log('');
		Meteor.call("GuardarLogEjecucionTrader", '----------  SOY EL JOB INICIAL  -----------');
	    console.log(' ');

	    var EjecucionIncial = Meteor.call('EjecucionInicial'); 

	    console.log("Valor de EjecucionIncial", EjecucionIncial);

	    if ( EjecucionIncial === 0 ) {
	    	Meteor.call("GuardarLogEjecucionTrader", 'Iniciando las secuencias Secundarías');
	    	Jobs.run("JobSecuencia", { 
	            in: {
	                second: 5
	                }
	        });
	    }
    },

    JobSecuencia: function (){    	
    		fecha = moment (new Date());
    		console.log('        ',fecha._d);
	        Meteor.call("GuardarLogEjecucionTrader", '----------  SOY EL JOB GENERAL  -----------');
	        console.log(' ');

	        Jobs.run("JobInsertarSecuenciaPeriodo1", { 
		    	in: {
		        	second: 5
		    	}
		    })
/*
		    Jobs.run("JobInsertarSecuenciaPeriodo2", { 
		    	in: {
		        	second: 30
		    	}
		    })

		    Jobs.run("JobInsertarSecuenciaPeriodo3", { 
		    	in: {
		        	minute: 1
		    	}
		    })

		    Jobs.run("JobInsertarSecuenciaPeriodo4", { 
		    	in: {
		        	second: 90
		    	}
		    })

		    Jobs.run("JobInsertarSecuenciaPeriodo5", { 
		    	in: {
		        	minute: 2
		    	}
		    })

		    Jobs.run("JobInsertarSecuenciaPeriodo6", { 
		    	in: {
		        	second: 150
		    	}
		    })*/
    	},

    JobReinicioSecuencia: function (){    	
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
    },

   	JobInsertarSecuenciaPeriodo1 : function (TIPO_CAMBIO){
   		fecha = moment (new Date());
   		console.log('        ',fecha._d);
   		console.log('----------    SOY EL SUB JOB    -----------');
        console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobInsertarSecuenciaPeriodo1');

   		TipoDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TipoDeCambioVerificar: ']+[TipoDeCambioVerificar]);

		if ( TipoDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobInsertarSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TipoDeCambioVerificar]);
		}
		else {

			for (CTP = 0, TTP = TipoDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TipoDeCambioVerificar[CTP];
				Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				var fecha_actual = new Date();
				var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth(), fecha_actual.getDay(), fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() + 5 )
				Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999999999,	"arguments" : [	tipo_cambio_verificar , 1 ],	"state" : "pending" });
			}/*
			console.log(' ');
			Jobs.run("JobInsertarSecuenciaPeriodo1", tipo_cambio_verificar, { 
		    	in: {
		        	minute: 5
		    	}
		    })*/
		}
    },

    JobInsertarSecuenciaPeriodo2 : function (TIPO_CAMBIO){
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
	    console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobInsertarSecuenciaPeriodo2');

    	TipoDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TipoDeCambioVerificar: ']+[TipoDeCambioVerificar]);

		if ( TipoDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobInsertarSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TipoDeCambioVerificar]);
		}
		else {

			for (CTP = 0, TTP = TipoDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TipoDeCambioVerificar[CTP];
				Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				var fecha_actual = new Date();
				var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth(), fecha_actual.getDay(), fecha_actual.getHours() +1, fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999999999,	"arguments" : [	tipo_cambio_verificar , 2 ],	"state" : "pending" });
			}/*
			console.log(' ');
			Jobs.run("JobInsertarSecuenciaPeriodo2", tipo_cambio_verificar, { 
		    	in: {
		        	hour: 1
		    	}
		    })*/
		}
    },

    JobInsertarSecuenciaPeriodo3 : function (TIPO_CAMBIO){
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobInsertarSecuenciaPeriodo3');

    	TipoDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TipoDeCambioVerificar: ']+[TipoDeCambioVerificar]);

		if ( TipoDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobInsertarSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TipoDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TipoDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TipoDeCambioVerificar[CTP];
				Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				var fecha_actual = new Date();
				var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth(), fecha_actual.getDay() + 1, fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999999999,	"arguments" : [	tipo_cambio_verificar, 3 ],	"state" : "pending" });
			}
			console.log(' ');
			Jobs.run("JobInsertarSecuenciaPeriodo3", tipo_cambio_verificar, { 
		    	in: {
		        	days: 1
		    	}
		    })
		}
    },

    JobInsertarSecuenciaPeriodo4 : function (TIPO_CAMBIO){
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobInsertarSecuenciaPeriodo4');

    	TipoDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TipoDeCambioVerificar: ']+[TipoDeCambioVerificar]);

		if ( TipoDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobInsertarSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TipoDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TipoDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TipoDeCambioVerificar[CTP];
				Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				var fecha_actual = new Date();
				var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth(), fecha_actual.getDay() + 7, fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999999999,	"arguments" : [	tipo_cambio_verificar, 4],	"state" : "pending" });
			}
			console.log(' ');
				
			Jobs.run("JobInsertarSecuenciaPeriodo4", tipo_cambio_verificar, { 
		    	in: {
		        	days: 7
		    	}
		    })
		}
    },

    JobInsertarSecuenciaPeriodo5 : function (TIPO_CAMBIO){
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobInsertarSecuenciaPeriodo5');

    	TipoDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1, 5);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TipoDeCambioVerificar: ']+[TipoDeCambioVerificar]);

		if ( TipoDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobInsertarSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TipoDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TipoDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TipoDeCambioVerificar[CTP];
				Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);
				var fecha_actual = new Date();
				var fecha_ejecucion = new Date ( fecha_actual.getFullYear(), fecha_actual.getMonth() + 1, fecha_actual.getDay(), fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999999999,	"arguments" : [	tipo_cambio_verificar, 5],	"state" : "pending" });
			}
			console.log(' ');

			Jobs.run("JobInsertarSecuenciaPeriodo5", tipo_cambio_verificar, { 
		    	in: {
		        	month: 1
		    	}
		    })
		}
    },

    JobInsertarSecuenciaPeriodo6 : function (TIPO_CAMBIO){
    	fecha = moment (new Date());
    	console.log('        ',fecha._d);
    	console.log('----------    SOY EL SUB JOB    -----------');
		console.log(' ');
		Meteor.call("GuardarLogEjecucionTrader", 'Estoy en el Job JobInsertarSecuenciaPeriodo6');

    	TipoDeCambioVerificar = Meteor.call('TipoCambioDisponibleCompra', 1, 6);
		Meteor.call("GuardarLogEjecucionTrader", ['Valor de TipoDeCambioVerificar: ']+[TipoDeCambioVerificar]);

		if ( TipoDeCambioVerificar === undefined ) {
			Meteor.call("GuardarLogEjecucionTrader", ['JobInsertarSecuenciaPeriodo1: No se ha podido recuperar los tipos de cambio con saldo disponible ']+[TipoDeCambioVerificar]);
		}
		else {
			
			for (CTP = 0, TTP = TipoDeCambioVerificar.length; CTP < TTP; CTP++){
				var tipo_cambio_verificar = TipoDeCambioVerificar[CTP];
				Meteor.call("GuardarLogEjecucionTrader", ['Valor de tipo_cambio_verificar: ']+[tipo_cambio_verificar]);;
				var fecha_actual = new Date();
				var fecha_ejecucion = new Date ( fecha_actual.getFullYear() + 1, fecha_actual.getMonth(), fecha_actual.getDay(), fecha_actual.getHours(), fecha_actual.getMinutes(), fecha_actual.getSeconds() )
				Jobs.private.collection.insert({ "name" : "JobValidaTendenciaTipoCambio", "created" : fecha_actual, "due" : fecha_ejecucion, "priority" : 9999999999,	"arguments" : [	tipo_cambio_verificar, 6],	"state" : "pending" });
			}
			console.log(' ');

			Jobs.run("JobInsertarSecuenciaPeriodo6", tipo_cambio_verificar, { 
		    	in: {
		        	year: 1
		    	}
		    })
		}
   	},

    JobValidaTendenciaTipoCambio: function (TIPO_CAMBIO, TIPO_MUESTREO){
    	if ( Job_activo === 1 ) {
    		console.log('############################################');
    		console.log('--------------------------------------------');
	        console.log('---------- SOY EL JOB TRABAJANDO -----------');
	        console.log('--------------------------------------------');
	        console.log(' ');
	        console.log("Estoy en el Job JobValidaTendenciaTipoCambio");
	        console.log(' Tipo de Cambio Recibido', TIPO_CAMBIO, " Muestreo: ", TIPO_MUESTREO)

	        Meteor.call('TipoCambioDisponibleCompra', 2, TIPO_MUESTREO);

	        console.log('--------------------------------------------');
	        console.log('############################################');
	        console.log('-------------- JOB FINALIZADO --------------');
	        console.log('############################################');


    	}
    },


});


