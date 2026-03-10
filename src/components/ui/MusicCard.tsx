import { Box, Card, CardActionArea, CardMedia, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import React from "react";
import { SmartCardMedia } from "./SmartCardMedia";

interface MusicCardsProps {
  trackId: number;
  trackName: string;
  image: string;
  artistName: string;
  collectionName?: string;
  onClick?: (trackId: number) => void;
}

const MusicCards: React.FC<MusicCardsProps> = ({ trackId, trackName, image, artistName, collectionName, onClick }) => {

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card>
        <CardActionArea onClick={() => onClick && onClick(trackId)}>
          <Box display="flex" gap={2}>
            <Box width={100} height={100}>
              <SmartCardMedia
                src={image}
                alt={trackName}
                ratio="1/1"
                blurUp
              />
            </Box>
            <Box flex={1} px={1} display="flex" flexDirection="column" justifyContent="center" sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {trackName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                {artistName}
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom noWrap>
                {collectionName}
              </Typography>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export default MusicCards;
