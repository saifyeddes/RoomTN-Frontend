import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { X as XIcon } from 'lucide-react';
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const COLOR_OPTIONS = [
  { label: 'Noir', value: '#000000' },
  { label: 'Blanc', value: '#ffffff' },
  { label: 'Rouge', value: '#ff0000' },
  { label: 'Bleu', value: '#0000ff' }
];

const cleanSizes = (sizes: string[]) => Array.from(new Set(sizes)).filter(s => s);
const cleanColors = (colors: string[]) => Array.from(new Set(colors)).filter(c => c);

interface ProductFormProps {
  product: Product | null;
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
}

type FormDataType = {
  name: string;
  description: string;
  price: number;
  images: (string | File)[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  created_at: string;
};

const initialState: FormDataType = {
  name: '',
  description: '',
  price: 0,
  images: [],
  sizes: [''],
  colors: [''],
  stock_quantity: 0,
  created_at: new Date().toISOString(), // Add created_at to satisfy the type
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<FormDataType>(initialState);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      const existingImages = product.images || [];
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        images: existingImages,
        sizes: product.sizes || [''],
        colors: product.colors || [''],
        stock_quantity: product.stock_quantity || 0,
        created_at: product.created_at || new Date().toISOString(),
      });
      setImagePreviews(existingImages);
    } else {
      setFormData(initialState);
      setImagePreviews([]);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number';

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : isNumber ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImageUrls: string[] = [];
      const newImageFiles: File[] = [];

      files.forEach(file => {
        newImageUrls.push(URL.createObjectURL(file));
        newImageFiles.push(file);
      });

      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageFiles] }));
      setImagePreviews(prev => [...prev, ...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    const imageUrlToRemove = imagePreviews[index];
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = formData.images.filter(image => {
      if (typeof image === 'string') {
        return image !== imageUrlToRemove;
      }
      // This check is for newly added File objects
      try {
        return URL.createObjectURL(image) !== imageUrlToRemove;
      } catch {
        return true; // Keep if it's not a blob URL
      }
    });

    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
    URL.revokeObjectURL(imageUrlToRemove); // Clean up memory
  };

  const handleArrayChange = (index: number, value: string, field: 'sizes' | 'colors') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'sizes' | 'colors') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (index: number, field: 'sizes' | 'colors') => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // validations simples
  if (!formData.name.trim()) return alert('Nom obligatoire');
  if (formData.price <= 0) return alert('Prix invalide');
  if (!formData.description.trim()) return alert('Description obligatoire');
  if (formData.sizes.length === 0) return alert('Choisir au moins une taille');
  if (formData.colors.length === 0) return alert('Choisir au moins une couleur');

  const data = new FormData();

  data.append('name', formData.name.trim());
  data.append('description', formData.description.trim());
  data.append('price', String(formData.price));
  data.append('category', 'unisexe');
  data.append('stock', String(formData.stock_quantity));

  // ✅ ICI LA CORRECTION IMPORTANTE
  data.append('sizes', JSON.stringify(formData.sizes));
  data.append('colors', JSON.stringify(formData.colors));

  // images
  formData.images.forEach(img => {
    if (img instanceof File) {
      data.append('images', img);
    }
  });

  onSubmit(data);
};


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border"
            placeholder="Ex: T-shirt en coton"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Prix
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="block w-full rounded-lg border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border"
            placeholder="Ex: 29.990"
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={formData.description}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border"
          placeholder="Décrivez le produit en détail..."
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="h-16 w-16 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <span className="text-gray-400 text-xl">+</span>
          </label>
        </div>
      </div>


<div>
  <label className="font-medium">Tailles *</label>
  <div className="flex flex-wrap gap-3 mt-2">
    {SIZE_OPTIONS.map(size => (
      <label key={size} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.sizes.includes(size)}
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              sizes: e.target.checked
                ? [...prev.sizes, size]
                : prev.sizes.filter(s => s !== size)
            }));
          }}
        />
        <span>{size}</span>
      </label>
    ))}
  </div>
</div>


      <div>
  <label className="font-medium">Couleurs *</label>
  <div className="flex flex-wrap gap-4 mt-2">
    {COLOR_OPTIONS.map(color => (
      <label key={color.value} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.colors.includes(color.value)}
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              colors: e.target.checked
                ? [...prev.colors, color.value]
                : prev.colors.filter(c => c !== color.value)
            }));
          }}
        />
        <span
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: color.value }}
        />
        <span>{color.label}</span>
      </label>
    ))}
  </div>
</div>

      <div className="space-y-1">
        <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
          Quantité en stock <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="stock_quantity"
          name="stock_quantity"
          value={formData.stock_quantity}
          onChange={handleChange}
          min="0"
          step="1"
          className="block w-full rounded-lg border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border"
          placeholder="Ex: 50"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {product ? 'Mettre à jour' : 'Créer le produit'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
