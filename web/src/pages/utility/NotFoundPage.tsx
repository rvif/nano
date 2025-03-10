import { Box, Flex, Heading, Text, Em, Link } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

const NotFoundPage = () => {
  return (
    <Box className="h-[calc(100vh-110px)]">
      <Flex
        direction="column"
        gap="6"
        align="center"
        justify="center"
        className="h-full"
      >
        <Flex direction="column" align="center" justify="start" gap="4">
          <Box style={{ overflow: "hidden" }}>
            <Heading
              size="9"
              align="center"
              color="iris"
              highContrast
              style={{ letterSpacing: "-0.05em" }}
            >
              404
            </Heading>

            <Heading as="h2" size="6" align="center" mb="2" mt="1">
              <Em>Page not found</Em>
            </Heading>

            <Text align="center" color="gray" size="3" mb="4">
              The page you're looking for doesn't exist or has been moved.
            </Text>
          </Box>

          <Link underline="hover" color="iris" highContrast href="/" size="4">
            <Flex align="center" gap="1">
              <ArrowLeftIcon />
              Back to Home
            </Flex>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default NotFoundPage;
