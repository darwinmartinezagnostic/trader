import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({
    'SecuenciasRBT':function(NOMBRE){
        var nuevo_id = SecuenciasRobot.findAndModify({
                                                query: { _id: NOMBRE },
                                                update: { $inc: { secuencia: 1 } },
                                                upsert: true,
                                                'new' : true
                                            });
        
        return nuevo_id.secuencia;
    },
	
});