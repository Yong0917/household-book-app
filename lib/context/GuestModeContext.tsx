"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GuestModeContextValue {
  isGuest: boolean;
  requireLogin: () => void;
}

const GuestModeContext = createContext<GuestModeContextValue>({
  isGuest: false,
  requireLogin: () => {},
});

export function GuestModeProvider({
  isGuest,
  children,
}: {
  isGuest: boolean;
  children: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const requireLogin = () => {
    if (isGuest) setModalOpen(true);
  };

  return (
    <GuestModeContext.Provider value={{ isGuest, requireLogin }}>
      {children}

      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>
              이 기능은 로그인 후 이용할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/auth/login")}>
              로그인하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  return useContext(GuestModeContext);
}
