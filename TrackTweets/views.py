from django.http import HttpResponseRedirect,HttpResponse
from django.shortcuts import render_to_response 
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from twython import Twython, TwythonError
import json
app_key = '9N5k0ctbxMRsTOz5GAbAw'
app_secret ='4hAWJlhDfDuOn7g4BqVXeQo2PbcLYABjpeIKTFYDrnU'
oauth_token = ''
oauth_token_secret =''
ultimo_id = ''
def home(request):
	if 'oauth_token' in request.session:
		t = Twython(app_key,app_secret,request.session["oauth_token"],request.session["oauth_token_secret"])
		
		user = request.session["user"]

		user_timeline = t.get_user_timeline(screen_name = user)		
		
		profile_photo = user_timeline[1]['user']['profile_image_url_https']

 		home_timeline = t.get_home_timeline()
 		request.session['ultimo_id'] = int (home_timeline[0]['id'] -4)

		return render_to_response('home.html',{'tweets':home_timeline , 'profile_photo':profile_photo ,'user':user}, context_instance=RequestContext(request))
	else:
		return render_to_response('index.html',context_instance=RequestContext(request))


def twitter(request):
	t = Twython(app_key, app_secret)
	auth_props = t.get_authentication_tokens(callback_url='http://tracktweet.herokuapp.com//done')
	oauth_token = auth_props['oauth_token']
	oauth_token_secret = auth_props['oauth_token_secret']
	return HttpResponseRedirect(auth_props['auth_url'])

def done(request):
	oauth_token = request.GET.get("oauth_token")
	
	oauth_verifier =request.GET.get('oauth_verifier')
	
	twitter = Twython(app_key,app_secret,oauth_token,oauth_token_secret)
	
	oauth_tokens = twitter.get_authorized_tokens(oauth_verifier)
	
	request.session["user"] = oauth_tokens['screen_name']

	request.session["oauth_token"] = oauth_tokens["oauth_token"] 
	
	request.session["oauth_token_secret"] = oauth_tokens["oauth_token_secret"] 

	return HttpResponseRedirect('/')

def about(request):
	return render_to_response('about.html',context_instance=RequestContext(request))
# Hacer logeo
def get_tweets(request):
	if request.is_ajax():
		t = Twython(app_key,app_secret,request.session["oauth_token"],request.session["oauth_token_secret"])
		home_timeline = t.get_home_timeline(since_id = request.session['ultimo_id']	)	
		request.session['ultimo_id'] = int (home_timeline[0]['id'] -4)

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
	

	




