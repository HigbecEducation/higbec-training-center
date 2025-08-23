"use client";

import { Suspense } from "react";
import SuccessPage from "./SuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading registration page...</div>}>
      <SuccessPage />
    </Suspense>
  );
}
