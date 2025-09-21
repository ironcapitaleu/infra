terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# BAD: Unused variable (TFLint will complain)
variable "unused_var" {
  default = "not used"
}

# BAD: Wrong instance type (invalid for some regions, TFLint AWS rules catch this)
resource "aws_instance" "bad_example" {
  ami           = "ami-123456"  # placeholder AMI, not valid
  instance_type = "t2.nano"     # Checkov won’t care, but TFLint will
}

# BAD: Public S3 bucket (Checkov will complain about open access & missing encryption)
resource "aws_s3_bucket" "bad_bucket" {
  bucket = "my-insecure-bucket-example"
  acl    = "public-read"   # 🚨 Insecure ACL
}

resource "aws_s3_bucket_policy" "bad_policy" {
  bucket = aws_s3_bucket.bad_bucket.id
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-insecure-bucket-example",
        "arn:aws:s3:::my-insecure-bucket-example/*"
      ]
    }
  ]
}
POLICY
}
