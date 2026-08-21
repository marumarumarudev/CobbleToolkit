"use client";

import { useEffect, useRef } from "react";

export default function GiscusComments() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "marumarumarudev/CobbleToolkit");
    script.setAttribute("data-repo-id", "R_kgDOT-DzBw");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOT-DzB84DD1Uu");
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", "Welcome to CobbleToolkit Discussions");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-lang", "en");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} className="giscus" />;
}
