import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';
import { Email } from 'meteor/email';

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log, logFilePath);
LogFile.enable();


Meteor.methods({
    'sendEmail': function (para, asunto, texto) {
        log.info('Valores recibidos, para: : ', [para] + [', asunto: '] + [asunto] + [', texto: '] + [texto]); 
        var CONSTANTES = Meteor.call("Constantes");
        var emisor = CONSTANTES.CorreoUsur;
        /*
        try{

            Email.send({
                to:       para,
                from:     emisor,
                subject:  asunto,
                text:     texto
            });
        }catch(error){
            log.info(" FALLO EN ENVÍO DE CORREO");
            log.info(" ERROR: ", error);
        }
        /**/
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
        port: puerto
    };

    //process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(usuario) + ':' + encodeURIComponent(clave) + '@' + encodeURIComponent(servidor) + ':' + puerto;
    log.info(process.env.MAIL_URL);
});
