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
        //log.info('############################################');
        //log.info('  ********* INICIANDO EJECUCIÓN ********* ');
        //log.info('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        //log.info('############################################');
        //log.info(' ');
    },

    'FinEjecucion':function(){
        fecha = moment (new Date());
        Meteor.call("GuardarLogEjecucionTrader", 'FIN DE EJECUCIÓN');
        //log.info(' ');
        //log.info('############################################');
        //log.info('    ********* FIN DE EJECUCIÓN ********* ');
        //log.info('############################################');
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

    'EquivalenteDolar':function(MONEDA, S_MOND, TIPO_ACCION){
        //log.info(" EquivalenteDolar: Val recib: ", "MONEDA: -",  MONEDA, "- ,S_MOND: -", S_MOND, "- ,TIPO_ACCION: ", TIPO_ACCION)
        var SALDO = parseFloat(S_MOND);
        if ( SALDO === 0 ) {
            var EquivalenciaActual = 0;
        }else{

            if ( MONEDA == 'USD' ) {
                var EquivalenciaActual = parseFloat(SALDO);
            }else{
                var ExisteTipoCambio = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{ _id : 0, tipo_cambio : 1}).count();
                if ( ExisteTipoCambio !== 0 ) {
                    var DIRECTO = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                    if ( DIRECTO !== 0 ) {
                        var PrecioDirecto = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                        var TipoCambioObtenido = PrecioDirecto[0].tipo_cambio;
                        var MB = PrecioDirecto[0].moneda_base;
                        var MC = PrecioDirecto[0].moneda_cotizacion;
                        var MinInv=PrecioDirecto[0].valor_incremento;
                        var TMinInv = MinInv.toString().trim().length
                        var SaldoMinTC= SALDO.toString().trim().substr(0, TMinInv)
                        switch (TIPO_ACCION){
                            case 1:
                                var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                    { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                ]);
                                var ValorPromedio = ValorObtenido[0]

                                if ( ValorPromedio === undefined ) {
                                    var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                }

                            break;
                            case 2:
                                var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                            break;
                        }
                        log.info(" EquivalenteDolar: Valor de ValorPromedio: ", ValorPromedio,'Utilidades');

                        var TipoCambioValido = ValorPromedio.Existe
                        if ( TipoCambioValido !== 1 ) {
                            var EquivalenciaActual = 0;
                            TiposDeCambios.update({ tipo_cambio: TipoCambioObtenido }, {    
                                                        $set: {
                                                                habilitado: 0
                                                            }
                                                        }, {"multi" : true,"upsert" : true});
                        }else{
                            if ( MONEDA === MB ) {
                                var EquivalenciaActual = ( parseFloat(SALDO) * parseFloat(ValorPromedio.Promedio) ) ;
                                log.info(" Valor de EquivalenciaActual: ", EquivalenciaActual+" = ("+ parseFloat(SALDO)+" * "+parseFloat(ValorPromedio.Promedio),'Utilidades');
                            }else if ( MONEDA === MC ) {
                                var EquivalenciaActual = ( parseFloat(SALDO) / parseFloat(ValorPromedio.Promedio) );
                                log.info(" Valor de EquivalenciaActual: ", EquivalenciaActual+" = ("+parseFloat(SALDO)+" / "+parseFloat(ValorPromedio.Promedio),'Utilidades');
                            }
                        }
                    }else {
                        var TiposCambiosMoneda = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA } ]},{}).fetch();
                        //log.info(" Valor de TiposCambiosMoneda:", TiposCambiosMoneda)
                        for ( CTCDM = 0, TTCDM = TiposCambiosMoneda.length; CTCDM < TTCDM; CTCDM++ ) {
                            var V_TiposCambiosMoneda = TiposCambiosMoneda[CTCDM];
                            //log.info(" Valor de V_TiposCambiosMoneda:", V_TiposCambiosMoneda)
                            var MCotizacion = V_TiposCambiosMoneda.moneda_cotizacion;
                            //log.info(" Valor de MCotizacion:", MCotizacion)
                            var MBase = V_TiposCambiosMoneda.moneda_base;
                            //log.info(" Valor de MBase:", MBase)
                            var TipoCambioObtenido = V_TiposCambiosMoneda.tipo_cambio;
                            //log.info(" Valor de TipoCambioObtenido:", TipoCambioObtenido)

                            var MinInv=V_TiposCambiosMoneda.valor_incremento;
                            //log.info(" Valor de MinInv:", MinInv)
                            var TMinInv = MinInv.toString().trim().length
                            //log.info(" Valor de TMinInv:", TMinInv)
                            var SaldoMinTC= SALDO.toString().trim().substr(0, TMinInv)
                            //log.info(" Valor de SaldoMinTC:", SaldoMinTC)


                            var ExistMCUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                            //log.info(" Valor de ExistMCUSD:", ExistMCUSD)
                            var ExistMBUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                            //log.info(" Valor de ExistMBUSD:", ExistMBUSD)
                            if ( ExistMCUSD !== 0 ) {
                                if ( MBase === MONEDA ) {
                                    MonedaEquivalenteAux = MCotizacion
                                    //log.info(" Valor de MonedaEquivalenteAux:", MonedaEquivalenteAux)
                                }else if ( MCotizacion === MONEDA ) {
                                    MonedaEquivalenteAux = MBase
                                    //onsole.log(" Valor de MonedaEquivalenteAux:", MonedaEquivalenteAux)
                                }
                                break
                            }else if ( ExistMBUSD !== 0 ) {
                                if ( MBase === MONEDA ) {
                                    MonedaEquivalenteAux = MCotizacion
                                    //log.info(" Valor de MonedaEquivalenteAux:", MonedaEquivalenteAux)
                                }else if ( MCotizacion === MONEDA ) {
                                    MonedaEquivalenteAux = MBase
                                    //log.info(" Valor de MonedaEquivalenteAux:", MonedaEquivalenteAux)
                                }
                                break
                            }

                        }

                        switch (TIPO_ACCION){
                            case 1:
                                var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                    { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                ]);
                                var ValorPromedioObtenido = ValorObtenido[0]

                                if ( MONEDA === MBase ) {
                                    var SaldEquivActualAux =  ( parseFloat(SALDO) * ValorPromedioObtenido.Promedio ) ;
                                }else if ( MONEDA === MCotizacion ) {
                                    var SaldEquivActualAux = ( parseFloat(SALDO) / ValorPromedioObtenido.Promedio );
                                }
                            break;
                            case 2:
                                var ValorPromedioObtenido = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                //log.info(" Valor de ValorPromedioObtenido:", ValorPromedioObtenido, "= Meteor.call('LibroDeOrdenes'", TipoCambioObtenido )
                                //log.info(" Valor de MBase:", MBase)
                                //log.info(" Valor de MCotizacion:", MCotizacion)
                                if ( MONEDA === MBase ) {
                                    //log.info(" Estoy en if ( MONEDA === MBase ) ")
                                    //log.info(" Valor de parseFloat(SALDO):", parseFloat(SALDO))
                                    //log.info(" Valor de parseFloat(ValorPromedioObtenido.Promedio):", parseFloat(ValorPromedioObtenido.Promedio))
                                    var SaldEquivActualAux = ( parseFloat(SALDO) * parseFloat(ValorPromedioObtenido.Promedio) )
                                    //log.info(" Valor de SaldEquivActualAux: ", SaldEquivActualAux)
                                    //log.info(" Valor de SaldEquivActualAux: ", SaldEquivActualAux," = (", parseFloat(SALDO)," * ",parseFloat(ValorPromedioObtenido.Promedio) )
                                }else if ( MONEDA === MCotizacion ) {
                                    //log.info(" Estoy en else if ( MONEDA === MCotizacion ) ")
                                    var SaldEquivActualAux = ( parseFloat(SALDO)  / parseFloat(ValorPromedioObtenido.Promedio) );
                                    //log.info(" Valor de EquivalenciaActual: ", EquivalenciaActual," = (", parseFloat(SALDO)," / ",parseFloat(ValorPromedioObtenido.Promedio) )
                                }
                            break;
                        }

                        var TCUSDAux = TiposDeCambios.findOne({ $and: [{ $or: [ { moneda_base : MonedaEquivalenteAux}, { moneda_cotizacion : MonedaEquivalenteAux }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] })
                        //log.info(" Valor de TCUSDAux:", TCUSDAux)
                        var TipoCambioObtenidoAux = TCUSDAux.tipo_cambio
                        //log.info(" Valor de TipoCambioObtenidoAux:", TipoCambioObtenidoAux)
                        var MBaseAux = TCUSDAux.moneda_base
                        //log.info(" Valor de MBaseAux:", MBaseAux)
                        var MCotiAux = TCUSDAux.moneda_cotizacion
                        //log.info(" Valor de MCotiAux:", MCotiAux)
                        var MinInvAux=TCUSDAux.valor_incremento;
                        //log.info(" Valor de MinInvAux:", MinInvAux)

                        var ValorPromedioObtenidoAux = Meteor.call('LibroDeOrdenes', TipoCambioObtenidoAux);

                        //log.info(" EquivalenteDolar: Valor de ValorPromedioObtenidoAux: ", ValorPromedioObtenidoAux)

                        var TMinInvAux = MinInvAux.toString().trim().length
                        //log.info(" Valor de TMinInvAux:", TMinInvAux)
                        var SaldoMinTCAux= SaldEquivActualAux.toString().trim().substr(0, TMinInv)
                        //log.info(" Valor de SaldoMinTCAux:", SaldoMinTCAux)

                        if ( MonedaEquivalenteAux === MBaseAux ) {
                            var EquivalenciaActual = ( parseFloat(SaldEquivActualAux) * parseFloat(ValorPromedioObtenidoAux.Promedio) ) ;
                            //log.info(" Valor de EquivalenciaActual: ", EquivalenciaActual," = (", parseFloat(SaldEquivActualAux)," * ",parseFloat(ValorPromedioObtenidoAux.Promedio) )
                        }else if ( MonedaEquivalenteAux === MCotiAux ) {
                            var EquivalenciaActual = ( parseFloat(SaldEquivActualAux) / parseFloat(ValorPromedioObtenidoAux.Promedio) );
                            //log.info(" Valor de EquivalenciaActual: ", EquivalenciaActual," = (", parseFloat(SaldEquivActualAux)," / ",parseFloat(ValorPromedioObtenidoAux.Promedio) )
                        }                   
                    }
                }else if ( ExisteTipoCambio === 0 ){
                    var EquivalenciaActual = 0;
                }
            }
        }

        EquivAct = parseFloat(EquivalenciaActual.toFixed(4))
        //log.info(" EquivalenteDolar: Valor de EquivAct: ", EquivAct)
        return EquivAct        
    },

    'EquivalenteDolarMinCompra':function(){

        var T_CAMBIOS = TiposDeCambios.find({ }).fetch();
        for (CT_CAMBIOS = 0, tamanio_T_CAMBIOS = T_CAMBIOS.length; CT_CAMBIOS < tamanio_T_CAMBIOS; CT_CAMBIOS++) {
            V_T_CAMBIOS = T_CAMBIOS[CT_CAMBIOS];
            var EquivDolarMinComp = Meteor.call('EquivalenteDolar', V_T_CAMBIOS.moneda_apli_comision, V_T_CAMBIOS.min_compra, 1);
            
            try{
                TiposDeCambios.update({ tipo_cambio : V_T_CAMBIOS.tipo_cambio },{$set:{ min_compra_equivalente : parseFloat(EquivDolarMinComp) }}, {"multi" : true,"upsert" : true});
            }
            catch (error){
                Meteor.call("ValidaError", error, 2);
            }
        }
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

    'CalcularIversionPromedio' : function ( TIPO_CAMBIO, MONEDA_SALDO, INVER){
        var log = new Logger('router');
        log.info(" CalcularIversionPromedio: Valores recibidos: ", TIPO_CAMBIO+' '+MONEDA_SALDO+' '+INVER,'Utilidades');
        const CONSTANTES = Meteor.call("Constantes");
        const URL_TIKT = CONSTANTES.ticker+TIPO_CAMBIO;       
        //log.trace(" Valor de URL_LIBORD:", URL_TIKT)
        const precio =  Meteor.call("ConexionGet", URL_TIKT);
        //const precio = { bid : '2', ask : '2'}
        //log.trace(" Valor de precio:", precio)
        var TipoCambio =  TiposDeCambios.aggregate([{ $match: { 'tipo_cambio' : TIPO_CAMBIO }}]);
        //log.trace(" Valor de TipoCambio:", TipoCambio)

        if ( MONEDA_SALDO == TipoCambio[0].moneda_cotizacion ) {
            //log.trace(" Estoy en if ( MONEDA_SALDO == TipoCambio[0].moneda_cotizacion )")
            var ValTipoCambio = TipoCambio[0];
            //log.trace(" Valor de ValTipoCambio:", ValTipoCambio)
            var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
            //log.trace(" Valor de comision_hbtc:", comision_hbtc)
            var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
            //log.trace(" Valor de comision_merc:", comision_merc)
            var MR_INVER = parseFloat(INVER).toFixed(9) - comision_hbtc.toFixed(9) - comision_merc.toFixed(9)
            //log.trace(" Valor de MR_INVER:", MR_INVER)
            var promedio = (parseFloat(precio.bid) + parseFloat(precio.ask))/ 2
            //log.trace(" Valor de promedio:", promedio)
            var M_INVERTIR = MR_INVER / parseFloat(promedio)
            //log.trace(" Valor de M_INVERTIR:", M_INVERTIR)
            //var M_INVERTIR = MR_INVER / parseFloat(precio.ask)
            var MONT_INVERTIR = Meteor.call('CombierteNumeroExpStr', M_INVERTIR.toFixed(9))
            //log.trace(" Valor de MONT_INVERTIR:", MONT_INVERTIR)
            var MejorPrec = parseFloat(promedio).toFixed(9).toString()
            //log.trace(" Valor de MejorPrec:", MejorPrec)
            //var MejorPrec = precio.ask.toString()
            //resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec }
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MontRealIversionCal' : parseFloat(MR_INVER).toFixed(9).toString(), 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
            //log.trace(" Valor de resultados:", resultados ,'= {', 'MontIversionCal' ,':', MONT_INVERTIR, 'MontRealIversionCal' ,':', MR_INVER, 'MejorPrecCal' ,':', MejorPrec, 'comision_hbtc' ,':', comision_hbtc, 'comision_mercado' ,':', comision_merc ,'}',)
        }else if ( MONEDA_SALDO == TipoCambio[0].moneda_base ) {
            log.trace(" Estoy en else if ( MONEDA_SALDO == TipoCambio[0].moneda_base )",'','Utilidades');
            var MONT_INVERTIR = INVER
            var promedio = (parseFloat(precio.bid) + parseFloat(precio.ask))/ 2
            var MejorPrec = parseFloat(promedio).toFixed(9).toString()
            var comision_hbtc = 0
            var comision_merc = 0
            //var MejorPrec = precio.bid.toString()
            //resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec }
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MontRealIversionCal' : parseFloat(INVER).toFixed(9).toString(), 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
        }
        return resultados;
    },

    'CalcularIversionXOrden' : function ( TIPO_CAMBIO, MONEDA_SALDO, INVER){
        var log = new Logger('router');
        log.info(" CalcularIversionXOrden: Valores recibidos: ", TIPO_CAMBIO+' '+ MONEDA_SALDO+' '+INVER ,'Utilidades');
        const CONSTANTES = Meteor.call("Constantes");
        const URL_TIKT = CONSTANTES.ticker+TIPO_CAMBIO;       
        //log.trace(" Valor de URL_LIBORD:", URL_TIKT)
        const precio =  Meteor.call("ConexionGet", URL_TIKT);
        //const precio = { bid : '2', ask : '2'}
        //log.trace(" Valor de precio:", precio)
        var TipoCambio =  TiposDeCambios.aggregate([{ $match: { 'tipo_cambio' : TIPO_CAMBIO }}]);
        //log.trace(" Valor de TipoCambio:", TipoCambio)

        if ( MONEDA_SALDO == TipoCambio[0].moneda_cotizacion ) {
            //log.trace(" Estoy en if ( MONEDA_SALDO == TipoCambio[0].moneda_cotizacion )")
            var ValTipoCambio = TipoCambio[0];
            //log.trace(" Valor de ValTipoCambio:", ValTipoCambio)
            var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
            //log.trace(" Valor de comision_hbtc:", comision_hbtc)
            var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
            //log.trace(" Valor de comision_merc:", comision_merc)
            var MR_INVER = parseFloat(INVER).toFixed(9) - comision_hbtc.toFixed(9) - comision_merc.toFixed(9)
            //log.trace(" Valor de MR_INVER:", MR_INVER)
            var M_INVERTIR = MR_INVER / parseFloat(precio.bid)
            //log.trace(" Valor de M_INVERTIR:", M_INVERTIR)
            //var M_INVERTIR = MR_INVER / parseFloat(precio.ask)
            var MONT_INVERTIR = Meteor.call('CombierteNumeroExpStr', M_INVERTIR.toFixed(9))
            //log.trace(" Valor de MONT_INVERTIR:", MONT_INVERTIR)
            var MejorPrec = precio.bid.toString()
            //log.trace(" Valor de MejorPrec:", MejorPrec)
            //var MejorPrec = precio.ask.toString()
            //resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec }
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MontRealIversionCal' : parseFloat(MR_INVER).toFixed(9).toString(), 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
            //log.trace(" Valor de resultados:", resultados ,'= {', 'MontIversionCal' ,':', MONT_INVERTIR, 'MontRealIversionCal' ,':', MR_INVER, 'MejorPrecCal' ,':', MejorPrec, 'comision_hbtc' ,':', comision_hbtc, 'comision_mercado' ,':', comision_merc ,'}',)
        }else if ( MONEDA_SALDO == TipoCambio[0].moneda_base ) {
            log.trace(" Estoy en else if ( MONEDA_SALDO == TipoCambio[0].moneda_base )",'','Utilidades');
            var MONT_INVERTIR = INVER
            var MejorPrec = precio.ask.toString()
            var comision_hbtc = 0
            var comision_merc = 0
            //var MejorPrec = precio.bid.toString()
            //resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec }
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MontRealIversionCal' : INVER, 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
        }
        return resultados;
    },

    'CalcularIversionXVolumen' : function ( TIPO_CAMBIO, MONEDA_SALDO, INVER){
        var log = new Logger('router');
        //log.info(" CalcularIversion: Valores recibidos: ", TIPO_CAMBIO, MONEDA_SALDO, INVER )
        log.info(" CalcularIversionXVolumen: Valores recibidos: ", TIPO_CAMBIO+' '+MONEDA_SALDO+' '+INVER ,'Utilidades');
        const CONSTANTES = Meteor.call("Constantes");
        const URL_LIBORD = [CONSTANTES.LibOrdenes]+[TIPO_CAMBIO]+['?limit=100'];
        //log.trace(" Valor de URL_LIBORD:", URL_LIBORD)
        const OrdenesAbiertas =  Meteor.call("ConexionGet", URL_LIBORD);
        var CalTamAcum = 0;
        var TipoCambio =  TiposDeCambios.aggregate([{ $match: { 'tipo_cambio' : TIPO_CAMBIO }}]);
        if ( MONEDA_SALDO == TipoCambio[0].moneda_cotizacion ) {
            var OrdenesAbiertasVenta = OrdenesAbiertas.ask
            //log.info("Valor de OrdenesAbiertasVenta", OrdenesAbiertasVenta)
            if ( OrdenesAbiertasVenta === undefined ) {
                TiposDeCambios.update(  { tipo_cambio : TIPO_CAMBIO },
                                                        { $set:{     
                                                                    activo : "N",
                                                                    estado : "I" }
                                                        }
                                                    )

                TempTiposCambioXMoneda.remove({ tipo_cambio : TIPO_CAMBIO  })

                resultados = { 'MontIversionCal' : 0, 'MontRealIversionCal' : 0, 'MejorPrecCal' : 0, 'comision_hbtc' : 0, 'comision_mercado' : 0 }

            }else{                
                var ValTipoCambio = TipoCambio[0];
                var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
                var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
                var MR_INVER = parseFloat(INVER).toFixed(9) - comision_hbtc.toFixed(9) - comision_merc.toFixed(9)
                //log.info(" Valor de MR_INVER", MR_INVER," = ",parseFloat(INVER).toFixed(9)," - ", comision_hbtc.toFixed(9)," - ",comision_merc.toFixed(9))

                for ( COAV = 0, TOAV = OrdenesAbiertasVenta.length; COAV <= TOAV; COAV++ ) {
                    var OrdAbrt = OrdenesAbiertasVenta[COAV]
                    var PrecOrdAbrt = OrdAbrt.price.toString()
                    var TamOrdeAbrt = OrdAbrt.size.toString()
                    var M_INVERTIR = MR_INVER / parseFloat(PrecOrdAbrt)
                    var MONT_INVERTIR = Meteor.call('CombierteNumeroExpStr', M_INVERTIR.toFixed(9))
                    //log.info(" Valor de MONT_INVERTIR", MONT_INVERTIR, "= Meteor.call('CombierteNumeroExpStr'", M_INVERTIR.toFixed(9) )
                    CalTamAcum = parseFloat(CalTamAcum) + parseFloat(TamOrdeAbrt)
                    log.info("Valor de CalTamAcum", CalTamAcum+" = "+parseFloat(CalTamAcum)+" + "+parseFloat(TamOrdeAbrt),'Utilidades');
                    if ( parseFloat(MONT_INVERTIR) < parseFloat(CalTamAcum) ) {
                        //log.info("Valor de parseFloat(INVER) < parseFloat(TamOrdeAbrt): ", parseFloat(MONT_INVERTIR) , ' < ', parseFloat(TamOrdeAbrt) , ' || ', parseFloat(MONT_INVERTIR), ' < ', parseFloat(CalTamAcum))
                        resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MontRealIversionCal' : parseFloat(MR_INVER).toFixed(9).toString(), 'MejorPrecCal' : parseFloat(PrecOrdAbrt).toFixed(9), 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
                        //log.info("Valor de resultados", resultados)
                        break
                    }
                }
            }
        }else if ( MONEDA_SALDO == TipoCambio[0].moneda_base ) {
            var OrdenesAbiertasCompra = OrdenesAbiertas.bid
            var ValTipoCambio = TipoCambio[0];
            //log.info("Valor de OrdenesAbiertasCompra", OrdenesAbiertasCompra)
            if ( OrdenesAbiertasCompra === undefined ) {
                TiposDeCambios.update(  { tipo_cambio : TIPO_CAMBIO },
                                                        { $set:{     
                                                                    activo : "N",
                                                                    estado : "I" }
                                                        }
                                                    )

                TempTiposCambioXMoneda.remove({ tipo_cambio : TIPO_CAMBIO  })

                resultados = { 'MontIversionCal' : 0, 'MontRealIversionCal' : 0, 'MejorPrecCal' : 0, 'comision_hbtc' : 0, 'comision_mercado' : 0 }

            }else{  
                for ( COAC = 0, TOAC = OrdenesAbiertasCompra.length; COAC <= TOAC; COAC++ ) {
                    var OrdAbrt = OrdenesAbiertasCompra[COAC]
                    //log.info("Valor de OrdAbrt", OrdAbrt)
                    var PrecOrdAbrt = OrdAbrt.price.toString()
                    var TamOrdeAbrt = OrdAbrt.size.toString()
                    var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
                    var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
                    CalTamAcum = parseFloat(CalTamAcum) + parseFloat(TamOrdeAbrt)
                    //log.info("Valor de CalTamAcum", CalTamAcum," = ",parseFloat(CalTamAcum)," + ",parseFloat(TamOrdeAbrt) )
                    if ( parseFloat(INVER) < parseFloat(CalTamAcum) ) {
                        //log.info("Valor de parseFloat(INVER) < parseFloat(TamOrdeAbrt): ", parseFloat(INVER) , ' < ', parseFloat(TamOrdeAbrt) , ' || ', parseFloat(INVER), ' < ', parseFloat(CalTamAcum))
                        resultados = { 'MontIversionCal' : INVER, 'MontRealIversionCal' : INVER, 'MejorPrecCal' : parseFloat(PrecOrdAbrt).toFixed(9), 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
                        //log.info("Valor de resultados", resultados)
                        break
                    }
                }
            }
        }
        

        return resultados;
    },
	
});