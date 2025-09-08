export interface subscriptionFormData {
        name: string;
        description: string;
        price: number;
        currency: string;
        interval: string;
        id?: string; 
      }

export interface metadataDto {
        doctorId?: string;
        type?:string;
        role?:string;
}
      