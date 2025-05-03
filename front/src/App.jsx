import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import RecordPage from './pages/RecordPage';
import StatsPage from './pages/StatsPage';
import Footer from './components/Footer';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WorkoutProvider>
        <Router>
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              pb: '60px', // Space for footer
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/record" element={<RecordPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="*" element={<Navigate to="/record" replace />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </WorkoutProvider>
    </ThemeProvider>
  );
}

export default App;