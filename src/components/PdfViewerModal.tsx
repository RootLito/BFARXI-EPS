import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";

interface PdfViewerModalProps {
  visible: boolean;
  pdfUrl: string | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  visible,
  pdfUrl,
  onClose,
}) => {
  useEffect(() => {
    if (visible && pdfUrl) {
      openPdfInBrowser();
    }
  }, [visible, pdfUrl]);

  const openPdfInBrowser = async () => {
    try {
      // Wraps with Google Docs viewer so both Android and iOS render the PDF cleanly in the in-app browser sheet
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl!)}`;

      await WebBrowser.openBrowserAsync(viewerUrl, {
        dismissButtonStyle: "close",
        toolbarColor: "#0f172a",
        controlsColor: "#ffffff",
      });
    } catch (error) {
      console.error("Failed to open PDF in web browser:", error);
    } finally {
      onClose();
    }
  };

  return null;
};
