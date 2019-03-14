import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.home.events({
  'click #Prub': function (event) {
  	event.preventDefault();
	Meteor.call('Prueba',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/Prueba');
	
  }
});

Template.home.events({
  'click #ListMon': function (event) {
  	event.preventDefault();
	Meteor.call('ListaMonedas',1,function(err,data){
		Session.set('datos',data);
	});

	Router.go('/ListaMonedas');
	
  }
});

Template.home.events({
  'click #VerSaldo': function (event) {
  	event.preventDefault();
	Meteor.call('SaldoActualMonedas',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/SaldoActualMonedas');
	
  }
});
Template.home.events({
  'click #ListSimb': function (event) {
  	event.preventDefault();
	Meteor.call('ListaSimbolos',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/ListaSimbolos');
	
  }
});

Template.home.events({
  'click #LibOrd': function (event) {
  	event.preventDefault();
	Meteor.call('LibroDeOrdenes',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/LibroDeOrdenes');
	
  }
});

Template.home.events({
  'click #ListTradAct': function (event) {
  	event.preventDefault();
	Meteor.call('ListaTradeoActual',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/ListaTradeoActual');
	
  }
});

Template.home.events({
  'click #ConsultTrans': function (event) {
  	event.preventDefault();
	Meteor.call('ConsultarTransaciones',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/ConsultarTransaciones');
	
  }
});

Template.home.events({
  'click #RetFond': function (event) {
  	event.preventDefault();
	Meteor.call('RetiroFondos',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/RetiroFondos');
	
  }
});


Template.home.events({
  'click #ConsultRetFond': function (event) {
  	event.preventDefault();
	Meteor.call('ConsultaRetiroFondos',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/ConsultaRetiroFondos');
	
  }
});

Template.home.events({
  'click #CanclRetFond': function (event) {
  	event.preventDefault();
	Meteor.call('CancelaRetiroFondos',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/CancelaRetiroFondos');
	
  }
});

Template.home.events({
  'click #ConsultCartDep': function (event) {
  	event.preventDefault();
	Meteor.call('ConsultaCarterasDeposito',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/ConsultaCarterasDeposito');
	
  }
});

Template.home.events({
  'click #CreaCartDep': function (event) {
  	event.preventDefault();
	Meteor.call('CrearCarterasDeposito',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/CrearCarterasDeposito');
	
  }
});

//************************






Template.home.events({
  'click #TransfSaldTradeo': function (event) {
  	event.preventDefault();
	Meteor.call('TransferirfondosReservaTradeo',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/TransferirfondosReservaTradeo');
	
  }
});


Template.home.events({
  'click #ConsultTrans': function (event) {
  	event.preventDefault();
	Meteor.call('ConsultarTransaciones',function(err,data){
		Session.set('datos',data);
	});

	Router.go('/ConsultarTransaciones');
	
  }
});




//////////////////////////////////////////////////////////

Template.Prueba.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.Prueba.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});

//#########################################
Template.ListaMonedas.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.ListaMonedas.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});


//#########################################
Template.SaldoActualMonedas.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.SaldoActualMonedas.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});


//#########################################
Template.ListaSimbolos.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.ListaSimbolos.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});


//#########################################
Template.LibroDeOrdenes.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.LibroDeOrdenes.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});


//#########################################
Template.ListaTradeoActual.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.ListaTradeoActual.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});


//#########################################
Template.ConsultarTransaciones.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.ConsultarTransaciones.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});

//#########################################
Template.RetiroFondos.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.RetiroFondos.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});


//#########################################
Template.ConsultaRetiroFondos.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.ConsultaRetiroFondos.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});

//#########################################
Template.CancelaRetiroFondos.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.CancelaRetiroFondos.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});

//#########################################
Template.ConsultaCarterasDeposito.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.ConsultaCarterasDeposito.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});

//#########################################
Template.CrearCarterasDeposito.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.CrearCarterasDeposito.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});

//#########################################
Template.TransferirfondosReservaTradeo.events({
  'click #back': function (event) {
  	event.preventDefault();
    Router.go('/');
	//Meteor.call('token',function(err,data){

	//})
  }
});

Template.TransferirfondosReservaTradeo.helpers({
	  'datos':function(){
	  	return Session.get('datos');
	  }
});


//#########################################


// ************************

           




