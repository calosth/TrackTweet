from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from TrackTweet import settings
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'TrackTweets.views.home', name='home'),
    url(r'^login$', 'TrackTweets.views.twitter', name='twitter'),
    url(r'^done$', 'TrackTweets.views.done', name='done'),
    url(r'^about$', 'TrackTweets.views.about', name='about'),
    url(r'^search$', 'TrackTweets.views.search', name='search'),
    url(r'^search/(?P<search>\w+)', 'TrackTweets.views.search', name='search'),
    url(r'^get_tweets$', 'TrackTweets.views.get_tweets', name='get_tweets'),
    url(r'^logout$', 'TrackTweets.views.logout', name='logout'),

    # url(r'^TrackTweet/', include('TrackTweet.foo.urls')),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^app/TrackTweets/static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

)
