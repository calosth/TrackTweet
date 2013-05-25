
var listaMarkers = [];

function onDocumentReady() {
    
    var map = L.map('map', {
	    center: [0, -23],
	    zoom: 3,
	});

	var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
	map.addLayer(tiles);

	//Funcion que recibe un tweet y lo pone en el mapa
	function MarcarTweet(longi , latit , author , tweet , id ){

		var markerTweet = L.marker([longi, latit]);

		var tweetmarker = {
			marker: markerTweet,
			tweet: id
		}

		listaMarkers.push(tweetmarker);
		
		map.addLayer(markerTweet);
		markerTweet.bindPopup( author + " <br/>" + tweet);
	}
	
	// Request cada 60 segundos
	setInterval( RequestAjax, 60000);




	// Geoposicionar Tweets sincronos 
	$('.tweet-geo').each(posicionarTweetsPrimerRequest);

	//desplezar menu
	$('user').on('click', function(){
		$('menuUser').slideToggle('slow');
	});

	function posicionarTweetsPrimerRequest(){
		var datos = $(this).attr('data-geo');
		var latitud = '';
		var posicion ;
		var longitud = '';
		for (var i = 1 ; i < datos.length ; i++) {
			if (datos[i] == ',') {
				posicion = i + 2;
				break;
			}
			latitud += datos[i];

		}
		for (var i = posicion; i < datos.length; i++) {
			if (datos[i] == ']') {
				break;
			}				
			longitud += datos[i];
		}
		MarcarTweet(parseInt(latitud), parseInt(longitud), $(this).text() , '' , parseInt($(this).data('id') ));		

	}

	$('.tweet-geo').on('click', MoveraMarker);
	
	var Listatweets = [];
	var titleOriginal = document.title;

	function RequestAjax(data){
		$.getJSON( '/get_tweets' , manejarRequet );

		function manejarRequet (json){

			$.each(json, cargarTweets );	
		}

		
		//para que no carge un tweet utlizar una lista
		function cargarTweets(key , tweets){


			//Si el objeto es mas de 0 hay un nuevo tweet
			if (tweets.length >0){
				//Coloco los tweets en la lista para ser cargado 
				$.each(tweets, llenarLista);
				document.title ='('+ Listatweets.length + ') '+titleOriginal;
				cssAbrirNewTweets ={
					display: 'block'
				}
				$('#newTweets').css(cssAbrirNewTweets);

				//para iterar cada tweet
				$('#newTweets').on('click',function(){$.each(Listatweets, inyectarTweets)});

			}
		}

		function llenarLista(key,tweets){
			Listatweets.push(tweets);
			var mensaje = ' nuevos tweets';

			if (Listatweets.length == 1)
				mensaje = ' nuevo tweet';

			$('#newTweets').text(Listatweets.length + mensaje);
		}
	}
	function inyectarTweets(key,tweet){
		//Para no ingresar el anterior

			var article ='';			

			//Si tiene localizacion
			if (tweet.geo != null){
				//Cadena para inyetar tweet
				article = '<article class="tweet-geo" data-id= '+ tweet.id +'>';

				tweet.coordinates.coordinates[0]; // Longitud
				tweet.coordinates.coordinates[1]; // Latitude
				//La verdad es que no se cual es cual
				MarcarTweet(tweet.coordinates.coordinates[1],tweet.coordinates.coordinates[0] , tweet.user.screen_name , tweet.text, parseInt(tweet.id));
			}
			else{
				article = '<article class="tweet">';
			}

			var html = article +
				"<a href='https://twitter.com/'"+ tweet.user.screem_name +"'><img src=" + tweet.user.profile_image_url +  " /></a><p><strong>"+
					tweet.user.name+"</strong><a href='https://twitter.com/"+tweet.user.screen_name+"'>@"+ tweet.user.screen_name +"</a><br/>" +
					tweet.text+"</p></article>";	
			//inyectar tweet
			$('#tweets').prepend(html).css({display: 'block'});

			//deshabilitar newTweets
			$('#newTweets').off('click');
			cssAbrirNewTweets ={
				display: 'none'
			}
			$('#newTweets').css(cssAbrirNewTweets);		
			Listatweets = [];	
			document.title = titleOriginal;
			$('.tweet-geo').on('click', MoveraMarker);

	}	

	function MoveraMarker(e){
		var IdClick = $(this).data('id');
		console.log(IdClick);
		$.each(listaMarkers,function(){
			if (this.tweet == IdClick){
				console.log(this.marker._latlng);
				map.panTo(this.marker._latlng );
				map.setZoom(7);
				this.marker.openPopup();
			}
		});

	}

}


$(document).on('ready', onDocumentReady);



