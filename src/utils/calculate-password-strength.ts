interface PasswordStrength {
  strength: "weak" | "medium" | "strong";
  percentage: number;
  color: string;
  label: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const percentage = (passedChecks / 5) * 100;

  let strength: "weak" | "medium" | "strong" = "weak";
  let color = "red";
  let label = "Weak";

  if (passedChecks >= 4) {
    strength = "strong";
    color = "green";
    label = "Strong";
  } else if (passedChecks >= 3) {
    strength = "medium";
    color = "yellow";
    label = "Medium";
  }

  return { strength, percentage, color, label, checks };
};
