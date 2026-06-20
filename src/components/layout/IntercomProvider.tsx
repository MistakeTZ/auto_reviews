"use client";

import { ReactNode } from "react";
import Intercom from "@intercom/messenger-js-sdk";

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "zfo13fjs";

export default function IntercomProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  Intercom({
    app_id: INTERCOM_APP_ID,
  });

  return <>{children}</>;
}
