import { useState, useMemo } from 'react';
import './App.css';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('light');

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        primary: {
          main: '#1a73e8',
        },
      },
    }), [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      setError('Please enter the original email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/email/generate', {
        emailContent,
        tone,
      });
      const reply = typeof response.data === 'string' ? response.data : response.data.reply || '';
      setGeneratedReply(reply);
    } catch (err) {
      setError('Failed to generate email reply. Please try again.');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Email Reply Generator
          </Typography>
          <IconButton onClick={toggleMode} color="inherit">
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            ✉️ Compose a Reply Using AI
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter your original email and pick a tone. Get a smart, human-like response instantly.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Original Email Content"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Tone (optional)</InputLabel>
            <Select
              value={tone}
              label="Tone (optional)"
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Professional">Professional</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Friendly">Friendly</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!emailContent || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Reply'}
          </Button>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {generatedReply && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" gutterBottom>
                Generated Reply
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={generatedReply}
                inputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigator.clipboard.writeText(generatedReply)}
              >
                📋 Copy to Clipboard
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
