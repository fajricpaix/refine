import React from "react";
import { Paper, Typography, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { SmartCardMedia } from "@components/ui/SmartCardMedia";
import StatCard from "./StatCard";
import { Users, ShoppingCart, DollarSign, Activity } from "lucide-react";

const StoryCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Paper sx={{ p: 2 }}>
    <Typography fontWeight="bold" mb={1}>
      {title}
    </Typography>
    {children}
  </Paper>
);

export const StorybookLibrary: React.FC = () => {
  return (
    <>
      <Stack spacing={4} p={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          StatCard Examples
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Users"
              value="12,543"
              change={12.5}
              icon={<Users size={20} />}
              color="#3b82f6"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Orders"
              value="3,891"
              change={8.2}
              icon={<ShoppingCart size={20} />}
              color="#10b981"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Revenue"
              value="$48,392"
              change={15.8}
              icon={<DollarSign size={20} />}
              color="#8b5cf6"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Active Sessions"
              value="892"
              change={-3.4}
              icon={<Activity size={20} />}
              color="#f59e0b"
            />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={4} p={4}>
        <Typography variant="h5" fontWeight="bold">
          Component Library
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StoryCard title="SmartCardMedia - Default">
              <SmartCardMedia src="https://picsum.photos/600/400" alt="default" ratio="16/9" />
            </StoryCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <StoryCard title="SmartCardMedia - Blur Up">
              <SmartCardMedia src="https://picsum.photos/600/401" alt="blur" blurUp />
            </StoryCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <StoryCard title="SmartCardMedia - Ratio 1:1">
              <SmartCardMedia src="https://picsum.photos/400" alt="square" ratio="1/1" />
            </StoryCard>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default StorybookLibrary;
