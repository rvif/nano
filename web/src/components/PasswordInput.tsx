// Logic ✅
// Desktop view ✅
// Mobile view ✅

import React, { useState, forwardRef } from "react";
import { Separator, TextField } from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { placeholder, value, onChange, disabled = false, autoFocus = false },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative w-full ">
        <TextField.Root
          size="3"
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          autoFocus={autoFocus}
          className="w-full "
          style={{ paddingRight: "35px" }}
        />
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center cursor-pointer "
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          <Separator
            orientation="vertical"
            className="!h-[36px] absolute left-[-7.5px]"
          />
          {showPassword ? (
            <EyeClosedIcon width={20} height={16} />
          ) : (
            <EyeOpenIcon width={20} height={16} />
          )}
        </div>
      </div>
    );
  }
);

export default PasswordInput;
