
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