export interface CourierService {
  courier: string;      // jne, jnt, dll
  service: string;      // REG, YES, dll
  description?: string;
  cost: number;
  etd?: string;         // "2-3"
}
