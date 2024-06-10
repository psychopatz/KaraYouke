import React, { useContext } from 'react';
import { Box, Card, CardContent, Avatar, Typography, styled } from '@mui/material';
import { RoomContext } from '../songQueue/RoomContext';

const ScrollableBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxHeight: '100vh',  // Dynamic maxHeight based on viewport height
});

const UserList = () => {
  const { roomData} = useContext(RoomContext);

  return (
    <ScrollableBox>
      {roomData && roomData.users.length > 0 ? (
        roomData.users.map((user) => (
          <Card key={user.user_id}>
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
        ))
      ) : (
        <Typography>No users in this room.</Typography>
      )}
    </ScrollableBox>
  );
};

export default UserList;
