import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Phone, Sparkles, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/housemate/Logo";
import { SchoolCombobox } from "@/components/housemate/SchoolCombobox";

export default function Signup() {
  const { signup, loginAsDemo } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
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
    setLoading(true);
    const res = await signup({ fullName, email, password, phone, whatsapp, schoolId });
    setLoading(false);
    if (res.ok) navigate("/dashboard", { replace: true });
    else setError(res.error ?? "Could not create account.");
  };

  const demo = async () => {
    setLoading(true);
    await loginAsDemo();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-elevated sm:p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">One account lets you post a space and message others.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Joy Eze" className="pl-9" />
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
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="pl-9" />
              </div>
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
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" /></div>
          <Button variant="outline" className="w-full" onClick={() => void demo()} disabled={loading}>
            <Sparkles className="h-4 w-4 text-primary" />Continue as demo student
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
