import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Garage_Pagination = () => {
  return (
    <Stack spacing={2}>
      <Pagination
        count={10}
        color="standard"
        renderItem={(item) => (
          <PaginationItem
            slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
            {...item}
            sx={{
              color: 'white',
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
              '&.Mui-selected': {
                backgroundColor: 'white',
                color: 'black',
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)', // semi-transparent white glow
                color: 'white',
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              },
            }}
          />
        )}
      />
    </Stack>
  );
};

export default Garage_Pagination;
