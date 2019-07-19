Prueba = new Mongo.Collection('prueba');
Conexion_api = new Mongo.Collection('conexiones');
Usuarios = new Mongo.Collection('usuarios');
TiposDeCambios = new Mongo.Collection('tiposdecambios');
Monedas = new Mongo.Collection('monedas');
Carteras = new Mongo.Collection('carteras');
Ejecucion_Trader = new Mongo.Collection('ejecucion_trader');
LogEjecucionTrader = new Mongo.Collection('log_ejecucion_trader');
OperacionesCompraVenta =  new Mongo.Collection('operaciones_compra_venta');
PeriodoMuestreo =  new Mongo.Collection('periodo_muestreo');
Parametros = new Mongo.Collection('parametros');
ColasEjecucion = new Mongo.Collection('colas_ejecucion');
HistorialTransferencias = new Mongo.Collection('historial_transferencias');
TempTiposCambioXMoneda = new Mongo.Collection('Temp_tcambio_x_moneda');
TempSaldoMoneda = new Mongo.Collection('Temp_saldo_moneda');
TmpTipCambioXMonedaReord = new Mongo.Collection('TempTcambioXMonedaReordenado');
EquivalenciasDol = new Mongo.Collection('EquivalenciasDolares');
GananciaPerdida = new Mongo.Collection('HistoricoGananciaPerdida');
SecuenciasGlobales = new Mongo.Collection('SecuenciasGlobales');
GananciasGlobales = new Mongo.Collection('GananciasGlobales');
logFilePath={
    fileNameFormat(time) {
        // Create log-files hourly
        return 'TraderPrueba' + '_' + (time.getDate()) + '-' + (time.getMonth() + 1) + '-' + (time.getFullYear()) + '.log';
    },
    format(time, level, message, data, userId) {
        // Omit Date and hours from messages
        //return '[' + level + '] | ' + time + ' | ' + message +' '+ data + ' | File: ' + userId + '\r\n';
        //return '[' + level + '] | ' + time + ' | ' + message +' '+ data + ' | Archivo: ' + userId + '\r\n';
        return ' | ' + message +' '+ data + '\r\n';
    },
    path: '/var/log/trader/' // Use absolute storage path
};