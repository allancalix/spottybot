# SpottyBot

_Collaborate on a weekly playlist with friends_

# What does it do?
SpottyBot monitors a slack channel shared Spotify links and adds them to a specified playlist. If successfully added, it will respond to messages including a Spotify link letting users know their track was added.

## Commands

`@SpottyBot playlist`

_Mentioning SpottyBot with the word playlist will post a link to the shared playlist_

`@SpottyBot help`

_Mentioning SpottyBot with the word help will let the users know how it works!_

# Use
```
git clone https://github.com/allancalix/spottybot.git && npm i
npm build && node dist/main.js
```

# Configuring
__Configuration file `spottybot.json` should exist in the project root directory.__
```
{
  // Desired Port
  "port": 80,
  // Slack Token for authenticating SpottyBot
  "slack_token": "XXXXXXXXXX-XXXXXXXXXXXXXXX-XXXXXXXXXXXXXXX-XXXXXXXXXXx",
  // Location used for Spotify OAUTH
  "spotify_redirect_uri": "http://myhost/callback",
  // Spotify API client ID
  "spotify_client_id": "XXXXXXXXXXXXXXXXXXXXXXXX",
  // Spotify API client secret
  "spotify_client_secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  // ID of Spotify playlist to share
  "playlist_id": "XXXXXXXXXXXXXXXXXXX",
  // Spotify account username
  "account_uname": "SpotifyUser"
}
```