// Logic ✅
// Desktop view ✅
// Mobile view ✅

import { useState } from "react";
import { Avatar } from "@radix-ui/themes";
import { formatProfileImageUrl } from "../utils/formatProfileImage";

interface ProfileAvatarProps {
  pfpUrl?: string;
  username?: string;
  size?: "1" | "2" | "3" | "4" | "5";
}

// Small component for navbar profile avatar
export const ProfileAvatar = ({
  pfpUrl,
  username,
  size = "1",
}: ProfileAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const fallbackChar = username?.[0]?.toUpperCase() || "U";
  const formattedUrl = formatProfileImageUrl(pfpUrl);
  if (!formattedUrl || imageError) {
    return (
      <Avatar
        fallback={fallbackChar}
        size={size}
        radius="full"
        color="iris"
        highContrast
      />
    );
  }

  return (
    <Avatar
      src={formattedUrl}
      fallback={fallbackChar}
      size={size}
      radius="full"
      onError={() => setImageError(true)}
    />
  );
};
