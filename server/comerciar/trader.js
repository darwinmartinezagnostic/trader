import { Meteor } from 'meteor/meteor';
moment().tz('America/Caracas').format();

//**************************************************

Meteor.methods({

    'ListaMonedas':function(){
        var CONSTANTES = Meteor.call("Constantes");
        console.log('############################################');
        try{
            var moneda = Meteor.call("ConexionGet", CONSTANTES.monedas);
            //var mons = (moneda.data);
            var mons = moneda
        }
        catch(error){
            Meteor.call("GuardarLogEjecucionTrader", ' Error: No se puedo consultar el api de hitbtc');
            Meteor.call('RecuperacionAutonoma');
            Meteor.call('ValidaError', error, 1);
        }

        for ( a = 0, len = mons.length ; a < len; a++) {
            var mon = mons[a];

            if (Monedas.find({ moneda : mon.id }).count() !== 0) {
                try{
                    Monedas.update({ moneda : mon.id },{$set:{ nombre_moneda : mon.fullName, activo : "S" }}, {"multi" : true,"upsert" : true});
                }
                catch(error){
                    Meteor.call("GuardarLogEjecucionTrader", ' Error: los datos no pudieron ser actualizados');
                    Meteor.call('ValidaError', error, 1);
                }
            }
            else {
                Monedas.insert({ moneda : mon.id, nombre_moneda : mon.fullName, activo : "S", min_transferencia : 0.0000000001 });
                console.log('--------------------------------------------');
                Meteor.call("GuardarLogEjecucionTrader", ' **** Detectada Nueva Moneda en HITBTC ****');
                console.log('--------------------------------------------');
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", ['    NOMENCLATURA: ']+[mon.id]);
                Meteor.call("GuardarLogEjecucionTrader", ['    NOMBRE DE MONEDA: ']+[mon.fullName]);
                console.log(' ');
                Meteor.call("GuardarLogEjecucionTrader", ['           Datos Insertados']);
                console.log(' ');
            }
        };


        console.log('############################################');
    },

    'ActualizaSaldoTodasMonedas':function(){

        var CONSTANTES = Meteor.call("Constantes");
        var fecha = new Date();
        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", '           VERIFICANDO SALDOS');
        console.log('############################################');
        console.log('--------------------------------------------');


        //var v_blc_tradeo = Meteor.call("ConexionGet", CONSTANTES.blc_tradeo);
        //var BlcMonedasTradeo=(v_blc_tradeo.data);
        //var BlcMonedasTradeo=v_blc_tradeo
        var BlcMonedasTradeo=Meteor.call("ConexionGet", CONSTANTES.blc_tradeo);
        var BlcCuenta =Meteor.call("ConexionGet", CONSTANTES.blc_cuenta);
        //var v_blc_cuenta = Meteor.call("ConexionGet", CONSTANTES.blc_cuenta);
        //var BlcCuenta = (v_blc_cuenta.data);
        //console.log('Valor de v_blc_tradeo: ', BlcMonedasTradeo);
        //console.log('Valor de v_blc_cuenta: ', BlcCuenta);

        //var BlcCuenta = v_blc_cuenta
        var c_vect_BlcCuent = 0;
        var c_vect_BlcTrad = 0;


        for ( cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++ ) {

            var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
            var MonedaSaldoTradear = v_BlcMonedasTradeo.currency;
            //console.log('Valor de MonedaSaldoTradear: ', MonedaSaldoTradear);
            var SaldoMonedaInvertidoTradear = Number(v_BlcMonedasTradeo.available);
            

            try{
                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoTradear }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
            }
            catch (error){
                Meteor.call("ValidaError", error, 2)
            };

            var v_sald_moneda = v_moneda_saldo[0];



            try{
                if ( v_sald_moneda !== undefined ){
                    //var V_EquivalenciaST = Meteor.call('EquivalenteDolar', MonedaSaldoTradear, parseFloat(SaldoMonedaInvertidoTradear), 2);
                    Monedas.update({
                                        moneda: v_sald_moneda.moneda
                                    }, 
                                    {
                                        $set:{  "saldo.tradeo.activo": Number(v_BlcMonedasTradeo.available),
                                                //"saldo.tradeo.equivalencia": Number(V_EquivalenciaST),
                                                "saldo.tradeo.reserva": Number(v_BlcMonedasTradeo.reserved)
                                        }
                                    },
                                    {"multi" : true,"upsert" : true}
                    );
                }
            }
            catch (error){
                Meteor.call("ValidaError", error, 2)
            };
        }
        
        for ( cbct = 0, tam_bct = BlcCuenta.length; cbct < tam_bct; cbct++ ) {
            var v_BlcCuenta = BlcCuenta[cbct];
            var MonedaSaldoCuenta = v_BlcCuenta.currency;
            var SaldoMonedaGuardadoEnMonederoCuenta = Number(v_BlcCuenta.available);

            try{
                var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
            }
            catch (error){
                Meteor.call("ValidaError", error, 2)
            };

            var v_sald_moneda = v_moneda_saldo[0];

            try{
                if ( v_sald_moneda !== undefined ){
                    //var V_EquivalenciaSMC = Meteor.call('EquivalenteDolar', MonedaSaldoCuenta, parseFloat(SaldoMonedaGuardadoEnMonederoCuenta), 2);
                    Monedas.update({
                                        _id: v_sald_moneda._id,
                                        moneda: v_sald_moneda.moneda
                                    }, 
                                    {
                                        $set: { "saldo.cuenta.activo": Number(v_BlcCuenta.available),
                                                //"saldo.cuenta.equivalencia": Number(V_EquivalenciaSMC),
                                                "saldo.cuenta.reserva": Number(v_BlcCuenta.reserved)
                                        }
                                    }, 
                                    {"multi" : true,"upsert" : true}
                    );
                }
            }
            catch (error){
                Meteor.call("ValidaError", error, 2)
            };                 
        }
    },

    'ValidaSaldoEquivalenteActual':function(){
        var fecha = new Date();
        var MonedasSaldoVerificar = Monedas.find( { $or : [{"saldo.tradeo.activo" : { $gt : 0 }},{ "saldo.cuenta.activo" : { $gt : 0 } }]}).fetch();
        //console.log("Valor de MonedasSaldoVerificar", MonedasSaldoVerificar);

        for ( CMONEDAS = 0, T_CMONEDAS = MonedasSaldoVerificar.length; CMONEDAS < T_CMONEDAS; CMONEDAS++ ) {

            V_MonedasSaldoVerificar = MonedasSaldoVerificar[CMONEDAS];
            //console.log("Valor de V_MonedasSaldoVerificar", V_MonedasSaldoVerificar);
            Id = V_MonedasSaldoVerificar._id;
            MonedaSaldo = V_MonedasSaldoVerificar.moneda;
            SaldoTradeoActivo = parseFloat(V_MonedasSaldoVerificar.saldo.tradeo.activo);
            SaldoCuentaActivo = parseFloat(V_MonedasSaldoVerificar.saldo.cuenta.activo);
            /*
            console.log("Valor de MonedaSaldo", MonedaSaldo);
            console.log("Valor de SaldoTradeoActivo", SaldoTradeoActivo);
            console.log("Valor de SaldoCuentaActivo", SaldoCuentaActivo);
            */
            if ( SaldoTradeoActivo !== undefined ) {
                var EquivalenciaSaldoTradeo = Meteor.call('EquivalenteDolar', MonedaSaldo, SaldoTradeoActivo, 2 );
                //console.log("Valor de EquivalenciaSaldoTradeo", EquivalenciaSaldoTradeo);
                Monedas.update({
                                _id: Id,
                                moneda: MonedaSaldo
                                }, {
                                    $set: {                                             
                                            "saldo.tradeo.fecha": fecha, 
                                            "saldo.tradeo.equivalencia": Number(EquivalenciaSaldoTradeo),
                                        }
                                }, {"multi" : true,"upsert" : true});
            }

            if ( SaldoCuentaActivo !== undefined ) {
                var EquivalenciaSaldoCuenta = Meteor.call('EquivalenteDolar', MonedaSaldo, SaldoCuentaActivo, 2 );
                //console.log("Valor de EquivalenciaSaldoCuenta", EquivalenciaSaldoCuenta);
                Monedas.update({
                                _id: Id,
                                moneda: MonedaSaldo
                                }, {
                                    $set: { 
                                            "saldo.cuenta.fecha": fecha,
                                            "saldo.cuenta.equivalencia": Number(EquivalenciaSaldoCuenta),
                                        }
                                }, {"multi" : true,"upsert" : true});
            }
        }

        console.log('############################################');
    },

    'ActualizaSaldoActual':function(MONEDA){
        var CONSTANTES = Meteor.call("Constantes");
        /*
        var v_blc_tradeo = Meteor.call("ConexionGet", CONSTANTES.blc_tradeo);
        //var BlcMonedasTradeo=(v_blc_tradeo.data);
        var BlcMonedasTradeo=v_blc_tradeo
        var v_blc_cuenta = Meteor.call("ConexionGet", CONSTANTES.blc_cuenta);
        //var BlcCuenta = (v_blc_cuenta.data);  
        */

        var BlcMonedasTradeo=Meteor.call("ConexionGet", CONSTANTES.blc_tradeo);
        var BlcCuenta =Meteor.call("ConexionGet", CONSTANTES.blc_cuenta);    
        var c_vect_BlcCuent = 0;
        var c_vect_BlcTrad = 0;


        console.log('############################################');
        Meteor.call("GuardarLogEjecucionTrader", ['      VERIFICANDO SALDO MONEDA: ']+[MONEDA] );
        console.log('############################################');
        console.log('--------------------------------------------');
        for ( cbmt = 0, tam_bmt = BlcMonedasTradeo.length; cbmt < tam_bmt; cbmt++ ) {
            var v_BlcMonedasTradeo = BlcMonedasTradeo[cbmt];
            var MonedaSaldoTradear = v_BlcMonedasTradeo.currency;
            if ( MonedaSaldoTradear == MONEDA ) {
                console.log('Valor de MonedaSaldoTradear: ', MonedaSaldoTradear);

                var SaldoMonedaInvertidoTradear = Number(v_BlcMonedasTradeo.available);

                try{
                    var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoTradear }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2)
                };
                //console.log('Valor de v_moneda_saldo: ', v_moneda_saldo);
                var v_sald_moneda = v_moneda_saldo[0];
                    if ( v_sald_moneda !== undefined ){
                        var V_EquivalenciaST = Meteor.call('EquivalenteDolar', MonedaSaldoTradear, parseFloat(SaldoMonedaInvertidoTradear), 2);
                        console.log('Valor de V_EquivalenciaSMC: ', V_EquivalenciaST);
                        //console.log('Valor de v_sald_moneda.moneda: ', v_sald_moneda.moneda);
                        Monedas.update({
                                        moneda: v_sald_moneda.moneda
                                        }, {
                                            $set: { "saldo.tradeo.activo": Number(v_BlcMonedasTradeo.available),
                                                    "saldo.tradeo.equivalencia": Number(V_EquivalenciaST),
                                                    "saldo.tradeo.reserva": Number(v_BlcMonedasTradeo.reserved)
                                        }
                        }, {"multi" : true,"upsert" : true});
                    }
            }
        }
        
        for ( cbct = 0, tam_bct = BlcCuenta.length; cbct < tam_bct; cbct++ ) {
            var v_BlcCuenta = BlcCuenta[cbct];
            var MonedaSaldoCuenta = v_BlcCuenta.currency;
            if ( MonedaSaldoCuenta == MONEDA ) {
                console.log("Valor de MonedaSaldoCuenta", MonedaSaldoCuenta)
                var SaldoMonedaGuardadoEnMonederoCuenta = Number(v_BlcCuenta.available);

                try{
                    var v_moneda_saldo = Monedas.find({ moneda : MonedaSaldoCuenta }, {_id : 1, moneda : 1, nombre_moneda : 1}).fetch();
                }
                catch (error){
                    Meteor.call("ValidaError", error, 2)
                };
                //console.log('Valor de v_moneda_saldo: ', v_moneda_saldo);

                var v_sald_moneda = v_moneda_saldo[0];
                //console.log("Valor de v_sald_moneda", v_sald_moneda);
                console.log( "Valor de v_sald_moneda.moneda", v_sald_moneda.moneda);
                var V_EquivalenciaSMC = Meteor.call('EquivalenteDolar', MonedaSaldoCuenta, parseFloat(SaldoMonedaGuardadoEnMonederoCuenta), 2);
                console.log('Valor de V_EquivalenciaSMC: ', V_EquivalenciaSMC);
                console.log('Valor de v_sald_moneda.moneda: ', v_sald_moneda.moneda);
                    if ( v_sald_moneda !== undefined ){
                        Monedas.update({
                                        moneda: v_sald_moneda.moneda
                                        }, {
                                            $set: { "saldo.cuenta.activo": Number(v_BlcCuenta.available),
                                                    //"saldo.cuenta.equivalencia": Number(V_EquivalenciaSMC),
                                                    "saldo.cuenta.equivalencia": 1,
                                                    "saldo.cuenta.reserva": Number(v_BlcCuenta.reserved)
                                            }
                        }, {"multi" : true,"upsert" : true});
                    }
            }
        }

        var MonedasSaldoActual = Monedas.find( { moneda : MONEDA }).fetch();


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

    'VerificarTransferencias':function(TRANSACCION){
        var CONSTANTES = Meteor.call("Constantes");
        var Url_transaccion = CONSTANTES.transacciones+"/"+TRANSACCION
        var EstadoTransaccion = Meteor.call("ConexionGet", Url_transaccion);

        var fecha = moment (new Date());

        //if ( EstadoTransaccion.statusCode === 200 ) {
            //var V_EstadoTransaccion = EstadoTransaccion.data;
            //console.log("Valor de V_EstadoTransaccion: ", V_EstadoTransaccion)
            var FECHA = fecha._d
            var IdTransferencia = V_EstadoTransaccion.id;
            var Indice = V_EstadoTransaccion.index;
            var TipoTransferencia = V_EstadoTransaccion.type;
            var Estado = V_EstadoTransaccion.status;
            var MONEDA = V_EstadoTransaccion.currency;
            var MONTO = V_EstadoTransaccion.amount;
            var fechaCreacionSol = V_EstadoTransaccion.createdAt;
            var fechaProcesamientoSol = V_EstadoTransaccion.updatedAt;


            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '            Status Tranferencia');
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", ['********* ']+[' MONEDA: ']+[MONEDA]+[' *********']);
            Meteor.call("GuardarLogEjecucionTrader", ['    FECHA: ']+[FECHA]);
            Meteor.call("GuardarLogEjecucionTrader", ['    ID: ']+[IdTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    TIPO TRANSFERENCIA: ']+[TipoTransferencia]);
            Meteor.call("GuardarLogEjecucionTrader", ['    MONTO: ']+[MONTO]);
            switch (Estado){
                case "success":
                    var STATUS = "EXITOSO"
                break;
                case "pending":
                    var STATUS = "PENDIENTE"
                break;
                case "failed":
                    var STATUS = "FALLIDO"
                break;
            }
            Meteor.call("GuardarLogEjecucionTrader", ['    STATUS: ']+[STATUS]);
            console.log('############################################');
            console.log(' ');


            var TransExist = HistoralTransferencias.find( { id : IdTransferencia }).fetch().length

            if ( TransExist > 0 ) {
                HistoralTransferencias.update({ id : IdTransferencia }, {$set: { estado: STATUS }}, {"multi" : true,"upsert" : true});
            }else{
                HistoralTransferencias.insert({ fecha : FECHA, id : IdTransferencia, indice : Indice, tipo_transferencia : TipoTransferencia, moneda : MONEDA, monto : MONTO, estado : STATUS, fecha_creacion_solicitud : fechaCreacionSol, fecha_ejecucion_solicitud : fechaProcesamientoSol })
            };

/*
        }else{
            Meteor.call('ValidaError', EstadoTransaccion.statusCode, 1);
        }
*/


        //v_EstadoTransaccion = EstadoTransaccion[0].status;



        return STATUS;
    },

    'ValidaMonedasTransfCuentaTRadeo':function(){

        var CantMonedasSaldoATransferir = Monedas.find( { "saldo.cuenta.activo" : { $gt : 0 } }).fetch().length
        var MonedasSaldoATransferir = Monedas.find( { "saldo.cuenta.activo" : { $gt : 0 } }).fetch()
        var ContAtCar = 0

        if ( CantMonedasSaldoATransferir > 0 ) {
            Meteor.call("GuardarLogEjecucionTrader", ' Estoy en el if MonedasSaldoATransferir');
            console.log("Valor de CantMonedasSaldoATransferir: ", CantMonedasSaldoATransferir);
            //console.log("Valor de MonedasSaldoATransferir: ", MonedasSaldoATransferir);
            for ( cmsat = 0, tmsat = CantMonedasSaldoATransferir; cmsat < tmsat; cmsat++ ) {
                //console.log("Estoy en el for");
                var v_MonedasSaldoATransferir = MonedasSaldoATransferir[cmsat];
                var MonedaRev = v_MonedasSaldoATransferir.moneda
                var SaldoActTransf = v_MonedasSaldoATransferir.saldo.cuenta.activo
                var SaldoAntTransf = SaldoActTransf
                var ValMinTranf = v_MonedasSaldoATransferir.min_transferencia

                if ( SaldoActTransf >= ValMinTranf ) {
                    console.log("Estoy en el if ( SaldoActTransf >= ValMinTranf )");
                    var Repeticiones = 1
                    do {
                        console.log("Estoy en el while( SaldoAntTransf === SaldoActTransf )");
                        console.log("Moneda:", MonedaRev)
                        console.log("Datos a enviar, MonedaRev:", MonedaRev ,"SaldoActTransf", SaldoActTransf, 'bankToExchange');



                        /////////////////////////// ARREGLAR ESTA PARTE //////////////////////////////////////////////////////
                        

                        var EstadoTransferencia = Meteor.call( 'Transferirfondos', MonedaRev, SaldoActTransf, 'bankToExchange');





                        ///////////////////////////////////////////////////////////////////////////////////////////////////////
                        Meteor.call("GuardarLogEjecucionTrader", [' Valor de EstadoTransferencia']+[EstadoTransferencia]);
                        if ( EstadoTransferencia[0] === 0 && EstadoTransferencia[2] === "PENDIENTE" ) {

                            while( VEstatus === "PENDIENTE" ){
                                var IdTransVer = EstadoTransferencia[1];
                                var VEstatus = Meteor.call( 'VerificarTransferencias', IdTransVer);
                                Meteor.call('sleep',5);
                            };

                            Meteor.call( 'ActualizaSaldoActual', MonedaRev);
                            break;

                        }else if ( EstadoTransferencia[0] === 0 && EstadoTransferencia[2] === "EXITOSO" ) {
                            Meteor.call( 'ActualizaSaldoActual', MonedaRev);
                            var RevMoneda = Monedas.find({ moneda : MonedaRev,}).fetch();
                            var SaldoActTransf = RevMoneda[0].saldo.cuenta.activo;
                            //console.log("Valor de RevMoneda", RevMoneda);
                            //console.log("Valor de SaldoActTransf", SaldoActTransf);
                            console.log('############################################');
                            //var ValMinTranf = RevMoneda[0].min_transferencia
                            if ( SaldoActTransf !== SaldoAntTransf) {
                                //console.log("Estoy en el if ( SaldoActTransf !== SaldoAntTransf)");
                                //console.log("Acá estoy 1");
                                /*console.log('############################################');
                                console.log('       Status Tranferencia', MonedaRev);
                                console.log('############################################');
                                console.log('             STATUS: ',"EXITOSO" );
                                console.log('############################################');*/
                                var NuevoValMinTransf = Meteor.call('ReemplazaNumeroACero', SaldoActTransf);
                                Meteor.call("GuardarLogEjecucionTrader", [' Valor de NuevoValMinTransf']+[NuevoValMinTransf]);
                                Monedas.update({ moneda : MonedaRev }, {$set: { min_transferencia: NuevoValMinTransf }}, {"multi" : true,"upsert" : true});
                                var ValMinTranf = NuevoValMinTransf
                                //HistoralTransferencias.update({ id : EstadoTransferencia[1] }, {$set: { estado: "Exitoso" }});
                                break;
                            }else{
                                //console.log("Estoy en el else de - if ( SaldoActTransf !== SaldoAntTransf)");
                                //console.log("Acá estoy 2")
                                /*console.log('############################################');
                                console.log('       Status Tranferencia', MonedaRev);
                                console.log('############################################');
                                console.log('             STATUS: ',"FALLIDO" );
                                console.log('############################################');*/
                                var ContAtCar = ContAtCar + 1
                                var ValorAnalizarSaldoActTransf = Meteor.call("CombierteNumeroExpStr", SaldoActTransf);
                                //console.log("Estoy en el else de - if ( SaldoActTransf !== SaldoAntTransf)");
                                //console.log("Valor de ValorAnalizarSaldoActTransf", ValorAnalizarSaldoActTransf)
                                var CantCaracSaldoActTransf = ValorAnalizarSaldoActTransf.toString().trim().length - ContAtCar;
                                //console.log("Valor de CantCaracSaldoActTransf", CantCaracSaldoActTransf)
                                var ValStrnSaldoActTransf = ValorAnalizarSaldoActTransf.toString().substr(0, CantCaracSaldoActTransf);
                                //console.log("Valor de ValStrnSaldoActTransf", ValStrnSaldoActTransf)
                                var ValFinSaldoActTransf = parseFloat(ValStrnSaldoActTransf);
                                var SaldoActTransf = ValFinSaldoActTransf;
                                //console.log("Valor de ValFinSaldoActTransf", ValFinSaldoActTransf)
                                //console.log("Valor de SaldoActTransf", SaldoActTransf)
                                var NuevoValMinTransf = Meteor.call('ReemplazaNumeroACero', SaldoActTransf);  
                                var ValMinTranf = NuevoValMinTransf
                                //console.log("Valor de NuevoValMinTransf", NuevoValMinTransf)
                                Monedas.update({ moneda : MonedaRev }, {$set: { min_transferencia: NuevoValMinTransf }}, {"multi" : true,"upsert" : true});                            
                                //HistoralTransferencias.update({ id : EstadoTransferencia[1] }, {$set: { estado: "Fallo" }});
                            }
                        }else if ( EstadoTransferencia[0] === 0 && EstadoTransferencia[2] === "FALLIDO" || EstadoTransferencia[0] === 1 ){
                            Meteor.call("GuardarLogEjecucionTrader", [' Estoy en el else de - if ( EstadoTransferencia[0] === 0 )']);
                            console.log('############################################');
                            Meteor.call("GuardarLogEjecucionTrader", ['       Status Tranferencia ']+[MonedaRev]);
                            console.log('############################################');
                            Meteor.call("GuardarLogEjecucionTrader", ['             STATUS: ']+['FALLIDO']);
                            console.log('############################################');
                            var ValorAnalizarSaldoActTransf = Meteor.call("CombierteNumeroExpStr", SaldoActTransf);
                            var CantCaracSaldoActTransf = ValorAnalizarSaldoActTransf.toString().trim().length;
                            var ValStrnSaldoActTransf = ValorAnalizarSaldoActTransf.toString().substr(0, CantCaracSaldoActTransf);
                            var ValFinSaldoActTransf = parseFloat(ValStrnSaldoActTransf);
                            var SaldoActTransf = ValFinSaldoActTransf;
                            var NuevoValMinTransf = Meteor.call('ReemplazaNumeroACero', SaldoActTransf);  
                            var ValMinTranf = NuevoValMinTransf
                            Monedas.update({ moneda : MonedaRev }, {$set: { min_transferencia: NuevoValMinTransf }}, {"multi" : true,"upsert" : true});
                            break
                        }
                    }while( Repeticiones < 1000 );

                }else{
                    console.log('############################################');
                    Meteor.call("GuardarLogEjecucionTrader", '   fondos son insuficientes para transferir');
                    console.log('############################################');
                }


            }

        }else{
            console.log('############################################');
            Meteor.call("GuardarLogEjecucionTrader", '  NO SE DETECTO SALDO PARA SER TRANSFERIDO ');
            console.log('############################################');
        }
    },

    'ListaTiposDeCambios':function(VALOR){
        var CONSTANTES = Meteor.call("Constantes");
        try{
            var traders = Meteor.call("ConexionGet", CONSTANTES.simbolos);
            //var mon_camb =(traders.data);
            var mon_camb =traders
            //console.log("Valor de traders: ", traders)
        }
        catch (error){
            Meteor.call("ValidaError", error, 1)
        };

        for (j = 0, tamanio_mon_camb = mon_camb.length; j < tamanio_mon_camb; j++) {

            var mon_c = mon_camb[j];

            var LTCTipoCambio = mon_c.id;
            var LTCMonedaBase = mon_c.baseCurrency;
            var LTCMonedaCotizacion = mon_c.quoteCurrency;
            var LTCMontoMinCompra = Number( mon_c.tickSize );
            var LTCValorIncremento = Number( mon_c.quantityIncrement );
            var LTCTamanioTicket = Number( mon_c.tickSize );
            var LTCComisionCasaCambio = Number( mon_c.takeLiquidityRate );
            var LTCComisionMercado = Number( mon_c.provideLiquidityRate );
            var LTCMonedaAplicacionComision = mon_c.feeCurrency;


            switch(VALOR){
                case 1:
                    // HACE UNA CONSULTA GENERAL DE LOS TIPO_CAMBIO EXISTENTES
                    console.log('############################################');
                    Meteor.call("GuardarLogEjecucionTrader", ' Tipos de Cambio que se están tradeando en HITBTC');
                    console.log(' ');
                    Meteor.call("GuardarLogEjecucionTrader", '    ********* ', LTCTipoCambio, '********* ');
                    console.log(' ');
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[LTCMonedaBase]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA DE COTIZACIÓN: ']+[LTCMonedaCotizacion]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     MONTO MIN DE COMPRA: ']+[LTCMontoMinCompra]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     VALOR DE INCREMENTO: ']+[LTCValorIncremento]);
                    console.log(' ');
                    console.log(' *******    VALORES DE COMISIONES    *******');
                    console.log(' ');
                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[LTCComisionCasaCambio]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[LTCComisionMercado]);
                    Meteor.call("GuardarLogEjecucionTrader", ['     APLICACION DE COMISION A MONEDA: ']+[LTCMonedaAplicacionComision]);
                break;
                case 2:
                    // ESTO ES PARA VERIFICAR LA TENDENCIA DE LOS TIPOS DE CAMBIO

                    if (TiposDeCambios.find({ tipo_cambio : mon_c.id }).count() !== 0) {
                        try{
                            TiposDeCambios.update({ tipo_cambio : LTCTipoCambio },{$set:{ tipo_cambio : LTCTipoCambio, moneda_base :  LTCMonedaBase, moneda_cotizacion : LTCMonedaCotizacion, activo : "S", habilitado : 1 , comision_hitbtc : LTCComisionCasaCambio, comision_mercado : LTCComisionMercado, min_compra : LTCMontoMinCompra, moneda_apli_comision : LTCMonedaAplicacionComision, valor_incremento : LTCValorIncremento, c_estado_p: 0, c_estado_a: 0  }}, {"multi" : true,"upsert" : true});
                        }
                        catch(error){
                            Meteor.call("GuardarLogEjecucionTrader", ' Error: los datos no pudieron ser actualizados');
                            Meteor.call('ValidaError', error, 1);
                        }
                    }
                    else {
                        TiposDeCambios.insert({tipo_cambio : LTCTipoCambio, moneda_base :  LTCMonedaBase, moneda_cotizacion : LTCMonedaCotizacion, activo : "S", habilitado : 1 , comision_hitbtc : LTCComisionCasaCambio, comision_mercado : LTCComisionMercado, min_compra : LTCMontoMinCompra, moneda_apli_comision : LTCMonedaAplicacionComision, valor_incremento : LTCValorIncremento, estado : "V" , c_estado_p: 0, c_estado_a: 0 });
                        console.log('--------------------------------------------');
                        Meteor.call("GuardarLogEjecucionTrader", ' ** Detectado nuevo Tipo de Cambio en HITBTC **');
                        console.log('--------------------------------------------');
                        console.log(' ');
                        Meteor.call("GuardarLogEjecucionTrader", '    ********* ', LTCTipoCambio, '********* ');
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA BASE: ']+[LTCMonedaBase]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONEDA DE COTIZACIÓN: ']+[LTCMonedaCotizacion]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     MONTO MIN DE COMPRA: ']+[LTCMontoMinCompra]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     VALOR DE INCREMENTO: ']+[LTCValorIncremento]);
                        console.log(' ');
                        console.log(' *******    VALORES DE COMISIONES    *******');
                        Meteor.call("GuardarLogEjecucionTrader", ['     COMISION HITBTC: ']+[LTCComisionCasaCambio]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     COMISION DE MERCADO: ']+[LTCComisionMercado]);
                        Meteor.call("GuardarLogEjecucionTrader", ['     APLICACION DE COMISION A MONEDA: ']+[LTCMonedaAplicacionComision]);
                    }
                break;
                default:
                    Meteor.call("GuardarLogEjecucionTrader", ' Valor de tipo consulta no definida ');
            }
        };
    },

    'LibroDeOrdenes':function(TIPO_CAMBIO){
        var CONSTANTES = Meteor.call("Constantes");
        fecha = moment (new Date());
        //console.log('############################################');
        //console.log(' Devuelve los datos reales de los valores compra y venta en negociación - (Libro de Ordenes)');
        //console.log(' Tipo de Cambio recibido:, ', TIPO_CAMBIO);
        var url_compras_ventas = [CONSTANTES.publico]+['ticker']+'/'+[TIPO_CAMBIO];
        //console.log(' url_compras_ventas:, ', url_compras_ventas);


        var compras_ventas = Meteor.call("ConexionGet", url_compras_ventas);
        //console.log("Valor de compras_ventas", compras_ventas);


        if ( compras_ventas !== undefined ) {
            //var v_compras_ventas = (compras_ventas.data);
            var v_compras_ventas = compras_ventas
            var ValorOferta = v_compras_ventas.ask;
            var ValorDemanda = v_compras_ventas.bid;

            console.log("Valor de ValorOferta", ValorOferta);
            console.log("Valor de ValorDemanda", ValorDemanda);

            if ( ValorOferta === null || ValorDemanda === null ) {
                Meteor.call("GuardarLogEjecucionTrader", "Entre por if ( ValorOferta === null || ValorDemanda === null ");
                var ValFinPromedio = 0;
                var Existencia = 0;
            }else{
                //var sumatoria = parseFloat(v_compras_ventas.ask) + parseFloat(v_compras_ventas.bid);
                var sumatoria = parseFloat(ValorOferta) + parseFloat(ValorDemanda);
                var promedio = sumatoria/2;
                //var CantPromedio = v_compras_ventas.ask.toString().trim().length ;
                var CantPromedio = ValorOferta.toString().trim().length ;
                var ValStrnPromedio = promedio.toString().substr(0, CantPromedio);
                var ValFinPromedio = parseFloat(ValStrnPromedio);
                var Existencia = 1;
                console.log('\n ');
                console.log('############################################');
                Meteor.call("GuardarLogEjecucionTrader", [' Verificando Tipo de Cambio: ']+[v_compras_ventas.symbol]);
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Oferta en Venta: ']+[ValorOferta]);
                Meteor.call("GuardarLogEjecucionTrader", [' Valor de Oferta de Compra: ']+[ValorDemanda]);
                Meteor.call("GuardarLogEjecucionTrader", [' Promedio: ']+[ValFinPromedio]);
                Meteor.call("GuardarLogEjecucionTrader", [' Marca de tiempo: ']+[v_compras_ventas.timestamp]);
                console.log('############################################');
                if (EquivalenciasDol.find({ tipo_cambio : TIPO_CAMBIO }).count() === 0) {
                    EquivalenciasDol.insert({ fecha : fecha._d, tipo_cambio : v_compras_ventas.symbol, ValorOfertaVenta : v_compras_ventas.ask, ValorOfertaCompra : v_compras_ventas.bid, Promedio : ValFinPromedio, Existe : Existencia })
                }
                else{
                    EquivalenciasDol.update({ tipo_cambio : v_compras_ventas.symbol },{$set:{ fecha : fecha._d, ValorOfertaVenta : v_compras_ventas.ask, ValorOfertaCompra : v_compras_ventas.bid, Promedio : ValFinPromedio, Existe : Existencia }}, {"multi" : true,"upsert" : true});
                }
            }

        }else{
            Meteor.call("GuardarLogEjecucionTrader", "Entre por compras_ventas === undefined ");
            var ValFinPromedio = 0;
            var Existencia = 0;
        }
        PromedioObtenido = { 'Promedio': ValFinPromedio, 'Existe': Existencia };
        //console.log("Valor de PromedioObtenido", PromedioObtenido);
        
        return PromedioObtenido;
    },

    'validaMonedasActivas':function(){
        //traerme las monedas y ver cuales estan activas?
        var CONSTANTES = Meteor.call("Constantes");
        Meteor.call("ListaMonedas",function(err, result){
            if (err) {
                Meteor.call('ValidaError', err, 1);
            }else {
                var moneda = Meteor.call("ConexionGet", CONSTANTES.monedas);
                //var mons = (moneda.data);
                var mons = moneda
                var monedasBD = Monedas.find({}).fetch();
                var aux1 = [];
                var x;
                var esta;

                for ( a = 0; a < monedasBD.length; a++) {
                    esta = false;
                    x = monedasBD[a].moneda;
                    for ( b = 0; b < mons.length; b++) {
                        if(x === mons[b].id)
                        {
                            esta = true;
                            break;
                        }
                    }
                    if(!esta){
                        aux1.push(monedasBD[a]);
                    }
                }

                for(aux in aux1)
                {
                    try{
                        Monedas.update({ moneda : aux1[aux].moneda },{$set:{ nombre_moneda : aux1[aux].nombre_moneda, activo : "N" }}, {"multi" : true,"upsert" : true});
                    }
                    catch(error){
                        Meteor.call("GuardarLogEjecucionTrader", 'Error: los datos no pudieron ser actualizados');
                        Meteor.call('ValidaError', error, 1);
                    }
                }
            }
        });
    },

    'validaTiposDeCambiosActivos':function(){
        //traerme los tipos de cambio y ver cuales estan activos?
        var CONSTANTES = Meteor.call("Constantes");
        Meteor.call("ListaTiposDeCambios", 2,function(err, result){
            if (err) {
                Meteor.call('ValidaError', err, 1);
            }else {
                var traders = Meteor.call("ConexionGet", CONSTANTES.simbolos);
                //var mon_camb =(traders.data);
                var mon_camb =traders
                var tradersBD = TiposDeCambios.find({}).fetch();
                var aux1 = [];
                var x;
                var esta;

                for ( a = 0; a < tradersBD.length; a++) {
                    esta = false;
                    x = tradersBD[a].moneda;
                    for ( b = 0; b < mon_camb.length; b++) {
                        if(x === mon_camb[b].id)
                        {
                            esta = true;
                            break;
                        }
                    }
                    if(!esta){
                        aux1.push(tradersBD[a]);
                    }
                }

                console.log(mon_camb[0]);
                console.log(aux1[0]);

                for(aux in aux1)
                {
                    try{
                        TiposDeCambios.update({ tipo_cambio : aux1[aux].tipo_cambio },{$set:{ tipo_cambio : aux1[aux].tipo_cambio, moneda_base :  aux1[aux].moneda_base, moneda_cotizacion : aux1[aux].moneda_cotizacion, activo : "N" }}, {"multi" : true,"upsert" : true});
                    }
                    catch(error){
                        Meteor.call("GuardarLogEjecucionTrader", 'Error: los datos no pudieron ser actualizados');
                        Meteor.call('ValidaError', error, 1);
                    }
                }
            }
        });
    },

    'borrarOrden':function(TIPO_CAMBIO){  //DELETE
        var CONSTANTES = Meteor.call("Constantes");
        console.log('############################################');
        console.log('Borrando una nueva orden');

        var datos = new Object();
        datos.symbol=TIPO_CAMBIO;

        var url = [CONSTANTES.ordenes];

        OrdenBorrada = Meteor.call('ConexionDel',url, datos);


        Meteor.call("GuardarLogEjecucionTrader", ["Valor de OrdenBorrada"]+[OrdenBorrada]);
    },

    'ConsultaTraderGuardados':function(TIPO_CAMBIO){

        if ( OperacionesCompraVenta.find({ tipo_cambio:TIPO_CAMBIO }, {}).count() === 0 ){
            console.log('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", ['          TIPO DE CAMBIO: ']+[TIPO_CAMBIO]);
            console.log('--------------------------------------------');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", [' Sin datos en BD local de este tipo_cambio: ']+[TIPO_CAMBIO]);
            console.log(' ');
            console.log('--------------------------------------------');
        }
        else {
            console.log('--------------------------------------------');
            Meteor.call("GuardarLogEjecucionTrader", ['          TIPO DE CAMBIO: ']+[TIPO_CAMBIO]);
            console.log('--------------------------------------------');
            console.log(' ');
            Meteor.call("GuardarLogEjecucionTrader", ' Datos encontrados');
            console.log('                    Verificando... ');
            console.log(' ');
            console.log('--------------------------------------------');
            var VAL_TIPO_CAMBIO = OperacionesCompraVenta.aggregate( [{$match: {tipo_cambio:TIPO_CAMBIO}}, {$group: {_id: "$tipo_cambio", max_id : { $max: "$id_hitbtc"}} }]);

            var v_VAL_TIPO_CAMBIO = VAL_TIPO_CAMBIO;

            for (CTD = 0, tamanio_val_tipo_cambio = v_VAL_TIPO_CAMBIO.length; CTD < tamanio_val_tipo_cambio; CTD++) {
                var v_INT_VAL_TIPO_CAMBIO = v_VAL_TIPO_CAMBIO[CTD];

                console.log('Tipo Cambio: ', v_INT_VAL_TIPO_CAMBIO._id);
                console.log('Valor del ID: ', v_INT_VAL_TIPO_CAMBIO.max_id);
            };

            if ( v_INT_VAL_TIPO_CAMBIO._id === undefined ) {
                Meteor.call("GuardarLogEjecucionTrader", [' ConsultaTraderGuardados: ID de Transaccion No pudo ser recuperado para el tipo de Cambio: ']+[v_INT_VAL_TIPO_CAMBIO._id]);
                return v_INT_VAL_TIPO_CAMBIO.max_id;
            }
            else {
                if ( debug_activo === 1) {
                    Meteor.call("GuardarLogEjecucionTrader", [' ConsultaTraderGuardados: ID de Transaccion recuperado con exito: ']+[v_INT_VAL_TIPO_CAMBIO.max_id]);
                };
            };

            return v_INT_VAL_TIPO_CAMBIO.max_id;
        };
    },

    'TipoCambioDisponibleCompra':function(MONEDA, SALDO_MONEDA_EQUIV){
        //Meteor.call("GuardarLogEjecucionTrader", [' TipoCambioDisponibleCompra -- Valores recibidos, MONEDA: ']+[MONEDA] +[' SALDO_MONEDA_EQUIV: ']+[SALDO_MONEDA_EQUIV]);
        var Vset = new Set();

        
        try
        {
            var Valores_TiposDeCambiosRankear = TiposDeCambios.find( { $or : [{"moneda_base" : MONEDA },{ "moneda_cotizacion" : MONEDA }],  "min_compra_equivalente" : { $lt : SALDO_MONEDA_EQUIV }}).fetch();
            //console.log("Valor de Valores_TiposDeCambiosRankear", Valores_TiposDeCambiosRankear);

        }
        catch (error){
            Meteor.call("ValidaError", error, 2);
        };

        for (CTMCB = 0, tamanio_Valores_TiposDeCambiosRankear = Valores_TiposDeCambiosRankear.length; CTMCB < tamanio_Valores_TiposDeCambiosRankear; CTMCB++) {
            var V_Valores_TiposDeCambiosRankear = Valores_TiposDeCambiosRankear[CTMCB];
            //console.log("Valor de V_Valores_TiposDeCambiosRankear", V_Valores_TiposDeCambiosRankear)
            //Meteor.call("GuardarLogEjecucionTrader", [' Valore de V_Valores_TiposDeCambiosRankear: ']+[V_Valores_TiposDeCambiosRankear]);
            /* 
            if ( MONEDA == V_Valores_TiposDeCambiosRankear.moneda_base ) {
                var accion = 1
            } else if (MONEDA == V_Valores_TiposDeCambiosRankear.moneda_cotizacion ){
                var accion = 2
            }
            */
            TempTiposCambioXMoneda.update({ "tipo_cambio": V_Valores_TiposDeCambiosRankear.tipo_cambio, 
                                             "moneda_saldo" : MONEDA }, {    
                                            $set: {
                                                    "tipo_cambio": V_Valores_TiposDeCambiosRankear.tipo_cambio,
                                                    "moneda_base": V_Valores_TiposDeCambiosRankear.moneda_base,
                                                    "moneda_cotizacion" : V_Valores_TiposDeCambiosRankear.moneda_cotizacion, 
                                                    "saldo_moneda_tradear" : SALDO_MONEDA_EQUIV, 
                                                    "moneda_saldo" : MONEDA, 
                                                    "activo" : V_Valores_TiposDeCambiosRankear.activo,
                                                    "comision_hitbtc" : V_Valores_TiposDeCambiosRankear.comision_hitbtc,
                                                    "comision_mercado" : V_Valores_TiposDeCambiosRankear.comision_mercado,
                                                    "min_compra" : V_Valores_TiposDeCambiosRankear.min_compra,
                                                    "moneda_apli_comision": V_Valores_TiposDeCambiosRankear.moneda_apli_comision,
                                                    "valor_incremento" : V_Valores_TiposDeCambiosRankear.valor_incremento,
                                                    "estado" : V_Valores_TiposDeCambiosRankear.estado
                                                }
                                            }, 
                                            {"multi" : true,"upsert" : true});
        };
        return Valores_TiposDeCambiosRankear;
    },

    'ListaTradeoActual':function( TIPO_CAMBIO, VALOR_EJEC, MONEDA_SALDO ){
        var CONSTANTES = Meteor.call("Constantes");
        console.log('############################################');
        console.log(' ');
        var url_tradeos_parcial= ['from=0&by=trade_id&sort=DESC&start_index=0&limit=']+[CONSTANTES.cant_traders]+['&format_numbers=number'];
        var url_tradeos_completa = [CONSTANTES.publico]+['trades/']+[TIPO_CAMBIO]+['?']+[url_tradeos_parcial];
        var v_tradeos = Meteor.call("ConexionGet", url_tradeos_completa);
        //var trad_mon = (v_tradeos.data);
        var trad_mon = v_tradeos
        /*
        var Val_trad = (Meteor.call('ConsultaTraderGuardados', TIPO_CAMBIO));
        var Val_trad_tipo_cambio = (Val_trad);
        */

        


        for (i = 0, tamanio_trad_mon = trad_mon.length; i < tamanio_trad_mon; i++) {

            var v_TradActDat = trad_mon[i];

            switch (v_TradActDat.side){
                case 'buy':
                    var v_tipo_operacion_act = 'COMPRA';
                    break;
                case 'sell':
                    var v_tipo_operacion_act = 'VENTA';
                    break;
                default:
                    Meteor.call("GuardarLogEjecucionTrader", ['Nuevo tipo de operacion detectada en la función "ListaTradeoActual": ']+[v_TradActDat.side]);
                    var PeriodoTipoOperacionAct = v_TradActDat.side
            }

            switch(VALOR_EJEC){
                case 1:
                    console.log(' Devuelve los datos Historicos de Tradeo de todas las criptocurrencias negociadas - Esto nos sirve para verificar los valores ascendente. (Order Book)');
                    console.log('############################################');
                    Meteor.call("GuardarLogEjecucionTrader", ['    Verificando Símbolo tradeo: ']+[TIPO_CAMBIO]);
                    console.log('############################################');

                    if ( v_TradActDat === undefined ) {
                        console.log('############################################');
                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                        console.log('############################################');
                    }
                    else {
                        Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[v_TradActDat.timestamp]);
                        Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[v_TradActDat.id]);
                        Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[v_TradActDat.price]);
                        Meteor.call("GuardarLogEjecucionTrader", [' CANTIDAD: ',]+[v_TradActDat.quantity]);
                        Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[v_tipo_operacion_act]); 
                    }

                    console.log('############################################');
                    console.log(' ');
                    break;
                case 2:
                    if ( v_TradActDat === undefined ) {
                        Meteor.call("GuardarLogEjecucionTrader", ' ListaTradeoActual: Paso 1 ');
                        console.log('############################################');
                        Meteor.call("GuardarLogEjecucionTrader", ['No hay Valores asociados a este Tipo de Cambio: ']+[TIPO_CAMBIO]);
                        console.log('############################################');
                    }
                    else {
                        var PeriodoFechaAct = v_TradActDat.timestamp;
                        var PeriodoId_hitbtcAct = v_TradActDat.id;
                        var PeriodoPrecioAct = Number(v_TradActDat.price);
                        var PeriodoCantidadAct = v_TradActDat.quantity;
                        var PeriodoTipoOperacionAct = v_tipo_operacion_act;

                        if ( OperacionesCompraVenta.find( { tipo_cambio : TIPO_CAMBIO }).count() === 0 ){
                            OperacionesCompraVenta.insert({ id_hitbtc: PeriodoId_hitbtcAct, 
                                                            tipo_cambio : TIPO_CAMBIO, 
                                                            fecha : PeriodoFechaAct, 
                                                            precio : PeriodoPrecioAct,
                                                            cantidad : PeriodoCantidadAct,
                                                            tipo_operacion : PeriodoTipoOperacionAct
                                                                    });
                            //// estoy modificando acá

                            TiposDeCambios.update(  { tipo_cambio : TIPO_CAMBIO },
                                                    { $set:{    "periodo1.Base.id_hitbtc": PeriodoId_hitbtcAct,
                                                                "periodo1.Base.fecha": PeriodoFechaAct,
                                                                "periodo1.Base.precio" : PeriodoPrecioAct,
                                                                "periodo1.Base.tipo_operacion": PeriodoTipoOperacionAct,
                                                                "periodo1.Base.reset": 0,
                                                                "periodo1.Cotizacion.id_hitbtc": PeriodoId_hitbtcAct,
                                                                "periodo1.Cotizacion.fecha": PeriodoFechaAct,
                                                                "periodo1.Cotizacion.precio" : PeriodoPrecioAct,
                                                                "periodo1.Cotizacion.tipo_operacion": PeriodoTipoOperacionAct,
                                                                "periodo1.Cotizacion.reset": 0 }},
                                                    { "multi" : true,"upsert" : true });

                        }else{
                            OperacionesCompraVenta.update(  { tipo_cambio : TIPO_CAMBIO },
                                                            {$set:{ id_hitbtc: PeriodoId_hitbtcAct, 
                                                                    fecha : PeriodoFechaAct,
                                                                    precio : PeriodoPrecioAct, 
                                                                    cantidad : PeriodoCantidadAct,
                                                                    tipo_operacion : PeriodoTipoOperacionAct}
                                                            },
                                                            {"multi" : true,"upsert" : true});
                        }
                        /*
                        Meteor.call("GuardarLogEjecucionTrader", [' LINEA DE TIEMPO: ']+[PeriodoFechaAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [' ID: ']+[PeriodoId_hitbtcAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [' PRECIO: ']+[PeriodoPrecioAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [' CANTIDAD: ',]+[PeriodoCantidadAct]);
                        Meteor.call("GuardarLogEjecucionTrader", [' TIPO OPERACIÓN: ']+[PeriodoTipoOperacionAct]); 

                        console.log('############################################');
                        console.log(' ');*/
                    }
                    break;
                    case 3:
                    
                        var PeriodoFechaAct = v_TradActDat.timestamp;
                        var PeriodoId_hitbtcAct = v_TradActDat.id;
                        var PeriodoPrecioAct = Number(v_TradActDat.price);
                        var PeriodoCantidadAct = v_TradActDat.quantity;
                        var PeriodoTipoOperacionAct = v_tipo_operacion_act;



                        try{
                                var ResetTipCamb = TiposDeCambios.aggregate([  { $match : { tipo_cambio : TIPO_CAMBIO }} ]);
                                var MB = ResetTipCamb.moneda_base;
                                var MC = ResetTipCamb.moneda_cotizacion;
                        }
                        catch (error){
                                Meteor.call("ValidaError", error, 2);
                        };



                        if ( MB === MONEDA_SALDO ) {
                            TiposDeCambios.update(  { tipo_cambio : TIPO_CAMBIO },
                                                    { $set:{    "periodo1.Base.id_hitbtc": PeriodoId_hitbtcAct,
                                                                "periodo1.Base.fecha": PeriodoFechaAct,
                                                                "periodo1.Base.precio" : PeriodoPrecioAct,
                                                                "periodo1.Base.tipo_operacion": PeriodoTipoOperacionAct,
                                                                "periodo1.Base.reset": 0 }},
                                                    { "multi" : true,"upsert" : true });
                        }
                        else if ( MC === MONEDA_SALDO ) {
                            TiposDeCambios.update(  { tipo_cambio : TIPO_CAMBIO },
                                                    { $set:{    "periodo1.Cotizacion.id_hitbtc": PeriodoId_hitbtcAct,
                                                                "periodo1.Cotizacion.fecha": PeriodoFechaAct,
                                                                "periodo1.Cotizacion.precio" : PeriodoPrecioAct,
                                                                "periodo1.Cotizacion.tipo_operacion": PeriodoTipoOperacionAct,
                                                                "periodo1.Cotizacion.reset": 0 }},
                                                    { "multi" : true,"upsert" : true });
                        };                        

                        
                        OperacionesCompraVenta.update(  { tipo_cambio : TIPO_CAMBIO },
                                                            {$set:{ id_hitbtc: PeriodoId_hitbtcAct, 
                                                                    fecha : PeriodoFechaAct,
                                                                    precio : PeriodoPrecioAct, 
                                                                    cantidad : PeriodoCantidadAct,
                                                                    tipo_operacion : PeriodoTipoOperacionAct}
                                                            },
                                                            {"multi" : true,"upsert" : true});


                    break;
                default:
                    Meteor.call("GuardarLogEjecucionTrader", ' Valor de tipo consulta no definida ');
            }
        };
    },
    
    'GuardarOrden': function(TIPO_CAMBIO, CANT_INVER, MON_B, MON_C, MONEDA_SALDO, MONEDA_COMISION, ORDEN, ID_LOTE){

        
        var CONSTANTES = Meteor.call("Constantes");
        //console.log( "TIPO_CAMBIO: ", TIPO_CAMBIO, " CANT_INVER: ", CANT_INVER," MON_B: ", MON_B, " MON_C: ", MON_C, " MONEDA_SALDO: ", MONEDA_SALDO, " MONEDA_COMISION: ", MONEDA_COMISION, " ORDEN: ", ORDEN, " ID_LOTE : ", ID_LOTE);


        //console.log("Valor de ORDEN: ", ORDEN );

        var Negociaciones = ORDEN.tradesReport
        //console.log("Valor de Negociaciones: ", Negociaciones );

        var ComisionTtl = 0
        for (CRPT = 0, TRPT = Negociaciones.length; CRPT < TRPT; CRPT++) {
            var Reporte = Negociaciones[CRPT];
            //console.log("Valor de Reporte: ", Reporte);
            ComisionTtl +=  parseFloat(Reporte.fee)
        }
        var Comision = ComisionTtl.toString()
        var precio = ORDEN.price
        var CantidadRecibida = ORDEN.quantity
        var IdHBTC = ORDEN.id
        var IdTransaccionActual = ORDEN.clientOrderId
        var FormaDeOperacion = ORDEN.side
        var status = ORDEN.status
        var FechaCreacion = ORDEN.createdAt
        var FechaActualizacion = ORDEN.updatedAt

        


        ///////////////////////////////////////////////////////////////////////////


        var V_AnterioresMB = Monedas.aggregate([{ $match: { 'moneda' : MON_B }}]);
        var ValoresAnterioresMB = V_AnterioresMB[0];
        var V_AnterioresMC = Monedas.aggregate([{ $match: { 'moneda' : MON_C }}]);
        var ValoresAnterioresMC = V_AnterioresMC[0];
        var url_transaccion=[CONSTANTES.HistTradeo]+['?clientOrderId=']+[IdTransaccionActual]
        var Transaccion = Meteor.call("ConexionGet", url_transaccion);
        var transa = Transaccion[0];
        var V_Id_Transhitbtc = transa.orderId

        Meteor.call('GuardarLogEjecucionTrader', ' CrearNuevaOrder: Estoy en: Estado_Orden === "filled"');


        console.log('############################################');
        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ANTERIORES MB');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_B]);
        console.log('--------------------------------------------');
        var FechaTradeoAnteriorMB = ValoresAnterioresMB.saldo.tradeo.fecha;
        var SaldoTradeoAnteriorMB = ValoresAnterioresMB.saldo.tradeo.activo;
        var V_EquivalenciaTradeoAnteriorMB = ValoresAnterioresMB.saldo.tradeo.equivalencia;
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoAnteriorMB: "]+[FechaTradeoAnteriorMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoAnteriorMB: "]+[SaldoTradeoAnteriorMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoAnteriorMB: "]+[V_EquivalenciaTradeoAnteriorMB]);

        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ANTERIORES MC');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_C]);
        console.log('--------------------------------------------');
        var FechaTradeoAnteriorMC = ValoresAnterioresMC.saldo.tradeo.fecha;
        var SaldoTradeoAnteriorMC = ValoresAnterioresMC.saldo.tradeo.activo;
        var V_EquivalenciaTradeoAnteriorMC = ValoresAnterioresMC.saldo.tradeo.equivalencia;
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoAnteriorMC: "]+[FechaTradeoAnteriorMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoAnteriorMC: "]+[SaldoTradeoAnteriorMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoAnteriorMC: "]+[V_EquivalenciaTradeoAnteriorMC]);


        Meteor.call('ActualizaSaldoActual', MON_B );
        Meteor.call('ActualizaSaldoActual', MON_C );

        var V_ActualMB = Monedas.aggregate([{ $match: { 'moneda' : MON_B }}]);
        var ValoresActualesMB = V_ActualMB[0];
        var V_ActualMC = Monedas.aggregate([{ $match: { 'moneda' : MON_C }}]);
        var ValoresActualesMC = V_ActualMC[0];



        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ACTUALES MB');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_B]);
        console.log('--------------------------------------------');
        var FechaTradeoActualMB = ValoresActualesMB.saldo.tradeo.fecha;
        var SaldoTradeoActualMB = ValoresActualesMB.saldo.tradeo.activo;
        var V_EquivalenciaTradeoActualMB = Meteor.call('EquivalenteDolar', MON_B, parseFloat(SaldoTradeoActualMB), 2);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoActualMB: "]+[FechaTradeoActualMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoActualMB: "]+[SaldoTradeoActualMB]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoActualMB: "]+[V_EquivalenciaTradeoActualMB]);


        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES ACTUALES MC');
        Meteor.call("GuardarLogEjecucionTrader", ['  ']+[MON_C]);
        console.log('--------------------------------------------');
        var FechaTradeoActualMC = ValoresActualesMC.saldo.tradeo.fecha;
        var SaldoTradeoActualMC = ValoresActualesMC.saldo.tradeo.activo;
        var V_EquivalenciaTradeoActualMC = Meteor.call('EquivalenteDolar', MON_C, parseFloat(SaldoTradeoActualMC), 2);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de FechaTradeoActualMC: "]+[FechaTradeoActualMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoTradeoActualMC: "]+[SaldoTradeoActualMC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivalenciaTradeoActualMC: "]+[V_EquivalenciaTradeoActualMC]);

        console.log('--------------------------------------------');
        Meteor.call("GuardarLogEjecucionTrader", '   VALORES INVERSION');


        //var V_SaldoInversion = CANT_INVER;
        var Eqv_V_InverSaldAct = Meteor.call('EquivalenteDolar', MONEDA_SALDO, parseFloat(CANT_INVER), 2);
        console.log("Valor de Eqv_V_InverSaldAct", Eqv_V_InverSaldAct)
        var V_Comision = Comision;
        var Equiv_V_Comision = Meteor.call('EquivalenteDolar', MONEDA_COMISION, parseFloat(V_Comision), 2);
        var SaldoMonedaAdquirida = CantidadRecibida;
        var V_EquivSaldoMonedaAdquirida = Meteor.call('EquivalenteDolar', V_MonedaAdquirida, parseFloat(SaldoMonedaAdquirida), 2);
        var V_IdHitBTC = IdHBTC
        var V_FormaOperacion = FormaDeOperacion;
                        
        if ( MONEDA_SALDO == MON_B ) {
            var V_MonedaAdquirida = MON_C
            //var V_Ganancia = V_EquivSaldoMonedaAdquirida - V_EquivalenciaTradeoAnteriorMB;
            console.log( 'Eqv_V_InverSaldAnt = ' , parseFloat(Eqv_V_InverSaldAct), ' * ', parseFloat(V_EquivalenciaTradeoAnteriorMB) , ' / ', parseFloat(SaldoTradeoActualMB));
            var Eqv_V_InverSaldAnt = ( parseFloat(Eqv_V_InverSaldAct) * parseFloat(V_EquivalenciaTradeoAnteriorMB) ) / parseFloat(SaldoTradeoActualMB);
            console.log("Valor de Eqv_V_InverSaldAnt", Eqv_V_InverSaldAnt)
            var V_Ganancia = parseFloat(V_EquivSaldoMonedaAdquirida) - Eqv_V_InverSaldAnt;
                            
            GananciaPerdida.insert({    
                                        Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                        Id_Transhitbtc : V_Id_Transhitbtc,
                                                        ID_LocalAnt : IdTransaccionActual,
                                                        ID_LocalAct : IdTransaccionActual,
                                                        Id_Lote: ID_LOTE,
                                                        Tipo : V_FormaOperacion,
                                                        TipoCambio : TIPO_CAMBIO,
                                                        Precio : precio,
                                                        Status : status,
                                                        FechaCreacion : FechaCreacion,
                                                        FechaActualizacion : FechaActualizacion},
                                        Comision : {    Valor : V_Comision,
                                                        Equivalencia : Equiv_V_Comision},
                                        Moneda : {  emision : {     moneda : MON_B,
                                                                    Fecha : FechaTradeoAnteriorMB,
                                                                    Saldo : SaldoTradeoAnteriorMB,
                                                                    Equivalente : V_EquivalenciaTradeoAnteriorMB},
                                                    Adquirida : {   moneda : MON_C,
                                                                    Fecha : FechaTradeoActualMC,
                                                                    Saldo : SaldoTradeoActualMC,
                                                                    Equivalente : V_EquivalenciaTradeoActualMC}},
                                        Inversion : {   SaldoInversion  : CANT_INVER,
                                                        Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                            Final : V_EquivSaldoMonedaAdquirida}},
                                        Ganancia : {    Valor : V_Ganancia }
                                    });

            TiposDeCambios.update(  { tipo_cambio : TIPO_CAMBIO },
                                    { $set:{  "periodo1.Base.reset": 1 }},
                                    { "multi" : true,"upsert" : true }
                                );

        }else if ( MONEDA_SALDO == MON_C ){
                var V_MonedaAdquirida = MON_B
                //var V_Ganancia = V_EquivSaldoMonedaAdquirida - V_EquivalenciaTradeoAnteriorMC;
                var Eqv_V_InverSaldAnt = ( parseFloat(Eqv_V_InverSaldAct) * parseFloat(V_EquivalenciaTradeoAnteriorMC) ) / parseFloat(SaldoTradeoActualMC);
                var V_Ganancia = parseFloat(V_EquivSaldoMonedaAdquirida) - Eqv_V_InverSaldAnt;

                GananciaPerdida.insert({    
                                            Operacion : {   Id_hitbtc : V_IdHitBTC,
                                                            Id_Transhitbtc : V_Id_Transhitbtc,
                                                            ID_LocalAnt : IdTransaccionActual,
                                                            ID_LocalAct : IdTransaccionActual,
                                                            Id_Lote: ID_LOTE,
                                                            Tipo : V_FormaOperacion,
                                                            TipoCambio : TIPO_CAMBIO,
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
                                            Inversion : { SaldoInversion  : CANT_INVER,
                                                            Equivalencia : {    Inicial : Eqv_V_InverSaldAnt,
                                                                                Final : V_EquivSaldoMonedaAdquirida}},
                                            Ganancia : { Valor :  V_Ganancia}
                                        });

                TiposDeCambios.update(  { tipo_cambio : TIPO_CAMBIO },
                                        { $set:{  "periodo1.Cotizacion.reset": 1 }},
                                        { "multi" : true,"upsert" : true }
                                    );
        }

        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_IdHitBTC: "]+[V_IdHitBTC]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de IdTransaccionActual: "]+[IdTransaccionActual]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_SaldoInversion: "]+[CANT_INVER]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Comision: "]+[V_Comision]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de Equiv_V_Comision: "]+[Equiv_V_Comision]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_MonedaAdquirida: "]+[V_MonedaAdquirida]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de SaldoMonedaAdquirida: "]+[SaldoMonedaAdquirida]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_EquivSaldoMonedaAdquirida: "]+[V_EquivSaldoMonedaAdquirida]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_FormaOperacion: "]+[V_FormaOperacion]);
        Meteor.call("GuardarLogEjecucionTrader", [" Valor de V_Ganancia: "]+[V_Ganancia]);

        console.log('--------------------------------------------');
        console.log('############################################');
    },

});