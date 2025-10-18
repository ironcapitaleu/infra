import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Send, Scale, User, Bot, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { invokeBedrockFlow, invokeConfidenceAssessmentFlow } from "@/services/bedrockService";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface ConfidenceMetrics {
  individual_scores: {
    completeness: {
      score: string;
      explanation: string;
    };
    correctness: {
      score: string;
      explanation: string;
    };
    professional_style_and_tone: {
      score: string;
      explanation: string;
    };
    readability: {
      score: string;
      explanation: string;
    };
    relevance: {
      score: string;
      explanation: string;
    };
    legal_accuracy: {
      score: string;
      justification: string;
    };
    depth_of_analysis: {
      score: string;
      justification: string;
    };
  };
}

const Assistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Welcome to the LARA chatbot. How can I help with your legal research today?",
      timestamp: new Date(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [confidenceMetrics, setConfidenceMetrics] = useState<ConfidenceMetrics>({
    individual_scores: {
      completeness: { score: "0", explanation: "" },
      correctness: { score: "0", explanation: "" },
      professional_style_and_tone: { score: "0", explanation: "" },
      readability: { score: "0", explanation: "" },
      relevance: { score: "0", explanation: "" },
      legal_accuracy: { score: "0", justification: "" },
      depth_of_analysis: { score: "0", justification: "" },
    },
  });
  
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({
    correctness: false,
    completeness: false,
    professional_style_and_tone: false,
    readability: false,
    relevance: false,
    legal_accuracy: false,
    depth_of_analysis: false,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleExplanation = (metricKey: string) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [metricKey]: !prev[metricKey]
    }));
  };

  // Helper function to safely parse scores
  const parseScore = (score: string): number => {
    const parsed = parseFloat(score);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to normalize scores to 0-100 scale
  const normalizeScore = (score: number, min: number, max: number): number => {
    if (max === min) return 50; // Avoid division by zero
    return ((score - min) / (max - min)) * 100;
  };

  // Helper function to normalize confidence metrics based on their scale
  // Metric scales:
  // - Correctness: 0-2
  // - Completeness: 1-5  
  // - Professional Style & Tone: 0-10
  // - Readability: 0-2
  // - Relevance: 0-2
  // - Legal Accuracy: 1-5
  // - Depth of Analysis: 1-5
  const normalizeConfidenceMetrics = (metrics: ConfidenceMetrics): ConfidenceMetrics => {
    console.log("[NORMALIZATION] Original metrics:", metrics);
    
    const normalized = { ...metrics };
    
    // Normalize each metric based on its scale
    const correctnessOriginal = parseScore(metrics.individual_scores.correctness.score);
    normalized.individual_scores.correctness.score = normalizeScore(correctnessOriginal, 0, 2).toString();
    console.log(`[NORMALIZATION] Correctness: ${correctnessOriginal} (0-2) → ${normalized.individual_scores.correctness.score} (0-100)`);
    
    const completenessOriginal = parseScore(metrics.individual_scores.completeness.score);
    normalized.individual_scores.completeness.score = normalizeScore(completenessOriginal, 1, 5).toString();
    console.log(`[NORMALIZATION] Completeness: ${completenessOriginal} (1-5) → ${normalized.individual_scores.completeness.score} (0-100)`);
    
    const professionalStyleOriginal = parseScore(metrics.individual_scores.professional_style_and_tone.score);
    normalized.individual_scores.professional_style_and_tone.score = normalizeScore(professionalStyleOriginal, 0, 10).toString();
    console.log(`[NORMALIZATION] Professional Style: ${professionalStyleOriginal} (0-10) → ${normalized.individual_scores.professional_style_and_tone.score} (0-100)`);
    
    const readabilityOriginal = parseScore(metrics.individual_scores.readability.score);
    normalized.individual_scores.readability.score = normalizeScore(readabilityOriginal, 0, 2).toString();
    console.log(`[NORMALIZATION] Readability: ${readabilityOriginal} (0-2) → ${normalized.individual_scores.readability.score} (0-100)`);
    
    const relevanceOriginal = parseScore(metrics.individual_scores.relevance.score);
    normalized.individual_scores.relevance.score = normalizeScore(relevanceOriginal, 0, 2).toString();
    console.log(`[NORMALIZATION] Relevance: ${relevanceOriginal} (0-2) → ${normalized.individual_scores.relevance.score} (0-100)`);
    
    const legalAccuracyOriginal = parseScore(metrics.individual_scores.legal_accuracy.score);
    normalized.individual_scores.legal_accuracy.score = normalizeScore(legalAccuracyOriginal, 1, 5).toString();
    console.log(`[NORMALIZATION] Legal Accuracy: ${legalAccuracyOriginal} (1-5) → ${normalized.individual_scores.legal_accuracy.score} (0-100)`);
    
    const depthAnalysisOriginal = parseScore(metrics.individual_scores.depth_of_analysis.score);
    normalized.individual_scores.depth_of_analysis.score = normalizeScore(depthAnalysisOriginal, 1, 5).toString();
    console.log(`[NORMALIZATION] Depth of Analysis: ${depthAnalysisOriginal} (1-5) → ${normalized.individual_scores.depth_of_analysis.score} (0-100)`);
    
    console.log("[NORMALIZATION] Final normalized metrics:", normalized);
    return normalized;
  };

  // Helper function to calculate overall quality
  const calculateOverallQuality = (): number => {
    const scores = [
      parseScore(confidenceMetrics.individual_scores.correctness.score),
      parseScore(confidenceMetrics.individual_scores.completeness.score),
      parseScore(confidenceMetrics.individual_scores.professional_style_and_tone.score),
      parseScore(confidenceMetrics.individual_scores.readability.score),
      parseScore(confidenceMetrics.individual_scores.relevance.score),
      parseScore(confidenceMetrics.individual_scores.legal_accuracy.score),
      parseScore(confidenceMetrics.individual_scores.depth_of_analysis.score)
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopyMessage = (content: string) => {
    // Create a temporary container to hold the formatted text
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = content.replace(/\n/g, '<br>');
    document.body.appendChild(tempContainer);
    
    // Select the content within the container
    const range = document.createRange();
    range.selectNodeContents(tempContainer);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      
      try {
        // Execute the copy command
        const successful = document.execCommand('copy');
        
        if (successful) {
          toast({
            title: "Copied!",
            description: "Answer has been copied to clipboard",
          });
        } else {
          toast({
            title: "Copy failed",
            description: "Please try again or copy manually",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Your browser doesn't support this feature",
          variant: "destructive",
        });
      }
      
      // Clean up
      selection.removeAllRanges();
    }
    
    document.body.removeChild(tempContainer);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    console.log("[ASSISTANT] User asked:", input);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      // Call AWS Bedrock flow with credentials from the imported service
      const response = await invokeBedrockFlow(input);
      console.log("[ASSISTANT] Main flow response received:", response);
      
      // Add bot response from Bedrock
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Generate random confidence metrics (in a real app, these would come from Bedrock)
      try {
        console.log("[ASSISTANT] Starting confidence assessment...");
        const metrics = await invokeConfidenceAssessmentFlow(input, response);
        console.log("[ASSISTANT] Confidence metrics received:", metrics);
        
        // Normalize the metrics to 0-100 scale
        const normalizedMetrics = normalizeConfidenceMetrics(metrics);
        console.log("[ASSISTANT] Normalized metrics:", normalizedMetrics);
        
        setConfidenceMetrics(normalizedMetrics);
      } catch (confidenceError) {
        console.error("[ASSISTANT] Error getting confidence metrics:", confidenceError);
        // Set default metrics if confidence assessment fails
        setConfidenceMetrics({
          individual_scores: {
            completeness: { score: "0", explanation: "Assessment failed" },
            correctness: { score: "0", explanation: "Assessment failed" },
            professional_style_and_tone: { score: "0", explanation: "Assessment failed" },
            readability: { score: "0", explanation: "Assessment failed" },
            relevance: { score: "0", explanation: "Assessment failed" },
            legal_accuracy: { score: "0", justification: "Assessment failed" },
            depth_of_analysis: { score: "0", justification: "Assessment failed" },
          },
        });
      }
      
    } catch (error) {
      console.error("[ASSISTANT] Error invoking Bedrock Flow:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from AWS Bedrock. Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
      <div className="col-span-2">
        <h1 className="text-3xl font-bold mb-6">LARA Chatbot</h1>
        
        <Card className="mb-4 shadow-md">
          <CardContent className="p-0">
            <div className="h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        message.type === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          message.type === "user"
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      >
                        {message.type === "user" ? (
                          <User className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Bot className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg p-4 ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.type === "bot" ? (
                          <div className="space-y-2">
                            <div className="flex gap-3">
                              <div className="text-sm whitespace-pre-wrap flex-1 min-w-0">{message.content}</div>
                              <div className="flex-shrink-0 ml-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="p-1 h-6 w-6 opacity-70 hover:opacity-100"
                                  onClick={() => handleCopyMessage(message.content)}
                                  title="Copy to clipboard"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your legal question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !input.trim()}
                  >
                    {isSending ? "Processing..." : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="col-span-1">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4 gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Confidence Dashboard</h2>
            </div>
            
            <Separator className="mb-6" />
            
              <div className="space-y-6">
                {/* Correctness */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Correctness</span>
                    <span className="text-sm font-medium">{confidenceMetrics.individual_scores.correctness.score}%</span>
                  </div>
                  <Progress value={parseScore(confidenceMetrics.individual_scores.correctness.score)} className="h-2 mb-2" />
                  
                  <Collapsible open={expandedExplanations.correctness} onOpenChange={() => toggleExplanation('correctness')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                        {expandedExplanations.correctness ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Explanation
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {confidenceMetrics.individual_scores.correctness.explanation || "No explanation available"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Completeness */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completeness</span>
                    <span className="text-sm font-medium">{confidenceMetrics.individual_scores.completeness.score}%</span>
                  </div>
                  <Progress value={parseScore(confidenceMetrics.individual_scores.completeness.score)} className="h-2 mb-2" />
                  
                  <Collapsible open={expandedExplanations.completeness} onOpenChange={() => toggleExplanation('completeness')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                        {expandedExplanations.completeness ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Explanation
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {confidenceMetrics.individual_scores.completeness.explanation || "No explanation available"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Professional Style & Tone */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Professional Style & Tone</span>
                    <span className="text-sm font-medium">{confidenceMetrics.individual_scores.professional_style_and_tone.score}%</span>
                  </div>
                  <Progress value={parseScore(confidenceMetrics.individual_scores.professional_style_and_tone.score)} className="h-2 mb-2" />
                  
                  <Collapsible open={expandedExplanations.professional_style_and_tone} onOpenChange={() => toggleExplanation('professional_style_and_tone')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                        {expandedExplanations.professional_style_and_tone ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Explanation
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {confidenceMetrics.individual_scores.professional_style_and_tone.explanation || "No explanation available"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Readability */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Readability</span>
                    <span className="text-sm font-medium">{confidenceMetrics.individual_scores.readability.score}%</span>
                  </div>
                  <Progress value={parseScore(confidenceMetrics.individual_scores.readability.score)} className="h-2 mb-2" />
                  
                  <Collapsible open={expandedExplanations.readability} onOpenChange={() => toggleExplanation('readability')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                        {expandedExplanations.readability ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Explanation
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {confidenceMetrics.individual_scores.readability.explanation || "No explanation available"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Relevance */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Relevance</span>
                    <span className="text-sm font-medium">{confidenceMetrics.individual_scores.relevance.score}%</span>
                  </div>
                  <Progress value={parseScore(confidenceMetrics.individual_scores.relevance.score)} className="h-2 mb-2" />
                  
                  <Collapsible open={expandedExplanations.relevance} onOpenChange={() => toggleExplanation('relevance')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                        {expandedExplanations.relevance ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Explanation
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {confidenceMetrics.individual_scores.relevance.explanation || "No explanation available"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Legal Accuracy */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Legal Accuracy</span>
                    <span className="text-sm font-medium">{confidenceMetrics.individual_scores.legal_accuracy.score}%</span>
                  </div>
                  <Progress value={parseScore(confidenceMetrics.individual_scores.legal_accuracy.score)} className="h-2 mb-2" />
                  
                  <Collapsible open={expandedExplanations.legal_accuracy} onOpenChange={() => toggleExplanation('legal_accuracy')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                        {expandedExplanations.legal_accuracy ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Explanation
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {confidenceMetrics.individual_scores.legal_accuracy.justification || "No explanation available"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Depth of Analysis */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Depth of Analysis</span>
                    <span className="text-sm font-medium">{confidenceMetrics.individual_scores.depth_of_analysis.score}%</span>
                  </div>
                  <Progress value={parseScore(confidenceMetrics.individual_scores.depth_of_analysis.score)} className="h-2 mb-2" />
                  
                  <Collapsible open={expandedExplanations.depth_of_analysis} onOpenChange={() => toggleExplanation('depth_of_analysis')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                        {expandedExplanations.depth_of_analysis ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Explanation
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {confidenceMetrics.individual_scores.depth_of_analysis.justification || "No explanation available"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold">Overall Quality</span>
                    <span className="text-sm font-bold">
                      {Math.round(calculateOverallQuality())}%
                    </span>
                  </div>
                  <Progress 
                    value={calculateOverallQuality()}
                    className={`h-3 ${
                      calculateOverallQuality() > 80 
                        ? "bg-green-100" 
                        : calculateOverallQuality() > 60 
                          ? "bg-yellow-100" 
                          : "bg-red-100"
                    }`}
                  />
                </div>
                
                                  <div className="bg-muted/30 p-4 rounded-lg mt-6">
                    <h3 className="text-sm font-medium mb-2">AWS Bedrock Integration</h3>
                    <p className="text-xs text-muted-foreground">
                      This assistant is powered by AWS Bedrock using your configured credentials. 
                      The confidence metrics represent the AI's assessment of response quality based on 
                      legal precedent and relevant statutes.
                    </p>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assistant;
