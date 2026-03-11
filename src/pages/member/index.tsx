import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

type MemberLocation = {
  city?: string;
  country?: string;
};

type MemberUser = {
  userid?: string;
  username?: string;
  password?: string;
};

export type Member = {
  id: number;
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  location?: MemberLocation;
  user?: MemberUser;
  email?: string;
  Phone?: string;
  avatar?: string;
  age?: number;
};

const formatGender = (gender?: string) => {
  if (!gender) return "-";
  return gender.toLowerCase() === "female" ? "F" : "M";
};

const formatDateOfBirth = (dateOfBirth?: string) => {
  if (!dateOfBirth) return "-";

  const [day, month, year] = dateOfBirth.split("/").map((part) => Number(part));
  if (!day || !month || !year) return dateOfBirth;

  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatLocation = (location?: MemberLocation) => {
  const city = location?.city?.trim();
  const country = location?.country?.trim();
  if (city && country) return `${city} - ${country}`;
  return city || country || "-";
};

const getFullName = (member: Member) => `${member.first_name || ""} ${member.last_name || ""}`.trim() || "-";

const INITIAL_VISIBLE_COUNT = 20;
const LOAD_MORE_COUNT = 10;

export const MemberManagement = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch("/api/dummy-users/users");
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : []);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        setError("Gagal memuat data member.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.id - b.id),
    [members],
  );

  const displayedMembers = useMemo(
    () => sortedMembers.slice(0, visibleCount),
    [sortedMembers, visibleCount],
  );

  const hasMoreData = displayedMembers.length < sortedMembers.length;

  const handleTableScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (!hasMoreData) return;

    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const reachedBottom = scrollTop + clientHeight >= scrollHeight - 16;

    if (reachedBottom) {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, sortedMembers.length));
    }
  }, [hasMoreData, sortedMembers.length]);

  return (
    <Stack spacing={4} px={4} pt={4}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Member Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage member data registered in the system.
          </Typography>
        </Box>

        <Button
          variant="text"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => navigate("/member/add")}
        >
          Add Member
        </Button>
      </Box>

      {error && (
        <Typography color="error">{error}</Typography>
      )}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ maxHeight: 700 }}
        onScroll={handleTableScroll}
      >
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead sx={{ position: "sticky", top: 0, zIndex: 10 }}>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell width={56} sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Name</TableCell>
              <TableCell width={80} sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Gender</TableCell>
              <TableCell width="13%" sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Date of Birth</TableCell>
              <TableCell width="12%" sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Location</TableCell>
              <TableCell width="10%" sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Username</TableCell>
              <TableCell width="12%" sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Phone Number</TableCell>
              <TableCell width="18%" sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Email</TableCell>
              <TableCell width={100} align="center" sx={{ fontWeight: 700, fontSize: "1rem", py: 2 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Tidak ada data member.
                </TableCell>
              </TableRow>
            ) : (
              displayedMembers.map((member, index) => (
                <TableRow
                  key={member.id}
                  hover
                  sx={{ bgcolor: index % 2 === 0 ? "background.default" : "background.paper" }}
                >
                  <TableCell>{index + 1}.</TableCell>
                  <TableCell>
                    <Tooltip title={getFullName(member)} arrow>
                      <Typography variant="body2" noWrap>
                        {getFullName(member)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                    <TableCell align="center">{formatGender(member.gender)}</TableCell>
                  <TableCell>{formatDateOfBirth(member.date_of_birth)}</TableCell>
                  <TableCell>
                    <Tooltip title={formatLocation(member.location)} arrow>
                      <Typography variant="body2" noWrap>
                        {formatLocation(member.location)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={member.user?.username || "-"} arrow>
                      <Typography variant="body2" noWrap sx={{ fontFamily: "monospace" }}>
                        {member.user?.username || "-"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={member.email || "-"} arrow>
                      <Typography variant="body2" noWrap>
                        {member.Phone || "-"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Tooltip title={member.email || "-"} arrow>
                        <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                          {member.email || "-"}
                        </Typography>
                      </Tooltip>
                      {member.email && (
                        <Tooltip title={`Send mail to ${member.email}`} arrow>
                          <IconButton
                            size="small"
                            component="a"
                            href={`mailto:${member.email}`}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          >
                            <MailOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit" arrow>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/member/edit/${member.id}`, { state: { member } })}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(member)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && hasMoreData && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 1.5, color: "text.secondary" }}>
                  Scroll untuk memuat lebih banyak...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Hapus Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah kamu yakin ingin menghapus member{" "}
            <strong>{deleteTarget ? getFullName(deleteTarget) : "-"}</strong> ({deleteTarget?.user?.username || "-"})?{" "}
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" sx={{ color: "text.secondary" }} onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
