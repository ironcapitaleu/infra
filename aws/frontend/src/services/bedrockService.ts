
import {
  BedrockAgentRuntimeClient,
  InvokeFlowCommand,
  FlowOutputEvent,
  FlowCompletionEvent
} from "@aws-sdk/client-bedrock-agent-runtime";

export async function invokeBedrockFlow(userInput: string): Promise<string> {
    console.log("[ASSISTANT] Calling main Bedrock flow...");
    
    const flowId = import.meta.env.VITE_BEDROCK_FLOW_ID;
    const flowAliasId = import.meta.env.VITE_BEDROCK_FLOW_ALIAS_ID;
    const region = import.meta.env.VITE_AWS_REGION;
    const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

    // Validate required environment variables at runtime
    if (!flowId) {
      throw new Error("VITE_BEDROCK_FLOW_ID environment variable is not set.");
    }
    if (!flowAliasId) {
      throw new Error("VITE_BEDROCK_FLOW_ALIAS_ID environment variable is not set.");
    }
    if (!region) {
      throw new Error("VITE_AWS_REGION environment variable is not set.");
    }
    if (!accessKey) {
      throw new Error("VITE_AWS_ACCESS_KEY environment variable is not set.");
    }
    if (!secretKey) {
      throw new Error("VITE_AWS_SECRET_KEY environment variable is not set.");
    }

    console.log("[MAIN FLOW] Configuration:", { flowId, flowAliasId, region });
    console.log("[MAIN FLOW] Input:", userInput);

    const client = new BedrockAgentRuntimeClient({
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey }
    });

    const command = new InvokeFlowCommand({
      flowIdentifier: flowId,
      flowAliasIdentifier: flowAliasId,
      enableTrace: false,
      inputs: [{
        content: { 
          document: userInput 
        },
        nodeName: "FlowInputNode",
        nodeOutputName: "document"
      }]
    });

    console.log("[MAIN FLOW] Starting to receive response...");
    const response = await client.send(command);
    let result = "";

    for await (const chunkEvent of response.responseStream!) {
      // Handle flowOutputEvent
      if ("flowOutputEvent" in chunkEvent && chunkEvent.flowOutputEvent) {
        const output = chunkEvent.flowOutputEvent;
        const content = output.content;
        if (content?.document) {
          const chunk = content.document;
          result += chunk;
          console.log("[MAIN FLOW] Received chunk:", chunk);
        }
      }

      // Handle flowCompletionEvent (optional, usually meta info)
      if ("flowCompletionEvent" in chunkEvent && chunkEvent.flowCompletionEvent) {
        const reason = chunkEvent.flowCompletionEvent.completionReason;
        console.log("[MAIN FLOW] Flow completed with reason:", reason);
      }
    }

    console.log("[MAIN FLOW] Final Response:", result);
    return result || "No content found in the response.";
}

export async function invokeConfidenceAssessmentFlow(question: string, response: string): Promise<any> {
  console.log("[ASSISTANT] Calling confidence assessment flow...");
  
  const flowId = import.meta.env.VITE_BEDROCK_CONFIDENCE_FLOW_ID;
  const flowAliasId = import.meta.env.VITE_BEDROCK_CONFIDENCE_FLOW_ALIAS_ID;
  const region = import.meta.env.VITE_AWS_REGION;
  const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

  // Validate required environment variables at runtime
  if (!flowId) {
    throw new Error("VITE_BEDROCK_CONFIDENCE_FLOW_ID environment variable is not set.");
  }
  if (!flowAliasId) {
    throw new Error("VITE_BEDROCK_CONFIDENCE_FLOW_ALIAS_ID environment variable is not set.");
  }
  if (!region) {
    throw new Error("VITE_AWS_REGION environment variable is not set.");
  }
  if (!accessKey) {
    throw new Error("VITE_AWS_ACCESS_KEY environment variable is not set.");
  }
  if (!secretKey) {
    throw new Error("VITE_AWS_SECRET_KEY environment variable is not set.");
  }

  console.log("[CONFIDENCE FLOW] Configuration:", { flowId, flowAliasId, region });

  const inputText = `Question is: 
${question} is the question the user asked
LLM Generated Response to be assessed is: 
${response} is the output of the first flow`;

  console.log("[CONFIDENCE FLOW] Input:", inputText);

  const client = new BedrockAgentRuntimeClient({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey }
  });

  const command = new InvokeFlowCommand({
    flowIdentifier: flowId,
    flowAliasIdentifier: flowAliasId,
    enableTrace: false,
    inputs: [{
      content: { 
        document: inputText 
      },
      nodeName: "FlowInputNode",
      nodeOutputName: "document"
    }]
  });

  console.log("[CONFIDENCE FLOW] Starting to receive response...");
  const response_stream = await client.send(command);
  let result = "";

  for await (const chunkEvent of response_stream.responseStream!) {
    // Handle flowOutputEvent
    if ("flowOutputEvent" in chunkEvent && chunkEvent.flowOutputEvent) {
      const output = chunkEvent.flowOutputEvent;
      const content = output.content;
      if (content?.document) {
        const chunk = content.document;
        result += chunk;
        console.log("[CONFIDENCE FLOW] Received chunk:", chunk);
      }
    }

    // Handle flowCompletionEvent (optional, usually meta info)
    if ("flowCompletionEvent" in chunkEvent && chunkEvent.flowCompletionEvent) {
      const reason = chunkEvent.flowCompletionEvent.completionReason;
      console.log("[CONFIDENCE FLOW] Flow completed with reason:", reason);
    }
  }

  console.log("[CONFIDENCE FLOW] Raw response:", result);

  try {
    // Parse the JSON response
    const parsedResult = JSON.parse(result);
    console.log("[CONFIDENCE FLOW] Parsed result:", parsedResult);
    return parsedResult;
  } catch (error) {
    console.error("[CONFIDENCE FLOW] Error parsing response:", error);
    console.log("[CONFIDENCE FLOW] Raw response:", result);
    throw new Error("Failed to parse confidence assessment response");
  }
}
