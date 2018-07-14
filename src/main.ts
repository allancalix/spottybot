import Spotify from 'spotify-web-api-node';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { PORT } from './constants';
import * as slack from './slack';
import * as spotify from './spotify';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

async function serveSlackRoutes(spotify: any) {
  const slackRouter = await slack.serve(spotify);
  app.use('/slack', slackRouter);
}

function main() {
  const routes = spotify.authenticate(serveSlackRoutes);
  app.use('/spotify', routes);
  app.listen(PORT, () => { console.log(`Started on port ${PORT}`) });
}

main();
