resource "aws_acm_certificate" "this" {
  provider                  = aws.us_east_1
  domain_name               = local.domains.primary
  subject_alternative_names = [local.domains.wildcard]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}