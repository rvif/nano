// Logic ✅
// Desktop view ✅
// Mobile view ✅

import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Link,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { loginStart, loginSuccess } from "../../store/slices/authSlice";
import api from "../../utils/api";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import PasswordInput from "../../components/PasswordInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showValidation, setShowValidation] = useState({
    email: false,
    password: false,
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Try localStorage first, then fallback to sessionStorage
    const registeredEmail =
      localStorage.getItem("registeredEmail") ||
      sessionStorage.getItem("registeredEmail");
    const registeredPassword = localStorage.getItem("registeredPassword");

    if (registeredEmail) {
      setFormData((prev) => ({
        ...prev,
        email: registeredEmail,
      }));

      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }

      // Store in sessionStorage before removing from localStorage
      sessionStorage.setItem("registeredEmail", registeredEmail);

      // Remove from localStorage after we've used it
      setTimeout(() => {
        localStorage.removeItem("registeredEmail");
        sessionStorage.removeItem("registeredEmail");
      }, 1000);
    }

    if (registeredPassword) {
      setFormData((prev) => ({
        ...prev,
        password: registeredPassword,
      }));
      localStorage.removeItem("registeredPassword");
    }
  }, []);

  function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePassword(password: string): boolean {
    return password.length > 0;
  }

  const validation = {
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      setShowValidation((prev) => ({
        ...prev,
        [field]: false,
      }));

      setErrorMessage("");
    };

  const handleContinue = async () => {
    setShowValidation({
      email: true,
      password: true,
    });

    if (validation.email && validation.password) {
      setFormSubmitting(true);
      setErrorMessage("");

      // dispatch login start action
      dispatch(loginStart());

      try {
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const { access_token, refresh_token } = response.data;

        // save tokens in localStorage
        localStorage.setItem("accessToken", access_token);
        if (rememberMe) {
          localStorage.setItem("refreshToken", refresh_token);
        }

        // dispatch login success action to update Redux state
        dispatch(
          loginSuccess({
            accessToken: access_token,
            refreshToken: rememberMe ? refresh_token : undefined,
          })
        );

        // console.log("Login successful!");
        navigate("/");
      } catch (error) {
        setFormSubmitting(false);

        if (axios.isAxiosError(error) && error.response) {
          setErrorMessage(
            error.response.data.error ||
              "Login failed. Please check your credentials."
          );
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }

        console.error("Login error:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !formSubmitting) {
      handleContinue();
    }
  };

  return (
    <Box className="h-[calc(100vh-110px)] ">
      <Flex
        align="center"
        justify="center"
        direction="column"
        gap="3"
        className="h-full"
      >
        <Text weight="medium" size="7" highContrast color="iris">
          Login
        </Text>
        <Card variant="classic" className="w-[450px]">
          <Flex direction="column" gap="1">
            <Flex direction="column" p="5" gap="3" onKeyDown={handleKeyDown}>
              <Text size="4" weight="medium" highContrast color="iris">
                Email
              </Text>
              <TextField.Root
                size="3"
                placeholder="Your email address"
                color="iris"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={formSubmitting}
              />
              {!validation.email && showValidation.email && (
                <Text size="2" style={{ color: "var(--red-11)" }}>
                  Please provide a valid email address
                </Text>
              )}

              <Flex gap="3" justify="between" align="center">
                <Text size="4" weight="medium" highContrast color="iris">
                  Password
                </Text>
                <Link
                  href="/auth/forgot-password"
                  size="2"
                  weight="regular"
                  highContrast
                  color="iris"
                  underline="hover"
                >
                  Forgot password?
                </Link>
              </Flex>

              <PasswordInput
                placeholder="Your password"
                value={formData.password}
                onChange={handleInputChange("password")}
                disabled={formSubmitting}
                ref={passwordInputRef}
              />

              {!validation.password && showValidation.password && (
                <Text size="2" style={{ color: "var(--red-11)" }}>
                  Password is required
                </Text>
              )}

              <Text
                weight="regular"
                color="iris"
                highContrast
                as="label"
                size="2"
                className="select-none"
              >
                <Flex justify="end" align="center" gap="2">
                  <Checkbox
                    size="2"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  Remember me
                </Flex>
              </Text>

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
                onClick={handleContinue}
                disabled={formSubmitting}
                loading={formSubmitting}
              >
                Continue
              </Button>
            </Flex>

            <Flex direction="column" align="center" pb="5" px="5" gap="4">
              <Separator orientation="horizontal" size="4" />
              <Text size="3" weight="regular" highContrast color="iris">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  underline="hover"
                  highContrast
                  color="iris"
                >
                  Sign up
                </Link>
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default LoginPage;
