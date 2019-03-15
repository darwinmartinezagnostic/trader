Router.configure({
  layoutTemplate: 'layoutTemplate',
  notFoundTemplate: 'notFoundTemplate'
});


Router.route('/', function () {
	this.render('home');
});

Router.route('/Prueba', function () {
	this.render('Prueba');
});

Router.route('/ListaMonedas', function () {
	this.render('ListaMonedas');
});

Router.route('/SaldoActualMonedas', function () {
	this.render('SaldoActualMonedas');
});

Router.route('/ListaSimbolos', function () {
	this.render('ListaSimbolos');
});

Router.route('/LibroDeOrdenes', function () {
	this.render('LibroDeOrdenes');
});

Router.route('/ListaTradeoActual', function () {
	this.render('ListaTradeoActual');
});

Router.route('/ConsultarTransaciones', function () {
	this.render('ConsultarTransaciones');
});

Router.route('/RetiroFondos', function () {
	this.render('RetiroFondos');
});

Router.route('/ConsultaRetiroFondos', function () {
	this.render('ConsultaRetiroFondos');
});

Router.route('/CancelaRetiroFondos', function () {
	this.render('CancelaRetiroFondos');
});

Router.route('/ConsultaCarterasDeposito', function () {
	this.render('ConsultaCarterasDeposito');
});

Router.route('/CrearCarterasDeposito', function () {
	this.render('CrearCarterasDeposito');
});

Router.route('/TransferirfondosReservaTradeo', function () {
	this.render('TransferirfondosReservaTradeo');
});


///////
