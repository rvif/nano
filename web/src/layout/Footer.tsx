import {
  Box,
  Em,
  Flex,
  Link,
  Quote,
  Separator,
  Text,
  Button,
  Tooltip,
} from "@radix-ui/themes";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box className="lg:h-[64px] h-auto py-4">
      <Separator orientation="horizontal" size="4" />
      <Flex
        direction={{ initial: "column", md: "row" }}
        align="center"
        justify="between"
        className="h-full px-4 md:px-6 text-center md:text-left"
      >
        <Box className="!my-1 lg:mb-0 !pl-6">
          <Flex gap="2" align="center">
            <Text color="iris" weight="medium" highContrast>
              © nano, Inc.
            </Text>
            <Tooltip content="System Health Status">
              <Button
                size="1"
                variant="soft"
                color="iris"
                onClick={() => navigate("/health")}
              >
                <HeartFilledIcon width={18} height={18} />
              </Button>
            </Tooltip>
          </Flex>
        </Box>
        <Box className="!pr-6">
          <Flex align="center" direction="column">
            <Text color="iris" highContrast size="3" weight="light">
              <Quote>nano fast, nano simple</Quote> 💞{" "}
              <Link
                href="https://www.linkedin.com/in/ravijeet-sharma-9a75a2230/"
                target="_blank"
                underline="hover"
                highContrast
              >
                <Em>rvif</Em>
              </Link>
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default Footer;
