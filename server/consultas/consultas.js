import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();
//var CONSTANTES = Meteor.call("Constantes");

Meteor.methods({

    'ConsultarTransaciones':function(TRANSACCIONES){
        var CONSTANTES = Meteor.call("Constantes");
        //para verificar las transaccion solo por monedas especifica se realiza la contruccion parcial de la URL anexando la abreviatura de la monedas ejemp "BTC"
        //const url_transaccion_parcial= ['currency=']+['<abreviatura moneda>']+['&sort=ASC&by=timestamp&limit=']+[cant_transacciones];

        //para verificar una transaccion en especifica se anexar al final de la contrccion de la URL ID de la transaccion ejemp "f672d164-6c6d-4bbd-9ba3-401692b3b404"
        // var Url_Transaccion = [transacciones]+'/'+[<varible de entrada = D de la transaccion>];
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ' Devuelve los datos Historicos de Transacciones realizadas en la cuenta');
        console.log(' ');
        var url_transaccion_parcial=['sort=ASC&by=timestamp&limit=']+[TRANSACCIONES];
        var url_transaccion_completa=[CONSTANTES.transacciones]+'?'+[url_transaccion_parcial];
        console.log(' Valor de URL transacciones:', url_transaccion_completa);

        var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
        //var v_transaccion=(transaccion.data); 
        var v_transaccion=transaccion

        //console.log(v_transaccion);

        for (k = 0, len = v_transaccion.length; k < len; k++) {
            console.log('############################################');
            transaccion = v_transaccion[k];
            Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[transaccion.id]);
            Meteor.call("GuardarLogEjecucionTrader", [' INDICE: ']+[transaccion.index]);
            Meteor.call("GuardarLogEjecucionTrader", [' TIPO: ']+[transaccion.type]);
            Meteor.call("GuardarLogEjecucionTrader", [' STATUS: ']+[transaccion.status]);
            Meteor.call("GuardarLogEjecucionTrader", [' MONEDA: ']+[transaccion.currency]);
            Meteor.call("GuardarLogEjecucionTrader", [' MONTO: ']+[transaccion.amount]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA CREACION: ']+[transaccion.createdAt]);
            Meteor.call("GuardarLogEjecucionTrader", [' FECHA DE CAMBIO: ']+[transaccion.updatedAt]);
            Meteor.call("GuardarLogEjecucionTrader", [' HASH: ']+[transaccion.hash]);
            console.log('############################################');
            console.log(' ');
        };
    },

    'ConsultaOrdenesAbiertas':function(TIPO_CAMBIO){
        var CONSTANTES = Meteor.call("Constantes");
        var url_orden = [CONSTANTES.ordenes]+['?symbol=']+[TIPO_CAMBIO]
        var OrdeneAbiertas = Meteor.call("ConexionGet",url_orden);
        var OrdAbi = OrdeneAbiertas[0]

        if ( OrdAbi === undefined ) {
            console.log('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", "     --- No hay ordenes Abiertas ---");
            console.log('--------------------------------------------');
            var Estado_Orden ='Fallido'
        }
        else{
            console.log("Ordenes Activas: ", OrdeneAbiertas)
            var Estado_Orden = OrdAbi.status
            console.log('Valor de Estado_Orden', Estado_Orden)
        }
        return Estado_Orden
    },

    'ConsultarSaldoTodasMonedas':function(){
        var MonedasSaldoActual = Monedas.find( { $or : [{"saldo.tradeo.activo" : { $gt : 0 }},{ "saldo.cuenta.activo" : { $gt : 0 } }]}).fetch()

        for ( cmsa = 0, tmsa = MonedasSaldoActual.length; cmsa < tmsa; cmsa++ ) {
            var v_BMonedasSaldoActual = MonedasSaldoActual[cmsa];
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Saldo disponible');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['  ********* ']+[' MONEDA: ']+[v_BMonedasSaldoActual.moneda]+[' ********* ']);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO: ']+[v_BMonedasSaldoActual.saldo.tradeo.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.tradeo.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO TRADEO RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO EN CUENTA: ']+[v_BMonedasSaldoActual.saldo.cuenta.activo]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA EQUIVALENTE $: ']+[v_BMonedasSaldoActual.saldo.cuenta.equivalencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['     SALDO CUENTA RESERVA: ']+[v_BMonedasSaldoActual.saldo.tradeo.reserva]);
            console.log('############################################');
            console.log(' ');
        }
    },

    'ConsultarHistoricoOrdenes':function(){
        var CONSTANTES = Meteor.call("Constantes");
        var url_transaccion_completa=[CONSTANTES.HistTradeo]+['?sort=DESC&by=timestamp&limit=100']
        var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);

        if ( transaccion !== undefined) {

            for (k = 0, len = transaccion.length; k < len; k++) {
                trans = transaccion[k];
                var IdTran = Meteor.call('CalculaId', 2);
                var IdTransaccionActual = Meteor.call("CompletaConCero", parseFloat(IdTran), 32);            
                var url_trans_orden=[CONSTANTES.HistOrdenes]+['/']+[trans.orderId]+['/trades']
                var ComisionTansacion = Meteor.call("ConexionGet", url_trans_orden);
                
                var ValorTP = TiposDeCambios.aggregate([  { $match : { tipo_cambio : trans.symbol }} ])
                
                var V_IdHitBTC = trans.id
                var V_Id_Transhitbtc = trans.orderId
                var clientOrderId = trans.clientOrderId
                var LOTE = 0
                var TipoCambio = trans.symbol
                var MON_B = ValorTP[0].moneda_base
                var MON_C = ValorTP[0].moneda_cotizacion
                var status = trans.status
                var V_FormaOperacion = trans.side        
                var V_SaldoInversion = trans.quantity;
                var precio = trans.price
                var V_SaldoAcumulado = trans.cumQuantity
                var V_Comision = ComisionTansacion[0].fee
                var Equiv_V_Comision = 0
                var FechaCreacion = trans.createdAt
                var FechaActualizacion = trans.createdAt
                

                var FechaTradeoAnteriorMC = trans.updatedAt
                var SaldoTradeoAnteriorMC = 0
                var FechaTradeoActualMB = trans.createdAt
                var SaldoTradeoActualMB = 0
                var V_EquivalenciaTradeoAnteriorMC = 0
                var V_EquivalenciaTradeoActualMB = 0
                var Eqv_V_InverSaldAnt = 0
                var V_EquivSaldoMonedaAdquirida = 0
                var V_Ganancia = 0

                
                if ( V_FormaOperacion == 'sell') {
                    GananciaPerdida.insert({    
                                                Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                Id_Transhitbtc : V_Id_Transhitbtc,
                                                                ID_LocalAnt : clientOrderId,
                                                                ID_LocalAct : IdTransaccionActual,
                                                                Id_Lote: LOTE,
                                                                Tipo : V_FormaOperacion,
                                                                TipoCambio : TipoCambio,
                                                                Precio : precio,
                                                                Status : status,
                                                                FechaCreacion : FechaCreacion,
                                                                FechaActualizacion : FechaActualizacion},
                                                Comision : {    Valor : V_Comision,
                                                                Equivalencia : Equiv_V_Comision},
                                                Moneda : {  emision : { moneda : MON_B,
                                                                        Fecha : FechaTradeoActualMB,
                                                                        Saldo : SaldoTradeoActualMB,
                                                                        Equivalente : V_EquivalenciaTradeoActualMB},
                                                            Adquirida : { moneda : MON_C,
                                                                        Fecha : FechaTradeoAnteriorMC,
                                                                        Saldo : SaldoTradeoAnteriorMC,
                                                                        Equivalente : V_EquivalenciaTradeoAnteriorMC}},
                                                Inversion : { SaldoInversion  : V_SaldoInversion,
                                                                Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                                    Final : V_EquivSaldoMonedaAdquirida}},
                                                Ganancia : { Valor :  V_Ganancia}
                                            });
                }else if ( V_FormaOperacion == 'buy') {
                    GananciaPerdida.insert({    
                                                Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                Id_Transhitbtc : V_Id_Transhitbtc,
                                                                ID_LocalAnt : clientOrderId,
                                                                ID_LocalAct : IdTransaccionActual,
                                                                Id_Lote: LOTE,
                                                                Tipo : V_FormaOperacion,
                                                                TipoCambio : TipoCambio,
                                                                Precio : precio,
                                                                Status : status,
                                                                FechaCreacion : FechaCreacion,
                                                                FechaActualizacion : FechaActualizacion},
                                                Comision : {    Valor : V_Comision,
                                                                Equivalencia : Equiv_V_Comision},
                                                Moneda : {  emision : { moneda : MON_C,
                                                                        Fecha : FechaTradeoAnteriorMC,
                                                                        Saldo : SaldoTradeoAnteriorMC,
                                                                        Equivalente : V_EquivalenciaTradeoAnteriorMC},
                                                            Adquirida : { moneda : MON_B,
                                                                        Fecha : FechaTradeoActualMB,
                                                                        Saldo : SaldoTradeoActualMB,
                                                                        Equivalente : V_EquivalenciaTradeoActualMB}},
                                                Inversion : { SaldoInversion  : V_SaldoInversion,
                                                                Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                                    Final : V_EquivSaldoMonedaAdquirida}},
                                                Ganancia : { Valor :  V_Ganancia}
                                            });
                }
            };
        }

        /*
        var fechaActual = new Date();
        var AnioAct = fechaActual.getFullYear();


        var url_transaccion_TrasIni=[CONSTANTES.HistTradeo]+['?sort=ASC&by=id&limit=1']
        var TrasIni = Meteor.call("ConexionGet", url_transaccion_TrasIni);
        var FechaTrasIniRecib = TrasIni[0].timestamp;
        var FTrans = new Date(FechaTrasIniRecib);
        var ANIO_INICIO = FTrans.getFullYear();
        //var AnioInicio = parseFloat(ANIO_INICIO);
        var AnioInicio = parseFloat(2019);

        while ( AnioInicio <=  parseFloat(AnioAct) ){
            console.log('############################################');
            console.log("         Año a Recuperar:", AnioInicio);
            console.log('############################################'); 
            var MES = 1;
            while ( MES < 13 ){
                V_MES = Meteor.call('CompletaConCero', MES, 2);
                console.log("            MES:", V_MES);

                var date = new Date(AnioInicio,MES);
                var primerDia = new Date(date.getFullYear(), date.getMonth(), 1)
                var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                var PD = Meteor.call('CompletaConCero', primerDia.getDate(), 2);
                var UD = Meteor.call('CompletaConCero', ultimoDia.getDate(), 2);var FechaInicial = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ PD ]+['T00%3A00%3A00']
                var UltimoDiaAnio = [AnioInicio.toString()]+['-']+[ V_MES ]+['-']+[ UD ]+['T23%3A59%3A59']                

                console.log("Fecha Inicial: ", FechaInicial, " Fecha Final: ", UltimoDiaAnio);                
                console.log(' ');

                var url_transaccion_completa=[CONSTANTES.HistTradeo]+['?sort=ASC']+['&by=timestamp&from=']+[FechaInicial]+['&by=timestamp&from=']+[UltimoDiaAnio]
                var transaccion = Meteor.call("ConexionGet", url_transaccion_completa);
                
                if ( transaccion !== undefined) {

                    for (k = 0, len = transaccion.length; k < len; k++) {
                        trans = transaccion[k];
                        var IdTran = Meteor.call('CalculaId', 2);
                        var IdTransaccionActual = Meteor.call("CompletaConCero", parseFloat(IdTran), 32);            
                        var url_trans_orden=[CONSTANTES.HistOrdenes]+['/']+[trans.orderId]+['/trades']
                        var ComisionTansacion = Meteor.call("ConexionGet", url_trans_orden);
                        
                        var ValorTP = TiposDeCambios.aggregate([  { $match : { tipo_cambio : trans.symbol }} ])
                        
                        var V_IdHitBTC = trans.id
                        var V_Id_Transhitbtc = trans.orderId
                        var clientOrderId = trans.clientOrderId
                        var LOTE = 0
                        var TipoCambio = trans.symbol
                        var MON_B = ValorTP[0].moneda_base
                        var MON_C = ValorTP[0].moneda_cotizacion
                        var status = trans.status
                        var V_FormaOperacion = trans.side        
                        var V_SaldoInversion = trans.quantity;
                        var precio = trans.price
                        var V_SaldoAcumulado = trans.cumQuantity
                        var V_Comision = ComisionTansacion[0].fee
                        var Equiv_V_Comision = 0
                        var FechaCreacion = trans.createdAt
                        var FechaActualizacion = trans.createdAt
                        

                        var FechaTradeoAnteriorMC = trans.updatedAt
                        var SaldoTradeoAnteriorMC = 0
                        var FechaTradeoActualMB = trans.createdAt
                        var SaldoTradeoActualMB = 0
                        var V_EquivalenciaTradeoAnteriorMC = 0
                        var V_EquivalenciaTradeoActualMB = 0
                        var Eqv_V_InverSaldAnt = 0
                        var V_EquivSaldoMonedaAdquirida = 0
                        var V_Ganancia = 0

                        
                        if ( V_FormaOperacion == 'sell') {
                            GananciaPerdida.insert({    
                                                        Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                        Id_Transhitbtc : V_Id_Transhitbtc,
                                                                        ID_LocalAnt : clientOrderId,
                                                                        ID_LocalAct : IdTransaccionActual,
                                                                        Id_Lote: LOTE,
                                                                        Tipo : V_FormaOperacion,
                                                                        TipoCambio : TipoCambio,
                                                                        Precio : precio,
                                                                        Status : status,
                                                                        FechaCreacion : FechaCreacion,
                                                                        FechaActualizacion : FechaActualizacion},
                                                        Comision : {    Valor : V_Comision,
                                                                        Equivalencia : Equiv_V_Comision},
                                                        Moneda : {  emision : { moneda : MON_B,
                                                                                Fecha : FechaTradeoActualMB,
                                                                                Saldo : SaldoTradeoActualMB,
                                                                                Equivalente : V_EquivalenciaTradeoActualMB},
                                                                    Adquirida : { moneda : MON_C,
                                                                                Fecha : FechaTradeoAnteriorMC,
                                                                                Saldo : SaldoTradeoAnteriorMC,
                                                                                Equivalente : V_EquivalenciaTradeoAnteriorMC}},
                                                        Inversion : { SaldoInversion  : V_SaldoInversion,
                                                                        Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                                            Final : V_EquivSaldoMonedaAdquirida}},
                                                        Ganancia : { Valor :  V_Ganancia}
                                                    });
                        }else if ( V_FormaOperacion == 'buy') {
                            GananciaPerdida.insert({    
                                                        Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                                        Id_Transhitbtc : V_Id_Transhitbtc,
                                                                        ID_LocalAnt : clientOrderId,
                                                                        ID_LocalAct : IdTransaccionActual,
                                                                        Id_Lote: LOTE,
                                                                        Tipo : V_FormaOperacion,
                                                                        TipoCambio : TipoCambio,
                                                                        Precio : precio,
                                                                        Status : status,
                                                                        FechaCreacion : FechaCreacion,
                                                                        FechaActualizacion : FechaActualizacion},
                                                        Comision : {    Valor : V_Comision,
                                                                        Equivalencia : Equiv_V_Comision},
                                                        Moneda : {  emision : { moneda : MON_C,
                                                                                Fecha : FechaTradeoAnteriorMC,
                                                                                Saldo : SaldoTradeoAnteriorMC,
                                                                                Equivalente : V_EquivalenciaTradeoAnteriorMC},
                                                                    Adquirida : { moneda : MON_B,
                                                                                Fecha : FechaTradeoActualMB,
                                                                                Saldo : SaldoTradeoActualMB,
                                                                                Equivalente : V_EquivalenciaTradeoActualMB}},
                                                        Inversion : { SaldoInversion  : V_SaldoInversion,
                                                                        Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                                            Final : V_EquivSaldoMonedaAdquirida}},
                                                        Ganancia : { Valor :  V_Ganancia}
                                                    });
                        }
                    };
                }
                MES += 1
            }
            AnioInicio += 1
        }
        /**/
        console.log('############################################');
    },

    'VerificarHistoricoEstadoOrden':function(ORDEN){
        var CONSTANTES = Meteor.call("Constantes");
        Meteor.call('sleep',1);
        //Maximo TiempoEspera = 6000
        TiempoEspera = 6000;
        // AGREGAR A URL LIMITE DE ORDENES A OBTENER
        Url_VerificarHistOrden = [CONSTANTES.HistOrdenes]+['?clientOrderId=']+[ORDEN];
        v_Estado_Orden = Meteor.call('ConexionGet', Url_VerificarHistOrden );
        //var EstadoOrden=(v_Estado_Orden.data[0]);
        var EstadoOrden=(v_Estado_Orden[0]);
        Url_HistOrdenIdTrdades = [CONSTANTES.HistOrdenes]+['/']+[EstadoOrden.id]+['/trades'];
        V_Desc_Orden = Meteor.call('ConexionGet', Url_HistOrdenIdTrdades );
        //DescOrden = V_Desc_Orden.data[0];
        DescOrden = V_Desc_Orden[0];
        
        Estado = { 'Id': EstadoOrden.id, 'IdOrdenCliente': EstadoOrden.clientOrderId, 'TipoCambio': EstadoOrden.symbol, 'TipoOperacion': EstadoOrden.side, 'Estado':EstadoOrden.status, 'FormaDeOperacion': EstadoOrden.type,'CantidadRecibida': DescOrden.quantity, 'Precio': DescOrden.price, 'Comision': DescOrden.fee, 'Fecha': DescOrden.timestamp }

        return Estado;
    },

    'ValidarEstadoOrden': function( VAL_ORDEN){
        var CONSTANTES = Meteor.call("Constantes");
        /////////////////////////////////////////////////////

        T_id = VAL_ORDEN.id
        T_clientOrderId = VAL_ORDEN.clientOrderId
        T_symbol = VAL_ORDEN.symbol
        T_side = VAL_ORDEN.side
        T_status = VAL_ORDEN.status
        T_type = VAL_ORDEN.type
        T_timeInForce = VAL_ORDEN.timeInForce
        T_quantity = VAL_ORDEN.quantity
        T_price = VAL_ORDEN.price
        T_cumQuantity = VAL_ORDEN.cumQuantity
        T_createdAt = VAL_ORDEN.createdAt
        T_updatedAt = VAL_ORDEN.updatedAt
        T_postOnly = VAL_ORDEN.postOnly

        /////////////////////////////////////////////////////
        //var url_tranOA=[CONSTANTES.ordenes]+['?clientOrderId=']+[ORDEN]+['?wait=300']
        //var Url_TransTP=[CONSTANTES.HistOrdenes]+['?symbol=']+[TIPO_CAMBIO]+['&limit=3']
        //var Url_TransID=[CONSTANTES.HistOrdenes]+['/']+[ID]+['/trades']

        var url_tranOA=[CONSTANTES.ordenes]+['?clientOrderId=']+[T_clientOrderId]+['?wait=300']
        var Url_TransTP=[CONSTANTES.HistOrdenes]+['?symbol=']+[T_symbol]+['&limit=3']
        var Url_TransID=[CONSTANTES.HistOrdenes]+['/']+[T_id]+['/trades']
        /*
        console.log('Valor de url_tranOA', url_tranOA)
        console.log('Valor de Url_TransTP', Url_TransTP)
        console.log('Valor de Url_TransID', Url_TransID)
        */

        const TrnsOA = Meteor.call("ConexionGet", url_tranOA)   
        var transOA = TrnsOA[0];
        //console.log('Valor de transOA', transOA)
        const TrnsTP = Meteor.call("ConexionGet", Url_TransTP)
        //console.log('Valor de TrnsTP', TrnsTP)
        const TrnsID = Meteor.call("ConexionGet", Url_TransID) 
        var transID = TrnsID[0];
        //console.log('Valor de transID', transID)
        if ( transID === undefined ) {
            HistIdOrden = 0
            //console.log('Valor de HistIdOrden', HistIdOrden)
        }else{
            HistIdOrden = 1
            //console.log('Valor de HistIdOrden', HistIdOrden)
        }
        if ( transOA === undefined ) {
            //console.log(' Estoy en if ( transOA === undefined )')
            for ( CTrnsOA = 0, TTrnsOA = TrnsTP.length; CTrnsOA < TTrnsOA; CTrnsOA++ ) {
                var HTrnsTP = TrnsTP[CTrnsOA];
                IdOdenClient = HTrnsTP.clientOrderId
                //if ( IdOdenClient !== ORDEN ) {
                if ( IdOdenClient !== T_clientOrderId ) {
                    HistIdOrdenExiste = 0
                }else{
                    //StatusOrden = HTrnsTP.status
                    NuValOrden = HTrnsTP
                    HistIdOrdenExiste = 1
                    break                    
                }
            }
            //console.log('Valor de HistIdOrdenExiste', HistIdOrdenExiste)

            if ( HistIdOrden === 1 && HistIdOrdenExiste === 1 ) {
                //console.log(' Estoy en if ( HistIdOrden === 1 && HistIdOrdenExiste === 1 )')
                var Estado_Orden = NuValOrden
            }else{
                //console.log(' Estoy en else de if ( HistIdOrden === 1 && HistIdOrdenExiste === 1 )')
                var Estado_Orden = { id: T_id, clientOrderId: T_clientOrderId, symbol: T_symbol, side: T_side, status: 'Fallido', type: T_type, timeInForce: T_timeInForce, quantity: T_quantity, price: T_price, cumQuantity: T_cumQuantity, createdAt: T_createdAt,updatedAt: T_updatedAt, postOnly: T_postOnly }
            }
        }else{
            var Estado_Orden = transOA
        }
        //console.log('Valor de Estado_Orden', Estado_Orden)
        return Estado_Orden
    },
    
});