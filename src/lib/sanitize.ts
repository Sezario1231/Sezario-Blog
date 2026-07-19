/**
 * XSS 防护：将用户输入中的特殊字符转义为 HTML 实体。
 * 即使后续内容被直接插入 HTML 上下文，浏览器也只会将其当作纯文本渲染。
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");
}

/**
 * 去除首尾空白，并压缩内部连续空白为单个空格。
 * 用于规范化用户输入，避免纯空白或异常空白绕过长度校验。
 */
export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * 将 IPv4 末段 / IPv6 尾部掩码处理，仅保留可定位到大致区域的前缀。
 * 例：192.168.1.23 → 192.168.1.x ，2001:db8::1 → 2001:db8::
 * 用于脱敏存储，满足最小必要原则。
 */
export function maskIp(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed || trimmed === "unknown") return "unknown";

  if (trimmed.includes(".")) {
    const parts = trimmed.split(".");
    if (parts.length === 4) {
      parts[3] = "x";
      return parts.join(".");
    }
    return trimmed;
  }

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length > 2) {
      parts[parts.length - 1] = "";
      return parts.join(":") + ":";
    }
    return trimmed;
  }

  return trimmed;
}
