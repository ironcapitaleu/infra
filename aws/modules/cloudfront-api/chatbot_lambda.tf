# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                                   LAMBDA                                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# Archive the Lambda source code
resource "archive_file" "chatbot_zip" {
  type        = "zip"
  source_file = "${path.module}/src/chatbot/index.py"
  output_path = "${path.module}/src/chatbot/index.zip"
}

# Lambda function for /chatbot endpoint
resource "aws_lambda_function" "chatbot" {
  function_name    = "chatbot"
  handler          = "index.lambda_handler"
  runtime          = "python3.13"
  role             = aws_iam_role.lambda_exec.arn
  filename         = archive_file.chatbot_zip.output_path
  source_code_hash = archive_file.chatbot_zip.output_base64sha256
  timeout          = 900
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                             LAMBDA PERMISSIONS                               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# IAM role for Lambda execution
resource "aws_iam_role" "lambda_exec_chatbot" {
  name = "lambda_exec_role_chatbot"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec_chatbot.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allow Lambda to use Bedrock Flows
resource "aws_iam_policy" "bedrock_flow_chatbot" {
  name = "bedrock_flows_chatbot"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "bedrock:InvokeFlow",
        "bedrock:InvokeModel",
        "bedrock:StartFlowExecution",
        "bedrock:ApplyGuardrail"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_bedrock_flows" {
  role       = aws_iam_role.lambda_exec_chatbot.name
  policy_arn = aws_iam_policy.bedrock_flow_chatbot.arn
}

# Allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "apigw_chatbot" {
  statement_id  = "AllowAPIGatewayInvokeChatbot"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chatbot.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.simple_api.execution_arn}/*/*"
}
