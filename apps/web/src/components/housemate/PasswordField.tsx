import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@housemates/shared-ui/input";
import { cn } from "@housemates/shared-utils";

type PasswordFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  showLock?: boolean;
  className?: string;
};

export function PasswordField({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  showLock = true,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {showLock && (
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(showLock ? "pl-9 pr-10" : "pr-10", className)}
      />
      <button
        type="button"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((open) => !open)}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
