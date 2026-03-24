/// <reference types="astro/client" />

type R2Bucket = import("@cloudflare/workers-types").R2Bucket;

type Runtime = import("@astrojs/cloudflare").Runtime<{
  GALLERY_BUCKET: R2Bucket;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
