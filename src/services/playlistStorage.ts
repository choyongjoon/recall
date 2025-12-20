import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYLISTS_KEY = "playlists";
const LIKED_PHOTOS_KEY = "liked_photos";
const DISLIKED_PHOTOS_KEY = "disliked_photos";

export type Playlist = {
  id: string;
  name: string;
  photoIds: string[];
  createdAt: number;
  isDefault?: boolean;
};

export type PhotoReaction = "like" | "dislike" | null;

// Default playlist for liked photos
const DEFAULT_LIKED_PLAYLIST: Playlist = {
  id: "liked",
  name: "좋아요 표시한 사진",
  photoIds: [],
  createdAt: 0,
  isDefault: true,
};

// Playlists
export async function getPlaylists(): Promise<Playlist[]> {
  try {
    const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with default playlist
    await savePlaylists([DEFAULT_LIKED_PLAYLIST]);
    return [DEFAULT_LIKED_PLAYLIST];
  } catch (error) {
    console.error("Failed to get playlists:", error);
    return [DEFAULT_LIKED_PLAYLIST];
  }
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error("Failed to save playlists:", error);
  }
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const playlists = await getPlaylists();
  const newPlaylist: Playlist = {
    id: `playlist_${Date.now()}`,
    name,
    photoIds: [],
    createdAt: Date.now(),
  };
  playlists.push(newPlaylist);
  await savePlaylists(playlists);
  return newPlaylist;
}

export async function addPhotoToPlaylist(
  playlistId: string,
  photoId: string
): Promise<void> {
  const playlists = await getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  if (playlist && !playlist.photoIds.includes(photoId)) {
    playlist.photoIds.push(photoId);
    await savePlaylists(playlists);
  }
}

export async function removePhotoFromPlaylist(
  playlistId: string,
  photoId: string
): Promise<void> {
  const playlists = await getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  if (playlist) {
    playlist.photoIds = playlist.photoIds.filter((id) => id !== photoId);
    await savePlaylists(playlists);
  }
}

export async function isPhotoInPlaylist(
  playlistId: string,
  photoId: string
): Promise<boolean> {
  const playlists = await getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  return playlist?.photoIds.includes(photoId) ?? false;
}

export async function getPlaylistsForPhoto(photoId: string): Promise<string[]> {
  const playlists = await getPlaylists();
  return playlists.filter((p) => p.photoIds.includes(photoId)).map((p) => p.id);
}

// Like/Dislike reactions
export async function getPhotoReaction(
  photoId: string
): Promise<PhotoReaction> {
  try {
    const [likedData, dislikedData] = await Promise.all([
      AsyncStorage.getItem(LIKED_PHOTOS_KEY),
      AsyncStorage.getItem(DISLIKED_PHOTOS_KEY),
    ]);

    const likedPhotos: string[] = likedData ? JSON.parse(likedData) : [];
    const dislikedPhotos: string[] = dislikedData
      ? JSON.parse(dislikedData)
      : [];

    if (likedPhotos.includes(photoId)) {
      return "like";
    }
    if (dislikedPhotos.includes(photoId)) {
      return "dislike";
    }
    return null;
  } catch (error) {
    console.error("Failed to get photo reaction:", error);
    return null;
  }
}

export async function setPhotoReaction(
  photoId: string,
  reaction: PhotoReaction
): Promise<void> {
  try {
    const [likedData, dislikedData] = await Promise.all([
      AsyncStorage.getItem(LIKED_PHOTOS_KEY),
      AsyncStorage.getItem(DISLIKED_PHOTOS_KEY),
    ]);

    let likedPhotos: string[] = likedData ? JSON.parse(likedData) : [];
    let dislikedPhotos: string[] = dislikedData ? JSON.parse(dislikedData) : [];

    // Remove from both lists first
    likedPhotos = likedPhotos.filter((id) => id !== photoId);
    dislikedPhotos = dislikedPhotos.filter((id) => id !== photoId);

    // Add to appropriate list
    if (reaction === "like") {
      likedPhotos.push(photoId);
      // Also add to liked playlist
      await addPhotoToPlaylist("liked", photoId);
    } else if (reaction === "dislike") {
      dislikedPhotos.push(photoId);
      // Remove from liked playlist if disliked
      await removePhotoFromPlaylist("liked", photoId);
    } else {
      // If reaction is null, remove from liked playlist
      await removePhotoFromPlaylist("liked", photoId);
    }

    await Promise.all([
      AsyncStorage.setItem(LIKED_PHOTOS_KEY, JSON.stringify(likedPhotos)),
      AsyncStorage.setItem(DISLIKED_PHOTOS_KEY, JSON.stringify(dislikedPhotos)),
    ]);
  } catch (error) {
    console.error("Failed to set photo reaction:", error);
  }
}

// Get all liked photo IDs
export async function getLikedPhotoIds(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(LIKED_PHOTOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get liked photos:", error);
    return [];
  }
}
