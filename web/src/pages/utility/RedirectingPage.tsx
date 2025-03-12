// Logic ✅
// Desktop view ✅
// Mobile view ✅

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import { Card, Em, Text } from "@radix-ui/themes";

function RedirectingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    async function checkSlug() {
      try {
        const response = await fetch(`/api/v1/url/${slug}`);

        if (response.status === 404) {
          setError("URL not found");
          setLoading(false);
        } else if (response.ok) {
          const data = await response.json();
          setRedirectUrl(data.originalURL);
        } else {
          setError("Something went wrong");
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch URL");
        setLoading(false);
      }
    }

    checkSlug();
  }, [slug, navigate]);

  useEffect(() => {
    if (!redirectUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl]);

  if (error) {
    return <NotFoundPage />;
  }

  if (loading || redirectUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md mx-auto p-5 text-center">
          <Text as="div" size="2" weight="bold">
            <Em>Redirecting...</Em>
          </Text>
          <Text as="p" className="mt-2">
            Please wait while we redirect you
          </Text>
          {redirectUrl && (
            <Text as="p" size="1" className="mt-2">
              Redirecting in {countdown} seconds
            </Text>
          )}
        </Card>
      </div>
    );
  }

  return null;
}

export default RedirectingPage;
