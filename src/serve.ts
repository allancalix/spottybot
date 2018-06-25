import { Request, Response } from 'express';
import { WebClient } from '@slack/client';

import * as commands from './commands';
import { SLACK_AUTH_TOKEN, PLAYLIST_ID, ACCOUNT_UNAME } from './constants';

const slack = new WebClient(SLACK_AUTH_TOKEN);
const ADD_TRACK_TIMEOUT: number = 1000 * 60 * 5;
const EVENT_TIMEOUT: number = 1000 * 60 * 3;

/*
 * Slack API sends duplicate events causing tracks to be added multiple times
 * to playlists. This is used to timeout adding the same song for 5 minutes.
 * Can probably just prevent songs from EVER being added more than once.
 */
const timeoutList = new Set();

// TODO: Remove this, here because slack events API returns multiple mention events
let helpTimeout: any;
let playlistTimeout: any;

interface SlackMention {
  channel: string,
  user: string,
  text: string,
};

interface SlackLink {
  url: string,
  domain: string,
};

interface SlackLinkPosted {
  channel: string,
  user: string,
  message_ts: string,
  links: SlackLink[],
};

interface SlackResponse {
  channel: string,
  text: string,
  thread_ts?: string,
};

const HELP_MESSAGE: string = `
  Hello! I am Spottybot. I fetch music from chat and turn it into a weekly
  playlist :musical_score:. Just share a Spotify link and I'll take care of the rest!

  For a link to the weeks playlist, just hollar at me \`@SpottyBot gimmie playlist\`.

  Happy listening!
`;

/*
 * @param: app - running express module
 * @param: spotify - authenticated spotify session
 */
export async function serve(app: any, spotify: any) {
  console.log("Spottybot activated!");
  let playlistURL: string;
  try {
    const res: any = await spotify.getPlaylist(ACCOUNT_UNAME, PLAYLIST_ID);
    playlistURL = res.body.external_urls.spotify;
  } catch (e) {
    throw new Error("Could not retrieve playlist URL");
  }

  app.post('/slack', (req: Request, res: Response) => {
    interface Link {
      url: string,
      domain: string,
    };

    const addSongsByTrackID = (spotify: any) => (links: string[]) => {
      const trackIDs = parseValidTrackIds(links);
      const trackURIs = trackIDs
        .map((id: string) => `spotify:track:${id}`);

      return commands.addSong(spotify, trackURIs);
    }

    // This is a response required to validate connection to slack
    if (req.body.challenge) {
      return res.send(req.body.challenge);
    }
    const event = req.body.event;
    const requestTimestamp: number = event.message_ts || event.event_ts;
    const age = (Date.now() - Math.floor(requestTimestamp * 1000)) / 1000 / 60;
    // Age out events that are more than 3 minutes old
    if (Math.floor(age) > 3) {
      return;
    }

    switch(event.type) {
      case 'app_mention':
        executeMentionActions(event, playlistURL);
        break;

      case 'link_shared':
        const validLinks: string[] = event.links
          .filter((link: Link) => link.domain === 'spotify.com')
          .map((link: Link) => link.url)
          .filter((link: string) => !timeoutList.has(link));

        if (validLinks.length < 1) {
          return;
        }

        validLinks.forEach((link: string) => timeoutList.add(link));

        addSongsByTrackID(spotify)(validLinks)
          .then(() => {
            setTimeout(
              () => validLinks.forEach((link) => timeoutList.delete(link)),
              ADD_TRACK_TIMEOUT
            );
            slack.chat.postMessage({
              'channel': event.channel,
              'thread_ts': event.message_ts,
              'text': 'Added this song to the weekly mix :thumbsup:',
            });
          }).catch((err) => {
            validLinks.forEach((link: string) => timeoutList.delete(link));
            console.log(err);
          });
        break;

      default:
        break;
    }
  });
}

function executeMentionActions(req: SlackMention, playlistURL: string) {
  const text = req.text.toLowerCase();

  if (text.search('help') > -1) {
    if (helpTimeout) {
      return;
    }
    slack.chat.postMessage({
      channel: req.channel,
      text: HELP_MESSAGE,
    });
    helpTimeout = setTimeout(() => helpTimeout = null, EVENT_TIMEOUT);
  } else if (text.search('playlist') > -1) {
    if (playlistTimeout) {
      return;
    }
    slack.chat.postMessage({
      channel: req.channel,
      text: `Checkout the current jams at ${playlistURL}`,
    });
    playlistTimeout = setTimeout(() => playlistTimeout = null, EVENT_TIMEOUT);
  }
}

/*
 * Searches shared Spotify links for only those corresponding to tracks and
 * returns their ids.
 *
 * @param: links string[] - an array of spotify.com links
 * @return string[] - an array of track IDs for only links which correspond to tracks
 */
function parseValidTrackIds(links: string[]): string[] {
  const matchPattern = /(?<=spotify.com\/track\/)[\w\d]+/;
  return links
    .map((link: string) => link.match(matchPattern))
    .filter((link: any) => Boolean(link))
    .map(([trackID, ...args]: any) => trackID);
}
