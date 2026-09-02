// Regression test: editing-mode and print-mode render of News must produce
// identical layout DOM. The invariant: editing mode must contain ZERO
// <input>/<select>/<textarea> elements -- those are what added extra height
// in the editor and made it diverge visually from print.
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { NewsBlock, ImageRef } from "@/lib/types";

// ponytail: News.tsx has no local `React` import (it relies on Next's automatic
// JSX runtime at build time). Under the plain esbuild/tsx runner used for tests,
// its JSX compiles to classic `React.createElement` calls instead, so make
// `React` resolve as a global before dynamically importing the component --
// a static top-level import would be hoisted above this assignment (and this
// package has no "type": "module", so top-level await isn't available either).
(globalThis as unknown as { React: typeof React }).React = React;

async function loadRender() {
  const { default: NewsBlockDef } = await import("./News");
  return NewsBlockDef.Render;
}

const FORBIDDEN = /<input\b|<select\b|<textarea\b/;

function assertNoFormControls(html: string, label: string) {
  assert.doesNotMatch(html, FORBIDDEN, `${label}: editing markup must not contain input/select/textarea`);
}

const HEADLINE = "टेस्ट हेडलाइन";
const BODY = "यह परीक्षण मुख्य पाठ है।";
const SUBHEAD = "टेस्ट सबहेड";
const BYLINE = "टेस्ट बाइलाइन";

function baseBlock(): NewsBlock {
  return {
    id: "b1",
    type: "news",
    headline: HEADLINE,
    body: BODY,
    subhead: SUBHEAD,
    byline: BYLINE,
  };
}

test("News.Render: editing mode has no input/select/textarea, and text matches print mode", async () => {
  const Render = await loadRender();
  const block = baseBlock();

  const editingHtml = renderToStaticMarkup(
    <Render block={block} editing={true} onChange={() => {}} />
  );
  const printHtml = renderToStaticMarkup(
    <Render block={block} editing={false} onChange={() => {}} />
  );

  assertNoFormControls(editingHtml, "text-only block");

  for (const text of [HEADLINE, BODY, SUBHEAD, BYLINE]) {
    assert.ok(editingHtml.includes(text), `editing markup missing "${text}"`);
    assert.ok(printHtml.includes(text), `print markup missing "${text}"`);
  }
});

test("News.Render with image: editing mode has no input/select/textarea, caption text matches", async () => {
  const Render = await loadRender();
  const CAPTION = "टेस्ट कैप्शन";
  const image: ImageRef = {
    url: "data:image/svg+xml;utf8,test",
    storagePath: "test/path.svg",
    naturalW: 800,
    naturalH: 600,
    focalX: 0.5,
    focalY: 0.5,
    caption: CAPTION,
  };
  const block: NewsBlock = { ...baseBlock(), image };

  const editingHtml = renderToStaticMarkup(
    <Render block={block} editing={true} onChange={() => {}} />
  );
  const printHtml = renderToStaticMarkup(
    <Render block={block} editing={false} onChange={() => {}} />
  );

  assertNoFormControls(editingHtml, "image block");

  assert.ok(editingHtml.includes(CAPTION), "editing markup missing caption");
  assert.ok(printHtml.includes(CAPTION), "print markup missing caption");
});
