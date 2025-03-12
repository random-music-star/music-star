// src/components/header/Header.tsx
interface HeaderProps {
  userId: string;
}

export default function Header({ userId }: HeaderProps) {
  return (
    <header className="bg-[hsl(var(--color-header-bg))] text-[hsl(var(--color-header-text))] p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">알송달송</h1>

        <div className="flex items-center gap-2">
          <span>{userId || "로딩 중..."}</span>
        </div>
      </div>
    </header>
  );
}