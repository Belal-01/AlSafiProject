
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      // <DefaultLayout>
      <div>
        {children}
      </div>
      // </DefaultLayout>
  );
}
