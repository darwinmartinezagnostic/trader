import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();
const btoa = function(str){ return Buffer.from(str).toString('base64')};
//var CONSTANTES = Meteor.call("Constantes");

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
        //console.log("Valor de url: ", url, " MS: ", MS);
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
                                    //console.log (response)
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
                    console.log('TIMEOUT en ejecución del URL: ', url);
                }
        }
    },

    async ConexionPost(V_URL, datos){

        var request = require('request-promise')

        global.Headers = fetch.Headers;
        global.formData = fetch.formData;

        var CONSTANTES = Meteor.call("Constantes");  
        const MS =  CONSTANTES.TimeoutEjecucion * 60000
        const ak = CONSTANTES.apikey
        const user = CONSTANTES.user;
        const pswrd = CONSTANTES.passwr;
        let url = V_URL
        console.log("Valor de url: ", url, " MS: ", MS, "datos: ", datos);
        var salida = 0;
        ordenCliente = "1" 

        var parametros = {
                        url: V_URL,
                        method: 'POST',
                        body: datos,
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
            //console.log("Estoy en while( salida.status !== 200 )")
            const respuesta = request(parametros)
                                        .then(function (response) {
                                            //console.log ("Valor de response: ",response)
                                            resp = JSON.parse(response)
                                            return resp
                                            })
                                        .catch(function(error) {
                                            ErrorConseguido = JSON.parse(error.error)
                                            //console.error("Valor de catch ErrorConseguido: ", ErrorConseguido);
                                            return ErrorConseguido
                                            });
            const tok = token();            
            const EstadoCancelacion = CancelaEjecucionConexion ( respuesta, tok);            
            let tpr = await TimeoutEjecucion(EstadoCancelacion, MS)
            const salida = await respuesta

            if ( salida.id ) {
                //console.log ("Valor de salida2", salida)
                return salida
            }else if ( salida.error.code !== 200 ) {
                const mensaje = salida.error.message
                console.log("Valor de mensaje: ", mensaje)
                
                if ( mensaje === "Insufficient funds") {
                    mensj = { status :"Insufficientfunds"}
                    return mensj
                }else 
                if ( mensaje === "Duplicate clientOrderId") {
                    mensj = { status :"DuplicateclientOrderId"}
                    return mensj
                }else 
                if ( mensaje === "error is not defined") {
                    mensj = { status :"errorisnotdefined"}
                    return mensj
                }else {
                    console.log("Valor de salida.error: ", salida.error)
                    return salida.error
                }
            }
        }
    },

    async ConexionPut(V_URL,datos){

        global.Headers = fetch.Headers;

        var CONSTANTES = Meteor.call("Constantes");  
        const MS =  CONSTANTES.TimeoutEjecucion * 60000
        const ak = CONSTANTES.apikey
        let url = V_URL
        console.log("Valor de url: ", url, " MS: ", MS, "datos: ", datos);
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
                                    //console.log (response)
                                    return response
                                    });
                //console.log("Valor de respuesta: ", respuesta)
                const tok = token();
                const EstadoCancelacion = CancelaEjecucionConexion ( respuesta, tok);
                try{
                    let tpr = await TimeoutEjecucion(EstadoCancelacion, MS)
                    const salida = await respuesta
                    console.log("Valor de salida", salida) 

                    /*
                    if ( salida.status === 200 ) {
                        console.log("Probando")
                        const datos = salida.json()
                        return datos
                    }else{
                        const datos = undefined
                        return datos
                    }
                    */

                    const datos = salida.json()
                    return datos


                }catch(e){
                    console.log('TIMEOUT en ejecución del URL: ', url);
                }/*
            }catch(error){
                if ( /url must be absolute and start with http:/.test(error) || /Parameter "url" must be a string, not object/.test(error) || /request to https:/.test(error) ) {
                    //Meteor.call("ValidaError",'Conexion_api_fallida', 1);
                    console.log("Conexion_api_fallida")
                    break;
                }
                else{   
                    //Meteor.call('ValidaError',error, 1);
                    console.log("estoy en el else del error:", error);
                    break;
                }
            }*/
        }
    },

    'ConexionDel':function(V_URL,datos) {
        var CONSTANTES = Meteor.call("Constantes");
        try {

            var V_OBTENIDO = 0

            while( V_OBTENIDO.statusCode !== 200 ){
                var V_OBTENIDO = HTTP.del( V_URL,{auth:CONSTANTES.apikey,data:datos});
                return V_OBTENIDO;
            }
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