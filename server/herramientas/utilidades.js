import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
moment().tz('America/Caracas').format();

const log = new Logger();
const LogFile = new LoggerFile(log,logFilePath);
// Enable LoggerFile with default settings
LogFile.enable();

Meteor.methods({

    'sleep':function(segundos){
        /*
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milisegundos) {
                break;
            }
        }
        */

        objetivo = (new Date()).getTime() + 1000 * Math.abs(segundos);
        //objetivo = (new Date()).getTime() * Math.abs(milisegundos);
        while ( (new Date()).getTime() < objetivo );
    },

    'Encabezado':function(){
        fecha = moment (new Date());
        Meteor.call("GuardarLogEjecucionTrader", 'INICIANDO EJECUCIÓN');
        //log.info(' Acá estoy ');
        log.info('############################################');
        log.info('  ********* INICIANDO EJECUCIÓN ********* ');
        log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        log.info('############################################');
        log.info(' ');
    },

    'FinEjecucion':function(){
        fecha = moment (new Date());
        Meteor.call("GuardarLogEjecucionTrader", 'FIN DE EJECUCIÓN');
        //log.info(' ');
        log.info('############################################');
        log.info('    ********* FIN DE EJECUCIÓN ********* ');
        log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        //log.info('############################################');
    },

    'CombierteNumeroExpStr':function(VALOR){
        if(VALOR.toString().indexOf('e') != -1){
            if(VALOR.toString().indexOf('.') != -1){
                NuevoVALOR = VALOR.toString().replace(".", "");
                //log.info("Valor de VALOR", VALOR);
                //log.info("Valor de NuevoVALOR", NuevoVALOR);
                separador = "-"
                V_separador = NuevoVALOR.toString().split(separador);
                //log.info("Valor de V_separador", V_separador);
                valor_exp = parseFloat(V_separador[1]);
                ValorAnalizar = parseFloat(NuevoVALOR).toFixed(valor_exp);
                //log.info("Valor de ValorAnalizar", ValorAnalizar);
                ver = VALOR.toString()
                //log.info("Valor de ver", ver);

            }else{
                separador = "-"
                V_separador = VALOR.toString().split(separador);
                //log.info("Valor de V_separador", V_separador);
                valor_exp = parseFloat(V_separador[1]);
                ValorAnalizar = VALOR.toFixed(valor_exp);
                //log.info("Valor de ValorAnalizar", ValorAnalizar);
            }
        }else{
            ValorAnalizar = VALOR;
        }
        return ValorAnalizar;
    },

    'ReemplazaNumeroACero':function(VALOR){
        if(VALOR.toString().indexOf('e') != -1){
            if(VALOR.toString().indexOf('.') != -1){
                NuevoVALOR = VALOR.toString().replace(".", "");
                //log.info("Valor de NuevoVALOR", NuevoVALOR);
                separador = "-"
                V_separador = NuevoVALOR.toString().split(separador);
                //log.info("Valor de V_separador", V_separador);
                valor_exp = parseFloat(V_separador[1]);
                ValorAnalizar = parseFloat(NuevoVALOR).toFixed(valor_exp);
                //log.info("Valor de ValorAnalizar", ValorAnalizar);
            }else{
                separador = "-"
                V_separador = VALOR.toString().split(separador);
                valor_exp = parseFloat(V_separador[1]);
                ValorAnalizar = VALOR.toFixed(valor_exp);
            }
        }else{
            ValorAnalizar = VALOR;
        }        

        var tstr = ValorAnalizar.toString().trim().length -2;
        var nvstr = ValorAnalizar.toString().trim().substr(0, tstr);
        var res = nvstr.replace(/1|2|3|4|5|6|7|8|9/gi, function (x) {
            return 0;
        });
        var res = [res]+["1"];
        //log.info("Valor de res", res);
        var Salida = parseFloat(res);
        return Salida;
    },

    'RecuperacionAutonoma':function(){

        //log.info('############################################');
        Meteor.call('GuardarLogEjecucionTrader', ['Intentando Recuperación automática']);
        Meteor.call('GuardarLogEjecucionTrader', ['Borrando Trabajos no culminados']);

        try {
            JobsInternal.Utilities.collection.remove({});
        }
        catch (error){
            Meteor.call('GuardarLogEjecucionTrader', ['No se ha podido realizar Borrando de Trabajos no culminados']);
            Meteor.call('GuardarLogEjecucionTrader', ['Se debe verificar manualmente']);
        }

        Jobs.run("JobReinicioSecuencia", { 
            in: {
                second: 1
                }
        });



       // log.info('############################################');
    },

    'CompletaConCero' : function (numero, tamanio) {
        var numeroOutput = Math.abs(numero); /* Valor absoluto del número */
        var length = numero.toString().length; /* Largo del número */ 
        var cero = "0"; /* String de cero */  
        
        if (tamanio <= length) {
            if (numero < 0) {
                 return ("-" + numeroOutput.toString()); 
            } else {
                 return numeroOutput.toString(); 
            }
        } else {
            if (numero < 0) {
                return ("-" + (cero.repeat(tamanio - length)) + numeroOutput.toString()); 
            } else {
                return ((cero.repeat(tamanio - length)) + numeroOutput.toString()); 
            }
        }
    },

    'ReinicioDeSecuenciasGBL' : function (NOMBRE) {
        SecuenciasGlobales.findAndModify({
                                            query: { _id: NOMBRE },
                                            update: { secuencia: 0 },
                                            new: true
                                        });
    },

    'LimpiarBD': function(){
        LogEjecucionTrader.remove({});
        Monedas.remove({});
        TiposDeCambios.remove({});
        OperacionesCompraVenta.remove({});
        HistorialTransferencias.remove({});
        TempTiposCambioXMoneda.remove({});
        TempSaldoMoneda.remove({});
        TmpTipCambioXMonedaReord.remove({});
        EquivalenciasDol.remove({});
        GananciaPerdida.remove({});
        GananciasGlobales.remove({});
        Carteras.remove({});
        SecuenciasTemporales.remove({});
        

        const NombresSecuenciasGlobales = ['IdGanPerdLocal', 'IdGanPerdLote', 'IdHistTrans', 'IdLog', 'IdHistTransfer', 'IdTemporal']

        for ( CSG = 0, TSG = NombresSecuenciasGlobales.length; CSG < TSG; CSG++ ) {
            NOMBRE = NombresSecuenciasGlobales[CSG]
            Meteor.call("ReinicioDeSecuenciasGBL", NOMBRE)
        }
    },

    'ReinicioDatResultAnalisis' : function (NOMBRE) {
        SaldosTotales.remove({});
        ResultadoAnalisis.remove({});
        DatosAnalisis.remove({});

        var RPA = Parametros.findOne( { dominio : "Prueba", nombre : "ResetParametrosAnalisis" } );
        var ReiniParamAnalisis = RPA.valor

        if ( ReiniParamAnalisis ) {
            Meteor.call('ReinicioParametrosAnalisis');
        }
    },
    	
});