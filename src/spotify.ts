import Spotify from 'spotify-web-api-node';
import express, { Request, Response } from 'express';
import uuid from 'uuid/v4';

import {
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} from './constants';

const AUTH_REFRESH_INTERVAL = 1000 * 60 * 30;

async function refreshAuthToken(spotify: any) {
  try {
    const res = await spotify.refreshAccessToken();
    spotify.setAccessToken(res.body.access_token);
    console.log('Access token refresh successful');
  } catch(e) {
    throw new Error('Failed to refresh access token');
  }
}

async function newSpotifyAuth(spotify: any, authCode: string) {
  const data = await spotify.authorizationCodeGrant(authCode);
  const accessToken: string = data.body['access_token'];
  const refreshToken: string = data.body['refresh_token'];
  spotify.setAccessToken(accessToken);
  spotify.setRefreshToken(refreshToken);

  setInterval(() => refreshAuthToken(spotify), AUTH_REFRESH_INTERVAL);
}

function getRoutes(spotify: any) {
  const routes = express.Router();

  routes.get('/callback', async (req: Request, res: Response) => {
    res.send('OK');
    const authCode: string = req.query.code;
    await newSpotifyAuth(spotify, authCode);
    spotify.onAuthentication(spotify);
  });

  return routes;
}

export function authenticate(onSuccess: any) {
  const spotify = new Spotify({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      redirectUri: SPOTIFY_REDIRECT_URI,
    });
  spotify.onAuthentication = onSuccess;

  const SCOPES = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
  ];
  const state = uuid();
  const authURL: string = spotify.createAuthorizeURL(SCOPES, state);
  console.log(`Please authorize default user at the following url:\n${authURL}`);

  return getRoutes(spotify);
}
