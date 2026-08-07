export interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
  ingredients?: string[];
}

export type Category =
  | 'arabic'
  | 'eastern'
  | 'asian'
  | 'desserts'
  | 'drinks'
  | 'grills'
  | 'seafood'
  | 'burgers'
  | 'pizza'
  | 'breakfast'
  | 'salads'
  | 'appetizers';

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  image?: string;
}
