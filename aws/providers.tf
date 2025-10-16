provider "aws" {
  # AWS credentials and region will be read from environment variables
}

terraform {
  # S3 backend configuration
  backend "s3" {
    key            = "aws/terraform.tfstate"
    dynamodb_table = "terraform-aws-state-lock"
    encrypt        = true
  }
}
