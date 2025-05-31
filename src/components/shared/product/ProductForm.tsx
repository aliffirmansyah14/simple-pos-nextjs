import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import type { ProductFormSchema } from "@/forms/product";
import { api } from "@/utils/api";
import { useFormContext } from "react-hook-form";
import { Label } from "@radix-ui/react-label";
import { uploadFileToSignedUrl } from "@/server/supabase-client";
import { Bucket } from "@/server/api/bucket";

interface ProductFormProps {
  onSubmit: (data: ProductFormSchema) => void;
  onImageChange?: (url: string | null) => void;
}

export const ProductForm = ({ onSubmit, onImageChange }: ProductFormProps) => {
  const form = useFormContext<ProductFormSchema>();
  const { data: categories, isLoading: categoriesIsLoading } =
    api.category.getCategories.useQuery();

  const { mutateAsync: createImageSignedUrl, isPending } =
    api.product.createProductImageUploadSignedUrl.useMutation();

  const imageChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onImageChange) return;
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      if (!file) return;

      const { path, token } = await createImageSignedUrl();

      const imageUrl = await uploadFileToSignedUrl({
        file,
        path,
        token,
        bucket: Bucket.ProductImages,
      });

      onImageChange(imageUrl);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoriesIsLoading && (
                  <SelectItem value="loading">Loading...</SelectItem>
                )}
                {!categoriesIsLoading &&
                  categories &&
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        )}
      />
      <div className="space-y-1">
        <Label>Product Image</Label>
        <Input type="file" accept="image/*" onChange={imageChangeHandler} />
      </div>
    </form>
  );
};
