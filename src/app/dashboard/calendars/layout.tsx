
export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-ful">
      <main className="mx-auto w-full">{children}</main>
    </div>
  );
}