import { supabase } from "../lib/supabase";

async function setupStorage() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketName = "notes";
    const exists = buckets.some(b => b.name === bucketName);

    if (!exists) {
      console.log(`Bucket "${bucketName}" not found. Creating...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      if (error) throw error;
      console.log(`Bucket "${bucketName}" created successfully.`);
    } else {
      console.log(`Bucket "${bucketName}" already exists.`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Storage Setup Error:", err);
    process.exit(1);
  }
}

setupStorage();
