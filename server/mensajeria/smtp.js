import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerFile } from 'meteor/ostrio:loggerfile';

//**************************************************

const log = new Logger();
const LogFile = new LoggerFile(log, logFilePath);
LogFile.enable();


Meteor.methods({
    'sendEmail': function (to, subject, email) {
        log.info("ENTRE","ACA","SMTP");
        log.info("aaaa","ACA","SMTP");
        Email.send({
            to:       to,
            from:     'darwin.2911@gmail.com',
            subject:  subject,
            text:     'test email'
        });
        console.log(Email);
    }
});


Meteor.startup(function () {
   var smtp = {
        username: 'darwin.2911@gmail.com',
        password: '122sdsdsdsdqq',
        server:   'smtp.gmail.com',
        port: 25
    };

    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
    log.info(process.env.MAIL_URL,"","SMTP");
});
