//! Test component for future logic to validate short URL slugs present in DB

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

const SlugValidator = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shortURL, setShortURL] = useState("");
  const [fetching, setFetching] = useState(true);
  // console.log("Current slug: ", slug);

  useEffect(() => {
    const fetchShortURLS = async () => {
      if (slug) {
        const mockDb = ["xlsq", "xkls", "xkls"];
        // TODO: Fetch short URLS from the backend
        if (mockDb.includes(slug)) {
          setShortURL(slug);
        }
      }
      setFetching(false);
    };

    fetchShortURLS();
  }, [slug]);

  if (fetching) {
    return <div>Loading... </div>;
  }
  if (!shortURL) {
    // Instead of redirecting, render the NotFoundPage directly
    return <NotFoundPage />;
  }
  return <div>Found short URL: {shortURL}</div>;
};

export default SlugValidator;
