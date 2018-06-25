import { PLAYLIST_ID, ACCOUNT_UNAME } from './constants';

export function addSong(spotify: any, trackURIs: string[]): Promise<any> {
  const playlistID: string = PLAYLIST_ID;
  const uname: string = ACCOUNT_UNAME;

  return new Promise((resolve, reject) => {
    console.log(trackURIs);
    spotify.addTracksToPlaylist(uname, playlistID, trackURIs)
      .then((res: any) => {
        if (res.statusCode !== 201) {
          reject(new Error('Failed to add song to playlist.'));
        }
        resolve();
      })
      .catch(reject);
  });
}
