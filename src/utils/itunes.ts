export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  year: number;
  duration: string;
  genre: string;
  plays: number;
  color: string;
};

export const GENRE_COLORS: Record<string, string> = {
  "Synthpop": "#7C3AED",
  "Trip Hop": "#0891B2",
  "Electronic": "#D97706",
  "Indie Rock": "#059669",
  "Indie Pop": "#DC2626",
  "Classical": "#7C3AED",
  "Folk": "#B45309",
  "Art Rock": "#1D4ED8",
  "Dream Pop": "#6D28D9",
};

const msToDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const parseItunesLibrary = (xmlText: string): Song[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const keyElements = Array.from(doc.getElementsByTagName("key"));
  const tracksKeyIndex = keyElements.findIndex((k) => k.textContent === "Tracks");
  const tracksDict = keyElements[tracksKeyIndex]?.nextElementSibling as Element | null;

  if (!tracksDict || tracksDict.tagName !== "dict") return [];

  const songs: Song[] = [];

  const entries = Array.from(tracksDict.children);
  for (let i = 0; i < entries.length; i += 2) {
    const idKey = entries[i];
    const dictEl = entries[i + 1];

    if (!idKey || !dictEl || idKey.tagName !== "key" || dictEl.tagName !== "dict") continue;

    const trackId = Number(idKey.textContent ?? "0");
    if (!trackId) continue;

    const dictEntries = Array.from(dictEl.children);
    const trackData: Record<string, string> = {};

    for (let j = 0; j < dictEntries.length; j += 2) {
      const keyNode = dictEntries[j];
      const valueNode = dictEntries[j + 1];
      if (!keyNode || !valueNode) continue;
      trackData[keyNode.textContent ?? ""] = valueNode.textContent ?? "";
    }

    const dateAdded = trackData["Date Added"];
    const year = dateAdded ? new Date(dateAdded).getFullYear() : 0;

    const totalTime = Number(trackData["Total Time"] || "0");

    songs.push({
      id: trackId,
      title: trackData["Name"] || "",
      artist: trackData["Artist"] || "",
      album: trackData["Album"] || "",
      year,
      duration: msToDuration(totalTime),
      genre: trackData["Genre"] || "",
      plays: Number(trackData["Play Count"] || "0"),
      color: GENRE_COLORS[trackData["Genre"] || ""] ?? "#7C3AED",
    });
  }

  return songs;
};
