import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsArray, 
  ValidateNested, 
  IsOptional, 
  IsPhoneNumber, 
  IsNumber, 
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

enum PaymentMethod {
  VNPAY = 'VNPAY',
  CASH = 'CASH',
}

class ReceiverInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string | undefined;

  @IsPhoneNumber('VN')
  phone: string | undefined;

  @IsString()
  @IsNotEmpty()
  address: string | undefined;
}

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productVariantId: string | undefined;

  @IsNumber()
  @Min(1)
  quantity: number | undefined;
}

export class CreateOrderDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod | undefined;

  @ValidateNested()
  @Type(() => ReceiverInfoDto)
  receiverInfo: ReceiverInfoDto | undefined;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[] | undefined;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  voucherCodes?: string[];
}
