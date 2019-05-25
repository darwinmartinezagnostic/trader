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
        //Meteor.call('sleep', 1);
        console.log(" EquivalenteDolar: Val recib: ", "MONEDA: -",  MONEDA, "- ,S_MOND: -", S_MOND, "- ,TIPO_ACCION: ", TIPO_ACCION)
        
        var SALDO = parseFloat(S_MOND);
        console.log(" Valor de DATO: ", SALDO)
        if ( SALDO === 0 ) {
            console.log(" Estoy en 1")
            var EquivalenciaActual = 0;
            console.log(" Valor de EquivalenciaActual 1:", EquivalenciaActual)
        }else{

            if ( MONEDA == 'USD' ) {
                console.log(" Estoy en 2")
                var EquivalenciaActual = parseFloat(SALDO);
                console.log(" Valor de EquivalenciaActual 2:", EquivalenciaActual)
            }else{
                console.log(" Estoy en 3")
                var ExisteTipoCambio = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{ _id : 0, tipo_cambio : 1}).count();
                console.log("Valor de ExisteTipoCambio", ExisteTipoCambio);

                if ( ExisteTipoCambio !== 0 ) {
                    console.log(" Estoy en 4")
                    var DIRECTO = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                    console.log(" Valor de DIRECTO:", DIRECTO)
                    if ( DIRECTO !== 0 ) {
                        console.log(" Estoy en 5")
                        var precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                        var TipoCambioObtenido = precioAux[0].tipo_cambio;
                        console.log(" Valor de TipoCambioObtenido: ", TipoCambioObtenido)
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
                            console.log(" Estoy en 9")
                            console.log('############################################');
                            Meteor.call("GuardarLogEjecucionTrader", ['   TIPO DE CAMBIO NO SE TOMARÁ EN CUENTA: ']+[TipoCambioObtenido]);
                            console.log('############################################');
                            var EquivalenciaActual = 0;
                            console.log(" Valor de EquivalenciaActual 3: ", EquivalenciaActual)
                            TiposDeCambios.update({ tipo_cambio: TipoCambioObtenido }, {    
                                                        $set: {
                                                                habilitado: 0
                                                            }
                                                        }, {"multi" : true,"upsert" : true});
                        }else{
                            console.log(" Estoy en 10")
                            var EquivalenciaActual = (parseFloat(SALDO) * ValorPromedio.Promedio ) / 1;
                            console.log(" Valor de EquivalenciaActual 4: ", EquivalenciaActual)
                        }
                    }else {
                        console.log("ESTOY EN EL ELSE DE if ( DIRECTO !== 0 ");

                        var TiposCambiosMoneda = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{}).fetch();
                        console.log(" Estoy en TiposCambiosMoneda: ", TiposCambiosMoneda)
                        for ( CTCDM = 0, TTCDM = TiposCambiosMoneda.length; CTCDM < TTCDM; CTCDM++ ) {
                            console.log(" Estoy en 11")
                            V_TiposCambiosMoneda = TiposCambiosMoneda[CTCDM];
                            var MBase = V_TiposCambiosMoneda.moneda_base;
                            console.log(" Valor de MBase: ", MBase)
                            var MCotizacion = V_TiposCambiosMoneda.moneda_cotizacion;
                            console.log(" Valor de MCotizacion: ", MCotizacion)
                            var TipoCambioObtenido = V_TiposCambiosMoneda.tipo_cambio;
                            console.log(" Valor de TipoCambioObtenido: ", TipoCambioObtenido)

                            switch (TIPO_ACCION){
                                case 1:
                                    console.log(" Estoy en 12")
                                    var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                        { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                    ]);
                                    var ValorPromedioObtenido = ValorObtenido[0]
                                    console.log(" Valor de ValorPromedioObtenido 1: ", ValorPromedioObtenido)

                                    if ( ValorPromedio === undefined ) {
                                        console.log(" Estoy en 13")
                                        var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                        console.log(" Valor de ValorPromedio 4: ", ValorPromedio)
                                    }
                                break;
                                case 2:
                                    console.log(" Estoy en 14")
                                    var ValorPromedioObtenido = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    console.log(" Valor de ValorPromedioObtenido 2: ", ValorPromedioObtenido)
                                break;
                            }

                            var TipoCambioValido = ValorPromedioObtenido.Existe
                            console.log(" Valor de TipoCambioValido: ", TipoCambioValido)

                            if ( TipoCambioValido === 0 ) {
                                console.log(" Estoy en 15")
                                console.log('############################################');
                                Meteor.call("GuardarLogEjecucionTrader", ['   TIPO DE CAMBIO NO SE TOMARÁ EN CUENTA: ']+[TipoCambioObtenido]);
                                console.log('############################################');
                                var EquivalenciaActual = 0;

                                TiposDeCambios.update({ tipo_cambio: TipoCambioObtenido }, {    
                                                        $set: {
                                                                habilitado: 0
                                                            }
                                                        }, {"multi" : true,"upsert" : true});
                            }else{
                                console.log(" Estoy en 16")
                                var EquivalenciaSaldoMonedaAuxi = (parseFloat(SALDO)  * parseFloat(ValorPromedioObtenido.Promedio) ) / 1;
                                console.log(" Valor de EquivalenciaSaldoMonedaAuxi: ", EquivalenciaSaldoMonedaAuxi)
                                var ExistMBUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                                console.log(" Valor de ExistMBUSD: ", ExistMBUSD)
                                var ExistMCUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                                console.log(" Valor de ExistMCUSD: ", ExistMCUSD)
                                var ExistMBBTC = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).count();
                                console.log(" Valor de ExistMBBTC: ", ExistMBBTC)
                                var ExistMCBTC = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).count();
                                console.log(" Valor de ExistMCBTC: ", ExistMCBTC)

                                if ( ExistMBUSD !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    console.log(" Estoy en 17")
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    console.log(" Valor de TipoCambio: ", TipoCambio)
                                    var ValorPromedioFinal = parseFloat( Meteor.call('LibroDeOrdenes', TipoCambio) );
                                    console.log(" Valor de ValorPromedioFinal: ", ValorPromedioFinal)
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal ) / 1;
                                    console.log(" Valor de EquivalenciaActual 5: ", EquivalenciaActual)
                                }else if ( ExistMCUSD !== 0 ) {
                                    console.log(" Estoy e 18")
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion }, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    console.log(" Valor de TipoCambio: ", TipoCambio)
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    console.log(" Valor de ValorPromedioFinal: ", ValorPromedioFinal)
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    console.log(" Valor de EquivalenciaActual 6: ", EquivalenciaActual)
                                }else if ( ExistMBBTC !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    console.log(" Estoy en 19")
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).fetch();
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    console.log(" Valor de TipoCambio: ", TipoCambio)
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    console.log(" Valor de ValorPromedioFinal: ", ValorPromedioFinal)
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    console.log(" Valor de EquivalenciaActual 7: ", EquivalenciaActual)
                                }else if ( ExistMCBTC !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    console.log(" Estoy en 20")
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).fetch();
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    console.log(" Valor de TipoCambio: ", TipoCambio)
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    console.log(" Valor de ValorPromedioFinal: ", ValorPromedioFinal)
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    console.log(" Valor de EquivalenciaActual 8: ", EquivalenciaActual)
                                }
                            }
                        }
                    }
                }else if ( ExisteTipoCambio === 0 ){
                    console.log(" Estoy en 21")
                    var EquivalenciaActual = 0;
                    console.log(" Valor de EquivalenciaActual 9:", EquivalenciaActual)
                }
            }
        }
        console.log(" Valor de EquivalenciaActual 10:", EquivalenciaActual)

        return EquivalenciaActual.toFixed(8);
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
            var MejorPrec = PrecioPromedio
            var M_INVERTIR = MR_INVER / parseFloat(PrecioPromedio)
            var MONT_INVERTIR = Meteor.call('CombierteNumeroExpStr', M_INVERTIR.toFixed(9))
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
            return resultados;
        }else if ( MONEDA_SALDO == TipoCambio[0].moneda_base ) {
            var ValTipoCambio = TipoCambio[0];
            var MONT_INVERTIR = INVER
            var PrecioPromedio = ((parseFloat(precio.bid) + parseFloat(precio.ask))/2).toFixed(9).toString()
            var MejorPrec = PrecioPromedio
            var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
            var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
            //var MejorPrec = precio.bid.toString()
            resultados = { 'MontIversionCal' : MONT_INVERTIR.toFixed(9), 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc.toFixed(9), 'comision_mercado' : comision_merc.toFixed(9) }
            return resultados;
        }
    },
	
});