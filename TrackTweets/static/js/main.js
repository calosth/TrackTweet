$(document).on('ready',handlerDocumentReady);


function handlerDocumentReady(){

	//desplegar menu de usuario
	$('#user').hoverIntent(function(){
		$('.menuUser').slideToggle('fast');
	});

	$('#userMenu').hoverIntent(function(){
		$('.menuUser').slideToggle('fast');
	});	

	$('#IconMenu-display').on('click',handlerClickMenu);

}
function handlerClickMenu (e) {

	$('#menu-display').slideToggle('fast');

}