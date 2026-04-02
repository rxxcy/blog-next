function stripCountExcludedContent(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~-]/g, " ");
}

export function countPostCharacters(content: string) {
  return stripCountExcludedContent(content).replace(/\s+/g, "").length;
}

export function formatPostCharacterCount(count: number) {
  return `${count.toLocaleString("en-US")} 字`;
}
