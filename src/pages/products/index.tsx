import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";

import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const ProductsPage: NextPageWithLayout = () => {
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const apiUtils = api.useUtils();

  const { data: products } = api.product.getProdutcs.useQuery();
  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: () => {
      apiUtils.product.getProdutcs.invalidate();
      setCreateProductDialogOpen(false);
      setProductImageUrl(null);
      createProductForm.reset();
    },
  });

  const { mutate: deleteProductById } =
    api.product.deleteProductById.useMutation({
      onSuccess: () => {
        apiUtils.product.getProdutcs.invalidate();
        setProductToDelete(null);
      },
    });

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });
  const editProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const handleSubmitCreateProduct = (data: ProductFormSchema) => {
    if (!productImageUrl) {
      return alert("Please upload an image for the product.");
    }
    createProduct({ ...data, imageUrl: productImageUrl });
  };

  const handleSubmitEditProduct = (data: ProductFormSchema) => {
    console.log(data);
  };

  const handleClickDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
  };
  const handleSubmitDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProductById({ productId: productToDelete });
  };

  const handleImageChange = (url: string | null) => {
    setProductImageUrl(url);
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createProductDialogOpen}
            onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Product</AlertDialogTitle>
              </AlertDialogHeader>

              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handleSubmitCreateProduct}
                  onImageChange={handleImageChange}
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  disabled={productImageUrl === null}
                  onClick={createProductForm.handleSubmit(
                    handleSubmitCreateProduct,
                  )}
                >
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? "https://placehold.co/600x400"}
            category={product.category.name}
            onEdit={() => setEditProductDialogOpen(true)}
            onDelete={() => handleClickDeleteProduct(product.id)}
          />
        ))}
      </div>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleSubmitDeleteProduct}>
              Submit
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Product</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editProductForm}>
            <ProductForm onSubmit={handleSubmitEditProduct} />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={editProductForm.handleSubmit(handleSubmitEditProduct)}
            >
              Edit Category
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
