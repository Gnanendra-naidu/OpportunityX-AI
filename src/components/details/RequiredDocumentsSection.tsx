"use client";

import React from "react";
import {
  RequiredDocumentsSection as CoreRequiredDocumentsSection,
  RequiredDocumentsSectionProps,
} from "@/components/documents/RequiredDocumentsSection";

export { DOCUMENT_CATEGORIES_META } from "@/components/documents/RequiredDocumentsSection";
export type { DocumentCategoryMeta, RequiredDocumentsSectionProps } from "@/components/documents/RequiredDocumentsSection";

export const RequiredDocumentsSection: React.FC<RequiredDocumentsSectionProps> = (props) => {
  return <CoreRequiredDocumentsSection {...props} />;
};
