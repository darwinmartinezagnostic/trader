import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

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
        console.log('############################################');
        console.log('  ********* INICIANDO EJECUCIÓN ********* ');
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        console.log('############################################');
        console.log(' ');
    },

    'FinEjecucion':function(){
        fecha = moment (new Date());
        Meteor.call("GuardarLogEjecucionTrader", 'FIN DE EJECUCIÓN');
        console.log(' ');
        console.log('############################################');
        console.log('    ********* FIN DE EJECUCIÓN ********* ');
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['        ']+[fecha._d]);
        console.log('############################################');
    },

    'CombierteNumeroExpStr':function(VALOR){
        if(VALOR.toString().indexOf('e') != -1){
            if(VALOR.toString().indexOf('.') != -1){
                NuevoVALOR = VALOR.toString().replace(".", "");
                console.log("Valor de VALOR", VALOR);
                console.log("Valor de NuevoVALOR", NuevoVALOR);
                separador = "-"
                V_separador = NuevoVALOR.toString().split(separador);
                console.log("Valor de V_separador", V_separador);
                valor_exp = parseFloat(V_separador[1]);
                ValorAnalizar = parseFloat(NuevoVALOR).toFixed(valor_exp);
                console.log("Valor de ValorAnalizar", ValorAnalizar);



                ver = VALOR.toString()
                console.log("Valor de ver", ver);

            }else{
                separador = "-"
                V_separador = VALOR.toString().split(separador);
                //console.log("Valor de V_separador", V_separador);
                valor_exp = parseFloat(V_separador[1]);
                ValorAnalizar = VALOR.toFixed(valor_exp);
                //console.log("Valor de ValorAnalizar", ValorAnalizar);
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
                //console.log("Valor de NuevoVALOR", NuevoVALOR);
                separador = "-"
                V_separador = NuevoVALOR.toString().split(separador);
                //console.log("Valor de V_separador", V_separador);
                valor_exp = parseFloat(V_separador[1]);
                ValorAnalizar = parseFloat(NuevoVALOR).toFixed(valor_exp);
                //console.log("Valor de ValorAnalizar", ValorAnalizar);
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
        //console.log("Valor de res", res);
        var Salida = parseFloat(res);
        return Salida;
    },

    'RecuperacionAutonoma':function(){

        console.log('############################################');
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



        console.log('############################################');
    },

    'EquivalenteDolar':function(MONEDA, S_MOND, TIPO_ACCION){
        console.log(" EquivalenteDolar: Val recib: ", "MONEDA: -",  MONEDA, "- ,S_MOND: -", S_MOND, "- ,TIPO_ACCION: ", TIPO_ACCION)        
        var SALDO = parseFloat(S_MOND);
        if ( SALDO === 0 ) {
            var EquivalenciaActual = 0;
        }else{

            if ( MONEDA == 'USD' ) {
                var EquivalenciaActual = parseFloat(SALDO);
            }else{
                var ExisteTipoCambio = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{ _id : 0, tipo_cambio : 1}).count();
                console.log(" Valor de ExisteTipoCambio", ExisteTipoCambio)
                if ( ExisteTipoCambio !== 0 ) {
                    var DIRECTO = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                    console.log(" Valor de DIRECTO", DIRECTO)
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
                                console.log(" Estoy en 6")
                                var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                    { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                ]);
                                var ValorPromedio = ValorObtenido[0]
                                console.log(" Valor de ValorPromedio 1: ", ValorPromedio)

                                if ( ValorPromedio === undefined ) {
                                    console.log(" Estoy en 7")
                                    var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    console.log(" Valor de  ValorPromedio 2: ", ValorPromedio)
                                }

                            break;
                            case 2:
                                console.log(" Estoy en 8")
                                var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                console.log(" Valor de ValorPromedio 3: ", ValorPromedio)
                            break;
                        }

                        var TipoCambioValido = ValorPromedio.Existe
                        console.log(" Valor de TipoCambioValido: ", TipoCambioValido)
                        if ( TipoCambioValido !== 1 ) {
                            var EquivalenciaActual = 0;
                            TiposDeCambios.update({ tipo_cambio: TipoCambioObtenido }, {    
                                                        $set: {
                                                                habilitado: 0
                                                            }
                                                        }, {"multi" : true,"upsert" : true});
                        }else{
                            if ( MONEDA === MB ) {
                                console.log(" Estoy en ( MONEDA === MB )")
                                var EquivalenciaActual = ( parseFloat(SaldoMinTC) * parseFloat(ValorPromedio.Promedio) ) ;
                                console.log(" Calculando: ", EquivalenciaActual, "= (" , parseFloat(SaldoMinTC) , "*" ,parseFloat(ValorPromedio.Promedio) )
                            }else if ( MONEDA === MC ) {
                                console.log(" Estoy en ( MONEDA === MC )")
                                var EquivalenciaActual = ( parseFloat(SaldoMinTC) / parseFloat(ValorPromedio.Promedio) );
                                console.log(" Calculando: ", EquivalenciaActual, "= (" , parseFloat(SaldoMinTC), "/" , parseFloat(ValorPromedio.Promedio))
                            }
                        }
                    }else {
                        var TiposCambiosMoneda = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA } ]},{}).fetch();
                        
                        for ( CTCDM = 0, TTCDM = TiposCambiosMoneda.length; CTCDM < TTCDM; CTCDM++ ) {
                            var V_TiposCambiosMoneda = TiposCambiosMoneda[CTCDM];
                            var MCotizacion = V_TiposCambiosMoneda.moneda_cotizacion;
                            var MBase = V_TiposCambiosMoneda.moneda_base;
                            var TipoCambioObtenido = V_TiposCambiosMoneda.tipo_cambio;

                            var MinInv=V_TiposCambiosMoneda.valor_incremento;
                            var TMinInv = MinInv.toString().trim().length
                            var SaldoMinTC= SALDO.toString().trim().substr(0, TMinInv)


                            var ExistMCUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                            var ExistMBUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                            
                            if ( ExistMCUSD !== 0 ) {
                                if ( MBase === MONEDA ) {
                                    MonedaEquivalenteAux = MCotizacion
                                }else if ( MCotizacion === MONEDA ) {
                                    MonedaEquivalenteAux = MBase
                                }
                                break
                            }else if ( ExistMBUSD !== 0 ) {
                                if ( MBase === MONEDA ) {
                                    MonedaEquivalenteAux = MCotizacion
                                }else if ( MCotizacion === MONEDA ) {
                                    MonedaEquivalenteAux = MBase
                                }
                                break
                            }

                        }

                        switch (TIPO_ACCION){
                            case 1:
                                console.log(" Estoy en 12")
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

                                if ( MONEDA === MBase ) {
                                    console.log(" Estoy en  MONEDA === MBase ")
                                    var SaldEquivActualAux = ( parseFloat(SALDO) * parseFloat(ValorPromedioObtenido.Promedio) ) ;
                                    console.log(" Valor de SaldEquivActualAux",  SaldEquivActualAux, "= (", parseFloat(SALDO)  ,"*", parseFloat(ValorPromedioObtenido.Promedio) )
                                }else if ( MONEDA === MCotizacion ) {
                                    console.log(" Estoy en  MONEDA === MCotizacion ")
                                    var SaldEquivActualAux = ( parseFloat(SALDO)  / parseFloat(ValorPromedioObtenido.Promedio) );
                                    console.log(" Valor de SaldEquivActualAux",  SaldEquivActualAux, "= (", parseFloat(SALDO)  ,"/", parseFloat(ValorPromedioObtenido.Promedio) )
                                }
                            break;
                        }

                        var TCUSDAux = TiposDeCambios.findOne({ $and: [{ $or: [ { moneda_base : MonedaEquivalenteAux}, { moneda_cotizacion : MonedaEquivalenteAux }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] })
                        var TipoCambioObtenidoAux = TCUSDAux.tipo_cambio
                        var MBaseAux = TCUSDAux.moneda_base
                        var MCotiAux = TCUSDAux.moneda_cotizacion
                        var MinInvAux=TCUSDAux.valor_incremento;

                        var ValorPromedioObtenidoAux = Meteor.call('LibroDeOrdenes', TipoCambioObtenidoAux);
                        console.log(" Valor de TipoCambioObtenidoAux: ", TipoCambioObtenidoAux)

                        var TMinInvAux = MinInvAux.toString().trim().length
                        console.log(" Valor de MinInvAux: ", MinInvAux)
                        var SaldoMinTCAux= SaldEquivActualAux.toString().trim().substr(0, TMinInv)
                        console.log(" Valor de SaldEquivActualAux: ", SaldEquivActualAux)
                        console.log(" Valor de SaldoMinTCAux: ", SaldoMinTCAux)

                        console.log(" Valor de MonedaEquivalenteAux: ", MonedaEquivalenteAux)

                        if ( MonedaEquivalenteAux === MBaseAux ) {
                            console.log(" Estoy en  MONEDA === MBase ")
                            var EquivalenciaActual = ( parseFloat(SaldEquivActualAux) * parseFloat(ValorPromedioObtenidoAux.Promedio) ) ;
                            console.log(" Calculando: ", EquivalenciaActual.toString(), "= (" ,parseFloat(SaldEquivActualAux), "*" ,ValorPromedioObtenidoAux.Promedio )
                        }else if ( MonedaEquivalenteAux === MCotiAux ) {
                            console.log(" Estoy en  MONEDA === MCotizacion ")
                            var EquivalenciaActual = ( parseFloat(SaldEquivActualAux) / parseFloat(ValorPromedioObtenidoAux.Promedio) );
                            console.log(" Calculando: ", EquivalenciaActual.toString(), "= (" ,parseFloat(SaldEquivActualAux), "/" ,ValorPromedioObtenidoAux.Promedio )
                            var prueba = Meteor.call('CombierteNumeroExpStr', EquivalenciaActual) 
                            console.log("Valor de prueba: ", prueba) 
                        }                   
                    }
                }else if ( ExisteTipoCambio === 0 ){
                    var EquivalenciaActual = 0;
                }
            }
        }

        EquivAct = parseFloat(EquivalenciaActual.toFixed(4))
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

    'CalcularIversion' : function ( TIPO_CAMBIO, MONEDA_SALDO, INVER){
        const CONSTANTES = Meteor.call("Constantes");
        const URL_TIKT = CONSTANTES.ticker+TIPO_CAMBIO;        
        const precio =  Meteor.call("ConexionGet", URL_TIKT);
        var TipoCambio =  TiposDeCambios.aggregate([{ $match: { 'tipo_cambio' : TIPO_CAMBIO }}]);
        
        if ( MONEDA_SALDO == TipoCambio[0].moneda_cotizacion ) {
            var ValTipoCambio = TipoCambio[0];
            var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
            var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
            var MR_INVER = parseFloat(INVER).toFixed(9) - comision_hbtc.toFixed(9) - comision_merc.toFixed(9)
            var PrecioPromedio = ((parseFloat(precio.bid) + parseFloat(precio.ask))/2).toFixed(9).toString()
            var MejorPrecProm = PrecioPromedio
            var MejorPrecask = precio.ask.toString()
            var MejorPrecbid = precio.bid.toString()
            var M_INVERTIRPrecioPromedio = MR_INVER / parseFloat(MejorPrecProm)
            var M_INVERTIRMejorPrecask = MR_INVER / parseFloat(MejorPrecask)
            var M_INVERTIRMejorPrecbid = MR_INVER / parseFloat(MejorPrecbid)
            var MejorPrec = MejorPrecask
            var M_INVERTIR = MR_INVER / parseFloat(MejorPrec)
            var MONT_INVERTIR = Meteor.call('CombierteNumeroExpStr', M_INVERTIR.toFixed(9))
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
            return resultados;
        }else if ( MONEDA_SALDO == TipoCambio[0].moneda_base ) {
            var ValTipoCambio = TipoCambio[0];
            var MONT_INVERTIR = INVER
            var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
            var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
            var MejorPrec = precio.bid.toString()
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
            return resultados;
        }
    },
	
});