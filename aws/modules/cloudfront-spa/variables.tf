# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                               S3 BUCKETS                                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

variable "s3_buckets" {
  description = "S3 bucket names configuration"
  type = object({
    cloudfront_origin = string
    cloudfront_logs   = string
    access_logs       = string
  })
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                         CLOUDFRONT DISTRIBUTION                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

variable "cloudfront_distribution" {
  description = "CloudFront distribution configuration"
  type = object({
    origin_id = string
    oac_name  = string
  })
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                        FRONTEND APPLICATION CONFIG                           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

variable "frontend" {
  description = "Frontend application configuration"
  type = object({
    path = string
  })
}
