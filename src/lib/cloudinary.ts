export function cloudinaryImage(
  url?: string,
  width = 800
): string {
  if (!url) return "/placeholder.png";
  if (!url.includes("cloudinary.com")) return url;

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width},c_limit/`
  );
}
