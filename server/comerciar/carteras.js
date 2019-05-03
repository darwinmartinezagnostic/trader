import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

Meteor.methods({

    'ConsultaCarterasDeposito':function(){
        var CONSTANTES = Meteor.call("Constantes");  
        //console.log('Valor de CONSTANTES: ', CONSTANTES);
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Consulta las carteras Activas a la cual se le puede asignar saldo');
        console.log(' ');

        try{
            var moneda = Meteor.call("ConexionGet", CONSTANTES.monedas);
            //var mons_body = (moneda.body);
            //console.log("Valor de moneda: ", moneda);
            //var mons = (moneda.data);
            console.log("Valor de moneda.length: ", moneda.length);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };

        //for ( a = 0, len = mons.length ; a < len; a++) {
        for ( a = 0, len = moneda.length ; a < len; a++) {
            console.log('############################################');
            //var mon = mons[a]; 
            var mon = moneda[a];

            //Meteor.call("GuardarLogEjecucionTrader", [' Valor de mon']+[mon]);
            Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA: ']+[mon.id]+[' == ']+[mon.fullName]);

            var url_cartera_depositos = [CONSTANTES.cart_dep]+'/'+[mon.id];
            console.log ("Valor de url_cartera_depositos: ", url_cartera_depositos);

            var v_cartera = Meteor.call("ConexionGet", url_cartera_depositos);
            console.log(' Valor de v_cartera:', v_cartera);

            /*
            try {
                var v_cartera = Meteor.call("ConexionGet", url_cartera_depositos);
                var cartera = (v_cartera.data);
            }
        catch (error){
                Meteor.call("ValidaError", error, 1)
            };*/

            Meteor.call("GuardarLogEjecucionTrader", ['    DIRECCIÓN DE CARTERA: ']+[cartera.address]);
            console.log(' ');
            console.log('############################################');
        };
    },

    'CrearCarterasDeposito':function(MONEDA){ //Create new deposit crypro address
        var CONSTANTES = Meteor.call("Constantes");
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Crea las carteras Activas a la cual se le puede asignar saldo');
        console.log(' ');
        try{
            var url_NuevaCartera = [CONSTANTES.cart_dep]+'/'+[MONEDA]
            var NuevaCartera = Meteor.call("ConexionPost", url_NuevaCartera);
            var V_NuevaCartera = (NuevaCartera.data);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };
        console.log(' Nueva cartera: ', V_NuevaCartera.address);
    },
	
});