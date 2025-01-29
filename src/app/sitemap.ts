import { db } from "@/lib/firebase/admin";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://comrades.tirigist.com";

  const uploadsSnapshot = await db.collection("uploads").get();
  const dynamicRoutes: MetadataRoute.Sitemap = uploadsSnapshot.docs.map((doc) => {
    return {
      url: `${baseUrl}/content/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    };
  });
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/tools/examai`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/images2pdf`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
        url: `${baseUrl}/upload`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.5,
    },
    ...dynamicRoutes
  ];
  return routes;
}
