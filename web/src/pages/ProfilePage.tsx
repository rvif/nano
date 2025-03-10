// Logic ✅
// Desktop view ✅
// Mobile view ✅

import { useState } from "react";
import {
  Box,
  Button,
  Avatar,
  Text,
  Card,
  Flex,
  Heading,
  Container,
  Inset,
  Badge,
  Tooltip,
  IconButton,
  Dialog,
  Link,
  Em,
} from "@radix-ui/themes";
import {
  EnvelopeClosedIcon,
  CopyIcon,
  ExternalLinkIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { useAppSelector } from "../store/hooks";
import { formatProfileImageUrl } from "../utils/formatProfileImage";

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const copyToClipboard = (text: string, type: "email" | "url"): void => {
    navigator.clipboard.writeText(text);

    if (type === "email") {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    } else if (type === "url") {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 1500);
    }
  };

  const EmailCopyIcon = () => {
    if (emailCopied) {
      return <CheckIcon width={14} height={14} color="var(--green-9)" />;
    }
    return <CopyIcon width={14} height={14} />;
  };

  const UrlCopyIcon = () => {
    if (urlCopied) {
      return <CheckIcon width={16} height={16} color="var(--green-9)" />;
    }
    return <CopyIcon width={16} height={16} />;
  };

  return (
    <Container
      size="2"
      py="6"
      height={{ initial: "calc(100vh - 180px)" }}
      width={{ initial: "100%" }}
      className=""
    >
      <Flex className=" h-full" align="center" justify="center">
        <Box className="w-[1000px] md:w-full">
          <Flex justify="center" align="center" gap="4">
            <Card size="2" className="w-full !mx-4 md:!mx-0">
              <Inset clip="padding-box" side="top" pb="current">
                <Box height="6" style={{ background: "var(--iris-9)" }} />
              </Inset>

              <Flex
                direction="column"
                align="center"
                gap="2"
                py="2"
                px="4"
                className=""
              >
                <Tooltip content="View image details">
                  <Avatar
                    size="8"
                    radius="full"
                    fallback={
                      user?.username ? user.username[0].toUpperCase() : "U"
                    }
                    src={formatProfileImageUrl(user?.pfpUrl)}
                    color="iris"
                    variant="solid"
                    className="border-4 cursor-pointer"
                    style={{
                      borderColor: "var(--color-background)",
                      marginTop: "-0.5rem",
                    }}
                    onClick={() => setDialogOpen(true)}
                  />
                </Tooltip>

                <Flex direction="column" align="center" gap="1">
                  <Heading as="h1" size="5">
                    @{user?.username}
                  </Heading>
                  {user?.pfpUrl !== "/images/default_pfp.jpg" ? (
                    <Badge size="1" color="iris" variant="soft">
                      Custom Avatar
                    </Badge>
                  ) : (
                    <Badge size="1" color="yellow" variant="soft">
                      Default Avatar
                    </Badge>
                  )}
                </Flex>

                <Flex width="100%" direction="column" pt="4" gap="3">
                  <Flex
                    align="center"
                    justify="between"
                    gap="3"
                    p="2"
                    style={{
                      background: "var(--gray-2)",
                      borderRadius: "var(--radius-3)",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <EnvelopeClosedIcon width={15} height={15} />
                      <Text size="2" className="select-none !tracking-tight">
                        {user?.email}
                      </Text>
                    </Flex>
                    <Tooltip content={emailCopied ? "Copied!" : "Copy email"}>
                      <IconButton
                        size="1"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(user?.email || "", "email")
                        }
                      >
                        <EmailCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Flex>
                </Flex>
              </Flex>
            </Card>

            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Content style={{ maxWidth: 600 }}>
                <Dialog.Title weight="bold" highContrast color="iris">
                  <Em>Profile Image</Em>
                </Dialog.Title>
                <Dialog.Description
                  weight="light"
                  highContrast
                  color="iris"
                  size="2"
                  mb="4"
                >
                  Information about your profile image
                </Dialog.Description>

                <Flex direction="column" gap="3">
                  <Box>
                    <img
                      src={formatProfileImageUrl(user?.pfpUrl)}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "var(--radius-3)",
                        maxHeight: "300px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>

                  <Flex
                    align="center"
                    justify="between"
                    gap="3"
                    p="2"
                    style={{
                      background: "var(--gray-2)",
                      borderRadius: "var(--radius-3)",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <Link
                        href={"http://localhost:8080" + user?.pfpUrl}
                        target="_blank"
                      >
                        <ExternalLinkIcon width={18} height={18} />
                      </Link>

                      <Text size="2" className="select-none !tracking-tighter">
                        http://localhost:8080{user?.pfpUrl}
                      </Text>
                    </Flex>

                    <Tooltip content={urlCopied ? "Copied!" : "Copy image url"}>
                      <IconButton
                        size="1"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            "localhost:8080" + (user?.pfpUrl || ""),
                            "url"
                          )
                        }
                      >
                        <UrlCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Flex>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="solid" highContrast color="iris" size="2">
                      Close
                    </Button>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
};

export default ProfilePage;
