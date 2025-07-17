import {
  Box,
  Card,
  Em,
  Flex,
  Grid,
  Heading,
  Inset,
  Separator,
  Spinner,
  Text,
} from "@radix-ui/themes";

import api from "../utils/api";
import { useEffect, useState } from "react";
import {
  ClockIcon,
  CountdownTimerIcon,
  CrumpledPaperIcon,
  DoubleArrowUpIcon,
  LightningBoltIcon,
  LinkBreak2Icon,
  MagicWandIcon,
  RocketIcon,
  TargetIcon,
} from "@radix-ui/react-icons";
import FormatDate from "../utils/formatDate";

interface Analytics {
  id: string;
  user_id: string;
  total_urls: number;
  avg_daily_clicks: number;
  total_total_clicks: number;
  created_at: string;
  updated_at: string;
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/analytics`);
        setAnalytics(response.data);
      } catch (error: any) {
        console.error("Failed to fetch analytics:", error);
        setError(
          error.response?.data?.error || "Failed to load analytics data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Flex
        width="100%"
        height="calc(100vh - 110px)"
        align="center"
        justify="center"
      >
        <Spinner size="3" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        width="100%"
        height="calc(100vh - 110px)"
        align="center"
        justify="center"
        direction="column"
        gap="4"
      >
        <LinkBreak2Icon width={40} height={40} color="crimson" />
        <Text size="5" color="crimson">
          <Em>{error}</Em>
        </Text>
      </Flex>
    );
  }

  // Test pending
  if (!analytics) {
    return (
      <Flex
        width="100%"
        height="calc(100vh - 110px)"
        align="center"
        justify="center"
      >
        <Text size="5" highContrast color="iris">
          <Em>No analytics data available</Em>
        </Text>
      </Flex>
    );
  }
  ///////////////

  return (
    <Box className="w-full p-6 md:p-10">
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center" className="!mx-6 !mt-7">
          <Heading size="8" highContrast color="iris">
            <Em>Analytics Dashboard</Em>
          </Heading>
          <Text size="2" color="iris" highContrast>
            Last updated: {FormatDate(analytics.updated_at)}
          </Text>
        </Flex>

        <Separator size="4" />

        <Grid
          columns={{ initial: "1", sm: "2", lg: "4" }}
          gap="4"
          className="!mx-6"
        >
          <Card className="overflow-hidden h-[150px]">
            <Inset clip="padding-box" side="top" pb="current">
              <Box />
            </Inset>
            <Flex direction="column" gap="3" p="4">
              <Flex align="center" gap="3">
                <Box>
                  <MagicWandIcon width={24} height={24} color="var(--jade-9)" />
                </Box>
                <Text size="3" color="gray">
                  Total URLs
                </Text>
              </Flex>
              <Heading size="7">
                {analytics.total_urls.toLocaleString()}
              </Heading>
              <Flex gap="2">
                <ClockIcon />
                <Text size="1" color="gray">
                  Created since {FormatDate(analytics.created_at)}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card className="overflow-hidden h-[150px]">
            <Inset clip="padding-box" side="top" pb="current">
              <Box height="2" style={{ background: "var(--iris-9)" }} />
            </Inset>
            <Flex direction="column" gap="3" p="4">
              <Flex align="center" gap="2">
                <Box
                  className="p-2 rounded-full"
                  style={{ background: "var(--iris-3)" }}
                >
                  <TargetIcon width={24} height={24} color="var(--iris-9)" />
                </Box>
                <Text size="2" color="gray">
                  Total Clicks
                </Text>
              </Flex>
              <Heading size="7">
                {analytics.total_total_clicks.toLocaleString()}
              </Heading>
              <Flex gap="2">
                <RocketIcon />
                <Text size="1" color="gray">
                  All-time accumulated clicks
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card className="overflow-hidden h-[150px]">
            <Inset clip="padding-box" side="top" pb="current">
              <Box height="2" style={{ background: "var(--amber-9)" }} />
            </Inset>
            <Flex direction="column" gap="3" p="4">
              <Flex align="center" gap="3">
                <Box
                  className="p-2 rounded-full"
                  style={{ background: "var(--amber-3)" }}
                >
                  <CountdownTimerIcon
                    width={24}
                    height={24}
                    color="var(--amber-9)"
                  />
                </Box>
                <Text size="3" color="gray">
                  Avg. Daily Clicks
                </Text>
              </Flex>
              <Heading size="7">
                {analytics.avg_daily_clicks.toFixed(2)}
              </Heading>
              <Flex gap="2">
                <LightningBoltIcon />
                <Text size="1" color="gray">
                  Average clicks per day
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card className="overflow-hidden h-[150px]">
            <Inset clip="padding-box" side="top" pb="current">
              <Box height="2" style={{ background: "var(--cyan-9)" }} />
            </Inset>
            <Flex direction="column" gap="3" p="4">
              <Flex align="center" gap="3">
                <Box
                  className="p-2 rounded-full"
                  style={{ background: "var(--cyan-3)" }}
                >
                  <DoubleArrowUpIcon
                    width={24}
                    height={24}
                    color="var(--cyan-9)"
                  />
                </Box>
                <Text size="3" color="gray">
                  Clicks per URL
                </Text>
              </Flex>
              <Heading size="7">
                {analytics.total_urls > 0
                  ? (
                      analytics.total_total_clicks / analytics.total_urls
                    ).toFixed(2)
                  : "0.00"}
              </Heading>

              <Flex gap="2">
                <CrumpledPaperIcon />
                <Text size="1" color="gray">
                  Average clicks per link
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        <Card size="3" className="!mx-6">
          <Flex direction="column" gap="3" p="4">
            <Heading size="8" highContrast>
              <Em>Summary</Em>
            </Heading>
            <Text>
              Your {analytics.total_urls} link(s) generated a total of{" "}
              {analytics.total_total_clicks} clicks since{" "}
              {FormatDate(analytics.created_at)}. <br />
              On average, each one of your link receives{" "}
              {analytics.total_urls > 0
                ? (analytics.total_total_clicks / analytics.total_urls).toFixed(
                    1
                  )
                : "0"}{" "}
              clicks, with approximately {analytics.avg_daily_clicks.toFixed(1)}{" "}
              clicks occurring daily (24 hours).
            </Text>
            <Text>
              <Em>
                Tip: Want to increase your clicks? Share your links on social
                media platforms and include them in your email signatures for
                better visibility.
              </Em>
            </Text>
          </Flex>
        </Card>

        <Flex className="!w-full !justify-center !items-center lg:!pb-4 !pb-8">
          <Text size="5" highContrast color="iris">
            <Em>More analytics coming sooon...</Em>
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default AnalyticsPage;
