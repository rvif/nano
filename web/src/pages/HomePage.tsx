// Desktop view ✅
// Mobile view ✅

import { Separator, Text, Box, Flex, Em, Badge } from "@radix-ui/themes";

const HomePage = () => {
  return (
    <Flex
      className="h-[calc(100vh-110px)] overflow-y-hidden"
      gap="2"
      direction={{ initial: "column", xl: "row" }}
    >
      <Box className="h-[calc(100vh-110px)] xl:flex-1/2">
        <Flex align="center" justify="center" className="h-full">
          <Flex
            align="start"
            justify="center"
            direction="column"
            className="h-full"
          >
            <Badge color="orange">Beta</Badge>
            <Flex direction="row" align="center" gap={{ sm: "7" }}>
              <Box className="w-[220px] relative sm:w-[220px] md:w-[240px] lg:w-[260px]">
                <Text
                  color="iris"
                  highContrast
                  className="font-bold text-7xl md:text-8xl"
                  style={{
                    letterSpacing: "-0.1em",
                    lineHeight: 1,
                  }}
                >
                  nano
                </Text>
                <Text
                  color="iris"
                  highContrast
                  style={{
                    top: "5px",
                  }}
                  className="sm:text-l md:text-xl !absolute left-[160px] md:left-[210px]"
                >
                  <Em>URL</Em>
                </Text>
              </Box>

              <Separator
                orientation={{ initial: "vertical", xl: "vertical" }}
                size="3"
                className="md:h-[70px] lg:h-[80px]"
              />
              <Box pl={{ initial: "6", sm: "1" }}>
                <Text
                  color="iris"
                  highContrast
                  size={{ initial: "2", sm: "3", md: "4" }}
                  weight="light"
                >
                  tiny URLs, powerful analytics
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Separator
        size="4"
        orientation={{ initial: "horizontal", xl: "vertical" }}
      />

      <Box className="h-[calc(100vh-110px)] xl:flex-1/2 md:!my-4 !my-0 ">
        <Flex align="center" justify="center" className="h-full xl:pb-0">
          <img
            src="/hero.webp"
            alt="Nano Dashboard"
            className="w-full max-w-[450px] md:max-w-xl xl:max-w-2xl rounded-2xl transition-shadow duration-300"
            style={{ boxShadow: "var(--shadow-4)" }}
          />
        </Flex>
      </Box>
    </Flex>
  );
};

export default HomePage;
