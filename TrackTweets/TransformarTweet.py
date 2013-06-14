import re

def ReplaceUser(matchobj):
	user = re.split('@',matchobj.group(0))
	html = ' <a href="http://twitter.com/' + user[1] + '" target="_black">@' + user[1] + '</a>' 
	return html

def ReplaceHashtag(matchobj):
	hashtag = re.split('#',matchobj.group(0))
	html = ' <a href="/search?search=%23' +  hashtag[1]+ '" target="_black">#' + hashtag[1] + '</a>' 
	return html

def ReplaceURL(matchobj):
	url = re.split('http://|https://',matchobj.group(0))
	html = ' <a href="' +  matchobj.group(0)+ '" target="_black">' + url[1] + '</a> ' 
	return html


def convertirTweet(tweet):
	patronUser = re.compile('([@]\w*)')
	patronHashtag = re.compile('([#]\w*)')
	patronURL = re.compile('http(s?)://([A-Za-z0-9-_:%&~\?\/.=]+)')
	return patronHashtag.sub( ReplaceHashtag, patronUser.sub( ReplaceUser, patronURL.sub( ReplaceURL, tweet ) ) )




	




