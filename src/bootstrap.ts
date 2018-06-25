import Spotify from 'spotify-web-api-node';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import uuid from 'uuid/v4';

import { serve } from './serve';
import {
  PORT,
  SPOTIFY_AUTH_TOKEN,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
} from './constants';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function bootstrapSpotify() {
  const spotify = new Spotify({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
  });

  if (SPOTIFY_AUTH_TOKEN) {
    spotify.setAccessToken(SPOTIFY_AUTH_TOKEN);
  }
  return spotify;
}

async function newSpotifyAuth(spotify: any, authCode: string) {
  const data = await spotify.authorizationCodeGrant(authCode);
  console.log(data);
  const accessToken: string = data.body['access_token'];
  const refreshToken: string = data.body['refresh_token'];
  console.log(accessToken);
  spotify.setAccessToken(accessToken);
  spotify.setRefreshToken(refreshToken);

  serve(app, spotify);
}

export function init() {
  const spotify = bootstrapSpotify();

  if (!spotify.getAccessToken()) {
    spotify.setRedirectURI(SPOTIFY_REDIRECT_URI);

    const SCOPES = [
      'user-read-private',
      'user-read-email',
      'playlist-modify-public',
    ];
    const state = uuid();
    const authURL: string = spotify.createAuthorizeURL(SCOPES, state);
    console.log(`Please authorize default user at the following url:\n${authURL}`);

    app.get('/callback', (req: Request, res: Response) => {
      res.send('OK');
      const authCode: string = req.query.code;
      newSpotifyAuth(spotify, authCode);
    });
  } else {
    serve(app, spotify);
  }

  app.listen(PORT);
}
