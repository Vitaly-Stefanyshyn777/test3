export interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  city: string;
  branch: string;
  house: string;
  building: string;
  apartment: string;
  paymentMethod: string;
  comment: string;
  mailSend: boolean;
  acceptTerms: boolean;
}

export interface CheckoutErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  billing?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientPhone?: string;
  deliveryType?: string;
  city?: string;
  branch?: string;
  house?: string;
  building?: string;
  apartment?: string;
  acceptTerms?: string;
}