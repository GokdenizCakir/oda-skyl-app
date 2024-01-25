import "./globals.css";

export const metadata = {
  title: "Oda Skyl.app",
  description: "odaskylapp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
