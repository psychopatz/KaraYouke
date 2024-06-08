import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = ({ title, navItems }) => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" style={{ flexGrow: 1 }}>
        {title}
      </Typography>
      {navItems.map((item, index) => (
        <Button key={index} color="inherit" component={Link} to={item.path}>
          {item.label}
        </Button>
      ))}
    </Toolbar>
  </AppBar>
);

export default Navbar;
