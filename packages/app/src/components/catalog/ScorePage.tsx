import React from 'react';
import useAsync from 'react-use/lib/useAsync';
// eslint-disable-next-line no-restricted-imports
import { Grid, CircularProgress } from '@mui/material';
import { EntityScoreCardTable } from '@oriflame/backstage-plugin-score-card';

const fetchScores = async () => {
  const response = await fetch('http://localhost:5000/scorecard');
  return response.json();
};

export const ScorePage = () => {
  const { value: scores, loading } = useAsync(fetchScores, []);

  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12}>
        {loading ? (
          <CircularProgress />
        ) : (
          <EntityScoreCardTable scores={scores} />
        )}
      </Grid>
    </Grid>
  );
};