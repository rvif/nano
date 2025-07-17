// Logic ✅
// Desktop view ✅
// Mobile view ✅

import {
  Box,
  Button,
  Card,
  Flex,
  Link,
  Separator,
  Text,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import PasswordInput from "../../components/PasswordInput";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [countdownIntervalId, setCountdownIntervalId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");

    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrorMessage(
        "Missing reset token. Please request a new password reset link."
      );
      setTokenValid(false);
    }
  }, [location.search]);

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): boolean => {
    return password === confirmPassword;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setShowValidation(false);
    setErrorMessage("");
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setShowValidation(false);
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    setShowValidation(true);

    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(
      password,
      confirmPassword
    );

    if (!isPasswordValid || !isConfirmPasswordValid) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post("/auth/reset-password", {
        token,
        password,
      });

      const storedEmail =
        localStorage.getItem("registeredEmail") ||
        sessionStorage.getItem("registeredEmail");

      if (storedEmail) {
        localStorage.setItem("registeredEmail", storedEmail);
        sessionStorage.setItem("registeredEmail", storedEmail);
      }

      setResetSuccess(true);

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
            "Failed to reset password. Please try again."
        );
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const isValidPassword = validatePassword(password);
  const isValidConfirmPassword = validateConfirmPassword(
    password,
    confirmPassword
  );

  if (tokenValid === false) {
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
            Invalid Reset Link
          </Text>
          <Card variant="classic" className="w-[450px]">
            <Flex direction="column" p="5" gap="4" align="center">
              <Text size="3" align="center">
                This password reset link is invalid or has expired.
              </Text>
              <Button
                variant="solid"
                size="3"
                radius="small"
                className="w-full"
                color="iris"
                highContrast
                onClick={() => navigate("/auth/forgot-password")}
              >
                Request New Reset Link
              </Button>
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
          </Card>
        </Flex>
      </Box>
    );
  }

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
          Create New Password
        </Text>
        <Card variant="classic" className="w-[450px]">
          {!resetSuccess ? (
            <Flex direction="column" gap="1">
              <Flex direction="column" p="5" gap="3" onKeyDown={handleKeyDown}>
                <Text size="4" weight="medium" highContrast color="iris">
                  New Password
                </Text>
                <PasswordInput
                  placeholder="Enter new password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                />
                {!isValidPassword && showValidation && (
                  <Text size="2" style={{ color: "var(--red-11)" }}>
                    Password must be at least 6 characters
                  </Text>
                )}

                <Text size="4" weight="medium" highContrast color="iris">
                  Confirm Password
                </Text>
                <PasswordInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isSubmitting}
                />
                {!isValidConfirmPassword &&
                  showValidation &&
                  confirmPassword && (
                    <Text size="2" style={{ color: "var(--red-11)" }}>
                      Passwords do not match
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
                  Reset Password
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
              <CheckCircledIcon width={40} height={40} color="var(--green-9)" />
              <Text size="5" weight="medium" align="center" highContrast>
                Password Reset Successful
              </Text>
              <Text size="3" align="center">
                Your password has been updated.
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

export default ResetPassword;
