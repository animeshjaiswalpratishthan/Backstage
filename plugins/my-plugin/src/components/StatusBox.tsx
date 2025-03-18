/* eslint-disable no-restricted-imports */
import React from "react";
import { Box, Typography } from "@mui/material";

interface StatusBoxProps {
  name: string;
  status: "Up" | "Down" | "Mid";
}

const statusColors: Record<StatusBoxProps["status"], string> = {
  Up: "#2DC937",
  Down: "#D05858",
  Mid: "#F0B400" ,
};

export const StatusBox: React.FC<StatusBoxProps> = ({ name, status }) => {
  console.log("Status inside StatusBox", status)
  // eslint-disable-next-line no-console
  return (
    <Box
      sx={{
        width: "200px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: statusColors[status],
        color: "white",
        borderRadius: "8px",
        boxShadow: 1,
        mb: 2,
        padding: 1,
      }}
    >
      <Typography variant="body1" fontWeight="bold">{name}</Typography>
    </Box>
  );
};

