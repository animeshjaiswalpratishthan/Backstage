import React, { useState, useEffect, useMemo } from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TablePagination,
  Skeleton,
  Select,
  MenuItem
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';



// Dummy data for environments
// const devData = [
//   {
//     name: 'Collection',
//     owner: 'PK',
//     podStatus: 'Running',
//     podStatusUrl: '/landing-page',
//     ciCdStatus: 'Passed',
//     ciCdStatusUrl: '/landing-page',
//     sonar: '83%',
//     sanity: 'Passed',
//     sanityUrl: '/landing-page',
//     total: '100%',
//   },
//   {
//     name: 'Billing',
//     owner: 'Krishna',
//     podStatus: 'Crashed',
//     podStatusUrl: '/landing-page',
//     ciCdStatus: 'Failed',
//     ciCdStatusUrl:'/landing-page',
//     sonar: '50%',
//     sanity: 'Failed',
//     sanityUrl: '/landing-page',
//     total: '65%',
//   },
//   {
//     name: 'Pricing',
//     owner: 'Sachi',
//     podStatus: 'Crashed',
//     podStatusUrl: '/landing-page',
//     ciCdStatus: 'Passed',
//     ciCdStatusUrl: '/landing-page',
//     sonar: '53%',
//     sanity: 'Failed',
//     sanityUrl: '/landing-page',
//     total: '85%',
//   },
//   {
//     name: 'Commission',
//     owner: 'Animesh',
//     podStatus: 'Running',
//     podStatusUrl: '/landing-page',
//     ciCdStatus: 'Passed',
//     ciCdStatusUrl: '/landing-page',
//     sonar: '78%',
//     sanity: 'Passed',
//     sanityUrl: '/landing-page',
//     total: '85%',
//   },
//   {
//     name: 'Data Mart',
//     owner: 'Shubhankar',
//     podStatus: 'Running',
//     podStatusUrl: '/landing-page',
//     ciCdStatus: 'Passed',
//     ciCdStatusUrl:'/landing-page',
//     sonar: '78%',
//     sanity: 'Passed',
//     sanityUrl: '/landing-page',
//     total: '85%',
//   },
// ];

const uatData = [
  {
    name: 'Payments',
    owner: 'Sachi',
    podStatus: 'Running',
    podStatusUrl: '/landing-page',
    ciCdStatus: 'Failed',
    ciCdStatusUrl: '/landing-page',
    sonar: '72%',
    sanity: 'Failed',
    sanityUrl: '/landing-page',
    total: '70%',
  },
  {
    name: 'Accounts',
    owner: 'PK',
    podStatus: 'Crashed',
    podStatusUrl: '/landing-page',
    ciCdStatus: 'Failed',
    ciCdStatusUrl: '/landing-page',
    sonar: '60%',
    sanity: 'Failed',
    sanityUrl: '/landing-page',
    total: '55%',
  },
];

const getColor = (value) => {
  if (typeof value === 'string') {
    if (value === 'Running' || value === 'Passed') return '#0c9e0c';
    if (value === 'Crashed' || value === 'Failed') return '#e23c3c';
  }
  if (typeof value === 'number') {
    if (value > 70) return '#0c9e0c';
    if (value >= 51 && value <= 69) return '#dcd229';
    return '#e23c3c';
  }
  return 'transparent';
};

function getPodStatusForEnvironment(response, selectedEnv) {
    // Loop through the items in the response
    for (let i = 0; i < response.items.length; i++) {
      const clusterItem = response.items[i];
      const clusterName = clusterItem.cluster.name;
  
     
      if (clusterName.toLowerCase() === selectedEnv.toLowerCase()) {
      
        const podMetrics = clusterItem.podMetrics;
        for (let j = 0; j < podMetrics.length; j++) {
          const podMetric = podMetrics[j];
          const pod = podMetric.pod;
          const metadata = pod.metadata;
          const namespace = metadata.namespace;
          const phase = pod.status.phase;
  
         
          if (namespace.toLowerCase() === selectedEnv.toLowerCase()) {
            if (phase.toLowerCase() === "running") {
              return "Running"; 
            } else if (phase.toLowerCase() === "failed") {
              return "Crashed"; 
            }
          }
        }
      }
    }
  
    return "No pods found for the selected environment.";
  }

  const baseData = [
    { name: 'Collection', owner: 'PK' },
    { name: 'Billing', owner: 'Krishna' },
    { name: 'Pricing', owner: 'Sachi' },
    { name: 'Commission', owner: 'Animesh' },
    { name: 'Data Mart', owner: 'Shubhankar' },
  ];
  
  async function fetchPodStatus(serviceName) {
    try {
      const response = await fetch(`/kubernetes.json`);
      const data = await response.json();
      return getPodStatusForEnvironment(data, 'dev')
    } catch (error) {
      console.error(`Error fetching status for ${serviceName}`, error);
      return 'Unknown';
    }
  }
  
  async function createDevData() {
    const devData = await Promise.all(
      baseData.map(async (service) => {
        const podStatus = await fetchPodStatus(service.name);
        return {
          ...service,
          podStatus,
          podStatusUrl: '/landing-page',
        };
      })
    );

    // console.log("DEV DATA 1", devData);
    return devData;
  }

//   const devData = createDevData();

//   console.log("DEV DATA 2", devData);

  
const ScoreBoardPageLive = () => {
  const [env, setEnv] = useState('dev');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
        if (env === 'dev') {
            createDevData().then((resolvedData) => {
              setData(resolvedData);
              setLoading(false);
            });
          } else {
            setData(uatData);
            setLoading(false);
          }
    }, 1000); 
  }, [env]);

  
  const allKeys = Array.from(
    new Set(data.reduce((keys, item) => [...keys, ...Object.keys(item)], []))
  ).filter((key) => !key.endsWith('Url'));

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      typeof value === 'string' && value.toLowerCase().includes(filterText.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div>
      {/* Header */}
      <Box sx={{
        height: 180,
        backgroundImage: 'url("https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1350&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 4,
        color: '#fff',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      }}>
        <Typography variant="h3">Score Board</Typography>
        <Typography variant="subtitle1">Overview of entity scores</Typography>
      </Box>

      {/* Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, mt: 2 }}>
        <Box sx={{
          display: 'flex',
          borderRadius: '30px',
          backgroundColor: '#e0e0e0',
          p: '4px',
          width: 150,
          position: 'relative',
        }}>
          <Box sx={{
            position: 'absolute',
            height: '85%',
            width: '44%',
            backgroundColor: '#1976d2',
            borderRadius: '24px',
            transition: 'left 0.3s ease',
            left: env === 'dev' ? 4 : '50%',
            zIndex: 0,
          }} />
          {['dev', 'uat'].map((mode) => (
            <Button
              key={mode}
              onClick={() => setEnv(mode)}
              sx={{
                zIndex: 1,
                flex: 1,
                color: env === mode ? '#fff' : '#000',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              {mode.toUpperCase()}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, px: '2.5%' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Entities scores overview</Typography>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #ccc',
          width: 250,
          pl: 1,
          pr: 0.5,
          py: 0.3,
        }}>
          <FilterList sx={{ color: '#fff', mr: 1 }} />
          <input
            type="text"
            placeholder="Filter"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              color: '#f0f0f0',
            }}
          />
          {filterText && (
            <IconButton onClick={() => setFilterText('')} size="small">
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <TableContainer component={Paper} sx={{ mt: 3, width: '95%', borderRadius: 2 }}>
          <Table stickyHeader>
          <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {allKeys.map((key) => (
                  <TableCell key={key} sx={{
                    borderTop: '0.5px solid white',
                    borderBottom: '0.5px solid white',
                    fontWeight: 'bold',
                    paddingY: 0.5,
                    lineHeight:2.5,
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                  }}>
                    {key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(rowsPerPage)].map((_, i) => (
                  <TableRow key={i}>
                    {allKeys.map((key, j) => (
                      <TableCell key={j}><Skeleton variant="rectangular" height={24} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={index}>
                    {allKeys.map((key) => {
                      const value = row[key] ?? '';
                      const parsedValue = typeof value === 'string' && value.endsWith('%')
                        ? parseInt(value, 10)
                        : value;
                      const urlKey = `${key}Url`;
                      const url = row[urlKey];

                      const cellContent =
                        // eslint-disable-next-line no-nested-ternary
                        key.toLowerCase() !== 'name' && key.toLowerCase() !== 'owner'
                          ? url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                              <Box sx={{
                                display: 'inline-block',
                                backgroundColor: getColor(parsedValue),
                                color: '#fff',
                                padding: '8px 15px',
                                borderRadius: '8px',
                              }}>
                                {value}
                              </Box>
                            </a>
                          ) : (
                            <Box sx={{
                              display: 'inline-block',
                              backgroundColor: getColor(parsedValue),
                              color: '#fff',
                              padding: '8px 15px',
                              borderRadius: '8px',
                            }}>
                              {value}
                            </Box>
                          )
                          : value;

                      return <TableCell key={key}>{cellContent}</TableCell>;
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            SelectComponent={Select}
          />
        </TableContainer>
      </Box>
    </div>
  );
};

export default ScoreBoardPageLive;

