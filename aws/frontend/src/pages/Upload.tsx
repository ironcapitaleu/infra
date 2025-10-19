import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { FileUp, Folder, AlertTriangle, Upload as UploadIcon, FileText, FileCode, Scroll } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { richTextToPdf, cleanAndFormatHtml } from "@/utils/pdfUtils";
import { uploadToS3 } from "@/services/s3Service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

const Upload = () => {
  const [background, setBackground] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"text" | "file">("text");
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [contentHeight, setContentHeight] = useState(400); // Default height in pixels
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setUploadMode("file");
    }
  };

  // Helper function to clean HTML content for preview
  const cleanHtmlForPreview = (htmlContent: string): string => {
    // Create a temporary div to process the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Convert HTML to clean text while preserving structure
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Get the text content of child nodes
        let childContent = '';
        for (const child of element.childNodes) {
          childContent += processNode(child);
        }
        
        // Handle different HTML elements appropriately
        switch (tagName) {
          case 'p':
          case 'div':
            return childContent + '\n\n';
          case 'br':
            return '\n';
          case 'li':
            return '• ' + childContent + '\n';
          case 'ul':
          case 'ol':
            return '\n' + childContent + '\n';
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return childContent + '\n\n';
          case 'strong':
          case 'b':
            return '**' + childContent + '**';
          case 'em':
          case 'i':
            return '*' + childContent + '*';
          default:
            return childContent;
        }
      }
      
      return '';
    };
    
    let result = processNode(tempDiv);
    
    // Clean up excessive line breaks
    result = result
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ line breaks with 2
      .replace(/^\n+/, '') // Remove leading newlines
      .replace(/\n+$/, '') // Remove trailing newlines
      .trim();
    
    return result;
  };

  // Handle paste event with improved cleaning
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const htmlContent = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');
    
    if (contentEditableRef.current) {
      const selection = window.getSelection();
      
      // Use plain text but with less aggressive cleaning
      let cleanedText = plainText
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive line breaks with just 2
        .replace(/^\n+/, '') // Remove leading newlines
        .replace(/\n+$/, '') // Remove trailing newlines
        .trim();
      
      // Convert line breaks to HTML for contentEditable
      const htmlContent = cleanedText.replace(/\n/g, '<br>');
      
      if (selection && selection.rangeCount > 0) {
        // Get the current selection range
        const range = selection.getRangeAt(0);
        // Delete any selected content
        range.deleteContents();
        
        // Create a temporary div to hold the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Insert all child nodes from the temp div
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        range.insertNode(fragment);
        
        // Move the cursor to the end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection, append to the current content
        const currentContent = contentEditableRef.current.innerHTML || '';
        const newContent = currentContent + (currentContent ? '<br><br>' : '') + htmlContent;
        contentEditableRef.current.innerHTML = newContent;
        
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const generatePreview = async () => {
    if (uploadMode === "text") {
      // Format the content with background if provided
      let fullContent = "";
      
      if (background) {
        // Convert line breaks to <br> tags for the background field too
        const formattedBackground = background.replace(/\n/g, '<br>');
        
        fullContent += `<div style="padding: 12px; margin-bottom: 16px; background-color: #f3f4f6; border-left: 4px solid #6b7280; font-style: italic;">
          <strong>Description of Business Area Request:</strong><br/>
          ${formattedBackground}
        </div>
        <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;" />`;
      }
      
      // Get content from the contentEditable div and use it directly
      if (contentEditableRef.current) {
        const rawContent = contentEditableRef.current.innerHTML;
        
        // Wrap content with clean CSS - use HTML directly without re-processing
        fullContent += `<div style="
          line-height: 1.6; 
          font-family: system-ui, -apple-system, sans-serif;
          font-size: ${fontSize}px;
        ">
          <style>
            p { margin: 0 0 1em 0; }
            ul { margin: 0.5em 0; padding-left: 1.5em; }
            li { margin: 0.25em 0; list-style-type: disc; }
            strong { font-weight: bold; }
            em { font-style: italic; }
            br { display: block; margin: 0.5em 0; content: ""; }
          </style>
          ${rawContent}
        </div>`;
      }

      setPreviewContent(fullContent);
      setIsPreviewOpen(true);
    }
  };

  const handleUpload = async () => {
    // Get current editor content
    const editorContent = contentEditableRef.current?.innerHTML || "";
    
    // Validation checks
    if (uploadMode === "text" && !editorContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter document content before uploading.",
        variant: "destructive",
      });
      return;
    }

    if (uploadMode === "file" && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!background.trim()) {
      toast({
        title: "Error",
        description: "Description of Business Area Request is required.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFolder) {
      toast({
        title: "Error",
        description: "Please select a folder division before uploading.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload: File;
      
      // If we're in text mode, convert the rich text to PDF
      if (uploadMode === "text") {
        // Format the content with background if provided
        let fullContent = "";
        
        if (background) {
          // Convert line breaks to <br> tags for the background field too
          const formattedBackground = background.replace(/\n/g, '<br>');
          
          fullContent += `<div style="padding: 12px; margin-bottom: 16px; background-color: #f3f4f6; border-left: 4px solid #6b7280; font-style: italic;">
            <strong>Description of Business Area Request:</strong><br/>
            ${formattedBackground}
          </div>
          <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;" />`;
        }
        
        // Add editor content
        fullContent += cleanAndFormatHtml(editorContent);
        
        fileToUpload = await richTextToPdf(
          fullContent,
          {
            filename: `document-${Date.now()}.pdf`,
            onProgress: (progress) => {
              setUploadProgress(Math.floor(progress / 2)); // First half of progress is PDF creation
            }
          }
        );
      } else if (selectedFile) {
        // If we're in file mode, use the selected file with background if provided
        if (background) {
          // Create a PDF with background and then append the selected PDF
          const backgroundContent = `<div style="padding: 12px; margin-bottom: 16px; background-color: #f3f4f6; border-left: 4px solid #6b7280; font-style: italic;">
            <strong>Description of Business Area Request:</strong><br/>
            ${background}
          </div>`;
          
          // For simplicity, we'll use the selected file directly
          // In a real app, you might want to merge PDFs using a library
          fileToUpload = selectedFile;
        } else {
          fileToUpload = selectedFile;
        }
      } else {
        throw new Error("No content to upload");
      }

      // Upload the file to S3
      const s3Key = await uploadToS3(
        fileToUpload,
        selectedFolder,
        (progress) => {
          // Second half of progress is S3 upload
          const adjustedProgress = uploadMode === "text" 
            ? 50 + Math.floor(progress / 2) 
            : progress;
          setUploadProgress(adjustedProgress);
        }
      );
      
      toast({
        title: "Success",
        description: `Document uploaded successfully to ${selectedFolder}!`,
      });
      
      // Navigate to the assistant page after successful upload
      setTimeout(() => {
        navigate('/assistant');
      }, 1000);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    if (contentEditableRef.current) {
      contentEditableRef.current.style.fontSize = `${value[0]}px`;
    }
  };

  // Handle content height change
  const handleHeightChange = (value: number[]) => {
    setContentHeight(value[0]);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Upload Reference Document</h1>
      <p className="text-muted-foreground mb-8">
        Upload or paste your document text below. This document will be saved as a PDF and used as reference material 
        to improve the quality and accuracy of the AI assistant's responses.
      </p>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Document Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload Mode Selection */}
          <div className="flex gap-4 mb-6">
            <Button 
              type="button" 
              variant={uploadMode === "text" ? "default" : "outline"} 
              onClick={() => setUploadMode("text")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Enter Text
            </Button>
            <Button 
              type="button" 
              variant={uploadMode === "file" ? "default" : "outline"} 
              onClick={() => {
                setUploadMode("file");
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
              className="flex items-center gap-2"
            >
              <FileCode className="h-4 w-4" />
              Upload PDF
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
          </div>

          {/* Description of Business Area Request Field - Now mandatory */}
          <div className="mb-6">
            <Label htmlFor="background" className="text-sm font-medium mb-2 block flex items-center">
              Description of Business Area Request
              <span className="text-destructive ml-1">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Add a brief description about the business area this document relates to. This will appear at the beginning of the PDF.
            </p>
            <Textarea 
              id="background"
              placeholder="Enter description about the business area for this document..."
              className="min-h-[100px] resize-y"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />
          </div>

          {uploadMode === "text" ? (
            <>
              {/* Rich Text Editor using contentEditable */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    Document Content
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                          <span className="text-xs">Text Size: {fontSize}px</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Adjust Text Size</h4>
                          <Slider
                            value={[fontSize]}
                            min={12}
                            max={24}
                            step={1}
                            onValueChange={handleFontSizeChange}
                            className="my-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Small</span>
                            <span>Large</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                          <Scroll className="h-4 w-4" />
                          <span className="text-xs">Content Height</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Adjust Content Height</h4>
                          <Slider
                            value={[contentHeight]}
                            min={200}
                            max={800}
                            step={50}
                            onValueChange={handleHeightChange}
                            className="my-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Short</span>
                            <span>Tall</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <ScrollArea className="w-full" style={{ height: `${contentHeight}px` }}>
                    <div 
                      ref={contentEditableRef}
                      contentEditable
                      className="px-3 py-3 min-h-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background"
                      onPaste={handlePaste}
                      style={{ 
                        fontSize: `${fontSize}px`
                      }}
                    />
                  </ScrollArea>
                </div>
                
                <div className="flex justify-end mt-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (contentEditableRef.current) {
                        contentEditableRef.current.innerHTML = '';
                      }
                    }}
                  >
                    Clear Content
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generatePreview}
                  disabled={!contentEditableRef.current || !contentEditableRef.current.innerHTML.trim()}
                >
                  Preview as PDF
                </Button>
              </div>
            </>
          ) : (
            <div className="border rounded-md p-6 flex flex-col items-center justify-center bg-muted/50">
              {selectedFile ? (
                <div className="text-center">
                  <FileCode className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <UploadIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="mb-2">Drop your PDF here or click to browse</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select PDF File
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {isUploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-md font-medium flex items-center gap-2 mb-3">
                <Folder className="h-5 w-5" />
                Select Destination Folder
                <span className="text-destructive ml-1">*</span>
              </h3>
              
              <RadioGroup 
                value={selectedFolder} 
                onValueChange={setSelectedFolder}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SLA" id="SLA" />
                  <Label htmlFor="SLA" className="cursor-pointer">Supervisory Law Division (SLA)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ILA" id="ILA" />
                  <Label htmlFor="ILA" className="cursor-pointer">Institutional Law Division (ILA)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FLA" id="FLA" />
                  <Label htmlFor="FLA" className="cursor-pointer">Financial Law Division (FLA)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Alert className="border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900 py-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <AlertDescription className="ml-2">
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox 
                    id="acknowledgment" 
                    checked={acknowledged}
                    onCheckedChange={(checked) => setAcknowledged(checked === true)}
                    className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <label 
                    htmlFor="acknowledgment"
                    className="text-sm font-medium text-orange-800 dark:text-orange-300 cursor-pointer"
                  >
                    I understand that the uploaded content will <span className="font-bold">influence the AI's performance and accuracy</span>.
                  </label>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleUpload} 
            disabled={
              !acknowledged || 
              (uploadMode === "text" && (!contentEditableRef.current || !contentEditableRef.current.innerHTML.trim())) || 
              (uploadMode === "file" && !selectedFile) || 
              !selectedFolder || 
              !background.trim() || 
              isUploading
            }
            className="px-8 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-white rounded">
            <div
              className="p-8"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Upload;
