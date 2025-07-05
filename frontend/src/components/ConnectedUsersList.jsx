// src/components/ConnectedUsersList.jsx

import React from 'react';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';

const UsersContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  width: '100%',
  maxWidth: '800px', // Increased max-width to allow for horizontal wrapping
  
  // --- NEW STYLES FOR FIXED HEIGHT ---
  maxHeight: '300px', // Or any height you prefer (e.g., '40vh')
  display: 'flex',
  flexDirection: 'column', // Keep the overall direction as a column
}));

const ScrollableList = styled(List)({
  // --- NEW STYLES FOR SCROLLING & WRAPPING ---
  overflowY: 'auto',   // Add a vertical scrollbar ONLY when content overflows
  display: 'flex',      // Use flexbox for the list items
  flexWrap: 'wrap',     // Allow items to wrap to the next line
  gap: '8px',           // Add some space between items
  padding: '8px',       // Add some internal padding
});

const UserListItem = styled(ListItem)(({ theme }) => ({
  // --- NEW STYLES FOR EACH USER ITEM ---
  flex: '1 1 200px', // Flex-grow, flex-shrink, flex-basis. Each item will try to be 200px wide.
  maxWidth: '250px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
}));

const ConnectedUsersList = ({ users, onKick }) => {
  return (
    <UsersContainer>
      <Typography variant="h6" gutterBottom textAlign="center" sx={{ flexShrink: 0, padding: '0 8px' }}>
        Connected Remotes ({users.length})
      </Typography>
      
      {users.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ margin: 'auto' }}>
          Waiting for users to connect...
        </Typography>
      ) : (
        <ScrollableList>
          {users.map((user) => (
            <UserListItem key={user.uuid || user.id}> {/* Use uuid or id for key */}
              <ListItemAvatar>
                <Avatar src={user.avatarBase64} alt={user.name} />
              </ListItemAvatar>
              <ListItemText 
                primary={user.name} 
                primaryTypographyProps={{ 
                  style: { 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  } 
                }} 
              />
            </UserListItem>
          ))}
        </ScrollableList>
      )}
    </UsersContainer>
  );
};

export default ConnectedUsersList;