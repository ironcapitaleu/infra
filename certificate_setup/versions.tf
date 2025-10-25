terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.62.0,<6"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.9.0"
    }
  }

  required_version = ">= 1.8.1"
}
