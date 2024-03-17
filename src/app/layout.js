import "./globals.css";

export const metadata = {
  title: "Oda Skylab",
  description: "Kulüp odası anlık",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
