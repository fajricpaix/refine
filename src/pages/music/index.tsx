import {
  Favorite,
  FavoriteBorder,
  GraphicEq,
  MusicNote,
  Pause,
  PlayArrow,
  Search,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  InputBase,
  LinearProgress,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { Song, parseItunesLibrary } from "../../utils/itunes";

const SONGS_API_PATH = "/api/itunes-library";

const SORT_OPTIONS = ["title", "artist", "plays", "year"] as const;
type SortKey = typeof SORT_OPTIONS[number];

function AlbumAvatar({ color, size = 40, spinning = false }: { color: string; size?: number; spinning?: boolean }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: "transparent",
        background: `linear-gradient(135deg, ${color}cc, ${color}44)`,
        boxShadow: `0 4px 16px ${color}55`,
        flexShrink: 0,
        borderRadius: size > 60 ? "12px" : "8px",
        animation: spinning ? "spin 4s linear infinite" : "none",
        "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      }}
    >
      <MusicNote sx={{ fontSize: size * 0.4, color: "rgba(255,255,255,0.8)" }} />
    </Avatar>
  );
}

export default function Music() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(37);
  const [volume, setVolume] = useState(78);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("title");
  const [loved, setLoved] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(SONGS_API_PATH)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parseItunesLibrary(text);
        setSongs(parsed);
        setCurrentSong(parsed[0] ?? null);
        setLoved(new Set(parsed.slice(0, 8).map((s) => s.id)));
      })
      .catch((err) => console.error("Failed to load iTunes library:", err));
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.25));
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const filtered = songs
    .filter(
      (s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase()) ||
        s.album.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "plays") return b.plays - a.plays;
      if (sortBy === "year") return b.year - a.year;
      return String(a[sortBy]).localeCompare(String(b[sortBy]));
    });

  const toggleLove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const playNext = () => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    setCurrentSong(songs[(idx + 1) % songs.length]);
    setProgress(0);
  };

  const playPrev = () => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    setCurrentSong(songs[(idx - 1 + songs.length) % songs.length]);
    setProgress(0);
  };

  if (!currentSong) {
    return (
      <Box sx={{ display: "flex", height: "100vh", color: "#E2E2E8", justifyContent: "center", alignItems: "center" }}>
        <Typography>Loading iTunes library…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", color: "#E2E2E8", overflow: "hidden" }}>

      {/* ── Main Content ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header / Now Playing Bar */}
        <Box
          sx={{
            px: 3, py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#E2E2E8", letterSpacing: "-0.03em", lineHeight: 1 }}>
                Music Library
              </Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                Apple iTunes
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconButton onClick={playPrev} size="small" sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#E2E2E8" } }}>
                  <SkipPrevious />
                </IconButton>
                <IconButton
                  onClick={() => setPlaying((p) => !p)}
                  sx={{
                    width: 36, height: 36,
                    bgcolor: "#fff",
                    color: "#d60000",
                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.6)",
                    "&:hover": { bgcolor: "#fff" },
                  }}
                >
                  {playing ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                </IconButton>
                <IconButton onClick={playNext} size="small" sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#E2E2E8" } }}>
                  <SkipNext />
                </IconButton>

                <Box sx={{ minWidth: 180, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{currentSong.title}</Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{currentSong.artist}</Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 200 }}>
                  <Typography sx={{ fontSize: 9, fontFamily: "monospace", color: "white", width: 30, textAlign: "right" }}>
                    {Math.floor(progress * 0.03)}:{String(Math.floor((progress * 1.8) % 60)).padStart(2, "0")}
                  </Typography>
                  <Box
                    sx={{ flex: 1, cursor: "pointer" }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setProgress(((e.clientX - rect.left) / rect.width) * 100);
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 3, borderRadius: 2,
                        bgcolor: "rgba(255,255,255,0.3)",
                        "& .MuiLinearProgress-bar": { bgcolor: "#ffffff", borderRadius: 2 },
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", width: 30 }}>
                    {currentSong.duration}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Volume */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <VolumeUp sx={{ fontSize: 16, color: "white" }} />
              <Box
                sx={{ width: 80, cursor: "pointer" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={volume}
                  sx={{
                    height: 3, borderRadius: 2,
                    bgcolor: "white",
                    "& .MuiLinearProgress-bar": { bgcolor: "rgba(255,255,255,0.4)", borderRadius: 2 },
                  }}
                />
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Toolbar */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 3, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2,
              px: 1.5, py: 0.5, border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Search sx={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }} />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs, artists…"
              sx={{ color: "#E2E2E8", fontSize: 12, width: 200, "& input::placeholder": { color: "rgba(255,255,255,0.3)" } }}
            />
          </Box>

          <Stack direction="row" spacing={0.5}>
            {SORT_OPTIONS.map((s) => (
              <Chip
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                size="small"
                onClick={() => setSortBy(s)}
                sx={{
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  bgcolor: sortBy === s ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                  color: sortBy === s ? "#A78BFA" : "rgba(255,255,255,0.4)",
                  border: `1px solid ${sortBy === s ? "rgba(139,92,246,0.4)" : "transparent"}`,
                  "&:hover": { bgcolor: sortBy === s ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.08)" },
                }}
              />
            ))}
          </Stack>

          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", ml: "auto !important" }}>
            {filtered.length} songs
          </Typography>
        </Stack>

        {/* Column Headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 1fr 1fr 64px 64px 40px",
            gap: 1, px: 3, py: 1,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {["#", "Title", "Artist", "Album", "Plays", "Time", ""].map((h) => (
            <Typography key={h} sx={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
              {h}
            </Typography>
          ))}
        </Box>

        {/* Song List */}
        <Box sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 } }}>
          {filtered.map((song, idx) => {
            const isActive = song.id === currentSong.id;
            return (
              <Box
                key={song.id}
                onClick={() => { setCurrentSong(song); setProgress(0); setPlaying(true); }}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr 1fr 1fr 64px 64px 40px",
                  gap: 1, px: 3, py: 1,
                  alignItems: "center",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.025)",
                  bgcolor: isActive ? "rgba(139,92,246,0.1)" : "transparent",
                  transition: "background 0.15s",
                  "&:hover": { bgcolor: isActive ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)" },
                }}
              >
                {/* # */}
                <Typography sx={{ fontSize: 11, fontFamily: "monospace", color: isActive ? "#A78BFA" : "rgba(255,255,255,0.25)", textAlign: "center" }}>
                  {isActive && playing ? <GraphicEq sx={{ fontSize: 14, verticalAlign: "middle", color: "#A78BFA" }} /> : idx + 1}
                </Typography>

                {/* Title + Album Art */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ overflow: "hidden" }}>
                  <AlbumAvatar color={song.color} size={36} spinning={isActive && playing} />
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: isActive ? "#A78BFA" : "#E2E2E8" }}>
                      {song.title}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                      {song.genre}
                    </Typography>
                  </Box>
                </Stack>

                {/* Artist */}
                <Typography noWrap sx={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{song.artist}</Typography>

                {/* Album */}
                <Typography noWrap sx={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{song.album}</Typography>

                {/* Plays */}
                <Typography sx={{
                  fontSize: 11, fontFamily: "monospace", textAlign: "center",
                  color: song.plays > 300 ? "#A78BFA" : "rgba(255,255,255,0.3)",
                  fontWeight: song.plays > 300 ? 700 : 400,
                }}>
                  {song.plays}
                </Typography>

                {/* Duration */}
                <Typography sx={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>
                  {song.duration}
                </Typography>

                {/* Love */}
                <Tooltip title={loved.has(song.id) ? "Remove from Loved" : "Add to Loved"}>
                  <IconButton size="small" onClick={(e) => toggleLove(song.id, e)} sx={{ color: loved.has(song.id) ? "#EC4899" : "rgba(255,255,255,0.15)", "&:hover": { color: "#EC4899" } }}>
                    {loved.has(song.id) ? <Favorite sx={{ fontSize: 14 }} /> : <FavoriteBorder sx={{ fontSize: 14 }} />}
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}