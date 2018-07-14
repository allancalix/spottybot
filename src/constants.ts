import fs from 'fs';
import os from 'os';

const config: any = process.env;

// Initialize application data and fail fast if required data is not provided
export const PORT: number = Number(config.port) || Number(process.env.PORT) || 3000;
export const SPOTIFY_AUTH_TOKEN: string | undefined = getToken()
export const SPOTIFY_CLIENT_ID: string = config.spotify_client_id ||
  throwMissingConfig('spotify_client_id');
export const SPOTIFY_CLIENT_SECRET: string = config.spotify_client_secret ||
  throwMissingConfig('spotify_client_secret');
export const SPOTIFY_REDIRECT_URI: string = config.spotify_redirect_uri ||
  throwMissingConfig('spotify_redirect_uri');
export const SLACK_AUTH_TOKEN: string = config.slack_token ||
  throwMissingConfig('slack_token');

// TODO: Allow the app to generate the playlist automatically every week
// DEPRECATE ME
export const PLAYLIST_ID: string = config.playlist_id ||
  throwMissingConfig('playlist_id');
export const ACCOUNT_UNAME: string = config.account_uname ||
  throwMissingConfig('account_uname');

function throwMissingConfig(key: string) {
  throw new Error(`Missing ${key} from config file.`);
}

function getToken() {
  const token_path = os.homedir() + '/.spottybot';

  if (fs.existsSync(token_path)) {
    const content = String(fs.readFileSync(token_path));
    return content.split('\n')[0];
  }
  return undefined;
}
