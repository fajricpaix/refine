import MusicCards from "@components/ui/MusicCard";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

type ITunesSong = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  previewUrl?: string;
  primaryGenreName?: string;
};

type ITunesRssEntry = {
  id: {
    attributes: {
      "im:id": string;
    };
  };
  "im:name": { label: string };
  "im:artist": { label: string };
  "im:image": Array<{ label: string }>;
};

const Music: React.FC = () => {
  const [term, setTerm] = useState("");
  const [songs, setSongs] = useState<ITunesSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const [popularSongs, setPopularSongs] = useState<ITunesSong[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularError, setPopularError] = useState<string>();

  const mapRssEntryToSong = (entry: ITunesRssEntry): ITunesSong => {
    const image = entry["im:image"]?.slice(-1)[0]?.label;

    return {
      trackId: Number(entry.id.attributes["im:id"]),
      trackName: entry["im:name"].label,
      artistName: entry["im:artist"].label,
      artworkUrl100: image || "",
    };
  };

  const fetchPopularSongs = useCallback(async () => {
    setPopularError(undefined);
    setPopularLoading(true);
    setPopularSongs([]);

    try {
      const response = await fetch(
        "https://itunes.apple.com/us/rss/topsongs/limit=9/json"
      );
      const data = await response.json();
      const entries: ITunesRssEntry[] = data?.feed?.entry ?? [];
      setPopularSongs(entries.map(mapRssEntryToSong));
    } catch (err) {
      console.error("Failed to retrieve popular songs:", err);
      setPopularError("An error occurred while loading popular songs.");
    } finally {
      setPopularLoading(false);
    }
  }, []);

  const search = useCallback(async () => {
    if (!term.trim()) {
      setError("Enter keywords!");
      return;
    }

    setError(undefined);
    setLoading(true);
    setSongs([]);

    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song`
      );
      const data = await response.json();
      setSongs(data.results ?? []);
    } catch (err) {
      console.error("Failed to retrieve data:", err);
      setError("An error occurred while searching for songs.");
    } finally {
      setLoading(false);
    }
  }, [term]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularSongs();
  }, [fetchPopularSongs]);

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Music Library
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Search for songs using the iTunes Search API, or explore the current popular songs.
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Search songs"
          variant="outlined"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search();
            }
          }}
          size="small"
          sx={{ flex: 1, minWidth: 240 }}
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={search}
          disabled={loading}
        >
          Search Music
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {popularError && (
        <Typography color="error" mb={2}>
          {popularError}
        </Typography>
      )}

      {/* Only show popular songs when not actively searching */}
      {!term.trim() && (
        <>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Popular Songs
            </Typography>
          </Box>
          
          {popularLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {popularSongs.map((song) => (
                <MusicCards
                  key={`popular-${song.trackId}`}
                  onClick={() => navigate(`/music/${song.trackId}`, { state: { song } })}
                  trackId={song.trackId}
                  trackName={song.trackName}
                  artistName={song.artistName}
                  collectionName={song.collectionName}
                  image={song.artworkUrl100}
                />
              ))}
            </Grid>
          )}
        </>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {songs.map((song) => (
            <MusicCards
              key={song.trackId}
              onClick={() => navigate(`/music/${song.trackId}`, { state: { song } })}
              trackId={song.trackId}
              trackName={song.trackName}
              artistName={song.artistName}
              collectionName={song.collectionName}
              image={song.artworkUrl100}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Music;
