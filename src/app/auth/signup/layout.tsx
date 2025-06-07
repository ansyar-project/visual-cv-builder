import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - VisualCV Builder",
  description:
    "Create your free VisualCV Builder account and start building professional, ATS-friendly resumes with our intuitive CV maker.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Create Account - VisualCV Builder",
    description:
      "Join thousands of professionals creating stunning CVs with our free online builder.",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
