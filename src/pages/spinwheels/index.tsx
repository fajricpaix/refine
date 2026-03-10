import AddIcon from '@mui/icons-material/Add';
import CasinoIcon from '@mui/icons-material/Casino';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Card, CardContent, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useRef, useState } from 'react';

interface WheelItem {
  id: string;
  text: string;
  color: string;
  imageUrl: string;
}

const COLORS = [
  '#f97c22', // PEACH
  '#d45900', // ORANGE
  '#f7be1e', // YELLOW
];

const IMAGE_URLS = [
  'https://img.lazcdn.com/g/p/b5fa08d117123029eaeda5c369238d95.jpg_720x720q80.jpg',
];

export const SpinWheel = () => {
  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', text: 'TV 50inch', color: COLORS[0], imageUrl: IMAGE_URLS[0] },
    { id: '2', text: 'Zonk', color: COLORS[1], imageUrl: IMAGE_URLS[0] },
    { id: '3', text: 'Baju', color: COLORS[2], imageUrl: IMAGE_URLS[0] },
    { id: '4', text: 'Iphone 17', color: COLORS[0], imageUrl: IMAGE_URLS[0] },
    { id: '5', text: 'Zonk', color: COLORS[1], imageUrl: IMAGE_URLS[0] },
    { id: '6', text: 'IDR 500.000', color: COLORS[2], imageUrl: IMAGE_URLS[0] },
  ]);
  const [newItem, setNewItem] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  const addItem = () => {
    if (newItem.trim()) {
      const newId = Date.now().toString();
      const colorIndex = items.length % COLORS.length;
      const color = COLORS[colorIndex];
      const imageUrlIndex = Math.floor(Math.random() * IMAGE_URLS.length);
      const imageUrl = IMAGE_URLS[imageUrlIndex];
      setItems([...items, { id: newId, text: newItem.trim(), color, imageUrl }]);
      setNewItem('');
    }
  };

  const removeItem = (id: string) => {
    if (items.length > 2) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anglePerItem = (2 * Math.PI) / items.length;

    // Draw wheel segments
    items.forEach((item, index) => {
      const startAngle = index * anglePerItem + (rotation * Math.PI / 180);
      const endAngle = startAngle + anglePerItem;
      const textRadius = radius * 0.25;
      const textAngle = startAngle + anglePerItem / 2;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw image if loaded
      const img = loadedImages.get(item.id);
      if (img) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerItem / 2);
        
        const imgSize = 60;
        const imgX = radius * 0.77 - imgSize / 2;
        const imgY = -imgSize / 2;
        
        // Draw rounded rectangle background
        ctx.beginPath();
        
        // Draw image with clipping
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      }

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(textAngle);
      ctx.font = '14px Arial';
      // ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(item.text, textRadius, 0);
      ctx.restore();
    });

    // Draw pointer (at top)
    ctx.beginPath();
    ctx.moveTo(centerX, 30);
    ctx.lineTo(centerX - 15, 0);
    ctx.lineTo(centerX + 15, 0);
    ctx.closePath();
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel();
  }, [items, rotation, loadedImages]);

  // Load images from URLs
  useEffect(() => {
    items.forEach((item) => {
      if (!loadedImages.has(item.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setLoadedImages(prev => {
            const newMap = new Map(prev);
            newMap.set(item.id, img);
            return newMap;
          });
        };
        img.onerror = () => {
          console.error(`Failed to load image for ${item.id}`);
        };
        img.src = item.imageUrl;
      }
    });
  }, [items]);
  

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const minSpins = 3;
    const maxSpins = 5;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const extraDegrees = Math.random() * 360;
    const totalRotation = spins * 360 + extraDegrees;

    const duration = 8000;
    const startTime = Date.now();
    const startRotation = rotation % 360;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeOut;

      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalRotation = currentRotation % 360;
        const anglePerItem = 360 / items.length;
        
        const normalizedAngle = (360 - (finalRotation % 360)) % 360;
        const adjustedAngle = normalizedAngle < 0 ? normalizedAngle + 360 : normalizedAngle;
        const winnerIndex = Math.floor(adjustedAngle / anglePerItem) % items.length;
        
        setWinner(items[winnerIndex].text);
        setIsSpinning(false);
      }
    };

    animate();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome Admin on Spin Wheels 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your spinwheel today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Wheel Display */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Spin Wheel
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 3,
                mt: 2 
              }}>
                {/* Canvas Wheel with Center Button */}
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={500} 
                    height={500}
                    style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  />
                  
                  {/* Center Spin Button */}
                  <IconButton
                    onClick={spinWheel}
                    disabled={isSpinning || items.length === 0}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 80,
                      height: 80,
                      bgcolor: '#0019a4',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#0026fe'
                      },
                      '&:disabled': {
                        bgcolor: '#ccc'
                      },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      border: '4px solid white',
                      zIndex: 10
                    }}
                  >
                    <CasinoIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                </Box>

                {/* Winner Display */}
                {winner && (
                  <Card sx={{ 
                    bgcolor: '#4CAF50', 
                    color: 'white',
                    px: 4,
                    py: 2,
                    animation: 'pulse 0.5s ease-in-out'
                  }}>
                    <Typography variant="h5" fontWeight="bold" textAlign="center">
                      🎉 Winner: {winner} 🎉
                    </Typography>
                  </Card>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Items Management */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Manage Items
              </Typography>

              <Stack spacing={2} mt={2}>
                {/* Add Item */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter item name"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={addItem}
                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: '#45B7D1' } }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                {/* Items List */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Items ({items.length})
                  </Typography>
                  <List sx={{ 
                    maxHeight: 400, 
                    overflow: 'auto',
                    borderRadius: 1,
                    p: 1
                  }}>
                    {items.map((item) => (
                      <ListItem
                        key={item.id}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={() => removeItem(item.id)}
                            disabled={items.length <= 2}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.text}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            objectFit: 'cover',
                            mr: 1.5,
                            border: '2px solid #e0e0e0'
                          }}
                        />
                        <ListItemText primary={item.text} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {items.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Add at least 2 items to spin the wheel
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </Box>
  )
}