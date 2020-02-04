import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
import { Email } from 'meteor/email';

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log, logFilePath);
LogFile.enable();


Meteor.methods({
    'sendEmail': function (to, subject, email) {
        var CONSTANTES = Meteor.call("Constantes");
        log.info("ENTRE","ACA","SMTP");
        Email.send({
            to:       to,
            from:     'invertminado@gmail.com',
            subject:  subject,
            text:     email
        });
        log.info("aaaa","ACA","SMTP");
        console.log('Valor de Email: ',Email);
        //log.info('Valor de Email: ',Email);
    },
});


Meteor.startup(function () {
    var CONSTANTES = Meteor.call("Constantes");
    var usuario = CONSTANTES.CorreoUsur;
    var clave = CONSTANTES.CorreoPasswd;
    var servidor = CONSTANTES.CorreoServ;
    var puerto = CONSTANTES.CorreoPuerto;

    var smtp = {
        username: usuario,
        password: clave,
        server:   servidor,
        //port: 25 
        port: 25
    };

    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
    log.info(process.env.MAIL_URL,"","SMTP");
});
