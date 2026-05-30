import { createFileRoute } from "@tanstack/react-router";
import { TrinetraApp } from "@/components/trinetra/TrinetraApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trinetra AI — Targeted Phishing Detection" },
      {
        name: "description",
        content:
          "Trinetra AI scans URLs for targeted phishing using URL analysis, brand similarity, and page behavior detection.",
      },
      { property: "og:title", content: "Trinetra AI — Targeted Phishing Detection" },
      {
        property: "og:description",
        content: "Scan any URL for targeted phishing threats in seconds.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <TrinetraApp />;
}
