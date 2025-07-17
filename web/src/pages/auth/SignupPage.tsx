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
  TextField,
  Progress,
  Em,
} from "@radix-ui/themes";
import { useEffect, useState, useRef } from "react";
import {
  UploadIcon,
  CheckIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import PasswordInput from "../../components/PasswordInput";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profileImage: null as File | null,
  });
  const [showValidation, setShowValidation] = useState({
    username: false,
    email: false,
    password: false,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  function validateUsername(username: string): boolean {
    return username.length <= 16 && username.length >= 3;
  }

  const validation = {
    username: validateUsername(formData.username),
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
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
    setUploadProgress(0);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = async () => {
    setShowValidation({
      username: true,
      email: true,
      password: true,
    });

    setErrorMessage("");

    if (validation.username && validation.email && validation.password) {
      setFormSubmitting(true);
      if (formData.profileImage) {
        setUploading(true);
        setUploadProgress(0);
      }

      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      if (formData.profileImage) {
        formDataToSend.append("pfp", formData.profileImage);
      }

      try {
        console.log("Submitting registration form...");

        const config = {
          headers: {
            // Don't set Content-Type for multipart/form-data - let the browser set it
            // "Content-Type": "multipart/form-data"
          },
          ...(formData.profileImage && {
            onUploadProgress: (progressEvent: any) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload progress: ${percentCompleted}%`);
              setUploadProgress(percentCompleted);
            },
          }),
        };

        console.log("Sending request to /auth/register");
        const response = await api.post(
          "/auth/register",
          formDataToSend,
          config
        );
        console.log("Registration successful:", response.data);

        setUploading(false);
        setRegistrationSuccess(true);

        // Store email correctly in localStorage and sessionStorage
        localStorage.setItem("registeredEmail", formData.email);
        sessionStorage.setItem("registeredEmail", formData.email);

        setTimeout(() => {
          navigate("/auth/login");
        }, 1000);
      } catch (error) {
        setUploading(false);
        setFormSubmitting(false);

        if (axios.isAxiosError(error)) {
          console.error("Registration error details:", {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          });

          setErrorMessage(
            error.response?.data?.error ||
              error.response?.data?.message ||
              "Registration failed. Please try again."
          );
        } else {
          console.error("Unknown error during registration:", error);
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      setShowValidation({
        username: false,
        email: false,
        password: false,
      });
    };
  }, []);

  return (
    <Box className="h-[calc(100vh-110px)]">
      <Flex
        align="center"
        justify="center"
        direction="column"
        gap="4"
        className="h-full"
      >
        <Text weight="medium" size="7" highContrast color="iris">
          Sign up
        </Text>
        <Card variant="classic" className="w-[450px]">
          <Flex direction="column" gap="1">
            <Flex direction="column" p="5" gap="3">
              <Text size="4" weight="medium" highContrast color="iris">
                Username*
              </Text>
              <TextField.Root
                size="3"
                placeholder="Your username"
                color="iris"
                value={formData.username}
                onChange={handleInputChange("username")}
                disabled={formSubmitting}
              />
              {!validation.username && showValidation.username && (
                <Text size="2" style={{ color: "var(--red-11)" }}>
                  Username must be at least 3 characters
                </Text>
              )}

              <Text size="4" weight="medium" highContrast color="iris">
                Email*
              </Text>
              <TextField.Root
                size="3"
                placeholder="Your email address"
                color="iris"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={formSubmitting}
              />
              {!validation.email && showValidation.email && (
                <Text size="2" style={{ color: "var(--red-11)" }}>
                  Please provide a valid email address
                </Text>
              )}

              <Text size="4" weight="medium" highContrast color="iris">
                Password*
              </Text>
              <PasswordInput
                placeholder="Your password"
                value={formData.password}
                onChange={handleInputChange("password")}
                disabled={formSubmitting}
              />
              {!validation.password && showValidation.password && (
                <Text size="2" style={{ color: "var(--red-11)" }}>
                  Password must be at least 6 characters
                </Text>
              )}

              <Flex justify="between" align="center">
                <Text size="4" weight="medium" highContrast color="iris">
                  Picture{" "}
                  <Text size="2">
                    <Em>(optional)</Em>
                  </Text>
                </Text>

                <Flex gap="2">
                  <Button
                    variant="outline"
                    color="iris"
                    size="2"
                    onClick={triggerFileInput}
                    disabled={formSubmitting}
                  >
                    {formData.profileImage ? <UpdateIcon /> : <UploadIcon />}
                  </Button>

                  {formData.profileImage && (
                    <Button
                      variant="outline"
                      color="red"
                      size="2"
                      onClick={removeProfileImage}
                      disabled={formSubmitting}
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </Flex>
              </Flex>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
                disabled={formSubmitting}
              />

              {formData.profileImage && !uploading && !formSubmitting && (
                <Flex align="center" gap="1">
                  <CheckIcon color="var(--green-9)" />
                  <Text size="2" style={{ color: "var(--green-9)" }}>
                    {formData.profileImage.name} selected
                  </Text>
                </Flex>
              )}

              {uploading && formData.profileImage && (
                <Box className="w-full">
                  <Progress value={uploadProgress} />
                  <Text size="2" align="center">
                    {uploadProgress}%
                  </Text>
                </Box>
              )}

              {registrationSuccess && (
                <Flex align="center" gap="1">
                  <CheckIcon color="var(--green-9)" />
                  <Text size="2" style={{ color: "var(--green-9)" }}>
                    Registration successful! Redirecting to login...
                  </Text>
                </Flex>
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
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  underline="hover"
                  highContrast
                  color="iris"
                >
                  Login
                </Link>
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default SignupPage;
