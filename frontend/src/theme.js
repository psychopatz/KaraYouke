import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
    action: {
      selected: '#f0f0f0',
    },
  },
});

export default theme;
