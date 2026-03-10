import { DataProvider } from "@refinedev/core";

// ============================================================
// iTunes XML Parser & Custom Data Provider
// ============================================================
// Gunakan ini sebagai pengganti REST API jika membaca file XML
// langsung dari filesystem (misalnya via Electron / Node backend)

export interface iTunesTrack {
  id: number;
  trackId: number;
  name: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  playCount: number;
  rating: number;
  dateAdded: string;
  location?: string;
  albumArt?: string;
}

// Parse iTunes plist XML string → array of tracks
export function parseiTunesXML(xmlString: string): iTunesTrack[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  // iTunes library XML: plist > dict > dict (Tracks) > dict (per track)
  const rootDict = doc.querySelector("plist > dict");
  if (!rootDict) return [];

  const children = Array.from(rootDict.children);
  let tracksDict: Element | null = null;

  for (let i = 0; i < children.length; i++) {
    if (children[i].tagName === "key" && children[i].textContent === "Tracks") {
      tracksDict = children[i + 1] as Element;
      break;
    }
  }

  if (!tracksDict) return [];

  const trackEntries = Array.from(tracksDict.children);
  const tracks: iTunesTrack[] = [];

  for (let i = 0; i < trackEntries.length; i += 2) {
    const trackDict = trackEntries[i + 1];
    if (!trackDict) continue;

    const trackChildren = Array.from(trackDict.children);
    const trackData: Record<string, string> = {};

    for (let j = 0; j < trackChildren.length; j += 2) {
      const key = trackChildren[j]?.textContent ?? "";
      const val = trackChildren[j + 1]?.textContent ?? "";
      trackData[key] = val;
    }

    tracks.push({
      id: parseInt(trackData["Track ID"] ?? "0"),
      trackId: parseInt(trackData["Track ID"] ?? "0"),
      name: trackData["Name"] ?? "Unknown",
      artist: trackData["Artist"] ?? "Unknown Artist",
      album: trackData["Album"] ?? "Unknown Album",
      genre: trackData["Genre"] ?? "Other",
      duration: parseInt(trackData["Total Time"] ?? "0"),
      playCount: parseInt(trackData["Play Count"] ?? "0"),
      rating: parseInt(trackData["Rating"] ?? "0"),
      dateAdded: trackData["Date Added"] ?? "",
      location: trackData["Location"],
    });
  }

  return tracks;
}

// In-memory data provider dari array lokal (setelah parse XML)
export function createiTunesDataProvider(tracks: iTunesTrack[]): Partial<DataProvider> {
  // Buat lookup per resource
  const artistMap = new Map<string, { id: number; name: string; trackCount: number; albumCount: number; genre: string }>();
  const albumMap = new Map<string, { id: number; title: string; artist: string; year: number; trackCount: number; genre: string }>();

  tracks.forEach((t, i) => {
    // Artists
    if (!artistMap.has(t.artist)) {
      artistMap.set(t.artist, { id: i + 1000, name: t.artist, trackCount: 0, albumCount: 0, genre: t.genre });
    }
    const artist = artistMap.get(t.artist)!;
    artist.trackCount++;

    // Albums
    const albumKey = `${t.album}||${t.artist}`;
    if (!albumMap.has(albumKey)) {
      albumMap.set(albumKey, {
        id: albumMap.size + 2000,
        title: t.album,
        artist: t.artist,
        year: t.dateAdded ? new Date(t.dateAdded).getFullYear() : 0,
        trackCount: 0,
        genre: t.genre,
      });
      artist.albumCount++;
    }
    albumMap.get(albumKey)!.trackCount++;
  });

  const artists = Array.from(artistMap.values());
  const albums = Array.from(albumMap.values());

  return {
    getList: async ({ resource, pagination, sorters }) => {
      let data: any[] = resource === "tracks" ? tracks : resource === "artists" ? artists : albums;

      // Sorting sederhana
      if (sorters && sorters.length > 0) {
        const { field, order } = sorters[0];
        data = [...data].sort((a, b) => {
          const aVal = a[field] ?? 0;
          const bVal = b[field] ?? 0;
          return order === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
      }

      const page = (pagination as any)?.current ?? pagination?.currentPage ?? 1;
      const ps = pagination?.pageSize ?? 20;
      const start = (page - 1) * ps;

      return {
        data: data.slice(start, start + ps),
        total: data.length,
      };
    },

    getOne: async ({ resource, id }) => {
      const list = resource === "tracks" ? tracks : resource === "artists" ? artists : albums;
      const item = list.find((x: any) => String(x.id) === String(id));
      return { data: item ?? {} };
    },
  } as Partial<DataProvider>;
}