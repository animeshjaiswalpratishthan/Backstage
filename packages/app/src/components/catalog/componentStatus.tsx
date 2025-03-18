import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-restricted-imports
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Container,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import jsonData from "./data.json";
import { useApi, fetchApiRef, configApiRef } from "@backstage/core-plugin-api";
import { identityApiRef } from "@backstage/core-plugin-api";
import { StatusBox } from '@internal/plugin-my-plugin';



interface NameSpace {
  id: string;
  nameSpaceName?: string;
  status: string;
}

interface Area {
  id: string;
  areaName: string;
  namesSpaces?: NameSpace[];
  status: string;
}

interface Metric {
  id: string;
  metricName: string;
  status: string;
  areas: Area[];
}

interface Data {
  componentName: string;
  metrics: Metric[];
  items: {
    cluster: {
      name: string;
    };
    podMetrics: {
      pod: {
        metadata: {
          namespace: string;
        };
        status: {
          phase: string;
        };
      };
    }[];
  }[];
}

const defaultData: Data = jsonData;


const sampleStatusColors: Record<StatusBoxProps["status"], string> = {
  Up: "#2DC937",
  Down: "#D05858",
  Mid: "#F0B400" ,
};

// const ComponentStatus = () => {
  // const columnCount = 3;

//   return (
//     <Container maxWidth="lg" sx={{ padding: 3 }}>
      // {data.components.map((component, compIdx) => {
      //   const columns: Metric[][] = Array.from({ length: columnCount }, (_, i) =>
      //     component.metrics.filter((_, idx) => idx % columnCount === i)
      //   );

      //   return (
      //     <Accordion key={compIdx} sx={{ mb: 2 }}>
      //       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      //         <Typography variant="h5" sx={{ padding: 2 }}>
      //           {component.componentName}
      //         </Typography>
      //       </AccordionSummary>
      //       <AccordionDetails>
      //         <Grid container spacing={2} sx={{ marginTop: 1 }}>
      //           {columns.map((metrics, metricIdx) => (
      //             <Grid item xs={12} sm={6} md={4} key={metricIdx}>
      //               {metrics.map((metric, midx) => (
      //                 <Accordion key={midx} sx={{ mb: 2 }}>
      //                   <AccordionSummary
      //                     style={{ backgroundColor: sampleStatusColors[metric.status] }}
      //                     expandIcon={<ExpandMoreIcon />}
      //                   >
      //                     <Typography variant="h6" sx={{ padding: 2 }}>
      //                       {metric.metricName}
      //                     </Typography>
      //                   </AccordionSummary>
      //                   <AccordionDetails>
      //                     {metric.areas.map((area, areaIdx) => (
      //                       <Accordion key={areaIdx} sx={{ marginBottom: 1 }}>
      //                         <AccordionSummary style={{ backgroundColor: sampleStatusColors[area.status] }} expandIcon={<ExpandMoreIcon />}>
      //                           <Typography sx={{ padding: 2 }}>{area.areaName}</Typography>
      //                         </AccordionSummary>
      //                         <AccordionDetails>
      //                           {(area.namesSpaces ?? [area]).map((ns, nsIdx) => (
      //                             <StatusBox
      //                               key={nsIdx}
      //                               name={ns.nameSpaceName || area.areaName}
      //                               status={ns.status}
      //                             />
      //                           ))}
      //                         </AccordionDetails>
      //                       </Accordion>
      //                     ))}
      //                   </AccordionDetails>
      //                 </Accordion>
      //               ))}
      //             </Grid>
      //           ))}
      //         </Grid>
      //       </AccordionDetails>
      //     </Accordion>
      //   );
      // })}
//     </Container>
//   );
// };



interface StatusBoxProps {
  status: "Running" | "Failed" | "default";
}

interface jenkinStatusBoxProps {
  status: "running" | "failed" | "default";
}

const statusColors: Record<StatusBoxProps["status"], string> = {
  Running: "#2DC937",
  Failed: "#D05858",
  default: "#F0B400"
};

const jenkinStatusColors: Record<jenkinStatusBoxProps["status"], string> = {
  running: "#2DC937",
  failed: "#D05858",
  default: "#F0B400"
};

const ComponentStatus = () => {
  const identity = useApi(identityApiRef);
  const [data, setData] = useState< null>(null);
  const [jenkinsData, setJenkinsData] = useState< null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApi = useApi(fetchApiRef);

  const config = useApi(configApiRef); 
  const baseUrl = config.getString('backend.baseUrl');


  useEffect(() => {
    const fetchData = async () => {
      try { 
        const response = await fetchApi.fetch(`${baseUrl}/api/api-connector/get-kubernetes-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData: KubernetesData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try { 
        const response = await fetchApi.fetch(`${baseUrl}/api/api-connector/get-jenkins-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData: KubernetesData = await response.json();
        setJenkinsData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  if (!data) {
    return <Typography>No data available</Typography>;
  }
  const columnCount = 3;

  const clusterColors = data.items.map((cluster) => {
    const statuses = cluster.podMetrics.map((pm) => pm.pod.status.phase);
    const allRunning = statuses.every((status) => status === "Running");
    const allFailed = statuses.every((status) => status === "Failed");
  
    if (allRunning) {
      return "Running";
    } else if (allFailed) {
      return "Failed";
    }
    return "default";
  });
  
  const allClustersRunning = clusterColors.every((color) => color === "Running");
  const allClustersFailed = clusterColors.every((color) => color === "Failed");
  let podStatusColor;
  if (allClustersRunning) {
    podStatusColor = statusColors.Running;
  } else if (allClustersFailed) {
    podStatusColor = statusColors.Failed;
  } else {
    podStatusColor = statusColors.default;
  }
  
  return (
    <Container maxWidth="lg" sx={{ padding: 3 }}>
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h5" sx={{ padding: 2 }}>Collection</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          
          {/* POD Status - Takes 1/3rd width */}
          <Grid item xs={12} md={4}>
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: podStatusColor }}>
                <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>POD Status</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {data.items.map((cluster, clusterIdx) => {
                  const statuses = cluster.podMetrics.map((pm) => pm.pod.status.phase);
                  const allRunning = statuses.every((status) => status === "Running");
                  const allFailed = statuses.every((status) => status === "Failed");
                  let clusterStatus = allRunning ? "Running" : allFailed ? "Failed" : "default";
  
                  return (
                    <Accordion key={clusterIdx} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: statusColors[clusterStatus] }}>
                        <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>
                          {cluster.cluster.name}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                          {cluster.podMetrics.map((pm, nsIdx) => {
                            const namespace = pm.pod.metadata.namespace;
                            let overallStatus = pm.pod.status.phase === "Running" ? "Running" : pm.pod.status.phase === "Failed" ? "Failed" : "default";
  
                            return (
                              <Box
                                key={nsIdx}
                                sx={{
                                  mb: 2,
                                  backgroundColor: statusColors[overallStatus],
                                  padding: 2,
                                  borderRadius: 1,
                                  textAlign: "center",
                                  color: "#fff",
                                }}
                              >
                                <Typography variant="body1">{namespace}</Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          </Grid>
  
          {/* CI/CD Status - Takes 1/3rd Width */}
          <Grid item xs={12} md={4}>
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "#D05858" }}>
                <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>CI/CD Status</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {jenkinsData.projects.map((project, index) => (

                        <Box
                        key={index}
                        sx={{
                          mb: 2,
                          backgroundColor: jenkinStatusColors[project.lastBuild.status],
                          padding: 2,
                          borderRadius: 1,
                          textAlign: "center",
                          color: "#fff",
                        }}
                        >
                        <Typography variant="body1">{project.displayName}</Typography>
                        </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </Grid>
  
          {/* Quality Status - Takes 1/3rd Width */}
          {/* <Grid item xs={12} md={4}>
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "#2DC937" }}>
                <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>Quality Status</Typography>
              </AccordionSummary>
              <AccordionDetails> */}
                {/* Sonar Accordion */}
                {/* <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "#2DC937" }}>
                    <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>Sonar</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1">Sonar analysis details...</Typography>
                  </AccordionDetails>
                </Accordion> */}
  
                {/* Sanity Check Accordion */}
                {/* <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "#2DC937" }}>
                    <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>Sanity Check</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1">Sanity Check details...</Typography>
                  </AccordionDetails>
                </Accordion>
              </AccordionDetails>
            </Accordion>
          </Grid> */}
  
        </Grid>
      </AccordionDetails>
    </Accordion>

    {defaultData.components.map((component, compIdx) => {
        const columns: Metric[][] = Array.from({ length: columnCount }, (_, i) =>
          component.metrics.filter((_, idx) => idx % columnCount === i)
        );

        return (
          <Accordion key={compIdx} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ padding: 2 }}>
                {component.componentName}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} sx={{ marginTop: 1 }}>
                {columns.map((metrics, metricIdx) => (
                  <Grid item xs={12} sm={6} md={4} key={metricIdx}>
                    {metrics.map((metric, midx) => (
                      <Accordion key={midx} sx={{ mb: 2 }}>
                        <AccordionSummary
                          style={{ backgroundColor: sampleStatusColors[metric.status] }}
                          expandIcon={<ExpandMoreIcon />}
                        >
                          <Typography variant="h6" sx={{ padding: 2 }}>
                            {metric.metricName}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {metric.areas.map((area, areaIdx) => (
                            <Accordion key={areaIdx} sx={{ marginBottom: 1 }}>
                              <AccordionSummary style={{ backgroundColor: sampleStatusColors[area.status] }} expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ padding: 2 }}>{area.areaName}</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {(area.namesSpaces ?? [area]).map((ns, nsIdx) => (
                                  <StatusBox
                                    key={nsIdx}
                                    name={ns.nameSpaceName || area.areaName}
                                    status={ns.status}
                                  />
                                ))}
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
  </Container>
  

  );
  

};


export default ComponentStatus;
