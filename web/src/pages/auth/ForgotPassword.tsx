// Logic ✅
// Desktop view ✅
// Mobile view ✅

import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Link,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";
import { ArrowLeftIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [countdownIntervalId, setCountdownIntervalId] = useState<number | null>(
    null
  );

  function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const isValidEmail = validateEmail(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setShowValidation(false);
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    setShowValidation(true);

    if (!isValidEmail) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post("/auth/forgot-password", {
        email,
      });

      localStorage.setItem("registeredEmail", email);
      sessionStorage.setItem("registeredEmail", email);

      setIsSubmitted(true);

      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }

      const intervalId = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalId) clearInterval(intervalId);
            navigate("/auth/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setCountdownIntervalId(intervalId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(
          error.response.data.error ||
            "Failed to process your request. Please try again."
        );
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up interval when component unmounts
  useEffect(() => {
    return () => {
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
    };
  }, [countdownIntervalId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Box className="h-[calc(100vh-110px)]">
      <Flex
        align="center"
        justify="center"
        direction="column"
        gap="3"
        className="h-full"
      >
        <Text weight="medium" size="7" highContrast color="iris">
          Reset Password
        </Text>
        <Card variant="classic" className="w-[450px]">
          {!isSubmitted ? (
            <Flex direction="column" gap="1">
              <Flex direction="column" p="5" gap="3" onKeyDown={handleKeyDown}>
                <Text size="3" weight="regular" highContrast>
                  Enter your email address and we'll send you a link to reset
                  your password.
                </Text>

                <Text size="4" weight="medium" highContrast color="iris">
                  Email
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="Your email address"
                  color="iris"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                />
                {!isValidEmail && showValidation && (
                  <Text size="2" style={{ color: "var(--red-11)" }}>
                    Please provide a valid email address
                  </Text>
                )}

                {errorMessage && (
                  <Text size="2" style={{ color: "var(--red-11)" }}>
                    {errorMessage}
                  </Text>
                )}

                <Button
                  variant="solid"
                  size="3"
                  radius="small"
                  className="w-full"
                  color="iris"
                  highContrast
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Send Reset Link
                </Button>
              </Flex>

              <Flex direction="column" align="center" pb="5" px="5" gap="4">
                <Separator orientation="horizontal" size="4" />
                <Text size="3" weight="regular" highContrast color="iris">
                  <Link
                    href="/auth/login"
                    underline="hover"
                    highContrast
                    color="iris"
                  >
                    <Flex align="center" gap="1">
                      <ArrowLeftIcon />
                      Back to Login
                    </Flex>
                  </Link>
                </Text>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" p="5" gap="4" align="center">
              <EnvelopeClosedIcon
                width={40}
                height={40}
                color="var(--iris-9)"
              />
              <Text size="5" weight="medium" align="center" highContrast>
                Check your email
              </Text>
              <Text size="3" align="center">
                We've sent a password reset link to <strong>{email}</strong>
              </Text>
              <Text size="2" color="gray" align="center">
                If you don't see it, check your spam folder
              </Text>

              <Text size="2" align="center">
                Redirecting to login in {countdown}...
              </Text>

              <Separator orientation="horizontal" size="4" />
              <Link
                href="/auth/login"
                underline="hover"
                highContrast
                color="iris"
              >
                <Flex align="center" gap="1">
                  <ArrowLeftIcon />
                  Go to Login Now
                </Flex>
              </Link>
            </Flex>
          )}
        </Card>
      </Flex>
    </Box>
  );
};

export default ForgotPassword;
