import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Create Your Perfect Professional CV
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Build professional, ATS-friendly CVs with our intuitive builder.
              Choose from multiple templates and export to PDF instantly. Land
              your dream job with a standout resume.
            </p>
            <div className="flex gap-4 justify-center">
              {session ? (
                <Link
                  href="/cv"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  aria-label="Access your CV dashboard"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    aria-label="Create free account to start building your CV"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    aria-label="Sign in to your existing account"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-8 mb-16">
            <article className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy to Use
              </h3>
              <p className="text-gray-600">
                Intuitive drag-and-drop interface makes creating your CV simple
                and fast. No design experience required.
              </p>
            </article>

            <article className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ATS Friendly
              </h3>
              <p className="text-gray-600">
                Our templates are optimized for Applicant Tracking Systems to
                help you get noticed by employers and recruiters.
              </p>
            </article>

            <article className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                PDF Export
              </h3>
              <p className="text-gray-600">
                Download your CV as a high-quality PDF ready for printing or
                digital sharing. Professional formatting guaranteed.
              </p>
            </article>
          </section>

          {/* CTA Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Build Your CV?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of professionals who have landed their dream jobs
              with our CV builder. Start creating your professional resume
              today.
            </p>
            <Link
              href={session ? "/cv" : "/auth/signup"}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              aria-label={
                session
                  ? "Go to CV dashboard"
                  : "Sign up to start building your CV"
              }
            >
              Start Building Now
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
