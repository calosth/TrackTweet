web: gunicorn TrackTweet.wsgi collectstatic --noinput; bin/gunicorn_django --workers=4 --bind=0.0.0.0:$PORT TrackTweet/settings.py 
