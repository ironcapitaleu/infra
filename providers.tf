provider "cloudflare" {
  # api_token will be read from CLOUDFLARE_API_TOKEN environment variable
}

terraform {
  # S3 backend configuration
  backend "s3" {
    key            = "cloudflare/terraform.tfstate"
    dynamodb_table = "terraform-cloudflare-state-lock"
    encrypt        = true
  }
}
