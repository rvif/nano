const FormatDate = (dateValue?: string | null | any): string => {
  if (!dateValue) return "N/A";

  try {
    if (typeof dateValue === "object" && dateValue.Time) {
      const timeString = dateValue.Time;
      const date = new Date(timeString);

      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        }).format(date);
      }
    }

    // handle direct string value as analytics api return date's in string format
    if (typeof dateValue === "string") {
      const date = new Date(dateValue);

      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        }).format(date);
      }
    }

    console.warn("Invalid date value:", dateValue);
    return "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error, dateValue);
    return "Invalid date";
  }
};

export default FormatDate;
