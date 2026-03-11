import SwapVertOutlinedIcon from '@mui/icons-material/SwapVertOutlined';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
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
import Grid from "@mui/material/Grid2";
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

type SortField = "name" | "date_of_birth" | "username";
type SortOrder = "asc" | "desc";

const toSortableDate = (dateOfBirth?: string) => {
  if (!dateOfBirth) return 0;
  const [day, month, year] = dateOfBirth.split("/").map((part) => Number(part));
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
};

const ITEMS_PER_PAGE = 10;

export const MemberManagement = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteMultipleTarget, setDeleteMultipleTarget] = useState<Member[] | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch("/api/dummy-users/users");
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : []);
        setCurrentPage(1);
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

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder(field === "date_of_birth" ? "desc" : "asc");
  };

  const sortedMembers = useMemo(() => {
    const data = [...members];

    data.sort((a, b) => {
      let compare = 0;

      if (sortField === "name") {
        compare = getFullName(a).localeCompare(getFullName(b), "id", { sensitivity: "base" });
      } else if (sortField === "date_of_birth") {
        compare = toSortableDate(a.date_of_birth) - toSortableDate(b.date_of_birth);
      } else if (sortField === "username") {
        compare = (a.user?.username || "").localeCompare(b.user?.username || "", "id", { sensitivity: "base" });
      }

      if (compare === 0) {
        return a.id - b.id;
      }

      return sortOrder === "asc" ? compare : -compare;
    });

    return data;
  }, [members, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE);

  const displayedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedMembers.slice(startIndex, endIndex);
  }, [sortedMembers, currentPage]);

  const handlePageChange = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = new Set(sortedMembers.map((m) => m.id));
      setSelectedIds(ids);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectMember = (memberId: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(memberId);
    } else {
      next.delete(memberId);
    }
    setSelectedIds(next);
  };

  const handleDeleteSelected = () => {
    const target = sortedMembers.filter((m) => selectedIds.has(m.id));
    setDeleteMultipleTarget(target);
  };

  const handleConfirmDeleteMultiple = () => {
    if (!deleteMultipleTarget) return;
    const idsToDelete = new Set(deleteMultipleTarget.map((m) => m.id));
    setMembers((prev) => prev.filter((m) => !idsToDelete.has(m.id)));
    setSelectedIds(new Set());
    setDeleteMultipleTarget(null);
  };

  const isAllSelected = sortedMembers.length > 0 && selectedIds.size === sortedMembers.length;

  return (
    <Stack spacing={4} px={4} pt={4}>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          Member Management
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Manage member data registered in the system.
        </Typography>
      </Box>

      <Grid display="flex">
        <Button
          sx={{ px: 2 }}
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => navigate("/member/add")}>
          Add Member
        </Button>

        {selectedIds.size > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleDeleteSelected}
          >
            Delete {selectedIds.size === 1 ? "1 Member" : `${selectedIds.size} Members`}
          </Button>
        )}
      </Grid>


      {error && (
        <Typography color="error">{error}</Typography>
      )}

      <TableContainer
        component={Paper}
        variant="outlined"
      >
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead sx={{ position: "sticky", top: 0, zIndex: 10 }}>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell width={56}>
                <Checkbox
                  size="small"
                  color="success"
                  checked={isAllSelected}
                  indeterminate={selectedIds.size > 0 && !isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>
                Name
                <IconButton size="small" onClick={() => handleSortClick("name")}>
                  <SwapVertOutlinedIcon
                    sx={{
                      fontSize: 14,
                      color: sortField === "name" ? "primary.contrastText" : "inherit",
                      transform: sortField === "name" && sortOrder === "desc" ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </IconButton>
              </TableCell>
              <TableCell width={80} sx={{ fontSize: '16px', fontWeight: 600 }}>
                Gender
              </TableCell>
              <TableCell width={160} sx={{ fontSize: '16px', fontWeight: 600 }}>
                Date of Birth
                <IconButton size="small" onClick={() => handleSortClick("date_of_birth")}>
                  <SwapVertOutlinedIcon
                    sx={{
                      fontSize: 14,
                      color: sortField === "date_of_birth" ? "primary.contrastText" : "inherit",
                      transform: sortField === "date_of_birth" && sortOrder === "desc" ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </IconButton>
              </TableCell>
              <TableCell width={180} sx={{ fontSize: '16px', fontWeight: 600 }}>
                Location
              </TableCell>
              <TableCell width={140} sx={{ fontSize: '16px', fontWeight: 600 }}>
                Username
                <IconButton size="small" onClick={() => handleSortClick("username")}>
                  <SwapVertOutlinedIcon
                    sx={{
                      fontSize: 14,
                      color: sortField === "username" ? "primary.contrastText" : "inherit",
                      transform: sortField === "username" && sortOrder === "desc" ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </IconButton>
              </TableCell>
              <TableCell width={150} sx={{ fontSize: '16px', fontWeight: 600 }}>
                Phone Number
              </TableCell>
              <TableCell width={240} sx={{ fontSize: '16px', fontWeight: 600 }}>
                Email
              </TableCell>
              <TableCell width={100} align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
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
                  <TableCell>
                    <Checkbox
                      size="small"
                      color="success"
                      checked={selectedIds.has(member.id)}
                      onChange={(e) => handleSelectMember(member.id, e.target.checked)}
                    />
                  </TableCell>
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
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && sortedMembers.length > 0 && (
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedMembers.length)} dari {sortedMembers.length} member
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <Icon component={ArrowBackIosNewRoundedIcon} fontSize="small" />
            </Button>
            <Box display="flex" alignItems="center" gap={1}>
              {(() => {
                const MAX_PAGES_SHOWN = 5;
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + MAX_PAGES_SHOWN - 1);
                if (endPage - startPage < MAX_PAGES_SHOWN - 1) {
                  startPage = Math.max(1, endPage - MAX_PAGES_SHOWN + 1);
                }
                const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
                return pages.map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "contained" : "outlined"}
                    size="small"
                    sx={{ minWidth: 40 }}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ));
              })()}
            </Box>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <Icon component={ArrowForwardIosRoundedIcon} fontSize="small" />
            </Button>
          </Box>
        </Box>
      )}

      {/* Delete Single Confirmation Dialog */}
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

      {/* Delete Multiple Confirmation Dialog */}
      <Dialog
        open={!!deleteMultipleTarget}
        onClose={() => setDeleteMultipleTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Hapus {deleteMultipleTarget?.length} Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah kamu yakin ingin menghapus {deleteMultipleTarget?.length} member yang dipilih? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" sx={{ color: "text.secondary" }} onClick={() => setDeleteMultipleTarget(null)}>
            Batal
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeleteMultiple}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
