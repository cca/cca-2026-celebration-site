import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");
const INPUT_DIR = join(ROOT, "public/images/cca-photography");
const OUTPUT_DIR = join(ROOT, "tmp/vision-thumbs");

mkdirSync(OUTPUT_DIR, { recursive: true });

const files = readdirSync(INPUT_DIR).filter((f) =>
  /\.(jpg|jpeg|png|webp)$/i.test(f)
);

console.log(`Resizing ${files.length} images → ${OUTPUT_DIR}`);

for (const file of files) {
  await sharp(join(INPUT_DIR, file))
    .resize({ width: 600, withoutEnlargement: true, fit: "inside" })
    .toFile(join(OUTPUT_DIR, file));
  console.log(`  ✓ ${file}`);
}

console.log("Done.");
