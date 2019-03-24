import { Meteor } from 'meteor/meteor';
//import { Constantes } from '../herramientas/Global.js';
moment().tz('America/Caracas').format();
//var CONSTANTES = Meteor.call("Constantes");

/*
const autoriza_conexion = Conexion_api.findOne({ casa_cambio : 'hitbtc'}, {_id:0});
const key = autoriza_conexion.key;
const secret = autoriza_conexion.secret;
const apikey = key+':'+secret;
*/
Meteor.methods({

    'ConexionGet':function(V_URL) {
        var CONSTANTES = Meteor.call("Constantes");   
        try {
            var V_OBTENIDO = HTTP.get( V_URL,{auth:CONSTANTES.apikey});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call("ValidaError",'Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error, 1);
            }
        }
    },

    'ConexionPost':function(V_URL,datos) {
        var CONSTANTES = Meteor.call("Constantes");   
        try {
            var V_OBTENIDO = HTTP.post( V_URL,{auth:CONSTANTES.apikey,data:datos});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call('ValidaError','Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error, 1);
            }
        }
    },

    'ConexionPut':function(V_URL,datos) {
        var CONSTANTES = Meteor.call("Constantes");
        try {
            var V_OBTENIDO = HTTP.put( V_URL,{auth:CONSTANTES.apikey,data:datos});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call('ValidaError','Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error, 1);
            }
        }
    },

    'ConexionDel':function(V_URL,datos) {
        var CONSTANTES = Meteor.call("Constantes");
        try {
            var V_OBTENIDO = HTTP.del( V_URL,{auth:CONSTANTES.apikey,data:datos});
            return V_OBTENIDO;
        }
        catch (error){
            if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) ) {
                Meteor.call('ValidaError','Conexion_api_fallida', 1);
            }
            else{
                Meteor.call('ValidaError',error, 1);
            }
        }
    },
	
});