$(document).on('ready',handlerDocumentReady);


function handlerDocumentReady(){

	//desplegar menu de usuario
	$('#user').hoverIntent(function(){
		$('#menuUser').slideToggle('fast');
	});


	$('#IconMenu-display').on('click',handlerClickMenu);

}
function handlerClickMenu (e) {
	css ={
		display: 'inline-block',
		heigth: 'auto'
	}

	$('#menu-display').slideToggle('fast');
	// $('#menu-display').css(css);

}