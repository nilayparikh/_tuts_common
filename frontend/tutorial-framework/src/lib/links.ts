export function isExternalHref(href?: string | null): boolean {
  if (!href) {
    return false;
  }

  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:");
}

export function externalLinkProps(href?: string | null): {
  target?: "_blank";
  rel?: "noopener noreferrer";
} {
  if (!isExternalHref(href)) {
    return {};
  }

  return {
    target: "_blank",
    rel: "noopener noreferrer",
  };
}
