import { BASE_URL } from "@/app/constants/api";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers({
    url: BASE_URL
  });
