resource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = local.zone_id
  name    = each.value.name
  type    = each.value.type
  content = each.value.value
  ttl     = 1
  proxied = false

  lifecycle {
    precondition {
      condition = contains([
        "A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS", "PTR"
      ], each.value.type)
      error_message = "DNS record type must be valid for record `${each.key}`. Needs to be one of: {`A`, `AAAA`, `CNAME`, `MX`, `TXT`, `SRV`, `NS`, `PTR`}. Got `${each.value.type}` instead."
    }

    precondition {
      condition     = (ttl == 1) || (ttl >= 60 && ttl <= 86400)
      error_message = "TTL should be exactly `1` (automatic, e.g., if proxied record) or between `60` and `86400` seconds for record `${each.key}`. Got `${self.ttl}` instead."
    }
  }
}
