const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configura tus credenciales de Spotify
const clientId = 'b95fec1cc13540be97a948f29fd429e9';
const clientSecret = '47bdbb761c5048fba239d40798b6c84e';

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

// Autenticación
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token is ' + data.body['access_token']);
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);

app.post('/convert', async (req, res) => {
  const playlistLink = req.body.link;

  // Extraer ID de la playlist del link
  const playlistId = extractPlaylistId(playlistLink);

  if (!playlistId) {
    return res.status(400).json({ error: 'Invalid playlist link' });
  }

  try {
    // Obtener detalles de la playlist
    const data = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks = data.body.items;

    // Crear lista de canciones
    const trackList = tracks.map(track => {
      const song = track.track.name;
      const artists = track.track.artists.map(artist => artist.name).join(', ');
      return `${song} - ${artists}`;
    });

    res.json(trackList);
  } catch (err) {
    console.error('Error fetching playlist tracks:', err);
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
});

function extractPlaylistId(link) {
  const match = link.match(/playlist\/(\w+)/);
  return match ? match[1] : null;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
