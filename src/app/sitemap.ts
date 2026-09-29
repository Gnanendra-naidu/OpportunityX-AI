import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://opportunity-x-ai.vercel.app";
  const routes = [
    "",
    "/scholarships",
    "/schemes",
    "/opportunities",
    "/states",
    "/matching",
    "/saved",
    "/dashboard",
    "/profile",
    "/ai-assistant",
    "/life-stages",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/scholarships" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/scholarships" || route === "/matching" ? 0.9 : 0.7,
  }));
}
