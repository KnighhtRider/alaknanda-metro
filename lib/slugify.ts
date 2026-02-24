export function toSlug(name: string): string {
    if (!name) return "";
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
