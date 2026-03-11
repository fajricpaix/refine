import MusicCards from "@components/ui/MusicCard";
import { SmartCardMedia } from "@components/ui/SmartCardMedia";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

type ITunesSong = {
  trackId: number;
  trackName: string;
  trackAmount?: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  previewUrl?: string;
  primaryGenreName?: string;
  trackTimeMillis?: number;
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
  "im:price"?: { label: string };
};

const Music: React.FC = () => {
  const [term, setTerm] = useState("");
  const [songs, setSongs] = useState<ITunesSong[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const [popularSongs, setPopularSongs] = useState<ITunesSong[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularError, setPopularError] = useState<string>();

  const mapRssEntryToSong = (entry: ITunesRssEntry): ITunesSong => {
    const image = entry["im:image"]?.slice(-1)[0]?.label;

    return {
      trackId: Number(entry.id.attributes["im:id"]),
      trackAmount: entry["im:price"]?.label,
      trackName: entry["im:name"].label,
      artistName: entry["im:artist"].label,
      artworkUrl100: image || "",
    };
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "-";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatPriceToRupiah = (price?: string) => {
    if (!price) return "-";

    const normalizedPrice = price.trim();
    if (!normalizedPrice) return "-";

    if (normalizedPrice.toLowerCase() === "gratis" || normalizedPrice.toLowerCase() === "free") {
      return "Gratis";
    }

    if (normalizedPrice.includes("Rp")) {
      return normalizedPrice;
    }

    if (normalizedPrice.toUpperCase().includes("IDR")) {
      const numberPart = normalizedPrice
        .replace(/IDR/gi, "")
        .replace(/[^\d.,]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

      const parsedValue = Number(numberPart);
      if (Number.isFinite(parsedValue)) {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(parsedValue);
      }
    }

    return normalizedPrice;
  };

  const renderEllipsisCell = (value: string | number) => {
    const content = String(value || "-");

    return (
      <Tooltip title={content} arrow>
        <Typography
          variant="body2"
          noWrap
          sx={{
            display: "block",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {content}
        </Typography>
      </Tooltip>
    );
  };

  const fetchPopularSongs = useCallback(async () => {
    setPopularError(undefined);
    setPopularLoading(true);
    setPopularSongs([]);

    try {
      const response = await fetch(
        "https://itunes.apple.com/id/rss/topsongs/limit=50/json"
      );
      const data = await response.json();
      const entries: ITunesRssEntry[] = data?.feed?.entry ?? [];

      const baseSongs = entries.map(mapRssEntryToSong);
      if (!baseSongs.length) {
        setPopularSongs([]);
        return;
      }

      const ids = baseSongs.map((song) => song.trackId).join(",");
      const detailResponse = await fetch(
        `https://itunes.apple.com/lookup?id=${encodeURIComponent(ids)}&entity=song`
      );
      const detailData = await detailResponse.json();
      const detailResults = detailData?.results ?? [];

      const detailsByTrackId = new Map<number, Partial<ITunesSong> & { trackPrice?: number; currency?: string; formattedPrice?: string }>();
      for (const detail of detailResults) {
        if (detail.trackId) {
          detailsByTrackId.set(Number(detail.trackId), detail);
        }
      }

      const enrichedSongs = baseSongs.map((song) => {
        const detail = detailsByTrackId.get(song.trackId);
        const formattedPrice = song.trackAmount
          ?? detail?.formattedPrice
          ?? (typeof detail?.trackPrice === "number" && detail?.currency
            ? `${detail.trackPrice} ${detail.currency}`
            : undefined);

        return {
          ...song,
          trackAmount: formattedPrice,
          collectionName: detail?.collectionName ?? song.collectionName,
          trackTimeMillis: detail?.trackTimeMillis,
          previewUrl: detail?.previewUrl,
          primaryGenreName: detail?.primaryGenreName,
          artworkUrl100: detail?.artworkUrl100 ?? song.artworkUrl100,
        };
      });

      setPopularSongs(enrichedSongs);
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
      setIsSearched(false);
      return;
    }

    setIsSearched(true);
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

  const topThreeSongs = popularSongs.slice(0, 3);
  const rankedTableSongs = popularSongs.slice(3);

  const trophyColorByRank: Record<number, "warning" | "action" | "secondary"> = {
    1: "warning",
    2: "action",
    3: "secondary",
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Music Library
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Search for songs using the iTunes Search API, or explore the current popular songs.
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <TextField
              label="Search songs"
              variant="standard"
              value={term}
              onChange={(e) => {
                const value = e.target.value;
                setTerm(value);

                if (!value.trim()) {
                  setIsSearched(false);
                  setSongs([]);
                  setError(undefined);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  search();
                }
              }}
              size="small"
              sx={{ flex: 1, minWidth: 240, width: "100%" }}
              slotProps={{
                input: {
                  endAdornment: <SearchIcon sx={{ mr: 1, mb:1 }} />,
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>

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

      {/* Only show popular songs when search mode is not active */}
      {!isSearched && !term.trim() && (
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
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {topThreeSongs.map((song, index) => {
                  const rank = index + 1;

                  return (
                    <Grid key={`popular-top-${song.trackId}`} size={{ xs: 12, md: 4 }}>
                      <Card>
                        <CardActionArea onClick={() => navigate(`/music/${song.trackId}`, { state: { song } })}>
                            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                              <EmojiEventsIcon sx={{ fontSize: 48 }} color={trophyColorByRank[rank]} />
                              <Typography variant="subtitle1" fontWeight={700}>
                              #{rank}
                              </Typography>
                            </Box>

                            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                              <Box width={100} height={100}>
                              <SmartCardMedia
                                src={song.artworkUrl100}
                                alt={song.trackName}
                                ratio="1/1"
                                blurUp
                                />
                              </Box>
                              <Box display="flex" flexDirection="column" justifyContent="center" sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle1" fontWeight={700} noWrap>
                                {song.trackName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {song.artistName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {song.collectionName || "-"}
                              </Typography>                                  
                              </Box>
                            </Box>

                            </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              <TableContainer>
                <Table size="medium" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell width={48} sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell width={240} sx={{ fontWeight: 700 }}>Judul Lagu</TableCell>
                      <TableCell width={100} sx={{ fontWeight: 700 }}>Harga</TableCell>
                      <TableCell width={180} sx={{ fontWeight: 700 }}>Artis</TableCell>
                      <TableCell width={200} sx={{ fontWeight: 700 }}>Album</TableCell>
                      <TableCell width={100} sx={{ fontWeight: 700 }}>Durasi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rankedTableSongs.map((song, index) => (
                      <TableRow
                        key={`popular-row-${song.trackId}`}
                        hover
                        sx={{
                          cursor: "pointer",
                          bgcolor: index % 2 === 0 ? "background.default" : "action.hover",
                        }}
                        onClick={() => navigate(`/music/${song.trackId}`, { state: { song } })}
                      >
                        <TableCell>{renderEllipsisCell(index + 4)}</TableCell>
                        <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box width={20} height={20}>
                            <SmartCardMedia
                              src={song.artworkUrl100}
                              alt={song.trackName}
                              ratio="1/1"
                            />
                          </Box>
                          {renderEllipsisCell(song.trackName)}
                        </TableCell>
                        <TableCell>{renderEllipsisCell(formatPriceToRupiah(song.trackAmount))}</TableCell>
                        <TableCell>{renderEllipsisCell(song.artistName)}</TableCell>
                        <TableCell>{renderEllipsisCell(song.collectionName || "-")}</TableCell>
                        <TableCell>{renderEllipsisCell(formatDuration(song.trackTimeMillis))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
          
        </>
      )}

      {/* Show  */}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : isSearched ? (
        <Grid container spacing={3}>
          {songs.map((song) => (
            <MusicCards
              key={song.trackId}
              onClick={() => navigate(`/music/${song.trackId}`, { state: { song } })}
              trackAmount={song.trackAmount}
              trackId={song.trackId}
              trackName={song.trackName}
              artistName={song.artistName}
              collectionName={song.collectionName}
              image={song.artworkUrl100}
            />
          ))}
        </Grid>
      ) : null}
    </Box>
  );
};

export default Music;
