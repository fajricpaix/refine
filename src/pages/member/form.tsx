import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
	Box,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Divider,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import type { Member } from ".";

type FormValues = {
	first_name: string;
	last_name: string;
	gender: "Male" | "Female" | "";
	date_of_birth: string;
	city: string;
	country: string;
	email: string;
	phone: string;
	userid: string;
	username: string;
	password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
	first_name: "",
	last_name: "",
	gender: "",
	date_of_birth: "",
	city: "",
	country: "",
	email: "",
	phone: "",
	userid: "",
	username: "",
	password: "",
};

const toInputDate = (dateOfBirth?: string) => {
	if (!dateOfBirth) return "";
	const [day, month, year] = dateOfBirth.split("/");
	if (!day || !month || !year) return "";
	return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const toDisplayDate = (inputDate?: string) => {
	if (!inputDate) return "";
	const [year, month, day] = inputDate.split("-");
	if (!day || !month || !year) return "";
	return `${day}/${month}/${year}`;
};

const mapMemberToForm = (member: Member): FormValues => ({
	first_name: member.first_name || "",
	last_name: member.last_name || "",
	gender: member.gender === "Male" || member.gender === "Female" ? member.gender : "",
	date_of_birth: toInputDate(member.date_of_birth),
	city: member.location?.city || "",
	country: member.location?.country || "",
	email: member.email || "",
	phone: member.Phone || "",
	userid: member.user?.userid || "",
	username: member.user?.username || "",
	password: member.user?.password || "",
});

const MemberForm: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const isEdit = Boolean(id);

	const [values, setValues] = useState<FormValues>(EMPTY_FORM);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const loadEditMember = async () => {
			if (!isEdit || !id) return;

			const state = location.state as { member?: Member } | null;
			if (state?.member) {
				setValues(mapMemberToForm(state.member));
				return;
			}

			setLoading(true);
			try {
				const response = await fetch("/api/dummy-users/users");
				const data: Member[] = await response.json();
				const target = data.find((item) => item.id === Number(id));
				if (target) {
					setValues(mapMemberToForm(target));
				}
			} catch (err) {
				console.error("Failed to load member detail:", err);
			} finally {
				setLoading(false);
			}
		};

		loadEditMember();
	}, [id, isEdit, location.state]);

	const validate = (vals: FormValues): FormErrors => {
		const errs: FormErrors = {};
		if (!vals.first_name.trim()) errs.first_name = "First name wajib diisi.";
		if (!vals.last_name.trim()) errs.last_name = "Last name wajib diisi.";
		if (!vals.gender) errs.gender = "Gender wajib dipilih.";
		if (!vals.date_of_birth) errs.date_of_birth = "Date of birth wajib diisi.";
		if (!vals.city.trim()) errs.city = "City wajib diisi.";
		if (!vals.country.trim()) errs.country = "Country wajib diisi.";
		if (!vals.email.trim()) errs.email = "Email wajib diisi.";
		else if (!/^\S+@\S+\.\S+$/.test(vals.email)) errs.email = "Format email tidak valid.";
		if (!vals.phone.trim()) errs.phone = "Phone wajib diisi.";
		if (!vals.username.trim()) errs.username = "Username wajib diisi.";
		else if (!/^[a-z0-9._-]{3,30}$/.test(vals.username))
			errs.username = "Username hanya huruf kecil, angka, titik, garis bawah, atau strip (3–30 karakter).";
		if (!vals.password) errs.password = "Password wajib diisi.";
		else if (vals.password.length < 6) errs.password = "Password minimal 6 karakter.";
		return errs;
	};

	const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const next = { ...values, [field]: e.target.value };
		setValues(next);
		if (submitted) setErrors(validate(next));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
		const errs = validate(values);
		setErrors(errs);
		if (Object.keys(errs).length > 0) return;

		// TODO: connect to real API
		navigate("/member");
	};

	return (
		<Stack spacing={3} p={0}>
			<Box display="flex" alignItems="center" gap={2}>
				<Button
					variant="text"
					startIcon={<ArrowBackIosOutlinedIcon />}
					onClick={() => navigate("/member")}
				>
					Back
				</Button>
			</Box>

			<Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
				<Box textAlign="center">
					<Typography variant="h5" fontWeight="bold">
						{isEdit ? "Edit Member" : "Add Member"}
					</Typography>
					<Typography variant="body2" color="text.secondary" mt={0.5}>
						{isEdit
							? "Update the data of the registered member."
							: "Fill in the data below to register a new member."}
					</Typography>
				</Box>
			</Box>

			<Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
				<Paper variant="outlined" sx={{ p: 3, maxWidth: 1000, width: "100%" }}>
					<Box component="form" onSubmit={handleSubmit} noValidate>
						<Stack spacing={3}>
							<Typography align='center' variant="h5">
								Informasi Member
							</Typography>

							<Grid container spacing={3}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Stack spacing={3}>
										<TextField
											label="First Name"
											value={values.first_name}
											onChange={handleChange("first_name")}
											error={!!errors.first_name}
											helperText={errors.first_name}
											fullWidth
											required
											autoFocus={!isEdit}
										/>

										<TextField
											label="Last Name"
											value={values.last_name}
											onChange={handleChange("last_name")}
											error={!!errors.last_name}
											helperText={errors.last_name}
											fullWidth
											required
										/>

										<FormControl fullWidth error={!!errors.gender} required>
											<InputLabel id="member-gender-label">Gender</InputLabel>
											<Select
												labelId="member-gender-label"
												label="Gender"
												value={values.gender}
												onChange={(e) => {
													const next = { ...values, gender: e.target.value as FormValues["gender"] };
													setValues(next);
													if (submitted) setErrors(validate(next));
												}}
											>
												<MenuItem value="Male">Male</MenuItem>
												<MenuItem value="Female">Female</MenuItem>
											</Select>
											{errors.gender && (
												<Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
													{errors.gender}
												</Typography>
											)}
										</FormControl>

										<TextField
											label="Date of Birth"
											type="date"
											value={values.date_of_birth}
											onChange={handleChange("date_of_birth")}
											error={!!errors.date_of_birth}
											helperText={errors.date_of_birth}
											fullWidth
											required
											slotProps={{ inputLabel: { shrink: true } }}
										/>

										<TextField
											label="City"
											value={values.city}
											onChange={handleChange("city")}
											error={!!errors.city}
											helperText={errors.city}
											fullWidth
											required
										/>

										<TextField
											label="Country"
											value={values.country}
											onChange={handleChange("country")}
											error={!!errors.country}
											helperText={errors.country}
											fullWidth
											required
										/>
									</Stack>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Stack spacing={3}>
										<TextField
											label="Email"
											value={values.email}
											onChange={handleChange("email")}
											error={!!errors.email}
											helperText={errors.email}
											fullWidth
											required
										/>

										<TextField
											label="Phone"
											value={values.phone}
											onChange={handleChange("phone")}
											error={!!errors.phone}
											helperText={errors.phone}
											fullWidth
											required
										/>

										<TextField
											label="Username"
											value={values.username}
											onChange={handleChange("username")}
											error={!!errors.username}
											helperText={errors.username || "Contoh: budi_santoso"}
											fullWidth
											required
											slotProps={{ input: { style: { fontFamily: "monospace" } } }}
										/>

										<TextField
											label="Password"
											type="password"
											value={values.password}
											onChange={handleChange("password")}
											error={!!errors.password}
											helperText={errors.password}
											fullWidth
											required
											autoComplete="new-password"
										/>
									</Stack>
								</Grid>
							</Grid>
							
							<Box display="flex" justifyContent="center" gap={2} pt={1}>
								<Button variant="outlined" onClick={() => navigate("/member")}>
									Batal
								</Button>
								<Button
									variant="contained"
									type="submit"
									startIcon={<SaveOutlinedIcon />}
								>
									{isEdit ? "Save Change" : "Add Member"}
								</Button>
							</Box>

							{loading && (
								<Typography variant="body2" color="text.secondary">
									Memuat data member...
								</Typography>
							)}

						</Stack>
					</Box>
				</Paper>
			</Box>
		</Stack>
	);
};

export default MemberForm;
