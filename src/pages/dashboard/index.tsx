
import StatCard from '@components/StorybookLibrary/StatCard';
import { SmartCardMedia } from '@components/ui/SmartCardMedia';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import {
  Activity,
  DollarSign,
  ShoppingCart,
  Users
} from 'lucide-react';
import React from 'react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: 12.5,
      icon: <Users size={24} />,
      color: '#3b82f6',
    },
    {
      title: 'Total Orders',
      value: '3,891',
      change: 8.2,
      icon: <ShoppingCart size={24} />,
      color: '#10b981',
    },
    {
      title: 'Revenue',
      value: '$48,392',
      change: 15.8,
      icon: <DollarSign size={24} />,
      color: '#8b5cf6',
    },
    {
      title: 'Active Sessions',
      value: '892',
      change: -3.4,
      icon: <Activity size={24} />,
      color: '#f59e0b',
    },
  ];

  const topProducts = [
    { name: 'Premium Headphones', sales: 234, progress: 85 },
    { name: 'Smart Watch Pro', sales: 189, progress: 68 },
    { name: 'Wireless Keyboard', sales: 156, progress: 56 },
    { name: 'Gaming Mouse', sales: 143, progress: 51 },
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, Admin! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your business today
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Top Products */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Products
              </Typography>

              <Stack spacing={3} mt={2}>
                {topProducts.map((product, index) => (
                  <Box key={index}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Chip
                        label={`${product.sales} sales`}
                        size="small"
                        sx={{
                          bgcolor: "background.default",
                          color: "primary.main",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={product.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#e5e7eb",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: "primary.main",
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Banner Homepage
              </Typography>

              <Stack spacing={3} mt={2}>
                <SmartCardMedia
                  src='https://images.pexels.com/photos/30864661/pexels-photo-30864661.jpeg'
                  alt="banner"
                  ratio="3/1"
                  blurUp
                />
              </Stack>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;