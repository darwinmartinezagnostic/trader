import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'CalculaId':function(VALOR_EJEC){
        // OPTIMIZAR EL CODIGO -- PUEDE QUE SE PUEDA REDUCIR
        switch(VALOR_EJEC){
                case 1:
                        if (LogEjecucionTrader.find().count() === 0){
                            LogEjecucionTrader.insert({fecha: new Date(), id:1 ,descripcion:'Trader iniciado'});
                            var nuevo_id = 1;
                        }
                        else {
                            var maximo_id = LogEjecucionTrader.aggregate([{ $group: {_id: "MAX_ID", max_id : { $max: "$id"}}}]);
                            var v_val_id = maximo_id;
                            for (C = 0, tamanio_val_id = maximo_id.length; C < tamanio_val_id; C++) {
                                var obj_id_act = maximo_id[C];
                                var id_act = obj_id_act.max_id;
                                var nuevo_id = id_act+1;
                            };
                        };
                break;
                case 2:
                        if (GananciaPerdida.find({ id : {$exists: true } }).count() === 0){
                            var nuevo_id = 1;
                        }
                        else {
                            var maximo_id = GananciaPerdida.aggregate([{ $group: {_id: "MAX_ID", max_id : { $max: "$id"}}}]);
                            var v_val_id = maximo_id;
                            for (C = 0, tamanio_val_id = maximo_id.length; C < tamanio_val_id; C++) {
                                var obj_id_act = maximo_id[C];
                                var id_act = obj_id_act.max_id;
                                var nuevo_id = id_act+1;
                            };
                        };
                break;
                case 3:
                        if (GananciaPerdida.find({ id_lote : {$exists: true } }).count() === 0){
                            var nuevo_id = 1;
                        }
                        else {
                            var maximo_id = GananciaPerdida.aggregate([{ $group: {_id: "MAX_ID", max_id : { $max: "$id_lote"}}}]);
                            var v_val_id = maximo_id;
                            for (C = 0, tamanio_val_id = maximo_id.length; C < tamanio_val_id; C++) {
                                var obj_id_act = maximo_id[C];
                                var id_act = obj_id_act.max_id;
                                var nuevo_id = id_act+1;
                            };
                        };
                break;
            }

        
        return nuevo_id;
    },
	
});