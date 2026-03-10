import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type ITunesSong = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  previewUrl?: string;
  primaryGenreName?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
};

const MusicDetail: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialSong = useMemo(() => {
    const state = location.state as { song?: ITunesSong } | null;
    return state?.song;
  }, [location.state]);

  const [song, setSong] = useState<ITunesSong | undefined>(initialSong);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (song || !trackId) {
      return;
    }

    const fetchSong = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch(
          `https://itunes.apple.com/lookup?id=${encodeURIComponent(trackId)}`
        );
        const data = await response.json();
        const found = (data.results ?? [])[0];
        setSong(found);
      } catch (err) {
        console.error("Failed to retrieve track details:", err);
        setError("Failed to load track details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [trackId, song]);

  const duration = (ms?: number) => {
    if (!ms) return "";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !song ? (
        <Typography color="text.secondary">No track found.</Typography>
      ) : (
        <Card sx={{ maxWidth: 900, }}>
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }}>
            <CardMedia
              component="img"
              image={song.artworkUrl100}
              alt={song.trackName}
              sx={{ width: { xs: "100%", md: 320 }, height: 320 }}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {song.trackName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {song.artistName}
              </Typography>
              {song.collectionName && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Album: {song.collectionName}
                </Typography>
              )}
              {song.primaryGenreName && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Genre: {song.primaryGenreName}
                </Typography>
              )}
              {song.releaseDate && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Released: {new Date(song.releaseDate).toLocaleDateString()}
                </Typography>
              )}
              {song.trackTimeMillis && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration: {duration(song.trackTimeMillis)}
                </Typography>
              )}

              {song.previewUrl && (
                <Box mt={3}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Preview
                  </Typography>
                  <audio style={{ width: "100%" }} controls src={song.previewUrl} />
                </Box>
              )}
            </CardContent>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default MusicDetail;
