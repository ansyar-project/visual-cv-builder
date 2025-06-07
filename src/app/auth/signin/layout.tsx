import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - VisualCV Builder",
  description:
    "Sign in to your VisualCV Builder account to access your professional CV templates and continue building your resume.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Sign In - VisualCV Builder",
    description:
      "Access your CV builder account to continue creating professional resumes.",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
