// Logic ✅
// Desktop view ✅
// Mobile view ✅

import {
  Box,
  Button,
  Card,
  Em,
  Flex,
  Text,
  TextField,
  Link,
  Heading,
  Callout,
  Separator,
  Tooltip,
} from "@radix-ui/themes";
import api from "../utils/api";
import { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import {
  CheckCircledIcon,
  CopyIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
  CrossCircledIcon,
  CheckIcon,
} from "@radix-ui/react-icons";

// Forbidden custom URL paths
const RESERVED_PATHS = [
  "api",
  "auth",
  "login",
  "signup",
  "admin",
  "home",
  "dashboard",
  "user",
  "profile",
  "settings",
  "about",
  "contact",
];

const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidCustomPath = (path: string): boolean => {
  if (!path) return true;
  if (path.length < 3) return false;
  if (RESERVED_PATHS.includes(path.toLowerCase())) return false;
  // alphanumerical characters, hyphens, and underscores pnly
  return /^[a-zA-Z0-9-_]+$/.test(path);
};

const ShortnerPage = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [customPathError, setCustomPathError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setUrlError(null);
  }, [url]);

  useEffect(() => {
    setCustomPathError(null);
  }, [shortUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUrl(url)) {
      setUrlError("Please enter a valid URL with http:// or https:// prefix");
      return;
    }
    if (shortUrl && !isValidCustomPath(shortUrl)) {
      setCustomPathError(
        "Custom path must be at least 3 characters and contain only letters, numbers, hyphens, and underscores. Some terms are reserved."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSuccess(false);

    try {
      const response = await api.post("/url/shorten", {
        user_id: user?.id,
        url: url,
        short_url: shortUrl || undefined, // send if it has a value
      });

      setResult(response.data.short_url);
      setSuccess(true);
    } catch (error: any) {
      console.error("Error shortening URL:", error);
      setError(
        error.response?.data?.message ||
          "Failed to shorten URL. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText("http://localhost:5173/" + result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box
      width="100%"
      height="calc(100vh - 110px)"
      className="!flex items-center justify-center"
    >
      <Box className="!w-[80%] sm:!w-lg md:!w-xl lg:!w-[40rem] 2xl:!w-[50rem]">
        <Heading size="8" className="!mb-2 !ml-2">
          <Em>Shorten a URL</Em>
        </Heading>
        <Card className="!p-3 shadow-lg rounded-xl">
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Box>
                <Text
                  as="label"
                  size="3"
                  weight="medium"
                  className="!mb-2 !block"
                >
                  URL to Shorten
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="Enter your looooong url (https://...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="!w-full !mt-2"
                  color={urlError ? "red" : undefined}
                />
                {urlError && (
                  <Text size="1" color="red" className="!mt-1">
                    {urlError}
                  </Text>
                )}
              </Box>

              <Box>
                <Flex align="baseline" gap="2" className="!mb-2">
                  <Text as="label" size="3" weight="medium">
                    Custom URL Path (Optional)
                  </Text>
                  <Text size="1" color="gray" className="!italic">
                    Make it memorable
                  </Text>
                </Flex>
                <TextField.Root
                  size="3"
                  placeholder="my-awesome-link"
                  value={shortUrl}
                  onChange={(e) => setShortUrl(e.target.value)}
                  className="!w-full !mt-2"
                  color={customPathError ? "red" : undefined}
                />
                {customPathError && (
                  <Text size="1" color="red" className="!mt-1">
                    {customPathError}
                  </Text>
                )}
              </Box>
            </Flex>
            <Flex justify="end" gap="2" className="!mt-4">
              {url && (
                <Button
                  type="reset"
                  variant="soft"
                  radius="large"
                  onClick={() => {
                    setUrl("");
                    setShortUrl("");
                    setResult(null);
                    setError(null);
                    setSuccess(false);
                    setUrlError(null);
                    setCustomPathError(null);
                  }}
                >
                  Clear
                </Button>
              )}
              <Button
                type="submit"
                radius="large"
                disabled={isLoading || !url}
                className={!url ? "!opacity-50" : ""}
              >
                {isLoading ? (
                  <Flex gap="2" align="center">
                    <div className="!w-4 !h-4 !border-2 !border-t-transparent !border-white !rounded-full !animate-spin"></div>
                    <span>Shortening...</span>
                  </Flex>
                ) : success ? (
                  <Flex gap="2" align="center">
                    <CheckCircledIcon />
                    <span>URL Shortened!</span>
                  </Flex>
                ) : (
                  "Create Short URL"
                )}
              </Button>
            </Flex>
          </form>

          {error && (
            <Callout.Root color="red" className="!mt-4">
              <Callout.Icon>
                <CrossCircledIcon />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          {result && (
            <>
              <Separator orientation="horizontal" className="!my-3" size="4" />
              <Box>
                <Callout.Root color="green" className="!mb-3">
                  <Callout.Icon>
                    <CheckCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Your shortened URL is ready to share!
                  </Callout.Text>
                </Callout.Root>

                <Card className="!p-4 ">
                  <Flex gap="3" align="center">
                    <Text
                      size="4"
                      weight="light"
                      className="!text-slate-700 !truncate !flex-grow"
                    >
                      <Em>{"http://localhost:5173/" + result}</Em>
                    </Text>
                    <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                      <Button
                        size="2"
                        variant={copied ? "soft" : "outline"}
                        onClick={copyToClipboard}
                        className="!whitespace-nowrap"
                        radius="large"
                      >
                        {copied ? (
                          <div className="w-14 flex items-center justify-center">
                            <CheckIcon />
                          </div>
                        ) : (
                          <>
                            <CopyIcon /> Copy
                          </>
                        )}
                      </Button>
                    </Tooltip>
                    <Tooltip content="Open in new tab">
                      <Button asChild size="2" variant="outline" radius="large">
                        <Link
                          href={result}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLinkIcon />
                          Test Link
                        </Link>
                      </Button>
                    </Tooltip>
                  </Flex>
                </Card>

                <Text
                  size="2"
                  color="gray"
                  className="!mt-4 !italic !text-center"
                >
                  Share this link anywhere to redirect users to your original
                  URL
                </Text>
              </Box>
            </>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default ShortnerPage;
