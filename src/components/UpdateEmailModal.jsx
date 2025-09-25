// UpdateEmailModal.jsx
import { useEffect, useMemo, useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

function normalizeEmail(value) {
  if (value == null) return "";
  return value.toString().replace(/\r?\n/g, "").trim().toLowerCase();
}

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // simple, practical validator

export default function UpdateEmailModal({
  open,
  onClose,
  user,                 // { _id, name, email, ... }
  onSave,               // async (email, user) => void
  saving = false,       // optional external loading state
}) {
  const initialEmail = useMemo(() => normalizeEmail(user?.email || ""), [user]);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(initialEmail);
    setError("");
  }, [initialEmail, open]);

  const handleSave = async () => {
    const cleaned = normalizeEmail(email);

    if (!cleaned) {
      setError("Email is required");
      return;
    }
    if (!EMAIL_REGEX.test(cleaned)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      setError("");
      await onSave?.(cleaned, user);
      onClose?.();
    } catch (e) {
      setError(e?.message || "Failed to update email");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: 600, lg: 600, xl: 600 },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" mb={2} sx={{ fontWeight: 600, color: "#111827" }}>
          Update Email
        </Typography>

        {/* Top: Name (read-only) */}
        <TextField
          fullWidth
          label="Name"
          value={user?.name || ""}
          margin="normal"
          InputProps={{ readOnly: true }}
        />

        {/* Below: Email (editable) */}
        <TextField
          fullWidth
          autoFocus
          label="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          margin="normal"
          error={!!error}
          helperText={error || " "}
          className="text-gray-700"
        />

        <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
