// Logic ✅
// Desktop view ✅
// Mobile view ✅

import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAppSelector } from "../store/hooks";
import {
  Box,
  Button,
  Table,
  Flex,
  Heading,
  Text,
  Card,
  IconButton,
  Spinner,
  Tooltip,
  Em,
  Switch,
  DropdownMenu,
  AlertDialog,
  Dialog,
  TextField,
  Popover,
} from "@radix-ui/themes";
import {
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  TrashIcon,
  Pencil1Icon,
  BarChartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HamburgerMenuIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import FormatDate from "../utils/formatDate";
import { generateAbsoluteUrl } from "../utils/urlGenerator";

interface URL {
  id?: string;
  url: string;
  short_url: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Analytics {
  totalClicks: number;
  dailyClicks: number;
  lastClicked: string | null;
  loading: boolean;
}

//! quick fix

const isNullOrEpochDate = (dateString: string | null): boolean => {
  if (!dateString) return true;

  const date = new Date(dateString);
  return (
    date.getFullYear() < 1990 ||
    dateString.includes("Jan 1, 05:53") ||
    date.getTime() === 0 ||
    dateString.includes("1 Jan 1")
  );
};

const MyLinksPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [urls, setUrls] = useState<URL[]>(() => {
    // try to load cached URLs from localStorage
    try {
      const cachedUrls = localStorage.getItem("cached_user_urls");
      return cachedUrls ? JSON.parse(cachedUrls) : [];
    } catch (error) {
      console.error("Error loading cached URLs:", error);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(() => {
    const storedValue = localStorage.getItem("entriesPerPage");
    return storedValue ? parseInt(storedValue, 10) : 5;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [truncateUrls, setTruncateUrls] = useState(true);

  useEffect(() => {
    localStorage.setItem("entriesPerPage", entriesPerPage.toString());
  }, [entriesPerPage]);

  // cache URLs whenever they change
  useEffect(() => {
    if (urls.length > 0) {
      try {
        localStorage.setItem("cached_user_urls", JSON.stringify(urls));
      } catch (error) {
        console.error("Error caching URLs:", error);
      }
    }
  }, [urls]);

  useEffect(() => {
    const fetchUrls = async () => {
      if (!user?.id) {
        setError("You must be logged in to view your links");
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const response = await api.post("/url/get-urls", { user_id: user.id });

        if (!response.data || response.data.length === 0) {
          setUrls([]);
          // if there's cached data but API returns empty, clear the cache
          localStorage.removeItem("cached_user_urls");
          setError(""); // clear any previous errors
        } else if (Array.isArray(response.data)) {
          setUrls(response.data);
          setError(""); // clear any previous errors
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Invalid response from server.");
        }
      } catch (err) {
        console.error("Error fetching URLs:", err);
        setError("Failed to load your links. Please try again later.");
        // Don't clear cached URLs on error - keep showing previous data
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    // if we already have cached data, mark as initialized
    // this ensures we show cached data immediately
    if (urls.length > 0) {
      setInitialized(true);
    }

    fetchUrls();
  }, [user]);

  const fetchUrls = async () => {
    if (!user?.id) {
      setError("You must be logged in to view your links");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/url/get-urls", { user_id: user.id });
      // console.log(response.data);

      if (!response.data || response.data.length === 0) {
        // response is null, or an empty array, set urls to an empty array
        setUrls([]);
        // clear cache if API returns empty
        localStorage.removeItem("cached_user_urls");
        setError(""); // Clear any previous errors
      } else if (Array.isArray(response.data)) {
        setUrls(response.data);
        setError(""); // clear previous errors
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Invalid response from server.");
      }
    } catch (err) {
      console.error("Error fetching URLs:", err);
      setError("Failed to load your links. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // calculate current page items
  const getCurrentPageItems = () => {
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    return urls.slice(indexOfFirstEntry, indexOfLastEntry);
  };

  // update total pages whenever urls or entriesPerPage changes
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(urls.length / entriesPerPage)));
    // reset to first page when changing entries per page
    setCurrentPage(1);
  }, [urls, entriesPerPage]);

  // handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // handle entries per page change
  const handleEntriesPerPageChange = (value: string) => {
    setEntriesPerPage(Number(value));
  };

  const copyToClipboard = (shortUrl: string, id?: string) => {
    const fullUrl = generateAbsoluteUrl(shortUrl);
    navigator.clipboard.writeText(fullUrl);

    setCopiedId(id || null);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const deleteUrl = async (shortUrl: string) => {
    try {
      const response = await api.post("/url/delete/:short_url", {
        short_url: shortUrl,
      });

      // server returns {message: 'URL deleted'} on successful deletion
      if (response.data.message === "URL deleted") {
        // console.log("URL deleted:", shortUrl);

        await fetchUrls();
        // fetchUrls function will update the cache
        console.log(response.data);
      } else {
        console.error("Unexpected response from server:", response.data);
        setError("Failed to delete URL. Please try again later.");
      }
    } catch (err) {
      console.error("Error deleting URL:", err);
      setError("Failed to delete URL. Please try again later");
    }
  };

  const [analyticsMap, setAnalyticsMap] = useState<Record<string, Analytics>>(
    {}
  );

  const analytics = async (shortUrl: string) => {
    try {
      setAnalyticsMap((prev) => ({
        ...prev,
        [shortUrl]: {
          totalClicks: prev[shortUrl]?.totalClicks || 0,
          dailyClicks: prev[shortUrl]?.dailyClicks || 0,
          lastClicked: prev[shortUrl]?.lastClicked || null,
          loading: true,
        },
      }));

      const response = await api.post("/url/analytics/:short_url", {
        short_url: shortUrl,
      });

      if (response.status === 200) {
        const totalClicks = response.data.total_clicks?.Int32 || 0;
        const dailyClicks = response.data.daily_clicks?.Int32 || 0;
        const lastClicked = response.data.last_clicked?.Time || null;

        setAnalyticsMap((prev) => ({
          ...prev,
          [shortUrl]: {
            totalClicks,
            dailyClicks,
            lastClicked,
            loading: false,
          },
        }));
        // console.log("Analytics for", shortUrl, ":", response.data);
      } else {
        console.error("Unexpected response from server:", response.data);
        setError(
          "Failed to load analytics of the URL. Please try again later."
        );

        setAnalyticsMap((prev) => ({
          ...prev,
          [shortUrl]: {
            totalClicks: prev[shortUrl]?.totalClicks || 0,
            dailyClicks: prev[shortUrl]?.dailyClicks || 0,
            lastClicked: prev[shortUrl]?.lastClicked || null,
            loading: false,
          },
        }));
      }
    } catch (err) {
      console.error("Error loading analytics for the URL:", err);
      setError("Error loading analytics for the URL. Please try again later");

      setAnalyticsMap((prev) => ({
        ...prev,
        [shortUrl]: {
          totalClicks: prev[shortUrl]?.totalClicks || 0,
          dailyClicks: prev[shortUrl]?.dailyClicks || 0,
          lastClicked: prev[shortUrl]?.lastClicked || null,
          loading: false,
        },
      }));
    }
  };

  const [newUrl, setNewUrl] = useState<string>("");
  const [newShortUrl, setNewShortUrl] = useState<string>("");
  const [editingUrl, setEditingUrl] = useState<URL | null>(null);

  const prepareUpdateUrl = (url: URL) => {
    // console.log(url);
    setEditingUrl(url);
    setNewUrl(url.url || "");
    setNewShortUrl(url.short_url || "");
  };

  const updateUrl = async () => {
    if (!editingUrl?.id) {
      console.error("Invalid URL ID:", editingUrl?.id);
      setError("Invalid URL ID. Please try again later.");
      return;
    }

    try {
      const payload: any = { url_id: editingUrl.id };
      if (newUrl.trim() && newUrl !== editingUrl.url) {
        payload.new_url = newUrl.trim();
      }

      if (newShortUrl.trim() && newShortUrl !== editingUrl.short_url) {
        payload.new_short_url = newShortUrl.trim();
      }

      if (!payload.new_url && !payload.new_short_url) {
        // console.log("No changes made to URL");
        return;
      }

      const response = await api.post("/url/update/:id", payload);

      if (response.status === 200) {
        // clear edit state and reload URLs on successful update
        setNewUrl("");
        setNewShortUrl("");
        setEditingUrl(null);
        await fetchUrls();
      } else {
        console.error("Unexpected response from server:", response.data);
        setError("Failed to update URL. Please try again later.");
      }
    } catch (err: any) {
      console.error("Error updating URL:", err);
      setError(
        err.response?.data?.error ||
          "Failed to update URL. Please try again later."
      );
    }
  };

  return (
    <Flex direction="column" gap="4" className="w-full !px-10 !py-10 md:px-8">
      <Flex justify="between" align="center" gap="4">
        <Heading size="8" color="iris" highContrast>
          <Em>Your Links</Em>
        </Heading>
        <Text color="gray" size="2">
          manage all your nano'd URLs in one place.
        </Text>
      </Flex>

      {loading || !initialized ? (
        <Card className="w-full !mt-4">
          <Flex align="center" justify="center" py="9">
            <Spinner size="2" />
          </Flex>
        </Card>
      ) : urls.length === 0 ? (
        <Card className="w-full mt-4">
          <Flex
            align="center"
            justify="center"
            direction="column"
            py="9"
            gap="2"
          >
            <Text color="gray">
              You haven't created any shortened URLs yet.
            </Text>
            <Button
              color="iris"
              variant="soft"
              onClick={() => navigate("/shortner")}
            >
              Create your first link
            </Button>
          </Flex>
        </Card>
      ) : error ? (
        <Card className="w-full mt-4">
          <Flex align="center" justify="center" py="6">
            <Text color="red">{error}</Text>
          </Flex>
        </Card>
      ) : (
        <>
          <Flex justify="end" align="center" gap="2">
            <Text size="2">Truncate URLs</Text>
            <Tooltip
              content={truncateUrls ? "Show full URLs" : "Truncate URLs"}
            >
              <Switch
                checked={truncateUrls}
                onCheckedChange={setTruncateUrls}
                size="1"
                color="iris"
              />
            </Tooltip>
          </Flex>

          <Box className="w-full overflow-auto">
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Original URL</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Short URL</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Updated</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {getCurrentPageItems().map((url) => (
                  <Table.Row key={url.id || url.short_url}>
                    <Table.Cell>
                      <Box
                        className={truncateUrls ? "max-w-[250px] truncate" : ""}
                      >
                        <Flex
                          gap="2"
                          align="center"
                          wrap={truncateUrls ? "nowrap" : "wrap"}
                        >
                          <Text
                            size="2"
                            className={truncateUrls ? "truncate" : "break-all"}
                            style={{
                              maxWidth: truncateUrls ? "250px" : "100%",
                              wordBreak: truncateUrls ? "normal" : "break-all",
                            }}
                          >
                            {url.url}
                          </Text>
                        </Flex>
                      </Box>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="4" align="center">
                        {url.short_url}
                        <Tooltip content="Open in new tab">
                          <IconButton
                            variant="ghost"
                            onClick={() => {
                              const fullUrl = generateAbsoluteUrl(
                                url.short_url
                              );
                              window.open(`${fullUrl}`, "_blank");
                            }}
                            className=""
                          >
                            <ExternalLinkIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          content={
                            copiedId === (url.id || url.short_url)
                              ? "Copied!"
                              : "Copy to clipboard"
                          }
                        >
                          <IconButton
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(
                                url.short_url,
                                url.id || url.short_url
                              )
                            }
                          >
                            {copiedId === (url.id || url.short_url) ? (
                              <CheckIcon color="green" />
                            ) : (
                              <CopyIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>{FormatDate(url.created_at)}</Table.Cell>
                    <Table.Cell>{FormatDate(url.updated_at)}</Table.Cell>
                    <Table.Cell>
                      <Flex gap="4" className="!pl-5">
                        <DropdownMenu.Root modal={false}>
                          <DropdownMenu.Trigger>
                            <IconButton variant="ghost">
                              <HamburgerMenuIcon />
                            </IconButton>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Content>
                            <DropdownMenu.Item color="iris" asChild>
                              <Popover.Root>
                                <Popover.Trigger>
                                  <Button
                                    color="jade"
                                    variant="ghost"
                                    className="!mx-0 !mb-1 !p-1"
                                    highContrast
                                    onClick={() => analytics(url.short_url)}
                                  >
                                    <Flex
                                      gap="2"
                                      align="center"
                                      className="w-[100px]"
                                    >
                                      <BarChartIcon />
                                      Analytics
                                    </Flex>
                                  </Button>
                                </Popover.Trigger>
                                <Popover.Content width="300px">
                                  <Flex direction="column" gap="1" p="4">
                                    {analyticsMap[url.short_url]?.loading ? (
                                      <Flex
                                        align="center"
                                        justify="center"
                                        py="2"
                                      >
                                        <Spinner size="1" />
                                      </Flex>
                                    ) : (
                                      <>
                                        <Text>
                                          Total clicks:{" "}
                                          <Em>
                                            {analyticsMap[url.short_url]
                                              ?.totalClicks || 0}
                                          </Em>
                                        </Text>
                                        <Text>
                                          Clicks in last 24 hours:{" "}
                                          <Em>
                                            {analyticsMap[url.short_url]
                                              ?.dailyClicks || 0}
                                          </Em>
                                        </Text>
                                        <Text>
                                          Last clicked:{" "}
                                          <Em>
                                            {!analyticsMap[url.short_url]
                                              ?.lastClicked ||
                                            isNullOrEpochDate(
                                              analyticsMap[url.short_url]
                                                ?.lastClicked
                                            )
                                              ? "Never clicked"
                                              : FormatDate(
                                                  analyticsMap[url.short_url]
                                                    ?.lastClicked
                                                )}
                                          </Em>
                                        </Text>
                                      </>
                                    )}
                                  </Flex>
                                </Popover.Content>
                              </Popover.Root>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item color="jade" asChild>
                              <Dialog.Root>
                                <Dialog.Trigger>
                                  <Button
                                    color="indigo"
                                    variant="ghost"
                                    className="!mx-0 !mb-1 !p-1"
                                    highContrast
                                    onClick={() => prepareUpdateUrl(url)}
                                  >
                                    <Flex
                                      gap="2"
                                      align="center"
                                      className="w-[100px]"
                                    >
                                      <Pencil1Icon />
                                      Edit URL
                                    </Flex>
                                  </Button>
                                </Dialog.Trigger>
                                <Dialog.Content>
                                  <Dialog.Title>Edit URL</Dialog.Title>
                                  <Dialog.Description size="2" mb="4">
                                    Make changes to your shortened URL.
                                  </Dialog.Description>

                                  <Flex direction="column" gap="3">
                                    <label>
                                      <Text
                                        as="div"
                                        size="2"
                                        mb="1"
                                        weight="bold"
                                      >
                                        Original URL
                                      </Text>
                                      <TextField.Root
                                        defaultValue={url.url}
                                        placeholder="Enter the original URL"
                                        onChange={(e) =>
                                          setNewUrl(e.target.value)
                                        }
                                      />
                                    </label>
                                    <label>
                                      <Text
                                        as="div"
                                        size="2"
                                        mb="1"
                                        weight="bold"
                                      >
                                        Custom Slug
                                      </Text>
                                      <TextField.Root
                                        defaultValue={url.short_url}
                                        placeholder="Enter custom slug (optional)"
                                        onChange={(e) =>
                                          setNewShortUrl(e.target.value)
                                        }
                                      />
                                    </label>
                                  </Flex>

                                  <Flex gap="3" mt="4" justify="end">
                                    <Dialog.Close>
                                      <Button variant="soft">Cancel</Button>
                                    </Dialog.Close>
                                    <Dialog.Close>
                                      <Button onClick={updateUrl}>Save</Button>
                                    </Dialog.Close>
                                  </Flex>
                                </Dialog.Content>
                              </Dialog.Root>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item color="crimson" asChild>
                              <AlertDialog.Root>
                                <AlertDialog.Trigger>
                                  <Button
                                    color="ruby"
                                    variant="ghost"
                                    className="!mx-0 !p-1"
                                    highContrast
                                  >
                                    <Flex
                                      align="center"
                                      gap="2"
                                      className="w-[100px]"
                                    >
                                      <TrashIcon />
                                      Delete URL
                                    </Flex>
                                  </Button>
                                </AlertDialog.Trigger>
                                <AlertDialog.Content>
                                  <AlertDialog.Title>
                                    Delete URL
                                  </AlertDialog.Title>
                                  <AlertDialog.Description>
                                    Are you sure you want to delete this URL?
                                  </AlertDialog.Description>
                                  <Flex gap="3" mt="4" justify="end">
                                    <AlertDialog.Cancel>
                                      <Button variant="soft">Cancel</Button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action>
                                      <Button
                                        variant="solid"
                                        color="crimson"
                                        onClick={() => deleteUrl(url.short_url)}
                                      >
                                        Delete
                                      </Button>
                                    </AlertDialog.Action>
                                  </Flex>
                                </AlertDialog.Content>
                              </AlertDialog.Root>
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* pagination controls */}
          <Flex justify="between" align="center" mt="4">
            <Flex align="center" gap="2">
              <Text size="2">
                <Em>Rows</Em> per page
              </Text>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger>
                  <Button variant="surface" size="2">
                    <ChevronDownIcon />
                    {entriesPerPage}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {[5, 10, 15, 20].map((value) => (
                    <DropdownMenu.Item
                      key={value}
                      onClick={() =>
                        handleEntriesPerPageChange(value.toString())
                      }
                    >
                      {value}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>

            <Flex align="center" gap="2">
              <Text size="2">
                {urls.length > 0
                  ? `${(currentPage - 1) * entriesPerPage + 1}-${Math.min(
                      currentPage * entriesPerPage,
                      urls.length
                    )} of ${urls.length}`
                  : "0 items"}
              </Text>

              <Flex gap="1">
                <IconButton
                  size="1"
                  variant="soft"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <IconButton
                  size="1"
                  variant="soft"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Flex>
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default MyLinksPage;
