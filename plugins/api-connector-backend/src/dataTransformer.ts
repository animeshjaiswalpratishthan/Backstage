export function transformPodStatusData(input) {
    const level2List = input.items.map((clusterItem) => {
      const level3List = clusterItem.podMetrics.map((podMetric) => {
        const level4List = podMetric.pod.spec.containers.map((container) => ({
          name: container.name,
          version: container.image.includes(":") ? container.image.split(":")[1] : "unknown",
        }));
  
        return {
          level3Name: podMetric.pod.metadata.namespace,
          level3Type: "namespace",
          statusCode: mapStatus(podMetric.pod.status.phase),
          status: podMetric.pod.status.phase,
          level4List, 
        };
      });
  
      return {
        level2Name: capitalize(clusterItem.cluster.name),
        level2Type : "Cluster",
        level3List,
        statusCode : calculateStatus(level3List.map((l3) => l3.statusCode)), 
      };
    });
  
    return {
      level1Name: "POD Status",
      level1Type: "Kubernetes",
      level2List,
      statusCode: calculateStatus(level2List.map((l2) => l2.statusCode)), 
    };
  }
  
 export function transformCICDStatusData(input) {
    const level2List = input.projects.map((project) => ({
      level2Name: project.fullName,
      statusCode: mapBuildStatus(project.lastBuild.status),
      status: project.lastBuild.status
    }));
  
    return {
      level1Name: "CI/CD Status",
      level1Type: "Jenkins",
      statusCode: calculateStatus(level2List.map((l2) => l2.statusCode)), 
      level2List,
    };
  }

  function mapBuildStatus(status) {
    if (status === "SUCCESS") return "GREEN";
    if (status === "running") return "AMBER";
    return "RED"; 
  }
  
  function mapStatus(phase) {
    const statusMap = {
        "Running": "GREEN",
        "Pending": "AMBER",
        "Failed": "RED"
    };
    return statusMap[phase] || "Unknown";
  }
  
  
  function calculateStatus(statusList) {
    if (statusList.every((status) => status === "RED")) {
      return "RED";
    }
    if (statusList.every((status) => status === "GREEN")) {
      return "GREEN";
    }
    return "AMBER";
  }
  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }