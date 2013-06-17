from django.http import HttpResponseRedirect,HttpResponse
from django.shortcuts import render_to_response, render
from django.template import RequestContext
from django.contrib.auth.models import User
from TrackTweets.forms import searchForm
from twython import Twython, TwythonError

import KeySecretApp
import TransformarTweet
import json
oauth_token = ''
oauth_token_secret =''
ultimo_id = ''

def home(request):
	# Si ha iniciado sesion
	if 'oauth_token' in request.session:

		try:
			twitter 	= Twython( KeySecretApp.app_key, KeySecretApp.app_secret, request.session["oauth_token"], request.session["oauth_token_secret"] )
		except Exception, e:
			return render_to_response('error.html',context_instance=RequestContext(request))
		user 		= request.session["user"]
		JSONuser 	= twitter.show_user( screen_name = user )				
		request.session["profile_photo"] = JSONuser['profile_image_url_https']
		profile_photo = request.session["profile_photo"]
 		home_timeline = twitter.get_home_timeline()

 		for item in home_timeline:
 			item['text'] = TransformarTweet.convertirTweet(item['text'])

 		request.session['max_id']		=  home_timeline[ len( home_timeline ) -1 ]['id']
 		request.session['ultimo_id'] 	= int ( home_timeline[0]['id'] - 4 )
		return render_to_response('home.html',{'tweets':home_timeline , 'profile_photo':profile_photo ,'user':user}, context_instance=RequestContext(request))
	else:
		return render_to_response('index.html',{'user':''},context_instance=RequestContext(request))


def twitter(request):

	twitter 			= Twython( KeySecretApp.app_key, KeySecretApp.app_secret )
	auth_props 			= twitter.get_authentication_tokens( callback_url='http://localhost:8000/done' )
	oauth_token 		= auth_props['oauth_token']
	oauth_token_secret 	= auth_props['oauth_token_secret']

	return HttpResponseRedirect( auth_props['auth_url'] )

def done(request):

	oauth_token 			= request.GET.get( 'oauth_token' )
	oauth_verifier 			= request.GET.get( 'oauth_verifier' )
	twitter 				= Twython( KeySecretApp.app_key, KeySecretApp.app_secret, oauth_token, oauth_token_secret )
	oauth_tokens 			= twitter.get_authorized_tokens( oauth_verifier )
	request.session["user"] = oauth_tokens['screen_name']

	#Agregar usuario a la base de datos si no existe
	if User.objects.filter( username= request.session["user"] ) is None:
		usuario = User.objects.create_user(request.session["user"])
		usuario.save()

	request.session["oauth_token"] 			= oauth_tokens["oauth_token"] 
	request.session["oauth_token_secret"] 	= oauth_tokens["oauth_token_secret"] 

	return HttpResponseRedirect('/')


def about(request):

	if 'oauth_token' in request.session:
		user 			= request.session["user"]
		profile_photo 	= request.session["profile_photo"]
		return render_to_response('about.html',{'user':user,'profile_photo':profile_photo},context_instance=RequestContext(request))
	else:
		return render_to_response('aboutAnonymous.html',{'user':''},context_instance=RequestContext(request))

# Request Asincrono
def get_tweets(request):

	if request.is_ajax():
		t = Twython( KeySecretApp.app_key, KeySecretApp.app_secret, request.session["oauth_token"], request.session["oauth_token_secret"])
		home_timeline = t.get_home_timeline( since_id = request.session['ultimo_id']	)	
		request.session['ultimo_id'] = int ( home_timeline[0]['id'] -4 )

		#Validar si hay nuevos tweets
		if len(home_timeline) > 1:
			home_timeline.reverse()	
			del home_timeline[0]
		else:
			home_timeline = ''

		return HttpResponse(
			json.dumps({'timeline': home_timeline}),
			content_type = 'application/json; charset=utf8')
	return HttpResponseRedirect('/')
	
def search(request):

	if 'oauth_token' in request.session:

		user 			= request.session["user"]
		profile_photo 	= request.session["profile_photo"]

		if request.GET.get('search'):

			palabra 	= request.GET.get( 'search' )
			twitter 	= Twython( KeySecretApp.app_key, KeySecretApp.app_secret, request.session["oauth_token"], request.session["oauth_token_secret"])

			#si el request es ajax
			if request.is_ajax():
			
 				search = twitter.search( q=palabra, count = 20 , result_type = 'recent',since_id = request.session['ultimo_id'] )
				search = search['statuses']
		 		request.session['ultimo_id'] = int (search[0]['id'] -4)

				#Validar si hay nuevos tweets
				if len(search) > 1:
					search.reverse()	
					del search[0]
				else:
					search = ''

				return HttpResponse( json.dumps({'timeline': search}), content_type = 'application/json; charset=utf8' )
			else:
 				search = twitter.search( q=palabra, count = 50 , result_type = 'recent' )
				search = search['statuses']
		 		for item in search:
		 			item['text'] = TransformarTweet.convertirTweet(item['text'])					
		 		request.session['ultimo_id'] = int (search[0]['id'] -4)
				return render_to_response( 'homeSearch.html', {'tweets':search,'profile_photo':profile_photo ,'user':user,'busqueda':palabra }, context_instance=RequestContext(request))		
		else:
			form = searchForm()
		return render(request,'search.html', {'form': form, 'profile_photo':profile_photo ,'user':user},context_instance=RequestContext(request))

	else:
		return render_to_response('index.html',{'user':''},context_instance=RequestContext(request))	

def timelineback(request):

	if request.is_ajax():
		twitter 	= Twython( KeySecretApp.app_key, KeySecretApp.app_secret, request.session["oauth_token"], request.session["oauth_token_secret"] )
		home_timeline_back = twitter.get_home_timeline( max_id = request.session['max_id'] , count = 10 )
		request.session['max_id'] =  home_timeline_back[ len( home_timeline_back ) -1 ]['id']  

		#elimino la primera
		del home_timeline_back[0]

		return HttpResponse(
			json.dumps({'timeline': home_timeline_back}),
			content_type = 'application/json; charset=utf8')

	return HttpResponseRedirect('/')

def logout(request):
	try:
		del request.session['oauth_token']
		request.session.flush()
	except KeyError:
		pass
	return HttpResponseRedirect('/')





	




