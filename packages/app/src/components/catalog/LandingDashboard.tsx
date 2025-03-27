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


interface StatusBoxProps {
  status: "GREEN" | "RED" | "AMBER";
}

const statusColors: Record<StatusBoxProps["status"], string> = {
  GREEN: "#2DC937",
  RED: "#D05858",
  AMBER: "#F0B400"
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

  console.log("INSIDE COMPONENT STATUS");


  useEffect(() => {
    const fetchData = async () => {
      try { 
        const response = await fetchApi.fetch(`${baseUrl}/api/api-connector/get-landing-page-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("RESPONSE", response);
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

  
    return (
      <Container maxWidth="lg" sx={{ padding: 3 }}>
  {data.level0List.map((level0, idx0) => (
    <Accordion key={idx0} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h5" sx={{ padding: 2 }}>
          {level0.level0Name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {level0.level1List.map((level1, idx1) => (
            <Grid item xs={12} md={4} key={idx1}>
              {level1.level2List && level1.level2List.length > 0 ? (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: statusColors[level1.statusCode] }}>
                    <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>
                      {level1.level1Name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {level1.level2List.map((level2, idx2) => (
                      level2.level3List && level2.level3List.length > 0 ? (
                        <Accordion key={idx2} sx={{ mb: 2 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: statusColors[level2.statusCode] }}>
                            <Typography variant="h6" sx={{ padding: 2, color: "#fff" }}>
                              {level2.level2Name}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                              {level2.level3List.map((level3, idx3) => (
                                level3.level4List && level3.level4List.length > 0 ? (
                                  <Box
                                    key={idx3}
                                    sx={{
                                      mb: 2,
                                      backgroundColor: statusColors[level3.statusCode] || statusColors.default,
                                      padding: 2,
                                      borderRadius: 2,
                                      color: "#fff",
                                      boxShadow: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        paddingBottom: 1,
                                        borderBottom: "1px solid rgba(255,255,255,0.3)",
                                      }}
                                    >
                                      {level3.level3Name}
                                    </Typography>
                                    {level3.level4List.map((level4, idx4) => (
                                      <Box key={idx4} sx={{ paddingY: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                          {level4.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                          Version: {level4.version}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                ) : (
                                  <Box
                                    key={idx3}
                                    sx={{
                                      mb: 2,
                                      backgroundColor: statusColors[level3.statusCode] || statusColors.default,
                                      padding: 2,
                                      borderRadius: 2,
                                      color: "#fff",
                                      boxShadow: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{ textAlign: "center", fontWeight: "bold" }}
                                    >
                                      {level3.level3Name}
                                    </Typography>
                                  </Box>
                                )
                              ))}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ) : (
                        <Box
                          key={idx2}
                          sx={{
                            mb: 2,
                            backgroundColor: statusColors[level2.statusCode] || statusColors.default,
                            padding: 2,
                            borderRadius: 2,
                            color: "#fff",
                            boxShadow: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ textAlign: "center", fontWeight: "bold" }}
                          >
                            {level2.level2Name}
                          </Typography>
                        </Box>
                      )
                    ))}
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Box
                  key={idx1}
                  sx={{
                    mb: 2,
                    backgroundColor: statusColors[level1.statusCode] || statusColors.default,
                    padding: 2,
                    borderRadius: 2,
                    color: "#fff",
                    boxShadow: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ textAlign: "center", fontWeight: "bold" }}
                  >
                    {level1.level1Name}
                  </Typography>
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  ))}
</Container>

    );
  

};


export default ComponentStatus;
