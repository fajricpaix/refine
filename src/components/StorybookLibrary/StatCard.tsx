import React from "react";
import { Card, CardContent, Stack, Box, Typography, Avatar } from "@mui/material";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
              {icon}
            </Avatar>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {isPositive ? (
              <TrendingUp size={16} color="#10b981" />
            ) : (
              <TrendingDown size={16} color="#ef4444" />
            )}
            <Typography variant="body2" sx={{ color: isPositive ? '#10b981' : '#ef4444' }}>
              {isPositive ? '+' : ''}{change}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
