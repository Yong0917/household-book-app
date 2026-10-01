export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
