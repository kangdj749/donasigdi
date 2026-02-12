export function cloudinaryImage(
  src: string,
  type: "lcp" | "detail" | "card" | "thumb"
) {
  const map = {
    lcp: "f_auto,q_auto,dpr_auto,w_900,h_900,c_fill",
    detail: "f_auto,q_auto,dpr_auto,w_720,h_720,c_fill",
    card: "f_auto,q_auto,dpr_auto,w_400,h_400,c_fill",
    thumb: "f_auto,q_auto,dpr_auto,w_160,h_160,c_fill",
  };

  return src.replace(
    "/upload/",
    `/upload/${map[type]}/`
  );
}
