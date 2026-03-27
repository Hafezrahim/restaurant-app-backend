// Backend database types - mirrors Supabase schema
// Auto-generated types come from src/integrations/supabase/types.ts
// This file contains app-level type helpers

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';
export type CouponType = 'percentage' | 'fixed';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type UserRole = 'admin' | 'moderator' | 'user';
