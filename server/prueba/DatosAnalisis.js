import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({
	'ReinicioParametrosAnalisis': function(){
		var LotesActuales = ParametrosAnalisis.aggregate(	{ $match : { "LoteActivo" : true }},
                														{ $group: {
																			        "_id" : '$IdLote'
																			    	}
																		},
																	    { $sort : { "_id" : 1 } }
																	);

		for (CLA = 0, T_LotesActuales = LotesActuales.length; CLA < T_LotesActuales; CLA++) {
    		var LA= LotesActuales[CLA];
    		var V_IdLote = LA._id;

    		ParametrosAnalisis.update( { "IdLote" : V_IdLote }, { $set : { "LoteActivo" : true, "activo" : true } }, { "multi" : true } );
	    }
	},

	'InsertarParametrosAnalisis': function(){
		/*
		var IdDatoAnalisis = Meteor.call("SecuenciasGBL", 'IdGanPerdLocal');

		for (CLA = 0, T_LotesActuales = LotesActuales.length; CLA < T_LotesActuales; CLA++) {
    		var LA= LotesActuales[CLA];
    		var V_IdLote = LA._id;

    		ParametrosAnalisis.update( { "IdLote" : V_IdLote }, { $set : { "LoteActivo" : true, "activo" : true } }, { "multi" : true } );
	    }
	    /**/
	}
})