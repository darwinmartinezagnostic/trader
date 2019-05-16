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
        var SALDO = parseFloat(S_MOND);

        if ( SALDO === 0 ) {
            var EquivalenciaActual = 0;
        }else{            
           //console.log("Valores recibidos: MONEDA", [MONEDA]+[' SALDO:']+[SALDO]);

            if ( MONEDA == 'USD' ) {
                var EquivalenciaActual = parseFloat(SALDO);
            }else{
                //console.log("EquivalenteDolar: Valores recibidos - MONEDA:", [MONEDA]+[' ,SALDO:']+[SALDO]);

                var ExisteTipoCambio = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{ _id : 0, tipo_cambio : 1}).count();
                //console.log("Valor de ExisteTipoCambio", ExisteTipoCambio);

                if ( ExisteTipoCambio !== 0 ) {

                    var DIRECTO = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                    //console.log("Valor de DIRECTO", DIRECTO);   

                    if ( DIRECTO !== 0 ) {
                        var precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MONEDA}, { moneda_cotizacion : MONEDA }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                        //console.log("Valor de precioAux", precioAux);
                        var TipoCambioObtenido = precioAux[0].tipo_cambio;
                        //console.log("Valor de TipoCambio", TipoCambioObtenido);
                        //console.log("Valor de TipoCambio", TipoCambio);
                        //
                        switch (TIPO_ACCION){
                            case 1:
                                //console.log("Estoy en el case 1")
                                var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                    { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                ]);
                                var ValorPromedio = ValorObtenido[0]

                                //console.log("Valor de ValorPromedio", ValorPromedio);

                                if ( ValorPromedio === undefined ) {
                                    //console.log("Estoy en el  if ( ValorPromedio === undefined ) ");
                                    //console.log("Valor de TipoCambioObtenido", TipoCambioObtenido);
                                    var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    //console.log("Valor de ValorPromedio", ValorPromedio);
                                    /*if ( ValorPromedio === undefined ) {
                                        console.log("Entre en el segundo if ( ValorPromedio === undefined ) {  ");
                                        var ValorPromedio = { 'Promedio' : 0, 'Existe' : 0 };
                                        console.log("Valor de ValorPromedio: ", ValorPromedio);
                                        //var ValorPromedioObtenido = ValorPromedio;
                                        //var ValorPromedioObtenido = { 'Promedio' : 0, 'Existe' : 0 };
                                        //console.log("Valor de ValorPromedioObtenido: ", ValorPromedioObtenido);
                                    }*/
                                }
                            break;
                            case 2:
                                //console.log("Estoy en el case 2");
                                var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                //console.log("Valor de ValorPromedio", ValorPromedio);
                            break;
                        }


                        var TipoCambioValido = ValorPromedio.Existe

                        if ( TipoCambioValido !== 1 ) {
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
                            //console.log("Valor de ValorPromedio", ValorPromedio.Promedio);
                            var EquivalenciaActual = (parseFloat(SALDO) * ValorPromedio.Promedio ) / 1;
                            //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                        }
                    }else {
                        //console.log("ESTOY EN EL ELSE DE if ( DIRECTO !== 0 ");

                            //precioAux = TiposDeCambios.find({moneda_base:MONEDA,moneda_cotizacion:'BTC'}).fetch();
                        var TiposCambiosMoneda = TiposDeCambios.find({ $or: [ { moneda_base : MONEDA }, { moneda_cotizacion : MONEDA }]},{}).fetch();
                        //console.log("Valor de TiposCambiosMoneda", TiposCambiosMoneda);

                        for ( CTCDM = 0, TTCDM = TiposCambiosMoneda.length; CTCDM < TTCDM; CTCDM++ ) {
                            V_TiposCambiosMoneda = TiposCambiosMoneda[CTCDM];
                            //console.log("Valor de V_TiposCambiosMoneda", V_TiposCambiosMoneda);
                            var MBase = V_TiposCambiosMoneda.moneda_base;
                            var MCotizacion = V_TiposCambiosMoneda.moneda_cotizacion;
                            var TipoCambioObtenido = V_TiposCambiosMoneda.tipo_cambio;
                            //console.log("Valor de TipoCambioObtenido", TipoCambioObtenido);
                            /*
                            console.log("Valor de MBase", MBase);
                            console.log("Valor de MCotizacion", MCotizacion);
                            console.log("Valor de MONEDA", MONEDA);
                            */

                            //var ValorPromedioObtenido = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);

                            switch (TIPO_ACCION){
                                case 1:
                                    var ValorObtenido = EquivalenciasDol.aggregate([    { $match: { tipo_cambio : TipoCambioObtenido }}, 
                                                                                        { $project: { _id : 0, Promedio : 1 , Existe : 1 } }
                                                                                    ]);
                                    var ValorPromedioObtenido = ValorObtenido[0]

                                if ( ValorPromedio === undefined ) {
                                    var ValorPromedio = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    /*if ( ValorPromedio === undefined) {
                                        console.log("Entre en el segundo if ( ValorPromedio === undefined ) { B ");
                                        var ValorPromedio = { 'Promedio' : 0, 'Existe' : 0 };
                                        console.log("Valor de ValorPromedio: ", ValorPromedio);
                                        //var ValorPromedioObtenido = ValorPromedio;
                                        var ValorPromedioObtenido = { 'Promedio' : 0, 'Existe' : 0 };
                                        console.log("Valor de ValorPromedioObtenido: ", ValorPromedioObtenido);
                                    }*/
                                }
                                    break;
                                case 2:
                                    var ValorPromedioObtenido = Meteor.call('LibroDeOrdenes', TipoCambioObtenido);
                                    break;
                            }

                            var TipoCambioValido = ValorPromedioObtenido.Existe

                            if ( TipoCambioValido === 0 ) {
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
                                //console.log("Valor de ValorPromedioObtenido", ValorPromedioObtenido.Promedio);
                                var EquivalenciaSaldoMonedaAuxi = (parseFloat(SALDO)  * parseFloat(ValorPromedioObtenido.Promedio) ) / 1;
                                //console.log("Valor de ValorPromedioObtenido", ValorPromedioObtenido);
                                //console.log("Valor de EquivalenciaSaldoMonedaAuxi", EquivalenciaSaldoMonedaAuxi);

                                var ExistMBUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                                var ExistMCUSD = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).count();
                                var ExistMBBTC = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase}, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).count();
                                var ExistMCBTC = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion}, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).count();

                                if ( ExistMBUSD !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    //console.log("ESTOY EN 1");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = parseFloat( Meteor.call('LibroDeOrdenes', TipoCambio) );
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                }else if ( ExistMCUSD !== 0 ) {
                                    //console.log("ESTOY EN 2");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MCotizacion }, { moneda_cotizacion : MCotizacion }]}, { $or: [ { moneda_base : 'USD' }, { moneda_cotizacion : 'USD' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    //console.log("Valor de ValorPromedioFinal", ValorPromedioFinal.Promedio);
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                }else if ( ExistMBBTC !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    //console.log("ESTOY EN 3");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                }else if ( ExistMCBTC !== 0 && ValorPromedioObtenido.Promedio === 1 ) {
                                    //console.log("ESTOY EN 4");
                                    precioAux = TiposDeCambios.find({ $and: [{ $or: [ { moneda_base : MBase }, { moneda_cotizacion : MBase }]}, { $or: [ { moneda_base : 'BTC' }, { moneda_cotizacion : 'BTC' }]} ] }).fetch();
                                    //console.log("Valor de precioAux", precioAux);
                                    var TipoCambio = precioAux[0].tipo_cambio;
                                    var ValorPromedioFinal = Meteor.call('LibroDeOrdenes', TipoCambio);
                                    var EquivalenciaActual = ( EquivalenciaSaldoMonedaAuxi * ValorPromedioFinal.Promedio ) / 1;
                                    //console.log("Valor de EquivalenciaActual", EquivalenciaActual);
                                    
                                }
                            }
                        }
                    }
                }else{
                    var EquivalenciaActual = 0;
                }
            }
        }

        //console.log("Valor de EquivalenciaActual ", EquivalenciaActual);

        return EquivalenciaActual.toFixed(8);
    },

    'EquivalenteDolarMinCompra':function(){

        var T_CAMBIOS = TiposDeCambios.find({ }).fetch();
        //console.log("Valor de T_CAMBIOS", T_CAMBIOS);
        for (CT_CAMBIOS = 0, tamanio_T_CAMBIOS = T_CAMBIOS.length; CT_CAMBIOS < tamanio_T_CAMBIOS; CT_CAMBIOS++) {
            V_T_CAMBIOS = T_CAMBIOS[CT_CAMBIOS];
            //console.log("Valor de T_CAMBIOS", V_T_CAMBIOS);
            var EquivDolarMinComp = Meteor.call('EquivalenteDolar', V_T_CAMBIOS.moneda_apli_comision, V_T_CAMBIOS.min_compra, 1);
            //console.log("Valor de EquivDolarMinComp", EquivDolarMinComp);

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
        //const precio = { bid : '2', ask : '2'}
        var TipoCambio =  TiposDeCambios.aggregate([{ $match: { 'tipo_cambio' : TIPO_CAMBIO }}]);

        if ( MONEDA_SALDO == TipoCambio[0].moneda_cotizacion ) {
            var ValTipoCambio = TipoCambio[0];
            var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
            var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
            var MR_INVER = parseFloat(INVER).toFixed(9) - comision_hbtc.toFixed(9) - comision_merc.toFixed(9)
            var M_INVERTIR = MR_INVER / parseFloat(precio.bid)
            //var M_INVERTIR = MR_INVER / parseFloat(precio.ask)
            var MONT_INVERTIR = Meteor.call('CombierteNumeroExpStr', M_INVERTIR.toFixed(9))
            var MejorPrec = ((parseFloat(precio.bid) + parseFloat(precio.ask))/2).toFixed(9).toString()
            //var MejorPrec = precio.ask.toString()
            resultados = { 'MontIversionCal' : MONT_INVERTIR, 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc, 'comision_mercado' : comision_merc }
            /*
            console.log("Valor de comision_hbtc", comision_hbtc)
            console.log("Valor de comision_merc", comision_merc)
            console.log("Valor de MR_INVER", MR_INVER)
            console.log("Valor de M_INVERTIR", M_INVERTIR)
            console.log("Valor de MONT_INVERTIR", MONT_INVERTIR)
            */
            return resultados;
        }else if ( MONEDA_SALDO == TipoCambio[0].moneda_base ) {
            var ValTipoCambio = TipoCambio[0];
            var MONT_INVERTIR = INVER
            var MejorPrec = precio.ask.toString()
            var comision_hbtc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_hitbtc
            var comision_merc = parseFloat(INVER).toFixed(9) * ValTipoCambio.comision_mercado
            //var MejorPrec = precio.bid.toString()
            resultados = { 'MontIversionCal' : MONT_INVERTIR.toFixed(9), 'MejorPrecCal' : MejorPrec, 'comision_hbtc' : comision_hbtc.toFixed(9), 'comision_mercado' : comision_merc.toFixed(9) }
            return resultados;
        }
    },
	
});