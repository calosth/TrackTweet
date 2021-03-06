
var listaMarkers = [];

function onDocumentReady() {





	// Inicializar pluging Jquery timeago
	$( 'attr.timeago' ).timeago();
    
    // declarar mapa leaflet
    var map = L.map( 'map', {
	    center: [0, -23],
	    zoom: 3,
	    // maxZoom: 3,
	});

	var tiles = L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png' );

	map.addLayer( tiles );

	//Ocultar el side bar
	handlersidebar();
	


	//Funcion que recibe un tweet y lo pone en el mapa
	function MarcarTweet( longi , latit , tweethtml ,id){

		var tweetIcon = L.icon({
			iconUrl: 'static/img/marker.png',
			shadowUrl: 'static/img/marker-shadow.png',
			iconSize: [25, 41],
			shadowSize: [41,41],
			iconAnchor: [12,40],
			shadowAnchor: [13,40],
			popupAnchor: [1,-30]

		});
		var markerTweet = L.marker( [longi, latit],{icon: tweetIcon} );
		var tweetmarker = {
			marker: markerTweet,
			tweet: id
		}


	    var latlng = new google.maps.LatLng(longi,latit);
	    var geocoder = new google.maps.Geocoder();

		listaMarkers.push( tweetmarker );

	    geocoder.geocode({'latLng': latlng, region: 'es'}, function(results, status) {
	      	if (status == google.maps.GeocoderStatus.OK) {
		        if ( results[1] ) {
		        	tweethtml = tweethtml + '<div id="address"><strong>' + results[1].formatted_address + '</strong></div>';			        			        
		        }
	      	}
			markerTweet.bindPopup( tweethtml , {minWidth: 380,maxWidth: 400} ).openPopup();
			map.addLayer( markerTweet );			      	
	    });

	}
	
	// Request cada 60 segundos
	setInterval( RequestAjax, 60000 );

	// Geoposicionar Tweets sincronos 
	$( '.tweet-geo' ).each( posicionarTweetsPrimerRequest) ;

	function posicionarTweetsPrimerRequest(){
		var datos 		= $( this ).attr( 'data-geo' );
		var latitud 	= '';
		var longitud 	= '';
		var posicion ;
		for ( var i = 1 ; i < datos.length ; i++ ) {
			if (datos[i] == ',') {
				posicion = i + 2;
				break;
			}
			latitud += datos[i];

		}
		for ( var i = posicion; i < datos.length; i++ ) {
			if ( datos[i] == ']' ) {
				break;
			}				
			longitud += datos[i];
		}
		var html = $("<div />").append($(this).clone()).html();
		MarcarTweet( parseFloat( latitud ), parseFloat( longitud ),  html  , parseInt( $(this).data('id')) );		

	}

	$(' .tweet-geo' ).on( 'click', MoveraMarker );


	// Declaro lista array para almacenar tweets de carga asincrona
	var Listatweets 	= [];
	var titleOriginal 	= document.title;

	function RequestAjax( data ){
		URL = '/get_tweets';

		if (document.URL != "http://localhost:8000/"){
			URL = document.URL;
		}
		$.getJSON( URL , manejarRequet );

		function manejarRequet ( json ){
			// $.each innecesario pero no di con otra forma
			$.each( json , cargarTweets );				
		}
		
		function cargarTweets( key , tweets ){
			//Si el objeto es mas de 0 hay un nuevo tweet
			if ( tweets.length >0 ){
				//Coloco los tweets en la lista para ser desplegado 
			 	$.each( tweets, llenarLista );
				document.title ='(' + Listatweets.length + ') ' + titleOriginal;
				cssAbrirNewTweets = {
					display: 'block'
				};
				$( '#newTweets' ).css( cssAbrirNewTweets );
				// $('#newTweets').slideToggle('slow');
				//para iterar cada tweet
				$( '#newTweets' ).on( 'click', function(){$.each(Listatweets, inyectarTweets)} );

			}
		}

		function llenarLista( key, tweets ){
			Listatweets.push( tweets );
			var mensaje = ' nuevos tweets';

			if ( Listatweets.length == 1 )
				mensaje = ' nuevo tweet';

			$( '#newTweets' ).text( Listatweets.length + mensaje );
		}
	}

	function inyectarTweets(key,tweet){

			var article ='';			

			//Si tiene localizacion
			if (tweet.geo != null){
				//Cadena para inyetar tweet
				article = '<article class="tweet-geo" data-id= '+ tweet.id +'>';

			}
			else{
				article = '<article class="tweet">';
			}

			var html = article +
				"<a href='https://twitter.com/'"+ tweet.user.screem_name +"'><img src=" + tweet.user.profile_image_url +  " /></a><p><strong>"+
					tweet.user.name+"</strong><a href='https://twitter.com/"+tweet.user.screen_name+"'> @"+ tweet.user.screen_name +"</a><attr class='timeago' title='" + tweet.created_at + "'>" + tweet.created_at + "</attr>"+
					"<br/>" +
					tweet.text.convertirURL().convertirUsuario().convertirHashtag()+"</p></article>";	

			if(tweet.geo != null){
				tweet.coordinates.coordinates[0]; // Longitud
				tweet.coordinates.coordinates[1]; // Latitude
				//La verdad es que no se cual es cual
				MarcarTweet( tweet.coordinates.coordinates[1], tweet.coordinates.coordinates[0] ,  html, tweet.id );				
			}

			//inyectar tweet
			$( '#tweets' ).prepend(html).css({display: 'block'});


			//deshabilitar #newTweets
			$( '#newTweets' ).off( 'click' );
			cssAbrirNewTweets ={
				display: 'none'
			}
			$( '#newTweets' ).css(cssAbrirNewTweets);		

			//limpiar array
			Listatweets 	= [];	
			//limpiar titulo
			document.title 	= titleOriginal;

			$( '.tweet-geo' ).on( 'click' , MoveraMarker );
			$( 'attr.timeago' ).timeago();

	}	

	function MoveraMarker( e ){
		var IdClick = $(this).data( 'id' );

		$.each( listaMarkers, function(){
			if ( this.tweet == IdClick ){

				map.panTo( this.marker._latlng );
				map.setZoom( 12 );
				this.marker.openPopup();

			}
		});

	}

// -------------------------------------------------------------------------------------------//
	var oneRequest = true;
	function handlerMastweet(){
		$('div#backtimelineLoader').html("<img src='http://i.imgur.com/qkKy8.gif'/><spam style='display:block;''>Cargando</spam>");
		URL = document.URL + 'timelineback';
		$.getJSON( URL , manejarRequest_timelikeback ).fail(function()
			{
				oneRequest = true;
				$('div#backtimelineLoader').html("<img src='http://www.usabiketours.com/_Images/icon_face_sad_32.png'/><spam style='display:block;''>Intenta mas tarde</spam>");
			});
		
	}

	function manejarRequest_timelikeback(json){
		$.each(json,iterarRequest_timelineback);
	}

	function iterarRequest_timelineback( key , tweets ){
	
		$.each(tweets,inyectartimelineback)

	}

	function inyectartimelineback(key,tweet){

		var article ='';			

		//Si tiene localizacion
		if (tweet.geo != null){
			//Cadena para inyetar tweet
			article = '<article class="tweet-geo" data-id= '+ tweet.id +'>';

		}
		else{
			article = '<article class="tweet">';
		}

		var html = article +
			"<a href='https://twitter.com/'"+ tweet.user.screem_name +"'><img src=" + tweet.user.profile_image_url +  " /></a><p><strong>"+
				tweet.user.name+"</strong><a href='https://twitter.com/"+tweet.user.screen_name+"'> @"+ tweet.user.screen_name +"</a><attr class='timeago' title='" + tweet.created_at + "'>" + tweet.created_at + "</attr>"+
				"<br/>" +
				tweet.text.convertirURL().convertirUsuario().convertirHashtag()+"</p></article>";	

		if (tweet.geo != null){
			tweet.coordinates.coordinates[0]; // Longitud
			tweet.coordinates.coordinates[1]; // Latitude
			//La verdad es que no se cual es cual
			MarcarTweet( tweet.coordinates.coordinates[1], tweet.coordinates.coordinates[0] , html,tweet.id );			
		}

		//inyectar tweet			
		$( '#tweets' ).append(html).css({display: 'block'});	

		$( '.tweet-geo' ).on( 'click' , MoveraMarker );
		$( 'attr.timeago' ).timeago();
		$('div#backtimelineLoader').empty();
        oneRequest = true;

	}

// -------------------------------------------------------------------------------------------//

	$('#timeline').scroll(function()
	{


		var wintop = $('#timeline').scrollTop(), docheight = $('#tweets').height(), winheight = $('#timeline').height();
        var  scrolltrigger = 0.99;

        if((wintop/(docheight-winheight)) > scrolltrigger && oneRequest ) {
        	oneRequest = false;
         	handlerMastweet();
        }
	});
}


function handlersidebar(){

	$('#timeline').hover(function(){

		if (document.documentElement.clientWidth < 664){
			css = {
				'margin-left': '0em',
				'-webkit-transition': 'all 0.4s linear',
				'opacity': 1
			};
			$('#timeline').css(css);
		}
		else{
			css = {
				'margin-left': '0em',
				'-webkit-transition': 'all 0.4s linear',
				'opacity': 1
			};
			$('#timeline').css(css);			
		}
		}
		,function(){
		if (document.documentElement.clientWidth < 664){
			css = {
				'margin-left': '-20em',
				'-webkit-transition': 'all 0.4s linear',
				'opacity': 0.6
			};
			$('#timeline').css(css);
		}
		else{
			css = {
				'margin-left': '0em',
				'-webkit-transition': 'all 0.4s linear',
				'opacity': 1
			};
			$('#timeline').css(css);			
		}		
	});	
}

$(document).on('ready', onDocumentReady);

$.timeago.settings.strings = {

   prefixFromNow: "dentro de",
   suffixAgo: "",
   suffixFromNow: "",
   seconds: " %d seg",
   minute: "1 min",
   minutes: "%d min",
   hour: "1 h",
   hours: "%d h",
   day: "un día",
   days: "%d días",
   month: "un mes",
   months: "%d meses",
   year: "un año",
   years: "%d años"
};

String.prototype.convertirUsuario = function() {
    return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
        var usuario = u.replace("@","");
        return u.link("http://twitter.com/"+usuario);
    });
};

String.prototype.convertirHashtag = function() {
    return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(e) {
        var etiqueta = e.replace("#","%23");
        return e.link("http://tracktweet.herokuapp.com/search?search="+etiqueta);
    });
};

String.prototype.convertirURL = function() {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
    	nameurl = url.replace('http://','');
    	url = '<a href="'+url+'" target="_black">' + nameurl + '</a>'
        return url;
    });
};

