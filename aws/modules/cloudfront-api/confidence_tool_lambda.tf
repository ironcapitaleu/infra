# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                                   LAMBDA                                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# Archive the Lambda source code
resource "archive_file" "confidence_tool_zip" {
  type        = "zip"
  source_file = "${path.module}/src/confidence-tool/index.py"
  output_path = "${path.module}/src/confidence-tool/index.zip"
}

# Lambda function for /confidence-tool endpoint
resource "aws_lambda_function" "confidence_tool" {
  function_name    = "confidence_tool"
  handler          = "index.lambda_handler"
  runtime          = "python3.13"
  role             = aws_iam_role.lambda_exec_confidence_tool.arn
  filename         = archive_file.confidence_tool_zip.output_path
  source_code_hash = archive_file.confidence_tool_zip.output_base64sha256
  timeout          = 900
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                             LAMBDA PERMISSIONS                               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# IAM role for Lambda execution
resource "aws_iam_role" "lambda_exec_confidence_tool" {
  name = "lambda_exec_role_confidence_tool"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_confidence_tool" {
  role       = aws_iam_role.lambda_exec_confidence_tool.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allow Lambda to use Bedrock Flows
resource "aws_iam_policy" "bedrock_flow_confidence_tool" {
  name = "bedrock_flows_confidence_tool"
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

resource "aws_iam_role_policy_attachment" "lambda_bedrock_flows_confidence_tool" {
  role       = aws_iam_role.lambda_exec_confidence_tool.name
  policy_arn = aws_iam_policy.bedrock_flow_confidence_tool.arn
}

# Allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "apigw_confidence_tool" {
  statement_id  = "AllowAPIGatewayInvokeConfidenceTool"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.confidence_tool.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.simple_api.execution_arn}/*/*"
}
