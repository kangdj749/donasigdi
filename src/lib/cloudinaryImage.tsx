export function cloudinaryImage(
  src: string,
  type:
    | "lcp"
    | "detail"
    | "card"
    | "thumb"
    | "sponsor"
    | "natural"
    | "square"
    | "portrait"
    | "banner"
    | "icon"
    | "preview"
    | "gallery"
) {
  const map = {
    //lcp: "f_auto,q_auto,dpr_auto,w_1200,h_900,c_fill,g_auto",
    lcp: "f_auto,q_auto,dpr_auto,w_1200,c_limit",
    detail: "f_auto,q_auto,dpr_auto,w_720,h_720,c_fill,g_auto",
    //card: "f_auto,q_auto,dpr_auto,w_420,h_420,c_fill,g_auto",
    card: "f_auto,q_auto,dpr_auto,w_420,c_limit",
    //thumb: "f_auto,q_auto,dpr_auto,w_180,h_180,c_fill,g_auto",
    thumb: "f_auto,q_auto,dpr_auto,w_180,c_limit",
    natural: "f_auto,q_auto,dpr_auto,w_720,c_limit",
    square: "f_auto,q_auto,dpr_auto,w_720,h_720,c_fill,g_auto",
    portrait: "f_auto,q_auto,dpr_auto,w_720,h_900,c_fill,g_auto",
    //banner: "f_auto,q_auto,dpr_auto,w_1400,h_720,c_fill,g_auto",
    banner: "f_auto,q_auto,dpr_auto,w_1400,c_limit",
    sponsor: "f_auto,q_auto,dpr_auto,h_140,c_limit",
    icon: "f_auto,q_auto,dpr_auto,w_14,h_14,c_limit",
    preview: "f_auto,q_auto,dpr_auto,w_360,h_240,c_fill,g_auto",
    gallery: "f_auto,q_auto,dpr_auto,w_420,h_260,c_fill,g_auto",
  };

  return src.replace("/upload/", `/upload/${map[type]}/`);
}