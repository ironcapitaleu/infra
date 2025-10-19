# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                        S3 BUCKET IAM POLICY DOCUMENT                         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

data "aws_iam_policy_document" "origin_bucket_policy_read_only" {
  statement {
    sid    = "AllowCloudFrontServicePrincipalReadOnly"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = [
      "${aws_s3_bucket.cloudfront_origin.arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                            S3 BUCKET POLICY                                  ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

resource "aws_s3_bucket_policy" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id
  policy = data.aws_iam_policy_document.origin_bucket_policy_read_only.json
}