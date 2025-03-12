import React from "react";
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
}

const data: Data = jsonData;


const statusColors: Record<StatusBoxProps["status"], string> = {
  Up: "#2DC937",
  Down: "#D05858",
  Mid: "#F0B400" ,
};

const ComponentStatus = () => {
  const columnCount = 3;

  return (
    <Container maxWidth="lg" sx={{ padding: 3 }}>
      {data.components.map((component, compIdx) => {
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
                          style={{ backgroundColor: statusColors[metric.status] }}
                          expandIcon={<ExpandMoreIcon />}
                        >
                          <Typography variant="h6" sx={{ padding: 2 }}>
                            {metric.metricName}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {metric.areas.map((area, areaIdx) => (
                            <Accordion key={areaIdx} sx={{ marginBottom: 1 }}>
                              <AccordionSummary style={{ backgroundColor: statusColors[area.status] }} expandIcon={<ExpandMoreIcon />}>
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
