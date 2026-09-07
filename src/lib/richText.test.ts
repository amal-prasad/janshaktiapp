import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeHtml, htmlToText, textToHtml, bodyToHtml } from "./richText";
import { FONT_OPTIONS } from "./fonts";

test("sanitizeHtml: script tag with contents is fully removed", () => {
  const out = sanitizeHtml("<p>a</p><script>alert(1)</script><p>b</p>");
  assert.equal(out, "<p>a</p><p>b</p>");
});

test("sanitizeHtml: onclick/href stripped", () => {
  const out = sanitizeHtml('<span onclick="evil()" href="x">hi</span>');
  assert.equal(out, "<span>hi</span>");
});

test("sanitizeHtml: <b> and <ul><li> survive", () => {
  const out = sanitizeHtml("<ul><li><b>x</b></li></ul>");
  assert.equal(out, "<ul><li><b>x</b></li></ul>");
});

test("sanitizeHtml: text-align survives, disallowed style dropped", () => {
  assert.equal(
    sanitizeHtml('<p style="text-align:center">x</p>'),
    '<p style="text-align: center">x</p>',
  );
  assert.equal(
    sanitizeHtml('<p style="position:fixed;color:red">x</p>'),
    "<p>x</p>",
  );
});

test("sanitizeHtml: font-family survives only for allowlisted FONT_OPTIONS values", () => {
  const validCss = FONT_OPTIONS[0].css;
  assert.equal(
    sanitizeHtml(`<span style="font-family: ${validCss}">x</span>`),
    `<span style="font-family: ${validCss.toLowerCase()}">x</span>`,
  );
  assert.equal(
    sanitizeHtml('<span style="font-family: evil-injected-value">x</span>'),
    "<span>x</span>",
  );
});

test("sanitizeHtml: re-serialised font-family (quotes/comma spacing) normalises to canonical value", () => {
  const halant = FONT_OPTIONS.find((f) => f.key === "halant")!.css;
  const shreeLipi = FONT_OPTIONS.find((f) => f.key === "shreelipi")!.css;
  // Chrome may wrap execCommand's value in quotes.
  assert.equal(
    sanitizeHtml(`<span style='font-family: "${halant}"'>x</span>`),
    `<span style="font-family: ${halant}">x</span>`,
  );
  // Chrome may re-quote + respace a multi-value stack.
  assert.equal(
    sanitizeHtml(`<span style="font-family: 'Shree Lipi' , var(--font-hi)">x</span>`),
    `<span style="font-family: ${shreeLipi}">x</span>`,
  );
  // Quoting/respacing must not open a hole for non-allowlisted values.
  assert.equal(
    sanitizeHtml(`<span style="font-family: 'evil' , injected">x</span>`),
    "<span>x</span>",
  );
});

test("sanitizeHtml: unknown tag unwraps, keeps children", () => {
  assert.equal(sanitizeHtml("<marquee>x</marquee>"), "x");
});

test("sanitizeHtml: idempotent", () => {
  const inputs = [
    '<p style="text-align:center"><b>a</b> &amp; <i>b</i></p>',
    "<script>bad()</script><ul><li>x</li></ul>",
    "<marquee><div onclick=\"x()\">y</div></marquee>",
  ];
  for (const input of inputs) {
    const once = sanitizeHtml(input);
    const twice = sanitizeHtml(once);
    assert.equal(twice, once, `not idempotent for: ${input}`);
  }
});

test("sanitizeHtml: never throws on malformed input", () => {
  assert.doesNotThrow(() => sanitizeHtml("<p><b>unclosed"));
  assert.doesNotThrow(() => sanitizeHtml("<<<>>>weird&&&"));
});

test("htmlToText: paragraphs become two lines", () => {
  assert.equal(htmlToText("<p>a</p><p>b</p>"), "a\nb");
});

test("htmlToText: decodes basic entities", () => {
  assert.equal(htmlToText("a &amp; b &lt;c&gt;"), "a & b <c>");
});

test("textToHtml: escapes and preserves line breaks", () => {
  assert.equal(textToHtml("a<b"), "a&lt;b");
  assert.equal(textToHtml("a\nb"), "a<br>b");
});

test("bodyToHtml: prefers sanitized bodyHtml, falls back to escaped body", () => {
  assert.equal(bodyToHtml({ body: "plain", bodyHtml: "<b>rich</b>" }), "<b>rich</b>");
  assert.equal(bodyToHtml({ body: "a\nb" }), "a<br>b");
});
