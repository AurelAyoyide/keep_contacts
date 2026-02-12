import { Navbar } from '@/components/landing/Navbar';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Share2, Shield, Users, Download, Zap, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            New: Public export tokens available
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-7xl mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Collect and Manage Contacts <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              with Superpowers
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            The modern way for organizations to collect, manage, and export contacts securely.
            Create public invitation links, organize groups, and share data with temporary secure tokens.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need to manage contacts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop using spreadsheets and email threads. Switch to a dedicated platform built for secure contact collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Organize Groups"
              description="Create organizations and groups to keep your contacts structured by promotion, event, or department."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-blue-500" />}
              title="Public Collection"
              description="Generate unique invitation links for anyone to submit their contact details without creating an account."
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6 text-green-500" />}
              title="Smart Exports"
              description="Share download links via secure, temporary tokens. Revoke access at any time."
            />
            <FeatureCard
              icon={<Download className="h-6 w-6 text-orange-500" />}
              title="VCF Export"
              description="Export your contacts in VCF (vCard) format for seamless mobile phone import."
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6 text-red-500" />}
              title="Secure by Default"
              description="Enterprise-grade security with JWT authentication, granular permissions, and data encryption."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-yellow-500" />}
              title="Instant Setup"
              description="Get started in seconds. No complex configuration or installation required."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to streamline your workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

            <Step
              number="1"
              title="Create a Group"
              description="Set up an organization and create groups for your different needs."
            />
            <Step
              number="2"
              title="Share Invite Link"
              description="Send the public link to your members so they can fill in their info."
            />
            <Step
              number="3"
              title="Export & Share"
              description="Generate a secure temporary token to share the contact list with your team."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of organizations managing their contacts efficiently and securely.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-xl rounded-full shadow-lg hover:shadow-xl transition-all">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Keep Contacts</span>
          </div>

          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Keep Contacts. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative flex flex-col items-center text-center z-10">
      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-6 ring-4 ring-background">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
