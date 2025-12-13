export const formatSettingKey = (key: string): string => {
  if (!key) return "";
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
};

export const formatInitialName = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
