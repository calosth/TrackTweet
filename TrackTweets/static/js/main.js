$(document).on('ready',handlerDocumentReady);


function handlerDocumentReady(){

	//desplegar menu de usuario
	$('#user').hoverIntent(function(){
		$('#menuUser').slideToggle('fast');
	});

}