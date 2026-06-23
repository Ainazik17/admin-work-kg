import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import { Button } from "#shared/ui/button/Button";

export const StyledForm = styled("form")(({ theme }) => ({
   backgroundColor: "transparent",
   borderRadius: "16px",
   display: "flex",
   flexDirection: "column",
   gap: "20px",
   padding: "2rem 1rem",
   width: "100%",
   maxWidth: "380px",

   [theme.breakpoints.up("sm")]: {
      padding: "0",
      maxWidth: "420px",
   },
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
   height: "52px",
   fontSize: "16px !important",
   fontWeight: 600,
   background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
   color: "white",
   border: "none",
   borderRadius: "12px",
   marginTop: "8px",
   textTransform: "none",
   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
   boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",

   "&:hover": {
      background: "linear-gradient(135deg, #5568d3 0%, #6a3a91 100%)",
      boxShadow: "0 6px 25px rgba(102, 126, 234, 0.4)",
      transform: "translateY(-2px)",
   },

   "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
   },

   [theme.breakpoints.up("sm")]: {
      height: "56px",
      fontSize: "17px !important",
   },
}));

export const StyledFormWrap = styled(Box)(({ theme }) => ({
   width: "100%",
   maxWidth: "420px",
   borderRadius: "16px",
   background: "transparent",
   padding: "0",
   display: "flex",
   flexDirection: "column",
   gap: "0",
}));
