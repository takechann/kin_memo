import { Box, Paper, Button, Stack, useTheme } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';

const Footer = () => {
  const location = useLocation();
  const theme = useTheme();

  return (
    <Paper
      component="footer"
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        borderTop: `1px solid ${theme.palette.divider}`,
        zIndex: 1000,
      }}
    >
      <Stack
        direction="row"
        sx={{
          height: '100%',
          width: '100%',
          maxWidth: theme.breakpoints.values.md,
          mx: 'auto',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <NavButton
          to="/record"
          icon={<EditIcon />}
          label="記録"
          isActive={location.pathname === '/record'}
        />
        <NavButton
          to="/stats"
          icon={<BarChartIcon />}
          label="確認"
          isActive={location.pathname === '/stats'}
        />
      </Stack>
    </Paper>
  );
};

// Navigation button component
const NavButton = ({ to, icon, label, isActive }) => {
  const theme = useTheme();
  const activeColor = theme.palette.primary.main;
  const inactiveColor = theme.palette.text.secondary;
  
  return (
    <Button
      component={NavLink}
      to={to}
      variant="text"
      sx={{
        height: '100%',
        width: '50%',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: isActive ? activeColor : inactiveColor,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>
        {icon}
      </Box>
      <Box sx={{ 
        fontSize: '0.875rem', 
        fontWeight: isActive ? 'bold' : 'normal' 
      }}>
        {label}
      </Box>
    </Button>
  );
};

export default Footer;