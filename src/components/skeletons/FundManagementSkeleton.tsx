import { Card, Grid, Skeleton, Stack } from '@mui/material';
import React from 'react';

export default function FundManagementSkeleton() {
  return (
    <Grid container spacing={2} p={1}>
      <Grid item sm={12} md={4}>
        <Card sx={{ p: 2, bgcolor: 'primary.lighter', height: '100%' }}>
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={60} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" height={60} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" height={60} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" height={60} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" height={60} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" height={60} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" height={60} sx={{ mt: 2 }} />
        </Card>
      </Grid>
      <Grid item spacing={2} sm={12} md={8}>
        <Grid item mb={2}>
          <Card sx={{ p: 2, bgcolor: 'primary.lighter' }}>
            <Skeleton variant="text" width={300} sx={{ fontSize: '2rem' }} />

            <Skeleton variant="rounded" width={200} height={40} sx={{ mt: 2 }} />

            <Stack width={{ sm: '100%', md: '50%' }} gap={1}>
              <Stack flexDirection={'row'} justifyContent={'space-between'}>
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
              </Stack>
              <Stack flexDirection={'row'} justifyContent={'space-between'}>
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
              </Stack>
              <Stack flexDirection={'row'} justifyContent={'space-between'}>
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
              </Stack>
              <Stack flexDirection={'row'} justifyContent={'space-between'}>
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
                <Skeleton variant="text" width={150} sx={{ fontSize: '2rem' }} />
              </Stack>
            </Stack>
          </Card>
        </Grid>
        <Grid item>
          <Card sx={{ p: 2, bgcolor: 'primary.lighter' }}>
            <Skeleton variant="text" width={300} sx={{ fontSize: '2rem' }} />
            <Skeleton variant="rounded" width={200} height={40} sx={{ mt: 2 }} />
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}
