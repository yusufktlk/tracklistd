const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const BASE_API_URL = 'https://api.spotify.com/v1';

export const spotifyAuth = {
  authorize: () => {
    const scope = [
      'user-library-read',
      'user-read-recently-played',
      'user-top-read',
      'playlist-read-private',
      'user-read-email',
      'user-read-private',
      'user-follow-read'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope,
      show_dialog: true,
      state: Math.random().toString(36).substring(7) // Güvenlik için state ekleyelim
    });

    const authorizeUrl = `https://accounts.spotify.com/authorize?${params}`;
    console.log('ENV Variables:', {
      clientId: SPOTIFY_CLIENT_ID,
      redirectUri: REDIRECT_URI
    });
    console.log('Spotify Auth URL:', authorizeUrl);
    window.location.href = authorizeUrl;
  },

  getToken: async (code) => {
    console.log('Getting token with code:', code);
    
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
        },
        body: new URLSearchParams({
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token error:', errorData);
        throw new Error(errorData.error_description || 'Failed to get token');
      }

      const data = await response.json();
      console.log('Token response:', data);
      return data;
    } catch (error) {
      console.error('Token request failed:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken) => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    return response.json();
  }
};

export const spotifyApi = {
  // Kullanıcı Kütüphanesi
  getSavedAlbums: async (accessToken, offset = 0) => {
    try {
      const response = await fetch(`${BASE_API_URL}/me/albums?limit=50&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const data = await response.json();
      console.log('Saved albums response:', data);
      
      // Tüm albümleri almak için recursive çağrı
      if (data.next && offset < 1000) {
        const nextData = await spotifyApi.getSavedAlbums(accessToken, offset + 50);
        data.items = [...data.items, ...nextData.items];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching saved albums:', error);
      throw error;
    }
  },

  getRecentlyPlayed: async (accessToken) => {
    try {
      const response = await fetch(`${BASE_API_URL}/me/player/recently-played?limit=50`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const data = await response.json();
      console.log('Recently played response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching recently played:', error);
      throw error;
    }
  },

  // Kullanıcı Profili
  getUserProfile: async (accessToken) => {
    const response = await fetch(`${BASE_API_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.json();
  },

  getTopArtists: async (accessToken) => {
    try {
      const response = await fetch(`${BASE_API_URL}/me/top/artists?limit=50&time_range=long_term`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const data = await response.json();
      console.log('Top artists response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching top artists:', error);
      throw error;
    }
  },

  // Playlist ve Takip
  getPlaylists: async (accessToken) => {
    const response = await fetch(`${BASE_API_URL}/me/playlists?limit=50`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.json();
  },

  getFollowedArtists: async (accessToken) => {
    const response = await fetch(`${BASE_API_URL}/me/following?type=artist`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.json();
  },

  // Yeni eklenen metodlar
  getPlaylistTracks: async (accessToken, playlistId) => {
    const response = await fetch(`${BASE_API_URL}/playlists/${playlistId}/tracks`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.json();
  },

  searchArtist: async (accessToken, artistName) => {
    try {
      const response = await fetch(
        `${BASE_API_URL}/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const data = await response.json();
      const exactMatch = data.artists.items.find(
        artist => artist.name.toLowerCase() === artistName.toLowerCase()
      );
      return exactMatch || data.artists.items[0] || null;
    } catch (error) {
      console.error('Error searching artist:', error);
      return null;
    }
  }
}; 