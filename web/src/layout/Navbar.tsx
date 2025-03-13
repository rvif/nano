// Logic ✅
// Desktop view ✅
// Mobile view ✅

import {
  Box,
  Button,
  Em,
  Flex,
  Separator,
  Text,
  Tooltip,
  Link,
  DropdownMenu,
} from "@radix-ui/themes";
import { toggleAppearance } from "../store/slices/themeSlice";
import {
  AvatarIcon,
  ExitIcon,
  GitHubLogoIcon,
  HamburgerMenuIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { useEffect } from "react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const appearance = useAppSelector((state) => state.theme.appearance);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;

  const isTabActive = (path: string) => {
    return currentPath === path;
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isAuthenticated || currentPath.startsWith("/auth")) return;
      if (event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        navigate("/shortner");
      }
      if (event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        navigate("/my-links");
      }
      if (event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        navigate("/analytics");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <Box className="h-[46px]">
      <Flex align="center" justify="between" className="h-full">
        {/* logo */}
        <Box pl="4" className="hover:cursor-pointer">
          <Flex align="center" gap="4">
            <Text
              color="iris"
              highContrast
              size="7"
              weight="bold"
              style={{ letterSpacing: "-0.1em" }}
              onClick={() => navigate("/")}
            >
              nano
            </Text>
            <Separator orientation="vertical" size="2" />
          </Flex>
        </Box>

        {/* main-links */}
        <Box className="flex-1">
          <Flex align="center" justify="center" gap="4">
            <div className="w-[70px] justify-center hidden md:flex">
              <Button
                size="2"
                radius="full"
                variant={isTabActive("/shortner") ? "solid" : "ghost"}
                highContrast
                onClick={() => navigate("/shortner")}
                style={{ margin: 0 }}
              >
                <Text size="2" weight="medium">
                  <Em>Shortener</Em>
                </Text>
              </Button>
            </div>

            <div className="w-[90px] justify-center hidden md:flex">
              <Button
                size="2"
                radius="full"
                variant={isTabActive("/my-links") ? "solid" : "ghost"}
                highContrast
                onClick={() => navigate("/my-links")}
                style={{ margin: 0 }}
              >
                <Text size="2" weight="medium">
                  <Em>Nano’d Links </Em>
                </Text>
              </Button>
            </div>

            <div className="w-[70px] justify-center hidden md:flex">
              <Button
                size="2"
                radius="full"
                variant={isTabActive("/analytics") ? "solid" : "ghost"}
                highContrast
                onClick={() => navigate("/analytics")}
                style={{ margin: 0 }}
              >
                <Text size="2" weight="medium">
                  <Em>Analytics</Em>
                </Text>
              </Button>
            </div>
          </Flex>
        </Box>

        {/* account-links, toggle */}
        <Box pr="4">
          <Flex align="center" gap="4">
            <Separator orientation="vertical" size="2" />
            <Box>
              <Flex align="center" gap="4">
                {isAuthenticated ? (
                  <DropdownMenu.Root modal={false}>
                    <DropdownMenu.Trigger>
                      <Button variant="ghost" highContrast>
                        <Flex align="center" gap="2">
                          <ProfileAvatar
                            pfpUrl={user?.pfpUrl}
                            username={user?.username || ""}
                            size="1"
                          />
                          <Text size="2">{user?.username || "User"}</Text>
                        </Flex>
                      </Button>
                      {/* </Tooltip> */}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        color="iris"
                        onClick={() => navigate("/me")}
                      >
                        <AvatarIcon />
                        Profile
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red" onClick={handleLogout}>
                        <Flex align="center" gap="2">
                          <ExitIcon />
                          Logout
                        </Flex>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                ) : (
                  <Button
                    size="2"
                    variant="ghost"
                    highContrast
                    onClick={() => navigate("/auth/login")}
                  >
                    <Text weight="medium">Login</Text>
                  </Button>
                )}

                <Tooltip content="View GitHub">
                  <Button size="2" variant="ghost" highContrast>
                    <Link href="https://github.com/rvif" target="_blank">
                      <GitHubLogoIcon width={16} height={16} />
                    </Link>
                  </Button>
                </Tooltip>

                <Tooltip content="Toggle Theme">
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
                </Tooltip>

                {/* // Sidebar for md and below */}
                <Tooltip content="Toggle sidebar">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button
                        size="2"
                        variant="ghost"
                        highContrast
                        className="md:!hidden"
                        color="iris"
                      >
                        <HamburgerMenuIcon width="16" height="16" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        shortcut="Shift + S"
                        onClick={() => navigate("/shortner")}
                      >
                        Shortener
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        shortcut="Shift + L"
                        onClick={() => navigate("/my-links")}
                      >
                        My Links
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        shortcut="Shift + A"
                        onClick={() => navigate("/analytics")}
                      >
                        Analytics
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Tooltip>
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
