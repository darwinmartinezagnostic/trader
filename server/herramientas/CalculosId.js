import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'CalculaId':function(VALOR_EJEC){
        // OPTIMIZAR EL CODIGO -- PUEDE QUE SE PUEDA REDUCIR
        switch(VALOR_EJEC){
                case 1:
                        if (LogEjecucionTrader.find({ _id : {$exists: true } }).count() === 0){
                            LogEjecucionTrader.insert({fecha: new Date(), id:1 ,descripcion:'Trader iniciado'});
                            var nuevo_id = 1;
                        }
                        else {
                            var maximo_id = LogEjecucionTrader.aggregate([{ $group: { _id: "MAX_ID", max_id : { $max: "$id"}}}]);
                            var v_val_id = maximo_id[0];
                            var id_act = parseFloat(v_val_id.max_id);
                            var nuevo_id = id_act+1;
                        };
                break;
                case 2:
                        if (GananciaPerdida.find().count() === 0){
                            var nuevo_id = 1;
                        }
                        else {
                            var maximo_id = GananciaPerdida.aggregate([{ $group: { _id: "MAX_ID", max_id : { $max: "$Operacion.ID_LocalAct"}}}]);
                            var v_val_id = maximo_id[0];
                            var id_act = parseFloat(v_val_id.max_id);
                            var nuevo_id = id_act+1;
                        };
                break;
                case 3:
                        if (GananciaPerdida.find({ id_lote : {$exists: true } }).count() === 0){
                            var nuevo_id = 1;
                        }
                        else {
                            var maximo_id = GananciaPerdida.aggregate([{ $group: { _id: "MAX_ID", max_id : { $max: "$Operacion.Id_Lote"}}}]);
                            var v_val_id = maximo_id[0];
                            var id_act = parseFloat(v_val_id.max_id);
                            var nuevo_id = id_act+1;
                        };
                break;
            }

        
        return nuevo_id;
    },
	
});