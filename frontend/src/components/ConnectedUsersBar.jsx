// src/components/ConnectedUsersBar.jsx
import React from 'react';
import { Box, Typography, Avatar, AvatarGroup } from '@mui/material';
import { styled } from '@mui/material/styles';

// This styled component is now self-contained within this file.
const UsersContainer = styled(Box)({
  position: 'fixed',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(5px)',
  borderRadius: '50px',
  padding: '0.5rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  zIndex: 15, // Ensure it's above other elements
});

/**
 * A component that displays the connected remote users in a bar at the bottom.
 * @param {object} props
 * @param {Array<object>} props.users - The array of user objects.
 */
const ConnectedUsersBar = ({ users = [] }) => {
  return (
    <UsersContainer>
      <Typography>Remotes:</Typography>
      <AvatarGroup max={8}>
        {/* Correctly uses the full path from user.avatarBase64 */}
        {users.map(user => (
          <Avatar 
            key={user.id} 
            alt={user.name} 
            src={user.avatarBase64} 
          />
        ))}
      </AvatarGroup>
    </UsersContainer>
  );
};

export default ConnectedUsersBar;