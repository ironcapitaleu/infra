provider "aws" {}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

provider "cloudflare" {}

terraform {
  # S3 backend configuration
  backend "s3" {
    key          = "certificate-setup/terraform.tfstate"
    use_lockfile = true
    encrypt      = true
  }
}
