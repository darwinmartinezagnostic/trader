import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({

    'ConsultaCarterasDeposito':function(){
        var CONSTANTES = Meteor.call("Constantes");  

        Meteor.call("GuardarLogEjecucionTrader", ' Consulta las carteras Activas a la cual se le puede asignar saldo');
        try{
            var moneda = Meteor.call("ConexionGet", CONSTANTES.monedas);}
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };

        for ( a = 0, len = moneda.length ; a < len; a++) {
            //var mon = mons[a]; 
            var mon = moneda[a];

            //Meteor.call("GuardarLogEjecucionTrader", [' Valor de mon']+[mon]);
            Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA: ']+[mon.id]+[' == ']+[mon.fullName]);

            var url_cartera_depositos = [CONSTANTES.cart_dep]+'/'+[mon.id];
            log.info ("Valor de url_cartera_depositos:", url_cartera_depositos,'Carteras');

            var v_cartera = Meteor.call("ConexionGet", url_cartera_depositos);
            log.info('Valor de v_cartera:', v_cartera.toString(),'Carteras');
            

            Meteor.call("GuardarLogEjecucionTrader", ['    DIRECCIÓN DE CARTERA: ']+[cartera.address]);
        };
    },

    'CrearCarterasDeposito':function(MONEDA){ //Create new deposit crypro address
        var CONSTANTES = Meteor.call("Constantes");
        Meteor.call("GuardarLogEjecucionTrader", ' Crea las carteras Activas a la cual se le puede asignar saldo');
        try{
            var url_NuevaCartera = [CONSTANTES.cart_dep]+'/'+[MONEDA]
            var NuevaCartera = Meteor.call("ConexionPost", url_NuevaCartera);
            var V_NuevaCartera = (NuevaCartera.data);
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };
        log.info('Nueva cartera:', V_NuevaCartera.address,'Carteras');
    },
	
});