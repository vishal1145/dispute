// RowInlineActions.jsx
import { useMemo } from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import EmailIcon from "@mui/icons-material/Email";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

function normalizeEmail(v) {
  return v ? v.toString().replace(/\r?\n/g, "").trim().toLowerCase() : "";
}

// Tiny, consistent button styling
const BTN_SX = {
  height: 28,
  minHeight: 28,
  minWidth: 0,
  px: 1,             // tighter horizontal padding
  py: 0,             // no extra vertical padding
  fontSize: 12,
  textTransform: "none",
  borderRadius: 1.5, // ~12px
  "& .MuiButton-startIcon": { mr: 0.5 },
  "& .MuiButton-startIcon > *:nth-of-type(1)": { fontSize: 16 },
};

export default function RowInlineActions({
  user,
  onUpdateEmail,   // () => void
  onEditMessage,   // () => void
  onSendMessage,   // () => void
}) {
  const hasEmail = useMemo(() => !!normalizeEmail(user?.email), [user]);
  const emailSent = !!user?.email_sent;

  if (hasEmail && emailSent) {
    return (
      <Chip
        icon={<MarkEmailReadIcon />}
        label="Message Sent"
        color="success"
        size="small"
        variant="outlined"
        sx={{ height: 24, ".MuiChip-label": { px: 0.75, fontSize: 12 } }}
      />
    );
  }

  if (hasEmail && !emailSent) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditIcon />}
          sx={BTN_SX}
          onClick={() => onEditMessage?.(user)}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<SendIcon />}
          sx={BTN_SX}
          onClick={() => onSendMessage?.(user)}
        >
          Send
        </Button>
      </Stack>
    );
  }

  // No email: Add Email button only
  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
      <Button
        size="small"
        variant="contained"
        startIcon={<EmailIcon />}
        sx={BTN_SX}
        onClick={() => onUpdateEmail?.(user)}
      >
        Add
      </Button>
    </Stack>
  );
}
