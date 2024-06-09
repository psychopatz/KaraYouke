import React from 'react';
import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';

const UserCard = ({ user }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar alt={user.name} src={user.profile_pic} sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              Type: {user.type}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;
