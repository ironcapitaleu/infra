# =============================================================================
# DNS RECORDS
# =============================================================================

resource "cloudflare_dns_record" "records" {
  for_each = local.dns_records

  zone_id = local.zone_id
  name    = each.value.name
  content = each.value.content
  type    = each.value.type
  ttl     = each.value.ttl
  proxied = each.value.proxied
  comment = each.value.comment

  lifecycle {
    precondition {
      condition = contains([
        "A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS", "PTR"
      ], each.value.type)
      error_message = "DNS record type must be valid for record '${each.key}'"
    }

    precondition {
      condition     = each.value.ttl >= 60 && each.value.ttl <= 86400
      error_message = "TTL must be between 60 and 86400 seconds for record '${each.key}'"
    }
  }
}
