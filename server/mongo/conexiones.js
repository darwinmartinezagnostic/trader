import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();
const btoa = function(str){ return Buffer.from(str).toString('base64')};
//var CONSTANTES = Meteor.call("Constantes");

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();
/*
const autoriza_conexion = Conexion_api.findOne({ casa_cambio : 'hitbtc'}, {_id:0});
const key = autoriza_conexion.key;
const secret = autoriza_conexion.secret;
const apikey = key+':'+secret;
*/
Meteor.methods({

    async ConexionGet(V_URL){

        global.Headers = fetch.Headers;

        var CONSTANTES = Meteor.call("Constantes");  
        const MS =  CONSTANTES.TimeoutEjecucion * 60000
        const ak = CONSTANTES.apikey
        let url = V_URL
        //log.info("Valor de url: ", url, " MS: ", MS);
        var salida = 0;

        const token = function() { 
            return {
                cancel: function () {this.cancelado = true},
                cancelado: false
            }
        }

        async function TimeoutEjecucion (pr, MS) {
        await Promise.race([pr, new Promise((_, rej) =>
                setTimeout(rej, MS)
            )])
        }

        async function CancelaEjecucionConexion (iterf, token){
            await iterf;
            if (token.cancelado)  {
              throw Error('Ejcución Cancelada');
            }
        }

        let autorizacion = ak
        let headers = new Headers();
        headers.set('Authorization', 'Basic ' + btoa(autorizacion))

        while( salida.status !== 200 ){
            //try{

                const respuesta = fetch (url,{
                                        method: 'GET',
                                        headers: headers
                                    })
                                    .then(function (response) {
                                    //log.info (response)
                                    return response
                                    });
                const tok = token();
                const EstadoCancelacion = CancelaEjecucionConexion ( respuesta, tok);
                try{
                    let tpr = await TimeoutEjecucion(EstadoCancelacion, MS)
                    const salida = await respuesta

                    const datos = salida.json()
                    return datos
                }catch(e){
                    log.error('TIMEOUT en ejecución del URL: ', url,'Conexiones');
                }
        }
    },

    async ConexionPost(V_URL, datos, OPC){

        var request = require('request-promise')

        global.Headers = fetch.Headers;
        global.formData = fetch.formData;

        var CONSTANTES = Meteor.call("Constantes");  
        const MS =  CONSTANTES.TimeoutEjecucion * 60000
        const ak = CONSTANTES.apikey
        const user = CONSTANTES.user;
        const pswrd = CONSTANTES.passwr;
        let url = V_URL
        log.info('',"Valor de url: " + url + " MS: " + MS + " datos: " + datos,' Conexiones');
        var salida = 0;
        ordenCliente = "1" 

        switch ( OPC ){ 
            case 1:
                var parametros = {
                                url: url,
                                method: 'POST',
                                body: JSON.stringify(datos),
                                auth: {
                                    'user': user,
                                    'pass': pswrd
                                }
                            };
            break;
            case 2:
                var parametros = {
                        url: url,
                        method: 'POST',
                        body: datos,
                        auth: {
                            'user': user,
                            'pass': pswrd
                        }
                    };
            break;
        }

        const token = function() { 
            return {
                cancel: function () {this.cancelado = true},
                cancelado: false
            }
        }

        async function TimeoutEjecucion (pr, MS) {
        await Promise.race([pr, new Promise((_, rej) =>
                setTimeout(rej, MS)
            )])
        }

        async function CancelaEjecucionConexion (iterf, token){
            await iterf;
            if (token.cancelado)  {
              throw Error('Ejecución Cancelada');
            }
        }
        
        while( salida.status !== 200 ){
            //log.info("Estoy en while( salida.status !== 200 )")
            const respuesta = request(parametros)
                                        .then(function (response) {
                                            //log.info ("Valor de response: ",response)
                                            resp = JSON.parse(response)
                                            return resp
                                            })
                                        .catch(function(error) {
                                            ErrorConseguido = JSON.parse(error.error)
                                            //log.error("Valor de catch ErrorConseguido: ", ErrorConseguido);
                                            return ErrorConseguido
                                            });
            const tok = token();            
            const EstadoCancelacion = CancelaEjecucionConexion ( respuesta, tok);            
            let tpr = await TimeoutEjecucion(EstadoCancelacion, MS);
            const salida = await respuesta;

            if ( salida.id ) {
                //log.info ("Valor de salida2", salida)
                return salida;
            }else if ( salida.error.code !== 200 ) {
                const mensaje = salida.error.message;
                log.error("Valor de mensaje: ", mensaje,'Conexiones');
                
                if ( mensaje === "Insufficient funds") {
                    mensj = { status :"Insufficientfunds"}
                    return mensj;
                }else 
                if ( mensaje === "Duplicate clientOrderId") {
                    mensj = { status :"DuplicateclientOrderId"}
                    return mensj;
                }else 
                if ( mensaje === "error is not defined") {
                    mensj = { status :"errorisnotdefined"}
                    return mensj;
                }else 
                if ( mensaje === "Symbol not found") {
                    mensj = { status :"Symbolnotfound"}
                    return mensj;
                }else {
                    log.error("Valor de salida.error: ", salida.error,'Conexiones');
                    return salida.error;
                }
            }
        }
    },

    async ConexionPut(V_URL,datos){

        global.Headers = fetch.Headers;

        var CONSTANTES = Meteor.call("Constantes");  
        const MS =  CONSTANTES.TimeoutEjecucion * 60000;
        const ak = CONSTANTES.apikey;
        let url = V_URL;
        log.info('',"Valor de url: "+ url+ " MS: "+ MS+ "datos: "+ datos,'Conexiones');
        var salida = 0;

        const token = function() { 
            return {
                cancel: function () {this.cancelado = true},
                cancelado: false
            }
        }

        async function TimeoutEjecucion (pr, MS) {
        await Promise.race([pr, new Promise((_, rej) =>
                setTimeout(rej, MS)
            )])
        }

        async function CancelaEjecucionConexion (iterf, token){
            await iterf;
            if (token.cancelado)  {
              throw Error('Ejcución Cancelada');
            }
        }

        let autorizacion = ak
        let headers = new Headers();
        headers.set('Authorization', 'Basic ' + btoa(autorizacion), 'Accept', 'application/json', 'Content-Type', 'application/json' )

        while( salida.status !== 200 ){
            //try{
                global.Headers = fetch.Headers;

                const respuesta = fetch (url,{
                                        method: 'PUT',
                                        body: JSON.stringify(datos),
                                        headers: headers
                                    })
                                    .then(function (response) {
                                    //log.info (response)
                                    return response
                                    });
                //log.info("Valor de respuesta: ", respuesta)
                const tok = token();
                const EstadoCancelacion = CancelaEjecucionConexion ( respuesta, tok);
                try{
                    let tpr = await TimeoutEjecucion(EstadoCancelacion, MS)
                    const salida = await respuesta
                    log.info("Valor de salida", salida,'Conexiones');

                    /*
                    if ( salida.status === 200 ) {
                        log.info("Probando")
                        const datos = salida.json()
                        return datos
                    }else{
                        const datos = undefined
                        return datos
                    }
                    */

                    const datos = salida.json();
                    return datos;


                }catch(e){
                    log.error('TIMEOUT en ejecución del URL: ', url,'Conexiones');
                }/*
            }catch(error){
                if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) || /request to https:/.test(error) ) {
                    //Meteor.call("ValidaError",'Conexion_api_fallida', 1);
                    log.info("Conexion_api_fallida")
                    break;
                }
                else{   
                    //Meteor.call('ValidaError',error, 1);
                    log.info("estoy en el else del error:", error);
                    break;
                }
            }*/
        }
    },

    async ConexionDel (V_URL) {       
        var request = require('request-promise')
        log.trace(" Valor recibido - V_URL: ", V_URL);

        global.Headers = fetch.Headers;
        global.formData = fetch.formData;

        var CONSTANTES = Meteor.call("Constantes");  
        const MS =  CONSTANTES.TimeoutEjecucion * 60000
        const ak = CONSTANTES.apikey
        const user = CONSTANTES.user;
        const pswrd = CONSTANTES.passwr;
        let url = V_URL;
        log.info("Valor de url: "+ url, " MS: "+ MS,'Conexiones');
        var salida = 0;
        ordenCliente = "1" ;

        var parametros = {
                        url: V_URL,
                        method: 'DEL',
                        auth: {
                            'user': user,
                            'pass': pswrd
                        }
                    };

        const token = function() { 
            return {
                cancel: function () {this.cancelado = true},
                cancelado: false
            }
        }

        async function TimeoutEjecucion (pr, MS) {
        await Promise.race([pr, new Promise((_, rej) =>
                setTimeout(rej, MS)
            )])
        }

        async function CancelaEjecucionConexion (iterf, token){
            await iterf;
            if (token.cancelado)  {
              throw Error('Ejcución Cancelada');
            } 
        }
        while( salida.status !== 200 ){
            log.info('',"Estoy en while( salida.status !== 200 )",'Conexiones');
            const respuesta = request(parametros)
                                        .then(function (response) {
                                            log.info ("Valor de response: ",response,'Conexiones');
                                            resp = JSON.parse(response);
                                            return resp;
                                            })
                                        .catch(function(error) {
                                            ErrorConseguido = JSON.parse(error.error);
                                            log.error("Valor de catch ErrorConseguido: ", ErrorConseguido,'Conexiones');
                                            return ErrorConseguido;
                                            });
            const tok = token();            
            const EstadoCancelacion = CancelaEjecucionConexion ( respuesta, tok);            
            log.trace(" Voy por acá ")
            let tpr = await TimeoutEjecucion(EstadoCancelacion, MS);
            const salida = await respuesta;
            log.trace(" Valor de salida: ", salida,'Conexiones');

            if ( salida.id ) {
                log.info ("Valor de salida2", salida,'Conexiones');
                return salida;
            }else if ( salida.error.code !== 200 ) {
                log.error("Valor de salida3", salida,'Conexiones');
                const mensaje = salida.error.message;
                log.error("Valor de mensaje: ", mensaje,'Conexiones');
                
                if ( mensaje === "Insufficient funds") {
                    mensj = { status :"Insufficientfunds"}
                    return mensj;
                }else 
                if ( mensaje === "Duplicate clientOrderId") {
                    mensj = { status :"DuplicateclientOrderId"}
                    return mensj;
                }else 
                if ( mensaje === "error is not defined") {
                    mensj = { status :"errorisnotdefined"}
                    return mensj;
                }else {
                    log.error("Valor de salida.error: ", salida.error,'Conexiones');
                    return salida.error;
                }
            }
        }
    },
	
});