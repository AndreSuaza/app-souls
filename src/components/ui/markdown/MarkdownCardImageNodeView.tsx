"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { MarkdownCardImage } from "./MarkdownCardImage";

type Props = {
  node: {
    attrs: {
      src?: string;
      alt?: string;
    };
  };
  selected: boolean;
};

export const MarkdownCardImageNodeView = ({ node }: Props) => {
  return (
    <NodeViewWrapper className="inline-block" data-drag-handle>
      <MarkdownCardImage src={node.attrs.src} alt={node.attrs.alt} />
    </NodeViewWrapper>
  );
};
