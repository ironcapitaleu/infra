import html2pdf from "html2pdf.js";

export interface RichTextToPdfOptions {
  filename?: string;
  pageSize?: string;
  margin?: number[];
  onProgress?: (progress: number) => void;
}

export const richTextToPdf = async (
  htmlContent: string, 
  options: RichTextToPdfOptions = {}
): Promise<File> => {
  const {
    filename = `document-${Date.now()}.pdf`,
    pageSize = "a4",
    margin = [15, 15, 20, 15], // Increased bottom margin to prevent cutoff
    onProgress
  } = options;
  
  // Create a temporary container for the HTML content
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.padding = "10px"; // Add padding to prevent content cutoff
  document.body.appendChild(container);
  
  // Configure html2pdf options
  const html2pdfOptions = {
    margin: margin,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      letterRendering: true, // Improve text rendering
    },
    jsPDF: { 
      unit: "mm", 
      format: pageSize, 
      orientation: "portrait",
      hotfixes: ["px_scaling"], // Fix for content scaling issues
      compress: true // Better PDF compression
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.page-break-avoid'
    } // Better page break handling
  };
  
  try {
    // Generate the PDF
    const pdfBlob = await new Promise<Blob>((resolve, reject) => {
      html2pdf()
        .from(container)
        .set(html2pdfOptions)
        .outputPdf("blob")
        .then((blob: Blob) => {
          resolve(blob);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
    
    // Remove the temporary container
    document.body.removeChild(container);
    
    // Convert blob to File
    const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });
    
    return pdfFile;
  } catch (error) {
    // Make sure to clean up
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    console.error("Error converting rich text to PDF:", error);
    throw error;
  }
};

export const cleanAndFormatHtml = (html: string): string => {
  // Create a temporary div to work with the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Preserve font size if it exists in the style attribute
  const contentDiv = tempDiv.querySelector('div');
  if (contentDiv && contentDiv.style.fontSize) {
    tempDiv.style.fontSize = contentDiv.style.fontSize;
  }
  
  // Remove unnecessary attributes that might affect PDF generation
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    // Keep class, style, and essential attributes, remove others that might interfere
    const attributesToKeep = ['class', 'style', 'href', 'src', 'alt', 'title'];
    Array.from(el.attributes).forEach(attr => {
      if (!attributesToKeep.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return tempDiv.innerHTML;
};
