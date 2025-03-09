import { Box, Button, Em, Flex, Separator, Text } from "@radix-ui/themes";
import { toggleAppearance } from "../store/themeSlice";
import { GitHubLogoIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const appearance = useAppSelector((state) => state.theme.appearance);

  return (
    <Box
      style={{
        height: "46px",
      }}
    >
      <Flex align="center" justify="between" style={{ height: "100%" }}>
        {/* logo */}
        <Box pl="4">
          <Flex align="center" gap="4">
            <Text
              color="iris"
              highContrast
              size="7"
              weight="bold"
              style={{ letterSpacing: "-0.1em" }}
            >
              nano<span style={{ fontStyle: "italic" }}>URL</span>
            </Text>
            <Separator orientation="vertical" size="2" />
          </Flex>
        </Box>

        {/* main-links */}
        <Box>
          <Flex align="center" gap="4">
            <Button size="2" radius="full" variant="ghost" highContrast>
              <Text size="2" weight="medium">
                <Em>Dashboard</Em>
              </Text>
            </Button>
            <Button size="2" radius="full" variant="ghost" highContrast>
              <Text size="2" weight="medium">
                <Em>My links</Em>
              </Text>
            </Button>
            <Button size="2" radius="full" variant="ghost" highContrast>
              <Text size="2" weight="medium">
                <Em>Analytics</Em>
              </Text>
            </Button>
          </Flex>
        </Box>

        {/* account-links, toggle */}
        <Box pr="4">
          <Flex align="center" gap="4">
            <Separator orientation="vertical" size="2" />
            <Box>
              <Flex align="center" gap="4">
                <Button
                  size="2"
                  variant="ghost"
                  highContrast
                  onClick={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                  }}
                >
                  <Text weight="medium">Login</Text>
                </Button>
                <Button size="2" variant="ghost" highContrast>
                  <GitHubLogoIcon width={16} height={16} />
                </Button>
                <Button
                  size="2"
                  variant="ghost"
                  highContrast
                  onClick={() => dispatch(toggleAppearance())}
                >
                  {appearance == "light" ? (
                    <SunIcon width={16} height={16} />
                  ) : (
                    <MoonIcon width={16} height={16} />
                  )}
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Flex>
      <Separator orientation="horizontal" size="4" />
    </Box>
  );
};

export default Navbar;
