//! Test component for future logic to validate short URL slugs present in DB

import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const slugValidator = () => {
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
    // console.log("fetching data");
    return <div>Loading... </div>;
  }
  if (!shortURL) {
    return <Navigate to="not-found" replace />;
  }
  return <div>Found short URL: {shortURL}</div>;
};

export default slugValidator;
