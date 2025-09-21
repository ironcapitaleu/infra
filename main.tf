terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

# -----------------------------
# IAM role for EC2
# -----------------------------
resource "aws_iam_role" "example" {
  name = "example-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_instance_profile" "example" {
  name = "example-ec2-profile"
  role = aws_iam_role.example.name
}

# -----------------------------
# EC2 Instance
# -----------------------------
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 in eu-central-1
  instance_type = "t3.micro"
  monitoring    = true
  ebs_optimized = true

  iam_instance_profile = aws_iam_instance_profile.example.name

  metadata_options {
    http_tokens = "required" # IMDSv2 enforced
  }

  root_block_device {
    encrypted = true
  }

  tags = {
    Name = "secure-example-instance"
  }
}
