const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

export async function searchAlbums(query = '', page = 1) {
  if (!query) return { albummatches: { album: [] } };

  const params = new URLSearchParams({
    method: 'album.search',
    album: query,
    api_key: API_KEY,
    format: 'json',
    limit: 12,
    page: page
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();
  return data.results || { albummatches: { album: [] } };
}

export async function getTopAlbums(page = 1) {
  const params = new URLSearchParams({
    method: 'tag.gettopalbums',
    tag: 'all',
    api_key: API_KEY,
    format: 'json',
    limit: 24,
    page: page
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.message);
    }
    
    const albums = data.albums?.album || data.topalbums?.album || [];
    return { album: albums };
  } catch (error) {
    console.error('Error fetching top albums:', error);
    return { album: [] };
  }
}

export async function getAlbumInfo(artist, album) {
  const params = new URLSearchParams({
    method: 'album.getInfo',
    artist: artist,
    album: album,
    api_key: API_KEY,
    format: 'json'
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.message || 'Album not found');
  }
  
  return data.album;
}

export async function getArtistInfo(artist) {
  const response = await fetch(
    `${BASE_URL}?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`
  );
  const data = await response.json();
  console.log(data,"data")
  return data.artist;
}

export async function getArtistAlbums(artist) {
  const response = await fetch(
    `${BASE_URL}?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`
  );
  const data = await response.json();
  return data.topalbums.album;
}

export async function searchArtists(query = '', page = 1) {
  if (!query) return { results: { artistmatches: { artist: [] } } };

  const params = new URLSearchParams({
    method: 'artist.search',
    artist: query,
    api_key: API_KEY,
    format: 'json',
    limit: 24,
    page: page
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();
  return data;
}

export async function getTopArtists(page = 1) {
  const params = new URLSearchParams({
    method: 'chart.gettopartists',
    api_key: API_KEY,
    format: 'json',
    limit: 24,
    page: page
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();
  return data;
} 