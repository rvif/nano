// Logic ✅
// Desktop view ✅
// Mobile view ✅

import { useEffect, useState } from "react";
import {
  Flex,
  Card,
  Text,
  Table,
  Badge,
  Button,
  Spinner,
  Em,
} from "@radix-ui/themes";
import {
  ReloadIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import api from "../../utils/api";

interface ServiceStatus {
  status: string;
  message: string;
}

interface HealthCheckResponse {
  status: string;
  services: {
    [key: string]: ServiceStatus;
  };
}

const HealthCheckPage = () => {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchHealthData = async () => {
    setLoading(true);

    try {
      const response = await api.get("/health");
      setHealthData(response.data);
    } catch (err) {
      // When server is offline, fallback to this health data object
      // with all services marked as unhealthy
      setHealthData({
        status: "unhealthy",
        services: {
          server: {
            status: "unhealthy",
            message: "API server is not responding",
          },
          database: {
            status: "unhealthy",
            message: "Cannot check database health",
          },
          auth: {
            status: "unhealthy",
            message: "Cannot check auth service",
          },
          email: {
            status: "unhealthy",
            message: "Cannot check email service",
          },
          shortner: {
            status: "unhealthy",
            message: "URL shortening service unavailable",
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircledIcon color="green" />;
      case "unhealthy":
        return <CrossCircledIcon color="red" />;
      case "warning":
        return <ExclamationTriangleIcon color="yellow" />;
      default:
        return <ExclamationTriangleIcon color="gray" />;
    }
  };

  const getStatusBadge = (status: string) => {
    let color: "green" | "red" | "yellow" | "gray" = "gray";

    switch (status) {
      case "healthy":
        color = "green";
        break;
      case "unhealthy":
        color = "red";
        break;
      case "warning":
        color = "yellow";
        break;
      default:
        color = "gray";
    }

    return (
      <Badge color={color} size="2" radius="full">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Flex justify="center" className="h-[calc(100vh-110px)]">
      <Flex
        justify="center"
        direction="column"
        gap="3"
        className="w-[650px] h-full"
      >
        {loading ? (
          <Flex align="center" justify="center" py="9" className="w-full">
            <Spinner size="3" />
          </Flex>
        ) : healthData ? (
          <>
            <Card className="w-full">
              <Flex align="center" justify="between" py="3" px="4">
                <Flex align="center" gap="3">
                  <Text weight="medium" size="3" className="min-w-[120px]">
                    System Status:
                  </Text>
                  <Badge
                    size="2"
                    color={
                      healthData.status === "healthy"
                        ? "green"
                        : healthData.status === "warning"
                        ? "yellow"
                        : "red"
                    }
                    radius="full"
                  >
                    {healthData.status === "healthy"
                      ? "All Systems Operational"
                      : healthData.status === "warning"
                      ? "Some Systems Need Attention"
                      : "System Issues Detected"}
                  </Badge>
                </Flex>
                <Button
                  onClick={fetchHealthData}
                  variant="solid"
                  disabled={loading}
                  highContrast
                  color="iris"
                  size="1"
                >
                  {loading ? <Spinner size="1" /> : <ReloadIcon />}
                </Button>
              </Flex>
            </Card>

            <Table.Root variant="surface" className="w-full overflow-hidden">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell width="25%">
                    <Em>Service</Em>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width="25%">
                    <Em>Status</Em>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Em>Message</Em>
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {healthData.services &&
                  Object.entries(healthData.services).map(
                    ([service, status]) => (
                      <Table.Row key={service}>
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            {getStatusIcon(status.status)}
                            <Text
                              weight="medium"
                              style={{ textTransform: "uppercase" }}
                            >
                              {service}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>{getStatusBadge(status.status)}</Table.Cell>
                        <Table.Cell>{status.message}</Table.Cell>
                      </Table.Row>
                    )
                  )}
              </Table.Body>
            </Table.Root>
          </>
        ) : (
          <Card className="w-full">
            <Flex align="center" justify="center" py="4">
              <Text>No health data available</Text>
            </Flex>
          </Card>
        )}
      </Flex>
    </Flex>
  );
};

export default HealthCheckPage;
