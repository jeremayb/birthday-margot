"use client";

import { useState } from "react";
import BirthdayScreen from "@/components/BirthdayScreen";
import CharadeScreen from "@/components/CharadeScreen";
import GiftScreen from "@/components/GiftScreen";

type Screen = "birthday" | "charade" | "gift";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("birthday");

  return (
    <main className="h-full w-full overflow-hidden">
      {screen === "birthday" && (
        <BirthdayScreen onNext={() => setScreen("charade")} />
      )}
      {screen === "charade" && (
        <CharadeScreen onSuccess={() => setScreen("gift")} />
      )}
      {screen === "gift" && <GiftScreen />}
    </main>
  );
}
