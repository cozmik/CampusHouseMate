import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User as UserIcon, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Button } from "@housemates/shared-ui/button";
import { Input } from "@housemates/shared-ui/input";
import { Label } from "@housemates/shared-ui/label";
import { Logo } from "@/components/housemate/Logo";
import { PasswordField } from "@/components/housemate/PasswordField";
import { SchoolCombobox } from "@/components/housemate/SchoolCombobox";
import { SocialAuth } from "@/components/housemate/SocialAuth";

export default function Signup() {
  const { signup } = useApp();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    const trimmedEmail = email.trim();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!okEmail) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    const trimmedFirst = firstName.trim();
    const res = await signup({ firstName: trimmedFirst, lastName: lastName.trim(), email: trimmedEmail, password, phone, whatsapp, schoolId });
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome to Housemates Finder", {
        description: `Hey ${trimmedFirst}, you're in. Confirming your email is optional but recommended.`,
      });
      navigate("/dashboard", { replace: true });
    } else if (res.created) {
      toast.success("Account created", {
        description: "Log in with the same email and password to continue.",
      });
      navigate("/login", { replace: true, state: { email: trimmedEmail } });
    } else {
      setError(res.error ?? "Could not create account.");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-hero px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl glass-strong p-7 sm:p-10">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">One account lets you post a space and message others.</p>
          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="firstName" autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Joy" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Eze" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordField
                id="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={setPassword}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label>School</Label>
              <SchoolCombobox value={schoolId} onChange={setSchoolId} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 000 0000" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="same as phone" />
              </div>
            </div>
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-primary shadow-glow" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}<ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-5">
            <SocialAuth label="Sign up with" />
          </div>
          <p className="mt-5 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
