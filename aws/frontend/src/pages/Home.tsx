
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FileUp, MessageSquare, Scale } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <section className="py-12 md:py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-center">
            <Scale className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Legal Analysis and Research Assistant (LARA)
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Enhance your legal research with intelligent document analysis and AI-powered assistance
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate('/assistant')}
            >
              Chat with LARA
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => navigate('/upload')}
            >
              Upload Document
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="transition-shadow hover:shadow-lg">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className="mb-5 bg-primary/10 p-3 rounded-full inline-block">
                  <FileUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Upload Your Documents</h3>
                <p className="text-muted-foreground">
                  Upload or paste your legal documents to provide context for the AI assistant
                </p>
              </CardContent>
            </Card>
            
            <Card className="transition-shadow hover:shadow-lg">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className="mb-5 bg-primary/10 p-3 rounded-full inline-block">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Ask Legal Questions</h3>
                <p className="text-muted-foreground">
                  Interact with our AI assistant to get answers to your legal questions
                </p>
              </CardContent>
            </Card>
            
            <Card className="transition-shadow hover:shadow-lg md:col-span-2 lg:col-span-1">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className="mb-5 bg-primary/10 p-3 rounded-full inline-block">
                  <Scale className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Receive Legal Insights</h3>
                <p className="text-muted-foreground">
                  Get detailed answers backed by AI analysis with confidence metrics
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
