import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}

export function PageMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: Props) {
  const fullTitle = title.includes("DataWave") ? title : `${title} · DataWave`;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${path ?? window.location.pathname}`
      : path;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
}
