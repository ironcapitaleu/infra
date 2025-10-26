# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                               API GATEWAY                                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

variable "api_gateway" {
  description = "API Gateway configuration"
  type = object({
    name       = string
    stage_name = string
  })
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                         CLOUDFRONT DISTRIBUTION                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

variable "cloudfront_distribution" {
  description = "CloudFront distribution configuration"
  type = object({
    origin_id = string
  })
}