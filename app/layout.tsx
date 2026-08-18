import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O.O.O 사전 읽기 진단",
  description: "O.O.O (OUT OF OFFICE) 독서 소모임 사전 읽기 진단",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
