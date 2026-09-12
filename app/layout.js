import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Clock",
  description: "A beautiful clock app with friend notifications",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#374151",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}