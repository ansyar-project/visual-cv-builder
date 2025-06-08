import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Zap, Shield, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Professional CV Builder - Create ATS-Friendly Resumes Online",
  description:
    "Build professional, ATS-friendly CVs with our intuitive online builder. Choose from multiple templates, customize easily, and export to PDF instantly. Start creating your perfect resume today!",
  openGraph: {
    title: "Professional CV Builder - Create ATS-Friendly Resumes Online",
    description:
      "Build professional, ATS-friendly CVs with our intuitive online builder. Choose from multiple templates, customize easily, and export to PDF instantly.",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "VisualCV Builder Homepage",
      },
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  },
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: process.env.NEXT_PUBLIC_SITE_NAME || "VisualCV Builder",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    description:
      "Create professional, ATS-friendly CVs with our free online CV builder",
    potentialAction: {
      "@type": "SearchAction",
      target: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    sameAs: [
      `https://twitter.com/${
        process.env.NEXT_PUBLIC_TWITTER_HANDLE?.replace("@", "") ||
        "visualcvbuilder"
      }`,
      `https://facebook.com/${
        process.env.NEXT_PUBLIC_FACEBOOK_PAGE || "visualcvbuilder"
      }`,
      `https://linkedin.com/company/${
        process.env.NEXT_PUBLIC_LINKEDIN_COMPANY || "visualcvbuilder"
      }`,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create Your Perfect Professional CV
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Build professional, ATS-friendly CVs with our intuitive builder.
                Choose from multiple templates and export to PDF instantly. Land
                your dream job with a standout resume.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {session ? (
                  <Button size="lg" asChild className="text-lg px-8 py-6">
                    <Link href="/cv" className="flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="text-lg px-8 py-6">
                      <Link
                        href="/auth/signup"
                        className="flex items-center gap-2"
                      >
                        Get Started Free
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="text-lg px-8 py-6"
                    >
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Easy to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Intuitive interface makes creating your CV simple and fast. No
                  design experience required.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">ATS Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our templates are optimized for Applicant Tracking Systems to
                  help you get noticed by employers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">PDF Export</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Download your CV as a high-quality PDF ready for printing or
                  digital sharing.
                </CardDescription>
              </CardContent>
            </Card>
          </section>

          {/* Stats Section */}
          <section className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                10,000+
              </div>
              <div className="text-muted-foreground">CVs Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl mb-4">
                  Ready to Build Your CV?
                </CardTitle>
                <CardDescription className="text-lg">
                  Join thousands of professionals who have landed their dream
                  jobs with our CV builder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link
                    href={session ? "/cv" : "/auth/signup"}
                    className="flex items-center gap-2"
                  >
                    Start Building Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </>
  );
}
